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
  RequireAnyPermission,
  RequirePermissions,
} from '../../../../shared/infrastructure/http/decorators/security.decorators';
import {
  AcademicYearExodoGridQueryDto,
  ExodoGridQueryDto,
} from '../../../../shared/infrastructure/http/pagination/exodo-grid-query.dto';
import {
  buildLaravelPaginatorResponse,
  normalizeExodoGridQuery,
} from '../../../../shared/infrastructure/http/pagination/laravel-paginator';
import { PositiveBigIntPipe } from '../../../../shared/infrastructure/http/pipes/positive-bigint.pipe';
import { RBAC_PERMISSIONS } from '../../../../shared/infrastructure/rbac/rbac-permissions.constants';
import { RbacPermissionsService } from '../../../../shared/infrastructure/rbac/rbac-permissions.service';
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

@ApiTags('Administration & Executive Dashboard')
@ApiBearerAuth('jwt-auth')
@Controller('admin')
export class AdministrationController {
  constructor(
    private readonly adminUseCase: ManageAdministrationUseCase,
    private readonly rbacPermissions: RbacPermissionsService,
  ) {}

  // ===========================================================================
  // DASHBOARD EJECUTIVO (KPIs + Series anuales)
  // ===========================================================================

  @Get('dashboard/statistics')
  @RequireAnyPermission(
    RBAC_PERMISSIONS.DASHBOARD_EXECUTIVE_VIEW,
    RBAC_PERMISSIONS.PORTAL_TEACHER_OWN,
  )
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
    const rawData = await this.adminUseCase.getDashboardStatistics(
      principal.schoolId,
      parsedYear,
    );

    const canViewBilling = await this.rbacPermissions.hasPermission(
      principal.schoolId,
      principal.userId,
      principal.activeRole,
      RBAC_PERMISSIONS.DASHBOARD_BILLING_VIEW,
    );

    const data = canViewBilling
      ? rawData
      : {
          ...rawData,
          schoolSummary: {
            ...rawData.schoolSummary,
            subscriptionLockDate: '',
          },
        };

