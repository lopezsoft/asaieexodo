import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'node:crypto';
import {
  MailDeliveryResult,
  MailSenderPort,
} from '../../../../shared/application/ports/mail-sender.port';
import { ResourceNotFoundException } from '../../../../shared/domain/exceptions/resource-not-found.exception';
import { TenantAccessDeniedException } from '../../../../shared/domain/exceptions/tenant-access-denied.exception';
import { RbacPermissionsService } from '../../../../shared/infrastructure/rbac/rbac-permissions.service';
import { CommunityRole } from '../../domain/enums/community-role.enum';
import { CommunityUserRepositoryPort } from '../../domain/ports/community-user.repository.port';
import { PasswordHasherPort } from '../../domain/ports/password-hasher.port';

export interface LoginCredentialsInput {
  readonly username: string;
  readonly password: string;
  readonly preferredSchoolId?: number;
  readonly preferredRole?: CommunityRole;
  readonly ipAddress?: string;
  readonly userAgent?: string;
}

export interface SwitchContextInput {
  readonly userId: bigint;
  readonly currentSchoolId?: bigint;
  readonly currentSessionId?: string;
  readonly schoolId: bigint;
  readonly role: CommunityRole;
  readonly academicYear?: number;
  readonly ipAddress?: string;
  readonly userAgent?: string;
}

export interface ChangePasswordInput {
  readonly userId: bigint;
  readonly currentSessionId?: string;
  readonly currentPassword: string;
  readonly newPassword: string;
}

export interface ForgotPasswordInput {
  readonly identifier: string;
  readonly requestedIp?: string;
}

export interface ResetPasswordInput {
  readonly resetToken: string;
  readonly newPassword: string;
}

export interface AuthenticatedSessionOutput {
  readonly accessToken: string;
  readonly sessionId: string;
  readonly activeSchoolId: number;
  readonly activeSchoolName: string;
  readonly activeRole: CommunityRole;
  readonly academicYear: number;
  readonly permissions: string[];
  readonly enabledModules: string[];
  readonly user: Record<string, unknown>;
}

const SESSION_DURATION_MS = 8 * 60 * 60 * 1000; // 8h default

@Injectable()
export class AuthenticateCommunityUserUseCase {
  constructor(
    private readonly userRepository: CommunityUserRepositoryPort,
    private readonly passwordHasher: PasswordHasherPort,
    private readonly jwtService: JwtService,
    private readonly mailSender: MailSenderPort,
    private readonly configService: ConfigService,
    private readonly rbacPermissions: RbacPermissionsService,
  ) {}

