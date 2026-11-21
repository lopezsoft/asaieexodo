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
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ActiveTenantContext } from '../../../../shared/application/context/tenant-context.service';
import {
  CurrentUser,
  Roles,
} from '../../../../shared/infrastructure/http/decorators/security.decorators';
import { PositiveBigIntPipe } from '../../../../shared/infrastructure/http/pipes/positive-bigint.pipe';
import { CommunityRole } from '../../../iam/domain/enums/community-role.enum';
import { ManageTeacherExtendedUseCase } from '../../application/use-cases/manage-teacher-extended.use-case';
import {
  AssignAchievementsBatchDto,
  CreateAchievementsMultiScaleDto,
  SaveGradeItemsBatchDto,
  SaveLevelingsBatchDto,
  SaveObserverExtendedDto,
  SaveTrackingFormatBatchDto,
  SyncCourseAchievementsDto,
  UpdateTeacherSelfProfileDto,
  UpsertTeacherColumnDto,
} from './dto/teacher-extended.dto';

const TEACHER_ROLES = [
  CommunityRole.SUPER_ADMIN,
  CommunityRole.SCHOOL_ADMIN,
  CommunityRole.RECTOR,
  CommunityRole.COORDINATOR,
  CommunityRole.SECRETARY,
  CommunityRole.TEACHER,
] as const;

@ApiTags('Teacher Portal Extended (asaie-teachers Parity)')
@ApiBearerAuth('jwt-auth')
@Controller('teacher')
export class TeacherExtendedController {
  constructor(private readonly useCase: ManageTeacherExtendedUseCase) {}

  @Get('periods')
  @Roles(...TEACHER_ROLES)
  async listPeriods(
    @CurrentUser() p: ActiveTenantContext,
    @Query('academicYear') academicYear?: string,
  ) {
    return {
      success: true,
      data: await this.useCase.listTeacherPeriods(
        p.schoolId,
        this.parseYear(academicYear, p.academicYear),
      ),
    };
  }

  @Get('profile')
  @Roles(...TEACHER_ROLES)
  async getSelfProfile(@CurrentUser() p: ActiveTenantContext) {
    return {
      success: true,
      data: await this.useCase.getTeacherSelfProfile(p.schoolId, p.userId),
    };
  }

  @Patch('profile')
  @Roles(...TEACHER_ROLES)
  async updateSelfProfile(
    @CurrentUser() p: ActiveTenantContext,
    @Body() dto: UpdateTeacherSelfProfileDto,
  ) {
    return {
      success: true,
      data: await this.useCase.updateTeacherSelfProfile(
        p.schoolId,
        p.userId,
        dto,
      ),
    };
  }

  // Columnas dinámicas de planilla (n1..n30) e ítems de calificación
  @Get('courses/:courseAssignmentId/columns')
  @Roles(...TEACHER_ROLES)
  async listCourseColumns(
    @CurrentUser() p: ActiveTenantContext,
    @Param('courseAssignmentId', PositiveBigIntPipe) courseAssignmentId: bigint,
    @Query('periodNumber') periodNumber?: string,
  ) {
    return {
      success: true,
      data: await this.useCase.listCourseColumns(
        p.schoolId,
        courseAssignmentId,
        periodNumber && /^\d+$/.test(periodNumber) ? Number(periodNumber) : 1,
      ),
    };
  }

  @Post('courses/:courseAssignmentId/columns')
  @Roles(...TEACHER_ROLES)
  @HttpCode(HttpStatus.OK)
  async upsertCourseColumn(
    @CurrentUser() p: ActiveTenantContext,
    @Param('courseAssignmentId', PositiveBigIntPipe) courseAssignmentId: bigint,
    @Body() dto: UpsertTeacherColumnDto,
  ) {
    return {
      success: true,
      data: await this.useCase.upsertCourseColumn(
        p.schoolId,
        courseAssignmentId,
        dto,
      ),
    };
  }

  @Delete('columns/:columnId')
  @Roles(...TEACHER_ROLES)
  async deleteCourseColumn(
    @CurrentUser() p: ActiveTenantContext,
    @Param('columnId', PositiveBigIntPipe) columnId: bigint,
  ) {
    await this.useCase.deleteCourseColumn(p.schoolId, columnId);
    return { success: true, data: { deleted: true, id: Number(columnId) } };
  }

