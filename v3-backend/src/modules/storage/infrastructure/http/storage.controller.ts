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
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { FastifyRequest } from 'fastify';
import { ActiveTenantContext } from '../../../../shared/application/context/tenant-context.service';
import { UploadCloudObjectInput } from '../../../../shared/application/ports/cloud-storage.port';
import { TenantAccessDeniedException } from '../../../../shared/domain/exceptions/tenant-access-denied.exception';
import { CurrentUser } from '../../../../shared/infrastructure/http/decorators/security.decorators';
import { PositiveBigIntPipe } from '../../../../shared/infrastructure/http/pipes/positive-bigint.pipe';
import {
  RBAC_PERMISSIONS,
  resolveStorageCategoryWritePermissions,
} from '../../../../shared/infrastructure/rbac/rbac-permissions.constants';
import { RbacPermissionsService } from '../../../../shared/infrastructure/rbac/rbac-permissions.service';
import {
  ALLOWED_MIME_TO_EXTENSIONS,
  MAX_CLOUD_FILE_SIZE_BYTES,
} from '../../../../shared/infrastructure/storage/aws-s3-storage.adapter';
import { ManageCloudFilesUseCase } from '../../application/use-cases/manage-cloud-files.use-case';

const ALLOWED_STORAGE_CATEGORIES: UploadCloudObjectInput['category'][] = [
  'STUDENT_DOCUMENTS',
  'INSTITUTIONAL_LOGOS',
  'VIRTUAL_ACTIVITIES',
  'OBSERVER_ATTACHMENTS',
  'CRM_ATTACHMENTS',
  'JASPER_REPORTS',
  'GENERAL',
];

const STAFF_FILE_VIEW_PERMISSIONS = [
  RBAC_PERMISSIONS.ADMIN_SCHOOL_VIEW,
  RBAC_PERMISSIONS.ACADEMIC_ENROLLMENTS_VIEW,
  RBAC_PERMISSIONS.PORTAL_TEACHER_OWN,
  RBAC_PERMISSIONS.PORTAL_TEACHER_SUPERVISE_READ,
] as const;

const PUBLIC_SCHOOL_READ_CATEGORIES = new Set<string>([
  'INSTITUTIONAL_LOGOS',
  'VIRTUAL_ACTIVITIES',
]);

const ALLOWED_MIME_LIST = Array.from(ALLOWED_MIME_TO_EXTENSIONS.keys());
const MAX_BASE64_LENGTH = Math.ceil((MAX_CLOUD_FILE_SIZE_BYTES * 4) / 3) + 128;

export class UploadSchoolFileRequestDto {
  @ApiProperty({
    example: 'STUDENT_DOCUMENTS',
    enum: ALLOWED_STORAGE_CATEGORIES,
  })
  @IsString()
  @IsIn(ALLOWED_STORAGE_CATEGORIES)
  category!: UploadCloudObjectInput['category'];

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
  category?: string;

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
      'Subir archivo institucional (Base64) a AWS S3 y registrar en cloud_files (RLS + RBAC por categoría)',
  })
  @ApiResponse({ status: 201, description: 'Archivo almacenado en AWS S3.' })
  public async uploadFile(
    @CurrentUser() principal: ActiveTenantContext,
    @Body() dto: UploadSchoolFileRequestDto,
  ): Promise<Record<string, unknown>> {
    await this.assertCategoryWriteAccess(principal, dto.category);

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
      'Subir archivo binario mediante multipart/form-data a AWS S3 (Fastify Multipart + RBAC por categoría)',
  })
  @ApiQuery({
    name: 'category',
    enum: ALLOWED_STORAGE_CATEGORIES,
    required: false,
  })
  public async uploadMultipartFile(
    @CurrentUser() principal: ActiveTenantContext,
    @Req() request: FastifyRequest,
    @Query('category') categoryQuery?: UploadCloudObjectInput['category'],
  ): Promise<Record<string, unknown>> {
    const category: UploadCloudObjectInput['category'] =
      categoryQuery && ALLOWED_STORAGE_CATEGORIES.includes(categoryQuery)
        ? categoryQuery
        : 'GENERAL';

    await this.assertCategoryWriteAccess(principal, category);

    const multipartReq = request as FastifyRequest & {
      file?: () => Promise<{
        filename: string;
        mimetype: string;
        toBuffer: () => Promise<Buffer>;
      }>;
    };

    if (typeof multipartReq.file !== 'function') {
      throw new BadRequestException(
        'El servidor no recibió una petición multipart/form-data válida.',
      );
    }

    const uploadedPart = await multipartReq.file();
    if (!uploadedPart) {
      throw new BadRequestException(
        'No se adjuntó ningún archivo en la petición.',
      );
    }

    const buffer = await uploadedPart.toBuffer();

    const record = await this.manageCloudFilesUseCase.uploadSchoolFile({
      schoolId: principal.schoolId,
      uploadedByUserId: principal.userId,
      category,
      originalFileName: uploadedPart.filename,
      mimeType: uploadedPart.mimetype,
      contentBuffer: buffer,
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
    await this.assertCategoryWriteAccess(principal, dto.category);

    const result =
      await this.manageCloudFilesUseCase.createPresignedUploadTicket({
        schoolId: principal.schoolId,
        uploadedByUserId: principal.userId,
        category: dto.category,
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
      await this.assertCategoryWriteAccess(
        principal,
        metadata.ownerEntityType ?? 'GENERAL',
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
    summary: 'Listar archivos activos en la nube (AWS S3) de la institución del JWT',
  })
  public async listSchoolFiles(
    @CurrentUser() principal: ActiveTenantContext,
    @Query() query: ListSchoolFilesQueryDto,
  ): Promise<Record<string, unknown>> {
    const hasStaffView = await this.rbacPermissions.hasAnyPermission(
      principal.schoolId,
      principal.userId,
      principal.activeRole,
      STAFF_FILE_VIEW_PERMISSIONS,
    );

    const allFiles = await this.manageCloudFilesUseCase.listSchoolFiles(
      principal.schoolId,
      query.category,
      query.limit,
      query.offset,
    );

    const files = hasStaffView
      ? allFiles
      : allFiles.filter(
          (f) =>
            f.uploadedByUserId === String(principal.userId) ||
            PUBLIC_SCHOOL_READ_CATEGORIES.has(f.ownerEntityType ?? ''),
        );

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

    const hasStaffView = await this.rbacPermissions.hasAnyPermission(
      principal.schoolId,
      principal.userId,
      principal.activeRole,
      STAFF_FILE_VIEW_PERMISSIONS,
    );

    if (
      !hasStaffView &&
      metadata.uploadedByUserId !== String(principal.userId) &&
      !PUBLIC_SCHOOL_READ_CATEGORIES.has(metadata.ownerEntityType ?? '')
    ) {
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
      'Eliminar archivo de cloud_files y AWS S3 bajo RLS del JWT y permisos RBAC por categoría',
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
    await this.assertCategoryWriteAccess(
      principal,
      metadata.ownerEntityType ?? 'GENERAL',
    );

    const result = await this.manageCloudFilesUseCase.deleteSchoolFile(
      principal.schoolId,
      fileId,
    );
    return { success: true, data: result };
  }

  private async assertCategoryWriteAccess(
    principal: ActiveTenantContext,
    category: string,
  ): Promise<void> {
    const requiredPerms = resolveStorageCategoryWritePermissions(category);
    await this.rbacPermissions.assertAnyPermission(
      principal.schoolId,
      principal.userId,
      principal.activeRole,
      requiredPerms,
      `No tienes permiso para subir o eliminar archivos en la categoría '${category}'.`,
    );
  }
}
