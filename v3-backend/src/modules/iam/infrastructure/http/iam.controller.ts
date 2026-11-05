import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
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

@Controller('auth')
export class IamController {
  constructor(
    private readonly authUseCase: AuthenticateCommunityUserUseCase,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
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
