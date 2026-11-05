import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
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
  ],
  controllers: [ReportingController],
  providers: [JasperReportQueueProcessor],
})
export class ReportingModule {}
