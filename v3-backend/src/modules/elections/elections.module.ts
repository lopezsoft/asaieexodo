import { Module } from '@nestjs/common';
import { ManageElectionsUseCase } from './application/use-cases/manage-elections.use-case';
import { ElectionsRepositoryPort } from './domain/ports/elections.repository.port';
import { ElectionsController } from './infrastructure/http/elections.controller';
import { PostgresElectionsRepository } from './infrastructure/persistence/postgres-elections.repository';

@Module({
  controllers: [ElectionsController],
  providers: [
    ManageElectionsUseCase,
    {
      provide: ElectionsRepositoryPort,
      useClass: PostgresElectionsRepository,
    },
  ],
  exports: [ManageElectionsUseCase],
})
export class ElectionsModule {}
