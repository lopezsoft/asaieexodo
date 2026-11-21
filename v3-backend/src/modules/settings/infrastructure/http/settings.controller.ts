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
  Roles,
} from '../../../../shared/infrastructure/http/decorators/security.decorators';
import { PositiveBigIntPipe } from '../../../../shared/infrastructure/http/pipes/positive-bigint.pipe';
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

const READ_ROLES = [
  CommunityRole.SUPER_ADMIN,
  CommunityRole.SCHOOL_ADMIN,
  CommunityRole.RECTOR,
  CommunityRole.COORDINATOR,
  CommunityRole.SECRETARY,
  CommunityRole.TEACHER,
] as const;

const WRITE_ROLES = [
  CommunityRole.SUPER_ADMIN,
  CommunityRole.SCHOOL_ADMIN,
  CommunityRole.RECTOR,
  CommunityRole.COORDINATOR,
] as const;

const STRICT_ADMIN_ROLES = [
  CommunityRole.SUPER_ADMIN,
  CommunityRole.SCHOOL_ADMIN,
  CommunityRole.RECTOR,
] as const;

@ApiTags('Institutional Settings & Academic Configuration')
@ApiBearerAuth('jwt-auth')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsUseCase: ManageSettingsUseCase) {}

  // Años lectivos y configuración de boletines/certificados
  @Get('academic-years')
  @Roles(...READ_ROLES)
  @ApiOperation({ summary: 'Listar años lectivos configurados del colegio' })
  async listAcademicYears(@CurrentUser() principal: ActiveTenantContext) {
    return {
      success: true,
      data: await this.settingsUseCase.listAcademicYears(principal.schoolId),
    };
  }

  @Post('academic-years')
  @Roles(...STRICT_ADMIN_ROLES)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Crear o actualizar año lectivo y ajustes de boletines' })
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

  // Reglas generales de evaluación y promoción
  @Get('grading-rules')
  @Roles(...READ_ROLES)
  @ApiQuery({ name: 'academicYear', required: false })
  @ApiOperation({ summary: 'Listar reglas generales de evaluación por grupo de grados' })
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
  @Roles(...STRICT_ADMIN_ROLES)
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
  @Roles(...STRICT_ADMIN_ROLES)
  async deleteGradingRule(
    @CurrentUser() principal: ActiveTenantContext,
    @Param('ruleId', PositiveBigIntPipe) ruleId: bigint,
  ) {
    await this.settingsUseCase.deleteGradingRule(principal.schoolId, ruleId);
    return { success: true, data: { deleted: true, id: Number(ruleId) } };
  }

  // Jornadas
  @Get('shifts')
  @Roles(...READ_ROLES)
  async listShifts(@CurrentUser() principal: ActiveTenantContext) {
    return {
      success: true,
      data: await this.settingsUseCase.listShifts(principal.schoolId),
    };
  }

  @Post('shifts')
  @Roles(...STRICT_ADMIN_ROLES)
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
  @Roles(...STRICT_ADMIN_ROLES)
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
  @Roles(...STRICT_ADMIN_ROLES)
  async deleteShift(
    @CurrentUser() principal: ActiveTenantContext,
    @Param('shiftId', PositiveBigIntPipe) shiftId: bigint,
  ) {
    await this.settingsUseCase.deleteShift(principal.schoolId, shiftId);
    return { success: true, data: { deleted: true, id: Number(shiftId) } };
  }

  // Niveles educativos
  @Get('education-levels')
  @Roles(...READ_ROLES)
  async listEducationLevels(@CurrentUser() principal: ActiveTenantContext) {
    return {
      success: true,
      data: await this.settingsUseCase.listEducationLevels(principal.schoolId),
    };
  }

  @Post('education-levels')
  @Roles(...STRICT_ADMIN_ROLES)
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
  @Roles(...STRICT_ADMIN_ROLES)
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
  @Roles(...STRICT_ADMIN_ROLES)
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
  @Roles(...READ_ROLES)
  async listGradeGroups(@CurrentUser() principal: ActiveTenantContext) {
    return {
      success: true,
      data: await this.settingsUseCase.listGradeGroups(principal.schoolId),
    };
  }

  @Post('grade-groups')
  @Roles(...STRICT_ADMIN_ROLES)
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
  @Roles(...STRICT_ADMIN_ROLES)
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
  @Roles(...STRICT_ADMIN_ROLES)
  async deleteGradeGroup(
    @CurrentUser() principal: ActiveTenantContext,
    @Param('groupId', PositiveBigIntPipe) groupId: bigint,
  ) {
    await this.settingsUseCase.deleteGradeGroup(principal.schoolId, groupId);
    return { success: true, data: { deleted: true, id: Number(groupId) } };
  }

  // Grados académicos
  @Get('grades')
  @Roles(...READ_ROLES)
  async listGrades(@CurrentUser() principal: ActiveTenantContext) {
    return {
      success: true,
      data: await this.settingsUseCase.listGrades(principal.schoolId),
    };
  }

  @Post('grades')
  @Roles(...STRICT_ADMIN_ROLES)
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
  @Roles(...STRICT_ADMIN_ROLES)
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
  @Roles(...STRICT_ADMIN_ROLES)
  async deleteGrade(
    @CurrentUser() principal: ActiveTenantContext,
    @Param('gradeId', PositiveBigIntPipe) gradeId: bigint,
  ) {
    await this.settingsUseCase.deleteGrade(principal.schoolId, gradeId);
    return { success: true, data: { deleted: true, id: Number(gradeId) } };
  }

  // Periodos académicos
  @Get('periods')
  @Roles(...READ_ROLES)
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
  @Roles(...WRITE_ROLES)
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
  @Roles(...WRITE_ROLES)
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
  @Roles(...STRICT_ADMIN_ROLES)
  async deletePeriod(
    @CurrentUser() principal: ActiveTenantContext,
    @Param('periodId', PositiveBigIntPipe) periodId: bigint,
  ) {
    await this.settingsUseCase.deletePeriod(principal.schoolId, periodId);
    return { success: true, data: { deleted: true, id: Number(periodId) } };
  }

  // Escala nacional y escalas de desempeño institucionales
  @Get('national-scales')
  @Roles(...READ_ROLES)
  async listNationalScales(@CurrentUser() principal: ActiveTenantContext) {
    return {
      success: true,
      data: await this.settingsUseCase.listNationalScales(principal.schoolId),
    };
  }

  @Get('grading-scales')
  @Roles(...READ_ROLES)
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
  @Roles(...STRICT_ADMIN_ROLES)
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
  @Roles(...STRICT_ADMIN_ROLES)
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
  @Roles(...STRICT_ADMIN_ROLES)
  async deleteGradingScale(
    @CurrentUser() principal: ActiveTenantContext,
    @Param('scaleId', PositiveBigIntPipe) scaleId: bigint,
  ) {
    await this.settingsUseCase.deleteGradingScale(principal.schoolId, scaleId);
    return { success: true, data: { deleted: true, id: Number(scaleId) } };
  }

  // Competencias / dimensiones y columnas #1..#30
  @Get('dimensions')
  @Roles(...READ_ROLES)
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
  @Roles(...WRITE_ROLES)
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
  @Roles(...WRITE_ROLES)
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
  @Roles(...STRICT_ADMIN_ROLES)
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
  @Roles(...WRITE_ROLES)
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
  @Roles(...WRITE_ROLES)
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
  @Roles(...READ_ROLES)
  async listObserverTemplates(@CurrentUser() principal: ActiveTenantContext) {
    return {
      success: true,
      data: await this.settingsUseCase.listObserverTemplates(
        principal.schoolId,
      ),
    };
  }

  @Post('observer/templates')
  @Roles(...WRITE_ROLES)
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
  @Roles(...WRITE_ROLES)
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
  @Roles(...STRICT_ADMIN_ROLES)
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
  @Roles(...WRITE_ROLES)
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
  @Roles(...WRITE_ROLES)
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
  @Roles(...WRITE_ROLES)
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
  @Roles(...WRITE_ROLES)
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
  @Roles(...READ_ROLES)
  async getBrandingSettings(@CurrentUser() principal: ActiveTenantContext) {
    return {
      success: true,
      data: await this.settingsUseCase.getBrandingSettings(principal.schoolId),
    };
  }

  @Patch('branding')
  @Roles(...STRICT_ADMIN_ROLES)
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
  @Roles(...READ_ROLES)
  async listSchoolModules(@CurrentUser() principal: ActiveTenantContext) {
    return {
      success: true,
      data: await this.settingsUseCase.listSchoolModules(principal.schoolId),
    };
  }

  @Patch('modules/:systemModuleId')
  @Roles(...STRICT_ADMIN_ROLES)
  async toggleSchoolModule(
    @CurrentUser() principal: ActiveTenantContext,
    @Param('systemModuleId', ParseIntPipe) systemModuleId: number,
    @Body() dto: ToggleSchoolModuleDto,
  ) {
    return {
      success: true,
      data: await this.settingsUseCase.toggleSchoolModule(
        principal.schoolId,
        systemModuleId,
        dto.isActive,
      ),
    };
  }

  @Post('cleanup-zero-grades')
  @Roles(...STRICT_ADMIN_ROLES)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Eliminar notas en cero no bloqueadas del año lectivo (equivalente a Eliminar Notas en Cero)',
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
      ),
    };
  }
}
