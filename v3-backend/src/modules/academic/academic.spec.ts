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

describe('Sprints 4 & 5 — Academic Curriculum, Students, Families, Enrollments & Honor Roll (RLS)', () => {
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

  it('rejects unauthenticated requests to academic endpoints with 401', async () => {
    const fastify = app.getHttpAdapter().getInstance();
    for (const url of [
      '/api/v1/academic/areas',
      '/api/v1/academic/subjects',
      '/api/v1/academic/students',
      '/api/v1/academic/enrollments',
      '/api/v1/academic/honor-roll',
    ]) {
      const res = await fastify.inject({ method: 'GET', url });
      expect(res.statusCode).toBe(401);
    }
  });

  it('executes live CRUD for Areas, Subjects, Students, Families and Honor Roll under RLS', async () => {
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

    // 1. Área + Asignatura
    const areaRes = await fastify.inject({
      method: 'POST',
      url: '/api/v1/academic/areas',
      headers,
      payload: { name: `Área Test ${suffix}`, abbreviation: 'TST' },
    });
    expect(areaRes.statusCode).toBe(201);
    const areaId = JSON.parse(areaRes.body).data.id as number;

    const subjectRes = await fastify.inject({
      method: 'POST',
      url: '/api/v1/academic/subjects',
      headers,
      payload: {
        academicAreaId: areaId,
        name: `Asignatura Test ${suffix}`,
        abbreviation: 'ASIG',
      },
    });
    expect(subjectRes.statusCode).toBe(201);
    const subjectId = JSON.parse(subjectRes.body).data.id as number;

    // 2. Estudiante + Familiar + Vínculo
    const studentRes = await fastify.inject({
      method: 'POST',
      url: '/api/v1/academic/students',
      headers,
      payload: {
        documentTypeId: 2,
        documentNumber: `10${suffix}`,
        firstName: 'Camila',
        lastName: 'Estudiante',
      },
    });
    expect(studentRes.statusCode).toBe(201);
    const studentId = JSON.parse(studentRes.body).data.id as number;

    const familyRes = await fastify.inject({
      method: 'POST',
      url: '/api/v1/academic/families',
      headers,
      payload: {
        documentTypeId: 1,
        documentNumber: `50${suffix}`,
        fullName: 'Carlos Acudiente',
      },
    });
    expect(familyRes.statusCode).toBe(201);
    const familyId = JSON.parse(familyRes.body).data.id as number;

    const linkRes = await fastify.inject({
      method: 'POST',
      url: `/api/v1/academic/students/${studentId}/families`,
      headers,
      payload: {
        familyProfileId: familyId,
        relationshipTypeId: 1,
        isPrimaryGuardian: true,
      },
    });
    expect(linkRes.statusCode).toBe(201);

    // 3. Reporte de avance de notas + Cuadro de honor + Mayúsculas
    const reportedRes = await fastify.inject({
      method: 'GET',
      url: '/api/v1/academic/grades/reported-summary?academicYear=2026&periodNumber=1',
      headers,
    });
    expect(reportedRes.statusCode).toBe(200);

    const honorRes = await fastify.inject({
      method: 'POST',
      url: '/api/v1/academic/honor-roll/calculate',
      headers,
      payload: { academicYear: 2026, periodNumber: 1 },
    });
    expect(honorRes.statusCode).toBe(200);

    const upperRes = await fastify.inject({
      method: 'POST',
      url: '/api/v1/academic/achievements/uppercase',
      headers,
      payload: { academicYear: 2026 },
    });
    expect(upperRes.statusCode).toBe(200);

    // 4. Limpieza ordenada
    await fastify.inject({
      method: 'DELETE',
      url: `/api/v1/academic/students/${studentId}`,
      headers,
    });
    await fastify.inject({
      method: 'DELETE',
      url: `/api/v1/academic/subjects/${subjectId}`,
      headers,
    });
    await fastify.inject({
      method: 'DELETE',
      url: `/api/v1/academic/areas/${areaId}`,
      headers,
    });
    await fastify.inject({
      method: 'POST',
      url: '/api/v1/auth/logout',
      headers,
    });
  });
});
