import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ActiveTenantContext } from '../../../../shared/application/context/tenant-context.service';
import {
  CurrentUser,
  RequireAnyPermission,
  RequireModule,
  RequirePermissions,
  Roles,
} from '../../../../shared/infrastructure/http/decorators/security.decorators';
import { PositiveBigIntPipe } from '../../../../shared/infrastructure/http/pipes/positive-bigint.pipe';
import {
  RBAC_MODULES,
  RBAC_PERMISSIONS,
} from '../../../../shared/infrastructure/rbac/rbac-permissions.constants';
import { RbacPermissionsService } from '../../../../shared/infrastructure/rbac/rbac-permissions.service';
import { CommunityRole } from '../../../iam/domain/enums/community-role.enum';
import { ManageSettingsUseCase } from '../../application/use-cases/manage-settings.use-case';
import {
  CleanupZeroGradesDto,
  SaveAcademicPeriodDto,
  SaveDimensionColumnDto,
  SaveEducationLevelDto,
  SaveEvaluationDimensionDto,
  SaveGradeDto,
  SaveGradeGroupDto,
  SaveGradingScaleDto,
  SaveObserverCriteriaDto,
  SaveObserverSectionDto,
  SaveObserverTemplateDto,
  SaveShiftDto,
  ToggleSchoolModuleDto,
  UpdateBrandingSettingsDto,
  UpsertAcademicYearDto,
  UpsertGradingRuleDto,
} from './dto/settings.dto';

const STRUCTURE_LOOKUP_PERMISSIONS = [
  RBAC_PERMISSIONS.SETTINGS_STRUCTURE_VIEW,
  RBAC_PERMISSIONS.ACADEMIC_ENROLLMENTS_VIEW,
  RBAC_PERMISSIONS.ACADEMIC_CURRICULUM_VIEW,
  RBAC_PERMISSIONS.PORTAL_TEACHER_OWN,
] as const;

const SIEE_LOOKUP_PERMISSIONS = [
  RBAC_PERMISSIONS.SETTINGS_SIEE_VIEW,
  RBAC_PERMISSIONS.ACADEMIC_GRADES_VIEW,
  RBAC_PERMISSIONS.PROMOTION_FINAL_BOOK_VIEW,
  RBAC_PERMISSIONS.PORTAL_TEACHER_OWN,
] as const;

@ApiTags('Institutional Settings & Academic Configuration')
@ApiBearerAuth('jwt-auth')
@Controller('settings')
export class SettingsController {
  constructor(
    private readonly settingsUseCase: ManageSettingsUseCase,
    private readonly rbacPermissions: RbacPermissionsService,
  ) {}

  // Años lectivos y configuración de boletines/certificados
  @Get('academic-years')
  @RequireAnyPermission(...STRUCTURE_LOOKUP_PERMISSIONS)
  @ApiOperation({ summary: 'Listar años lectivos configurados del colegio' })
  async listAcademicYears(@CurrentUser() principal: ActiveTenantContext) {
    return {
      success: true,
      data: await this.settingsUseCase.listAcademicYears(principal.schoolId),
    };
  }

