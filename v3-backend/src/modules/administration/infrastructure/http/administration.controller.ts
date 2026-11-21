import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ActiveTenantContext } from '../../../../shared/application/context/tenant-context.service';
import {
  CurrentUser,
  Roles,
} from '../../../../shared/infrastructure/http/decorators/security.decorators';
import { PositiveBigIntPipe } from '../../../../shared/infrastructure/http/pipes/positive-bigint.pipe';
import { CommunityRole } from '../../../iam/domain/enums/community-role.enum';
import { ManageAdministrationUseCase } from '../../application/use-cases/manage-administration.use-case';
import {
  AssignCampusEducationLevelDto,
  AssignCampusShiftDto,
  SaveAdministrativeStaffDto,
  SaveCampusDto,
  SaveTeacherDto,
  UpdateGroupManagerDto,
  UpdateSchoolProfileDto,
  UpsertGroupManagerDto,
} from './dto/administration.dto';

const ADMIN_READ_ROLES = [
  CommunityRole.SUPER_ADMIN,
  CommunityRole.SCHOOL_ADMIN,
  CommunityRole.RECTOR,
  CommunityRole.COORDINATOR,
  CommunityRole.SECRETARY,
] as const;

const ADMIN_WRITE_ROLES = [
  CommunityRole.SUPER_ADMIN,
  CommunityRole.SCHOOL_ADMIN,
  CommunityRole.RECTOR,
] as const;

@ApiTags('Administration & Executive Dashboard')
@ApiBearerAuth('jwt-auth')
@Controller('admin')
export class AdministrationController {
  constructor(
    private readonly adminUseCase: ManageAdministrationUseCase,
  ) {}

  // ===========================================================================
  // DASHBOARD EJECUTIVO (KPIs + Series anuales)
  // ===========================================================================

  @Get('dashboard/statistics')
  @Roles(...ADMIN_READ_ROLES, CommunityRole.TEACHER)
  @ApiOperation({
    summary:
      'Obtener KPIs anuales (matriculados, retirados, docentes, sedes, grupos) y series históricas',
  })
  @ApiQuery({ name: 'academicYear', required: false, example: 2026 })
  async getDashboardStatistics(
    @CurrentUser() principal: ActiveTenantContext,
    @Query('academicYear') academicYear?: string,
  ): Promise<Record<string, unknown>> {
    const parsedYear =
      academicYear && /^\d{4}$/.test(academicYear)
        ? Number(academicYear)
        : principal.academicYear;
    const data = await this.adminUseCase.getDashboardStatistics(
      principal.schoolId,
      parsedYear,
    );
    return { success: true, data };
  }

  // ===========================================================================
  // DATOS DEL PLANTEL (schools)
  // ===========================================================================

  @Get('school')
  @Roles(...ADMIN_READ_ROLES)
  @ApiOperation({ summary: 'Consultar ficha institucional del colegio activo' })
  async getSchoolProfile(
    @CurrentUser() principal: ActiveTenantContext,
  ): Promise<Record<string, unknown>> {
    const data = await this.adminUseCase.getSchoolProfile(principal.schoolId);
    return { success: true, data };
  }

  @Patch('school')
  @Roles(...ADMIN_WRITE_ROLES)
  @ApiOperation({ summary: 'Actualizar datos institucionales del colegio activo' })
  async updateSchoolProfile(
    @CurrentUser() principal: ActiveTenantContext,
    @Body() dto: UpdateSchoolProfileDto,
  ): Promise<Record<string, unknown>> {
    const data = await this.adminUseCase.updateSchoolProfile(
      principal.schoolId,
      dto,
    );
    return { success: true, data };
  }

  // ===========================================================================
  // SEDES EDUCATIVAS + JORNADAS Y NIVELES POR SEDE
  // ===========================================================================

  @Get('campuses')
  @Roles(...ADMIN_READ_ROLES, CommunityRole.TEACHER)
  @ApiOperation({ summary: 'Listar sedes educativas del colegio activo' })
  async listCampuses(
    @CurrentUser() principal: ActiveTenantContext,
  ): Promise<Record<string, unknown>> {
    const data = await this.adminUseCase.listCampuses(principal.schoolId);
    return { success: true, data };
  }

