import { Module } from '@nestjs/common';
import { RecordStudentGradeUseCase } from './application/use-cases/record-student-grade.use-case';
import { AcademicGradeRepositoryPort } from './domain/ports/academic-grade.repository.port';
import { GradingController } from './infrastructure/http/grading.controller';
import { PostgresAcademicGradeRepository } from './infrastructure/persistence/postgres-academic-grade.repository';

@Module({
  controllers: [GradingController],
  providers: [
    RecordStudentGradeUseCase,
    {
      provide: AcademicGradeRepositoryPort,
      useClass: PostgresAcademicGradeRepository,
    },
  ],
  exports: [RecordStudentGradeUseCase, AcademicGradeRepositoryPort],
})
export class GradingModule {}
