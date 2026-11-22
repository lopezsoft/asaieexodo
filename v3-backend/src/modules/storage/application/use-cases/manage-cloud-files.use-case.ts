import { Inject, Injectable } from '@nestjs/common';
import {
  CloudStoragePort,
  PresignedUrlResult,
  UploadCloudObjectInput,
} from '../../../../shared/application/ports/cloud-storage.port';
import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';
import { ResourceNotFoundException } from '../../../../shared/domain/exceptions/resource-not-found.exception';
import { SmartLoggerService } from '../../../../shared/infrastructure/logging/smart-logger.service';
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
 * Implementa compensacion automatica ante fallo de persistencia y ciclo PENDING -> ACTIVE.
 */
@Injectable()
export class ManageCloudFilesUseCase {
  constructor(
    @Inject(CLOUD_FILE_REPOSITORY_PORT)
    private readonly cloudFileRepository: ICloudFileRepositoryPort,
    private readonly cloudStorage: CloudStoragePort,
    private readonly logger: SmartLoggerService,
  ) {}

  public async uploadSchoolFile(
    command: UploadSchoolFileCommand,
  ): Promise<CloudFileRecord> {
    this.cloudStorage.validateFileMetadata({
      originalFileName: command.originalFileName,
      mimeType: command.mimeType,
      sizeBytes: command.contentBuffer.byteLength,
    });

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

    try {
      return await this.cloudFileRepository.saveCloudFile({
        schoolId: command.schoolId,
        uploadedByUserId: command.uploadedByUserId ?? null,
        ownerEntityType: command.ownerEntityType ?? command.category,
        ownerEntityId: command.ownerEntityId ?? null,
        fileName: command.originalFileName,
        description: command.description ?? null,
        storagePath: s3Object.storageKey,
        publicUrl: s3Object.publicUrl,
        extension: s3Object.extension,
        mimeType: command.mimeType.trim().toLowerCase(),
        sizeBytes: s3Object.sizeBytes,
        isWatermark: command.isWatermark ?? false,
        status: 1,
        metadata: {
          ...(command.metadata ?? {}),
          s3Bucket: s3Object.bucket,
          s3Region: s3Object.region,
          s3ETag: s3Object.eTag,
          provider: s3Object.provider,
          uploadStatus: 'CONFIRMED',
        },
      });
    } catch (dbError) {
      // Compensacion: eliminar objeto de S3 para evitar archivos huerfanos
      try {
        await this.cloudStorage.deleteObject(s3Object.storageKey);
      } catch (cleanupError) {
        this.logger.error(
          'Fallo compensacion de borrado en S3 tras error de persistencia en cloud_files',
          {
            schoolId: String(command.schoolId),
            storageKey: s3Object.storageKey,
            errorMessage:
              cleanupError instanceof Error
                ? cleanupError.message
                : 'Unknown cleanup error',
          },
        );
      }
      throw dbError;
    }
  }

  public async createPresignedUploadTicket(params: {
    schoolId: bigint;
    uploadedByUserId?: bigint | null;
    category: UploadCloudObjectInput['category'];
    originalFileName: string;
    mimeType: string;
    sizeBytes: number;
    description?: string | null;
  }): Promise<{
    fileRecord: CloudFileRecord;
    presignedUpload: PresignedUrlResult;
  }> {
    this.cloudStorage.validateFileMetadata({
      originalFileName: params.originalFileName,
      mimeType: params.mimeType,
      sizeBytes: params.sizeBytes,
    });

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
        sizeBytes: params.sizeBytes,
        expiresInSeconds: 900,
      });

    // Registrar con status = 0 (PENDING) hasta que el cliente confirme la subida con HeadObject
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
      mimeType: params.mimeType.trim().toLowerCase(),
      sizeBytes: params.sizeBytes,
      status: 0,
      metadata: {
        s3Bucket: presignedUpload.bucket,
        uploadMode: 'PRESIGNED_PUT',
        uploadStatus: 'PENDING',
      },
    });

    return {
      fileRecord,
      presignedUpload,
    };
  }

  public async confirmPresignedUpload(
    schoolId: bigint,
    fileId: bigint,
  ): Promise<CloudFileRecord> {
    const file = await this.cloudFileRepository.findById(schoolId, fileId, true);
    if (!file) {
      throw new ResourceNotFoundException('CloudFile', fileId);
    }

    const head = await this.cloudStorage.headObject(file.storagePath);
    if (!head.exists) {
      throw new DomainException(
        'CLOUD_FILE_NOT_UPLOADED_YET',
        'El objeto todavía no existe en AWS S3. Completa la carga con la URL prefirmada antes de confirmar.',
      );
    }

    const confirmed = await this.cloudFileRepository.confirmCloudFileUpload({
      schoolId,
      fileId,
      sizeBytes: head.contentLength || file.sizeBytes,
      mimeType: head.contentType ?? file.mimeType,
      eTag: head.eTag,
    });

    if (!confirmed) {
      throw new ResourceNotFoundException('CloudFile', fileId);
    }
    return confirmed;
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
        file.fileName,
      );

    return {
      file,
      presignedDownload,
    };
  }

  public async getFileMetadata(
    schoolId: bigint,
    fileId: bigint,
    includePending = false,
  ): Promise<CloudFileRecord> {
    const file = await this.cloudFileRepository.findById(
      schoolId,
      fileId,
      includePending,
    );
    if (!file) {
      throw new ResourceNotFoundException('CloudFile', fileId);
    }
    return file;
  }

  public async listSchoolFiles(
    schoolId: bigint,
    ownerEntityType?: string,
    limit?: number,
    offset?: number,
  ): Promise<CloudFileRecord[]> {
    return this.cloudFileRepository.listSchoolFiles(
      schoolId,
      ownerEntityType,
      limit,
      offset,
    );
  }

  public async deleteSchoolFile(
    schoolId: bigint,
    fileId: bigint,
  ): Promise<{ deleted: boolean; storagePath: string }> {
    const file = await this.cloudFileRepository.findById(schoolId, fileId, true);
    if (!file) {
      throw new ResourceNotFoundException('CloudFile', fileId);
    }

    // Eliminar primero en PostgreSQL (evita punteros rotos si falla DB) y luego borrar en S3
    await this.cloudFileRepository.deleteCloudFile(schoolId, fileId);
    await this.cloudStorage.deleteObject(file.storagePath).catch((err) => {
      this.logger.warn(
        'Registro cloud_files eliminado pero fallo borrado fisico en S3 (requiere limpieza diferida)',
        {
          schoolId: String(schoolId),
          storagePath: file.storagePath,
          errorMessage: err instanceof Error ? err.message : 'Unknown error',
        },
      );
    });

    return {
      deleted: true,
      storagePath: file.storagePath,
    };
  }
}
