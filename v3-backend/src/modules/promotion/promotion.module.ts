import { Module } from '@nestjs/common';
import { ManagePromotionUseCase } from './application/use-cases/manage-promotion.use-case';
import { PromotionRepositoryPort } from './domain/ports/promotion.repository.port';
import { PromotionController } from './infrastructure/http/promotion.controller';
import { PostgresPromotionRepository } from './infrastructure/persistence/postgres-promotion.repository';

@Module({
  controllers: [PromotionController],
  providers: [
    ManagePromotionUseCase,
    {
      provide: PromotionRepositoryPort,
      useClass: PostgresPromotionRepository,
    },
  ],
  exports: [ManagePromotionUseCase],
})
export class PromotionModule {}
