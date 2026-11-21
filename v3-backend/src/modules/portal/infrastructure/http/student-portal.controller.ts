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
  Roles,
} from '../../../../shared/infrastructure/http/decorators/security.decorators';
import { PositiveBigIntPipe } from '../../../../shared/infrastructure/http/pipes/positive-bigint.pipe';
import { CommunityRole } from '../../../iam/domain/enums/community-role.enum';
import { ManagePortalUseCase } from '../../application/use-cases/manage-portal.use-case';
import {
  SubmitStudentActivityDto,
  SubmitStudentEvaluationDto,
} from './dto/portal.dto';

const STUDENT_PORTAL_ROLES = [
  CommunityRole.STUDENT,
  CommunityRole.FAMILY,
  CommunityRole.SUPER_ADMIN,
  CommunityRole.SCHOOL_ADMIN,
  CommunityRole.RECTOR,
  CommunityRole.COORDINATOR,
  CommunityRole.TEACHER,
] as const;

@ApiTags('Student & Family Portal (Grades, Reports, Activities, Online Exams & Live Classes)')
@ApiBearerAuth('jwt-auth')
@Controller('student')
export class StudentPortalController {
  constructor(private readonly portalUseCase: ManagePortalUseCase) {}

  @Get('overview')
  @Roles(...STUDENT_PORTAL_ROLES)
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
  @Roles(...STUDENT_PORTAL_ROLES)
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
  @Roles(...STUDENT_PORTAL_ROLES)
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
  @Roles(CommunityRole.STUDENT, CommunityRole.FAMILY)
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
  @Roles(...STUDENT_PORTAL_ROLES)
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
  @Roles(CommunityRole.STUDENT)
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
  @Roles(...STUDENT_PORTAL_ROLES)
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
  @Roles(...STUDENT_PORTAL_ROLES)
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
