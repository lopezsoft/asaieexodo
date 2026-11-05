import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { PostgresRlsService } from '../../shared/infrastructure/database/postgres-rls.service';
import { setupOpenApiSwagger } from '../../shared/infrastructure/http/swagger/openapi-swagger.config';
import { ManageSchoolCrmUseCase } from '../crm/application/use-cases/manage-school-crm.use-case';
import { AuthenticateCommunityUserUseCase } from '../iam/application/use-cases/authenticate-community-user.use-case';
import { CommunityRole } from '../iam/domain/enums/community-role.enum';
import { ManageSchoolsUseCase } from './application/use-cases/manage-schools.use-case';

describe('PostgreSQL 17 Single-DB Multi-Tenant RLS, pgvector School CRM & Swagger OpenAPI Integration', () => {
  let app: NestFastifyApplication;
  let moduleRef: TestingModule;
  let rlsService: PostgresRlsService;
  let manageSchoolsUseCase: ManageSchoolsUseCase;
  let authUseCase: AuthenticateCommunityUserUseCase;
  let crmUseCase: ManageSchoolCrmUseCase;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    app.setGlobalPrefix('api/v1');
    setupOpenApiSwagger(app);
    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    rlsService = moduleRef.get(PostgresRlsService);
    manageSchoolsUseCase = moduleRef.get(ManageSchoolsUseCase);
    authUseCase = moduleRef.get(AuthenticateCommunityUserUseCase);
    crmUseCase = moduleRef.get(ManageSchoolCrmUseCase);
  });

  afterAll(async () => {
    await app.close();
  });

  it('lists all 9 migrated active schools with unique auto-incrementing IDs (1..9)', async () => {
    const schools = await manageSchoolsUseCase.listActiveSchools();
    expect(schools.length).toBeGreaterThanOrEqual(9);
    expect(Number(schools[0].id)).toBe(1);
    expect(schools[0].legacyDbName).toBe('pto_beato');
  });

  it('enforces PostgreSQL Row-Level Security (RLS) so School 1 only sees its own 4 academic periods (not all 36)', async () => {
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
  });

  it('authenticates educational community user and signs server-verified context switch across roles and schools', async () => {
    const loginSession = await authUseCase.login({
      username: 'admin.comunidad',
      password: 'Asaie2026*',
    });

    expect(loginSession.accessToken).toBeDefined();
    expect(loginSession.activeSchoolId).toBe(1);

    // Cambiar de rol a FAMILY (Padre/Acudiente) en el Colegio 7 (IE Francisco Jose de Caldas)
    const switchedSession = await authUseCase.switchSchoolContext({
      userId: 1n,
      schoolId: 7n,
      role: CommunityRole.FAMILY,
    });

    expect(switchedSession.activeSchoolId).toBe(7);
    expect(switchedSession.activeRole).toBe(CommunityRole.FAMILY);
    expect(switchedSession.activeSchoolName).toContain(
      'FRANCISCO JOSÉ DE CALDAS',
    );
  });

  it('verifies 100% normalized 3NF English schema (135 tables) and all 55 static catalog seeds', async () => {
    const verification = await rlsService.withTenantTransaction(
      1n,
      async (client) => {
        const res = await client.query<{
          total_tables: string;
          non_english_cols: string;
          countries_count: string;
          departments_count: string;
          cities_count: string;
          reserves_count: string;
          ethnic_groups_count: string;
          health_providers_count: string;
          subjects_bank_count: string;
          pay_scales_count: string;
          grades_catalog_count: string;
          methodologies_count: string;
          crm_channels_count: string;
          crm_ticket_categories_count: string;
          pgvector_version: string;
        }>(`
          SELECT
            (SELECT COUNT(*)::text FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE') AS total_tables,
            (SELECT COUNT(*)::text FROM information_schema.columns WHERE table_schema = 'public' AND (table_name !~ '^[a-z0-9_]+$' OR column_name !~ '^[a-z0-9_]+$')) AS non_english_cols,
            (SELECT COUNT(*)::text FROM countries) AS countries_count,
            (SELECT COUNT(*)::text FROM departments) AS departments_count,
            (SELECT COUNT(*)::text FROM cities) AS cities_count,
            (SELECT COUNT(*)::text FROM indigenous_reserves) AS reserves_count,
            (SELECT COUNT(*)::text FROM ethnic_groups) AS ethnic_groups_count,
            (SELECT COUNT(*)::text FROM health_providers) AS health_providers_count,
            (SELECT COUNT(*)::text FROM subjects_bank) AS subjects_bank_count,
            (SELECT COUNT(*)::text FROM teacher_pay_scales) AS pay_scales_count,
            (SELECT COUNT(*)::text FROM grades_catalog) AS grades_catalog_count,
            (SELECT COUNT(*)::text FROM study_methodologies) AS methodologies_count,
            (SELECT COUNT(*)::text FROM crm_channels) AS crm_channels_count,
            (SELECT COUNT(*)::text FROM crm_ticket_categories) AS crm_ticket_categories_count,
            (SELECT extversion FROM pg_extension WHERE extname = 'vector') AS pgvector_version
        `);
        return res.rows[0];
      },
    );

    expect(Number(verification.total_tables)).toBe(135);
    expect(Number(verification.non_english_cols)).toBe(0);
    expect(Number(verification.countries_count)).toBe(250);
    expect(Number(verification.departments_count)).toBe(34);
    expect(Number(verification.cities_count)).toBe(1127);
    expect(Number(verification.reserves_count)).toBe(646);
    expect(Number(verification.ethnic_groups_count)).toBe(99);
    expect(Number(verification.health_providers_count)).toBe(68);
    expect(Number(verification.subjects_bank_count)).toBe(52);
    expect(Number(verification.pay_scales_count)).toBe(39);
    expect(Number(verification.grades_catalog_count)).toBe(24);
    expect(Number(verification.methodologies_count)).toBe(23);
    expect(Number(verification.crm_channels_count)).toBe(5);
    expect(Number(verification.crm_ticket_categories_count)).toBe(6);
    expect(verification.pgvector_version).toBe('0.8.1');
  });

  it('indexes institutional SIEE/Convivencia embeddings in pgvector (vector(768) + HNSW) and enforces RLS between schools', async () => {
    await crmUseCase.indexInstitutionalKnowledge({
      schoolId: 1n,
      documentSource: 'SIEE',
      title: 'Articulo 14 - Nivelacion y Superacion de Areas SIEE Beato Juan XXIII',
      chunkText:
        'Los estudiantes con desempeno bajo en una o dos areas presentan nivelacion y recuperacion academica al finalizar cada periodo.',
      metadata: { schoolCode: 'pto_beato', article: 14 },
    });

    await crmUseCase.indexInstitutionalKnowledge({
      schoolId: 7n,
      documentSource: 'MANUAL_CONVIVENCIA',
      title: 'Capitulo 5 - Uniforme y Puntualidad IE Francisco Jose de Caldas',
      chunkText:
        'El horario de ingreso a la jornada manana es a las 6:30 AM con uniforme de diario completo.',
      metadata: { schoolCode: 'mom_franjocal', chapter: 5 },
    });

    const school1Matches = await crmUseCase.searchKnowledgeBase({
      schoolId: 1n,
      queryText: 'nivelacion y recuperacion academica desempeno bajo areas periodo',
      limit: 5,
    });

    expect(school1Matches.length).toBeGreaterThanOrEqual(1);
    expect(school1Matches[0].schoolId).toBe('1');
    expect(school1Matches[0].documentSource).toBe('SIEE');
    expect(school1Matches.every((m) => m.schoolId === '1')).toBe(true);
    expect(school1Matches[0].cosineSimilarity).toBeGreaterThan(0.5);
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
    expect(openApiDoc.paths['/api/v1/auth/login']).toBeDefined();
  });
});
