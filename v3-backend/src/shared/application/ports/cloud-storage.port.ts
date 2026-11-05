export interface UploadCloudObjectInput {
  readonly storageFolder: string;
  readonly category:
    | 'STUDENT_DOCUMENTS'
    | 'INSTITUTIONAL_LOGOS'
    | 'VIRTUAL_ACTIVITIES'
    | 'OBSERVER_ATTACHMENTS'
    | 'CRM_ATTACHMENTS'
    | 'JASPER_REPORTS'
    | 'GENERAL';
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

export abstract class CloudStoragePort {
  abstract buildSchoolObjectKey(params: {
    storageFolder: string;
    category: UploadCloudObjectInput['category'];
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
  ): Promise<PresignedUrlResult>;

  abstract generatePresignedUploadUrl(params: {
    storageKey: string;
    mimeType: string;
    expiresInSeconds?: number;
  }): Promise<PresignedUrlResult>;

  abstract deleteObject(storageKey: string): Promise<{ deleted: boolean }>;
}
