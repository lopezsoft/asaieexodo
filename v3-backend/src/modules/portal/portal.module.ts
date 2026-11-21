import { Module } from '@nestjs/common';
import { ManagePortalUseCase } from './application/use-cases/manage-portal.use-case';
import { PortalRepositoryPort } from './domain/ports/portal.repository.port';
import { StudentPortalController } from './infrastructure/http/student-portal.controller';
import { TeacherPortalController } from './infrastructure/http/teacher-portal.controller';
import { PostgresPortalRepository } from './infrastructure/persistence/postgres-portal.repository';

@Module({
  controllers: [TeacherPortalController, StudentPortalController],
  providers: [
    ManagePortalUseCase,
    {
      provide: PortalRepositoryPort,
      useClass: PostgresPortalRepository,
    },
  ],
  exports: [ManagePortalUseCase],
})
export class PortalModule {}
