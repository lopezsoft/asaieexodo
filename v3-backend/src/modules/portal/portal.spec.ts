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
import { ManagePortalUseCase } from './application/use-cases/manage-portal.use-case';
import { ManageTeacherExtendedUseCase } from './application/use-cases/manage-teacher-extended.use-case';

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

describe('Sprint 8 — Teacher Portal (Gradebook, Observer M5, LMS) & Student Portal (RLS)', () => {
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

  it('rejects unauthenticated requests to teacher & student portals with 401', async () => {
    const fastify = app.getHttpAdapter().getInstance();
    for (const url of [
      '/api/v1/teacher/courses',
      '/api/v1/teacher/periods',
      '/api/v1/teacher/profile',
      '/api/v1/teacher/levelings/final',
      '/api/v1/teacher/tracking-format?academicGroupId=1',
      '/api/v1/teacher/achievements',
      '/api/v1/teacher/lesson-plans',
      '/api/v1/teacher/activities',
      '/api/v1/teacher/evaluations',
      '/api/v1/teacher/live-classes',
      '/api/v1/student/overview',
      '/api/v1/student/grades',
      '/api/v1/student/activities',
      '/api/v1/student/evaluations',
      '/api/v1/student/live-classes',
    ]) {
      const res = await fastify.inject({ method: 'GET', url });
      expect(res.statusCode).toBe(401);
    }
  });

  it('lists teacher courses, lesson plans, LMS items and student overview safely under RLS', async () => {
    if (!postgresAvailable) {
      return;
    }

    const useCase = moduleRef.get(ManagePortalUseCase);
    const schoolId = 1n;

    const courses = await useCase.listTeacherCourses(schoolId, 1n, 'RECTOR', 2026);
    expect(Array.isArray(courses)).toBe(true);

    const plans = await useCase.listLessonPlans(schoolId, 2026);
    expect(Array.isArray(plans)).toBe(true);

    const activities = await useCase.listTeacherActivities(schoolId);
    expect(Array.isArray(activities)).toBe(true);

    const evaluations = await useCase.listTeacherEvaluations(schoolId);
    expect(Array.isArray(evaluations)).toBe(true);

    const liveClasses = await useCase.listTeacherLiveClasses(schoolId);
    expect(Array.isArray(liveClasses)).toBe(true);

    const overview = await useCase.getStudentOverview(schoolId, 999999n, 2026);
    expect(overview.enrollmentId).toBeNull();
    expect(overview.courses).toEqual([]);

    const extended = moduleRef.get(ManageTeacherExtendedUseCase);
    const periods = await extended.listTeacherPeriods(schoolId, 2026);
    expect(Array.isArray(periods)).toBe(true);

    const finalLevelings = await extended.listFinalLevelings(
      schoolId,
      1n,
      'RECTOR',
      2026,
    );
    expect(finalLevelings.minPassingScore).toBeGreaterThan(0);
    expect(Array.isArray(finalLevelings.rows)).toBe(true);
  });
});
