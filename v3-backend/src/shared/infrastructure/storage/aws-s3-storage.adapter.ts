import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
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
  HeadCloudObjectResult,
  PresignedUrlResult,
  UploadCloudObjectInput,
  UploadCloudObjectResult,
} from '../../application/ports/cloud-storage.port';
import { DomainException } from '../../domain/exceptions/domain.exception';
import { SmartLoggerService } from '../logging/smart-logger.service';

export const MAX_CLOUD_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MiB

/**
 * Lista blanca estricta de tipos MIME institucionales permitidos y sus extensiones validas.
 * Bloquea HTML, SVG, scripts ejecutables y binarios peligrosos (prevencion Stored XSS/Malware).
 */
export const ALLOWED_MIME_TO_EXTENSIONS: ReadonlyMap<
  string,
  readonly string[]
> = new Map<string, readonly string[]>([
  ['application/pdf', ['pdf']],
  ['image/jpeg', ['jpg', 'jpeg']],
  ['image/png', ['png']],
  ['image/webp', ['webp']],
  ['text/plain', ['txt']],
  ['text/csv', ['csv']],
  [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ['docx'],
  ],
  [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ['xlsx'],
  ],
  [
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ['pptx'],
  ],
  ['application/msword', ['doc']],
  ['application/vnd.ms-excel', ['xls']],
  ['application/zip', ['zip']],
]);

/**
 * Adaptador de infraestructura AWS S3 (@aws-sdk/client-s3 + @aws-sdk/s3-request-presigner)
 * para el almacenamiento multi-colegio de ASAIE EXODO V3.
 *
 * Respeta AWS_MAIN_PATH (ej. `test/` o `prod/`) + carpeta institucional (`schools.storage_folder`),
 * aplica cifrado AES256 en reposo, valida MIME/extension/tamano y jamas expone secretos en logs.
 */
