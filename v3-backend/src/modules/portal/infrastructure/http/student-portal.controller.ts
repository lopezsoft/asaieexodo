import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ActiveTenantContext } from '../../../../shared/application/context/tenant-context.service';
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
import { ManagePortalUseCase } from '../../application/use-cases/manage-portal.use-case';
import {
  SubmitStudentActivityDto,
  SubmitStudentEvaluationDto,
} from './dto/portal.dto';

@ApiTags(
  'Student & Family Portal (Grades, Reports, Activities, Online Exams & Live Classes)',
)
@ApiBearerAuth('jwt-auth')
@Controller('student')
export class StudentPortalController {
  constructor(private readonly portalUseCase: ManagePortalUseCase) {}

  @Get('overview')
  @RequireModule(RBAC_MODULES.ACADEMIC_GRADES)
  @RequireAnyPermission(
    RBAC_PERMISSIONS.PORTAL_STUDENT_OWN,
    RBAC_PERMISSIONS.PORTAL_TEACHER_SUPERVISE_READ,
  )
  async getOverview(
    @CurrentUser() p: ActiveTenantContext,
    @Query('academicYear') academicYear?: string,
  ) {
    return {
      success: true,
      data: await this.portalUseCase.getStudentOverview(
        p.schoolId,
        p.userId,
        this.parseYear(academicYear, p.academicYear),
      ),
    };
  }

  @Get('grades')
  @RequireModule(RBAC_MODULES.ACADEMIC_GRADES)
  @RequireAnyPermission(
    RBAC_PERMISSIONS.PORTAL_STUDENT_OWN,
    RBAC_PERMISSIONS.PORTAL_TEACHER_SUPERVISE_READ,
  )
  async getGrades(
    @CurrentUser() p: ActiveTenantContext,
    @Query('academicYear') academicYear?: string,
    @Query('periodNumber') periodNumber?: string,
  ) {
    return {
      success: true,
      data: await this.portalUseCase.getStudentGrades(
        p.schoolId,
        p.userId,
        this.parseYear(academicYear, p.academicYear),
        periodNumber && /^\d+$/.test(periodNumber)
          ? Number(periodNumber)
          : undefined,
      ),
    };
  }

  @Get('activities')
  @RequireModule(RBAC_MODULES.VIRTUAL_CLASSROOM)
  @RequireAnyPermission(
    RBAC_PERMISSIONS.PORTAL_STUDENT_OWN,
    RBAC_PERMISSIONS.PORTAL_TEACHER_SUPERVISE_READ,
  )
  async listActivities(
    @CurrentUser() p: ActiveTenantContext,
    @Query('academicYear') academicYear?: string,
  ) {
    return {
      success: true,
      data: await this.portalUseCase.listStudentActivities(
        p.schoolId,
        p.userId,
        this.parseYear(academicYear, p.academicYear),
      ),
    };
  }

  @Post('activities/:activityId/submit')
  @RequireModule(RBAC_MODULES.VIRTUAL_CLASSROOM)
  @RequirePermissions(RBAC_PERMISSIONS.PORTAL_STUDENT_OWN)
  @HttpCode(HttpStatus.OK)
  async submitActivity(
    @CurrentUser() p: ActiveTenantContext,
    @Param('activityId', PositiveBigIntPipe) activityId: bigint,
    @Body() dto: SubmitStudentActivityDto,
    @Query('academicYear') academicYear?: string,
  ) {
    return {
      success: true,
      data: await this.portalUseCase.submitStudentActivity(
        p.schoolId,
        p.userId,
        this.parseYear(academicYear, p.academicYear),
        activityId,
        dto,
      ),
    };
  }

  @Get('evaluations')
  @RequireModule(RBAC_MODULES.VIRTUAL_CLASSROOM)
  @RequireAnyPermission(
    RBAC_PERMISSIONS.PORTAL_STUDENT_OWN,
    RBAC_PERMISSIONS.PORTAL_TEACHER_SUPERVISE_READ,
  )
  async listEvaluations(
    @CurrentUser() p: ActiveTenantContext,
    @Query('academicYear') academicYear?: string,
  ) {
    return {
      success: true,
      data: await this.portalUseCase.listStudentEvaluations(
        p.schoolId,
        p.userId,
        this.parseYear(academicYear, p.academicYear),
      ),
    };
  }

  @Post('evaluations/:evaluationId/submit')
  @RequireModule(RBAC_MODULES.VIRTUAL_CLASSROOM)
  @RequirePermissions(RBAC_PERMISSIONS.PORTAL_STUDENT_OWN)
  @HttpCode(HttpStatus.OK)
  async submitEvaluation(
    @CurrentUser() p: ActiveTenantContext,
    @Param('evaluationId', PositiveBigIntPipe) evaluationId: bigint,
    @Body() dto: SubmitStudentEvaluationDto,
    @Query('academicYear') academicYear?: string,
  ) {
    return {
      success: true,
      data: await this.portalUseCase.submitStudentEvaluation(
        p.schoolId,
        p.userId,
        this.parseYear(academicYear, p.academicYear),
        evaluationId,
        dto,
      ),
    };
  }

  @Get('live-classes')
  @RequireModule(RBAC_MODULES.VIRTUAL_CLASSROOM)
  @RequireAnyPermission(
    RBAC_PERMISSIONS.PORTAL_STUDENT_OWN,
    RBAC_PERMISSIONS.PORTAL_TEACHER_SUPERVISE_READ,
  )
  async listLiveClasses(
    @CurrentUser() p: ActiveTenantContext,
    @Query('academicYear') academicYear?: string,
  ) {
    return {
      success: true,
      data: await this.portalUseCase.listStudentLiveClasses(
        p.schoolId,
        p.userId,
        this.parseYear(academicYear, p.academicYear),
      ),
    };
  }

  @Post('live-classes/:liveClassId/join')
  @RequireModule(RBAC_MODULES.VIRTUAL_CLASSROOM)
  @RequireAnyPermission(
    RBAC_PERMISSIONS.PORTAL_STUDENT_OWN,
    RBAC_PERMISSIONS.PORTAL_TEACHER_SUPERVISE_READ,
  )
  @HttpCode(HttpStatus.OK)
  async joinLiveClass(
    @CurrentUser() p: ActiveTenantContext,
    @Param('liveClassId', PositiveBigIntPipe) liveClassId: bigint,
    @Query('academicYear') academicYear?: string,
  ) {
    return {
      success: true,
      data: await this.portalUseCase.joinStudentLiveClass(
        p.schoolId,
        p.userId,
        this.parseYear(academicYear, p.academicYear),
        liveClassId,
      ),
    };
  }

  private parseYear(raw: string | undefined, fallback: number): number {
    return raw && /^\d{4}$/.test(raw) ? Number(raw) : fallback;
  }
}
