import { Module } from '@nestjs/common';
import { ManagePortalUseCase } from './application/use-cases/manage-portal.use-case';
import { ManageTeacherExtendedUseCase } from './application/use-cases/manage-teacher-extended.use-case';
import { PortalRepositoryPort } from './domain/ports/portal.repository.port';
import { TeacherExtendedRepositoryPort } from './domain/ports/teacher-extended.repository.port';
import { StudentPortalController } from './infrastructure/http/student-portal.controller';
import { TeacherExtendedController } from './infrastructure/http/teacher-extended.controller';
import { TeacherPortalController } from './infrastructure/http/teacher-portal.controller';
import { PostgresPortalRepository } from './infrastructure/persistence/postgres-portal.repository';
import { PostgresTeacherExtendedRepository } from './infrastructure/persistence/postgres-teacher-extended.repository';

@Module({
  controllers: [
    TeacherPortalController,
    TeacherExtendedController,
    StudentPortalController,
  ],
  providers: [
    ManagePortalUseCase,
    ManageTeacherExtendedUseCase,
    {
      provide: PortalRepositoryPort,
      useClass: PostgresPortalRepository,
    },
    {
      provide: TeacherExtendedRepositoryPort,
      useClass: PostgresTeacherExtendedRepository,
    },
  ],
  exports: [ManagePortalUseCase, ManageTeacherExtendedUseCase],
})
export class PortalModule {}
