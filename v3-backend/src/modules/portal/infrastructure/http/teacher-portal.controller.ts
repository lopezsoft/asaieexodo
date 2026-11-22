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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
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
import { ManagePortalUseCase } from '../../application/use-cases/manage-portal.use-case';
import {
  AddEvaluationQuestionDto,
  AddLessonPlanUnitDto,
  AddObserverAnnotationDto,
  CreateLessonPlanDto,
  CreateLiveClassDto,
  CreateOnlineEvaluationDto,
  CreateVirtualActivityDto,
  GradeActivitySubmissionDto,
  ImportAchievementsDto,
  RecordStudentAbsenceDto,
  SaveAchievementStandardDto,
  SaveGradebookBatchDto,
  UpsertPreReportDto,
  UpsertStudentObserverDto,
} from './dto/portal.dto';

@ApiTags(
  'Teacher Portal (Gradebook, Achievements, Observer M5, Lesson Plans & LMS)',
)
@ApiBearerAuth('jwt-auth')
@Controller('teacher')
export class TeacherPortalController {
  constructor(
    private readonly portalUseCase: ManagePortalUseCase,
    private readonly rbacPermissions: RbacPermissionsService,
    private readonly db: PostgresRlsService,
  ) {}

  @Get('courses')
  @RequireModule(RBAC_MODULES.ACADEMIC_GRADES)
  @RequireAnyPermission(
    RBAC_PERMISSIONS.PORTAL_TEACHER_OWN,
    RBAC_PERMISSIONS.PORTAL_TEACHER_SUPERVISE_READ,
  )
  async listCourses(
    @CurrentUser() p: ActiveTenantContext,
    @Query('academicYear') academicYear?: string,
  ) {
    return {
      success: true,
      data: await this.portalUseCase.listTeacherCourses(
        p.schoolId,
        p.userId,
        p.activeRole,
        this.parseYear(academicYear, p.academicYear),
      ),
    };
  }

  @Get('courses/:courseAssignmentId/gradebook')
  @RequireModule(RBAC_MODULES.ACADEMIC_GRADES)
  @RequireAnyPermission(
    RBAC_PERMISSIONS.PORTAL_TEACHER_OWN,
    RBAC_PERMISSIONS.PORTAL_TEACHER_SUPERVISE_READ,
  )
  async getGradebook(
    @CurrentUser() p: ActiveTenantContext,
    @Param('courseAssignmentId', PositiveBigIntPipe) courseAssignmentId: bigint,
    @Query('academicYear') academicYear?: string,
    @Query('periodNumber') periodNumber?: string,
  ) {
    await this.assertCanReadCourse(p, courseAssignmentId);
    return {
      success: true,
      data: await this.portalUseCase.getCourseGradebook(
        p.schoolId,
        courseAssignmentId,
        this.parseYear(academicYear, p.academicYear),
        periodNumber && /^\d+$/.test(periodNumber) ? Number(periodNumber) : 1,
      ),
    };
  }

  @Put('courses/:courseAssignmentId/gradebook')
  @RequireModule(RBAC_MODULES.ACADEMIC_GRADES)
  @RequireAnyPermission(
    RBAC_PERMISSIONS.PORTAL_TEACHER_OWN,
    RBAC_PERMISSIONS.ACADEMIC_GRADES_RECTOR_OVERRIDE,
  )
  async saveGradebook(
    @CurrentUser() p: ActiveTenantContext,
    @Param('courseAssignmentId', PositiveBigIntPipe) courseAssignmentId: bigint,
    @Body() dto: SaveGradebookBatchDto,
  ) {
    await this.assertCanWriteCourseGrades(p, courseAssignmentId);
    return {
      success: true,
      data: await this.portalUseCase.saveGradebookBatch(
        p.schoolId,
        p.userId,
        courseAssignmentId,
        dto,
      ),
    };
  }

  @Get('courses/:courseAssignmentId/pre-reports')
  @RequireModule(RBAC_MODULES.ACADEMIC_GRADES)
  @RequireAnyPermission(
    RBAC_PERMISSIONS.PORTAL_TEACHER_OWN,
    RBAC_PERMISSIONS.PORTAL_TEACHER_SUPERVISE_READ,
  )
  async listPreReports(
    @CurrentUser() p: ActiveTenantContext,
    @Param('courseAssignmentId', PositiveBigIntPipe) courseAssignmentId: bigint,
    @Query('academicYear') academicYear?: string,
    @Query('periodNumber') periodNumber?: string,
  ) {
    await this.assertCanReadCourse(p, courseAssignmentId);
    return {
      success: true,
      data: await this.portalUseCase.listPreReports(
        p.schoolId,
        courseAssignmentId,
        this.parseYear(academicYear, p.academicYear),
        periodNumber && /^\d+$/.test(periodNumber) ? Number(periodNumber) : 1,
      ),
    };
  }

