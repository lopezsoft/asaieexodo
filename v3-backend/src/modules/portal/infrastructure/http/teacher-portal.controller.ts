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
import {
  CurrentUser,
  Roles,
} from '../../../../shared/infrastructure/http/decorators/security.decorators';
import { PositiveBigIntPipe } from '../../../../shared/infrastructure/http/pipes/positive-bigint.pipe';
import { CommunityRole } from '../../../iam/domain/enums/community-role.enum';
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

const TEACHER_PORTAL_ROLES = [
  CommunityRole.SUPER_ADMIN,
  CommunityRole.SCHOOL_ADMIN,
  CommunityRole.RECTOR,
  CommunityRole.COORDINATOR,
  CommunityRole.SECRETARY,
  CommunityRole.TEACHER,
] as const;

@ApiTags('Teacher Portal (Gradebook, Achievements, Observer M5, Lesson Plans & LMS)')
@ApiBearerAuth('jwt-auth')
@Controller('teacher')
export class TeacherPortalController {
  constructor(private readonly portalUseCase: ManagePortalUseCase) {}

  @Get('courses')
  @Roles(...TEACHER_PORTAL_ROLES)
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
  @Roles(...TEACHER_PORTAL_ROLES)
  async getGradebook(
    @CurrentUser() p: ActiveTenantContext,
    @Param('courseAssignmentId', PositiveBigIntPipe) courseAssignmentId: bigint,
    @Query('academicYear') academicYear?: string,
    @Query('periodNumber') periodNumber?: string,
  ) {
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
  @Roles(...TEACHER_PORTAL_ROLES)
  async saveGradebook(
    @CurrentUser() p: ActiveTenantContext,
    @Param('courseAssignmentId', PositiveBigIntPipe) courseAssignmentId: bigint,
    @Body() dto: SaveGradebookBatchDto,
  ) {
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
  @Roles(...TEACHER_PORTAL_ROLES)
  async listPreReports(
    @CurrentUser() p: ActiveTenantContext,
    @Param('courseAssignmentId', PositiveBigIntPipe) courseAssignmentId: bigint,
    @Query('academicYear') academicYear?: string,
    @Query('periodNumber') periodNumber?: string,
  ) {
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
  @Roles(...TEACHER_PORTAL_ROLES)
  @HttpCode(HttpStatus.OK)
  async upsertPreReport(
    @CurrentUser() p: ActiveTenantContext,
    @Param('courseAssignmentId', PositiveBigIntPipe) courseAssignmentId: bigint,
    @Body() dto: UpsertPreReportDto,
  ) {
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
  @Roles(...TEACHER_PORTAL_ROLES)
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
  @Roles(...TEACHER_PORTAL_ROLES)
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
  @Roles(...TEACHER_PORTAL_ROLES)
  async deleteAchievement(
    @CurrentUser() p: ActiveTenantContext,
    @Param('id', PositiveBigIntPipe) id: bigint,
  ) {
    await this.portalUseCase.deleteAchievement(p.schoolId, id);
    return { success: true, data: { deleted: true, id: Number(id) } };
  }

  @Post('achievements/import')
  @Roles(...TEACHER_PORTAL_ROLES)
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
  @Roles(...TEACHER_PORTAL_ROLES)
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
  @Roles(...TEACHER_PORTAL_ROLES)
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
  @Roles(...TEACHER_PORTAL_ROLES)
  async deleteAbsence(
    @CurrentUser() p: ActiveTenantContext,
    @Param('absenceId', PositiveBigIntPipe) absenceId: bigint,
  ) {
    await this.portalUseCase.deleteAbsence(p.schoolId, absenceId);
    return { success: true, data: { deleted: true, id: Number(absenceId) } };
  }

  // Observador del Estudiante (incluye Modelo 5 de asaie-teachers)
  @Get('observer/:enrollmentId')
  @Roles(...TEACHER_PORTAL_ROLES)
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
  @Roles(...TEACHER_PORTAL_ROLES)
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
  @Roles(...TEACHER_PORTAL_ROLES)
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
  @Roles(...TEACHER_PORTAL_ROLES)
  async deleteAnnotation(
    @CurrentUser() p: ActiveTenantContext,
    @Param('annotationId', PositiveBigIntPipe) annotationId: bigint,
  ) {
    await this.portalUseCase.deleteObserverAnnotation(p.schoolId, annotationId);
    return { success: true, data: { deleted: true, id: Number(annotationId) } };
  }

  // Planes de clase y parcelador
  @Get('lesson-plans')
  @Roles(...TEACHER_PORTAL_ROLES)
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
  @Roles(...TEACHER_PORTAL_ROLES)
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
  @Roles(...TEACHER_PORTAL_ROLES)
  async deleteLessonPlan(
    @CurrentUser() p: ActiveTenantContext,
    @Param('planId', PositiveBigIntPipe) planId: bigint,
  ) {
    await this.portalUseCase.deleteLessonPlan(p.schoolId, planId);
    return { success: true, data: { deleted: true, id: Number(planId) } };
  }

  @Post('lesson-plans/:planId/units')
  @Roles(...TEACHER_PORTAL_ROLES)
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
  @Roles(...TEACHER_PORTAL_ROLES)
  async deleteLessonPlanUnit(
    @CurrentUser() p: ActiveTenantContext,
    @Param('unitId', PositiveBigIntPipe) unitId: bigint,
  ) {
    await this.portalUseCase.deleteLessonPlanUnit(p.schoolId, unitId);
    return { success: true, data: { deleted: true, id: Number(unitId) } };
  }

  // Aula Virtual: Actividades, Evaluaciones en Línea y Clases en Vivo
  @Get('activities')
  @Roles(...TEACHER_PORTAL_ROLES)
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
  @Roles(...TEACHER_PORTAL_ROLES)
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
  @Roles(...TEACHER_PORTAL_ROLES)
  async deleteActivity(
    @CurrentUser() p: ActiveTenantContext,
    @Param('activityId', PositiveBigIntPipe) activityId: bigint,
  ) {
    await this.portalUseCase.deleteVirtualActivity(p.schoolId, activityId);
    return { success: true, data: { deleted: true, id: Number(activityId) } };
  }

  @Get('activities/:activityId/submissions')
  @Roles(...TEACHER_PORTAL_ROLES)
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
  @Roles(...TEACHER_PORTAL_ROLES)
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
  @Roles(...TEACHER_PORTAL_ROLES)
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
  @Roles(...TEACHER_PORTAL_ROLES)
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
  @Roles(...TEACHER_PORTAL_ROLES)
  async deleteEvaluation(
    @CurrentUser() p: ActiveTenantContext,
    @Param('evaluationId', PositiveBigIntPipe) evaluationId: bigint,
  ) {
    await this.portalUseCase.deleteOnlineEvaluation(p.schoolId, evaluationId);
    return { success: true, data: { deleted: true, id: Number(evaluationId) } };
  }

  @Post('evaluations/:evaluationId/questions')
  @Roles(...TEACHER_PORTAL_ROLES)
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
  @Roles(...TEACHER_PORTAL_ROLES)
  async deleteQuestion(
    @CurrentUser() p: ActiveTenantContext,
    @Param('questionId', PositiveBigIntPipe) questionId: bigint,
  ) {
    await this.portalUseCase.deleteEvaluationQuestion(p.schoolId, questionId);
    return { success: true, data: { deleted: true, id: Number(questionId) } };
  }

  @Get('evaluations/:evaluationId/attempts')
  @Roles(...TEACHER_PORTAL_ROLES)
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
  @Roles(...TEACHER_PORTAL_ROLES)
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
  @Roles(...TEACHER_PORTAL_ROLES)
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
  @Roles(...TEACHER_PORTAL_ROLES)
  async deleteLiveClass(
    @CurrentUser() p: ActiveTenantContext,
    @Param('liveClassId', PositiveBigIntPipe) liveClassId: bigint,
  ) {
    await this.portalUseCase.deleteLiveClass(p.schoolId, liveClassId);
    return { success: true, data: { deleted: true, id: Number(liveClassId) } };
  }

  private parseYear(raw: string | undefined, fallback: number): number {
    return raw && /^\d{4}$/.test(raw) ? Number(raw) : fallback;
  }
}
