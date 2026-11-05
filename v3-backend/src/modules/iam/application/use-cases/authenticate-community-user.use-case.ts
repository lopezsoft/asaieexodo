import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ResourceNotFoundException } from '../../../../shared/domain/exceptions/resource-not-found.exception';
import { TenantAccessDeniedException } from '../../../../shared/domain/exceptions/tenant-access-denied.exception';
import { CommunityRole } from '../../domain/enums/community-role.enum';
import { CommunityUserRepositoryPort } from '../../domain/ports/community-user.repository.port';
import { PasswordHasherPort } from '../../domain/ports/password-hasher.port';

export interface LoginCredentialsInput {
  readonly username: string;
  readonly password: string;
  readonly preferredSchoolId?: number;
  readonly preferredRole?: CommunityRole;
}

export interface SwitchContextInput {
  readonly userId: bigint;
  readonly schoolId: bigint;
  readonly role: CommunityRole;
  readonly academicYear?: number;
}

export interface AuthenticatedSessionOutput {
  readonly accessToken: string;
  readonly activeSchoolId: number;
  readonly activeSchoolName: string;
  readonly activeRole: CommunityRole;
  readonly academicYear: number;
  readonly user: Record<string, unknown>;
}

@Injectable()
export class AuthenticateCommunityUserUseCase {
  constructor(
    private readonly userRepository: CommunityUserRepositoryPort,
    private readonly passwordHasher: PasswordHasherPort,
    private readonly jwtService: JwtService,
  ) {}

  async login(
    input: LoginCredentialsInput,
  ): Promise<AuthenticatedSessionOutput> {
    const user = await this.userRepository.findByUsernameOrDocument(
      input.username.trim(),
    );

    if (!user || !user.isActive) {
      throw new UnauthorizedException(
        'Credenciales de acceso inválidas o usuario inactivo.',
      );
    }

    const isPasswordValid = await this.passwordHasher.verify(
      input.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException(
        'Credenciales de acceso inválidas o usuario inactivo.',
      );
    }

    if (user.memberships.length === 0) {
      throw new TenantAccessDeniedException(
        'El usuario no tiene membresías activas en ninguna institución educativa.',
      );
    }

    const targetMembership =
      input.preferredSchoolId && input.preferredRole
        ? user.verifySchoolRoleMembership(
            BigInt(input.preferredSchoolId),
            input.preferredRole,
          )
        : user.memberships[0];

    const currentYear = new Date().getFullYear();

    const accessToken = await this.jwtService.signAsync({
      sub: Number(user.id),
      username: user.username,
      schoolId: Number(targetMembership.schoolId),
      activeRole: targetMembership.role,
      academicYear: currentYear,
    });

    return {
      accessToken,
      activeSchoolId: Number(targetMembership.schoolId),
      activeSchoolName: targetMembership.schoolName,
      activeRole: targetMembership.role,
      academicYear: currentYear,
      user: user.toPublicProfile(),
    };
  }

  /**
   * Cambio de colegio o rol verificado y firmado en el servidor (reemplaza la manipulacion insegura de localStorage).
   */
  async switchSchoolContext(
    input: SwitchContextInput,
  ): Promise<AuthenticatedSessionOutput> {
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new ResourceNotFoundException('CommunityUser', input.userId);
    }

    const verifiedMembership = user.verifySchoolRoleMembership(
      input.schoolId,
      input.role,
    );

    const academicYear = input.academicYear ?? new Date().getFullYear();

    const accessToken = await this.jwtService.signAsync({
      sub: Number(user.id),
      username: user.username,
      schoolId: Number(verifiedMembership.schoolId),
      activeRole: verifiedMembership.role,
      academicYear,
    });

    return {
      accessToken,
      activeSchoolId: Number(verifiedMembership.schoolId),
      activeSchoolName: verifiedMembership.schoolName,
      activeRole: verifiedMembership.role,
      academicYear,
      user: user.toPublicProfile(),
    };
  }
}
