import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MigrateLegacySchoolsUseCase } from './modules/migration/application/use-cases/migrate-legacy-schools.use-case';
import { SmartLoggerService } from './shared/infrastructure/logging/smart-logger.service';

async function runBootstrapNineSchools(): Promise<void> {
  const appContext = await NestFactory.createApplicationContext(AppModule, {
    bufferLogs: true,
  });

  const logger = appContext.get(SmartLoggerService);
  appContext.useLogger(logger);

  try {
    const migrationUseCase = appContext.get(MigrateLegacySchoolsUseCase);
    const result = await migrationUseCase.executeBootstrap();
    logger.log('Migracion inicial de los 9 colegios completada con exito', result);
  } finally {
    await appContext.close();
  }
}

void runBootstrapNineSchools();
