import helmet from '@fastify/helmet';
import multipart from '@fastify/multipart';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './shared/infrastructure/http/filters/global-exception.filter';
import { setupOpenApiSwagger } from './shared/infrastructure/http/swagger/openapi-swagger.config';
import { SmartLoggerService } from './shared/infrastructure/logging/smart-logger.service';
import { MAX_CLOUD_FILE_SIZE_BYTES } from './shared/infrastructure/storage/aws-s3-storage.adapter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: false,
      trustProxy: true,
      bodyLimit: 15 * 1024 * 1024, // Soporta cargas Base64 de hasta 10 MiB
    }),
    {
      bufferLogs: true,
    },
  );

  const smartLogger = app.get(SmartLoggerService);
  app.useLogger(smartLogger);

  const configService = app.get(ConfigService);
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');
  const isProduction = nodeEnv === 'production';

  // Hardening de encabezados HTTP con @fastify/helmet
  await app.register(helmet as unknown as Parameters<typeof app.register>[0], {
    contentSecurityPolicy: isProduction ? undefined : false,
    crossOriginResourcePolicy: { policy: 'same-site' },
  });

  // Soporte nativo de carga de archivos multipart/form-data (@fastify/multipart)
  await app.register(
    multipart as unknown as Parameters<typeof app.register>[0],
    {
      limits: {
        fileSize: MAX_CLOUD_FILE_SIZE_BYTES,
        files: 5,
        fields: 20,
      },
    },
  );

  const rawCorsOrigin = configService.get<string>(
    'CORS_ORIGIN',
    isProduction ? '' : 'http://localhost:7200',
  );
  const allowedOrigins = rawCorsOrigin
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0 && origin !== '*');

  app.enableCors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : false,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type', 'X-Request-Id'],
    exposedHeaders: ['Content-Disposition'],
    maxAge: 600,
  });

  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: false,
      },
      disableErrorMessages: isProduction,
      stopAtFirstError: true,
    }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter(smartLogger));
  app.enableShutdownHooks();

  const swaggerEnabled =
    !isProduction ||
    configService.get<string>('SWAGGER_ENABLED', 'false') === 'true';
  if (swaggerEnabled) {
    setupOpenApiSwagger(app);
  }

  const port = Number(configService.get<string>('PORT', '3100'));
  const host = configService.get<string>('HOST', '0.0.0.0');

  await app.listen(port, host);
  smartLogger.log(
    `Servidor ASAIE EXODO V3 (NestJS 11 + Fastify 5 + PostgreSQL 17 pgvector + RLS) escuchando en http://${host}:${port}/api/v1`,
    {
      environment: nodeEnv,
      database: configService.get<string>('DB_NAME', 'asaie_v3_unified'),
      swaggerDocsUrl: swaggerEnabled ? `http://${host}:${port}/api/docs` : null,
    },
  );
}

void bootstrap();
