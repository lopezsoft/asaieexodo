import { InjectQueue } from '@nestjs/bullmq';
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Queue } from 'bullmq';
import { GenerateJasperReportInput } from '../../../../shared/application/ports/report-generator.port';
import { JASPER_REPORTS_QUEUE } from '../queues/jasper-report.processor';

@ApiTags('JasperReports Engine')
@ApiBearerAuth('jwt-auth')
@Controller('reports')
export class ReportingController {
  constructor(
    @InjectQueue(JASPER_REPORTS_QUEUE)
    private readonly reportsQueue: Queue,
  ) {}

  @Post('enqueue')
  @ApiOperation({
    summary: 'Encolar generación asíncrona de reporte JasperReports (.jrxml / .jasper)',
    description:
      'Encola en BullMQ (Redis 7.4) la ejecución de una plantilla institucional `.jrxml` / `.jasper` preservando el 100% de compatibilidad con los boletines, actas y certificados de ASAIE ÉXODO.',
  })
  @ApiResponse({
    status: 201,
    description: 'Trabajo de generación de reporte encolado exitosamente.',
  })
  async enqueueReport(
    @Body() body: GenerateJasperReportInput,
  ): Promise<Record<string, unknown>> {
    const job = await this.reportsQueue.add('generate-jasper-report', body, {
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
    summary: 'Consultar estado de generación de reporte Jasper en BullMQ',
    description:
      'Retorna el estado actual (`waiting`, `active`, `completed`, `failed`) y el resultado del trabajo de generación PDF/XLSX.',
  })
  @ApiResponse({
    status: 200,
    description: 'Estado actual del job de reporte.',
  })
  async getJobStatus(
    @Param('jobId') jobId: string,
  ): Promise<Record<string, unknown>> {
    const job = await this.reportsQueue.getJob(jobId);
    if (!job) {
      return {
        success: false,
        status: 'NOT_FOUND',
      };
    }

    const state = await job.getState();
    return {
      success: true,
      jobId: job.id,
      state,
      result: job.returnvalue ?? null,
    };
  }
}
