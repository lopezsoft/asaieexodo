import { Body, Controller, Get, Post } from '@nestjs/common';
import { ManageSchoolsUseCase } from '../../application/use-cases/manage-schools.use-case';
import { CreateSchoolCommandInput } from '../../domain/ports/school.repository.port';

@Controller('tenants/schools')
export class TenantController {
  constructor(private readonly manageSchoolsUseCase: ManageSchoolsUseCase) {}

  @Get()
  async listActiveSchools(): Promise<Record<string, unknown>> {
    const schools = await this.manageSchoolsUseCase.listActiveSchools();
    return {
      success: true,
      total: schools.length,
      data: schools.map((school) => school.toPrimitives()),
    };
  }

  @Post()
  async registerSchool(
    @Body() payload: CreateSchoolCommandInput,
  ): Promise<Record<string, unknown>> {
    const school = await this.manageSchoolsUseCase.registerSchool(payload);
    return {
      success: true,
      data: school.toPrimitives(),
    };
  }
}
