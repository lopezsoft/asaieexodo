import { AggregateRoot } from '../../../../shared/domain/aggregate-root.base';
import { TenantAccessDeniedException } from '../../../../shared/domain/exceptions/tenant-access-denied.exception';
import { CommunityRole } from '../enums/community-role.enum';

export interface SchoolMembershipItem {
  readonly schoolId: bigint;
  readonly schoolName: string;
  readonly schoolDaneCode: string | null;
  readonly role: CommunityRole;
  readonly isActive: boolean;
}

export interface CommunityUserProps {
  readonly documentTypeId: number;
  readonly documentNumber: string;
  readonly email: string | null;
  readonly username: string;
  readonly passwordHash: string;
  readonly firstName: string;
  readonly middleName: string | null;
  readonly lastName: string;
  readonly secondLastName: string | null;
  readonly avatarUrl: string | null;
  readonly isActive: boolean;
  readonly memberships: SchoolMembershipItem[];
}

/**
 * Agregado Raiz de Identidad para toda la Comunidad Educativa
 * (Directivos, Administrativos, Docentes, Estudiantes y Padres/Acudientes).
 */
export class CommunityUser extends AggregateRoot<bigint, CommunityUserProps> {
  private constructor(id: bigint, props: CommunityUserProps) {
    super(id, props);
  }

  static reconstitute(id: bigint, props: CommunityUserProps): CommunityUser {
    return new CommunityUser(id, props);
  }

  get username(): string {
    return this.props.username;
  }

  get email(): string | null {
    return this.props.email;
  }

  get passwordHash(): string {
    return this.props.passwordHash;
  }

  get fullName(): string {
    return [
      this.props.firstName,
      this.props.middleName,
      this.props.lastName,
      this.props.secondLastName,
    ]
      .filter((part): part is string => Boolean(part && part.trim().length > 0))
      .join(' ');
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get memberships(): SchoolMembershipItem[] {
    return this.props.memberships.filter((item) => item.isActive);
  }

  /**
   * Verifica en el dominio que el usuario pertenezca al colegio y rol solicitado.
   */
  verifySchoolRoleMembership(
    schoolId: bigint,
    requestedRole: CommunityRole,
  ): SchoolMembershipItem {
    if (!this.props.isActive) {
      throw new TenantAccessDeniedException(
        'La cuenta de usuario se encuentra inactiva.',
      );
    }

    const membership = this.memberships.find(
      (item) => item.schoolId === schoolId && item.role === requestedRole,
    );

    if (!membership) {
      throw new TenantAccessDeniedException(
        `El usuario no posee el rol '${requestedRole}' en la institución educativa con ID ${String(schoolId)}.`,
      );
    }

    return membership;
  }

  toPublicProfile(): Record<string, unknown> {
    return {
      id: Number(this.id),
      documentTypeId: this.props.documentTypeId,
      documentNumber: this.props.documentNumber,
      email: this.props.email,
      username: this.props.username,
      firstName: this.props.firstName,
      middleName: this.props.middleName,
      lastName: this.props.lastName,
      secondLastName: this.props.secondLastName,
      fullName: this.fullName,
      avatarUrl: this.props.avatarUrl,
      isActive: this.props.isActive,
      memberships: this.memberships.map((m) => ({
        schoolId: Number(m.schoolId),
        schoolName: m.schoolName,
        schoolDaneCode: m.schoolDaneCode,
        role: m.role,
      })),
    };
  }
}