  @Post('courses/:courseAssignmentId/pre-reports')
  @RequireModule(RBAC_MODULES.ACADEMIC_GRADES)
  @RequireAnyPermission(
    RBAC_PERMISSIONS.PORTAL_TEACHER_OWN,
    RBAC_PERMISSIONS.ACADEMIC_GRADES_RECTOR_OVERRIDE,
  )
  @HttpCode(HttpStatus.OK)
  async upsertPreReport(
    @CurrentUser() p: ActiveTenantContext,
    @Param('courseAssignmentId', PositiveBigIntPipe) courseAssignmentId: bigint,
    @Body() dto: UpsertPreReportDto,
  ) {
    await this.assertCanWriteCourseGrades(p, courseAssignmentId);
    return {
      success: true,
      data: await this.portalUseCase.upsertPreReport(
        p.schoolId,
        courseAssignmentId,
        dto,
      ),
    };
  }

  // Logros e indicadores
  @Get('achievements')
  @RequireModule(RBAC_MODULES.ACADEMIC_GRADES)
  @RequireAnyPermission(
    RBAC_PERMISSIONS.PORTAL_TEACHER_OWN,
    RBAC_PERMISSIONS.PORTAL_TEACHER_SUPERVISE_READ,
  )
  async listAchievements(
    @CurrentUser() p: ActiveTenantContext,
    @Query('academicYear') academicYear?: string,
    @Query('gradeId') gradeId?: string,
    @Query('subjectId') subjectId?: string,
    @Query('periodNumber') periodNumber?: string,
  ) {
    return {
      success: true,
      data: await this.portalUseCase.listAchievements(p.schoolId, {
        academicYear: this.parseYear(academicYear, p.academicYear),
        gradeId: gradeId && /^\d+$/.test(gradeId) ? Number(gradeId) : undefined,
        subjectId:
          subjectId && /^\d+$/.test(subjectId) ? Number(subjectId) : undefined,
        periodNumber:
          periodNumber && /^\d+$/.test(periodNumber)
            ? Number(periodNumber)
            : undefined,
      }),
    };
  }

  @Post('achievements')
  @RequireModule(RBAC_MODULES.ACADEMIC_GRADES)
  @RequireAnyPermission(
    RBAC_PERMISSIONS.PORTAL_TEACHER_OWN,
    RBAC_PERMISSIONS.ACADEMIC_CURRICULUM_WRITE,
  )
  @HttpCode(HttpStatus.CREATED)
  async saveAchievement(
    @CurrentUser() p: ActiveTenantContext,
    @Body() dto: SaveAchievementStandardDto,
  ) {
    return {
      success: true,
      data: await this.portalUseCase.saveAchievement(p.schoolId, dto),
    };
  }

  @Delete('achievements/:id')
  @RequireModule(RBAC_MODULES.ACADEMIC_GRADES)
  @RequireAnyPermission(
    RBAC_PERMISSIONS.PORTAL_TEACHER_OWN,
    RBAC_PERMISSIONS.ACADEMIC_CURRICULUM_WRITE,
  )
  async deleteAchievement(
    @CurrentUser() p: ActiveTenantContext,
    @Param('id', PositiveBigIntPipe) id: bigint,
  ) {
    await this.portalUseCase.deleteAchievement(p.schoolId, id);
    return { success: true, data: { deleted: true, id: Number(id) } };
  }

  @Post('achievements/import')
  @RequireModule(RBAC_MODULES.ACADEMIC_GRADES)
  @RequireAnyPermission(
    RBAC_PERMISSIONS.PORTAL_TEACHER_OWN,
    RBAC_PERMISSIONS.ACADEMIC_CURRICULUM_WRITE,
  )
  @HttpCode(HttpStatus.OK)
  async importAchievements(
    @CurrentUser() p: ActiveTenantContext,
    @Body() dto: ImportAchievementsDto,
  ) {
    return {
      success: true,
      data: await this.portalUseCase.importAchievements(p.schoolId, dto),
    };
  }

