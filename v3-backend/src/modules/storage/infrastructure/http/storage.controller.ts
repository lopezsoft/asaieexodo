import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiProperty,
  ApiPropertyOptional,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { FastifyRequest } from 'fastify';
import { ActiveTenantContext } from '../../../../shared/application/context/tenant-context.service';
import {
  CloudStorageCategory,
  UploadCloudObjectInput,
} from '../../../../shared/application/ports/cloud-storage.port';
import { TenantAccessDeniedException } from '../../../../shared/domain/exceptions/tenant-access-denied.exception';
import { CurrentUser } from '../../../../shared/infrastructure/http/decorators/security.decorators';
import { PositiveBigIntPipe } from '../../../../shared/infrastructure/http/pipes/positive-bigint.pipe';
import {
  RBAC_PERMISSIONS,
  resolveStorageCategoryWritePermissions,
  resolveStorageEntityReadPermissions,
} from '../../../../shared/infrastructure/rbac/rbac-permissions.constants';
import { RbacPermissionsService } from '../../../../shared/infrastructure/rbac/rbac-permissions.service';
import {
  ALLOWED_MIME_TO_EXTENSIONS,
  MAX_CLOUD_FILE_SIZE_BYTES,
} from '../../../../shared/infrastructure/storage/aws-s3-storage.adapter';
import { ManageCloudFilesUseCase } from '../../application/use-cases/manage-cloud-files.use-case';
import {
  ALLOWED_CLOUD_FILE_OWNER_ENTITY_TYPES,
  CloudFileOwnerEntityType,
  CloudFileRecord,
  RECORD_SCOPED_OWNER_ENTITY_TYPES,
} from '../../domain/ports/cloud-file.repository.port';

const ALLOWED_STORAGE_CATEGORIES: CloudStorageCategory[] = [
  'STUDENT_DOCUMENTS',
  'TEACHER_DOCUMENTS',
  'FAMILY_DOCUMENTS',
  'ADMINISTRATIVE_DOCUMENTS',
  'USER_AVATARS',
  'INSTITUTIONAL_LOGOS',
  'VIRTUAL_ACTIVITIES',
  'OBSERVER_ATTACHMENTS',
  'CRM_ATTACHMENTS',
  'JASPER_REPORTS',
  'GENERAL',
];

const PUBLIC_SCHOOL_READ_CATEGORIES = new Set<string>([
  'INSTITUTIONAL_LOGOS',
  'VIRTUAL_ACTIVITIES',
  'SCHOOL',
  'VIRTUAL_ACTIVITY',
]);

const POSITIVE_BIGINT_REGEX = /^[1-9]\d{0,18}$/;

const ALLOWED_MIME_LIST = Array.from(ALLOWED_MIME_TO_EXTENSIONS.keys());
const MAX_BASE64_LENGTH = Math.ceil((MAX_CLOUD_FILE_SIZE_BYTES * 4) / 3) + 128;

function normalizeOptionalEntityId({ value }: { value: unknown }): unknown {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  return String(value).trim();
}

function isKnownOwnerEntityType(
  value: string | null | undefined,
): value is CloudFileOwnerEntityType {
  return (
    Boolean(value) &&
    (ALLOWED_CLOUD_FILE_OWNER_ENTITY_TYPES as readonly string[]).includes(
      value as string,
    )
  );
}

function resolveFileStorageCategory(record: CloudFileRecord): string {
  const metaCategory = record.metadata?.['storageCategory'];
  if (typeof metaCategory === 'string' && metaCategory.trim().length > 0) {
    return metaCategory.trim();
  }
  return record.ownerEntityType ?? 'GENERAL';
}

export class UploadSchoolFileRequestDto {
  @ApiProperty({
    example: 'STUDENT_DOCUMENTS',
    enum: ALLOWED_STORAGE_CATEGORIES,
  })
  @IsString()
  @IsIn(ALLOWED_STORAGE_CATEGORIES)
  category!: UploadCloudObjectInput['category'];

