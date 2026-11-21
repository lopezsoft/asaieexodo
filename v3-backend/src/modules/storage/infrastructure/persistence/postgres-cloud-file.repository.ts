import { Injectable } from '@nestjs/common';
import { ResourceNotFoundException } from '../../../../shared/domain/exceptions/resource-not-found.exception';
import { PostgresRlsService } from '../../../../shared/infrastructure/database/postgres-rls.service';
import {
  CloudFileRecord,
  CreateCloudFileRecordInput,
  ICloudFileRepositoryPort,
} from '../../domain/ports/cloud-file.repository.port';

interface CloudFileRow {
  id: string;
  school_id: string;
  file_uuid: string;
  uploaded_by_user_id: string | null;
  owner_entity_type: string | null;
  owner_entity_id: string | null;
  file_name: string;
  description: string | null;
  storage_path: string;
  public_url: string | null;
  extension: string | null;
  mime_type: string;
  size_bytes: string;
  is_watermark: boolean;
  status: number;
  metadata: Record<string, unknown>;
  created_at: Date;
}

/**
 * Adaptador de infraestructura PostgreSQL 17 para la tabla `cloud_files`.
 * Garantiza aislamiento Multi-Tenant (Row-Level Security) por `school_id` y ciclo de vida PENDING (0) -> ACTIVE (1).
 */
@Injectable()
export class PostgresCloudFileRepository implements ICloudFileRepositoryPort {
  constructor(private readonly db: PostgresRlsService) {}

  public async resolveSchoolStorageFolder(schoolId: bigint): Promise<string> {
    const res = await this.db.queryGlobal<{
      storage_folder: string | null;
      legacy_db_name: string | null;
    }>(
      `SELECT storage_folder, legacy_db_name
       FROM schools
       WHERE id = $1
       LIMIT 1`,
      [String(schoolId)],
    );

    if (res.rowCount === 0) {
      throw new ResourceNotFoundException('School', schoolId);
    }

    const row = res.rows[0];
    return (
      row.storage_folder ||
      row.legacy_db_name ||
      `school_${String(schoolId)}`
    );
  }

  public async saveCloudFile(
    input: CreateCloudFileRecordInput,
  ): Promise<CloudFileRecord> {
    return this.db.withTenantTransaction(input.schoolId, async (client) => {
      const res = await client.query<CloudFileRow>(
        `INSERT INTO cloud_files (
           school_id, uploaded_by_user_id, owner_entity_type, owner_entity_id,
           file_name, description, storage_path, public_url,
           extension, mime_type, size_bytes, is_watermark, status, metadata
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14::jsonb)
         RETURNING id, school_id, file_uuid, uploaded_by_user_id, owner_entity_type,
                   owner_entity_id, file_name, description, storage_path, public_url,
                   extension, mime_type, size_bytes, is_watermark, status, metadata, created_at`,
        [
          String(input.schoolId),
          input.uploadedByUserId ? String(input.uploadedByUserId) : null,
          input.ownerEntityType ?? null,
          input.ownerEntityId ? String(input.ownerEntityId) : null,
          input.fileName,
          input.description ?? null,
          input.storagePath,
          input.publicUrl,
          input.extension,
          input.mimeType,
          input.sizeBytes,
          input.isWatermark ?? false,
          input.status ?? 1,
          JSON.stringify(input.metadata ?? {}),
        ],
      );

      return this.mapRow(res.rows[0]);
    });
  }

  public async findById(
    schoolId: bigint,
    fileId: bigint,
    includePending = false,
  ): Promise<CloudFileRecord | null> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const statusClause = includePending ? '' : 'AND status = 1';
      const res = await client.query<CloudFileRow>(
        `SELECT id, school_id, file_uuid, uploaded_by_user_id, owner_entity_type,
                owner_entity_id, file_name, description, storage_path, public_url,
                extension, mime_type, size_bytes, is_watermark, status, metadata, created_at
         FROM cloud_files
         WHERE school_id = $1 AND id = $2 ${statusClause}
         LIMIT 1`,
        [String(schoolId), String(fileId)],
      );

      if (res.rowCount === 0) {
        return null;
      }

      return this.mapRow(res.rows[0]);
    });
  }

  public async confirmCloudFileUpload(params: {
    schoolId: bigint;
    fileId: bigint;
    sizeBytes: number;
    mimeType?: string | null;
    eTag?: string | null;
  }): Promise<CloudFileRecord | null> {
    return this.db.withTenantTransaction(params.schoolId, async (client) => {
      const res = await client.query<CloudFileRow>(
        `UPDATE cloud_files
         SET status = 1,
             size_bytes = $3,
             mime_type = COALESCE($4, mime_type),
             metadata = metadata || jsonb_build_object('uploadStatus', 'CONFIRMED', 's3ETag', $5::text),
             updated_at = NOW()
         WHERE school_id = $1 AND id = $2
         RETURNING id, school_id, file_uuid, uploaded_by_user_id, owner_entity_type,
                   owner_entity_id, file_name, description, storage_path, public_url,
                   extension, mime_type, size_bytes, is_watermark, status, metadata, created_at`,
        [
          String(params.schoolId),
          String(params.fileId),
          params.sizeBytes,
          params.mimeType ?? null,
          params.eTag ?? null,
        ],
      );

      if (res.rowCount === 0) {
        return null;
      }
      return this.mapRow(res.rows[0]);
    });
  }

  public async listSchoolFiles(
    schoolId: bigint,
    ownerEntityType?: string,
    limit = 50,
    offset = 0,
  ): Promise<CloudFileRecord[]> {
    const safeLimit = Math.min(Math.max(1, limit), 100);
    const safeOffset = Math.max(0, offset);

    return this.db.withTenantTransaction(schoolId, async (client) => {
      const params: unknown[] = [String(schoolId)];
      let filterSql = '';
      if (ownerEntityType) {
        params.push(ownerEntityType);
        filterSql = `AND owner_entity_type = $${params.length}`;
      }
      params.push(safeLimit, safeOffset);

      const res = await client.query<CloudFileRow>(
        `SELECT id, school_id, file_uuid, uploaded_by_user_id, owner_entity_type,
                owner_entity_id, file_name, description, storage_path, public_url,
                extension, mime_type, size_bytes, is_watermark, status, metadata, created_at
         FROM cloud_files
         WHERE school_id = $1
           AND status = 1
           ${filterSql}
         ORDER BY created_at DESC
         LIMIT $${params.length - 1} OFFSET $${params.length}`,
        params,
      );

      return res.rows.map((r) => this.mapRow(r));
    });
  }

  public async deleteCloudFile(
    schoolId: bigint,
    fileId: bigint,
  ): Promise<void> {
    await this.db.withTenantTransaction(schoolId, async (client) => {
      await client.query(
        `DELETE FROM cloud_files WHERE school_id = $1 AND id = $2`,
        [String(schoolId), String(fileId)],
      );
    });
  }

  private mapRow(row: CloudFileRow): CloudFileRecord {
    return {
      id: row.id,
      schoolId: row.school_id,
      fileUuid: row.file_uuid,
      uploadedByUserId: row.uploaded_by_user_id,
      ownerEntityType: row.owner_entity_type,
      ownerEntityId: row.owner_entity_id,
      fileName: row.file_name,
      description: row.description,
      storagePath: row.storage_path,
      publicUrl: row.public_url,
      extension: row.extension,
      mimeType: row.mime_type,
      sizeBytes: Number(row.size_bytes ?? 0),
      isWatermark: row.is_watermark,
      status: row.status,
      metadata: row.metadata ?? {},
      createdAt: new Date(row.created_at).toISOString(),
    };
  }
}
