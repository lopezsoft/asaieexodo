export const CLOUD_FILE_REPOSITORY_PORT = Symbol('CLOUD_FILE_REPOSITORY_PORT');

export interface CreateCloudFileRecordInput {
  readonly schoolId: bigint;
  readonly uploadedByUserId?: bigint | null;
  readonly ownerEntityType?: string | null;
  readonly ownerEntityId?: bigint | null;
  readonly fileName: string;
  readonly description?: string | null;
  readonly storagePath: string;
  readonly publicUrl: string;
  readonly extension: string;
  readonly mimeType: string;
  readonly sizeBytes: number;
  readonly isWatermark?: boolean;
  readonly metadata?: Record<string, unknown>;
}

export interface CloudFileRecord {
  readonly id: string;
  readonly schoolId: string;
  readonly fileUuid: string;
  readonly uploadedByUserId: string | null;
  readonly ownerEntityType: string | null;
  readonly ownerEntityId: string | null;
  readonly fileName: string;
  readonly description: string | null;
  readonly storagePath: string;
  readonly publicUrl: string | null;
  readonly extension: string | null;
  readonly mimeType: string;
  readonly sizeBytes: number;
  readonly isWatermark: boolean;
  readonly metadata: Record<string, unknown>;
  readonly createdAt: string;
}

export interface ICloudFileRepositoryPort {
  resolveSchoolStorageFolder(schoolId: bigint): Promise<string>;

  saveCloudFile(input: CreateCloudFileRecordInput): Promise<CloudFileRecord>;

  findById(schoolId: bigint, fileId: bigint): Promise<CloudFileRecord | null>;

  listSchoolFiles(
    schoolId: bigint,
    ownerEntityType?: string,
  ): Promise<CloudFileRecord[]>;

  deleteCloudFile(schoolId: bigint, fileId: bigint): Promise<void>;
}
