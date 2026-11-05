import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './shared/infrastructure/http/filters/global-exception.filter';
import { SmartLoggerService } from './shared/infrastructure/logging/smart-logger.service';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: false,
      trustProxy: true,
    }),
    {
      bufferLogs: true,
    },
  );

  const smartLogger = app.get(SmartLoggerService);
  app.useLogger(smartLogger);

  const configService = app.get(ConfigService);
  const corsOrigin = configService.get<string>(
    'CORS_ORIGIN',
    'http://localhost:7200',
  );

  app.enableCors({
    origin: corsOrigin.split(','),
    credentials: true,
  });

  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter(smartLogger));

  const port = Number(configService.get<string>('PORT', '3100'));
  const host = configService.get<string>('HOST', '0.0.0.0');

  await app.listen(port, host);
  smartLogger.log(
    `Servidor ASAIE EXODO V3 (NestJS + Fastify) escuchando en http://${host}:${port}/api/v1`,
    {
      environment: configService.get<string>('NODE_ENV', 'development'),
      database: configService.get<string>('DB_NAME', 'asaie_v3_unified'),
    },
  );
}

void bootstrap();
