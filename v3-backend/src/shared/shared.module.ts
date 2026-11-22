import { Global, Module } from '@nestjs/common';
import { TenantContextService } from './application/context/tenant-context.service';
import { CloudStoragePort } from './application/ports/cloud-storage.port';
import { MailSenderPort } from './application/ports/mail-sender.port';
import { ReportGeneratorPort } from './application/ports/report-generator.port';
import { PostgresRlsService } from './infrastructure/database/postgres-rls.service';
import { SmartLoggerService } from './infrastructure/logging/smart-logger.service';
import { NodemailerSmtpMailAdapter } from './infrastructure/mail/nodemailer-smtp.adapter';
import { ExcelReportBuilder } from './infrastructure/reporting/excel-report.builder';
import { HtmlReportTemplateBuilder } from './infrastructure/reporting/html-report-template.builder';
import { InstitutionalReportDataService } from './infrastructure/reporting/institutional-report-data.service';
import { JasperReportAdapter } from './infrastructure/reporting/jasper-report.adapter';
import { NativeDocumentReportAdapter } from './infrastructure/reporting/native-document-report.adapter';
import { RbacPermissionsService } from './infrastructure/rbac/rbac-permissions.service';
import { AwsS3StorageAdapter } from './infrastructure/storage/aws-s3-storage.adapter';

@Global()
@Module({
  providers: [
    SmartLoggerService,
    TenantContextService,
    PostgresRlsService,
    RbacPermissionsService,
    InstitutionalReportDataService,
    HtmlReportTemplateBuilder,
    ExcelReportBuilder,
    JasperReportAdapter,
    NativeDocumentReportAdapter,
    {
      provide: ReportGeneratorPort,
      useExisting: NativeDocumentReportAdapter,
    },
    {
      provide: MailSenderPort,
      useClass: NodemailerSmtpMailAdapter,
    },
    {
      provide: CloudStoragePort,
      useClass: AwsS3StorageAdapter,
    },
  ],
  exports: [
    SmartLoggerService,
    TenantContextService,
    PostgresRlsService,
    RbacPermissionsService,
    InstitutionalReportDataService,
    HtmlReportTemplateBuilder,
    ExcelReportBuilder,
    NativeDocumentReportAdapter,
    ReportGeneratorPort,
    MailSenderPort,
    CloudStoragePort,
  ],
})
export class SharedModule {}