  // Inasistencias
  @Get('absences')
  @RequireModule(RBAC_MODULES.ACADEMIC_GRADES)
  @RequireAnyPermission(
    RBAC_PERMISSIONS.PORTAL_TEACHER_OWN,
    RBAC_PERMISSIONS.PORTAL_TEACHER_SUPERVISE_READ,
  )
  async listAbsences(
    @CurrentUser() p: ActiveTenantContext,
    @Query('courseAssignmentId') courseAssignmentId: string,
    @Query('periodNumber') periodNumber?: string,
  ) {
    const cid = /^\d+$/.test(courseAssignmentId ?? '')
      ? BigInt(courseAssignmentId)
      : 0n;
    return {
      success: true,
      data: await this.portalUseCase.listAbsences(
        p.schoolId,
        cid,
        periodNumber && /^\d+$/.test(periodNumber) ? Number(periodNumber) : 1,
      ),
    };
  }

  @Post('absences')
  @RequireModule(RBAC_MODULES.ACADEMIC_GRADES)
  @RequireAnyPermission(
    RBAC_PERMISSIONS.PORTAL_TEACHER_OWN,
    RBAC_PERMISSIONS.ACADEMIC_GRADES_RECTOR_OVERRIDE,
  )
  @HttpCode(HttpStatus.CREATED)
  async recordAbsence(
    @CurrentUser() p: ActiveTenantContext,
    @Body() dto: RecordStudentAbsenceDto,
  ) {
    return {
      success: true,
      data: await this.portalUseCase.recordAbsence(p.schoolId, dto),
    };
  }

  @Delete('absences/:absenceId')
  @RequireModule(RBAC_MODULES.ACADEMIC_GRADES)
  @RequireAnyPermission(
    RBAC_PERMISSIONS.PORTAL_TEACHER_OWN,
    RBAC_PERMISSIONS.ACADEMIC_GRADES_RECTOR_OVERRIDE,
  )
  async deleteAbsence(
    @CurrentUser() p: ActiveTenantContext,
    @Param('absenceId', PositiveBigIntPipe) absenceId: bigint,
  ) {
    await this.portalUseCase.deleteAbsence(p.schoolId, absenceId);
    return { success: true, data: { deleted: true, id: Number(absenceId) } };
  }

  // Observador del Estudiante (incluye Modelo 5 de asaie-teachers)
  @Get('observer/:enrollmentId')
  @RequireModule(RBAC_MODULES.STUDENT_OBSERVER)
  @RequireAnyPermission(
    RBAC_PERMISSIONS.PORTAL_TEACHER_OWN,
    RBAC_PERMISSIONS.PORTAL_TEACHER_SUPERVISE_READ,
    RBAC_PERMISSIONS.PORTAL_TEACHER_OBSERVER_WRITE,
  )
  async getObserver(
    @CurrentUser() p: ActiveTenantContext,
    @Param('enrollmentId', PositiveBigIntPipe) enrollmentId: bigint,
    @Query('academicYear') academicYear?: string,
  ) {
    return {
      success: true,
      data: await this.portalUseCase.getStudentObserver(
        p.schoolId,
        enrollmentId,
        this.parseYear(academicYear, p.academicYear),
      ),
    };
  }

  @Post('observer')
  @RequireModule(RBAC_MODULES.STUDENT_OBSERVER)
  @RequireAnyPermission(
    RBAC_PERMISSIONS.PORTAL_TEACHER_OWN,
    RBAC_PERMISSIONS.PORTAL_TEACHER_OBSERVER_WRITE,
  )
  @HttpCode(HttpStatus.OK)
  async upsertObserver(
    @CurrentUser() p: ActiveTenantContext,
    @Body() dto: UpsertStudentObserverDto,
  ) {
    return {
      success: true,
      data: await this.portalUseCase.upsertStudentObserver(p.schoolId, dto),
    };
  }

  @Post('observer/:observerId/annotations')
  @RequireModule(RBAC_MODULES.STUDENT_OBSERVER)
  @RequireAnyPermission(
    RBAC_PERMISSIONS.PORTAL_TEACHER_OWN,
    RBAC_PERMISSIONS.PORTAL_TEACHER_OBSERVER_WRITE,
  )
  @HttpCode(HttpStatus.CREATED)
  async addAnnotation(
    @CurrentUser() p: ActiveTenantContext,
    @Param('observerId', PositiveBigIntPipe) observerId: bigint,
    @Body() dto: AddObserverAnnotationDto,
  ) {
    return {
      success: true,
      data: await this.portalUseCase.addObserverAnnotation(
        p.schoolId,
        observerId,
        p.userId,
        dto,
      ),
    };
  }

