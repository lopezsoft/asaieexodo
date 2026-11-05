import { Module } from '@nestjs/common';
import { ManageSchoolsUseCase } from './application/use-cases/manage-schools.use-case';
import { SchoolRepositoryPort } from './domain/ports/school.repository.port';
import { TenantController } from './infrastructure/http/tenant.controller';
import { PostgresSchoolRepository } from './infrastructure/persistence/postgres-school.repository';

@Module({
  controllers: [TenantController],
  providers: [
    ManageSchoolsUseCase,
    {
      provide: SchoolRepositoryPort,
      useClass: PostgresSchoolRepository,
    },
  ],
  exports: [SchoolRepositoryPort, ManageSchoolsUseCase],
})
export class TenantModule {}
