import { Module } from '@nestjs/common';
import { ManageSchoolCrmUseCase } from './application/use-cases/manage-school-crm.use-case';
import { EMBEDDING_GENERATOR_PORT } from './domain/ports/embedding-generator.port';
import { SCHOOL_CRM_REPOSITORY_PORT } from './domain/ports/school-crm.repository.port';
import { ConfigurableEmbeddingAdapter } from './infrastructure/embeddings/configurable-embedding.adapter';
import { CrmController } from './infrastructure/http/crm.controller';
import { PostgresSchoolCrmRepository } from './infrastructure/persistence/postgres-school-crm.repository';

@Module({
  controllers: [CrmController],
  providers: [
    ManageSchoolCrmUseCase,
    {
      provide: SCHOOL_CRM_REPOSITORY_PORT,
      useClass: PostgresSchoolCrmRepository,
    },
    {
      provide: EMBEDDING_GENERATOR_PORT,
      useClass: ConfigurableEmbeddingAdapter,
    },
  ],
  exports: [ManageSchoolCrmUseCase],
})
export class CrmModule {}
