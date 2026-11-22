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

describe('Sprint 1 & 2 — Catalogs, Dashboard Statistics, Own Profile & Administration Module', () => {
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

    const builder = Test.createTestingModule({
      imports: [AppModule],
    });

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
    const smartLogger = app.get(SmartLoggerService);
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new GlobalExceptionFilter(smartLogger));
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('rejects unauthenticated requests to catalogs and administration endpoints with 401', async () => {
    const fastify = app.getHttpAdapter().getInstance();

    for (const url of [
      '/api/v1/catalogs/bundle',
      '/api/v1/admin/dashboard/statistics',
      '/api/v1/admin/school',
      '/api/v1/admin/campuses',
      '/api/v1/admin/teachers',
      '/api/v1/admin/staff',
      '/api/v1/admin/group-managers',
    ]) {
      const res = await fastify.inject({ method: 'GET', url });
      expect(res.statusCode).toBe(401);
    }
  });

  it('executes full live CRUD for Catalogs, Dashboard, Campuses, Teachers, Staff and Group Managers under RLS', async () => {
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
    const authHeaders = { authorization: `Bearer ${accessToken}` };

    // 1. Catálogos globales y geografía
    const bundleRes = await fastify.inject({
      method: 'GET',
      url: '/api/v1/catalogs/bundle',
      headers: authHeaders,
    });
    expect(bundleRes.statusCode).toBe(200);
    const bundle = JSON.parse(bundleRes.body).data;
    expect(bundle.documentTypes.length).toBeGreaterThan(0);
    expect(bundle.genders.length).toBeGreaterThan(0);

    const countriesRes = await fastify.inject({
      method: 'GET',
      url: '/api/v1/catalogs/countries?search=Colombia',
      headers: authHeaders,
    });
    expect(countriesRes.statusCode).toBe(200);
    expect(JSON.parse(countriesRes.body).data[0].id).toBe(45);

    const contextRes = await fastify.inject({
      method: 'GET',
      url: '/api/v1/catalogs/school-context',
      headers: authHeaders,
    });
    expect(contextRes.statusCode).toBe(200);

    // 2. Dashboard Ejecutivo + Datos del plantel
    const statsRes = await fastify.inject({
      method: 'GET',
      url: '/api/v1/admin/dashboard/statistics?academicYear=2026',
      headers: authHeaders,
    });
    expect(statsRes.statusCode).toBe(200);
    const stats = JSON.parse(statsRes.body).data;
    expect(stats.academicYear).toBe(2026);
    expect(stats.schoolSummary.id).toBe(1);
    expect(Array.isArray(stats.series.registeredByYear)).toBe(true);

    const schoolRes = await fastify.inject({
      method: 'GET',
      url: '/api/v1/admin/school',
      headers: authHeaders,
    });
    expect(schoolRes.statusCode).toBe(200);
    expect(JSON.parse(schoolRes.body).data.id).toBe(1);

    // 3. CRUD Sede educativa
    const uniqueSuffix = Date.now().toString().slice(-6);
    const createCampusRes = await fastify.inject({
      method: 'POST',
      url: '/api/v1/admin/campuses',
      headers: authHeaders,
      payload: {
        name: `Sede Test ${uniqueSuffix}`,
        zoneId: 1,
        address: 'Calle 10 # 20-30',
        isMainCampus: false,
        isActive: true,
      },
    });
    expect(createCampusRes.statusCode).toBe(201);
    const createdCampusId = JSON.parse(createCampusRes.body).data.id as number;

    const updateCampusRes = await fastify.inject({
      method: 'PATCH',
      url: `/api/v1/admin/campuses/${createdCampusId}`,
      headers: authHeaders,
      payload: {
        name: `Sede Test Editada ${uniqueSuffix}`,
        zoneId: 1,
        isActive: false,
      },
    });
    expect(updateCampusRes.statusCode).toBe(200);

    // 3b. Verificar filtro paginado por estado en Sedes Educativas (ACTIVE / INACTIVE / ALL)
    const activeCampusRes = await fastify.inject({
      method: 'GET',
      url: `/api/v1/admin/campuses?paginated=1&status=ACTIVE&query=${uniqueSuffix}`,
      headers: authHeaders,
    });
    expect(activeCampusRes.statusCode).toBe(200);
    expect(JSON.parse(activeCampusRes.body).dataRecords.total).toBe(0);

    const inactiveCampusRes = await fastify.inject({
      method: 'GET',
      url: `/api/v1/admin/campuses?paginated=1&status=INACTIVE&query=${uniqueSuffix}`,
      headers: authHeaders,
    });
    expect(inactiveCampusRes.statusCode).toBe(200);
    expect(JSON.parse(inactiveCampusRes.body).dataRecords.total).toBe(1);

    const allCampusRes = await fastify.inject({
      method: 'GET',
      url: `/api/v1/admin/campuses?paginated=1&status=ALL&query=${uniqueSuffix}`,
      headers: authHeaders,
    });
    expect(JSON.parse(allCampusRes.body).dataRecords.total).toBe(1);

    // 4. CRUD Docente
    const createTeacherRes = await fastify.inject({
      method: 'POST',
      url: '/api/v1/admin/teachers',
      headers: authHeaders,
      payload: {
        documentTypeId: 1,
        documentNumber: `99${uniqueSuffix}`,
        firstName: 'Ana',
        lastName: 'Docente',
        email: `ana.${uniqueSuffix}@colegio.edu.co`,
        isActive: true,
      },
    });
    expect(createTeacherRes.statusCode).toBe(201);
    const createdTeacherId = JSON.parse(createTeacherRes.body).data.id as number;

    const listTeachersRes = await fastify.inject({
      method: 'GET',
      url: `/api/v1/admin/teachers?search=${uniqueSuffix}`,
      headers: authHeaders,
    });
    expect(listTeachersRes.statusCode).toBe(200);
    expect(JSON.parse(listTeachersRes.body).data.total).toBeGreaterThanOrEqual(1);

    // 4b. Verificar filtro paginado por estado (ACTIVE / INACTIVE / ALL) en docentes
    const activeBeforeDeactivate = await fastify.inject({
      method: 'GET',
      url: `/api/v1/admin/teachers?paginated=1&status=ACTIVE&query=${uniqueSuffix}`,
      headers: authHeaders,
    });
    expect(activeBeforeDeactivate.statusCode).toBe(200);
    expect(JSON.parse(activeBeforeDeactivate.body).dataRecords.total).toBe(1);

    const inactiveBeforeDeactivate = await fastify.inject({
      method: 'GET',
      url: `/api/v1/admin/teachers?paginated=1&status=INACTIVE&query=${uniqueSuffix}`,
      headers: authHeaders,
    });
    expect(inactiveBeforeDeactivate.statusCode).toBe(200);
    expect(JSON.parse(inactiveBeforeDeactivate.body).dataRecords.total).toBe(0);

    const deactivateTeacherRes = await fastify.inject({
      method: 'PATCH',
      url: `/api/v1/admin/teachers/${createdTeacherId}`,
      headers: authHeaders,
      payload: {
        documentTypeId: 1,
        documentNumber: `99${uniqueSuffix}`,
        firstName: 'Ana',
        lastName: 'Docente',
        email: `ana.${uniqueSuffix}@colegio.edu.co`,
        isActive: false,
      },
    });
    expect(deactivateTeacherRes.statusCode).toBe(200);

    const activeAfterDeactivate = await fastify.inject({
      method: 'GET',
      url: `/api/v1/admin/teachers?paginated=1&status=ACTIVE&query=${uniqueSuffix}`,
      headers: authHeaders,
    });
    expect(JSON.parse(activeAfterDeactivate.body).dataRecords.total).toBe(0);

    const inactiveAfterDeactivate = await fastify.inject({
      method: 'GET',
      url: `/api/v1/admin/teachers?paginated=1&status=INACTIVE&query=${uniqueSuffix}`,
      headers: authHeaders,
    });
    expect(JSON.parse(inactiveAfterDeactivate.body).dataRecords.total).toBe(1);
    expect(
      JSON.parse(inactiveAfterDeactivate.body).dataRecords.data[0].isActive,
    ).toBe(false);

    const allAfterDeactivate = await fastify.inject({
      method: 'GET',
      url: `/api/v1/admin/teachers?paginated=1&status=ALL&query=${uniqueSuffix}`,
      headers: authHeaders,
    });
    expect(JSON.parse(allAfterDeactivate.body).dataRecords.total).toBe(1);

    // Verificar también que el filtro de columna 'isActive=Activo' NO incluya registros 'Inactivo'
    const colActiveFilterRes = await fastify.inject({
      method: 'GET',
      url: `/api/v1/admin/teachers?paginated=1&status=ALL&query=${uniqueSuffix}&field=isActive&value=Activo`,
      headers: authHeaders,
    });
    expect(JSON.parse(colActiveFilterRes.body).dataRecords.total).toBe(0);

    // 5. CRUD Personal Administrativo + filtro por estado (ACTIVE / INACTIVE / ALL)
    const createStaffRes = await fastify.inject({
      method: 'POST',
      url: '/api/v1/admin/staff',
      headers: authHeaders,
      payload: {
        documentTypeId: 1,
        documentNumber: `88${uniqueSuffix}`,
        firstName: 'Luis',
        lastName: 'Secretario',
        email: `luis.${uniqueSuffix}@colegio.edu.co`,
        isActive: false,
      },
    });
    expect(createStaffRes.statusCode).toBe(201);
    const createdStaffId = JSON.parse(createStaffRes.body).data.id as number;

    const activeStaffRes = await fastify.inject({
      method: 'GET',
      url: `/api/v1/admin/staff?paginated=1&status=ACTIVE&query=${uniqueSuffix}`,
      headers: authHeaders,
    });
    expect(activeStaffRes.statusCode).toBe(200);
    expect(JSON.parse(activeStaffRes.body).dataRecords.total).toBe(0);

    const inactiveStaffRes = await fastify.inject({
      method: 'GET',
      url: `/api/v1/admin/staff?paginated=1&status=INACTIVE&query=${uniqueSuffix}`,
      headers: authHeaders,
    });
    expect(inactiveStaffRes.statusCode).toBe(200);
    expect(JSON.parse(inactiveStaffRes.body).dataRecords.total).toBe(1);

    // 5b. Verificar filtros combinados en Directores de Grupo (status + assignmentState + campusId)
    const inactiveGroupsRes = await fastify.inject({
      method: 'GET',
      url: `/api/v1/admin/group-managers?paginated=1&academicYear=2026&status=INACTIVE&campusId=${createdCampusId}`,
      headers: authHeaders,
    });
    expect(inactiveGroupsRes.statusCode).toBe(200);
    expect(JSON.parse(inactiveGroupsRes.body).dataRecords.total).toBe(0);

    const unassignedGroupsRes = await fastify.inject({
      method: 'GET',
      url: `/api/v1/admin/group-managers?paginated=1&academicYear=2026&status=ACTIVE&assignmentState=UNASSIGNED`,
      headers: authHeaders,
    });
    expect(unassignedGroupsRes.statusCode).toBe(200);
    const unassignedRows = JSON.parse(unassignedGroupsRes.body).dataRecords
      .data as Array<{ homeroomTeacherId: number | null; isActive: boolean }>;
    expect(
      unassignedRows.every(
        (g) => g.isActive === true && g.homeroomTeacherId === null,
      ),
    ).toBe(true);

    // 6. Limpieza ordenada de registros creados en la prueba
    const delStaffRes = await fastify.inject({
      method: 'DELETE',
      url: `/api/v1/admin/staff/${createdStaffId}`,
      headers: authHeaders,
    });
    expect(delStaffRes.statusCode).toBe(200);

    const delTeacherRes = await fastify.inject({
      method: 'DELETE',
      url: `/api/v1/admin/teachers/${createdTeacherId}`,
      headers: authHeaders,
    });
    expect(delTeacherRes.statusCode).toBe(200);

    const delCampusRes = await fastify.inject({
      method: 'DELETE',
      url: `/api/v1/admin/campuses/${createdCampusId}`,
      headers: authHeaders,
    });
    expect(delCampusRes.statusCode).toBe(200);

    // Cerrar sesión de prueba
    await fastify.inject({
      method: 'POST',
      url: '/api/v1/auth/logout',
      headers: authHeaders,
    });
  }, 20_000);
});
