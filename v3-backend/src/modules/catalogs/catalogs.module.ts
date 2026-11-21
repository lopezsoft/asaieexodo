import { Module } from '@nestjs/common';
import { GetCatalogsUseCase } from './application/use-cases/get-catalogs.use-case';
import { CatalogsRepositoryPort } from './domain/ports/catalogs.repository.port';
import { CatalogsController } from './infrastructure/http/catalogs.controller';
import { PostgresCatalogsRepository } from './infrastructure/persistence/postgres-catalogs.repository';

@Module({
  controllers: [CatalogsController],
  providers: [
    GetCatalogsUseCase,
    {
      provide: CatalogsRepositoryPort,
      useClass: PostgresCatalogsRepository,
    },
  ],
  exports: [GetCatalogsUseCase],
})
export class CatalogsModule {}
