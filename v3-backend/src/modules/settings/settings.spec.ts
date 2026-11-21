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

describe('Sprint 3 — Institutional Settings & Academic Configuration (RLS)', () => {
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

  it('rejects unauthenticated requests to settings endpoints with 401', async () => {
    const fastify = app.getHttpAdapter().getInstance();
    for (const url of [
      '/api/v1/settings/academic-years',
      '/api/v1/settings/periods',
      '/api/v1/settings/dimensions',
      '/api/v1/settings/observer/templates',
      '/api/v1/settings/branding',
      '/api/v1/settings/modules',
    ]) {
      const res = await fastify.inject({ method: 'GET', url });
      expect(res.statusCode).toBe(401);
    }
  });

  it('executes live CRUD for GradeGroups, Dimensions/Columns, Observer Templates and Branding under RLS', async () => {
    if (!postgresAvailable) {
      return;
    }

    const fastify = app.getHttpAdapter().getInstance();
    const loginRes = await fastify.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: {
        username: 'admin.comunidad',
        password: process.env.BOOTSTRAP_ADMIN_PASSWORD ?? 'Asaie2026*',
      },
    });
    expect(loginRes.statusCode).toBe(200);
    const { accessToken } = JSON.parse(loginRes.body).data as {
      accessToken: string;
    };
    const headers = { authorization: `Bearer ${accessToken}` };
    const suffix = Date.now().toString().slice(-5);

    // 1. Grupo de grados + Regla de evaluación
    const ggRes = await fastify.inject({
      method: 'POST',
      url: '/api/v1/settings/grade-groups',
      headers,
      payload: { name: `Grupo Test ${suffix}`, isCycleEnd: false },
    });
    expect(ggRes.statusCode).toBe(201);
    const ggId = JSON.parse(ggRes.body).data.id as number;

    const ruleRes = await fastify.inject({
      method: 'POST',
      url: '/api/v1/settings/grading-rules',
      headers,
      payload: {
        academicYear: 2026,
        gradeGroupId: ggId,
        decimalsCount: 2,
        minPassingScore: 3.0,
        maxRecoveryScore: 3.5,
      },
    });
    expect(ruleRes.statusCode).toBe(200);

    // 2. Dimensión + Columna #1
    const dimRes = await fastify.inject({
      method: 'POST',
      url: '/api/v1/settings/dimensions',
      headers,
      payload: {
        academicYear: 2026,
        gradeGroupId: ggId,
        dimensionCode: 9,
        name: `Dimensión Test ${suffix}`,
        abbreviation: 'TST',
        weightPercentage: 30,
      },
    });
    expect(dimRes.statusCode).toBe(201);
    const dimId = JSON.parse(dimRes.body).data.id as number;

    const colRes = await fastify.inject({
      method: 'POST',
      url: `/api/v1/settings/dimensions/${dimId}/columns`,
      headers,
      payload: { columnNumber: 1, label: 'Taller 1', weightPercentage: 50 },
    });
    expect(colRes.statusCode).toBe(201);

    // 3. Plantilla de observador + Sección + Criterio
    const tplRes = await fastify.inject({
      method: 'POST',
      url: '/api/v1/settings/observer/templates',
      headers,
      payload: { name: `Modelo Test ${suffix}`, isActive: true },
    });
    expect(tplRes.statusCode).toBe(201);
    const tplId = JSON.parse(tplRes.body).data.id as number;

    const secRes = await fastify.inject({
      method: 'POST',
      url: `/api/v1/settings/observer/templates/${tplId}/sections`,
      headers,
      payload: { title: 'Convivencia Escolar', isCoexistenceSection: true },
    });
    expect(secRes.statusCode).toBe(201);
    const secId = JSON.parse(secRes.body).data.id as number;

    const critRes = await fastify.inject({
      method: 'POST',
      url: `/api/v1/settings/observer/sections/${secId}/criteria`,
      headers,
      payload: { description: 'Respeta a sus compañeros y docentes' },
    });
    expect(critRes.statusCode).toBe(201);

    // 4. Branding, módulos y limpieza segura de notas en cero
    const brandingRes = await fastify.inject({
      method: 'GET',
      url: '/api/v1/settings/branding',
      headers,
    });
    expect(brandingRes.statusCode).toBe(200);

    const modulesRes = await fastify.inject({
      method: 'GET',
      url: '/api/v1/settings/modules',
      headers,
    });
    expect(modulesRes.statusCode).toBe(200);

    const cleanupRes = await fastify.inject({
      method: 'POST',
      url: '/api/v1/settings/cleanup-zero-grades',
      headers,
      payload: { academicYear: 2026 },
    });
    expect(cleanupRes.statusCode).toBe(200);

    // 5. Limpieza de registros de prueba
    await fastify.inject({
      method: 'DELETE',
      url: `/api/v1/settings/observer/templates/${tplId}`,
      headers,
    });
    await fastify.inject({
      method: 'DELETE',
      url: `/api/v1/settings/dimensions/${dimId}`,
      headers,
    });
    await fastify.inject({
      method: 'DELETE',
      url: `/api/v1/settings/grade-groups/${ggId}`,
      headers,
    });
    await fastify.inject({
      method: 'POST',
      url: '/api/v1/auth/logout',
      headers,
    });
  });
});