@Injectable()
export class AwsS3StorageAdapter implements CloudStoragePort {
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly region: string;
  private readonly mainPath: string;
  private readonly baseUrl: string;
  private readonly isTestEnvironment: boolean;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: SmartLoggerService,
  ) {
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');
    this.isTestEnvironment = nodeEnv === 'test';
    const isProduction = nodeEnv === 'production';

    this.region = this.configService.get<string>(
      'AWS_DEFAULT_REGION',
      'us-west-2',
    );
    this.bucket = this.configService.get<string>(
      'AWS_BUCKET',
      'asaie-app-storage',
    );
    const rawMainPath = this.configService.get<string>('AWS_MAIN_PATH', '');
    this.mainPath = rawMainPath
      .trim()
      .replace(/\\/g, '/')
      .replace(/^\/+|\/+$/g, '')
      .replace(/[^a-zA-Z0-9/_-]/g, '');

    const customEndpoint = this.configService.get<string>('AWS_ENDPOINT', '');
    const customUrl = this.configService.get<string>('AWS_URL', '');
    const usePathStyle =
      this.configService.get<string>('AWS_USE_PATH_STYLE_ENDPOINT', 'false') ===
      'true';

    const accessKeyId = this.configService
      .get<string>('AWS_ACCESS_KEY_ID', '')
      .trim();
    const secretAccessKey = this.configService
      .get<string>('AWS_SECRET_ACCESS_KEY', '')
      .trim();

    if (
      isProduction &&
      ((accessKeyId &&
        (accessKeyId.startsWith('YOUR_') || accessKeyId.startsWith('test-'))) ||
        (secretAccessKey &&
          (secretAccessKey.startsWith('YOUR_') ||
            secretAccessKey.startsWith('test-'))))
    ) {
      throw new Error(
        'Credenciales AWS S3 placeholder detectadas en entorno de produccion.',
      );
    }

    this.baseUrl =
      customUrl && customUrl.trim().length > 0
        ? customUrl.replace(/\/+$/, '')
        : `https://${this.bucket}.s3.${this.region}.amazonaws.com`;

    // En produccion, si no hay llaves estaticas, omite credentials para permitir IAM Role (ECS/EKS/EC2)
    const explicitCredentials =
      accessKeyId && secretAccessKey
        ? { accessKeyId, secretAccessKey }
        : this.isTestEnvironment
          ? {
              accessKeyId: 'test-access-key',
              secretAccessKey: 'test-secret-key',
            }
          : undefined;

    this.s3Client = new S3Client({
      region: this.region,
      endpoint:
        customEndpoint && customEndpoint.trim().length > 0
          ? customEndpoint
          : undefined,
      forcePathStyle: usePathStyle,
      ...(explicitCredentials ? { credentials: explicitCredentials } : {}),
    });
  }

  public validateFileMetadata(params: {
    originalFileName: string;
    mimeType: string;
    sizeBytes: number;
  }): void {
    const normalizedMime = params.mimeType.trim().toLowerCase();
    const allowedExtensions = ALLOWED_MIME_TO_EXTENSIONS.get(normalizedMime);

    if (!allowedExtensions) {
      throw new DomainException(
        'UNSUPPORTED_FILE_MIME_TYPE',
        `El tipo MIME '${params.mimeType}' no está permitido por la política de seguridad institucional.`,
      );
    }

    if (
      !Number.isFinite(params.sizeBytes) ||
      params.sizeBytes <= 0 ||
      params.sizeBytes > MAX_CLOUD_FILE_SIZE_BYTES
    ) {
      throw new DomainException(
        'INVALID_FILE_SIZE',
        `El tamaño del archivo debe estar entre 1 byte y ${MAX_CLOUD_FILE_SIZE_BYTES / (1024 * 1024)} MB.`,
      );
    }

    const extension = this.extractSafeExtension(params.originalFileName);
    if (!allowedExtensions.includes(extension)) {
      throw new DomainException(
        'FILE_EXTENSION_MIME_MISMATCH',
        `La extensión '.${extension}' no coincide con el tipo MIME '${normalizedMime}'.`,
      );
    }
  }

  public buildSchoolObjectKey(params: {
    storageFolder: string;
    category: UploadCloudObjectInput['category'];
    originalFileName: string;
    academicYear?: number;
    fileUuid?: string;
  }): { storageKey: string; extension: string; sanitizedFileName: string } {
    const cleanFolder =
      params.storageFolder
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, '_')
        .replace(/^_+|_+$/g, '') || 'school_default';

    const categorySlug = params.category.toLowerCase().replace(/_/g, '-');
    const year = params.academicYear ?? new Date().getFullYear();
    const uuid = params.fileUuid ?? crypto.randomUUID();

    const baseNameOnly = path.posix.basename(
      params.originalFileName.replace(/\\/g, '/'),
    );
    const parsed = path.posix.parse(baseNameOnly);
    const extension = this.extractSafeExtension(baseNameOnly);
    const baseSafe =
      parsed.name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 120) || 'document';

    const sanitizedFileName = `${baseSafe}.${extension}`;
    const relativeKey = `${cleanFolder}/${categorySlug}/${year}/${uuid}-${sanitizedFileName}`;
    const storageKey = this.mainPath
      ? `${this.mainPath}/${relativeKey}`
      : relativeKey;

    return {
      storageKey,
      extension,
      sanitizedFileName,
    };
  }

  public async uploadObject(
    input: UploadCloudObjectInput,
  ): Promise<UploadCloudObjectResult> {
    const sizeBytes = input.contentBuffer.byteLength;
    this.validateFileMetadata({
      originalFileName: input.originalFileName,
      mimeType: input.mimeType,
      sizeBytes,
    });

    const { storageKey, extension } = this.buildSchoolObjectKey({
      storageFolder: input.storageFolder,
      category: input.category,
      originalFileName: input.originalFileName,
      academicYear: input.academicYear,
    });

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
      ContentType: input.mimeType.trim().toLowerCase(),
      ServerSideEncryption: 'AES256',
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
    downloadFileName?: string,
  ): Promise<PresignedUrlResult> {
    this.assertSafeStorageKey(storageKey);
    const clampedExpiry = this.clampExpiry(expiresInSeconds);

    const safeFileName = downloadFileName
      ? path.posix
          .basename(downloadFileName.replace(/\\/g, '/'))
          .replace(/["\r\n]/g, '')
      : undefined;

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: storageKey,
      ResponseContentDisposition: safeFileName
        ? `attachment; filename="${safeFileName}"`
        : 'attachment',
    });

    const url = await getSignedUrl(this.s3Client, command, {
      expiresIn: clampedExpiry,
    });

    return {
      url,
      bucket: this.bucket,
      storageKey,
      expiresInSeconds: clampedExpiry,
      method: 'GET',
    };
  }

  public async generatePresignedUploadUrl(params: {
    storageKey: string;
    mimeType: string;
    sizeBytes?: number;
    expiresInSeconds?: number;
  }): Promise<PresignedUrlResult> {
    this.assertSafeStorageKey(params.storageKey);
    const clampedExpiry = this.clampExpiry(params.expiresInSeconds ?? 900);

    if (
      params.sizeBytes !== undefined &&
      (params.sizeBytes <= 0 || params.sizeBytes > MAX_CLOUD_FILE_SIZE_BYTES)
    ) {
      throw new DomainException(
        'INVALID_FILE_SIZE',
        `El tamaño declarado debe estar entre 1 byte y ${MAX_CLOUD_FILE_SIZE_BYTES / (1024 * 1024)} MB.`,
      );
    }

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: params.storageKey,
      ContentType: params.mimeType.trim().toLowerCase(),
      ServerSideEncryption: 'AES256',
      ...(params.sizeBytes ? { ContentLength: params.sizeBytes } : {}),
    });

    const url = await getSignedUrl(this.s3Client, command, {
      expiresIn: clampedExpiry,
    });

    return {
      url,
      bucket: this.bucket,
      storageKey: params.storageKey,
      expiresInSeconds: clampedExpiry,
      method: 'PUT',
    };
  }

  public async headObject(storageKey: string): Promise<HeadCloudObjectResult> {
    this.assertSafeStorageKey(storageKey);

    if (this.isTestEnvironment) {
      return {
        exists: true,
        contentLength: 1024,
        contentType: 'application/pdf',
        eTag: '"dry-run-etag"',
      };
    }

    try {
      const response = await this.s3Client.send(
        new HeadObjectCommand({
          Bucket: this.bucket,
          Key: storageKey,
        }),
      );

      return {
        exists: true,
        contentLength: Number(response.ContentLength ?? 0),
        contentType: response.ContentType ?? null,
        eTag: response.ETag ?? null,
      };
    } catch {
      return {
        exists: false,
        contentLength: 0,
        contentType: null,
        eTag: null,
      };
    }
  }

  public async deleteObject(
    storageKey: string,
  ): Promise<{ deleted: boolean }> {
    this.assertSafeStorageKey(storageKey);

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

  private extractSafeExtension(originalFileName: string): string {
    const baseName = path.posix.basename(originalFileName.replace(/\\/g, '/'));
    const rawExt = path.posix
      .extname(baseName)
      .replace(/^\./, '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 10);
    return rawExt || 'bin';
  }

  private assertSafeStorageKey(storageKey: string): void {
    const normalized = storageKey.trim();
    if (
      !normalized ||
      normalized.startsWith('/') ||
      normalized.includes('..') ||
      normalized.includes('\\') ||
      normalized.includes('\0')
    ) {
      throw new DomainException(
        'INVALID_STORAGE_KEY',
        'La ruta de almacenamiento del objeto S3 es inválida.',
      );
    }
  }

  private clampExpiry(seconds: number): number {
    if (!Number.isFinite(seconds)) {
      return 900;
    }
    return Math.min(Math.max(60, Math.floor(seconds)), 3600);
  }
}
