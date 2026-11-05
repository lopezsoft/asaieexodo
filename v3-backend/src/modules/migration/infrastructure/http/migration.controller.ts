import { Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { MigrateLegacySchoolsUseCase } from '../../application/use-cases/migrate-legacy-schools.use-case';

@Controller('migration')
export class MigrationController {
  constructor(
    private readonly migrateLegacySchoolsUseCase: MigrateLegacySchoolsUseCase,
  ) {}

  @Post('bootstrap-nine-schools')
  @HttpCode(HttpStatus.OK)
  async bootstrapNineSchools(): Promise<Record<string, unknown>> {
    const summary = await this.migrateLegacySchoolsUseCase.executeBootstrap();
    return {
      success: true,
      data: summary,
    };
  }
}
