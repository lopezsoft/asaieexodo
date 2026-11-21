import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AdministrationModule } from './modules/administration/administration.module';
import { CatalogsModule } from './modules/catalogs/catalogs.module';
import { CrmModule } from './modules/crm/crm.module';
import { GradingModule } from './modules/grading/grading.module';
import { IamModule } from './modules/iam/iam.module';
import { MigrationModule } from './modules/migration/migration.module';
import { ReportingModule } from './modules/reporting/reporting.module';
import { StorageModule } from './modules/storage/storage.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { validateEnvironment } from './shared/infrastructure/config/environment.validation';
import { JwtAuthGuard } from './shared/infrastructure/http/guards/jwt-auth.guard';
import { RateLimitGuard } from './shared/infrastructure/http/guards/rate-limit.guard';
import { RolesGuard } from './shared/infrastructure/http/guards/roles.guard';
import { TenantContextInterceptor } from './shared/infrastructure/http/interceptors/tenant-context.interceptor';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      validate: validateEnvironment,
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const password = config.get<string>('REDIS_PASSWORD', '').trim();
        const useTls = config.get<string>('REDIS_TLS', 'false') === 'true';
        return {
          connection: {
            host: config.get<string>('REDIS_HOST', '127.0.0.1'),
            port: Number(config.get<string>('REDIS_PORT', '6384')),
            ...(password ? { password } : {}),
            ...(useTls ? { tls: {} } : {}),
            maxRetriesPerRequest: null,
          },
        };
      },
    }),
    SharedModule,
    CatalogsModule,
    AdministrationModule,
    TenantModule,
    IamModule,
    GradingModule,
    CrmModule,
    StorageModule,
    ReportingModule,
    MigrationModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RateLimitGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TenantContextInterceptor,
    },
  ],
})
export class AppModule {}
