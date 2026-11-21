import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiProperty,
  ApiPropertyOptional,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { FastifyRequest } from 'fastify';
import { ActiveTenantContext } from '../../../../shared/application/context/tenant-context.service';
import {
  CurrentUser,
  Public,
  RateLimit,
} from '../../../../shared/infrastructure/http/decorators/security.decorators';
import { AuthenticateCommunityUserUseCase } from '../../application/use-cases/authenticate-community-user.use-case';
import { CommunityRole } from '../../domain/enums/community-role.enum';

export class LoginCredentialsRequestDto {
  @ApiProperty({
    example: 'admin.comunidad',
    description: 'Nombre de usuario o número de documento de identidad',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  username!: string;

  @ApiProperty({
    example: 'Asaie2026*',
    description: 'Contraseña de acceso',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  password!: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'ID opcional de la institución educativa inicial',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  preferredSchoolId?: number;

  @ApiPropertyOptional({
    enum: CommunityRole,
    description: 'Rol institucional inicial deseado',
  })
  @IsOptional()
  @IsEnum(CommunityRole)
  preferredRole?: CommunityRole;
}

export class SwitchContextRequestDto {
  @ApiProperty({
    example: 7,
    description: 'ID del colegio destino al cual pertenece el usuario autenticado',
  })
  @IsInt()
  @Min(1)
  schoolId!: number;

  @ApiProperty({
    enum: CommunityRole,
    example: CommunityRole.FAMILY,
    description: 'Rol destino autorizado para el usuario autenticado en el colegio',
  })
  @IsEnum(CommunityRole)
  role!: CommunityRole;

  @ApiPropertyOptional({
    example: 2026,
    description: 'Año lectivo de trabajo (opcional)',
  })
  @IsOptional()
  @IsInt()
  @Min(1990)
  @Max(2100)
  academicYear?: number;
}

export class ConfirmEmailTokenDto {
  @ApiProperty({
    description: 'Token criptográfico de un solo uso enviado al correo mediante Nodemailer',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(512)
  token!: string;
}

export class ForgotPasswordRequestDto {
  @ApiProperty({
    example: 'admin.comunidad',
    description: 'Nombre de usuario o número de documento de identidad',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  identifier!: string;
}

export class ResetPasswordRequestDto {
  @ApiProperty({
    description: 'Token temporal de un solo uso recibido por correo (30 min)',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(512)
  resetToken!: string;

  @ApiProperty({ example: 'Asaie2026*', description: 'Nueva contraseña segura (8-128 caracteres)' })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  newPassword!: string;
}

export class ChangePasswordRequestDto {
  @ApiProperty({ example: 'Asaie2026*', description: 'Contraseña actual' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  currentPassword!: string;

  @ApiProperty({ example: 'Asaie2026#Nueva', description: 'Nueva contraseña (8-128 caracteres)' })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  newPassword!: string;
}

export class UpdateOwnProfileRequestDto {
  @ApiProperty({ example: 'Carlos', description: 'Primer nombre' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(80)
  firstName!: string;

  @ApiPropertyOptional({ example: 'Andrés', description: 'Segundo nombre' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  middleName?: string | null;

  @ApiProperty({ example: 'López', description: 'Primer apellido' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(80)
  lastName!: string;

  @ApiPropertyOptional({ example: 'Martínez', description: 'Segundo apellido' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  secondLastName?: string | null;

  @ApiPropertyOptional({ example: 'usuario@colegio.edu.co', description: 'Correo electrónico' })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string | null;

  @ApiPropertyOptional({ example: '3001234567', description: 'Teléfono de contacto' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string | null;

  @ApiPropertyOptional({ description: 'URL pública o clave S3 del avatar' })
  @IsOptional()
  @IsString()
  @MaxLength(1024)
  avatarUrl?: string | null;
}

export class ChangeUsernameRequestDto {
  @ApiProperty({ example: 'Asaie2026*', description: 'Contraseña actual para confirmar el cambio' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  currentPassword!: string;

  @ApiProperty({ example: 'rector.principal', description: 'Nuevo nombre de usuario (3-100 caracteres)' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  @Matches(/^[a-zA-Z0-9._@-]+$/, {
    message: 'El nombre de usuario solo permite letras, números y los símbolos . _ @ -',
  })
  newUsername!: string;
}

@ApiTags('IAM & Community Auth')
@Controller('auth')
export class IamController {
  constructor(
    private readonly authUseCase: AuthenticateCommunityUserUseCase,
  ) {}

  @Public()
  @RateLimit(10, 60)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Iniciar sesión unificada para toda la Comunidad Educativa',
    description:
      'Autentica a Directivos, Administrativos, Docentes, Estudiantes y Padres/Acudientes retornando su sesión activa persistida en `auth_sessions`, token JWT firmado y membresías en múltiples colegios.',
  })
  @ApiResponse({
    status: 200,
    description: 'Autenticación exitosa con token JWT y membresías multi-colegio.',
  })
  async login(
    @Body() body: LoginCredentialsRequestDto,
    @Req() request: FastifyRequest,
  ): Promise<Record<string, unknown>> {
    const session = await this.authUseCase.login({
      username: body.username,
      password: body.password,
      preferredSchoolId: body.preferredSchoolId,
      preferredRole: body.preferredRole,
      ipAddress: request.ip,
      userAgent: String(request.headers['user-agent'] ?? ''),
    });
    return {
      success: true,
      data: session,
    };
  }

  @Get('me')
  @ApiBearerAuth('jwt-auth')
  @ApiOperation({
    summary: 'Consultar perfil y contexto institucional activo del usuario autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil y membresías vigentes del usuario autenticado.',
  })
  async getAuthenticatedProfile(
    @CurrentUser() principal: ActiveTenantContext,
  ): Promise<Record<string, unknown>> {
    const profile = await this.authUseCase.getAuthenticatedProfile({
      userId: principal.userId,
      activeSchoolId: principal.schoolId,
      activeRole: principal.activeRole,
      academicYear: principal.academicYear,
      sessionId: principal.sessionId,
    });
    return {
      success: true,
      data: profile,
    };
  }

  @Post('switch-context')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('jwt-auth')
  @ApiOperation({
    summary: 'Cambiar de Colegio o Rol sin cerrar sesión (Context Switcher seguro)',
    description:
      'Exige JWT válido y deriva `userId` exclusivamente del token autenticado. Verifica membresía en BD, rota `auth_sessions` y emite un nuevo JWT para RLS.',
  })
  @ApiResponse({
    status: 200,
    description: 'Contexto institucional y rol actualizados exitosamente.',
  })
  async switchSchoolContext(
    @CurrentUser() principal: ActiveTenantContext,
    @Body() body: SwitchContextRequestDto,
    @Req() request: FastifyRequest,
  ): Promise<Record<string, unknown>> {
    const session = await this.authUseCase.switchSchoolContext({
      userId: principal.userId,
      currentSchoolId: principal.schoolId,
      currentSessionId: principal.sessionId,
      schoolId: BigInt(body.schoolId),
      role: body.role,
      academicYear: body.academicYear,
      ipAddress: request.ip,
      userAgent: String(request.headers['user-agent'] ?? ''),
    });
    return {
      success: true,
      data: session,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('jwt-auth')
  @ApiOperation({
    summary: 'Cerrar la sesión activa revocándola inmediatamente en auth_sessions',
  })
  @ApiResponse({ status: 200, description: 'Sesión revocada exitosamente.' })
  async logout(
    @CurrentUser() principal: ActiveTenantContext,
  ): Promise<Record<string, unknown>> {
    const result = await this.authUseCase.logoutSession({
      schoolId: principal.schoolId,
      sessionId: principal.sessionId,
    });
    return {
      success: true,
      data: result,
    };
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('jwt-auth')
  @ApiOperation({
    summary: 'Cerrar todas las sesiones activas del usuario en todos los colegios',
  })
  @ApiResponse({ status: 200, description: 'Todas las sesiones fueron revocadas.' })
  async logoutAll(
    @CurrentUser() principal: ActiveTenantContext,
  ): Promise<Record<string, unknown>> {
    const result = await this.authUseCase.logoutAllSessions(principal.userId);
    return {
      success: true,
      data: result,
    };
  }

  @RateLimit(3, 300)
  @Post('request-email-confirmation')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('jwt-auth')
  @ApiOperation({
    summary: 'Enviar correo de confirmación de cuenta del usuario autenticado (Nodemailer)',
    description:
      'Emite un token de un solo uso (24h) para el usuario autenticado en el JWT y lo envía mediante `NodemailerSmtpMailAdapter`.',
  })
  @ApiResponse({
    status: 200,
    description: 'Correo de confirmación procesado exitosamente.',
  })
  async requestEmailConfirmation(
    @CurrentUser() principal: ActiveTenantContext,
    @Req() request: FastifyRequest,
  ): Promise<Record<string, unknown>> {
    const result = await this.authUseCase.requestEmailConfirmation(
      principal.userId,
      request.ip,
    );
    return {
      success: true,
      data: {
        delivered: result.mailDelivery.delivered,
        templateType: result.mailDelivery.templateType,
      },
    };
  }

  @Public()
  @RateLimit(10, 60)
  @Post('confirm-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Confirmar dirección de correo electrónico mediante token de un solo uso',
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

  @Public()
  @RateLimit(5, 300)
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Solicitar recuperación de contraseña por correo (anti-enumeración)',
    description:
      'Si la cuenta existe y posee correo registrado, envía un enlace de un solo uso válido por 30 minutos. Siempre retorna respuesta genérica para evitar enumeración de cuentas.',
  })
  @ApiResponse({
    status: 200,
    description: 'Solicitud de recuperación procesada.',
  })
  async forgotPassword(
    @Body() dto: ForgotPasswordRequestDto,
    @Req() request: FastifyRequest,
  ): Promise<Record<string, unknown>> {
    const result = await this.authUseCase.requestPasswordReset({
      identifier: dto.identifier,
      requestedIp: request.ip,
    });
    return {
      success: true,
      data: {
        accepted: result.accepted,
        expiresInMinutes: result.expiresInMinutes,
        message:
          'Si la cuenta existe y cuenta con un correo registrado, recibirás las instrucciones de recuperación en los próximos minutos.',
      },
    };
  }

  @Public()
  @RateLimit(5, 300)
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Restablecer contraseña con token temporal de un solo uso y revocar sesiones',
  })
  @ApiResponse({
    status: 200,
    description: 'Contraseña restablecida, sesiones revocadas y alerta enviada por correo.',
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
      data: {
        updated: result.updated,
        userId: result.userId,
        alertDelivered: result.mailDelivery?.delivered ?? false,
      },
    };
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('jwt-auth')
  @ApiOperation({
    summary: 'Cambiar contraseña del usuario autenticado y notificar alerta por correo',
  })
  @ApiResponse({
    status: 200,
    description: 'Contraseña actualizada y sesiones secundarias revocadas.',
  })
  async changePassword(
    @CurrentUser() principal: ActiveTenantContext,
    @Body() dto: ChangePasswordRequestDto,
  ): Promise<Record<string, unknown>> {
    const result = await this.authUseCase.changePassword({
      userId: principal.userId,
      currentSessionId: principal.sessionId,
      currentPassword: dto.currentPassword,
      newPassword: dto.newPassword,
    });
    return {
      success: true,
      data: {
        updated: result.updated,
        alertDelivered: result.mailDelivery?.delivered ?? false,
      },
    };
  }

  @Patch('me')
  @ApiBearerAuth('jwt-auth')
  @ApiOperation({
    summary: 'Actualizar datos básicos y avatar del perfil del usuario autenticado',
  })
  @ApiResponse({ status: 200, description: 'Perfil actualizado exitosamente.' })
  async updateOwnProfile(
    @CurrentUser() principal: ActiveTenantContext,
    @Body() dto: UpdateOwnProfileRequestDto,
  ): Promise<Record<string, unknown>> {
    const profile = await this.authUseCase.updateOwnProfile({
      userId: principal.userId,
      firstName: dto.firstName,
      middleName: dto.middleName,
      lastName: dto.lastName,
      secondLastName: dto.secondLastName,
      email: dto.email,
      phone: dto.phone,
      avatarUrl: dto.avatarUrl,
    });
    return {
      success: true,
      data: profile,
    };
  }

  @Patch('username')
  @RateLimit(5, 300)
  @ApiBearerAuth('jwt-auth')
  @ApiOperation({
    summary: 'Cambiar nombre de usuario verificando la contraseña actual',
  })
  @ApiResponse({ status: 200, description: 'Nombre de usuario actualizado.' })
  async changeUsername(
    @CurrentUser() principal: ActiveTenantContext,
    @Body() dto: ChangeUsernameRequestDto,
  ): Promise<Record<string, unknown>> {
    const profile = await this.authUseCase.changeOwnUsername({
      userId: principal.userId,
      currentPassword: dto.currentPassword,
      newUsername: dto.newUsername,
    });
    return {
      success: true,
      data: profile,
    };
  }
}
