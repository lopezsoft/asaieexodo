import { TenantAccessDeniedException } from '../../../../shared/domain/exceptions/tenant-access-denied.exception';
import { CommunityRole } from '../enums/community-role.enum';
import { CommunityUser } from './community-user.entity';

describe('CommunityUser Aggregate Root (Multi-Tenant IAM)', () => {
  const sampleUser = CommunityUser.reconstitute(10n, {
    documentTypeId: 3,
    documentNumber: '1000000001',
    email: 'docente@asaie.co',
    username: 'docente.padre',
    passwordHash: 'scrypt:salt:hash',
    firstName: 'CARLOS',
    middleName: 'ANDRES',
    lastName: 'LOPEZ',
    secondLastName: 'PEREZ',
    avatarUrl: null,
    isActive: true,
    memberships: [
      {
        schoolId: 1n,
        schoolName: 'INSTITUCIÓN EDUCATIVA BEATO JUAN XXIII',
        schoolDaneCode: '323580006675',
        role: CommunityRole.TEACHER,
        isActive: true,
      },
      {
        schoolId: 1n,
        schoolName: 'INSTITUCIÓN EDUCATIVA BEATO JUAN XXIII',
        schoolDaneCode: '323580006675',
        role: CommunityRole.FAMILY,
        isActive: true,
      },
    ],
  });

  it('allows switching between TEACHER and FAMILY roles in the authorized school', () => {
    const teacherMembership = sampleUser.verifySchoolRoleMembership(
      1n,
      CommunityRole.TEACHER,
    );
    expect(teacherMembership.role).toBe(CommunityRole.TEACHER);

    const familyMembership = sampleUser.verifySchoolRoleMembership(
      1n,
      CommunityRole.FAMILY,
    );
    expect(familyMembership.role).toBe(CommunityRole.FAMILY);
  });

  it('rejects access to an unauthorized school or role with TenantAccessDeniedException', () => {
    expect(() =>
      sampleUser.verifySchoolRoleMembership(2n, CommunityRole.TEACHER),
    ).toThrow(TenantAccessDeniedException);

    expect(() =>
      sampleUser.verifySchoolRoleMembership(1n, CommunityRole.RECTOR),
    ).toThrow(TenantAccessDeniedException);
  });
});
