import { Module } from '@nestjs/common';
import { AcademicModule } from '../academic/academic.module';
import { ManagePromotionUseCase } from './application/use-cases/manage-promotion.use-case';
import { PromotionRepositoryPort } from './domain/ports/promotion.repository.port';
import { PromotionEvaluationEngineService } from './domain/services/promotion-evaluation-engine.service';
import { PromotionController } from './infrastructure/http/promotion.controller';
import { PostgresPromotionRepository } from './infrastructure/persistence/postgres-promotion.repository';

@Module({
  imports: [AcademicModule],
  controllers: [PromotionController],
  providers: [
    PromotionEvaluationEngineService,
    ManagePromotionUseCase,
    {
      provide: PromotionRepositoryPort,
      useClass: PostgresPromotionRepository,
    },
  ],
  exports: [ManagePromotionUseCase, PromotionEvaluationEngineService],
})
export class PromotionModule {}
