import { BullRegistrar, getQueueToken } from '@nestjs/bullmq';
import { ValidationPipe } from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import * as net from 'node:net';
import { AppModule } from '../../app.module';
import { PostgresRlsService } from '../../shared/infrastructure/database/postgres-rls.service';
import { GlobalExceptionFilter } from '../../shared/infrastructure/http/filters/global-exception.filter';
import { setupOpenApiSwagger } from '../../shared/infrastructure/http/swagger/openapi-swagger.config';
import { SmartLoggerService } from '../../shared/infrastructure/logging/smart-logger.service';
import { ManageSchoolCrmUseCase } from '../crm/application/use-cases/manage-school-crm.use-case';
import { AuthenticateCommunityUserUseCase } from '../iam/application/use-cases/authenticate-community-user.use-case';
import { CommunityRole } from '../iam/domain/enums/community-role.enum';
import { JASPER_REPORTS_QUEUE } from '../reporting/infrastructure/queues/jasper-report.processor';
import { ManageCloudFilesUseCase } from '../storage/application/use-cases/manage-cloud-files.use-case';
import { ManageSchoolsUseCase } from './application/use-cases/manage-schools.use-case';

function checkTcpPortOpen(host: string, port: number): Promise<boolean> {
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

describe('PostgreSQL 17 Single-DB Multi-Tenant RLS, Security Guards, pgvector CRM & Swagger Integration', () => {
  let app: NestFastifyApplication;
  let moduleRef: TestingModule;
  let rlsService: PostgresRlsService;
  let manageSchoolsUseCase: ManageSchoolsUseCase;
  let authUseCase: AuthenticateCommunityUserUseCase;
  let crmUseCase: ManageSchoolCrmUseCase;
  let cloudFilesUseCase: ManageCloudFilesUseCase;
  let postgresAvailable = false;

  beforeAll(async () => {
    const dbHost = process.env.DB_HOST ?? '127.0.0.1';
    const dbPort = Number(process.env.DB_PORT ?? '5434');
    const redisHost = process.env.REDIS_HOST ?? '127.0.0.1';
    const redisPort = Number(process.env.REDIS_PORT ?? '6384');

    postgresAvailable = await checkTcpPortOpen(dbHost, dbPort);
    const redisAvailable = await checkTcpPortOpen(redisHost, redisPort);

    const testingBuilder = Test.createTestingModule({
      imports: [AppModule],
    });

    if (!redisAvailable) {
      testingBuilder
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

    moduleRef = await testingBuilder.compile();

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
    setupOpenApiSwagger(app);
    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    rlsService = moduleRef.get(PostgresRlsService);
    manageSchoolsUseCase = moduleRef.get(ManageSchoolsUseCase);
    authUseCase = moduleRef.get(AuthenticateCommunityUserUseCase);
    crmUseCase = moduleRef.get(ManageSchoolCrmUseCase);
    cloudFilesUseCase = moduleRef.get(ManageCloudFilesUseCase);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('rejects unauthenticated requests to protected endpoints (closing switch-context bypass & IDOR)', async () => {
    const fastify = app.getHttpAdapter().getInstance();

    const switchRes = await fastify.inject({
      method: 'POST',
      url: '/api/v1/auth/switch-context',
      payload: { schoolId: 7, role: CommunityRole.FAMILY },
    });
    expect(switchRes.statusCode).toBe(401);

    const schoolsRes = await fastify.inject({
      method: 'GET',
      url: '/api/v1/tenants/schools',
    });
    expect(schoolsRes.statusCode).toBe(401);

    const crmRes = await fastify.inject({
      method: 'GET',
      url: '/api/v1/crm/conversations',
    });
    expect(crmRes.statusCode).toBe(401);

    const filesRes = await fastify.inject({
      method: 'GET',
      url: '/api/v1/storage/files',
    });
    expect(filesRes.statusCode).toBe(401);

    const migrationRes = await fastify.inject({
      method: 'POST',
      url: '/api/v1/migration/bootstrap-nine-schools',
    });
    expect(migrationRes.statusCode).toBe(401);
  });

  it('validates DTOs strictly via global ValidationPipe (rejects malformed login payload with 400)', async () => {
    const fastify = app.getHttpAdapter().getInstance();

    const badLoginRes = await fastify.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: { email: 'legacy@asaie.co', accessModule: 3 },
    });
    expect(badLoginRes.statusCode).toBe(400);
  });

  it('serves interactive Swagger UI (/api/docs) and OpenAPI 3.0 specification (/api/docs-json)', async () => {
    const fastify = app.getHttpAdapter().getInstance();

    const uiRes = await fastify.inject({
      method: 'GET',
      url: '/api/docs',
    });
    expect(uiRes.statusCode).toBe(200);
    expect(uiRes.headers['content-type']).toContain('text/html');
    expect(uiRes.body).toContain('SwaggerUIBundle');

    const jsonRes = await fastify.inject({
      method: 'GET',
      url: '/api/docs-json',
    });
    expect(jsonRes.statusCode).toBe(200);
    const openApiDoc = JSON.parse(jsonRes.body);
    expect(openApiDoc.openapi).toMatch(/^3\.0/);
    expect(openApiDoc.paths['/api/v1/crm/knowledge/semantic-search']).toBeDefined();
    expect(openApiDoc.paths['/api/v1/crm/conversations']).toBeDefined();
    expect(openApiDoc.paths['/api/v1/crm/announcements']).toBeDefined();
    expect(openApiDoc.paths['/api/v1/crm/tickets']).toBeDefined();
    expect(openApiDoc.paths['/api/v1/auth/login']).toBeDefined();
    expect(openApiDoc.paths['/api/v1/auth/me']).toBeDefined();
    expect(openApiDoc.paths['/api/v1/auth/logout']).toBeDefined();
    expect(openApiDoc.paths['/api/v1/auth/forgot-password']).toBeDefined();
    expect(openApiDoc.paths['/api/v1/auth/reset-password']).toBeDefined();
    expect(openApiDoc.paths['/api/v1/auth/change-password']).toBeDefined();
  });

  it('verifies PostgreSQL 17 RLS, 159 tables/partitions, 0 uncommented cols, cleaned geo seeds, RBAC, CRM & S3 when DB is online', async () => {
    if (!postgresAvailable) {
      return;
    }

    const schools = await manageSchoolsUseCase.listActiveSchools();
    expect(schools.length).toBeGreaterThanOrEqual(9);
    expect(schools[0].legacyDbName).toBe('pto_beato');

    const school1PeriodsCount = await rlsService.withTenantTransaction(
      1n,
      async (client) => {
        const res = await client.query<{ total: string }>(
          'SELECT COUNT(*)::text AS total FROM academic_periods',
        );
        return Number(res.rows[0].total);
      },
    );
    expect(school1PeriodsCount).toBe(4);

    const verification = await rlsService.withTenantTransaction(
      1n,
      async (client) => {
        const res = await client.query<{
          total_pg_relations: string;
          runtime_accessible_tables: string;
          non_english_cols: string;
          countries_count: string;
          departments_count: string;
          cities_count: string;
          pgvector_version: string;
          tables_without_comment: string;
          columns_without_comment: string;
          unprotected_partitions: string;
        }>(`
          SELECT
            (SELECT COUNT(*)::text
             FROM pg_catalog.pg_class c
             JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
             WHERE n.nspname = 'public' AND c.relkind IN ('r', 'p')) AS total_pg_relations,
            (SELECT COUNT(*)::text FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE') AS runtime_accessible_tables,
            (SELECT COUNT(*)::text FROM information_schema.columns WHERE table_schema = 'public' AND (table_name !~ '^[a-z0-9_]+$' OR column_name !~ '^[a-z0-9_]+$')) AS non_english_cols,
            (SELECT COUNT(*)::text FROM countries) AS countries_count,
            (SELECT COUNT(*)::text FROM departments) AS departments_count,
            (SELECT COUNT(*)::text FROM cities) AS cities_count,
            (SELECT extversion FROM pg_extension WHERE extname = 'vector') AS pgvector_version,
            (SELECT COUNT(*)::text
             FROM pg_catalog.pg_class c
             JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
             WHERE n.nspname = 'public'
               AND c.relkind IN ('r', 'p')
               AND COALESCE(pg_catalog.obj_description(c.oid, 'pg_class'), '') = '') AS tables_without_comment,
            (SELECT COUNT(*)::text
             FROM pg_catalog.pg_class c
             JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
             JOIN pg_catalog.pg_attribute a ON a.attrelid = c.oid
             WHERE n.nspname = 'public'
               AND c.relkind IN ('r', 'p')
               AND a.attnum > 0
               AND NOT a.attisdropped
               AND COALESCE(pg_catalog.col_description(c.oid, a.attnum), '') = '') AS columns_without_comment,
            (SELECT COUNT(*)::text
             FROM pg_catalog.pg_class c
             JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
             WHERE n.nspname = 'public'
               AND c.relname LIKE 'academic_score%'
               AND c.relkind = 'r'
               AND (NOT c.relrowsecurity OR NOT c.relforcerowsecurity)) AS unprotected_partitions
        `);
        return res.rows[0];
      },
    );

    expect(Number(verification.total_pg_relations)).toBe(159);
    // Las 15 particiones hijas (academic_scores_*, academic_score_achievements_*, academic_score_suggestions_*) tienen REVOKE ALL para asaie_app_runtime (159 - 15 = 144 accesibles)
    expect(Number(verification.runtime_accessible_tables)).toBe(144);
    expect(Number(verification.unprotected_partitions)).toBe(0);
    expect(Number(verification.non_english_cols)).toBe(0);
    expect(Number(verification.tables_without_comment)).toBe(0);
    expect(Number(verification.columns_without_comment)).toBe(0);
    expect(Number(verification.countries_count)).toBe(246);
    expect(Number(verification.departments_count)).toBe(364);
    expect(Number(verification.cities_count)).toBe(9253);
    expect(verification.pgvector_version).toBe('0.8.1');

    const loginSession = await authUseCase.login({
      username: 'admin.comunidad',
      password: process.env.BOOTSTRAP_ADMIN_PASSWORD ?? 'Asaie2026*',
    });
    expect(loginSession.accessToken).toBeDefined();
    expect(loginSession.permissions.length).toBeGreaterThanOrEqual(79);
    expect(loginSession.enabledModules.length).toBeGreaterThanOrEqual(1);

    const switched = await authUseCase.switchSchoolContext({
      userId: 1n,
      currentSchoolId: BigInt(loginSession.activeSchoolId),
      currentSessionId: loginSession.sessionId,
      schoolId: 7n,
      role: CommunityRole.FAMILY,
    });
    expect(switched.activeSchoolId).toBe(7);

    await crmUseCase.indexInstitutionalKnowledge({
      schoolId: 1n,
      documentSource: 'SIEE',
      title: 'Articulo 14 - Nivelacion SIEE',
      chunkText: 'Estudiantes con desempeno bajo presentan nivelacion academica.',
    });
    const matches = await crmUseCase.searchKnowledgeBase({
      schoolId: 1n,
      queryText: 'nivelacion academica desempeno bajo',
      limit: 5,
    });
    expect(matches.every((m) => m.schoolId === '1')).toBe(true);

    const uploaded = await cloudFilesUseCase.uploadSchoolFile({
      schoolId: 1n,
      uploadedByUserId: 1n,
      category: 'STUDENT_DOCUMENTS',
      originalFileName: 'Registro Civil Estudiante.pdf',
      mimeType: 'application/pdf',
      contentBuffer: Buffer.from('%PDF-1.4 sample content'),
    });
    expect(uploaded.schoolId).toBe('1');
    await cloudFilesUseCase.deleteSchoolFile(1n, BigInt(uploaded.id));
  });
});
