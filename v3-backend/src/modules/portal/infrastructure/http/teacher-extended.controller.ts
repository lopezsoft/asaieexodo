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
import { TenantAccessDeniedException } from '../../../../shared/domain/exceptions/tenant-access-denied.exception';
import { PostgresRlsService } from '../../../../shared/infrastructure/database/postgres-rls.service';
import {
  CurrentUser,
  RequireAnyPermission,
  RequireModule,
  RequirePermissions,
} from '../../../../shared/infrastructure/http/decorators/security.decorators';
import { PositiveBigIntPipe } from '../../../../shared/infrastructure/http/pipes/positive-bigint.pipe';
import {
  RBAC_MODULES,
  RBAC_PERMISSIONS,
} from '../../../../shared/infrastructure/rbac/rbac-permissions.constants';
import { RbacPermissionsService } from '../../../../shared/infrastructure/rbac/rbac-permissions.service';
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

@ApiTags('Teacher Portal Extended (asaie-teachers Parity)')
@ApiBearerAuth('jwt-auth')
@Controller('teacher')
export class TeacherExtendedController {
  constructor(
    private readonly useCase: ManageTeacherExtendedUseCase,
    private readonly rbacPermissions: RbacPermissionsService,
    private readonly db: PostgresRlsService,
  ) {}

  @Get('periods')
  @RequireModule(RBAC_MODULES.ACADEMIC_GRADES)
  @RequireAnyPermission(
    RBAC_PERMISSIONS.PORTAL_TEACHER_OWN,
    RBAC_PERMISSIONS.PORTAL_TEACHER_SUPERVISE_READ,
  )
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
  @RequireAnyPermission(
    RBAC_PERMISSIONS.PORTAL_TEACHER_OWN,
    RBAC_PERMISSIONS.PORTAL_TEACHER_SUPERVISE_READ,
  )
  async getSelfProfile(@CurrentUser() p: ActiveTenantContext) {
    return {
      success: true,
      data: await this.useCase.getTeacherSelfProfile(p.schoolId, p.userId),
    };
  }

