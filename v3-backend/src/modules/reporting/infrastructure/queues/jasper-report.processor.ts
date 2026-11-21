import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import {
  ReportGeneratorPort,
  ReportOutputFormat,
} from '../../../../shared/application/ports/report-generator.port';
import { SmartLoggerService } from '../../../../shared/infrastructure/logging/smart-logger.service';
import { ManageCloudFilesUseCase } from '../../../storage/application/use-cases/manage-cloud-files.use-case';

export const JASPER_REPORTS_QUEUE = 'jasper-reports';

export interface JasperReportJobPayload {
  readonly schoolId: string;
  readonly requestedByUserId: string;
  readonly requestedByFullName: string;
  readonly templateName: string;
  readonly outputFormat: ReportOutputFormat;
  readonly parameters: Record<string, string | number | boolean>;
}

export interface JasperReportJobResult {
  readonly schoolId: string;
  readonly fileId: string;
  readonly fileUuid: string;
  readonly fileName: string;
  readonly mimeType: string;
  readonly sizeBytes: number;
}

@Processor(JASPER_REPORTS_QUEUE)
export class JasperReportQueueProcessor extends WorkerHost {
  constructor(
    private readonly reportGenerator: ReportGeneratorPort,
    private readonly manageCloudFilesUseCase: ManageCloudFilesUseCase,
    private readonly logger: SmartLoggerService,
  ) {
    super();
  }

  async process(
    job: Job<JasperReportJobPayload>,
  ): Promise<JasperReportJobResult> {
    const schoolId = BigInt(job.data.schoolId);
    const requestedByUserId = BigInt(job.data.requestedByUserId);

    this.logger.log('Procesando reporte oficial en cola BullMQ', {
      jobId: job.id,
      schoolId: job.data.schoolId,
      templateName: job.data.templateName,
      outputFormat: job.data.outputFormat,
    });

    const generated = await this.reportGenerator.generateFromTemplate({
      schoolId,
      requestedByUserId,
      requestedByFullName: job.data.requestedByFullName,
      templateName: job.data.templateName,
      outputFormat: job.data.outputFormat,
      parameters: job.data.parameters ?? {},
    });

    // Persistir el archivo generado en AWS S3 + cloud_files bajo RLS para su descarga segura
    const storedFile = await this.manageCloudFilesUseCase.uploadSchoolFile({
      schoolId,
      uploadedByUserId: requestedByUserId,
      category: 'JASPER_REPORTS',
      originalFileName: generated.fileName,
      description: `Reporte oficial JasperReports: ${job.data.templateName}`,
      mimeType: generated.mimeType,
      contentBuffer: generated.buffer,
      metadata: {
        jobId: String(job.id ?? ''),
        templateName: job.data.templateName,
        outputFormat: job.data.outputFormat,
      },
    });

    return {
      schoolId: job.data.schoolId,
      fileId: storedFile.id,
      fileUuid: storedFile.fileUuid,
      fileName: storedFile.fileName,
      mimeType: storedFile.mimeType,
      sizeBytes: storedFile.sizeBytes,
    };
  }

  @OnWorkerEvent('error')
  onWorkerError(error: Error): void {
    this.logger.warn('Error de conexión o ejecución en worker BullMQ de reportes', {
      queue: JASPER_REPORTS_QUEUE,
      error: error.message,
    });
  }

  @OnWorkerEvent('failed')
  onJobFailed(job: Job<JasperReportJobPayload> | undefined, error: Error): void {
    this.logger.error(
      'Fallo procesando trabajo de reporte JasperReports en cola BullMQ',
      {
        jobId: job?.id,
        schoolId: job?.data?.schoolId,
        templateName: job?.data?.templateName,
        error: error.message,
        stack: error.stack,
      },
      'JasperReportQueueProcessor',
    );
  }
}