  @Get('courses/:courseAssignmentId/grade-items')
  @Roles(...TEACHER_ROLES)
  async listGradeItems(
    @CurrentUser() p: ActiveTenantContext,
    @Param('courseAssignmentId', PositiveBigIntPipe) courseAssignmentId: bigint,
    @Query('academicYear') academicYear?: string,
    @Query('periodNumber') periodNumber?: string,
  ) {
    return {
      success: true,
      data: await this.useCase.listCourseGradeItems(
        p.schoolId,
        courseAssignmentId,
        this.parseYear(academicYear, p.academicYear),
        periodNumber && /^\d+$/.test(periodNumber) ? Number(periodNumber) : 1,
      ),
    };
  }

  @Put('courses/:courseAssignmentId/grade-items')
  @Roles(...TEACHER_ROLES)
  async saveGradeItemsBatch(
    @CurrentUser() p: ActiveTenantContext,
    @Param('courseAssignmentId', PositiveBigIntPipe) courseAssignmentId: bigint,
    @Body() dto: SaveGradeItemsBatchDto,
  ) {
    return {
      success: true,
      data: await this.useCase.saveGradeItemsBatch(
        p.schoolId,
        courseAssignmentId,
        dto,
      ),
    };
  }

  // Descriptores multi-escala, asignación a notas y sincronización automática
  @Post('achievements/multi-scale')
  @Roles(...TEACHER_ROLES)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear descriptores simultáneamente para múltiples desempeños de escala nacional' })
  async createMultiScale(
    @CurrentUser() p: ActiveTenantContext,
    @Body() dto: CreateAchievementsMultiScaleDto,
  ) {
    return {
      success: true,
      data: await this.useCase.createAchievementsMultiScale(p.schoolId, dto),
    };
  }

  @Get('courses/:courseAssignmentId/assigned-achievements')
  @Roles(...TEACHER_ROLES)
  async listAssignedAchievements(
    @CurrentUser() p: ActiveTenantContext,
    @Param('courseAssignmentId', PositiveBigIntPipe) courseAssignmentId: bigint,
    @Query('academicYear') academicYear?: string,
    @Query('periodNumber') periodNumber?: string,
  ) {
    return {
      success: true,
      data: await this.useCase.listCourseAssignedAchievements(
        p.schoolId,
        courseAssignmentId,
        this.parseYear(academicYear, p.academicYear),
        periodNumber && /^\d+$/.test(periodNumber) ? Number(periodNumber) : 1,
      ),
    };
  }

  @Post('grades/assign-achievements')
  @Roles(...TEACHER_ROLES)
  @HttpCode(HttpStatus.OK)
  async assignAchievementsBatch(
    @CurrentUser() p: ActiveTenantContext,
    @Body() dto: AssignAchievementsBatchDto,
  ) {
    return {
      success: true,
      data: await this.useCase.assignAchievementsBatch(p.schoolId, dto),
    };
  }

  @Delete('grades/assigned-achievements/:academicScoreId/:achievementStandardId')
  @Roles(...TEACHER_ROLES)
  async unassignAchievement(
    @CurrentUser() p: ActiveTenantContext,
    @Param('academicScoreId', PositiveBigIntPipe) academicScoreId: bigint,
    @Param('achievementStandardId', PositiveBigIntPipe) achievementStandardId: bigint,
    @Query('academicYear') academicYear?: string,
  ) {
    await this.useCase.unassignAchievement(
      p.schoolId,
      this.parseYear(academicYear, p.academicYear),
      academicScoreId,
      achievementStandardId,
    );
    return {
      success: true,
      data: {
        deleted: true,
        academicScoreId: Number(academicScoreId),
        achievementStandardId: Number(achievementStandardId),
      },
    };
  }

  @Post('courses/:courseAssignmentId/sync-achievements')
  @Roles(...TEACHER_ROLES)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sincronizar descriptores y logros con las calificaciones según desempeño nacional' })
  async syncCourseAchievements(
    @CurrentUser() p: ActiveTenantContext,
    @Param('courseAssignmentId', PositiveBigIntPipe) courseAssignmentId: bigint,
    @Body() dto: SyncCourseAchievementsDto,
  ) {
    return {
      success: true,
      data: await this.useCase.syncCourseAchievements(
        p.schoolId,
        courseAssignmentId,
        dto,
      ),
    };
  }

