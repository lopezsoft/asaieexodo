import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  MailDeliveryResult,
  MailSenderPort,
} from '../../../../shared/application/ports/mail-sender.port';
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

export interface ChangePasswordInput {
  readonly userId: bigint;
  readonly currentPassword: string;
  readonly newPassword: string;
}

export interface ForgotPasswordInput {
  readonly identifier: string;
}

export interface ResetPasswordInput {
  readonly resetToken: string;
  readonly newPassword: string;
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
    private readonly mailSender: MailSenderPort,
    private readonly configService: ConfigService,
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

  /**
   * Envia correo de confirmacion de cuenta mediante Nodemailer con un token firmado.
   */
  async requestEmailConfirmation(userId: bigint): Promise<{
    confirmationToken: string;
    mailDelivery: MailDeliveryResult;
  }> {
    const user = await this.userRepository.findById(userId);
    if (!user || !user.email) {
      throw new ResourceNotFoundException('CommunityUser (Email)', userId);
    }

    const confirmationToken = await this.jwtService.signAsync(
      {
        sub: Number(user.id),
        purpose: 'EMAIL_CONFIRMATION',
        email: user.email,
      },
      { expiresIn: '24h' },
    );

    const frontendBaseUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:7200',
    );
    const confirmationUrl = `${frontendBaseUrl}/auth/confirm-email?token=${encodeURIComponent(confirmationToken)}`;

    const mailDelivery = await this.mailSender.sendEmailConfirmation({
      recipientEmail: user.email,
      recipientFullName: user.fullName,
      schoolName: user.memberships[0]?.schoolName ?? 'ASAIE ÉXODO',
      confirmationToken,
      confirmationUrl,
    });

    return {
      confirmationToken,
      mailDelivery,
    };
  }

  /**
   * Valida el token de confirmacion de correo y marca email_verified_at en la tabla users.
   */
  async confirmEmailToken(token: string): Promise<{
    verified: boolean;
    userId: number;
  }> {
    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: number;
        purpose: string;
      }>(token);

      if (payload.purpose !== 'EMAIL_CONFIRMATION') {
        throw new BadRequestException('Token de verificación inválido.');
      }

      await this.userRepository.markEmailVerified(BigInt(payload.sub));
      return {
        verified: true,
        userId: payload.sub,
      };
    } catch {
      throw new BadRequestException(
        'El token de confirmación es inválido o ha expirado.',
      );
    }
  }

  /**
   * Genera un token temporal de recuperacion de contrasena (30 minutos) y lo envia por correo mediante Nodemailer.
   */
  async requestPasswordReset(input: ForgotPasswordInput): Promise<{
    resetToken: string;
    expiresInMinutes: number;
    mailDelivery: MailDeliveryResult;
  }> {
    const user = await this.userRepository.findByUsernameOrDocument(
      input.identifier.trim(),
    );

    if (!user || !user.email) {
      throw new ResourceNotFoundException('CommunityUser', input.identifier);
    }

    const expiresInMinutes = 30;
    const resetToken = await this.jwtService.signAsync(
      {
        sub: Number(user.id),
        purpose: 'PASSWORD_RESET',
      },
      { expiresIn: `${expiresInMinutes}m` },
    );

    const frontendBaseUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:7200',
    );
    const resetUrl = `${frontendBaseUrl}/auth/reset-password?token=${encodeURIComponent(resetToken)}`;

    const mailDelivery = await this.mailSender.sendPasswordResetEmail({
      recipientEmail: user.email,
      recipientFullName: user.fullName,
      resetToken,
      resetUrl,
      expiresInMinutes,
    });

    return {
      resetToken,
      expiresInMinutes,
      mailDelivery,
    };
  }

  /**
   * Restablece la contrasena usando el token temporal y envia alerta de seguridad por correo.
   */
  async resetPasswordWithToken(input: ResetPasswordInput): Promise<{
    updated: boolean;
    userId: number;
    mailDelivery: MailDeliveryResult | null;
  }> {
    let payload: { sub: number; purpose: string };
    try {
      payload = await this.jwtService.verifyAsync<{
        sub: number;
        purpose: string;
      }>(input.resetToken);
    } catch {
      throw new BadRequestException(
        'El enlace de recuperación es inválido o ha expirado.',
      );
    }

    if (payload.purpose !== 'PASSWORD_RESET') {
      throw new BadRequestException('Token de recuperación no válido.');
    }

    const user = await this.userRepository.findById(BigInt(payload.sub));
    if (!user) {
      throw new ResourceNotFoundException('CommunityUser', payload.sub);
    }

    const newHash = await this.passwordHasher.hash(input.newPassword);
    await this.userRepository.updatePasswordHash(user.id, newHash);

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
   * Cambia la contrasena verificando la clave actual y dispara alerta de seguridad por correo (Nodemailer).
   */
  async changePassword(input: ChangePasswordInput): Promise<{
    updated: boolean;
    mailDelivery: MailDeliveryResult | null;
  }> {
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new ResourceNotFoundException('CommunityUser', input.userId);
    }

    const validCurrent = await this.passwordHasher.verify(
      input.currentPassword,
      user.passwordHash,
    );
    if (!validCurrent) {
      throw new UnauthorizedException('La contraseña actual es incorrecta.');
    }

    const newHash = await this.passwordHasher.hash(input.newPassword);
    await this.userRepository.updatePasswordHash(user.id, newHash);

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
}
