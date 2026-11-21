import { InjectQueue } from '@nestjs/bullmq';
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
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
import { ActiveTenantContext } from '../../../../shared/application/context/tenant-context.service';
import { ReportOutputFormat } from '../../../../shared/application/ports/report-generator.port';
import { ResourceNotFoundException } from '../../../../shared/domain/exceptions/resource-not-found.exception';
import {
  CurrentUser,
  Roles,
} from '../../../../shared/infrastructure/http/decorators/security.decorators';
import { CommunityRole } from '../../../iam/domain/enums/community-role.enum';
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

export class EnqueueJasperReportRequestDto {
  @ApiProperty({
    example: 'boletin_carta_areas',
    description: 'Nombre de la plantilla Jasper compilada (solo alfanumérico, guiones y guion bajo)',
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
    description: 'Parámetros tipados del reporte (parámetros reservados como P_SCHOOL_ID o SQL_PARAM están bloqueados)',
  })
  @IsOptional()
  @IsObject()
  parameters?: Record<string, string | number | boolean>;
}

@ApiTags('JasperReports Engine')
@ApiBearerAuth('jwt-auth')
@Controller('reports')
export class ReportingController {
  constructor(
    @InjectQueue(JASPER_REPORTS_QUEUE)
    private readonly reportsQueue: Queue<
      JasperReportJobPayload,
      JasperReportJobResult
    >,
    private readonly manageCloudFilesUseCase: ManageCloudFilesUseCase,
  ) {}

  @Post('enqueue')
  @Roles(
    CommunityRole.SUPER_ADMIN,
    CommunityRole.SCHOOL_ADMIN,
    CommunityRole.RECTOR,
    CommunityRole.COORDINATOR,
    CommunityRole.SECRETARY,
    CommunityRole.TEACHER,
  )
  @ApiOperation({
    summary: 'Encolar generación asíncrona de reporte JasperReports (.jasper -> S3)',
    description:
      'Encola en BullMQ la generación del reporte institucional derivando `schoolId` y `requestedByUserId` exclusivamente desde el JWT verificado.',
  })
  @ApiResponse({
    status: 201,
    description: 'Trabajo de generación de reporte encolado exitosamente.',
  })
  async enqueueReport(
    @CurrentUser() principal: ActiveTenantContext,
    @Body() dto: EnqueueJasperReportRequestDto,
  ): Promise<Record<string, unknown>> {
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
  @ApiOperation({
    summary: 'Consultar estado de reporte Jasper en BullMQ y obtener URL prefirmada S3',
    description:
      'Valida estrictamente que el job pertenezca al `schoolId` del JWT autenticado. Cuando el estado es `completed`, genera una URL temporal prefirmada (GET) de descarga desde AWS S3.',
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
