import { Module } from '@nestjs/common';
import { IamModule } from '../iam/iam.module';
import { ManageAdministrationUseCase } from './application/use-cases/manage-administration.use-case';
import { AdministrationRepositoryPort } from './domain/ports/administration.repository.port';
import { AdministrationController } from './infrastructure/http/administration.controller';
import { PostgresAdministrationRepository } from './infrastructure/persistence/postgres-administration.repository';

@Module({
  imports: [IamModule],
  controllers: [AdministrationController],
  providers: [
    ManageAdministrationUseCase,
    {
      provide: AdministrationRepositoryPort,
      useClass: PostgresAdministrationRepository,
    },
  ],
  exports: [ManageAdministrationUseCase],
})
export class AdministrationModule {}
