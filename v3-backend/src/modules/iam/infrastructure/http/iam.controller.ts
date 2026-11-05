import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiProperty,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, MinLength } from 'class-validator';
import {
  AuthenticateCommunityUserUseCase,
  LoginCredentialsInput,
} from '../../application/use-cases/authenticate-community-user.use-case';
import { CommunityRole } from '../../domain/enums/community-role.enum';

interface SwitchContextDto {
  readonly userId: number;
  readonly schoolId: number;
  readonly role: CommunityRole;
  readonly academicYear?: number;
}

export class RequestEmailConfirmationDto {
  @ApiProperty({ example: 1, description: 'ID del usuario que solicita confirmar su correo' })
  @IsInt()
  userId!: number;
}

export class ConfirmEmailTokenDto {
  @ApiProperty({ description: 'Token JWT de confirmación enviado al correo mediante Nodemailer' })
  @IsString()
  @IsNotEmpty()
  token!: string;
}

export class ForgotPasswordRequestDto {
  @ApiProperty({
    example: 'admin.comunidad',
    description: 'Nombre de usuario o número de documento de identidad',
  })
  @IsString()
  @IsNotEmpty()
  identifier!: string;
}

export class ResetPasswordRequestDto {
  @ApiProperty({ description: 'Token temporal de recuperación recibido por correo (30 min)' })
  @IsString()
  @IsNotEmpty()
  resetToken!: string;

  @ApiProperty({ example: 'Asaie2026*', description: 'Nueva contraseña segura' })
  @IsString()
  @MinLength(8)
  newPassword!: string;
}

export class ChangePasswordRequestDto {
  @ApiProperty({ example: 1, description: 'ID del usuario autenticado' })
  @IsInt()
  userId!: number;

  @ApiProperty({ example: 'Asaie2026*', description: 'Contraseña actual' })
  @IsString()
  @IsNotEmpty()
  currentPassword!: string;

  @ApiProperty({ example: 'Asaie2026*', description: 'Nueva contraseña' })
  @IsString()
  @MinLength(8)
  newPassword!: string;
}

@ApiTags('IAM & Community Auth')
@Controller('auth')
export class IamController {
  constructor(
    private readonly authUseCase: AuthenticateCommunityUserUseCase,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Iniciar sesión unificada para toda la Comunidad Educativa',
    description:
      'Autentica a Directivos, Administrativos, Docentes, Estudiantes y Padres/Acudientes retornando su sesión activa y todas sus membresías (`user_school_memberships`) en múltiples colegios.',
  })
  @ApiResponse({
    status: 200,
    description: 'Autenticación exitosa con token JWT y membresías multi-colegio.',
  })
  async login(
    @Body() body: LoginCredentialsInput,
  ): Promise<Record<string, unknown>> {
    const session = await this.authUseCase.login(body);
    return {
      success: true,
      data: session,
    };
  }

  @Post('switch-context')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('jwt-auth')
  @ApiOperation({
    summary: 'Cambiar de Colegio o Rol sin cerrar sesión (Context Switcher)',
    description:
      'Permite que un usuario que pertenece a múltiples colegios (ej. Docente en Colegio A y Acudiente en Colegio B) cambie su contexto activo (`school_id`, `role`, `academic_year`) emitiendo un nuevo JWT para RLS.',
  })
  @ApiResponse({
    status: 200,
    description: 'Contexto institucional y rol actualizados exitosamente.',
  })
  async switchSchoolContext(
    @Body() body: SwitchContextDto,
  ): Promise<Record<string, unknown>> {
    const session = await this.authUseCase.switchSchoolContext({
      userId: BigInt(body.userId),
      schoolId: BigInt(body.schoolId),
      role: body.role,
      academicYear: body.academicYear,
    });
    return {
      success: true,
      data: session,
    };
  }

  @Post('request-email-confirmation')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('jwt-auth')
  @ApiOperation({
    summary: 'Enviar correo de confirmación de cuenta mediante Nodemailer SMTP',
    description:
      'Genera un token firmado por 24 horas y envía la plantilla institucional de verificación de correo a través de `NodemailerSmtpMailAdapter`.',
  })
  @ApiResponse({
    status: 200,
    description: 'Correo de confirmación enviado exitosamente.',
  })
  async requestEmailConfirmation(
    @Body() dto: RequestEmailConfirmationDto,
  ): Promise<Record<string, unknown>> {
    const result = await this.authUseCase.requestEmailConfirmation(
      BigInt(dto.userId),
    );
    return {
      success: true,
      data: {
        mailDelivery: result.mailDelivery,
      },
    };
  }

  @Post('confirm-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Confirmar dirección de correo electrónico mediante token',
    description:
      'Verifica el token firmado enviado por correo y registra `email_verified_at` en la tabla `users`.',
  })
  @ApiResponse({
    status: 200,
    description: 'Correo electrónico confirmado exitosamente.',
  })
  async confirmEmail(
    @Body() dto: ConfirmEmailTokenDto,
  ): Promise<Record<string, unknown>> {
    const result = await this.authUseCase.confirmEmailToken(dto.token);
    return {
      success: true,
      data: result,
    };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Solicitar recuperación de contraseña por correo (Nodemailer SMTP)',
    description:
      'Genera un enlace temporal válido por 30 minutos y lo envía al correo registrado del miembro de la comunidad educativa mediante `NodemailerSmtpMailAdapter`.',
  })
  @ApiResponse({
    status: 200,
    description: 'Enlace de recuperación enviado al correo registrado.',
  })
  async forgotPassword(
    @Body() dto: ForgotPasswordRequestDto,
  ): Promise<Record<string, unknown>> {
    const result = await this.authUseCase.requestPasswordReset({
      identifier: dto.identifier,
    });
    return {
      success: true,
      data: {
        expiresInMinutes: result.expiresInMinutes,
        mailDelivery: result.mailDelivery,
      },
    };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Restablecer contraseña con token temporal y enviar alerta por correo',
    description:
      'Valida el token temporal de recuperación, actualiza el hash `scrypt` en `users` y envía una alerta de seguridad por correo mediante `NodemailerSmtpMailAdapter`.',
  })
  @ApiResponse({
    status: 200,
    description: 'Contraseña restablecida y alerta enviada por correo.',
  })
  async resetPassword(
    @Body() dto: ResetPasswordRequestDto,
  ): Promise<Record<string, unknown>> {
    const result = await this.authUseCase.resetPasswordWithToken({
      resetToken: dto.resetToken,
      newPassword: dto.newPassword,
    });
    return {
      success: true,
      data: result,
    };
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('jwt-auth')
  @ApiOperation({
    summary: 'Cambiar contraseña autenticada y notificar alerta por correo (Nodemailer)',
    description:
      'Verifica la contraseña actual del usuario, actualiza su clave y dispara una notificación automática de seguridad al correo institucional.',
  })
  @ApiResponse({
    status: 200,
    description: 'Contraseña actualizada y notificación de seguridad enviada.',
  })
  async changePassword(
    @Body() dto: ChangePasswordRequestDto,
  ): Promise<Record<string, unknown>> {
    const result = await this.authUseCase.changePassword({
      userId: BigInt(dto.userId),
      currentPassword: dto.currentPassword,
      newPassword: dto.newPassword,
    });
    return {
      success: true,
      data: result,
    };
  }
}
