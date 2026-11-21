import { BullRegistrar, getQueueToken } from '@nestjs/bullmq';
import { ValidationPipe } from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import * as net from 'node:net';
import { AppModule } from '../../app.module';
import { GlobalExceptionFilter } from '../../shared/infrastructure/http/filters/global-exception.filter';
import { SmartLoggerService } from '../../shared/infrastructure/logging/smart-logger.service';
import { JASPER_REPORTS_QUEUE } from '../reporting/infrastructure/queues/jasper-report.processor';
import { ManagePromotionUseCase } from './application/use-cases/manage-promotion.use-case';

function isTcpOpen(host: string, port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(800);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
}

describe('Sprint 6 — Promotion, Final Book, Returning Students & Year Closing (RLS)', () => {
  let app: NestFastifyApplication;
  let moduleRef: TestingModule;
  let postgresAvailable = false;

  beforeAll(async () => {
    const dbHost = process.env.DB_HOST ?? '127.0.0.1';
    const dbPort = Number(process.env.DB_PORT ?? '5434');
    const redisHost = process.env.REDIS_HOST ?? '127.0.0.1';
    const redisPort = Number(process.env.REDIS_PORT ?? '6384');

    postgresAvailable = await isTcpOpen(dbHost, dbPort);
    const redisAvailable = await isTcpOpen(redisHost, redisPort);

    const builder = Test.createTestingModule({ imports: [AppModule] });
    if (!redisAvailable) {
      builder
        .overrideProvider(BullRegistrar)
        .useValue({ onModuleInit: () => undefined, register: () => undefined })
        .overrideProvider(getQueueToken(JASPER_REPORTS_QUEUE))
        .useValue({
          on: jest.fn(),
          add: jest.fn(),
          getJob: jest.fn(),
          close: jest.fn().mockResolvedValue(undefined),
        });
    }

    moduleRef = await builder.compile();
    app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new GlobalExceptionFilter(app.get(SmartLoggerService)));
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('rejects unauthenticated requests to promotion endpoints with 401', async () => {
    const fastify = app.getHttpAdapter().getInstance();
    for (const url of [
      '/api/v1/promotion/statuses',
      '/api/v1/promotion/records',
      '/api/v1/promotion/certificate-headers',
    ]) {
      const res = await fastify.inject({ method: 'GET', url });
      expect(res.statusCode).toBe(401);
    }
  });

  it('lists promotion statuses and persists certificate headers under RLS', async () => {
    if (!postgresAvailable) {
      return;
    }

    const useCase = moduleRef.get(ManagePromotionUseCase);
    const statuses = await useCase.listPromotionStatuses();
    expect(statuses.length).toBeGreaterThanOrEqual(6);

    const schoolId = 1n;
    const saved = await useCase.updateCertificateHeaders(schoolId, {
      academicYear: 2026,
      certificateSettings: {
        headerTitle: 'CERTIFICADO DE ESTUDIOS OFICIAL',
        resolutionText: 'Aprobado según Resolución MEN',
      },
      graduationActSettings: {
        actPrefix: 'ACTA-PROM-2026',
      },
    });
    expect(saved.academicYear).toBe(2026);
    expect(saved.certificateSettings['headerTitle']).toBe(
      'CERTIFICADO DE ESTUDIOS OFICIAL',
    );

    const readBack = await useCase.getCertificateHeaders(schoolId, 2026);
    expect(readBack.graduationActSettings['actPrefix']).toBe('ACTA-PROM-2026');

    const finalBook = await useCase.generateFinalBook(schoolId, {
      academicYear: 2026,
      actNumber: 'ACTA-TEST-2026',
    });
    expect(finalBook.processedCount).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(finalBook.records)).toBe(true);
  });
});
