import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MigrateLegacySchoolEtlUseCase } from './modules/migration/application/use-cases/migrate-legacy-school-etl.use-case';
import { SmartLoggerService } from './shared/infrastructure/logging/smart-logger.service';

async function runLegacySchoolEtl(): Promise<void> {
  const appContext = await NestFactory.createApplicationContext(AppModule, {
    bufferLogs: true,
  });

  const logger = appContext.get(SmartLoggerService);
  appContext.useLogger(logger);

  try {
    const etlUseCase = appContext.get(MigrateLegacySchoolEtlUseCase);
    const report = await etlUseCase.executeFullSchoolMigration();
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  } finally {
    await appContext.close();
  }
  // Finalizar explícitamente el proceso CLI para liberar sockets inactivos de colas Redis/BullMQ
  process.exit(0);
}

runLegacySchoolEtl().catch((err: unknown) => {
  process.stderr.write(
    `[ETL_FATAL] ${err instanceof Error ? err.stack ?? err.message : String(err)}\n`,
  );
  process.exit(1);
});