  @Delete('observer/annotations/:annotationId')
  @RequireModule(RBAC_MODULES.STUDENT_OBSERVER)
  @RequireAnyPermission(
    RBAC_PERMISSIONS.PORTAL_TEACHER_OWN,
    RBAC_PERMISSIONS.PORTAL_TEACHER_OBSERVER_WRITE,
  )
  async deleteAnnotation(
    @CurrentUser() p: ActiveTenantContext,
    @Param('annotationId', PositiveBigIntPipe) annotationId: bigint,
  ) {
    await this.portalUseCase.deleteObserverAnnotation(p.schoolId, annotationId);
    return { success: true, data: { deleted: true, id: Number(annotationId) } };
  }

  // Planes de clase y parcelador
  @Get('lesson-plans')
  @RequireModule(RBAC_MODULES.ACADEMIC_GRADES)
  @RequireAnyPermission(
    RBAC_PERMISSIONS.PORTAL_TEACHER_OWN,
    RBAC_PERMISSIONS.PORTAL_TEACHER_SUPERVISE_READ,
  )
  async listLessonPlans(
    @CurrentUser() p: ActiveTenantContext,
    @Query('academicYear') academicYear?: string,
    @Query('courseAssignmentId') courseAssignmentId?: string,
  ) {
    return {
      success: true,
      data: await this.portalUseCase.listLessonPlans(
        p.schoolId,
        this.parseYear(academicYear, p.academicYear),
        courseAssignmentId && /^\d+$/.test(courseAssignmentId)
          ? Number(courseAssignmentId)
          : undefined,
      ),
    };
  }

  @Post('lesson-plans')
  @RequireModule(RBAC_MODULES.ACADEMIC_GRADES)
  @RequirePermissions(RBAC_PERMISSIONS.PORTAL_TEACHER_OWN)
  @HttpCode(HttpStatus.CREATED)
  async createLessonPlan(
    @CurrentUser() p: ActiveTenantContext,
    @Body() dto: CreateLessonPlanDto,
  ) {
    return {
      success: true,
      data: await this.portalUseCase.createLessonPlan(p.schoolId, dto),
    };
  }

  @Delete('lesson-plans/:planId')
  @RequireModule(RBAC_MODULES.ACADEMIC_GRADES)
  @RequirePermissions(RBAC_PERMISSIONS.PORTAL_TEACHER_OWN)
  async deleteLessonPlan(
    @CurrentUser() p: ActiveTenantContext,
    @Param('planId', PositiveBigIntPipe) planId: bigint,
  ) {
    await this.portalUseCase.deleteLessonPlan(p.schoolId, planId);
    return { success: true, data: { deleted: true, id: Number(planId) } };
  }

  @Post('lesson-plans/:planId/units')
  @RequireModule(RBAC_MODULES.ACADEMIC_GRADES)
  @RequirePermissions(RBAC_PERMISSIONS.PORTAL_TEACHER_OWN)
  @HttpCode(HttpStatus.CREATED)
  async addLessonPlanUnit(
    @CurrentUser() p: ActiveTenantContext,
    @Param('planId', PositiveBigIntPipe) planId: bigint,
    @Body() dto: AddLessonPlanUnitDto,
  ) {
    return {
      success: true,
      data: await this.portalUseCase.addLessonPlanUnit(p.schoolId, planId, dto),
    };
  }

  @Delete('lesson-plans/units/:unitId')
  @RequireModule(RBAC_MODULES.ACADEMIC_GRADES)
  @RequirePermissions(RBAC_PERMISSIONS.PORTAL_TEACHER_OWN)
  async deleteLessonPlanUnit(
    @CurrentUser() p: ActiveTenantContext,
    @Param('unitId', PositiveBigIntPipe) unitId: bigint,
  ) {
    await this.portalUseCase.deleteLessonPlanUnit(p.schoolId, unitId);
    return { success: true, data: { deleted: true, id: Number(unitId) } };
  }