  @Post('academic-years')
  @RequirePermissions(RBAC_PERMISSIONS.SETTINGS_STRUCTURE_WRITE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Crear o actualizar año lectivo y ajustes de boletines',
  })
  async upsertAcademicYear(
    @CurrentUser() principal: ActiveTenantContext,
    @Body() dto: UpsertAcademicYearDto,
  ) {
    return {
      success: true,
      data: await this.settingsUseCase.upsertAcademicYear(
        principal.schoolId,
        dto,
      ),
    };
  }

  // Reglas generales de evaluación y promoción (SIEE)
  @Get('grading-rules')
  @RequireAnyPermission(...SIEE_LOOKUP_PERMISSIONS)
  @ApiQuery({ name: 'academicYear', required: false })
  @ApiOperation({
    summary: 'Listar reglas generales de evaluación por grupo de grados',
  })
  async listGradingRules(
    @CurrentUser() principal: ActiveTenantContext,
    @Query('academicYear') academicYear?: string,
  ) {
    const year =
      academicYear && /^\d{4}$/.test(academicYear)
        ? Number(academicYear)
        : principal.academicYear;
    return {
      success: true,
      data: await this.settingsUseCase.listGradingRules(
        principal.schoolId,
        year,
      ),
    };
  }

  @Post('grading-rules')
  @RequirePermissions(RBAC_PERMISSIONS.SETTINGS_SIEE_WRITE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Crear o actualizar regla de evaluación y promoción' })
  async upsertGradingRule(
    @CurrentUser() principal: ActiveTenantContext,
    @Body() dto: UpsertGradingRuleDto,
  ) {
    return {
      success: true,
      data: await this.settingsUseCase.upsertGradingRule(
        principal.schoolId,
        dto,
      ),
    };
  }

  @Delete('grading-rules/:ruleId')
  @RequirePermissions(RBAC_PERMISSIONS.SETTINGS_SIEE_WRITE)
  async deleteGradingRule(
    @CurrentUser() principal: ActiveTenantContext,
    @Param('ruleId', PositiveBigIntPipe) ruleId: bigint,
  ) {
    await this.settingsUseCase.deleteGradingRule(principal.schoolId, ruleId);
    return { success: true, data: { deleted: true, id: Number(ruleId) } };
  }

  // Jornadas
  @Get('shifts')
  @RequireAnyPermission(...STRUCTURE_LOOKUP_PERMISSIONS)
  async listShifts(@CurrentUser() principal: ActiveTenantContext) {
    return {
      success: true,
      data: await this.settingsUseCase.listShifts(principal.schoolId),
    };
  }

  @Post('shifts')
  @RequirePermissions(RBAC_PERMISSIONS.SETTINGS_STRUCTURE_WRITE)
  @HttpCode(HttpStatus.CREATED)
  async createShift(
    @CurrentUser() principal: ActiveTenantContext,
    @Body() dto: SaveShiftDto,
  ) {
    return {
      success: true,
      data: await this.settingsUseCase.saveShift(principal.schoolId, dto),
    };
  }

  @Patch('shifts/:shiftId')
  @RequirePermissions(RBAC_PERMISSIONS.SETTINGS_STRUCTURE_WRITE)
  async updateShift(
    @CurrentUser() principal: ActiveTenantContext,
    @Param('shiftId', PositiveBigIntPipe) shiftId: bigint,
    @Body() dto: SaveShiftDto,
  ) {
    return {
      success: true,
      data: await this.settingsUseCase.saveShift(principal.schoolId, {
        ...dto,
        id: shiftId,
      }),
    };
  }

  @Delete('shifts/:shiftId')
  @RequirePermissions(RBAC_PERMISSIONS.SETTINGS_STRUCTURE_WRITE)
  async deleteShift(
    @CurrentUser() principal: ActiveTenantContext,
    @Param('shiftId', PositiveBigIntPipe) shiftId: bigint,
  ) {
    await this.settingsUseCase.deleteShift(principal.schoolId, shiftId);
    return { success: true, data: { deleted: true, id: Number(shiftId) } };
  }

  // Niveles educativos
  @Get('education-levels')
  @RequireAnyPermission(...STRUCTURE_LOOKUP_PERMISSIONS)
  async listEducationLevels(@CurrentUser() principal: ActiveTenantContext) {
    return {
      success: true,
      data: await this.settingsUseCase.listEducationLevels(principal.schoolId),
    };
  }

  @Post('education-levels')
  @RequirePermissions(RBAC_PERMISSIONS.SETTINGS_STRUCTURE_WRITE)
  @HttpCode(HttpStatus.CREATED)
  async createEducationLevel(
    @CurrentUser() principal: ActiveTenantContext,
    @Body() dto: SaveEducationLevelDto,
  ) {
    return {
      success: true,
      data: await this.settingsUseCase.saveEducationLevel(
        principal.schoolId,
        dto,
      ),
    };
  }

  @Patch('education-levels/:levelId')
  @RequirePermissions(RBAC_PERMISSIONS.SETTINGS_STRUCTURE_WRITE)
  async updateEducationLevel(
    @CurrentUser() principal: ActiveTenantContext,
    @Param('levelId', PositiveBigIntPipe) levelId: bigint,
    @Body() dto: SaveEducationLevelDto,
  ) {
    return {
      success: true,
      data: await this.settingsUseCase.saveEducationLevel(principal.schoolId, {
        ...dto,
        id: levelId,
      }),
    };
  }

  @Delete('education-levels/:levelId')
  @RequirePermissions(RBAC_PERMISSIONS.SETTINGS_STRUCTURE_WRITE)
  async deleteEducationLevel(
    @CurrentUser() principal: ActiveTenantContext,
    @Param('levelId', PositiveBigIntPipe) levelId: bigint,
  ) {
    await this.settingsUseCase.deleteEducationLevel(
      principal.schoolId,
      levelId,
    );
    return { success: true, data: { deleted: true, id: Number(levelId) } };
  }

  // Grupos de grados
  @Get('grade-groups')
  @RequireAnyPermission(...STRUCTURE_LOOKUP_PERMISSIONS)
  async listGradeGroups(@CurrentUser() principal: ActiveTenantContext) {
    return {
      success: true,
      data: await this.settingsUseCase.listGradeGroups(principal.schoolId),
    };
  }

  @Post('grade-groups')
  @RequirePermissions(RBAC_PERMISSIONS.SETTINGS_STRUCTURE_WRITE)
  @HttpCode(HttpStatus.CREATED)
  async createGradeGroup(
    @CurrentUser() principal: ActiveTenantContext,
    @Body() dto: SaveGradeGroupDto,
  ) {
    return {
      success: true,
      data: await this.settingsUseCase.saveGradeGroup(principal.schoolId, dto),
    };
  }

  @Patch('grade-groups/:groupId')
  @RequirePermissions(RBAC_PERMISSIONS.SETTINGS_STRUCTURE_WRITE)
  async updateGradeGroup(
    @CurrentUser() principal: ActiveTenantContext,
    @Param('groupId', PositiveBigIntPipe) groupId: bigint,
    @Body() dto: SaveGradeGroupDto,
  ) {
    return {
      success: true,
      data: await this.settingsUseCase.saveGradeGroup(principal.schoolId, {
        ...dto,
        id: groupId,
      }),
    };
  }

  @Delete('grade-groups/:groupId')
  @RequirePermissions(RBAC_PERMISSIONS.SETTINGS_STRUCTURE_WRITE)
  async deleteGradeGroup(
    @CurrentUser() principal: ActiveTenantContext,
    @Param('groupId', PositiveBigIntPipe) groupId: bigint,
  ) {
    await this.settingsUseCase.deleteGradeGroup(principal.schoolId, groupId);
    return { success: true, data: { deleted: true, id: Number(groupId) } };
  }

  // Grados académicos
  @Get('grades')
  @RequireAnyPermission(...STRUCTURE_LOOKUP_PERMISSIONS)
  async listGrades(@CurrentUser() principal: ActiveTenantContext) {
    return {
      success: true,
      data: await this.settingsUseCase.listGrades(principal.schoolId),
    };
  }

  @Post('grades')
  @RequirePermissions(RBAC_PERMISSIONS.SETTINGS_STRUCTURE_WRITE)
  @HttpCode(HttpStatus.CREATED)
  async createGrade(
    @CurrentUser() principal: ActiveTenantContext,
    @Body() dto: SaveGradeDto,
  ) {
    return {
      success: true,
      data: await this.settingsUseCase.saveGrade(principal.schoolId, dto),
    };
  }

  @Patch('grades/:gradeId')
  @RequirePermissions(RBAC_PERMISSIONS.SETTINGS_STRUCTURE_WRITE)
  async updateGrade(
    @CurrentUser() principal: ActiveTenantContext,
    @Param('gradeId', PositiveBigIntPipe) gradeId: bigint,
    @Body() dto: SaveGradeDto,
  ) {
    return {
      success: true,
      data: await this.settingsUseCase.saveGrade(principal.schoolId, {
        ...dto,
        id: gradeId,
      }),
    };
  }

  @Delete('grades/:gradeId')
  @RequirePermissions(RBAC_PERMISSIONS.SETTINGS_STRUCTURE_WRITE)
  async deleteGrade(
    @CurrentUser() principal: ActiveTenantContext,
    @Param('gradeId', PositiveBigIntPipe) gradeId: bigint,
  ) {
    await this.settingsUseCase.deleteGrade(principal.schoolId, gradeId);
    return { success: true, data: { deleted: true, id: Number(gradeId) } };
  }

  // Periodos académicos
  @Get('periods')
  @RequireAnyPermission(
    RBAC_PERMISSIONS.SETTINGS_PERIODS_VIEW,
    RBAC_PERMISSIONS.ACADEMIC_GRADES_VIEW,
    RBAC_PERMISSIONS.PORTAL_TEACHER_OWN,
  )
  @ApiQuery({ name: 'academicYear', required: false })
  async listPeriods(
    @CurrentUser() principal: ActiveTenantContext,
    @Query('academicYear') academicYear?: string,
  ) {
    const year =
      academicYear && /^\d{4}$/.test(academicYear)
        ? Number(academicYear)
        : principal.academicYear;
    return {
      success: true,
      data: await this.settingsUseCase.listPeriods(principal.schoolId, year),
    };
  }

  @Post('periods')
  @RequirePermissions(RBAC_PERMISSIONS.SETTINGS_PERIODS_WRITE)
  @HttpCode(HttpStatus.CREATED)
  async createPeriod(
    @CurrentUser() principal: ActiveTenantContext,
    @Body() dto: SaveAcademicPeriodDto,
  ) {
    return {
      success: true,
      data: await this.settingsUseCase.savePeriod(principal.schoolId, dto),
    };
  }

  @Patch('periods/:periodId')
  @RequirePermissions(RBAC_PERMISSIONS.SETTINGS_PERIODS_WRITE)
  async updatePeriod(
    @CurrentUser() principal: ActiveTenantContext,
    @Param('periodId', PositiveBigIntPipe) periodId: bigint,
    @Body() dto: SaveAcademicPeriodDto,
  ) {
    return {
      success: true,
      data: await this.settingsUseCase.savePeriod(principal.schoolId, {
        ...dto,
        id: periodId,
      }),
    };
  }

  @Delete('periods/:periodId')
  @RequirePermissions(RBAC_PERMISSIONS.SETTINGS_PERIODS_DELETE)
  async deletePeriod(
    @CurrentUser() principal: ActiveTenantContext,
    @Param('periodId', PositiveBigIntPipe) periodId: bigint,
  ) {
    await this.settingsUseCase.deletePeriod(principal.schoolId, periodId);
    return { success: true, data: { deleted: true, id: Number(periodId) } };
  }

  // Escala nacional y escalas de desempeño institucionales
  @Get('national-scales')
  @RequireAnyPermission(...SIEE_LOOKUP_PERMISSIONS)
  async listNationalScales(@CurrentUser() principal: ActiveTenantContext) {
    return {
      success: true,
      data: await this.settingsUseCase.listNationalScales(principal.schoolId),
    };
  }

  @Get('grading-scales')
  @RequireAnyPermission(...SIEE_LOOKUP_PERMISSIONS)
  @ApiQuery({ name: 'academicYear', required: false })
  async listGradingScales(
    @CurrentUser() principal: ActiveTenantContext,
    @Query('academicYear') academicYear?: string,
  ) {
    const year =
      academicYear && /^\d{4}$/.test(academicYear)
        ? Number(academicYear)
        : principal.academicYear;
    return {
      success: true,
      data: await this.settingsUseCase.listGradingScales(
        principal.schoolId,
        year,
      ),
    };
  }

  @Post('grading-scales')
  @RequirePermissions(RBAC_PERMISSIONS.SETTINGS_SIEE_WRITE)
  @HttpCode(HttpStatus.CREATED)
  async createGradingScale(
    @CurrentUser() principal: ActiveTenantContext,
    @Body() dto: SaveGradingScaleDto,
  ) {
    return {
      success: true,
      data: await this.settingsUseCase.saveGradingScale(
        principal.schoolId,
        dto,
      ),
    };
  }

  @Patch('grading-scales/:scaleId')
  @RequirePermissions(RBAC_PERMISSIONS.SETTINGS_SIEE_WRITE)
  async updateGradingScale(
    @CurrentUser() principal: ActiveTenantContext,
    @Param('scaleId', PositiveBigIntPipe) scaleId: bigint,
    @Body() dto: SaveGradingScaleDto,
  ) {
    return {
      success: true,
      data: await this.settingsUseCase.saveGradingScale(principal.schoolId, {
        ...dto,
        id: scaleId,
      }),
    };
  }

  @Delete('grading-scales/:scaleId')
  @RequirePermissions(RBAC_PERMISSIONS.SETTINGS_SIEE_WRITE)
  async deleteGradingScale(
    @CurrentUser() principal: ActiveTenantContext,
    @Param('scaleId', PositiveBigIntPipe) scaleId: bigint,
  ) {
    await this.settingsUseCase.deleteGradingScale(principal.schoolId, scaleId);
    return { success: true, data: { deleted: true, id: Number(scaleId) } };
  }

  // Competencias / dimensiones y columnas #1..#30
  @Get('dimensions')
  @RequireAnyPermission(
    RBAC_PERMISSIONS.SETTINGS_DIMENSIONS_VIEW,
    RBAC_PERMISSIONS.PORTAL_TEACHER_OWN,
    RBAC_PERMISSIONS.PORTAL_TEACHER_SUPERVISE_READ,
  )
  @ApiQuery({ name: 'academicYear', required: false })
  async listDimensions(
    @CurrentUser() principal: ActiveTenantContext,
    @Query('academicYear') academicYear?: string,
  ) {
    const year =
      academicYear && /^\d{4}$/.test(academicYear)
        ? Number(academicYear)
        : principal.academicYear;
    return {
      success: true,
      data: await this.settingsUseCase.listEvaluationDimensions(
        principal.schoolId,
        year,
      ),
    };
  }

  @Post('dimensions')
  @RequirePermissions(RBAC_PERMISSIONS.SETTINGS_DIMENSIONS_WRITE)
  @HttpCode(HttpStatus.CREATED)
  async createDimension(
    @CurrentUser() principal: ActiveTenantContext,
    @Body() dto: SaveEvaluationDimensionDto,
  ) {
    return {
      success: true,
      data: await this.settingsUseCase.saveEvaluationDimension(
        principal.schoolId,
        dto,
      ),
    };
  }

  @Patch('dimensions/:dimensionId')
  @RequirePermissions(RBAC_PERMISSIONS.SETTINGS_DIMENSIONS_WRITE)
  async updateDimension(
    @CurrentUser() principal: ActiveTenantContext,
    @Param('dimensionId', PositiveBigIntPipe) dimensionId: bigint,
    @Body() dto: SaveEvaluationDimensionDto,
  ) {
    return {
      success: true,
      data: await this.settingsUseCase.saveEvaluationDimension(
        principal.schoolId,
        { ...dto, id: dimensionId },
      ),
    };
  }

  @Delete('dimensions/:dimensionId')
  @RequirePermissions(RBAC_PERMISSIONS.SETTINGS_DIMENSIONS_DELETE)
  async deleteDimension(
    @CurrentUser() principal: ActiveTenantContext,
    @Param('dimensionId', PositiveBigIntPipe) dimensionId: bigint,
  ) {
    await this.settingsUseCase.deleteEvaluationDimension(
      principal.schoolId,
      dimensionId,
    );
    return { success: true, data: { deleted: true, id: Number(dimensionId) } };
  }

  @Post('dimensions/:dimensionId/columns')
  @RequirePermissions(RBAC_PERMISSIONS.SETTINGS_DIMENSIONS_WRITE)
  @HttpCode(HttpStatus.CREATED)
  async saveDimensionColumn(
    @CurrentUser() principal: ActiveTenantContext,
    @Param('dimensionId', PositiveBigIntPipe) dimensionId: bigint,
    @Body() dto: SaveDimensionColumnDto,
  ) {
    return {
      success: true,
      data: await this.settingsUseCase.saveDimensionColumn(
        principal.schoolId,
        dimensionId,
        dto,
      ),
    };
  }

  @Delete('dimensions/:dimensionId/columns/:columnId')
  @RequirePermissions(RBAC_PERMISSIONS.SETTINGS_DIMENSIONS_WRITE)
  async deleteDimensionColumn(
    @CurrentUser() principal: ActiveTenantContext,
    @Param('dimensionId', PositiveBigIntPipe) dimensionId: bigint,
    @Param('columnId', PositiveBigIntPipe) columnId: bigint,
  ) {
    await this.settingsUseCase.deleteDimensionColumn(
      principal.schoolId,
      dimensionId,
      columnId,
    );
    return { success: true, data: { deleted: true, id: Number(columnId) } };
  }

  // Observador (plantillas, aspectos/secciones y criterios)
  @Get('observer/templates')
  @RequireModule(RBAC_MODULES.STUDENT_OBSERVER)
  @RequireAnyPermission(
    RBAC_PERMISSIONS.SETTINGS_OBSERVER_VIEW,
    RBAC_PERMISSIONS.PORTAL_TEACHER_OWN,
    RBAC_PERMISSIONS.PORTAL_TEACHER_SUPERVISE_READ,
    RBAC_PERMISSIONS.PORTAL_TEACHER_OBSERVER_WRITE,
  )
  async listObserverTemplates(@CurrentUser() principal: ActiveTenantContext) {
    return {
      success: true,
      data: await this.settingsUseCase.listObserverTemplates(
        principal.schoolId,
      ),
    };
  }

  @Post('observer/templates')
  @RequireModule(RBAC_MODULES.STUDENT_OBSERVER)
  @RequirePermissions(RBAC_PERMISSIONS.SETTINGS_OBSERVER_WRITE)
  @HttpCode(HttpStatus.CREATED)
  async createObserverTemplate(
    @CurrentUser() principal: ActiveTenantContext,
    @Body() dto: SaveObserverTemplateDto,
  ) {
    return {
      success: true,
      data: await this.settingsUseCase.saveObserverTemplate(
        principal.schoolId,
        dto,
      ),
    };
  }

  @Patch('observer/templates/:templateId')
  @RequireModule(RBAC_MODULES.STUDENT_OBSERVER)
  @RequirePermissions(RBAC_PERMISSIONS.SETTINGS_OBSERVER_WRITE)
  async updateObserverTemplate(
    @CurrentUser() principal: ActiveTenantContext,
    @Param('templateId', PositiveBigIntPipe) templateId: bigint,
    @Body() dto: SaveObserverTemplateDto,
  ) {
    return {
      success: true,
      data: await this.settingsUseCase.saveObserverTemplate(
        principal.schoolId,
        { ...dto, id: templateId },
      ),
    };
  }

  @Delete('observer/templates/:templateId')
  @RequireModule(RBAC_MODULES.STUDENT_OBSERVER)
  @RequirePermissions(RBAC_PERMISSIONS.SETTINGS_OBSERVER_DELETE)
  async deleteObserverTemplate(
    @CurrentUser() principal: ActiveTenantContext,
    @Param('templateId', PositiveBigIntPipe) templateId: bigint,
  ) {
    await this.settingsUseCase.deleteObserverTemplate(
      principal.schoolId,
      templateId,
    );
    return { success: true, data: { deleted: true, id: Number(templateId) } };
  }

  @Post('observer/templates/:templateId/sections')
  @RequireModule(RBAC_MODULES.STUDENT_OBSERVER)
  @RequirePermissions(RBAC_PERMISSIONS.SETTINGS_OBSERVER_WRITE)
  @HttpCode(HttpStatus.CREATED)
  async createObserverSection(
    @CurrentUser() principal: ActiveTenantContext,
    @Param('templateId', PositiveBigIntPipe) templateId: bigint,
    @Body() dto: SaveObserverSectionDto,
  ) {
    return {
      success: true,
      data: await this.settingsUseCase.saveObserverSection(
        principal.schoolId,
        templateId,
        dto,
      ),
    };
  }

  @Delete('observer/sections/:sectionId')
  @RequireModule(RBAC_MODULES.STUDENT_OBSERVER)
  @RequirePermissions(RBAC_PERMISSIONS.SETTINGS_OBSERVER_WRITE)
  async deleteObserverSection(
    @CurrentUser() principal: ActiveTenantContext,
    @Param('sectionId', PositiveBigIntPipe) sectionId: bigint,
  ) {
    await this.settingsUseCase.deleteObserverSection(
      principal.schoolId,
      sectionId,
    );
    return { success: true, data: { deleted: true, id: Number(sectionId) } };
  }

  @Post('observer/sections/:sectionId/criteria')
  @RequireModule(RBAC_MODULES.STUDENT_OBSERVER)
  @RequirePermissions(RBAC_PERMISSIONS.SETTINGS_OBSERVER_WRITE)
  @HttpCode(HttpStatus.CREATED)
  async createObserverCriteria(
    @CurrentUser() principal: ActiveTenantContext,
    @Param('sectionId', PositiveBigIntPipe) sectionId: bigint,
    @Body() dto: SaveObserverCriteriaDto,
  ) {
    return {
      success: true,
      data: await this.settingsUseCase.saveObserverCriteria(
        principal.schoolId,
        sectionId,
        dto,
      ),
    };
  }

  @Delete('observer/criteria/:criteriaId')
  @RequireModule(RBAC_MODULES.STUDENT_OBSERVER)
  @RequirePermissions(RBAC_PERMISSIONS.SETTINGS_OBSERVER_WRITE)
  async deleteObserverCriteria(
    @CurrentUser() principal: ActiveTenantContext,
    @Param('criteriaId', PositiveBigIntPipe) criteriaId: bigint,
  ) {
    await this.settingsUseCase.deleteObserverCriteria(
      principal.schoolId,
      criteriaId,
    );
    return { success: true, data: { deleted: true, id: Number(criteriaId) } };
  }

  // Firmas, encabezados, carnés, módulos extra y limpieza de notas en cero
  @Get('branding')
  @RequirePermissions(RBAC_PERMISSIONS.SETTINGS_BRANDING_VIEW)
  async getBrandingSettings(@CurrentUser() principal: ActiveTenantContext) {
    return {
      success: true,
      data: await this.settingsUseCase.getBrandingSettings(principal.schoolId),
    };
  }

  @Patch('branding')
  @RequirePermissions(RBAC_PERMISSIONS.SETTINGS_BRANDING_WRITE)
  async updateBrandingSettings(
    @CurrentUser() principal: ActiveTenantContext,
    @Body() dto: UpdateBrandingSettingsDto,
  ) {
    return {
      success: true,
      data: await this.settingsUseCase.updateBrandingSettings(
        principal.schoolId,
        dto,
      ),
    };
  }

  @Get('modules')
  @RequireAnyPermission(
    RBAC_PERMISSIONS.SETTINGS_BRANDING_VIEW,
    RBAC_PERMISSIONS.SETTINGS_STRUCTURE_VIEW,
    RBAC_PERMISSIONS.IAM_RBAC_MANAGE,
    RBAC_PERMISSIONS.SETTINGS_MODULES_MANAGE,
  )
  async listSchoolModules(@CurrentUser() principal: ActiveTenantContext) {
    return {
      success: true,
      data: await this.settingsUseCase.listSchoolModules(principal.schoolId),
    };
  }

  @Patch('modules/:systemModuleId')
  @Roles(CommunityRole.SUPER_ADMIN)
  @RequirePermissions(RBAC_PERMISSIONS.SETTINGS_MODULES_MANAGE)
  async toggleSchoolModule(
    @CurrentUser() principal: ActiveTenantContext,
    @Param('systemModuleId', ParseIntPipe) systemModuleId: number,
    @Body() dto: ToggleSchoolModuleDto,
  ) {
    const updated = await this.settingsUseCase.toggleSchoolModule(
      principal.schoolId,
      systemModuleId,
      dto.isActive,
    );
    this.rbacPermissions.invalidateSchoolCache(principal.schoolId);
    return {
      success: true,
      data: updated,
    };
  }

  @Post('cleanup-zero-grades')
  @RequirePermissions(RBAC_PERMISSIONS.SETTINGS_CLEANUP_ZERO_GRADES_EXECUTE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Eliminar notas en cero no bloqueadas de periodos abiertos del año lectivo',
  })
  async cleanupZeroGrades(
    @CurrentUser() principal: ActiveTenantContext,
    @Body() dto: CleanupZeroGradesDto,
  ) {
    return {
      success: true,
      data: await this.settingsUseCase.cleanupZeroGrades(
        principal.schoolId,
        dto.academicYear,
        principal.userId,
      ),
    };
  }
}
