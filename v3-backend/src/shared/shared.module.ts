import { Global, Module } from '@nestjs/common';
import { TenantContextService } from './application/context/tenant-context.service';
import { MailSenderPort } from './application/ports/mail-sender.port';
import { ReportGeneratorPort } from './application/ports/report-generator.port';
import { PostgresRlsService } from './infrastructure/database/postgres-rls.service';
import { SmartLoggerService } from './infrastructure/logging/smart-logger.service';
import { NodemailerSmtpMailAdapter } from './infrastructure/mail/nodemailer-smtp.adapter';
import { JasperReportAdapter } from './infrastructure/reporting/jasper-report.adapter';

@Global()
@Module({
  providers: [
    SmartLoggerService,
    TenantContextService,
    PostgresRlsService,
    {
      provide: ReportGeneratorPort,
      useClass: JasperReportAdapter,
    },
    {
      provide: MailSenderPort,
      useClass: NodemailerSmtpMailAdapter,
    },
  ],
  exports: [
    SmartLoggerService,
    TenantContextService,
    PostgresRlsService,
    ReportGeneratorPort,
    MailSenderPort,
  ],
})
export class SharedModule {}