  @ApiPropertyOptional({
    example: 'STUDENT',
    enum: ALLOWED_CLOUD_FILE_OWNER_ENTITY_TYPES,
    description:
      'Entidad propietaria del expediente digital (TEACHER, STUDENT, FAMILY, ADMINISTRATIVE_STAFF, SCHOOL, USER, etc.)',
  })
  @IsOptional()
  @IsString()
  @IsIn(ALLOWED_CLOUD_FILE_OWNER_ENTITY_TYPES)
  ownerEntityType?: CloudFileOwnerEntityType;

  @ApiPropertyOptional({
    example: '1024',
    description:
      'ID del registro propietario enlazado (obligatorio para TEACHER, STUDENT, FAMILY, ADMINISTRATIVE_STAFF y USER)',
  })
  @Transform(normalizeOptionalEntityId)
  @IsOptional()
  @IsString()
  @Matches(POSITIVE_BIGINT_REGEX, {
    message: 'ownerEntityId debe ser un identificador entero positivo válido.',
  })
  ownerEntityId?: string;

  @ApiProperty({ example: 'registro-civil-estudiante.pdf' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  originalFileName!: string;

  @ApiPropertyOptional({
    example: 'Documento de identidad digitalizado para matrícula SIMAT 2026',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @ApiProperty({
    example: 'application/pdf',
    enum: ALLOWED_MIME_LIST,
  })
  @IsString()
  @IsIn(ALLOWED_MIME_LIST)
  mimeType!: string;

  @ApiProperty({
    example: 'JVBERi0xLjQKMSAwIG9iago8PC9UeXBlL0NhdGFsb2c+PgplbmRvYmoK',
    description: 'Contenido binario del archivo codificado en Base64 (máx 10 MB)',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_BASE64_LENGTH)
  base64Content!: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isWatermark?: boolean;

  @ApiPropertyOptional({ example: { enrollmentId: 1024 } })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class CreatePresignedUploadTicketRequestDto {
  @ApiProperty({
    example: 'VIRTUAL_ACTIVITIES',
    enum: ALLOWED_STORAGE_CATEGORIES,
  })
  @IsString()
  @IsIn(ALLOWED_STORAGE_CATEGORIES)
  category!: UploadCloudObjectInput['category'];

  @ApiPropertyOptional({
    example: 'TEACHER',
    enum: ALLOWED_CLOUD_FILE_OWNER_ENTITY_TYPES,
  })
  @IsOptional()
  @IsString()
  @IsIn(ALLOWED_CLOUD_FILE_OWNER_ENTITY_TYPES)
  ownerEntityType?: CloudFileOwnerEntityType;

  @ApiPropertyOptional({ example: '42' })
  @Transform(normalizeOptionalEntityId)
  @IsOptional()
  @IsString()
  @Matches(POSITIVE_BIGINT_REGEX, {
    message: 'ownerEntityId debe ser un identificador entero positivo válido.',
  })
  ownerEntityId?: string;

  @ApiProperty({ example: 'guia-matematicas-periodo-1.pdf' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  originalFileName!: string;

  @ApiProperty({ example: 'application/pdf', enum: ALLOWED_MIME_LIST })
  @IsString()
  @IsIn(ALLOWED_MIME_LIST)
  mimeType!: string;

  @ApiProperty({
    example: 245760,
    description:
      'Tamaño exacto en bytes (1 byte .. 10 MB) firmado en S3 ContentLength',
  })
  @IsInt()
  @Min(1)
  @Max(MAX_CLOUD_FILE_SIZE_BYTES)
  sizeBytes!: number;

  @ApiPropertyOptional({ example: 'Guía pedagógica de aula virtual' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}

export class ListSchoolFilesQueryDto {
  @ApiPropertyOptional({ enum: ALLOWED_STORAGE_CATEGORIES })
  @IsOptional()
  @IsIn(ALLOWED_STORAGE_CATEGORIES)
  category?: CloudStorageCategory;

  @ApiPropertyOptional({
    enum: ALLOWED_CLOUD_FILE_OWNER_ENTITY_TYPES,
    description: 'Filtrar expediente digital por tipo de entidad propietaria',
  })
  @IsOptional()
  @IsIn(ALLOWED_CLOUD_FILE_OWNER_ENTITY_TYPES)
  ownerEntityType?: CloudFileOwnerEntityType;

  @ApiPropertyOptional({
    example: '42',
    description:
      'ID del registro propietario (obligatorio al filtrar TEACHER, STUDENT, FAMILY, ADMINISTRATIVE_STAFF o USER)',
  })
  @Transform(normalizeOptionalEntityId)
  @IsOptional()
  @IsString()
  @Matches(POSITIVE_BIGINT_REGEX, {
    message: 'ownerEntityId debe ser un identificador entero positivo válido.',
  })
  ownerEntityId?: string;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;
}

interface MultipartPartLike {
  readonly type: 'file' | 'field';
  readonly fieldname: string;
  readonly filename?: string;
  readonly mimetype?: string;
  readonly value?: unknown;
  toBuffer?: () => Promise<Buffer>;
}

@ApiTags('Cloud Storage & AWS S3 Files')
@ApiBearerAuth('jwt-auth')
@Controller('storage/files')
export class StorageController {
  constructor(
    private readonly manageCloudFilesUseCase: ManageCloudFilesUseCase,
    private readonly rbacPermissions: RbacPermissionsService,
  ) {}

  @Post('upload')
  @ApiOperation({
    summary:
      'Subir archivo institucional (Base64) a AWS S3 enlazado a un registro específico (RLS + RBAC)',
  })
  @ApiResponse({ status: 201, description: 'Archivo almacenado en AWS S3.' })
  public async uploadFile(
    @CurrentUser() principal: ActiveTenantContext,
    @Body() dto: UploadSchoolFileRequestDto,
  ): Promise<Record<string, unknown>> {
    const ownerEntityId = this.parseAndValidateOwnerParams(
      dto.ownerEntityType,
      dto.ownerEntityId,
    );

    await this.assertFileWriteAccess(
      principal,
      dto.category,
      dto.ownerEntityType ?? null,
      ownerEntityId,
    );

    const cleanBase64 = (
      dto.base64Content.includes(',')
        ? dto.base64Content.split(',')[1]
        : dto.base64Content
    ).replace(/\s+/g, '');

    if (
      cleanBase64.length === 0 ||
      !/^[A-Za-z0-9+/]+=*$/.test(cleanBase64) ||
      cleanBase64.length % 4 !== 0
    ) {
      throw new BadRequestException(
        'El contenido Base64 suministrado no tiene un formato válido.',
      );
    }

    const contentBuffer = Buffer.from(cleanBase64, 'base64');

    const record = await this.manageCloudFilesUseCase.uploadSchoolFile({
      schoolId: principal.schoolId,
      uploadedByUserId: principal.userId,
      category: dto.category,
      ownerEntityType: dto.ownerEntityType ?? null,
      ownerEntityId,
      originalFileName: dto.originalFileName,
      description: dto.description ?? null,
      mimeType: dto.mimeType,
      contentBuffer,
      isWatermark: dto.isWatermark,
      metadata: dto.metadata,
    });

    return { success: true, data: record };
  }

  @Post('upload-multipart')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary:
      'Subir archivo binario mediante multipart/form-data a AWS S3 enlazado al registro propietario (Fastify Multipart + RBAC)',
  })
  @ApiQuery({
    name: 'category',
    enum: ALLOWED_STORAGE_CATEGORIES,
    required: false,
  })
  @ApiQuery({
    name: 'ownerEntityType',
    enum: ALLOWED_CLOUD_FILE_OWNER_ENTITY_TYPES,
    required: false,
  })
  @ApiQuery({ name: 'ownerEntityId', type: String, required: false })
  @ApiQuery({ name: 'description', type: String, required: false })
  public async uploadMultipartFile(
    @CurrentUser() principal: ActiveTenantContext,
    @Req() request: FastifyRequest,
    @Query('category') categoryQuery?: string,
    @Query('ownerEntityType') ownerEntityTypeQuery?: string,
    @Query('ownerEntityId') ownerEntityIdQuery?: string,
    @Query('description') descriptionQuery?: string,
  ): Promise<Record<string, unknown>> {
    const multipartReq = request as FastifyRequest & {
      parts?: () => AsyncIterableIterator<MultipartPartLike>;
      file?: () => Promise<{
        filename: string;
        mimetype: string;
        toBuffer: () => Promise<Buffer>;
        fields?: Record<string, { value?: unknown } | undefined>;
      }>;
    };

    const formFields = new Map<string, string>();
    let uploadedFile: {
      filename: string;
      mimetype: string;
      buffer: Buffer;
    } | null = null;

    if (typeof multipartReq.parts === 'function') {
      for await (const part of multipartReq.parts()) {
        if (part.type === 'file') {
          if (!uploadedFile && typeof part.toBuffer === 'function') {
            const buffer = await part.toBuffer();
            uploadedFile = {
              filename: part.filename ?? 'documento',
              mimetype: part.mimetype ?? 'application/octet-stream',
              buffer,
            };
          } else if (typeof part.toBuffer === 'function') {
            // Drenar partes adicionales para no bloquear el stream Fastify
            await part.toBuffer();
          }
        } else if (part.type === 'field') {
          formFields.set(part.fieldname, String(part.value ?? '').trim());
        }
      }
    } else if (typeof multipartReq.file === 'function') {
      const part = await multipartReq.file();
      if (part) {
        const buffer = await part.toBuffer();
        uploadedFile = {
          filename: part.filename,
          mimetype: part.mimetype,
          buffer,
        };
        if (part.fields) {
          for (const [key, fieldObj] of Object.entries(part.fields)) {
            if (fieldObj && 'value' in fieldObj && fieldObj.value !== undefined) {
              formFields.set(key, String(fieldObj.value).trim());
            }
          }
        }
      }
    } else {
      throw new BadRequestException(
        'El servidor no recibió una petición multipart/form-data válida.',
      );
    }

    if (!uploadedFile) {
      throw new BadRequestException(
        'No se adjuntó ningún archivo en la petición.',
      );
    }

    const rawCategory = (
      formFields.get('category') ||
      categoryQuery ||
      'GENERAL'
    ).trim();
    if (
      !(ALLOWED_STORAGE_CATEGORIES as readonly string[]).includes(rawCategory)
    ) {
      throw new BadRequestException(
        `La categoría de almacenamiento '${rawCategory}' no es válida.`,
      );
    }
    const category = rawCategory as CloudStorageCategory;

    const rawOwnerEntityType = (
      formFields.get('ownerEntityType') ||
      ownerEntityTypeQuery ||
      ''
    ).trim();
    let ownerEntityType: CloudFileOwnerEntityType | undefined;
    if (rawOwnerEntityType) {
      if (!isKnownOwnerEntityType(rawOwnerEntityType)) {
        throw new BadRequestException(
          `El tipo de entidad propietaria '${rawOwnerEntityType}' no es válido.`,
        );
      }
      ownerEntityType = rawOwnerEntityType;
    }

    const rawOwnerEntityId = (
      formFields.get('ownerEntityId') ||
      ownerEntityIdQuery ||
      ''
    ).trim();
    const ownerEntityId = this.parseAndValidateOwnerParams(
      ownerEntityType,
      rawOwnerEntityId || undefined,
    );

    const rawDescription = (
      formFields.get('description') ||
      descriptionQuery ||
      ''
    ).trim();
    const description =
      rawDescription.length > 0 ? rawDescription.slice(0, 255) : null;

    await this.assertFileWriteAccess(
      principal,
      category,
      ownerEntityType ?? null,
      ownerEntityId,
    );

    const record = await this.manageCloudFilesUseCase.uploadSchoolFile({
      schoolId: principal.schoolId,
      uploadedByUserId: principal.userId,
      category,
      ownerEntityType: ownerEntityType ?? null,
      ownerEntityId,
      originalFileName: uploadedFile.filename,
      description,
      mimeType: uploadedFile.mimetype,
      contentBuffer: uploadedFile.buffer,
    });

    return { success: true, data: record };
  }

  @Post('presigned-upload')
  @ApiOperation({
    summary:
      'Generar URL prefirmada (PUT) de AWS S3 y registrar ticket PENDING en cloud_files',
  })
  public async createPresignedUpload(
    @CurrentUser() principal: ActiveTenantContext,
    @Body() dto: CreatePresignedUploadTicketRequestDto,
  ): Promise<Record<string, unknown>> {
    const ownerEntityId = this.parseAndValidateOwnerParams(
      dto.ownerEntityType,
      dto.ownerEntityId,
    );

    await this.assertFileWriteAccess(
      principal,
      dto.category,
      dto.ownerEntityType ?? null,
      ownerEntityId,
    );

    const result =
      await this.manageCloudFilesUseCase.createPresignedUploadTicket({
        schoolId: principal.schoolId,
        uploadedByUserId: principal.userId,
        category: dto.category,
        ownerEntityType: dto.ownerEntityType ?? null,
        ownerEntityId,
        originalFileName: dto.originalFileName,
        mimeType: dto.mimeType,
        sizeBytes: dto.sizeBytes,
        description: dto.description,
      });

    return { success: true, data: result };
  }

  @Post(':fileId/confirm-upload')
  @ApiOperation({
    summary:
      'Confirmar carga prefirmada verificando el objeto en S3 (HeadObject -> ACTIVE)',
  })
  @ApiParam({ name: 'fileId', example: 1 })
  public async confirmPresignedUpload(
    @CurrentUser() principal: ActiveTenantContext,
    @Param('fileId', PositiveBigIntPipe) fileId: bigint,
  ): Promise<Record<string, unknown>> {
    const metadata = await this.manageCloudFilesUseCase.getFileMetadata(
      principal.schoolId,
      fileId,
      true,
    );

    if (metadata.uploadedByUserId !== String(principal.userId)) {
      await this.assertFileWriteAccess(
        principal,
        resolveFileStorageCategory(metadata),
        isKnownOwnerEntityType(metadata.ownerEntityType)
          ? metadata.ownerEntityType
          : null,
        metadata.ownerEntityId ? BigInt(metadata.ownerEntityId) : null,
      );
    }

    const confirmed = await this.manageCloudFilesUseCase.confirmPresignedUpload(
      principal.schoolId,
      fileId,
    );
    return { success: true, data: confirmed };
  }

  @Get()
  @ApiOperation({
    summary:
      'Listar archivos activos en la nube (AWS S3) filtrados por registro propietario y/o categoría',
  })
  public async listSchoolFiles(
    @CurrentUser() principal: ActiveTenantContext,
    @Query() query: ListSchoolFilesQueryDto,
  ): Promise<Record<string, unknown>> {
    const ownerEntityId = this.parseAndValidateOwnerParams(
      query.ownerEntityType,
      query.ownerEntityId,
    );

    // Si se consulta el expediente digital de una entidad concreta, validar autorización específica por registro
    if (query.ownerEntityType) {
      const canReadEntity = await this.canReadEntityFiles(
        principal,
        query.ownerEntityType,
        ownerEntityId,
        query.category ?? query.ownerEntityType,
      );
      if (!canReadEntity) {
        throw new TenantAccessDeniedException(
          'No tienes autorización para consultar los documentos digitales de este registro.',
        );
      }

      const files = await this.manageCloudFilesUseCase.listSchoolFiles(
        principal.schoolId,
        {
          category: query.category,
          ownerEntityType: query.ownerEntityType,
          ownerEntityId: ownerEntityId ?? undefined,
          limit: query.limit,
          offset: query.offset,
        },
      );
      return { success: true, total: files.length, data: files };
    }

    // Consultas generales por categoría (ej. VIRTUAL_ACTIVITIES, INSTITUTIONAL_LOGOS, JASPER_REPORTS)
    const categoryKey = query.category ?? 'GENERAL';
    const hasStaffView = await this.rbacPermissions.hasAnyPermission(
      principal.schoolId,
      principal.userId,
      principal.activeRole,
      resolveStorageEntityReadPermissions(categoryKey),
    );

    const allFiles = await this.manageCloudFilesUseCase.listSchoolFiles(
      principal.schoolId,
      {
        category: query.category,
        limit: query.limit,
        offset: query.offset,
      },
    );

    const files = hasStaffView
      ? allFiles
      : allFiles.filter((file) => {
          const storageCategory = resolveFileStorageCategory(file);
          return (
            file.uploadedByUserId === String(principal.userId) ||
            PUBLIC_SCHOOL_READ_CATEGORIES.has(storageCategory) ||
            PUBLIC_SCHOOL_READ_CATEGORIES.has(file.ownerEntityType ?? '')
          );
        });

    return { success: true, total: files.length, data: files };
  }

  @Get(':fileId/presigned-url')
  @ApiOperation({
    summary:
      'Obtener URL prefirmada temporal (GET) para descargar archivo privado de AWS S3',
  })
  @ApiParam({ name: 'fileId', example: 1 })
  public async getPresignedDownloadUrl(
    @CurrentUser() principal: ActiveTenantContext,
    @Param('fileId', PositiveBigIntPipe) fileId: bigint,
  ): Promise<Record<string, unknown>> {
    const metadata = await this.manageCloudFilesUseCase.getFileMetadata(
      principal.schoolId,
      fileId,
    );

    const canRead = await this.canReadSpecificFile(principal, metadata);
    if (!canRead) {
      throw new TenantAccessDeniedException(
        'No tienes autorización para descargar este archivo privado.',
      );
    }

    const result = await this.manageCloudFilesUseCase.getPresignedDownloadUrl(
      principal.schoolId,
      fileId,
    );
    return { success: true, data: result };
  }

  @Delete(':fileId')
  @ApiOperation({
    summary:
      'Eliminar archivo de cloud_files y AWS S3 bajo RLS del JWT y permisos RBAC por entidad/categoría',
  })
  @ApiParam({ name: 'fileId', example: 1 })
  public async deleteFile(
    @CurrentUser() principal: ActiveTenantContext,
    @Param('fileId', PositiveBigIntPipe) fileId: bigint,
  ): Promise<Record<string, unknown>> {
    const metadata = await this.manageCloudFilesUseCase.getFileMetadata(
      principal.schoolId,
      fileId,
      true,
    );

    await this.assertFileWriteAccess(
      principal,
      resolveFileStorageCategory(metadata),
      isKnownOwnerEntityType(metadata.ownerEntityType)
        ? metadata.ownerEntityType
        : null,
      metadata.ownerEntityId ? BigInt(metadata.ownerEntityId) : null,
    );

    const result = await this.manageCloudFilesUseCase.deleteSchoolFile(
      principal.schoolId,
      fileId,
    );
    return { success: true, data: result };
  }

  private parseAndValidateOwnerParams(
    ownerEntityType?: CloudFileOwnerEntityType,
    rawOwnerEntityId?: string,
  ): bigint | null {
    if (rawOwnerEntityId && !ownerEntityType) {
      throw new BadRequestException(
        'Debe especificar ownerEntityType cuando se proporciona ownerEntityId.',
      );
    }

    if (
      ownerEntityType &&
      RECORD_SCOPED_OWNER_ENTITY_TYPES.has(ownerEntityType) &&
      !rawOwnerEntityId
    ) {
      throw new BadRequestException(
        `Los documentos digitales de tipo '${ownerEntityType}' requieren un ownerEntityId válido.`,
      );
    }

    if (!rawOwnerEntityId) {
      return null;
    }

    if (!POSITIVE_BIGINT_REGEX.test(rawOwnerEntityId)) {
      throw new BadRequestException(
        'ownerEntityId debe ser un identificador entero positivo válido.',
      );
    }

    return BigInt(rawOwnerEntityId);
  }

  private async assertFileWriteAccess(
    principal: ActiveTenantContext,
    category: string,
    ownerEntityType: CloudFileOwnerEntityType | null,
    ownerEntityId: bigint | null,
  ): Promise<void> {
    // Todo usuario autenticado puede subir/actualizar su propia foto de perfil
    if (
      ownerEntityType === 'USER' &&
      ownerEntityId !== null &&
      ownerEntityId === principal.userId
    ) {
      return;
    }

    // Un docente puede gestionar su propia firma o soportes en su propio perfil docente
    if (ownerEntityType === 'TEACHER' && ownerEntityId !== null) {
      const hasTeacherDocsPerm = await this.rbacPermissions.hasAnyPermission(
        principal.schoolId,
        principal.userId,
        principal.activeRole,
        [RBAC_PERMISSIONS.STORAGE_TEACHER_DOCUMENTS_WRITE],
      );
      if (hasTeacherDocsPerm) {
        return;
      }

      const hasOwnTeacherPortal = await this.rbacPermissions.hasAnyPermission(
        principal.schoolId,
        principal.userId,
        principal.activeRole,
        [RBAC_PERMISSIONS.PORTAL_TEACHER_OWN],
      );
      if (hasOwnTeacherPortal) {
        const ownsProfile =
          await this.manageCloudFilesUseCase.isEntityOwnedByUser(
            principal.schoolId,
            'TEACHER',
            ownerEntityId,
            principal.userId,
            'WRITE',
          );
        if (ownsProfile) {
          return;
        }
      }

      throw new TenantAccessDeniedException(
        'No tienes permiso para subir o eliminar documentos digitales de este docente.',
      );
    }

    const permissionScopeKey = ownerEntityType ?? category;
    const requiredPerms =
      resolveStorageCategoryWritePermissions(permissionScopeKey);
    await this.rbacPermissions.assertAnyPermission(
      principal.schoolId,
      principal.userId,
      principal.activeRole,
      requiredPerms,
      `No tienes permiso para subir o eliminar archivos en '${permissionScopeKey}'.`,
    );
  }

  private async canReadEntityFiles(
    principal: ActiveTenantContext,
    ownerEntityType: CloudFileOwnerEntityType,
    ownerEntityId: bigint | null,
    category: string,
  ): Promise<boolean> {
    if (
      PUBLIC_SCHOOL_READ_CATEGORIES.has(ownerEntityType) ||
      PUBLIC_SCHOOL_READ_CATEGORIES.has(category)
    ) {
      return true;
    }

    const hasStaffRead = await this.rbacPermissions.hasAnyPermission(
      principal.schoolId,
      principal.userId,
      principal.activeRole,
      resolveStorageEntityReadPermissions(ownerEntityType),
    );
    if (hasStaffRead) {
      return true;
    }

    if (ownerEntityId !== null) {
      return this.manageCloudFilesUseCase.isEntityOwnedByUser(
        principal.schoolId,
        ownerEntityType,
        ownerEntityId,
        principal.userId,
        'READ',
      );
    }

    return false;
  }

  private async canReadSpecificFile(
    principal: ActiveTenantContext,
    metadata: CloudFileRecord,
  ): Promise<boolean> {
    const storageCategory = resolveFileStorageCategory(metadata);
    if (
      PUBLIC_SCHOOL_READ_CATEGORIES.has(storageCategory) ||
      PUBLIC_SCHOOL_READ_CATEGORIES.has(metadata.ownerEntityType ?? '')
    ) {
      return true;
    }

    if (metadata.uploadedByUserId === String(principal.userId)) {
      return true;
    }

    if (isKnownOwnerEntityType(metadata.ownerEntityType)) {
      return this.canReadEntityFiles(
        principal,
        metadata.ownerEntityType,
        metadata.ownerEntityId ? BigInt(metadata.ownerEntityId) : null,
        storageCategory,
      );
    }

    return this.rbacPermissions.hasAnyPermission(
      principal.schoolId,
      principal.userId,
      principal.activeRole,
      resolveStorageEntityReadPermissions(storageCategory),
    );
  }
}
