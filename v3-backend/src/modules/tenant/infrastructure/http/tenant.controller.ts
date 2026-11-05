import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ManageSchoolsUseCase } from '../../application/use-cases/manage-schools.use-case';
import { CreateSchoolCommandInput } from '../../domain/ports/school.repository.port';

@ApiTags('Tenants & Schools')
@ApiBearerAuth('jwt-auth')
@Controller('tenants/schools')
export class TenantController {
  constructor(private readonly manageSchoolsUseCase: ManageSchoolsUseCase) {}

  @Get()
  @ApiOperation({
    summary: 'Listar instituciones educativas activas (Multi-Tenant Single-DB)',
    description:
      'Retorna las instituciones educativas registradas en el esquema unificado `asaie_v3_unified` con su código DANE, carpeta de almacenamiento y estado de suscripción.',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado de instituciones educativas activas.',
  })
  async listActiveSchools(): Promise<Record<string, unknown>> {
    const schools = await this.manageSchoolsUseCase.listActiveSchools();
    return {
      success: true,
      total: schools.length,
      data: schools.map((school) => school.toPrimitives()),
    };
  }

  @Post()
  @ApiOperation({
    summary: 'Registrar o actualizar una Institución Educativa (Tenant)',
    description:
      'Registra un colegio dentro de la base de datos única PostgreSQL 17 habilitando su aislamiento automático mediante Row-Level Security (`school_id`).',
  })
  @ApiResponse({
    status: 201,
    description: 'Institución educativa registrada exitosamente.',
  })
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
