import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ActiveTenantContext } from '../../../../shared/application/context/tenant-context.service';
import { CurrentUser } from '../../../../shared/infrastructure/http/decorators/security.decorators';
import { GetCatalogsUseCase } from '../../application/use-cases/get-catalogs.use-case';

@ApiTags('Static & School Catalogs')
@ApiBearerAuth('jwt-auth')
@Controller('catalogs')
export class CatalogsController {
  constructor(private readonly getCatalogsUseCase: GetCatalogsUseCase) {}

  @Get('bundle')
  @ApiOperation({
    summary:
      'Obtener en una sola petición el paquete consolidado de catálogos oficiales MEN/DANE/SIMAT',
  })
  @ApiResponse({ status: 200, description: 'Paquete de catálogos globales.' })
  async getGlobalBundle(
    @CurrentUser() principal: ActiveTenantContext,
  ): Promise<Record<string, unknown>> {
    const data = await this.getCatalogsUseCase.getGlobalBundle(
      principal.schoolId,
    );
    return { success: true, data };
  }

  @Get('countries')
  @ApiOperation({ summary: 'Listar catálogo oficial de países (246 registros)' })
  @ApiQuery({ name: 'search', required: false, description: 'Filtro por nombre o ISO-2' })
  async listCountries(
    @CurrentUser() principal: ActiveTenantContext,
    @Query('search') search?: string,
  ): Promise<Record<string, unknown>> {
    const data = await this.getCatalogsUseCase.listCountries(
      principal.schoolId,
      search,
    );
    return { success: true, data };
  }

  @Get('departments')
  @ApiOperation({ summary: 'Listar departamentos/estados filtrados por país' })
  @ApiQuery({ name: 'countryId', required: false, example: 45 })
  @ApiQuery({ name: 'search', required: false })
  async listDepartments(
    @CurrentUser() principal: ActiveTenantContext,
    @Query('countryId') countryId?: string,
    @Query('search') search?: string,
  ): Promise<Record<string, unknown>> {
    const parsedCountryId =
      countryId && /^\d+$/.test(countryId) ? Number(countryId) : undefined;
    const data = await this.getCatalogsUseCase.listDepartments(
      principal.schoolId,
      parsedCountryId,
      search,
    );
    return { success: true, data };
  }

  @Get('cities')
  @ApiOperation({ summary: 'Listar municipios/ciudades filtrados por departamento o búsqueda' })
  @ApiQuery({ name: 'departmentId', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'limit', required: false, example: 200 })
  async listCities(
    @CurrentUser() principal: ActiveTenantContext,
    @Query('departmentId') departmentId?: string,
    @Query('search') search?: string,
    @Query('limit') limit?: string,
  ): Promise<Record<string, unknown>> {
    const parsedDeptId =
      departmentId && /^\d+$/.test(departmentId)
        ? Number(departmentId)
        : undefined;
    const parsedLimit =
      limit && /^\d+$/.test(limit) ? Number(limit) : undefined;
    const data = await this.getCatalogsUseCase.listCities(
      principal.schoolId,
      parsedDeptId,
      search,
      parsedLimit,
    );
    return { success: true, data };
  }

  @Get('school-context')
  @ApiOperation({
    summary:
      'Obtener sedes, jornadas, niveles, grados y años lectivos propios del colegio activo (RLS)',
  })
  async getSchoolAcademicContext(
    @CurrentUser() principal: ActiveTenantContext,
  ): Promise<Record<string, unknown>> {
    const data = await this.getCatalogsUseCase.getSchoolAcademicContext(
      principal.schoolId,
    );
    return { success: true, data };
  }
}
