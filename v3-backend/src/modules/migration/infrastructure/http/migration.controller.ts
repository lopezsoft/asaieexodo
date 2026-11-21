import {
  Controller,
  ForbiddenException,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../../../shared/infrastructure/http/decorators/security.decorators';
import { CommunityRole } from '../../../iam/domain/enums/community-role.enum';
import { MigrateLegacySchoolsUseCase } from '../../application/use-cases/migrate-legacy-schools.use-case';

@ApiTags('Migration & Bootstrap (Dev Only)')
@ApiBearerAuth('jwt-auth')
@Roles(CommunityRole.SUPER_ADMIN)
@Controller('migration')
export class MigrationController {
  constructor(
    private readonly migrateLegacySchoolsUseCase: MigrateLegacySchoolsUseCase,
    private readonly configService: ConfigService,
  ) {}

  @Post('bootstrap-nine-schools')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Inicializar estructura base de los 9 colegios activos (Solo SUPER_ADMIN y bloqueado en producción)',
  })
  @ApiResponse({
    status: 200,
    description: 'Colegios inicializados exitosamente en entorno no productivo.',
  })
  async bootstrapNineSchools(): Promise<Record<string, unknown>> {
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');
    if (nodeEnv === 'production') {
      throw new ForbiddenException(
        'El endpoint de bootstrap está deshabilitado permanentemente en producción.',
      );
    }

    const summary = await this.migrateLegacySchoolsUseCase.executeBootstrap();
    return {
      success: true,
      data: summary,
    };
  }
}
