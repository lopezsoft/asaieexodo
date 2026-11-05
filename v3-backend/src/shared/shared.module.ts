import { Global, Module } from '@nestjs/common';
import { TenantContextService } from './application/context/tenant-context.service';
import { ReportGeneratorPort } from './application/ports/report-generator.port';
import { PostgresRlsService } from './infrastructure/database/postgres-rls.service';
import { SmartLoggerService } from './infrastructure/logging/smart-logger.service';
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
  ],
  exports: [
    SmartLoggerService,
    TenantContextService,
    PostgresRlsService,
    ReportGeneratorPort,
  ],
})
export class SharedModule {}
