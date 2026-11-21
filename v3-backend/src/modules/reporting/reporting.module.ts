import { BullModule, InjectQueue } from '@nestjs/bullmq';
import { Module, OnModuleInit } from '@nestjs/common';
import { Queue } from 'bullmq';
import { SmartLoggerService } from '../../shared/infrastructure/logging/smart-logger.service';
import { StorageModule } from '../storage/storage.module';
import { ReportingController } from './infrastructure/http/reporting.controller';
import {
  JASPER_REPORTS_QUEUE,
  JasperReportQueueProcessor,
} from './infrastructure/queues/jasper-report.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: JASPER_REPORTS_QUEUE,
    }),
    StorageModule,
  ],
  controllers: [ReportingController],
  providers: [JasperReportQueueProcessor],
})
export class ReportingModule implements OnModuleInit {
  constructor(
    @InjectQueue(JASPER_REPORTS_QUEUE)
    private readonly jasperQueue: Queue,
    private readonly logger: SmartLoggerService,
  ) {}

  onModuleInit(): void {
    if (typeof this.jasperQueue?.on === 'function') {
      this.jasperQueue.on('error', (error: Error) => {
        this.logger.warn('Error en cola BullMQ de reportes JasperReports', {
          queue: JASPER_REPORTS_QUEUE,
          error: error.message,
        });
      });
    }
  }
}