  // Aula Virtual: Actividades, Evaluaciones en Línea y Clases en Vivo
  @Get('activities')
  @RequireModule(RBAC_MODULES.VIRTUAL_CLASSROOM)
  @RequireAnyPermission(
    RBAC_PERMISSIONS.PORTAL_TEACHER_OWN,
    RBAC_PERMISSIONS.PORTAL_TEACHER_SUPERVISE_READ,
  )
  async listActivities(
    @CurrentUser() p: ActiveTenantContext,
    @Query('courseAssignmentId') courseAssignmentId?: string,
  ) {
    return {
      success: true,
      data: await this.portalUseCase.listTeacherActivities(
        p.schoolId,
        courseAssignmentId && /^\d+$/.test(courseAssignmentId)
          ? Number(courseAssignmentId)
          : undefined,
      ),
    };
  }

  @Post('activities')
  @RequireModule(RBAC_MODULES.VIRTUAL_CLASSROOM)
  @RequirePermissions(RBAC_PERMISSIONS.PORTAL_TEACHER_OWN)
  @HttpCode(HttpStatus.CREATED)
  async createActivity(
    @CurrentUser() p: ActiveTenantContext,
    @Body() dto: CreateVirtualActivityDto,
  ) {
    return {
      success: true,
      data: await this.portalUseCase.createVirtualActivity(p.schoolId, dto),
    };
  }

  @Delete('activities/:activityId')
  @RequireModule(RBAC_MODULES.VIRTUAL_CLASSROOM)
  @RequirePermissions(RBAC_PERMISSIONS.PORTAL_TEACHER_OWN)
  async deleteActivity(
    @CurrentUser() p: ActiveTenantContext,
    @Param('activityId', PositiveBigIntPipe) activityId: bigint,
  ) {
    await this.portalUseCase.deleteVirtualActivity(p.schoolId, activityId);
    return { success: true, data: { deleted: true, id: Number(activityId) } };
  }

  @Get('activities/:activityId/submissions')
  @RequireModule(RBAC_MODULES.VIRTUAL_CLASSROOM)
  @RequireAnyPermission(
    RBAC_PERMISSIONS.PORTAL_TEACHER_OWN,
    RBAC_PERMISSIONS.PORTAL_TEACHER_SUPERVISE_READ,
  )
  async listSubmissions(
    @CurrentUser() p: ActiveTenantContext,
    @Param('activityId', PositiveBigIntPipe) activityId: bigint,
  ) {
    return {
      success: true,
      data: await this.portalUseCase.listActivitySubmissions(
        p.schoolId,
        activityId,
      ),
    };
  }

  @Patch('activities/submissions/:submissionId')
  @RequireModule(RBAC_MODULES.VIRTUAL_CLASSROOM)
  @RequirePermissions(RBAC_PERMISSIONS.PORTAL_TEACHER_OWN)
  async gradeSubmission(
    @CurrentUser() p: ActiveTenantContext,
    @Param('submissionId', PositiveBigIntPipe) submissionId: bigint,
    @Body() dto: GradeActivitySubmissionDto,
  ) {
    return {
      success: true,
      data: await this.portalUseCase.gradeActivitySubmission(
        p.schoolId,
        submissionId,
        dto,
      ),
    };
  }

  @Get('evaluations')
  @RequireModule(RBAC_MODULES.VIRTUAL_CLASSROOM)
  @RequireAnyPermission(
    RBAC_PERMISSIONS.PORTAL_TEACHER_OWN,
    RBAC_PERMISSIONS.PORTAL_TEACHER_SUPERVISE_READ,
  )
  async listEvaluations(
    @CurrentUser() p: ActiveTenantContext,
    @Query('courseAssignmentId') courseAssignmentId?: string,
  ) {
    return {
      success: true,
      data: await this.portalUseCase.listTeacherEvaluations(
        p.schoolId,
        courseAssignmentId && /^\d+$/.test(courseAssignmentId)
          ? Number(courseAssignmentId)
          : undefined,
      ),
    };
  }

  @Post('evaluations')
  @RequireModule(RBAC_MODULES.VIRTUAL_CLASSROOM)
  @RequirePermissions(RBAC_PERMISSIONS.PORTAL_TEACHER_OWN)
  @HttpCode(HttpStatus.CREATED)
  async createEvaluation(
    @CurrentUser() p: ActiveTenantContext,
    @Body() dto: CreateOnlineEvaluationDto,
  ) {
    return {
      success: true,
      data: await this.portalUseCase.createOnlineEvaluation(p.schoolId, dto),
    };
  }

