import { Inject, Injectable } from '@nestjs/common';
import {
  CloudStoragePort,
  PresignedUrlResult,
  UploadCloudObjectInput,
} from '../../../../shared/application/ports/cloud-storage.port';
import { ResourceNotFoundException } from '../../../../shared/domain/exceptions/resource-not-found.exception';
import {
  CLOUD_FILE_REPOSITORY_PORT,
  CloudFileRecord,
  ICloudFileRepositoryPort,
} from '../../domain/ports/cloud-file.repository.port';

export interface UploadSchoolFileCommand {
  readonly schoolId: bigint;
  readonly uploadedByUserId?: bigint | null;
  readonly category: UploadCloudObjectInput['category'];
  readonly ownerEntityType?: string | null;
  readonly ownerEntityId?: bigint | null;
  readonly originalFileName: string;
  readonly description?: string | null;
  readonly mimeType: string;
  readonly contentBuffer: Buffer;
  readonly academicYear?: number;
  readonly isWatermark?: boolean;
  readonly metadata?: Record<string, unknown>;
}

/**
 * Caso de Uso de Aplicacion para la gestion de archivos institucionales en AWS S3
 * y su registro transaccional en la tabla `cloud_files` bajo Row-Level Security (RLS).
 */
@Injectable()
export class ManageCloudFilesUseCase {
  constructor(
    @Inject(CLOUD_FILE_REPOSITORY_PORT)
    private readonly cloudFileRepository: ICloudFileRepositoryPort,
    private readonly cloudStorage: CloudStoragePort,
  ) {}

  public async uploadSchoolFile(
    command: UploadSchoolFileCommand,
  ): Promise<CloudFileRecord> {
    const storageFolder =
      await this.cloudFileRepository.resolveSchoolStorageFolder(
        command.schoolId,
      );

    const s3Object = await this.cloudStorage.uploadObject({
      storageFolder,
      category: command.category,
      originalFileName: command.originalFileName,
      mimeType: command.mimeType,
      contentBuffer: command.contentBuffer,
      academicYear: command.academicYear,
    });

    return this.cloudFileRepository.saveCloudFile({
      schoolId: command.schoolId,
      uploadedByUserId: command.uploadedByUserId ?? null,
      ownerEntityType: command.ownerEntityType ?? command.category,
      ownerEntityId: command.ownerEntityId ?? null,
      fileName: command.originalFileName,
      description: command.description ?? null,
      storagePath: s3Object.storageKey,
      publicUrl: s3Object.publicUrl,
      extension: s3Object.extension,
      mimeType: command.mimeType,
      sizeBytes: s3Object.sizeBytes,
      isWatermark: command.isWatermark ?? false,
      metadata: {
        ...(command.metadata ?? {}),
        s3Bucket: s3Object.bucket,
        s3Region: s3Object.region,
        s3ETag: s3Object.eTag,
        provider: s3Object.provider,
      },
    });
  }

  public async createPresignedUploadTicket(params: {
    schoolId: bigint;
    uploadedByUserId?: bigint | null;
    category: UploadCloudObjectInput['category'];
    originalFileName: string;
    mimeType: string;
    sizeBytes?: number;
    description?: string | null;
  }): Promise<{
    fileRecord: CloudFileRecord;
    presignedUpload: PresignedUrlResult;
  }> {
    const storageFolder =
      await this.cloudFileRepository.resolveSchoolStorageFolder(
        params.schoolId,
      );

    const { storageKey, extension } = this.cloudStorage.buildSchoolObjectKey({
      storageFolder,
      category: params.category,
      originalFileName: params.originalFileName,
    });

    const presignedUpload =
      await this.cloudStorage.generatePresignedUploadUrl({
        storageKey,
        mimeType: params.mimeType,
        expiresInSeconds: 900,
      });

    const fileRecord = await this.cloudFileRepository.saveCloudFile({
      schoolId: params.schoolId,
      uploadedByUserId: params.uploadedByUserId ?? null,
      ownerEntityType: params.category,
      ownerEntityId: null,
      fileName: params.originalFileName,
      description: params.description ?? null,
      storagePath: storageKey,
      publicUrl: presignedUpload.url.split('?')[0],
      extension,
      mimeType: params.mimeType,
      sizeBytes: params.sizeBytes ?? 0,
      metadata: {
        s3Bucket: presignedUpload.bucket,
        uploadMode: 'PRESIGNED_PUT',
      },
    });

    return {
      fileRecord,
      presignedUpload,
    };
  }

  public async getPresignedDownloadUrl(
    schoolId: bigint,
    fileId: bigint,
    expiresInSeconds = 900,
  ): Promise<{
    file: CloudFileRecord;
    presignedDownload: PresignedUrlResult;
  }> {
    const file = await this.cloudFileRepository.findById(schoolId, fileId);
    if (!file) {
      throw new ResourceNotFoundException('CloudFile', fileId);
    }

    const presignedDownload =
      await this.cloudStorage.generatePresignedDownloadUrl(
        file.storagePath,
        expiresInSeconds,
      );

    return {
      file,
      presignedDownload,
    };
  }

  public async listSchoolFiles(
    schoolId: bigint,
    ownerEntityType?: string,
  ): Promise<CloudFileRecord[]> {
    return this.cloudFileRepository.listSchoolFiles(schoolId, ownerEntityType);
  }

  public async deleteSchoolFile(
    schoolId: bigint,
    fileId: bigint,
  ): Promise<{ deleted: boolean; storagePath: string }> {
    const file = await this.cloudFileRepository.findById(schoolId, fileId);
    if (!file) {
      throw new ResourceNotFoundException('CloudFile', fileId);
    }

    await this.cloudStorage.deleteObject(file.storagePath);
    await this.cloudFileRepository.deleteCloudFile(schoolId, fileId);

    return {
      deleted: true,
      storagePath: file.storagePath,
    };
  }
}