  @Post('campuses')
  @Roles(...ADMIN_WRITE_ROLES)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear una nueva sede educativa' })
  async createCampus(
    @CurrentUser() principal: ActiveTenantContext,
    @Body() dto: SaveCampusDto,
  ): Promise<Record<string, unknown>> {
    const data = await this.adminUseCase.createCampus(principal.schoolId, dto);
    return { success: true, data };
  }

  @Patch('campuses/:campusId')
  @Roles(...ADMIN_WRITE_ROLES)
  @ApiOperation({ summary: 'Actualizar una sede educativa existente' })
  async updateCampus(
    @CurrentUser() principal: ActiveTenantContext,
    @Param('campusId', PositiveBigIntPipe) campusId: bigint,
    @Body() dto: SaveCampusDto,
  ): Promise<Record<string, unknown>> {
    const data = await this.adminUseCase.updateCampus(
      principal.schoolId,
      campusId,
      dto,
    );
    return { success: true, data };
  }

  @Delete('campuses/:campusId')
  @Roles(...ADMIN_WRITE_ROLES)
  @ApiOperation({ summary: 'Eliminar una sede educativa sin dependencias activas' })
  async deleteCampus(
    @CurrentUser() principal: ActiveTenantContext,
    @Param('campusId', PositiveBigIntPipe) campusId: bigint,
  ): Promise<Record<string, unknown>> {
    await this.adminUseCase.deleteCampus(principal.schoolId, campusId);
    return { success: true, data: { deleted: true, id: Number(campusId) } };
  }

  @Get('campuses/:campusId/shifts')
  @Roles(...ADMIN_READ_ROLES, CommunityRole.TEACHER)
  @ApiOperation({ summary: 'Listar jornadas asignadas a una sede' })
  async listCampusShifts(
    @CurrentUser() principal: ActiveTenantContext,
    @Param('campusId', PositiveBigIntPipe) campusId: bigint,
  ): Promise<Record<string, unknown>> {
    const data = await this.adminUseCase.listCampusShifts(
      principal.schoolId,
      campusId,
    );
    return { success: true, data };
  }

  @Post('campuses/:campusId/shifts')
  @Roles(...ADMIN_WRITE_ROLES)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Vincular una jornada escolar a la sede' })
  async assignCampusShift(
    @CurrentUser() principal: ActiveTenantContext,
    @Param('campusId', PositiveBigIntPipe) campusId: bigint,
    @Body() dto: AssignCampusShiftDto,
  ): Promise<Record<string, unknown>> {
    const data = await this.adminUseCase.assignCampusShift(
      principal.schoolId,
      campusId,
      BigInt(dto.shiftId),
    );
    return { success: true, data };
  }

  @Delete('campuses/:campusId/shifts/:assignmentId')
  @Roles(...ADMIN_WRITE_ROLES)
  @ApiOperation({ summary: 'Desvincular una jornada de la sede' })
  async removeCampusShift(
    @CurrentUser() principal: ActiveTenantContext,
    @Param('campusId', PositiveBigIntPipe) campusId: bigint,
    @Param('assignmentId', PositiveBigIntPipe) assignmentId: bigint,
  ): Promise<Record<string, unknown>> {
    await this.adminUseCase.removeCampusShift(
      principal.schoolId,
      campusId,
      assignmentId,
    );
    return { success: true, data: { deleted: true, id: Number(assignmentId) } };
  }

  @Get('campuses/:campusId/education-levels')
  @Roles(...ADMIN_READ_ROLES, CommunityRole.TEACHER)
  @ApiOperation({ summary: 'Listar niveles educativos asignados a una sede' })
  async listCampusEducationLevels(
    @CurrentUser() principal: ActiveTenantContext,
    @Param('campusId', PositiveBigIntPipe) campusId: bigint,
  ): Promise<Record<string, unknown>> {
    const data = await this.adminUseCase.listCampusEducationLevels(
      principal.schoolId,
      campusId,
    );
    return { success: true, data };
  }

  @Post('campuses/:campusId/education-levels')
  @Roles(...ADMIN_WRITE_ROLES)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Vincular un nivel educativo a la sede' })
  async assignCampusEducationLevel(
    @CurrentUser() principal: ActiveTenantContext,
    @Param('campusId', PositiveBigIntPipe) campusId: bigint,
    @Body() dto: AssignCampusEducationLevelDto,
  ): Promise<Record<string, unknown>> {
    const data = await this.adminUseCase.assignCampusEducationLevel(
      principal.schoolId,
      campusId,
      BigInt(dto.educationLevelId),
    );
    return { success: true, data };
  }