  @Delete('evaluations/:evaluationId')
  @RequireModule(RBAC_MODULES.VIRTUAL_CLASSROOM)
  @RequirePermissions(RBAC_PERMISSIONS.PORTAL_TEACHER_OWN)
  async deleteEvaluation(
    @CurrentUser() p: ActiveTenantContext,
    @Param('evaluationId', PositiveBigIntPipe) evaluationId: bigint,
  ) {
    await this.portalUseCase.deleteOnlineEvaluation(p.schoolId, evaluationId);
    return {
      success: true,
      data: { deleted: true, id: Number(evaluationId) },
    };
  }

  @Post('evaluations/:evaluationId/questions')
  @RequireModule(RBAC_MODULES.VIRTUAL_CLASSROOM)
  @RequirePermissions(RBAC_PERMISSIONS.PORTAL_TEACHER_OWN)
  @HttpCode(HttpStatus.CREATED)
  async addQuestion(
    @CurrentUser() p: ActiveTenantContext,
    @Param('evaluationId', PositiveBigIntPipe) evaluationId: bigint,
    @Body() dto: AddEvaluationQuestionDto,
  ) {
    return {
      success: true,
      data: await this.portalUseCase.addEvaluationQuestion(
        p.schoolId,
        evaluationId,
        dto,
      ),
    };
  }

  @Delete('evaluations/questions/:questionId')
  @RequireModule(RBAC_MODULES.VIRTUAL_CLASSROOM)
  @RequirePermissions(RBAC_PERMISSIONS.PORTAL_TEACHER_OWN)
  async deleteQuestion(
    @CurrentUser() p: ActiveTenantContext,
    @Param('questionId', PositiveBigIntPipe) questionId: bigint,
  ) {
    await this.portalUseCase.deleteEvaluationQuestion(p.schoolId, questionId);
    return { success: true, data: { deleted: true, id: Number(questionId) } };
  }

  @Get('evaluations/:evaluationId/attempts')
  @RequireModule(RBAC_MODULES.VIRTUAL_CLASSROOM)
  @RequireAnyPermission(
    RBAC_PERMISSIONS.PORTAL_TEACHER_OWN,
    RBAC_PERMISSIONS.PORTAL_TEACHER_SUPERVISE_READ,
  )
  async listAttempts(
    @CurrentUser() p: ActiveTenantContext,
    @Param('evaluationId', PositiveBigIntPipe) evaluationId: bigint,
  ) {
    return {
      success: true,
      data: await this.portalUseCase.listEvaluationAttempts(
        p.schoolId,
        evaluationId,
      ),
    };
  }

  @Get('live-classes')
  @RequireModule(RBAC_MODULES.VIRTUAL_CLASSROOM)
  @RequireAnyPermission(
    RBAC_PERMISSIONS.PORTAL_TEACHER_OWN,
    RBAC_PERMISSIONS.PORTAL_TEACHER_SUPERVISE_READ,
  )
  async listLiveClasses(
    @CurrentUser() p: ActiveTenantContext,
    @Query('courseAssignmentId') courseAssignmentId?: string,
  ) {
    return {
      success: true,
      data: await this.portalUseCase.listTeacherLiveClasses(
        p.schoolId,
        courseAssignmentId && /^\d+$/.test(courseAssignmentId)
          ? Number(courseAssignmentId)
          : undefined,
      ),
    };
  }

  @Post('live-classes')
  @RequireModule(RBAC_MODULES.VIRTUAL_CLASSROOM)
  @RequirePermissions(RBAC_PERMISSIONS.PORTAL_TEACHER_OWN)
  @HttpCode(HttpStatus.CREATED)
  async createLiveClass(
    @CurrentUser() p: ActiveTenantContext,
    @Body() dto: CreateLiveClassDto,
  ) {
    return {
      success: true,
      data: await this.portalUseCase.createLiveClass(p.schoolId, dto),
    };
  }

  @Delete('live-classes/:liveClassId')
  @RequireModule(RBAC_MODULES.VIRTUAL_CLASSROOM)
  @RequirePermissions(RBAC_PERMISSIONS.PORTAL_TEACHER_OWN)
  async deleteLiveClass(
    @CurrentUser() p: ActiveTenantContext,
    @Param('liveClassId', PositiveBigIntPipe) liveClassId: bigint,
  ) {
    await this.portalUseCase.deleteLiveClass(p.schoolId, liveClassId);
    return { success: true, data: { deleted: true, id: Number(liveClassId) } };
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

  private async assertCanWriteCourseGrades(
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