  async login(
    input: LoginCredentialsInput,
  ): Promise<AuthenticatedSessionOutput> {
    const user = await this.userRepository.findByUsernameOrDocument(
      input.username.trim(),
    );

    if (!user || !user.isActive) {
      // Mitigacion de timing side-channel cuando el usuario no existe
      await this.passwordHasher.verifyDummy(input.password);
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

    // Rehash transparente automatico de bcrypt legado (Laravel) hacia scrypt moderno
    if (this.passwordHasher.needsRehash(user.passwordHash)) {
      const upgradedHash = await this.passwordHasher.hash(input.password);
      await this.userRepository.updatePasswordHash(user.id, upgradedHash);
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
    const session = await this.userRepository.createAuthSession({
      schoolId: targetMembership.schoolId,
      userId: user.id,
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent ?? null,
      expiresAt: new Date(Date.now() + SESSION_DURATION_MS),
    });

    await this.userRepository.updateLastLoginAt(user.id);

    const accessToken = await this.jwtService.signAsync({
      sub: Number(user.id),
      username: user.username,
      fullName: user.fullName,
      schoolId: Number(targetMembership.schoolId),
      activeRole: targetMembership.role,
      academicYear: currentYear,
      sid: session.id,
      jti: session.tokenJti,
      tokenType: 'ACCESS',
    });

    const rbac = await this.rbacPermissions.resolveEffectiveAccess(
      targetMembership.schoolId,
      user.id,
      targetMembership.role,
    );

    return {
      accessToken,
      sessionId: session.id,
      activeSchoolId: Number(targetMembership.schoolId),
      activeSchoolName: targetMembership.schoolName,
      activeRole: targetMembership.role,
      academicYear: currentYear,
      permissions: rbac.permissions,
      enabledModules: rbac.enabledModules,
      user: user.toPublicProfile(),
    };
  }

  /**
   * Cambio de colegio o rol verificado y firmado en el servidor (reemplaza manipulacion de cliente)
   * con rotacion de sesion en `auth_sessions`.
   */
  async switchSchoolContext(
    input: SwitchContextInput,
  ): Promise<AuthenticatedSessionOutput> {
    const user = await this.userRepository.findById(input.userId);
    if (!user || !user.isActive) {
      throw new ResourceNotFoundException('CommunityUser', input.userId);
    }

    const verifiedMembership = user.verifySchoolRoleMembership(
      input.schoolId,
      input.role,
    );

    const academicYear = input.academicYear ?? new Date().getFullYear();

    if (input.currentSchoolId && input.currentSessionId) {
      await this.userRepository.revokeAuthSession(
        input.currentSchoolId,
        input.currentSessionId,
        'CONTEXT_SWITCHED',
      );
    }

    const session = await this.userRepository.createAuthSession({
      schoolId: verifiedMembership.schoolId,
      userId: user.id,
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent ?? null,
      expiresAt: new Date(Date.now() + SESSION_DURATION_MS),
    });

    const accessToken = await this.jwtService.signAsync({
      sub: Number(user.id),
      username: user.username,
      fullName: user.fullName,
      schoolId: Number(verifiedMembership.schoolId),
      activeRole: verifiedMembership.role,
      academicYear,
      sid: session.id,
      jti: session.tokenJti,
      tokenType: 'ACCESS',
    });

    const rbac = await this.rbacPermissions.resolveEffectiveAccess(
      verifiedMembership.schoolId,
      user.id,
      verifiedMembership.role,
    );

    return {
      accessToken,
      sessionId: session.id,
      activeSchoolId: Number(verifiedMembership.schoolId),
      activeSchoolName: verifiedMembership.schoolName,
      activeRole: verifiedMembership.role,
      academicYear,
      permissions: rbac.permissions,
      enabledModules: rbac.enabledModules,
      user: user.toPublicProfile(),
    };
  }

  async getAuthenticatedProfile(params: {
    userId: bigint;
    activeSchoolId: bigint;
    activeRole: CommunityRole;
    academicYear: number;
    sessionId: string;
  }): Promise<Record<string, unknown>> {
    const user = await this.userRepository.findById(params.userId);
    if (!user || !user.isActive) {
      throw new ResourceNotFoundException('CommunityUser', params.userId);
    }

    const activeMembership = user.memberships.find(
      (m) =>
        m.schoolId === params.activeSchoolId && m.role === params.activeRole,
    );

    const rbac = await this.rbacPermissions.resolveEffectiveAccess(
      params.activeSchoolId,
      params.userId,
      params.activeRole,
    );

    return {
      sessionId: params.sessionId,
      activeSchoolId: Number(params.activeSchoolId),
      activeSchoolName: activeMembership?.schoolName ?? '',
      activeRole: params.activeRole,
      academicYear: params.academicYear,
      permissions: rbac.permissions,
      enabledModules: rbac.enabledModules,
      user: user.toPublicProfile(),
    };
  }

  async logoutSession(params: {
    schoolId: bigint;
    sessionId: string;
  }): Promise<{ revoked: boolean }> {
    if (params.sessionId) {
      await this.userRepository.revokeAuthSession(
        params.schoolId,
        params.sessionId,
        'USER_LOGOUT',
      );
    }
    return { revoked: true };
  }

  async logoutAllSessions(userId: bigint): Promise<{ revokedAll: boolean }> {
    await this.userRepository.revokeAllUserSessions(userId, 'USER_LOGOUT_ALL');
    return { revokedAll: true };
  }

  /**
   * Emite un token criptografico de un solo uso (hash SHA-256 en user_security_tokens)
   * y envia el correo de confirmacion mediante Nodemailer.
   */
  async requestEmailConfirmation(
    userId: bigint,
    requestedIp?: string,
  ): Promise<{
    confirmationToken: string;
    mailDelivery: MailDeliveryResult;
  }> {
    const user = await this.userRepository.findById(userId);
    if (!user || !user.email) {
      throw new ResourceNotFoundException('CommunityUser (Email)', userId);
    }

    await this.userRepository.revokePendingSecurityTokens(
      user.id,
      'EMAIL_VERIFICATION',
    );

    const rawToken = crypto.randomBytes(32).toString('base64url');
    const tokenHash = this.hashSecurityToken(rawToken);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.userRepository.createSecurityToken({
      userId: user.id,
      tokenType: 'EMAIL_VERIFICATION',
      tokenHash,
      targetEmail: user.email,
      requestedIp: requestedIp ?? null,
      expiresAt,
    });

    const frontendBaseUrl = this.resolveFrontendBaseUrl();
    const confirmationUrl = `${frontendBaseUrl}/auth/confirm-email?token=${encodeURIComponent(rawToken)}`;

    const mailDelivery = await this.mailSender.sendEmailConfirmation({
      recipientEmail: user.email,
      recipientFullName: user.fullName,
      schoolName: user.memberships[0]?.schoolName ?? 'ASAIE ÉXODO',
      confirmationToken: rawToken,
      confirmationUrl,
    });

    return {
      confirmationToken: rawToken,
      mailDelivery,
    };
  }

  /**
   * Consume atomicamente el token de confirmacion de un solo uso y marca email_verified_at.
   */
  async confirmEmailToken(token: string): Promise<{
    verified: boolean;
    userId: number;
  }> {
    const tokenHash = this.hashSecurityToken(token.trim());
    const consumed = await this.userRepository.consumeSecurityToken(
      tokenHash,
      'EMAIL_VERIFICATION',
    );

    if (!consumed) {
      throw new BadRequestException(
        'El token de confirmación es inválido, ya fue utilizado o ha expirado.',
      );
    }

    const user = await this.userRepository.findById(consumed.userId);
    if (
      !user ||
      !user.isActive ||
      (consumed.targetEmail && user.email !== consumed.targetEmail)
    ) {
      throw new BadRequestException(
        'El correo electrónico de la cuenta ya no coincide con el token de verificación.',
      );
    }

    await this.userRepository.markEmailVerified(consumed.userId);
    return {
      verified: true,
      userId: Number(consumed.userId),
    };
  }

  /**
   * Emite un token temporal de un solo uso (30 min) en user_security_tokens y envia correo.
   * Protegido contra enumeracion de usuarios: jamas revela si la cuenta existe ni su correo real.
   */
  async requestPasswordReset(input: ForgotPasswordInput): Promise<{
    accepted: boolean;
    expiresInMinutes: number;
    resetToken?: string;
    mailDelivery?: MailDeliveryResult;
  }> {
    const expiresInMinutes = 30;
    const user = await this.userRepository.findByUsernameOrDocument(
      input.identifier.trim(),
    );

    if (!user || !user.isActive || !user.email) {
      // Mitigacion de timing / enumeracion de usuarios
      await this.passwordHasher.verifyDummy(input.identifier);
      return {
        accepted: true,
        expiresInMinutes,
      };
    }

    await this.userRepository.revokePendingSecurityTokens(
      user.id,
      'PASSWORD_RESET',
    );

    const rawToken = crypto.randomBytes(32).toString('base64url');
    const tokenHash = this.hashSecurityToken(rawToken);
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

    await this.userRepository.createSecurityToken({
      userId: user.id,
      tokenType: 'PASSWORD_RESET',
      tokenHash,
      targetEmail: user.email,
      requestedIp: input.requestedIp ?? null,
      expiresAt,
    });

    const frontendBaseUrl = this.resolveFrontendBaseUrl();
    const resetUrl = `${frontendBaseUrl}/auth/reset-password?token=${encodeURIComponent(rawToken)}`;

    const mailDelivery = await this.mailSender.sendPasswordResetEmail({
      recipientEmail: user.email,
      recipientFullName: user.fullName,
      resetToken: rawToken,
      resetUrl,
      expiresInMinutes,
    });

    return {
      accepted: true,
      expiresInMinutes,
      resetToken: rawToken,
      mailDelivery,
    };
  }

  /**
   * Restablece la contrasena consumiendo el token de un solo uso, revoca TODAS las sesiones activas
   * y envia alerta de seguridad por correo.
   */
  async resetPasswordWithToken(input: ResetPasswordInput): Promise<{
    updated: boolean;
    userId: number;
    mailDelivery: MailDeliveryResult | null;
  }> {
    const tokenHash = this.hashSecurityToken(input.resetToken.trim());
    const consumed = await this.userRepository.consumeSecurityToken(
      tokenHash,
      'PASSWORD_RESET',
    );

    if (!consumed) {
      throw new BadRequestException(
        'El enlace de recuperación es inválido, ya fue utilizado o ha expirado.',
      );
    }

    const user = await this.userRepository.findById(consumed.userId);
    if (!user || !user.isActive) {
      throw new ResourceNotFoundException('CommunityUser', consumed.userId);
    }

    const newHash = await this.passwordHasher.hash(input.newPassword);
    await this.userRepository.updatePasswordHash(user.id, newHash);
    await this.userRepository.revokeAllUserSessions(
      user.id,
      'PASSWORD_RESET_COMPLETED',
    );

    let mailDelivery: MailDeliveryResult | null = null;
    if (user.email) {
      mailDelivery = await this.mailSender.sendPasswordChangedAlert({
        recipientEmail: user.email,
        recipientFullName: user.fullName,
        changedAtIso: new Date().toISOString(),
      });
    }

    return {
      updated: true,
      userId: Number(user.id),
      mailDelivery,
    };
  }

  /**
   * Cambia la contrasena del usuario autenticado verificando su clave actual,
   * impidiendo reutilizar la misma clave, revocando otras sesiones y disparando alerta por correo.
   */
  async changePassword(input: ChangePasswordInput): Promise<{
    updated: boolean;
    mailDelivery: MailDeliveryResult | null;
  }> {
    const user = await this.userRepository.findById(input.userId);
    if (!user || !user.isActive) {
      throw new ResourceNotFoundException('CommunityUser', input.userId);
    }

    const validCurrent = await this.passwordHasher.verify(
      input.currentPassword,
      user.passwordHash,
    );
    if (!validCurrent) {
      throw new UnauthorizedException('La contraseña actual es incorrecta.');
    }

    if (input.currentPassword === input.newPassword) {
      throw new BadRequestException(
        'La nueva contraseña debe ser diferente a la contraseña actual.',
      );
    }

    const newHash = await this.passwordHasher.hash(input.newPassword);
    await this.userRepository.updatePasswordHash(user.id, newHash);
    await this.userRepository.revokeAllUserSessions(
      user.id,
      'PASSWORD_CHANGED',
      input.currentSessionId,
    );

    let mailDelivery: MailDeliveryResult | null = null;
    if (user.email) {
      mailDelivery = await this.mailSender.sendPasswordChangedAlert({
        recipientEmail: user.email,
        recipientFullName: user.fullName,
        changedAtIso: new Date().toISOString(),
      });
    }

    return {
      updated: true,
      mailDelivery,
    };
  }

  /**
   * Actualiza los datos basicos del perfil del usuario autenticado (derivado del JWT).
   */
  async updateOwnProfile(input: {
    userId: bigint;
    firstName: string;
    middleName?: string | null;
    lastName: string;
    secondLastName?: string | null;
    email?: string | null;
    phone?: string | null;
    avatarUrl?: string | null;
  }): Promise<Record<string, unknown>> {
    const existing = await this.userRepository.findById(input.userId);
    if (!existing || !existing.isActive) {
      throw new ResourceNotFoundException('CommunityUser', input.userId);
    }

    const updated = await this.userRepository.updateOwnProfile(input.userId, {
      firstName: input.firstName,
      middleName: input.middleName,
      lastName: input.lastName,
      secondLastName: input.secondLastName,
      email: input.email,
      phone: input.phone,
      avatarUrl: input.avatarUrl,
    });

    return updated.toPublicProfile();
  }

  /**
   * Actualiza el nombre de usuario (username) validando la contrasena actual y unicidad.
   */
  async changeOwnUsername(input: {
    userId: bigint;
    currentPassword: string;
    newUsername: string;
  }): Promise<Record<string, unknown>> {
    const existing = await this.userRepository.findById(input.userId);
    if (!existing || !existing.isActive) {
      throw new ResourceNotFoundException('CommunityUser', input.userId);
    }

    const validPassword = await this.passwordHasher.verify(
      input.currentPassword,
      existing.passwordHash,
    );
    if (!validPassword) {
      throw new UnauthorizedException('La contraseña actual es incorrecta.');
    }

    const normalizedUsername = input.newUsername.trim().toLowerCase();
    if (normalizedUsername === existing.username.toLowerCase()) {
      throw new BadRequestException(
        'El nuevo nombre de usuario debe ser diferente al actual.',
      );
    }

    const updated = await this.userRepository.updateUsername(
      input.userId,
      normalizedUsername,
    );
    return updated.toPublicProfile();
  }

  private hashSecurityToken(rawToken: string): string {
    return crypto.createHash('sha256').update(rawToken).digest('hex');
  }

  private resolveFrontendBaseUrl(): string {
    return this.configService
      .get<string>('FRONTEND_URL', 'http://localhost:7200')
      .replace(/\/+$/, '');
  }
}
