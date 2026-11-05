import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GradingModule } from './modules/grading/grading.module';
import { IamModule } from './modules/iam/iam.module';
import { MigrationModule } from './modules/migration/migration.module';
import { ReportingModule } from './modules/reporting/reporting.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('REDIS_HOST', '127.0.0.1'),
          port: Number(config.get<string>('REDIS_PORT', '6384')),
        },
      }),
    }),
    SharedModule,
    TenantModule,
    IamModule,
    GradingModule,
    ReportingModule,
    MigrationModule,
  ],
})
export class AppModule {}
