import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as path from 'path';
import {
  CloudStoragePort,
  PresignedUrlResult,
  UploadCloudObjectInput,
  UploadCloudObjectResult,
} from '../../application/ports/cloud-storage.port';
import { SmartLoggerService } from '../logging/smart-logger.service';

/**
 * Adaptador de infraestructura AWS S3 (@aws-sdk/client-s3 + @aws-sdk/s3-request-presigner)
 * para el almacenamiento multi-colegio de ASAIE EXODO V3.
 *
 * Organiza fisicamente los objetos dentro del bucket bajo la carpeta institucional
 * de cada colegio (`schools.storage_folder`), ej:
 * `pto_beato/student-documents/2026/<uuid>-registro-civil.pdf`
 *
 * Cumple Seguridad por Diseno: jamas expone AWS_ACCESS_KEY_ID ni AWS_SECRET_ACCESS_KEY en logs.
 */
@Injectable()
export class AwsS3StorageAdapter implements CloudStoragePort {
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly region: string;
  private readonly baseUrl: string;
  private readonly isTestEnvironment: boolean;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: SmartLoggerService,
  ) {
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');
    this.isTestEnvironment = nodeEnv === 'test';

    this.region = this.configService.get<string>(
      'AWS_DEFAULT_REGION',
      'us-east-1',
    );
    this.bucket = this.configService.get<string>('AWS_BUCKET', 'asaieexodo');
    const customEndpoint = this.configService.get<string>('AWS_ENDPOINT', '');
    const customUrl = this.configService.get<string>('AWS_URL', '');
    const usePathStyle =
      this.configService.get<string>('AWS_USE_PATH_STYLE_ENDPOINT', 'false') ===
      'true';

    const accessKeyId = this.configService.get<string>(
      'AWS_ACCESS_KEY_ID',
      'test-access-key',
    );
    const secretAccessKey = this.configService.get<string>(
      'AWS_SECRET_ACCESS_KEY',
      'test-secret-key',
    );

    this.baseUrl =
      customUrl && customUrl.trim().length > 0
        ? customUrl.replace(/\/+$/, '')
        : `https://${this.bucket}.s3.${this.region}.amazonaws.com`;

    this.s3Client = new S3Client({
      region: this.region,
      endpoint:
        customEndpoint && customEndpoint.trim().length > 0
          ? customEndpoint
          : undefined,
      forcePathStyle: usePathStyle,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  public buildSchoolObjectKey(params: {
    storageFolder: string;
    category: UploadCloudObjectInput['category'];
    originalFileName: string;
    academicYear?: number;
    fileUuid?: string;
  }): { storageKey: string; extension: string; sanitizedFileName: string } {
    const cleanFolder = params.storageFolder
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '_');

    const categorySlug = params.category.toLowerCase().replace(/_/g, '-');
    const year = params.academicYear ?? new Date().getFullYear();
    const uuid = params.fileUuid ?? crypto.randomUUID();

    const parsed = path.posix.parse(params.originalFileName);
    const extension = parsed.ext.replace(/^\./, '').toLowerCase() || 'bin';
    const baseSafe =
      parsed.name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') || 'document';

    const sanitizedFileName = `${baseSafe}.${extension}`;
    const storageKey = `${cleanFolder}/${categorySlug}/${year}/${uuid}-${sanitizedFileName}`;

    return {
      storageKey,
      extension,
      sanitizedFileName,
    };
  }

  public async uploadObject(
    input: UploadCloudObjectInput,
  ): Promise<UploadCloudObjectResult> {
    const { storageKey, extension } = this.buildSchoolObjectKey({
      storageFolder: input.storageFolder,
      category: input.category,
      originalFileName: input.originalFileName,
      academicYear: input.academicYear,
    });

    const sizeBytes = input.contentBuffer.byteLength;
    const publicUrl = `${this.baseUrl}/${storageKey}`;

    if (this.isTestEnvironment) {
      const sha256 = crypto
        .createHash('sha256')
        .update(input.contentBuffer)
        .digest('hex')
        .slice(0, 32);

      this.logger.log(
        `Objeto S3 simulado en entorno de prueba (${input.category})`,
        {
          bucket: this.bucket,
          storageKey,
          sizeBytes,
        },
      );

      return {
        bucket: this.bucket,
        region: this.region,
        storageKey,
        publicUrl,
        extension,
        sizeBytes,
        eTag: `"${sha256}"`,
        provider: 'AWS_S3_DRY_RUN',
      };
    }

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: storageKey,
      Body: input.contentBuffer,
      ContentType: input.mimeType,
      Metadata: input.metadata,
    });

    const response = await this.s3Client.send(command);

    this.logger.log(`Archivo cargado exitosamente en AWS S3`, {
      bucket: this.bucket,
      storageKey,
      sizeBytes,
    });

    return {
      bucket: this.bucket,
      region: this.region,
      storageKey,
      publicUrl,
      extension,
      sizeBytes,
      eTag: response.ETag ?? `"${Date.now()}"`,
      provider: 'AWS_S3',
    };
  }

  public async generatePresignedDownloadUrl(
    storageKey: string,
    expiresInSeconds = 900,
  ): Promise<PresignedUrlResult> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: storageKey,
    });

    const url = await getSignedUrl(this.s3Client, command, {
      expiresIn: expiresInSeconds,
    });

    return {
      url,
      bucket: this.bucket,
      storageKey,
      expiresInSeconds,
      method: 'GET',
    };
  }

  public async generatePresignedUploadUrl(params: {
    storageKey: string;
    mimeType: string;
    expiresInSeconds?: number;
  }): Promise<PresignedUrlResult> {
    const expiresInSeconds = params.expiresInSeconds ?? 900;
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: params.storageKey,
      ContentType: params.mimeType,
    });

    const url = await getSignedUrl(this.s3Client, command, {
      expiresIn: expiresInSeconds,
    });

    return {
      url,
      bucket: this.bucket,
      storageKey: params.storageKey,
      expiresInSeconds,
      method: 'PUT',
    };
  }

  public async deleteObject(
    storageKey: string,
  ): Promise<{ deleted: boolean }> {
    if (!this.isTestEnvironment) {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: storageKey,
      });
      await this.s3Client.send(command);
    }

    this.logger.log(`Objeto eliminado de AWS S3`, {
      bucket: this.bucket,
      storageKey,
    });

    return { deleted: true };
  }
}