  // Nivelaciones periódicas y de fin de año desde docente
  @Get('levelings/periodic')
  @Roles(...TEACHER_ROLES)
  async listPeriodicLevelings(
    @CurrentUser() p: ActiveTenantContext,
    @Query('courseAssignmentId') courseAssignmentId: string,
    @Query('academicYear') academicYear?: string,
    @Query('periodNumber') periodNumber?: string,
  ) {
    const cid = /^\d+$/.test(courseAssignmentId ?? '')
      ? BigInt(courseAssignmentId)
      : 0n;
    return {
      success: true,
      data: await this.useCase.listPeriodicLevelings(
        p.schoolId,
        cid,
        this.parseYear(academicYear, p.academicYear),
        periodNumber && /^\d+$/.test(periodNumber) ? Number(periodNumber) : 1,
      ),
    };
  }

  @Get('levelings/final')
  @Roles(...TEACHER_ROLES)
  async listFinalLevelings(
    @CurrentUser() p: ActiveTenantContext,
    @Query('academicYear') academicYear?: string,
  ) {
    return {
      success: true,
      data: await this.useCase.listFinalLevelings(
        p.schoolId,
        p.userId,
        p.activeRole,
        this.parseYear(academicYear, p.academicYear),
      ),
    };
  }

  @Post('levelings/save-batch')
  @Roles(...TEACHER_ROLES)
  @HttpCode(HttpStatus.OK)
  async saveLevelingsBatch(
    @CurrentUser() p: ActiveTenantContext,
    @Body() dto: SaveLevelingsBatchDto,
  ) {
    return {
      success: true,
      data: await this.useCase.saveLevelingsBatch(p.schoolId, dto),
    };
  }

  // Observador Modelo 5 (condiciones físicas, familia, barreras/inclusión) + Modelo 3 (matriz N/AV/CS/S)
  @Get('observer/:enrollmentId/extended')
  @Roles(...TEACHER_ROLES)
  async getObserverExtended(
    @CurrentUser() p: ActiveTenantContext,
    @Param('enrollmentId', PositiveBigIntPipe) enrollmentId: bigint,
  ) {
    return {
      success: true,
      data: await this.useCase.getObserverExtendedData(p.schoolId, enrollmentId),
    };
  }

  @Put('observer/:enrollmentId/extended')
  @Roles(...TEACHER_ROLES)
  async saveObserverExtended(
    @CurrentUser() p: ActiveTenantContext,
    @Param('enrollmentId', PositiveBigIntPipe) enrollmentId: bigint,
    @Body() dto: SaveObserverExtendedDto,
  ) {
    return {
      success: true,
      data: await this.useCase.saveObserverExtendedData(
        p.schoolId,
        enrollmentId,
        dto,
      ),
    };
  }

  // Formato de seguimiento de acceso y conectividad (FormatoSeguimientoForm.js)
  @Get('tracking-format')
  @Roles(...TEACHER_ROLES)
  async listTrackingFormat(
    @CurrentUser() p: ActiveTenantContext,
    @Query('academicGroupId') academicGroupId: string,
    @Query('academicYear') academicYear?: string,
  ) {
    const gid = /^\d+$/.test(academicGroupId ?? '')
      ? BigInt(academicGroupId)
      : 0n;
    return {
      success: true,
      data: await this.useCase.listTrackingFormat(
        p.schoolId,
        gid,
        this.parseYear(academicYear, p.academicYear),
      ),
    };
  }

  @Put('tracking-format')
  @Roles(...TEACHER_ROLES)
  async saveTrackingFormat(
    @CurrentUser() p: ActiveTenantContext,
    @Body() dto: SaveTrackingFormatBatchDto,
  ) {
    return {
      success: true,
      data: await this.useCase.saveTrackingFormatBatch(p.schoolId, dto),
    };
  }

  private parseYear(raw: string | undefined, fallback: number): number {
    return raw && /^\d{4}$/.test(raw) ? Number(raw) : fallback;
  }
}
