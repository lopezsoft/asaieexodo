export const CLOUD_FILE_REPOSITORY_PORT = Symbol('CLOUD_FILE_REPOSITORY_PORT');

/**
 * Tipos canónicos de entidad propietaria de un documento digital en `cloud_files`.
 * Garantiza que los expedientes de docentes, estudiantes, familiares y administrativos
 * queden siempre enlazados a su registro exacto (`owner_entity_type`, `owner_entity_id`).
 */
export const ALLOWED_CLOUD_FILE_OWNER_ENTITY_TYPES = [
  'TEACHER',
  'STUDENT',
  'FAMILY',
  'ADMINISTRATIVE_STAFF',
  'SCHOOL',
  'USER',
  'VIRTUAL_ACTIVITY',
  'OBSERVER',
  'CRM',
] as const;

export type CloudFileOwnerEntityType =
  (typeof ALLOWED_CLOUD_FILE_OWNER_ENTITY_TYPES)[number];

/**
 * Entidades que corresponden a un registro individual específico y SIEMPRE requieren `ownerEntityId`.
 */
export const RECORD_SCOPED_OWNER_ENTITY_TYPES: ReadonlySet<CloudFileOwnerEntityType> =
  new Set<CloudFileOwnerEntityType>([
    'TEACHER',
    'STUDENT',
    'FAMILY',
    'ADMINISTRATIVE_STAFF',
    'USER',
  ]);

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
  readonly status?: number;
  readonly metadata?: Record<string, unknown>;
}

export interface ListSchoolFilesFilter {
  readonly category?: string;
  readonly ownerEntityType?: string;
  readonly ownerEntityId?: bigint;
  readonly uploadedByUserId?: bigint;
  readonly limit?: number;
  readonly offset?: number;
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
  readonly status: number;
  readonly metadata: Record<string, unknown>;
  readonly createdAt: string;
}

export interface ICloudFileRepositoryPort {
  resolveSchoolStorageFolder(schoolId: bigint): Promise<string>;

  ownerEntityExists(
    schoolId: bigint,
    ownerEntityType: CloudFileOwnerEntityType,
    ownerEntityId: bigint,
  ): Promise<boolean>;

  isEntityOwnedByUser(
    schoolId: bigint,
    ownerEntityType: CloudFileOwnerEntityType,
    ownerEntityId: bigint,
    userId: bigint,
    accessMode: 'READ' | 'WRITE',
  ): Promise<boolean>;

  saveCloudFile(input: CreateCloudFileRecordInput): Promise<CloudFileRecord>;

  findById(
    schoolId: bigint,
    fileId: bigint,
    includePending?: boolean,
  ): Promise<CloudFileRecord | null>;

  confirmCloudFileUpload(params: {
    schoolId: bigint;
    fileId: bigint;
    sizeBytes: number;
    mimeType?: string | null;
    eTag?: string | null;
  }): Promise<CloudFileRecord | null>;

  listSchoolFiles(
    schoolId: bigint,
    filter?: ListSchoolFilesFilter,
  ): Promise<CloudFileRecord[]>;

  deleteCloudFile(schoolId: bigint, fileId: bigint): Promise<void>;
}