  @Delete('campuses/:campusId/education-levels/:assignmentId')
  @Roles(...ADMIN_WRITE_ROLES)
  @ApiOperation({ summary: 'Desvincular un nivel educativo de la sede' })
  async removeCampusEducationLevel(
    @CurrentUser() principal: ActiveTenantContext,
    @Param('campusId', PositiveBigIntPipe) campusId: bigint,
    @Param('assignmentId', PositiveBigIntPipe) assignmentId: bigint,
  ): Promise<Record<string, unknown>> {
    await this.adminUseCase.removeCampusEducationLevel(
      principal.schoolId,
      campusId,
      assignmentId,
    );
    return { success: true, data: { deleted: true, id: Number(assignmentId) } };
  }

  // ===========================================================================
  // PERSONAL DOCENTE (teacher_profiles)
  // ===========================================================================

  @Get('teachers')
  @Roles(...ADMIN_READ_ROLES)
  @ApiOperation({ summary: 'Listar personal docente del colegio activo con paginación y búsqueda' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'onlyActive', required: false, example: 'true' })
  @ApiQuery({ name: 'limit', required: false, example: 100 })
  @ApiQuery({ name: 'offset', required: false, example: 0 })
  async listTeachers(
    @CurrentUser() principal: ActiveTenantContext,
    @Query('search') search?: string,
    @Query('onlyActive') onlyActive?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<Record<string, unknown>> {
    const data = await this.adminUseCase.listTeachers(principal.schoolId, {
      search,
      onlyActive: onlyActive === 'true',
      limit: limit && /^\d+$/.test(limit) ? Number(limit) : undefined,
      offset: offset && /^\d+$/.test(offset) ? Number(offset) : undefined,
    });
    return { success: true, data };
  }

  @Post('teachers')
  @Roles(...ADMIN_WRITE_ROLES, CommunityRole.COORDINATOR)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar nuevo perfil docente' })
  async createTeacher(
    @CurrentUser() principal: ActiveTenantContext,
    @Body() dto: SaveTeacherDto,
  ): Promise<Record<string, unknown>> {
    const data = await this.adminUseCase.createTeacher(principal.schoolId, dto);
    return { success: true, data };
  }

  @Patch('teachers/:teacherId')
  @Roles(...ADMIN_WRITE_ROLES, CommunityRole.COORDINATOR)
  @ApiOperation({ summary: 'Actualizar datos de un docente' })
  async updateTeacher(
    @CurrentUser() principal: ActiveTenantContext,
    @Param('teacherId', PositiveBigIntPipe) teacherId: bigint,
    @Body() dto: SaveTeacherDto,
  ): Promise<Record<string, unknown>> {
    const data = await this.adminUseCase.updateTeacher(
      principal.schoolId,
      teacherId,
      dto,
    );
    return { success: true, data };
  }

  @Delete('teachers/:teacherId')
  @Roles(...ADMIN_WRITE_ROLES)
  @ApiOperation({ summary: 'Eliminar un docente sin carga académica bloqueante' })
  async deleteTeacher(
    @CurrentUser() principal: ActiveTenantContext,
    @Param('teacherId', PositiveBigIntPipe) teacherId: bigint,
  ): Promise<Record<string, unknown>> {
    await this.adminUseCase.deleteTeacher(principal.schoolId, teacherId);
    return { success: true, data: { deleted: true, id: Number(teacherId) } };
  }

  // ===========================================================================
  // PERSONAL ADMINISTRATIVO (administrative_staff)
  // ===========================================================================

  @Get('staff')
  @Roles(...ADMIN_READ_ROLES)
  @ApiOperation({ summary: 'Listar personal administrativo del colegio activo' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'onlyActive', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'offset', required: false })
  async listAdministrativeStaff(
    @CurrentUser() principal: ActiveTenantContext,
    @Query('search') search?: string,
    @Query('onlyActive') onlyActive?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<Record<string, unknown>> {
    const data = await this.adminUseCase.listAdministrativeStaff(
      principal.schoolId,
      {
        search,
        onlyActive: onlyActive === 'true',
        limit: limit && /^\d+$/.test(limit) ? Number(limit) : undefined,
        offset: offset && /^\d+$/.test(offset) ? Number(offset) : undefined,
      },
    );
    return { success: true, data };
  }

  @Post('staff')
  @Roles(...ADMIN_WRITE_ROLES)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar nuevo funcionario administrativo' })
  async createAdministrativeStaff(
    @CurrentUser() principal: ActiveTenantContext,
    @Body() dto: SaveAdministrativeStaffDto,
  ): Promise<Record<string, unknown>> {
    const data = await this.adminUseCase.createAdministrativeStaff(
      principal.schoolId,
      dto,
    );
    return { success: true, data };
  }

  @Patch('staff/:staffId')
  @Roles(...ADMIN_WRITE_ROLES)
  @ApiOperation({ summary: 'Actualizar datos de un funcionario administrativo' })
  async updateAdministrativeStaff(
    @CurrentUser() principal: ActiveTenantContext,
    @Param('staffId', PositiveBigIntPipe) staffId: bigint,
    @Body() dto: SaveAdministrativeStaffDto,
  ): Promise<Record<string, unknown>> {
    const data = await this.adminUseCase.updateAdministrativeStaff(
      principal.schoolId,
      staffId,
      dto,
    );
    return { success: true, data };
  }

  @Delete('staff/:staffId')
  @Roles(...ADMIN_WRITE_ROLES)
  @ApiOperation({ summary: 'Eliminar un funcionario administrativo' })
  async deleteAdministrativeStaff(
    @CurrentUser() principal: ActiveTenantContext,
    @Param('staffId', PositiveBigIntPipe) staffId: bigint,
  ): Promise<Record<string, unknown>> {
    await this.adminUseCase.deleteAdministrativeStaff(
      principal.schoolId,
      staffId,
    );
    return { success: true, data: { deleted: true, id: Number(staffId) } };
  }

  // ===========================================================================
  // DIRECTORES DE GRUPO (academic_groups)
  // ===========================================================================

  @Get('group-managers')
  @Roles(...ADMIN_READ_ROLES, CommunityRole.TEACHER)
  @ApiOperation({ summary: 'Listar grupos académicos y sus directores de grupo por año lectivo' })
  @ApiQuery({ name: 'academicYear', required: false, example: 2026 })
  @ApiResponse({ status: 200, description: 'Listado de directores de grupo.' })
  async listGroupManagers(
    @CurrentUser() principal: ActiveTenantContext,
    @Query('academicYear') academicYear?: string,
  ): Promise<Record<string, unknown>> {
    const parsedYear =
      academicYear && /^\d{4}$/.test(academicYear)
        ? Number(academicYear)
        : principal.academicYear;
    const data = await this.adminUseCase.listGroupManagers(
      principal.schoolId,
      parsedYear,
    );
    return { success: true, data };
  }

  @Post('group-managers')
  @Roles(...ADMIN_WRITE_ROLES, CommunityRole.COORDINATOR)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear o asignar director de grupo a un curso del año lectivo' })
  async upsertGroupManager(
    @CurrentUser() principal: ActiveTenantContext,
    @Body() dto: UpsertGroupManagerDto,
  ): Promise<Record<string, unknown>> {
    const data = await this.adminUseCase.upsertGroupManager(
      principal.schoolId,
      dto,
    );
    return { success: true, data };
  }

  @Patch('group-managers/:groupId')
  @Roles(...ADMIN_WRITE_ROLES, CommunityRole.COORDINATOR)
  @ApiOperation({ summary: 'Actualizar director de grupo, cupo o estado de un grupo académico' })
  async updateGroupManager(
    @CurrentUser() principal: ActiveTenantContext,
    @Param('groupId', PositiveBigIntPipe) groupId: bigint,
    @Body() dto: UpdateGroupManagerDto,
  ): Promise<Record<string, unknown>> {
    const data = await this.adminUseCase.updateGroupManager(
      principal.schoolId,
      groupId,
      dto,
    );
    return { success: true, data };
  }

  @Delete('group-managers/:groupId')
  @Roles(...ADMIN_WRITE_ROLES, CommunityRole.COORDINATOR)
  @ApiOperation({ summary: 'Eliminar grupo académico o desvincular director si tiene matrículas' })
  async deleteGroupManager(
    @CurrentUser() principal: ActiveTenantContext,
    @Param('groupId', PositiveBigIntPipe) groupId: bigint,
  ): Promise<Record<string, unknown>> {
    await this.adminUseCase.deleteGroupManager(principal.schoolId, groupId);
    return { success: true, data: { deleted: true, id: Number(groupId) } };
  }
}
