import { Module } from '@nestjs/common';
import { ManageCloudFilesUseCase } from './application/use-cases/manage-cloud-files.use-case';
import { CLOUD_FILE_REPOSITORY_PORT } from './domain/ports/cloud-file.repository.port';
import { StorageController } from './infrastructure/http/storage.controller';
import { PostgresCloudFileRepository } from './infrastructure/persistence/postgres-cloud-file.repository';

@Module({
  controllers: [StorageController],
  providers: [
    ManageCloudFilesUseCase,
    {
      provide: CLOUD_FILE_REPOSITORY_PORT,
      useClass: PostgresCloudFileRepository,
    },
  ],
  exports: [ManageCloudFilesUseCase],
})
export class StorageModule {}
