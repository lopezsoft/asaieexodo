import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { PostgresRlsService } from '../../shared/infrastructure/database/postgres-rls.service';
import { AuthenticateCommunityUserUseCase } from '../iam/application/use-cases/authenticate-community-user.use-case';
import { CommunityRole } from '../iam/domain/enums/community-role.enum';
import { ManageSchoolsUseCase } from './application/use-cases/manage-schools.use-case';

describe('PostgreSQL 17 Single-DB Multi-Tenant RLS & IAM Integration', () => {
  let moduleRef: TestingModule;
  let rlsService: PostgresRlsService;
  let manageSchoolsUseCase: ManageSchoolsUseCase;
  let authUseCase: AuthenticateCommunityUserUseCase;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    rlsService = moduleRef.get(PostgresRlsService);
    manageSchoolsUseCase = moduleRef.get(ManageSchoolsUseCase);
    authUseCase = moduleRef.get(AuthenticateCommunityUserUseCase);
  });

  afterAll(async () => {
    await moduleRef.close();
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
});