  @Patch('profile')
  @RequirePermissions(RBAC_PERMISSIONS.PORTAL_TEACHER_OWN)
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
  @RequireModule(RBAC_MODULES.ACADEMIC_GRADES)
  @RequireAnyPermission(
    RBAC_PERMISSIONS.PORTAL_TEACHER_OWN,
    RBAC_PERMISSIONS.PORTAL_TEACHER_SUPERVISE_READ,
  )
  async listCourseColumns(
    @CurrentUser() p: ActiveTenantContext,
    @Param('courseAssignmentId', PositiveBigIntPipe) courseAssignmentId: bigint,
    @Query('periodNumber') periodNumber?: string,
  ) {
    await this.assertCanReadCourse(p, courseAssignmentId);
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
  @RequireModule(RBAC_MODULES.ACADEMIC_GRADES)
  @RequireAnyPermission(
    RBAC_PERMISSIONS.PORTAL_TEACHER_OWN,
    RBAC_PERMISSIONS.ACADEMIC_GRADES_RECTOR_OVERRIDE,
  )
  @HttpCode(HttpStatus.OK)
  async upsertCourseColumn(
    @CurrentUser() p: ActiveTenantContext,
    @Param('courseAssignmentId', PositiveBigIntPipe) courseAssignmentId: bigint,
    @Body() dto: UpsertTeacherColumnDto,
  ) {
    await this.assertCanWriteCourse(p, courseAssignmentId);
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
  @RequireModule(RBAC_MODULES.ACADEMIC_GRADES)
  @RequireAnyPermission(
    RBAC_PERMISSIONS.PORTAL_TEACHER_OWN,
    RBAC_PERMISSIONS.ACADEMIC_GRADES_RECTOR_OVERRIDE,
  )
  async deleteCourseColumn(
    @CurrentUser() p: ActiveTenantContext,
    @Param('columnId', PositiveBigIntPipe) columnId: bigint,
  ) {
    await this.useCase.deleteCourseColumn(p.schoolId, columnId);
    return { success: true, data: { deleted: true, id: Number(columnId) } };
  }

  @Get('courses/:courseAssignmentId/grade-items')
  @RequireModule(RBAC_MODULES.ACADEMIC_GRADES)
  @RequireAnyPermission(
    RBAC_PERMISSIONS.PORTAL_TEACHER_OWN,
    RBAC_PERMISSIONS.PORTAL_TEACHER_SUPERVISE_READ,
  )
  async listGradeItems(
    @CurrentUser() p: ActiveTenantContext,
    @Param('courseAssignmentId', PositiveBigIntPipe) courseAssignmentId: bigint,
    @Query('academicYear') academicYear?: string,
    @Query('periodNumber') periodNumber?: string,
  ) {
    await this.assertCanReadCourse(p, courseAssignmentId);
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
  @RequireModule(RBAC_MODULES.ACADEMIC_GRADES)
  @RequireAnyPermission(
    RBAC_PERMISSIONS.PORTAL_TEACHER_OWN,
    RBAC_PERMISSIONS.ACADEMIC_GRADES_RECTOR_OVERRIDE,
  )
  async saveGradeItemsBatch(
    @CurrentUser() p: ActiveTenantContext,
    @Param('courseAssignmentId', PositiveBigIntPipe) courseAssignmentId: bigint,
    @Body() dto: SaveGradeItemsBatchDto,
  ) {
    await this.assertCanWriteCourse(p, courseAssignmentId);
    return {
      success: true,
      data: await this.useCase.saveGradeItemsBatch(
        p.schoolId,
        courseAssignmentId,
        dto,
        p.userId,
      ),
    };
  }

  // Descriptores multi-escala, asignación a notas y sincronización automática
  @Post('achievements/multi-scale')
  @RequireModule(RBAC_MODULES.ACADEMIC_GRADES)
  @RequireAnyPermission(
    RBAC_PERMISSIONS.PORTAL_TEACHER_OWN,
    RBAC_PERMISSIONS.ACADEMIC_CURRICULUM_WRITE,
  )
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary:
      'Crear descriptores simultáneamente para múltiples desempeños de escala nacional',
  })
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
  @RequireModule(RBAC_MODULES.ACADEMIC_GRADES)
  @RequireAnyPermission(
    RBAC_PERMISSIONS.PORTAL_TEACHER_OWN,
    RBAC_PERMISSIONS.PORTAL_TEACHER_SUPERVISE_READ,
  )
  async listAssignedAchievements(
    @CurrentUser() p: ActiveTenantContext,
    @Param('courseAssignmentId', PositiveBigIntPipe) courseAssignmentId: bigint,
    @Query('academicYear') academicYear?: string,
    @Query('periodNumber') periodNumber?: string,
  ) {
    await this.assertCanReadCourse(p, courseAssignmentId);
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
  @RequireModule(RBAC_MODULES.ACADEMIC_GRADES)
  @RequireAnyPermission(
    RBAC_PERMISSIONS.PORTAL_TEACHER_OWN,
    RBAC_PERMISSIONS.ACADEMIC_GRADES_RECTOR_OVERRIDE,
  )
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

  @Delete(
    'grades/assigned-achievements/:academicScoreId/:achievementStandardId',
  )
  @RequireModule(RBAC_MODULES.ACADEMIC_GRADES)
  @RequireAnyPermission(
    RBAC_PERMISSIONS.PORTAL_TEACHER_OWN,
    RBAC_PERMISSIONS.ACADEMIC_GRADES_RECTOR_OVERRIDE,
  )
  async unassignAchievement(
    @CurrentUser() p: ActiveTenantContext,
    @Param('academicScoreId', PositiveBigIntPipe) academicScoreId: bigint,
    @Param('achievementStandardId', PositiveBigIntPipe)
    achievementStandardId: bigint,
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
  @RequireModule(RBAC_MODULES.ACADEMIC_GRADES)
  @RequireAnyPermission(
    RBAC_PERMISSIONS.PORTAL_TEACHER_OWN,
    RBAC_PERMISSIONS.ACADEMIC_GRADES_RECTOR_OVERRIDE,
  )
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Sincronizar descriptores y logros con las calificaciones según desempeño nacional',
  })
  async syncCourseAchievements(
    @CurrentUser() p: ActiveTenantContext,
    @Param('courseAssignmentId', PositiveBigIntPipe) courseAssignmentId: bigint,
    @Body() dto: SyncCourseAchievementsDto,
  ) {
    await this.assertCanWriteCourse(p, courseAssignmentId);
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
  @RequireModule(RBAC_MODULES.ACADEMIC_GRADES)
  @RequireAnyPermission(
    RBAC_PERMISSIONS.PORTAL_TEACHER_OWN,
    RBAC_PERMISSIONS.PORTAL_TEACHER_SUPERVISE_READ,
  )
  async listPeriodicLevelings(
    @CurrentUser() p: ActiveTenantContext,
    @Query('courseAssignmentId') courseAssignmentId: string,
    @Query('academicYear') academicYear?: string,
    @Query('periodNumber') periodNumber?: string,
    @Query('filterMode') filterMode?: string,
  ) {
    const cid = /^\d+$/.test(courseAssignmentId ?? '')
      ? BigInt(courseAssignmentId)
      : 0n;
    if (cid > 0n) {
      await this.assertCanReadCourse(p, cid);
    }
    const safeMode: 'FAILED' | 'LEVELED' | 'ALL' =
      filterMode === 'LEVELED' || filterMode === 'ALL' ? filterMode : 'FAILED';
    return {
      success: true,
      data: await this.useCase.listPeriodicLevelings(
        p.schoolId,
        cid,
        this.parseYear(academicYear, p.academicYear),
        periodNumber && /^\d+$/.test(periodNumber) ? Number(periodNumber) : 1,
        safeMode,
      ),
    };
  }

  @Get('levelings/final')
  @RequireModule(RBAC_MODULES.ACADEMIC_GRADES)
  @RequireAnyPermission(
    RBAC_PERMISSIONS.PORTAL_TEACHER_OWN,
    RBAC_PERMISSIONS.PORTAL_TEACHER_SUPERVISE_READ,
  )
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
  @RequireModule(RBAC_MODULES.ACADEMIC_GRADES)
  @RequireAnyPermission(
    RBAC_PERMISSIONS.PORTAL_TEACHER_OWN,
    RBAC_PERMISSIONS.ACADEMIC_RECOVERIES_WRITE,
  )
  @HttpCode(HttpStatus.OK)
  async saveLevelingsBatch(
    @CurrentUser() p: ActiveTenantContext,
    @Body() dto: SaveLevelingsBatchDto,
  ) {
    return {
      success: true,
      data: await this.useCase.saveLevelingsBatch(p.schoolId, dto, p.userId),
    };
  }

  // Observador Modelo 5 (condiciones físicas, familia, barreras/inclusión) + Modelo 3 (matriz N/AV/CS/S)
  @Get('observer/:enrollmentId/extended')
  @RequireModule(RBAC_MODULES.STUDENT_OBSERVER)
  @RequireAnyPermission(
    RBAC_PERMISSIONS.PORTAL_TEACHER_OWN,
    RBAC_PERMISSIONS.PORTAL_TEACHER_SUPERVISE_READ,
    RBAC_PERMISSIONS.PORTAL_TEACHER_OBSERVER_WRITE,
  )
  async getObserverExtended(
    @CurrentUser() p: ActiveTenantContext,
    @Param('enrollmentId', PositiveBigIntPipe) enrollmentId: bigint,
  ) {
    return {
      success: true,
      data: await this.useCase.getObserverExtendedData(
        p.schoolId,
        enrollmentId,
      ),
    };
  }

  @Put('observer/:enrollmentId/extended')
  @RequireModule(RBAC_MODULES.STUDENT_OBSERVER)
  @RequireAnyPermission(
    RBAC_PERMISSIONS.PORTAL_TEACHER_OWN,
    RBAC_PERMISSIONS.PORTAL_TEACHER_OBSERVER_WRITE,
  )
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

  // Formato de seguimiento de acceso y conectividad
  @Get('tracking-format')
  @RequireModule(RBAC_MODULES.ACADEMIC_GRADES)
  @RequireAnyPermission(
    RBAC_PERMISSIONS.PORTAL_TEACHER_OWN,
    RBAC_PERMISSIONS.PORTAL_TEACHER_SUPERVISE_READ,
  )
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
  @RequireModule(RBAC_MODULES.ACADEMIC_GRADES)
  @RequireAnyPermission(
    RBAC_PERMISSIONS.PORTAL_TEACHER_OWN,
    RBAC_PERMISSIONS.PORTAL_TEACHER_OBSERVER_WRITE,
  )
  async saveTrackingFormat(
    @CurrentUser() p: ActiveTenantContext,
    @Body() dto: SaveTrackingFormatBatchDto,
  ) {
    return {
      success: true,
      data: await this.useCase.saveTrackingFormatBatch(p.schoolId, dto),
    };
  }

  private async assertCanReadCourse(
    p: ActiveTenantContext,
    courseAssignmentId: bigint,
  ): Promise<void> {
    const canSupervise = await this.rbacPermissions.hasPermission(
      p.schoolId,
      p.userId,
      p.activeRole,
      RBAC_PERMISSIONS.PORTAL_TEACHER_SUPERVISE_READ,
    );
    if (canSupervise) {
      return;
    }
    await this.assertOwnsCourse(p, courseAssignmentId);
  }

  private async assertCanWriteCourse(
    p: ActiveTenantContext,
    courseAssignmentId: bigint,
  ): Promise<void> {
    const canOverride = await this.rbacPermissions.hasPermission(
      p.schoolId,
      p.userId,
      p.activeRole,
      RBAC_PERMISSIONS.ACADEMIC_GRADES_RECTOR_OVERRIDE,
    );
    if (canOverride) {
      return;
    }
    await this.assertOwnsCourse(p, courseAssignmentId);
  }

  private async assertOwnsCourse(
    p: ActiveTenantContext,
    courseAssignmentId: bigint,
  ): Promise<void> {
    const owns = await this.db.withTenantTransaction(
      p.schoolId,
      async (client) => {
        const res = await client.query<{ ok: number }>(
          `SELECT 1 AS ok
             FROM course_assignments ca
             INNER JOIN teacher_profiles tp
               ON tp.school_id = ca.school_id AND tp.id = ca.teacher_profile_id
            WHERE ca.school_id = $1
              AND ca.id = $2
              AND tp.user_id = $3
            LIMIT 1`,
          [String(p.schoolId), String(courseAssignmentId), String(p.userId)],
        );
        return (res.rowCount ?? 0) > 0;
      },
    );
    if (!owns) {
      throw new TenantAccessDeniedException(
        'Solo el docente titular de esta asignatura puede acceder o modificar esta planilla.',
      );
    }
  }

  private parseYear(raw: string | undefined, fallback: number): number {
    return raw && /^\d{4}$/.test(raw) ? Number(raw) : fallback;
  }
}
