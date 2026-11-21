import { Module } from '@nestjs/common';
import { ManageAcademicUseCase } from './application/use-cases/manage-academic.use-case';
import { AcademicRepositoryPort } from './domain/ports/academic.repository.port';
import { AcademicController } from './infrastructure/http/academic.controller';
import { PostgresAcademicRepository } from './infrastructure/persistence/postgres-academic.repository';

@Module({
  controllers: [AcademicController],
  providers: [
    ManageAcademicUseCase,
    {
      provide: AcademicRepositoryPort,
      useClass: PostgresAcademicRepository,
    },
  ],
  exports: [ManageAcademicUseCase],
})
export class AcademicModule {}
