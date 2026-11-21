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
import { RegisterSchoolUseCase } from '../../application/use-cases/register-school.use-case';
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

export class RegisterSchoolRequestDto {
  @ApiProperty({
    example: 'INSTITUCIÓN EDUCATIVA NUEVO HORIZONTE',
    description: 'Nombre oficial de la Institución Educativa',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(250)
  schoolName!: string;

  @ApiPropertyOptional({ example: 'IE NUEVO HORIZONTE', description: 'Nombre corto o siglas' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  shortName?: string;

  @ApiPropertyOptional({ example: '323580006675', description: 'Código DANE oficial' })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Za-z0-9-]{4,30}$/, {
    message: 'El código DANE debe tener entre 4 y 30 caracteres alfanuméricos o guiones.',
  })
  daneCode?: string;

  @ApiPropertyOptional({ example: '900123456-7', description: 'NIT institucional' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  taxId?: string;

  @ApiPropertyOptional({ example: 1, description: 'ID del calendario académico' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  calendarId?: number;

  @ApiPropertyOptional({ example: 1, description: 'ID del sector educativo (Oficial / No Oficial)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  sectorId?: number;

  @ApiPropertyOptional({ example: 1, description: 'ID del tipo de establecimiento (Institución / Centro)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  institutionTypeId?: number;

  @ApiPropertyOptional({ example: 'contacto@colegio.edu.co', description: 'Correo institucional' })
  @IsOptional()
  @IsEmail()
  @MaxLength(180)
  schoolEmail?: string;

  @ApiPropertyOptional({ example: '3001234567', description: 'Teléfono de la institución' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  schoolPhone?: string;

  @ApiPropertyOptional({ example: 'Calle 10 # 20-30', description: 'Dirección física principal' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  schoolAddress?: string;

  @ApiProperty({ example: 1, description: 'ID del tipo de documento del administrador' })
  @IsInt()
  @Min(1)
  @Max(99)
  adminDocumentTypeId!: number;

  @ApiProperty({ example: '1000234567', description: 'Número de documento del administrador' })
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(30)
  @Matches(/^[a-zA-Z0-9.-]+$/, {
    message: 'El número de documento solo admite letras, números, puntos y guiones.',
  })
  adminDocumentNumber!: string;

  @ApiProperty({ example: 'Carlos', description: 'Primer nombre del administrador' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(80)
  adminFirstName!: string;

  @ApiPropertyOptional({ example: 'Andrés', description: 'Segundo nombre del administrador' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  adminMiddleName?: string;

  @ApiProperty({ example: 'López', description: 'Primer apellido del administrador' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(80)
  adminLastName!: string;

  @ApiPropertyOptional({ example: 'Martínez', description: 'Segundo apellido del administrador' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  adminSecondLastName?: string;

  @ApiProperty({ example: 'rectoria@colegio.edu.co', description: 'Correo electrónico del administrador' })
  @IsEmail()
  @MaxLength(255)
  adminEmail!: string;

  @ApiPropertyOptional({ example: '3009876543', description: 'Teléfono del administrador' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  adminPhone?: string;

  @ApiProperty({ example: 'rector.horizonte', description: 'Nombre de usuario único de acceso' })
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(100)
  @Matches(/^[a-zA-Z0-9._@-]+$/, {
    message: 'El nombre de usuario solo permite letras, números y los símbolos . _ @ -',
  })
  username!: string;

  @ApiProperty({ example: 'Asaie2026*', description: 'Contraseña segura (mínimo 8 caracteres, mayúscula, minúscula y número)' })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message: 'La contraseña debe incluir al menos una mayúscula, una minúscula y un número.',
  })
  password!: string;
}

@ApiTags('IAM & Community Auth')
@Controller('auth')
export class IamController {
  constructor(
    private readonly authUseCase: AuthenticateCommunityUserUseCase,
    private readonly registerSchoolUseCase: RegisterSchoolUseCase,
  ) {}

  @Public()
  @RateLimit(30, 60)
  @Get('registration-catalogs')
  @ApiOperation({
    summary: 'Consultar catálogos públicos para auto-registro de nuevas Instituciones Educativas',
  })
  @ApiResponse({
    status: 200,
    description: 'Catálogos públicos de tipos de documento, calendarios, sectores y tipos de institución.',
  })
  async getPublicRegistrationCatalogs(): Promise<Record<string, unknown>> {
    const catalogs =
      await this.registerSchoolUseCase.getPublicRegistrationCatalogs();
    return {
      success: true,
      data: catalogs,
    };
  }

  @Public()
  @RateLimit(5, 300)
  @Post('register-school')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Auto-registrar una nueva Institución Educativa (IE) con aprovisionamiento inicial inmediato',
    description:
      'Crea la institución con periodo de prueba gratuito, su usuario SCHOOL_ADMIN, sede principal, año lectivo, jornadas, niveles MEN y módulos activos en una transacción RLS atómica, iniciando sesión automáticamente.',
  })
  @ApiResponse({
    status: 201,
    description: 'Institución educativa registrada, aprovisionada y autenticada exitosamente.',
  })
  async registerSchool(
    @Body() body: RegisterSchoolRequestDto,
    @Req() request: FastifyRequest,
  ): Promise<Record<string, unknown>> {
    const session = await this.registerSchoolUseCase.registerSchool({
      schoolName: body.schoolName,
      shortName: body.shortName,
      daneCode: body.daneCode,
      taxId: body.taxId,
      calendarId: body.calendarId,
      sectorId: body.sectorId,
      institutionTypeId: body.institutionTypeId,
      schoolEmail: body.schoolEmail,
      schoolPhone: body.schoolPhone,
      schoolAddress: body.schoolAddress,
      adminDocumentTypeId: body.adminDocumentTypeId,
      adminDocumentNumber: body.adminDocumentNumber,
      adminFirstName: body.adminFirstName,
      adminMiddleName: body.adminMiddleName,
      adminLastName: body.adminLastName,
      adminSecondLastName: body.adminSecondLastName,
      adminEmail: body.adminEmail,
      adminPhone: body.adminPhone,
      username: body.username,
      password: body.password,
      ipAddress: request.ip,
      userAgent: String(request.headers['user-agent'] ?? ''),
    });
    return {
      success: true,
      data: session,
    };
  }

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