    return { success: true, data };
  }

  // ===========================================================================
  // DATOS DEL PLANTEL (schools)
  // ===========================================================================

  @Get('school')
  @RequirePermissions(RBAC_PERMISSIONS.ADMIN_SCHOOL_VIEW)
  @ApiOperation({ summary: 'Consultar ficha institucional del colegio activo' })
  async getSchoolProfile(
    @CurrentUser() principal: ActiveTenantContext,
  ): Promise<Record<string, unknown>> {
    const rawData = await this.adminUseCase.getSchoolProfile(principal.schoolId);
    const canViewBilling = await this.rbacPermissions.hasPermission(
      principal.schoolId,
      principal.userId,
      principal.activeRole,
      RBAC_PERMISSIONS.DASHBOARD_BILLING_VIEW,
    );
    const data = canViewBilling
      ? rawData
      : {
          ...rawData,
          subscriptionLockDate: '',
        };
    return { success: true, data };
  }

  @Patch('school')
  @RequirePermissions(RBAC_PERMISSIONS.ADMIN_SCHOOL_WRITE)
  @ApiOperation({
    summary: 'Actualizar datos institucionales del colegio activo',
  })
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
  @RequireAnyPermission(
    RBAC_PERMISSIONS.ADMIN_CAMPUSES_VIEW,
    RBAC_PERMISSIONS.ACADEMIC_ENROLLMENTS_VIEW,
    RBAC_PERMISSIONS.ACADEMIC_COURSE_ASSIGNMENTS_VIEW,
    RBAC_PERMISSIONS.PORTAL_TEACHER_OWN,
  )
  @ApiOperation({
    summary:
      'Listar sedes educativas del colegio activo (paginador Laravel o completo)',
  })
  async listCampuses(
    @CurrentUser() principal: ActiveTenantContext,
    @Query() query: ExodoGridQueryDto,
  ): Promise<unknown> {
    const normalized = normalizeExodoGridQuery(query);
    if (normalized.isLaravelPagination) {
      const paginated = await this.adminUseCase.listCampusesPaginated(
        principal.schoolId,
        normalized,
      );
      return buildLaravelPaginatorResponse({
        items: paginated.items,
        total: paginated.total,
        page: normalized.page,
        perPage: normalized.limit,
        basePath: '/api/v1/admin/campuses',
        queryParams: normalized.status
          ? { status: normalized.status }
          : undefined,
      });
    }
    const data = await this.adminUseCase.listCampuses(principal.schoolId);
    return { success: true, data };
  }

  @Post('campuses')
  @RequirePermissions(RBAC_PERMISSIONS.ADMIN_CAMPUSES_WRITE)
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
  @RequirePermissions(RBAC_PERMISSIONS.ADMIN_CAMPUSES_WRITE)
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
  @RequirePermissions(RBAC_PERMISSIONS.ADMIN_CAMPUSES_WRITE)
  @ApiOperation({
    summary: 'Eliminar una sede educativa sin dependencias activas',
  })
  async deleteCampus(
    @CurrentUser() principal: ActiveTenantContext,
    @Param('campusId', PositiveBigIntPipe) campusId: bigint,
  ): Promise<Record<string, unknown>> {
    await this.adminUseCase.deleteCampus(principal.schoolId, campusId);
    return { success: true, data: { deleted: true, id: Number(campusId) } };
  }

  @Get('campuses/:campusId/shifts')
  @RequireAnyPermission(
    RBAC_PERMISSIONS.ADMIN_CAMPUSES_VIEW,
    RBAC_PERMISSIONS.ACADEMIC_ENROLLMENTS_VIEW,
    RBAC_PERMISSIONS.PORTAL_TEACHER_OWN,
  )
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
  @RequirePermissions(RBAC_PERMISSIONS.ADMIN_CAMPUSES_WRITE)
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
  @RequirePermissions(RBAC_PERMISSIONS.ADMIN_CAMPUSES_WRITE)
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
  @RequireAnyPermission(
    RBAC_PERMISSIONS.ADMIN_CAMPUSES_VIEW,
    RBAC_PERMISSIONS.ACADEMIC_ENROLLMENTS_VIEW,
    RBAC_PERMISSIONS.PORTAL_TEACHER_OWN,
  )
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
  @RequirePermissions(RBAC_PERMISSIONS.ADMIN_CAMPUSES_WRITE)
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
  @RequirePermissions(RBAC_PERMISSIONS.ADMIN_CAMPUSES_WRITE)
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
  @RequireAnyPermission(
    RBAC_PERMISSIONS.ADMIN_TEACHERS_VIEW,
    RBAC_PERMISSIONS.ACADEMIC_COURSE_ASSIGNMENTS_VIEW,
    RBAC_PERMISSIONS.ADMIN_GROUP_MANAGERS_VIEW,
  )
  @ApiOperation({
    summary:
      'Listar personal docente del colegio activo con paginación y búsqueda',
  })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'onlyActive', required: false, example: 'true' })
  @ApiQuery({ name: 'limit', required: false, example: 100 })
  @ApiQuery({ name: 'offset', required: false, example: 0 })
  async listTeachers(
    @CurrentUser() principal: ActiveTenantContext,
    @Query() query: ExodoGridQueryDto,
  ): Promise<unknown> {
    const normalized = normalizeExodoGridQuery(query);
    const data = await this.adminUseCase.listTeachers(
      principal.schoolId,
      normalized,
    );
    if (normalized.isLaravelPagination) {
      return buildLaravelPaginatorResponse({
        items: data.items,
        total: data.total,
        page: normalized.page,
        perPage: normalized.limit,
        basePath: '/api/v1/admin/teachers',
        queryParams: normalized.status
          ? { status: normalized.status }
          : undefined,
      });
    }
    return { success: true, data };
  }

  @Post('teachers')
  @RequirePermissions(RBAC_PERMISSIONS.ADMIN_TEACHERS_WRITE)
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
  @RequirePermissions(RBAC_PERMISSIONS.ADMIN_TEACHERS_WRITE)
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
    if (dto.isActive !== undefined) {
      this.rbacPermissions.invalidateSchoolCache(principal.schoolId);
    }
    return { success: true, data };
  }

  @Delete('teachers/:teacherId')
  @RequirePermissions(RBAC_PERMISSIONS.ADMIN_TEACHERS_DELETE)
  @ApiOperation({
    summary: 'Eliminar un docente sin carga académica bloqueante',
  })
  async deleteTeacher(
    @CurrentUser() principal: ActiveTenantContext,
    @Param('teacherId', PositiveBigIntPipe) teacherId: bigint,
  ): Promise<Record<string, unknown>> {
    await this.adminUseCase.deleteTeacher(principal.schoolId, teacherId);
    this.rbacPermissions.invalidateSchoolCache(principal.schoolId);
    return { success: true, data: { deleted: true, id: Number(teacherId) } };
  }

  // ===========================================================================
  // PERSONAL ADMINISTRATIVO (administrative_staff)
  // ===========================================================================

  @Get('staff')
  @RequirePermissions(RBAC_PERMISSIONS.ADMIN_STAFF_VIEW)
  @ApiOperation({
    summary: 'Listar personal administrativo del colegio activo',
  })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'onlyActive', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'offset', required: false })
  async listAdministrativeStaff(
    @CurrentUser() principal: ActiveTenantContext,
    @Query() query: ExodoGridQueryDto,
  ): Promise<unknown> {
    const normalized = normalizeExodoGridQuery(query);
    const data = await this.adminUseCase.listAdministrativeStaff(
      principal.schoolId,
      normalized,
    );
    if (normalized.isLaravelPagination) {
      return buildLaravelPaginatorResponse({
        items: data.items,
        total: data.total,
        page: normalized.page,
        perPage: normalized.limit,
        basePath: '/api/v1/admin/staff',
        queryParams: normalized.status
          ? { status: normalized.status }
          : undefined,
      });
    }
    return { success: true, data };
  }

  @Post('staff')
  @RequirePermissions(RBAC_PERMISSIONS.ADMIN_STAFF_WRITE)
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
    this.rbacPermissions.invalidateSchoolCache(principal.schoolId);
    return { success: true, data };
  }

  @Patch('staff/:staffId')
  @RequirePermissions(RBAC_PERMISSIONS.ADMIN_STAFF_WRITE)
  @ApiOperation({
    summary: 'Actualizar datos de un funcionario administrativo',
  })
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
    if (dto.isActive !== undefined || dto.assignedRole !== undefined) {
      this.rbacPermissions.invalidateSchoolCache(principal.schoolId);
    }
    return { success: true, data };
  }

  @Delete('staff/:staffId')
  @RequirePermissions(RBAC_PERMISSIONS.ADMIN_STAFF_WRITE)
  @ApiOperation({ summary: 'Eliminar un funcionario administrativo' })
  async deleteAdministrativeStaff(
    @CurrentUser() principal: ActiveTenantContext,
    @Param('staffId', PositiveBigIntPipe) staffId: bigint,
  ): Promise<Record<string, unknown>> {
    await this.adminUseCase.deleteAdministrativeStaff(
      principal.schoolId,
      staffId,
    );
    this.rbacPermissions.invalidateSchoolCache(principal.schoolId);
    return { success: true, data: { deleted: true, id: Number(staffId) } };
  }

  // ===========================================================================
  // DIRECTORES DE GRUPO (academic_groups)
  // ===========================================================================

  @Get('group-managers')
  @RequireAnyPermission(
    RBAC_PERMISSIONS.ADMIN_GROUP_MANAGERS_VIEW,
    RBAC_PERMISSIONS.ACADEMIC_ENROLLMENTS_VIEW,
    RBAC_PERMISSIONS.ACADEMIC_COURSE_ASSIGNMENTS_VIEW,
    RBAC_PERMISSIONS.PORTAL_TEACHER_OWN,
  )
  @ApiOperation({
    summary:
      'Listar grupos académicos y sus directores de grupo por año lectivo',
  })
  @ApiQuery({ name: 'academicYear', required: false, example: 2026 })
  @ApiResponse({ status: 200, description: 'Listado de directores de grupo.' })
  async listGroupManagers(
    @CurrentUser() principal: ActiveTenantContext,
    @Query() query: AcademicYearExodoGridQueryDto,
  ): Promise<unknown> {
    const parsedYear = query.academicYear ?? principal.academicYear;
    const normalized = normalizeExodoGridQuery(query);
    if (normalized.isLaravelPagination) {
      const paginated = await this.adminUseCase.listGroupManagersPaginated(
        principal.schoolId,
        parsedYear,
        normalized,
      );
      return buildLaravelPaginatorResponse({
        items: paginated.items,
        total: paginated.total,
        page: normalized.page,
        perPage: normalized.limit,
        basePath: '/api/v1/admin/group-managers',
        queryParams: {
          academicYear: parsedYear,
          ...(normalized.status ? { status: normalized.status } : {}),
          ...(normalized.campusId !== undefined
            ? { campusId: normalized.campusId }
            : {}),
          ...(normalized.assignmentState
            ? { assignmentState: normalized.assignmentState }
            : {}),
        },
      });
    }
    const data = await this.adminUseCase.listGroupManagers(
      principal.schoolId,
      parsedYear,
    );
    return { success: true, data };
  }

  @Post('group-managers')
  @RequirePermissions(RBAC_PERMISSIONS.ADMIN_GROUP_MANAGERS_WRITE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear o asignar director de grupo a un curso del año lectivo',
  })
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
  @RequirePermissions(RBAC_PERMISSIONS.ADMIN_GROUP_MANAGERS_WRITE)
  @ApiOperation({
    summary:
      'Actualizar director de grupo, cupo o estado de un grupo académico',
  })
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
  @RequirePermissions(RBAC_PERMISSIONS.ADMIN_GROUP_MANAGERS_WRITE)
  @ApiOperation({
    summary:
      'Eliminar grupo académico o desvincular director si tiene matrículas',
  })
  async deleteGroupManager(
    @CurrentUser() principal: ActiveTenantContext,
    @Param('groupId', PositiveBigIntPipe) groupId: bigint,
  ): Promise<Record<string, unknown>> {
    await this.adminUseCase.deleteGroupManager(principal.schoolId, groupId);
    return { success: true, data: { deleted: true, id: Number(groupId) } };
  }
}
