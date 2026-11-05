import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
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
}
