import { Module } from '@nestjs/common';
import { IamModule } from '../iam/iam.module';
import { MigrateLegacySchoolsUseCase } from './application/use-cases/migrate-legacy-schools.use-case';
import { MigrationController } from './infrastructure/http/migration.controller';

@Module({
  imports: [IamModule],
  controllers: [MigrationController],
  providers: [MigrateLegacySchoolsUseCase],
  exports: [MigrateLegacySchoolsUseCase],
})
export class MigrationModule {}
