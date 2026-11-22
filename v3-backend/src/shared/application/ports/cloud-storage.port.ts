export type CloudStorageCategory =
  | 'STUDENT_DOCUMENTS'
  | 'TEACHER_DOCUMENTS'
  | 'FAMILY_DOCUMENTS'
  | 'ADMINISTRATIVE_DOCUMENTS'
  | 'USER_AVATARS'
  | 'INSTITUTIONAL_LOGOS'
  | 'VIRTUAL_ACTIVITIES'
  | 'OBSERVER_ATTACHMENTS'
  | 'CRM_ATTACHMENTS'
  | 'JASPER_REPORTS'
  | 'GENERAL';

export interface UploadCloudObjectInput {
  readonly storageFolder: string;
  readonly category: CloudStorageCategory;
  readonly ownerEntityType?: string | null;
  readonly ownerEntityId?: bigint | null;
  readonly originalFileName: string;
  readonly mimeType: string;
  readonly contentBuffer: Buffer;
  readonly academicYear?: number;
  readonly metadata?: Record<string, string>;
}

export interface UploadCloudObjectResult {
  readonly bucket: string;
  readonly region: string;
  readonly storageKey: string;
  readonly publicUrl: string;
  readonly extension: string;
  readonly sizeBytes: number;
  readonly eTag: string;
  readonly provider: 'AWS_S3' | 'AWS_S3_DRY_RUN';
}

export interface PresignedUrlResult {
  readonly url: string;
  readonly bucket: string;
  readonly storageKey: string;
  readonly expiresInSeconds: number;
  readonly method: 'GET' | 'PUT';
}

export interface HeadCloudObjectResult {
  readonly exists: boolean;
  readonly contentLength: number;
  readonly contentType: string | null;
  readonly eTag: string | null;
}

export abstract class CloudStoragePort {
  abstract validateFileMetadata(params: {
    originalFileName: string;
    mimeType: string;
    sizeBytes: number;
  }): void;

  abstract buildSchoolObjectKey(params: {
    storageFolder: string;
    category: UploadCloudObjectInput['category'];
    ownerEntityType?: string | null;
    ownerEntityId?: bigint | null;
    originalFileName: string;
    academicYear?: number;
    fileUuid?: string;
  }): { storageKey: string; extension: string; sanitizedFileName: string };

  abstract uploadObject(
    input: UploadCloudObjectInput,
  ): Promise<UploadCloudObjectResult>;

  abstract generatePresignedDownloadUrl(
    storageKey: string,
    expiresInSeconds?: number,
    downloadFileName?: string,
  ): Promise<PresignedUrlResult>;

  abstract generatePresignedUploadUrl(params: {
    storageKey: string;
    mimeType: string;
    sizeBytes?: number;
    expiresInSeconds?: number;
  }): Promise<PresignedUrlResult>;

  abstract headObject(storageKey: string): Promise<HeadCloudObjectResult>;

  abstract deleteObject(storageKey: string): Promise<{ deleted: boolean }>;
}
