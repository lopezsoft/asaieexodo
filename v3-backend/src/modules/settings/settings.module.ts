import { Module } from '@nestjs/common';
import { ManageSettingsUseCase } from './application/use-cases/manage-settings.use-case';
import { SettingsRepositoryPort } from './domain/ports/settings.repository.port';
import { SettingsController } from './infrastructure/http/settings.controller';
import { PostgresSettingsRepository } from './infrastructure/persistence/postgres-settings.repository';

@Module({
  controllers: [SettingsController],
  providers: [
    ManageSettingsUseCase,
    {
      provide: SettingsRepositoryPort,
      useClass: PostgresSettingsRepository,
    },
  ],
  exports: [ManageSettingsUseCase],
})
export class SettingsModule {}
