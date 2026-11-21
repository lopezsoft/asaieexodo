import { Module } from '@nestjs/common';
import { IamModule } from '../iam/iam.module';
import { EnrollmentNumberingService } from './application/services/enrollment-numbering.service';
import { ManageAcademicUseCase } from './application/use-cases/manage-academic.use-case';
import { AcademicRepositoryPort } from './domain/ports/academic.repository.port';
import { AcademicController } from './infrastructure/http/academic.controller';
import { PostgresAcademicRepository } from './infrastructure/persistence/postgres-academic.repository';

@Module({
  imports: [IamModule],
  controllers: [AcademicController],
  providers: [
    EnrollmentNumberingService,
    ManageAcademicUseCase,
    {
      provide: AcademicRepositoryPort,
      useClass: PostgresAcademicRepository,
    },
  ],
  exports: [ManageAcademicUseCase, EnrollmentNumberingService],
})
export class AcademicModule {}
