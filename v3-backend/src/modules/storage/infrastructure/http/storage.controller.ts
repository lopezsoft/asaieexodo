import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiProperty,
  ApiPropertyOptional,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { UploadCloudObjectInput } from '../../../../shared/application/ports/cloud-storage.port';
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

export class UploadSchoolFileRequestDto {
  @ApiProperty({
    example: 1,
    description: 'ID de la Institución Educativa activa (Tenant RLS)',
  })
  @IsInt()
  schoolId!: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'ID del usuario de la comunidad educativa que sube el archivo',
  })
  @IsOptional()
  @IsInt()
  uploadedByUserId?: number;

  @ApiProperty({
    example: 'STUDENT_DOCUMENTS',
    enum: ALLOWED_STORAGE_CATEGORIES,
    description:
      'Categoría funcional del archivo para organizar el prefijo en el bucket AWS S3',
  })
  @IsString()
  @IsIn(ALLOWED_STORAGE_CATEGORIES)
  category!: UploadCloudObjectInput['category'];

  @ApiProperty({
    example: 'registro-civil-estudiante.pdf',
    description: 'Nombre original del archivo',
  })
  @IsString()
  @IsNotEmpty()
  originalFileName!: string;

  @ApiPropertyOptional({
    example: 'Documento de identidad digitalizado para matrícula SIMAT 2026',
    description: 'Descripción opcional del archivo',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 'application/pdf',
    description: 'Tipo MIME del archivo',
  })
  @IsString()
  @IsNotEmpty()
  mimeType!: string;

  @ApiProperty({
    example: 'JVBERi0xLjQKMSAwIG9iago8PC9UeXBlL0NhdGFsb2c+PgplbmRvYmoK',
    description: 'Contenido binario del archivo codificado en Base64',
  })
  @IsString()
  @IsNotEmpty()
  base64Content!: string;

  @ApiPropertyOptional({
    example: false,
    description: 'Indica si el archivo corresponde a marca de agua o escudo institucional',
  })
  @IsOptional()
  @IsBoolean()
  isWatermark?: boolean;

  @ApiPropertyOptional({
    example: { enrollmentId: 1024 },
    description: 'Metadatos adicionales almacenados en JSONB',
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class CreatePresignedUploadTicketRequestDto {
  @ApiProperty({
    example: 1,
    description: 'ID de la Institución Educativa activa (Tenant RLS)',
  })
  @IsInt()
  schoolId!: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'ID del usuario que solicita la carga directa a AWS S3',
  })
  @IsOptional()
  @IsInt()
  uploadedByUserId?: number;

  @ApiProperty({
    example: 'VIRTUAL_ACTIVITIES',
    enum: ALLOWED_STORAGE_CATEGORIES,
    description: 'Categoría funcional del archivo en S3',
  })
  @IsString()
  @IsIn(ALLOWED_STORAGE_CATEGORIES)
  category!: UploadCloudObjectInput['category'];

  @ApiProperty({
    example: 'guia-matematicas-periodo-1.pdf',
    description: 'Nombre original del archivo a cargar',
  })
  @IsString()
  @IsNotEmpty()
  originalFileName!: string;

  @ApiProperty({
    example: 'application/pdf',
    description: 'Tipo MIME del archivo',
  })
  @IsString()
  @IsNotEmpty()
  mimeType!: string;

  @ApiPropertyOptional({
    example: 245760,
    description: 'Tamaño estimado en bytes',
  })
  @IsOptional()
  @IsInt()
  sizeBytes?: number;

  @ApiPropertyOptional({
    example: 'Guía pedagógica de aula virtual',
  })
  @IsOptional()
  @IsString()
  description?: string;
}

@ApiTags('Cloud Storage & AWS S3 Files')
@ApiBearerAuth('jwt-auth')
@ApiHeader({
  name: 'x-school-id',
  description: 'Identificador numérico del Colegio activo para Row-Level Security (RLS)',
  required: false,
})
@Controller('storage/files')
export class StorageController {
  constructor(
    private readonly manageCloudFilesUseCase: ManageCloudFilesUseCase,
  ) {}

