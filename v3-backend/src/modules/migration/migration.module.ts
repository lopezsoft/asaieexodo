import { Module } from '@nestjs/common';
import { IamModule } from '../iam/iam.module';
import { MigrateLegacySchoolEtlUseCase } from './application/use-cases/migrate-legacy-school-etl.use-case';
import { MigrateLegacySchoolsUseCase } from './application/use-cases/migrate-legacy-schools.use-case';
import { MigrationController } from './infrastructure/http/migration.controller';
import { LegacyMysqlCliReader } from './infrastructure/mysql/legacy-mysql-cli.reader';

@Module({
  imports: [IamModule],
  controllers: [MigrationController],
  providers: [
    LegacyMysqlCliReader,
    MigrateLegacySchoolsUseCase,
    MigrateLegacySchoolEtlUseCase,
  ],
  exports: [MigrateLegacySchoolsUseCase, MigrateLegacySchoolEtlUseCase],
})
export class MigrationModule {}
