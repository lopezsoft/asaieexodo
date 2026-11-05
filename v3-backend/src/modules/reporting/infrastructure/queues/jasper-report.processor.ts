import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import {
  GenerateJasperReportInput,
  ReportGeneratorPort,
} from '../../../../shared/application/ports/report-generator.port';
import { SmartLoggerService } from '../../../../shared/infrastructure/logging/smart-logger.service';

export const JASPER_REPORTS_QUEUE = 'jasper-reports';

@Processor(JASPER_REPORTS_QUEUE)
export class JasperReportQueueProcessor extends WorkerHost {
  constructor(
    private readonly reportGenerator: ReportGeneratorPort,
    private readonly logger: SmartLoggerService,
  ) {
    super();
  }

  async process(
    job: Job<GenerateJasperReportInput>,
  ): Promise<{ fileName: string; mimeType: string; sizeBytes: number }> {
    this.logger.log('Procesando reporte oficial en cola BullMQ', {
      jobId: job.id,
      schoolId: String(job.data.schoolId),
      templateName: job.data.templateName,
    });

    const generated = await this.reportGenerator.generateFromTemplate({
      ...job.data,
      schoolId: BigInt(job.data.schoolId),
      requestedByUserId: BigInt(job.data.requestedByUserId),
    });

    return {
      fileName: generated.fileName,
      mimeType: generated.mimeType,
      sizeBytes: generated.buffer.byteLength,
    };
  }
}
