import { InjectQueue } from '@nestjs/bullmq';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Res,
  StreamableFile,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiProperty,
  ApiPropertyOptional,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  IsIn,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { Queue } from 'bullmq';
import { FastifyReply } from 'fastify';
import { ActiveTenantContext } from '../../../../shared/application/context/tenant-context.service';
import {
  ReportGeneratorPort,
  ReportOutputFormat,
} from '../../../../shared/application/ports/report-generator.port';
import { ResourceNotFoundException } from '../../../../shared/domain/exceptions/resource-not-found.exception';
import {
  CurrentUser,
  RequireAnyPermission,
} from '../../../../shared/infrastructure/http/decorators/security.decorators';
import {
  RBAC_PERMISSIONS,
  resolveReportTemplatePermissions,
} from '../../../../shared/infrastructure/rbac/rbac-permissions.constants';
import { RbacPermissionsService } from '../../../../shared/infrastructure/rbac/rbac-permissions.service';
import { INSTITUTIONAL_REPORT_CATALOG } from '../../../../shared/infrastructure/reporting/report-catalog.constants';
import { ManageCloudFilesUseCase } from '../../../storage/application/use-cases/manage-cloud-files.use-case';
import {
  JASPER_REPORTS_QUEUE,
  JasperReportJobPayload,
  JasperReportJobResult,
} from '../queues/jasper-report.processor';

const ALLOWED_REPORT_FORMATS: ReportOutputFormat[] = [
  'pdf',
  'xlsx',
  'docx',
  'csv',
  'html',
];

const ANY_REPORT_PERMISSION = [
  RBAC_PERMISSIONS.REPORTS_ACADEMIC_GENERATE,
  RBAC_PERMISSIONS.REPORTS_CERTIFICATES_GENERATE,
  RBAC_PERMISSIONS.REPORTS_DIRECTORY_GENERATE,
  RBAC_PERMISSIONS.REPORTS_TEACHER_GENERATE,
] as const;