  @Post('upload')
  @ApiOperation({
    summary: 'Subir archivo institucional a AWS S3 y registrar en cloud_files (RLS)',
    description:
      'Resuelve automáticamente la carpeta institucional (`schools.storage_folder`, ej. `pto_beato`), sube el archivo a AWS S3 mediante `@aws-sdk/client-s3` y guarda su registro en `cloud_files` aislado por `school_id`.',
  })
  @ApiResponse({
    status: 201,
    description: 'Archivo almacenado en AWS S3 y registrado en PostgreSQL 17.',
  })
  public async uploadFile(
    @Body() dto: UploadSchoolFileRequestDto,
  ): Promise<Record<string, unknown>> {
    const cleanBase64 = dto.base64Content.includes(',')
      ? dto.base64Content.split(',')[1]
      : dto.base64Content;

    const record = await this.manageCloudFilesUseCase.uploadSchoolFile({
      schoolId: BigInt(dto.schoolId),
      uploadedByUserId: dto.uploadedByUserId
        ? BigInt(dto.uploadedByUserId)
        : null,
      category: dto.category,
      originalFileName: dto.originalFileName,
      description: dto.description ?? null,
      mimeType: dto.mimeType,
      contentBuffer: Buffer.from(cleanBase64, 'base64'),
      isWatermark: dto.isWatermark,
      metadata: dto.metadata,
    });

    return {
      success: true,
      data: record,
    };
  }

  @Post('presigned-upload')
  @ApiOperation({
    summary: 'Generar URL prefirmada (PUT) de AWS S3 para carga directa desde el navegador',
    description:
      'Utiliza `@aws-sdk/s3-request-presigner` para emitir una URL temporal firmada (`PUT`) hacia la carpeta del colegio en S3 y registra el metadato en `cloud_files`.',
  })
  @ApiResponse({
    status: 201,
    description: 'Ticket de carga prefirmada S3 generado exitosamente.',
  })
  public async createPresignedUpload(
    @Body() dto: CreatePresignedUploadTicketRequestDto,
  ): Promise<Record<string, unknown>> {
    const result =
      await this.manageCloudFilesUseCase.createPresignedUploadTicket({
        schoolId: BigInt(dto.schoolId),
        uploadedByUserId: dto.uploadedByUserId
          ? BigInt(dto.uploadedByUserId)
          : null,
        category: dto.category,
        originalFileName: dto.originalFileName,
        mimeType: dto.mimeType,
        sizeBytes: dto.sizeBytes,
        description: dto.description,
      });

    return {
      success: true,
      data: result,
    };
  }

  @Get(':schoolId')
  @ApiOperation({
    summary: 'Listar archivos en la nube (AWS S3) pertenecientes a una Institución Educativa',
    description:
      'Consulta la tabla `cloud_files` aplicando la política RLS `tenant_isolation_cloud_files`.',
  })
  @ApiParam({ name: 'schoolId', example: 1 })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Filtro opcional por categoría de entidad propietaria',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado de archivos de la institución educativa.',
  })
  public async listSchoolFiles(
    @Param('schoolId') schoolId: string,
    @Query('category') category?: string,
  ): Promise<Record<string, unknown>> {
    const files = await this.manageCloudFilesUseCase.listSchoolFiles(
      BigInt(schoolId),
      category,
    );
    return {
      success: true,
      total: files.length,
      data: files,
    };
  }

  @Get(':schoolId/:fileId/presigned-url')
  @ApiOperation({
    summary: 'Obtener URL prefirmada temporal (GET) para descargar un archivo privado de AWS S3',
    description:
      'Verifica mediante RLS que el archivo pertenezca al colegio solicitado y genera una URL firmada temporal con `@aws-sdk/s3-request-presigner`.',
  })
  @ApiParam({ name: 'schoolId', example: 1 })
  @ApiParam({ name: 'fileId', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'URL firmada de descarga generada exitosamente.',
  })
  public async getPresignedDownloadUrl(
    @Param('schoolId') schoolId: string,
    @Param('fileId') fileId: string,
  ): Promise<Record<string, unknown>> {
    const result = await this.manageCloudFilesUseCase.getPresignedDownloadUrl(
      BigInt(schoolId),
      BigInt(fileId),
    );
    return {
      success: true,
      data: result,
    };
  }

  @Delete(':schoolId/:fileId')
  @ApiOperation({
    summary: 'Eliminar archivo de AWS S3 y de la tabla cloud_files bajo RLS',
  })
  @ApiParam({ name: 'schoolId', example: 1 })
  @ApiParam({ name: 'fileId', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Archivo eliminado de S3 y de PostgreSQL 17.',
  })
  public async deleteFile(
    @Param('schoolId') schoolId: string,
    @Param('fileId') fileId: string,
  ): Promise<Record<string, unknown>> {
    const result = await this.manageCloudFilesUseCase.deleteSchoolFile(
      BigInt(schoolId),
      BigInt(fileId),
    );
    return {
      success: true,
      data: result,
    };
  }
}