export class EnqueueJasperReportRequestDto {
  @ApiProperty({
    example: 'boletin_carta_areas',
    description:
      'Nombre de la plantilla institucional del catálogo (solo alfanumérico, guiones y guion bajo)',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Matches(/^[a-zA-Z0-9_-]{1,100}$/)
  templateName!: string;

  @ApiProperty({
    example: 'pdf',
    enum: ALLOWED_REPORT_FORMATS,
  })
  @IsString()
  @IsIn(ALLOWED_REPORT_FORMATS)
  outputFormat!: ReportOutputFormat;

  @ApiPropertyOptional({
    example: { P_YEAR: 2026, P_PERIOD: 1 },
    description:
      'Parámetros tipados del reporte (parámetros reservados como P_SCHOOL_ID o SQL_PARAM están bloqueados)',
  })
  @IsOptional()
  @IsObject()
  parameters?: Record<string, string | number | boolean>;
}

@ApiTags('Institutional Reports Engine')
@ApiBearerAuth('jwt-auth')
@Controller('reports')
export class ReportingController {
  constructor(
    @InjectQueue(JASPER_REPORTS_QUEUE)
    private readonly reportsQueue: Queue<
      JasperReportJobPayload,
      JasperReportJobResult
    >,
    private readonly reportGenerator: ReportGeneratorPort,
    private readonly manageCloudFilesUseCase: ManageCloudFilesUseCase,
    private readonly rbacPermissions: RbacPermissionsService,
  ) {}

  @Get('catalog')
  @RequireAnyPermission(...ANY_REPORT_PERMISSION)
  @ApiOperation({
    summary:
      'Listar catálogo de reportes institucionales habilitados para los permisos del usuario activo',
    description:
      'Filtra las plantillas del motor cloud-native (Gotenberg 8 HTML->PDF + ExcelJS) según los permisos RBAC efectivos y módulos habilitados del colegio.',
  })
  @ApiResponse({
    status: 200,
    description: 'Catálogo institucional de reportes filtrado exitosamente.',
  })
  async getCatalog(
    @CurrentUser() principal: ActiveTenantContext,
  ): Promise<Record<string, unknown>> {
    const resolved = await this.rbacPermissions.resolveEffectiveAccess(
      principal.schoolId,
      principal.userId,
      principal.activeRole,
    );
    const permSet = new Set(resolved.permissions);

    const allowedItems = INSTITUTIONAL_REPORT_CATALOG.filter((item) => {
      const requiredAny = resolveReportTemplatePermissions(item.templateName);
      return requiredAny.some((perm) => permSet.has(perm));
    });

    return {
      success: true,
      total: allowedItems.length,
      data: allowedItems,
    };
  }

  @Post('generate-direct')
  @RequireAnyPermission(...ANY_REPORT_PERMISSION)
  @ApiOperation({
    summary:
      'Generar y descargar de inmediato un reporte oficial (PDF, XLSX, CSV, HTML, DOCX)',
    description:
      'Valida el permiso RBAC específico de la plantilla y ejecuta el motor nativo cloud (Gotenberg 8 + ExcelJS) bajo RLS estricto del `schoolId` del JWT.',
  })
  @ApiResponse({
    status: 201,
    description: 'Archivo binario del reporte generado exitosamente.',
  })
  async generateDirect(
    @CurrentUser() principal: ActiveTenantContext,
    @Body() dto: EnqueueJasperReportRequestDto,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<StreamableFile> {
    const requiredPerms = resolveReportTemplatePermissions(dto.templateName);
    await this.rbacPermissions.assertAnyPermission(
      principal.schoolId,
      principal.userId,
      principal.activeRole,
      requiredPerms,
      `No cuentas con permiso para generar la plantilla '${dto.templateName}'.`,
    );

    const generated = await this.reportGenerator.generateFromTemplate({
      schoolId: principal.schoolId,
      requestedByUserId: principal.userId,
      requestedByFullName: principal.fullName,
      templateName: dto.templateName,
      outputFormat: dto.outputFormat,
      parameters: dto.parameters ?? {},
    });

    const safeFileName = generated.fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    reply.header('Content-Type', generated.mimeType);
    reply.header(
      'Content-Disposition',
      `attachment; filename="${safeFileName}"`,
    );
    reply.header('Cache-Control', 'no-store');

    return new StreamableFile(generated.buffer);
  }

  @Post('enqueue')
  @RequireAnyPermission(...ANY_REPORT_PERMISSION)
  @ApiOperation({
    summary:
      'Encolar generación asíncrona de reporte institucional (BullMQ -> S3)',
    description:
      'Valida el permiso RBAC de la plantilla y encola en BullMQ la generación derivando `schoolId` y `requestedByUserId` exclusivamente desde el JWT.',
  })
  @ApiResponse({
    status: 201,
    description: 'Trabajo de generación de reporte encolado exitosamente.',
  })
  async enqueueReport(
    @CurrentUser() principal: ActiveTenantContext,
    @Body() dto: EnqueueJasperReportRequestDto,
  ): Promise<Record<string, unknown>> {
    const requiredPerms = resolveReportTemplatePermissions(dto.templateName);
    await this.rbacPermissions.assertAnyPermission(
      principal.schoolId,
      principal.userId,
      principal.activeRole,
      requiredPerms,
      `No cuentas con permiso para encolar la plantilla '${dto.templateName}'.`,
    );

    const payload: JasperReportJobPayload = {
      schoolId: String(principal.schoolId),
      requestedByUserId: String(principal.userId),
      requestedByFullName: principal.fullName,
      templateName: dto.templateName,
      outputFormat: dto.outputFormat,
      parameters: dto.parameters ?? {},
    };

    const job = await this.reportsQueue.add('generate-jasper-report', payload, {
      removeOnComplete: 100,
      removeOnFail: 200,
      attempts: 2,
    });

    return {
      success: true,
      jobId: job.id,
      queue: JASPER_REPORTS_QUEUE,
      status: 'QUEUED',
    };
  }

  @Get('jobs/:jobId')
  @RequireAnyPermission(...ANY_REPORT_PERMISSION)
  @ApiOperation({
    summary:
      'Consultar estado de reporte en BullMQ y obtener URL prefirmada S3',
    description:
      'Valida estrictamente que el job pertenezca al `schoolId` del JWT y al alcance RBAC del usuario autenticado.',
  })
  @ApiParam({ name: 'jobId', example: '1' })
  @ApiResponse({
    status: 200,
    description: 'Estado actual del job y URL de descarga si fue completado.',
  })
  async getJobStatus(
    @CurrentUser() principal: ActiveTenantContext,
    @Param('jobId') jobId: string,
  ): Promise<Record<string, unknown>> {
    const job = await this.reportsQueue.getJob(jobId);

    // Ocultar existencia de jobs inexistentes o de otros colegios (prevencion IDOR/enumeracion)
    if (!job || String(job.data?.schoolId) !== String(principal.schoolId)) {
      throw new ResourceNotFoundException('ReportJob', jobId);
    }

    // Validar que el usuario tenga permiso para la plantilla solicitada o sea quien la encoló
    if (String(job.data?.requestedByUserId) !== String(principal.userId)) {
      const canReadInstitutional = await this.rbacPermissions.hasAnyPermission(
        principal.schoolId,
        principal.userId,
        principal.activeRole,
        [
          RBAC_PERMISSIONS.REPORTS_ACADEMIC_GENERATE,
          RBAC_PERMISSIONS.REPORTS_CERTIFICATES_GENERATE,
          RBAC_PERMISSIONS.REPORTS_DIRECTORY_GENERATE,
        ],
      );
      if (!canReadInstitutional) {
        throw new ResourceNotFoundException('ReportJob', jobId);
      }
    }

    const state = await job.getState();
    let downloadUrl: string | null = null;

    if (state === 'completed' && job.returnvalue?.fileId) {
      const presigned =
        await this.manageCloudFilesUseCase.getPresignedDownloadUrl(
          principal.schoolId,
          BigInt(job.returnvalue.fileId),
        );
      downloadUrl = presigned.presignedDownload.url;
    }

    return {
      success: true,
      jobId: job.id,
      state,
      result: job.returnvalue ?? null,
      downloadUrl,
    };
  }
}
