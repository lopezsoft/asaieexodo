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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ActiveTenantContext } from '../../../../shared/application/context/tenant-context.service';
import {
  CurrentUser,
  Roles,
} from '../../../../shared/infrastructure/http/decorators/security.decorators';
import { PositiveBigIntPipe } from '../../../../shared/infrastructure/http/pipes/positive-bigint.pipe';
import { CommunityRole } from '../../../iam/domain/enums/community-role.enum';
import { ManageAcademicUseCase } from '../../application/use-cases/manage-academic.use-case';
import {
  AdminUpdateGradeScoreDto,
  HonorRollRequestDto,
  LinkStudentFamilyDto,
  MoveEnrollmentsDto,
  ReassignTeacherCoursesDto,
  RecordEnrollmentNoveltyDto,
  SaveAcademicAreaDto,
  SaveCourseAssignmentDto,
  SaveEnrollmentDto,
  SaveFamilyProfileDto,
  SavePeriodRecoveryDto,
  SaveStudentProfileDto,
  SaveSubjectDto,
  TransferStudentGradesDto,
  UppercaseAchievementsDto,
  UpsertStudyPlanDto,
} from './dto/academic.dto';

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
  CommunityRole.SECRETARY,
] as const;

const RECTOR_ROLES = [
  CommunityRole.SUPER_ADMIN,
  CommunityRole.SCHOOL_ADMIN,
  CommunityRole.RECTOR,
] as const;

@ApiTags('Academic Management, Curriculum, Enrollments & Grades Control')
@ApiBearerAuth('jwt-auth')
@Controller('academic')
export class AcademicController {
  constructor(private readonly academicUseCase: ManageAcademicUseCase) {}

  // Áreas y asignaturas
  @Get('areas')
  @Roles(...READ_ROLES)
  async listAreas(@CurrentUser() p: ActiveTenantContext) {
    return { success: true, data: await this.academicUseCase.listAreas(p.schoolId) };
  }

  @Post('areas')
  @Roles(...WRITE_ROLES)
  @HttpCode(HttpStatus.CREATED)
  async createArea(
    @CurrentUser() p: ActiveTenantContext,
    @Body() dto: SaveAcademicAreaDto,
  ) {
    return {
      success: true,
      data: await this.academicUseCase.saveArea(p.schoolId, dto),
    };
  }

  @Patch('areas/:areaId')
  @Roles(...WRITE_ROLES)
  async updateArea(
    @CurrentUser() p: ActiveTenantContext,
    @Param('areaId', PositiveBigIntPipe) areaId: bigint,
    @Body() dto: SaveAcademicAreaDto,
  ) {
    return {
      success: true,
      data: await this.academicUseCase.saveArea(p.schoolId, { ...dto, id: areaId }),
    };
  }

  @Delete('areas/:areaId')
  @Roles(...RECTOR_ROLES)
  async deleteArea(
    @CurrentUser() p: ActiveTenantContext,
    @Param('areaId', PositiveBigIntPipe) areaId: bigint,
  ) {
    await this.academicUseCase.deleteArea(p.schoolId, areaId);
    return { success: true, data: { deleted: true, id: Number(areaId) } };
  }

  @Get('subjects')
  @Roles(...READ_ROLES)
  async listSubjects(@CurrentUser() p: ActiveTenantContext) {
    return {
      success: true,
      data: await this.academicUseCase.listSubjects(p.schoolId),
    };
  }

  @Post('subjects')
  @Roles(...WRITE_ROLES)
  @HttpCode(HttpStatus.CREATED)
  async createSubject(
    @CurrentUser() p: ActiveTenantContext,
    @Body() dto: SaveSubjectDto,
  ) {
    return {
      success: true,
      data: await this.academicUseCase.saveSubject(p.schoolId, dto),
    };
  }

  @Patch('subjects/:subjectId')
  @Roles(...WRITE_ROLES)
  async updateSubject(
    @CurrentUser() p: ActiveTenantContext,
    @Param('subjectId', PositiveBigIntPipe) subjectId: bigint,
    @Body() dto: SaveSubjectDto,
  ) {
    return {
      success: true,
      data: await this.academicUseCase.saveSubject(p.schoolId, {
        ...dto,
        id: subjectId,
      }),
    };
  }

  @Delete('subjects/:subjectId')
  @Roles(...RECTOR_ROLES)
  async deleteSubject(
    @CurrentUser() p: ActiveTenantContext,
    @Param('subjectId', PositiveBigIntPipe) subjectId: bigint,
  ) {
    await this.academicUseCase.deleteSubject(p.schoolId, subjectId);
    return { success: true, data: { deleted: true, id: Number(subjectId) } };
  }

  // Plan de estudios y carga académica
  @Get('study-plans')
  @Roles(...READ_ROLES)
  async listStudyPlans(
    @CurrentUser() p: ActiveTenantContext,
    @Query('academicYear') academicYear?: string,
  ) {
    const year = this.parseYear(academicYear, p.academicYear);
    return {
      success: true,
      data: await this.academicUseCase.listStudyPlans(p.schoolId, year),
    };
  }

  @Post('study-plans')
  @Roles(...WRITE_ROLES)
  @HttpCode(HttpStatus.OK)
  async upsertStudyPlan(
    @CurrentUser() p: ActiveTenantContext,
    @Body() dto: UpsertStudyPlanDto,
  ) {
    return {
      success: true,
      data: await this.academicUseCase.upsertStudyPlan(p.schoolId, dto),
    };
  }

  @Delete('study-plans/:planId')
  @Roles(...WRITE_ROLES)
  async deleteStudyPlan(
    @CurrentUser() p: ActiveTenantContext,
    @Param('planId', PositiveBigIntPipe) planId: bigint,
  ) {
    await this.academicUseCase.deleteStudyPlan(p.schoolId, planId);
    return { success: true, data: { deleted: true, id: Number(planId) } };
  }

  @Get('course-assignments')
  @Roles(...READ_ROLES)
  async listCourseAssignments(
    @CurrentUser() p: ActiveTenantContext,
    @Query('academicYear') academicYear?: string,
  ) {
    const year = this.parseYear(academicYear, p.academicYear);
    return {
      success: true,
      data: await this.academicUseCase.listCourseAssignments(p.schoolId, year),
    };
  }

  @Post('course-assignments')
  @Roles(...WRITE_ROLES)
  @HttpCode(HttpStatus.CREATED)
  async createCourseAssignment(
    @CurrentUser() p: ActiveTenantContext,
    @Body() dto: SaveCourseAssignmentDto,
  ) {
    return {
      success: true,
      data: await this.academicUseCase.saveCourseAssignment(p.schoolId, dto),
    };
  }

  @Patch('course-assignments/:assignmentId')
  @Roles(...WRITE_ROLES)
  async updateCourseAssignment(
    @CurrentUser() p: ActiveTenantContext,
    @Param('assignmentId', PositiveBigIntPipe) assignmentId: bigint,
    @Body() dto: SaveCourseAssignmentDto,
  ) {
    return {
      success: true,
      data: await this.academicUseCase.saveCourseAssignment(p.schoolId, {
        ...dto,
        id: assignmentId,
      }),
    };
  }

  @Delete('course-assignments/:assignmentId')
  @Roles(...WRITE_ROLES)
  async deleteCourseAssignment(
    @CurrentUser() p: ActiveTenantContext,
    @Param('assignmentId', PositiveBigIntPipe) assignmentId: bigint,
  ) {
    await this.academicUseCase.deleteCourseAssignment(p.schoolId, assignmentId);
    return { success: true, data: { deleted: true, id: Number(assignmentId) } };
  }

  @Post('course-assignments/reassign-teacher')
  @Roles(...RECTOR_ROLES, CommunityRole.COORDINATOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reasignación masiva de carga académica de un docente a otro' })
  async reassignTeacherCourses(
    @CurrentUser() p: ActiveTenantContext,
    @Body() dto: ReassignTeacherCoursesDto,
  ) {
    return {
      success: true,
      data: await this.academicUseCase.reassignTeacherCourses(p.schoolId, dto),
    };
  }

  // Estudiantes, familias y matrículas
  @Get('students')
  @Roles(...READ_ROLES)
  async listStudents(
    @CurrentUser() p: ActiveTenantContext,
    @Query('search') search?: string,
    @Query('limit') limit?: string,
  ) {
    return {
      success: true,
      data: await this.academicUseCase.listStudents(
        p.schoolId,
        search,
        limit && /^\d+$/.test(limit) ? Number(limit) : undefined,
      ),
    };
  }

  @Post('students')
  @Roles(...WRITE_ROLES)
  @HttpCode(HttpStatus.CREATED)
  async createStudent(
    @CurrentUser() p: ActiveTenantContext,
    @Body() dto: SaveStudentProfileDto,
  ) {
    return {
      success: true,
      data: await this.academicUseCase.saveStudent(p.schoolId, dto),
    };
  }

  @Patch('students/:studentId')
  @Roles(...WRITE_ROLES)
  async updateStudent(
    @CurrentUser() p: ActiveTenantContext,
    @Param('studentId', PositiveBigIntPipe) studentId: bigint,
    @Body() dto: SaveStudentProfileDto,
  ) {
    return {
      success: true,
      data: await this.academicUseCase.saveStudent(p.schoolId, {
        ...dto,
        id: studentId,
      }),
    };
  }

  @Delete('students/:studentId')
  @Roles(...RECTOR_ROLES)
  async deleteStudent(
    @CurrentUser() p: ActiveTenantContext,
    @Param('studentId', PositiveBigIntPipe) studentId: bigint,
  ) {
    await this.academicUseCase.deleteStudent(p.schoolId, studentId);
    return { success: true, data: { deleted: true, id: Number(studentId) } };
  }

  @Get('families')
  @Roles(...READ_ROLES)
  async listFamilies(
    @CurrentUser() p: ActiveTenantContext,
    @Query('search') search?: string,
  ) {
    return {
      success: true,
      data: await this.academicUseCase.listFamilies(p.schoolId, search),
    };
  }

  @Post('families')
  @Roles(...WRITE_ROLES)
  @HttpCode(HttpStatus.CREATED)
  async createFamily(
    @CurrentUser() p: ActiveTenantContext,
    @Body() dto: SaveFamilyProfileDto,
  ) {
    return {
      success: true,
      data: await this.academicUseCase.saveFamily(p.schoolId, dto),
    };
  }

  @Get('students/:studentId/families')
  @Roles(...READ_ROLES)
  async listStudentFamilies(
    @CurrentUser() p: ActiveTenantContext,
    @Param('studentId', PositiveBigIntPipe) studentId: bigint,
  ) {
    return {
      success: true,
      data: await this.academicUseCase.listStudentFamilies(
        p.schoolId,
        studentId,
      ),
    };
  }

  @Post('students/:studentId/families')
  @Roles(...WRITE_ROLES)
  @HttpCode(HttpStatus.CREATED)
  async linkStudentFamily(
    @CurrentUser() p: ActiveTenantContext,
    @Param('studentId', PositiveBigIntPipe) studentId: bigint,
    @Body() dto: LinkStudentFamilyDto,
  ) {
    return {
      success: true,
      data: await this.academicUseCase.linkStudentFamily(
        p.schoolId,
        studentId,
        dto,
      ),
    };
  }

  @Delete('students/:studentId/families/:linkId')
  @Roles(...WRITE_ROLES)
  async unlinkStudentFamily(
    @CurrentUser() p: ActiveTenantContext,
    @Param('studentId', PositiveBigIntPipe) studentId: bigint,
    @Param('linkId', PositiveBigIntPipe) linkId: bigint,
  ) {
    await this.academicUseCase.unlinkStudentFamily(
      p.schoolId,
      studentId,
      linkId,
    );
    return { success: true, data: { deleted: true, id: Number(linkId) } };
  }

  @Get('enrollments')
  @Roles(...READ_ROLES)
  async listEnrollments(
    @CurrentUser() p: ActiveTenantContext,
    @Query('academicYear') academicYear?: string,
    @Query('academicGroupId') academicGroupId?: string,
    @Query('search') search?: string,
  ) {
    return {
      success: true,
      data: await this.academicUseCase.listEnrollments(p.schoolId, {
        academicYear: this.parseYear(academicYear, p.academicYear),
        academicGroupId:
          academicGroupId && /^\d+$/.test(academicGroupId)
            ? Number(academicGroupId)
            : undefined,
        search,
      }),
    };
  }

  @Post('enrollments')
  @Roles(...WRITE_ROLES)
  @HttpCode(HttpStatus.CREATED)
  async createEnrollment(
    @CurrentUser() p: ActiveTenantContext,
    @Body() dto: SaveEnrollmentDto,
  ) {
    return {
      success: true,
      data: await this.academicUseCase.saveEnrollment(p.schoolId, dto),
    };
  }

  @Post('enrollments/move')
  @Roles(...WRITE_ROLES)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mover estudiantes matriculados a otra sede, jornada, grado o grupo' })
  async moveEnrollments(
    @CurrentUser() p: ActiveTenantContext,
    @Body() dto: MoveEnrollmentsDto,
  ) {
    return {
      success: true,
      data: await this.academicUseCase.moveEnrollments(p.schoolId, dto),
    };
  }

  @Get('enrollments/:enrollmentId/novelties')
  @Roles(...READ_ROLES)
  async listEnrollmentNovelties(
    @CurrentUser() p: ActiveTenantContext,
    @Param('enrollmentId', PositiveBigIntPipe) enrollmentId: bigint,
  ) {
    return {
      success: true,
      data: await this.academicUseCase.listEnrollmentNovelties(
        p.schoolId,
        enrollmentId,
      ),
    };
  }

  @Post('enrollments/:enrollmentId/novelties')
  @Roles(...WRITE_ROLES)
  @HttpCode(HttpStatus.CREATED)
  async recordEnrollmentNovelty(
    @CurrentUser() p: ActiveTenantContext,
    @Param('enrollmentId', PositiveBigIntPipe) enrollmentId: bigint,
    @Body() dto: RecordEnrollmentNoveltyDto,
  ) {
    return {
      success: true,
      data: await this.academicUseCase.recordEnrollmentNovelty(
        p.schoolId,
        enrollmentId,
        p.userId,
        dto,
      ),
    };
  }

  // Control de notas, transferencias, nivelaciones, cuadro de honor y mayúsculas de logros
  @Get('grades/reported-summary')
  @Roles(...READ_ROLES)
  async listReportedSummary(
    @CurrentUser() p: ActiveTenantContext,
    @Query('academicYear') academicYear?: string,
    @Query('periodNumber') periodNumber?: string,
  ) {
    return {
      success: true,
      data: await this.academicUseCase.listReportedGradesSummary(
        p.schoolId,
        this.parseYear(academicYear, p.academicYear),
        periodNumber && /^\d+$/.test(periodNumber) ? Number(periodNumber) : 1,
      ),
    };
  }

  @Get('grades/by-enrollment/:enrollmentId')
  @Roles(...READ_ROLES)
  async listEnrollmentGrades(
    @CurrentUser() p: ActiveTenantContext,
    @Param('enrollmentId', PositiveBigIntPipe) enrollmentId: bigint,
    @Query('academicYear') academicYear?: string,
    @Query('periodNumber') periodNumber?: string,
  ) {
    return {
      success: true,
      data: await this.academicUseCase.listEnrollmentGrades(
        p.schoolId,
        enrollmentId,
        this.parseYear(academicYear, p.academicYear),
        periodNumber && /^\d+$/.test(periodNumber)
          ? Number(periodNumber)
          : undefined,
      ),
    };
  }

  @Patch('grades/:gradeId')
  @Roles(...RECTOR_ROLES)
  @ApiOperation({ summary: 'Edición administrativa directa de nota con registro de auditoría' })
  async adminUpdateGradeScore(
    @CurrentUser() p: ActiveTenantContext,
    @Param('gradeId', PositiveBigIntPipe) gradeId: bigint,
    @Body() dto: AdminUpdateGradeScoreDto,
  ) {
    return {
      success: true,
      data: await this.academicUseCase.adminUpdateGradeScore(
        p.schoolId,
        gradeId,
        dto.academicYear,
        p.userId,
        dto,
      ),
    };
  }

  @Post('grades/transfer')
  @Roles(...RECTOR_ROLES, CommunityRole.COORDINATOR)
  @HttpCode(HttpStatus.OK)
  async transferGrades(
    @CurrentUser() p: ActiveTenantContext,
    @Body() dto: TransferStudentGradesDto,
  ) {
    return {
      success: true,
      data: await this.academicUseCase.transferStudentGrades(p.schoolId, dto),
    };
  }

  @Get('recoveries')
  @Roles(...READ_ROLES)
  async listRecoveries(
    @CurrentUser() p: ActiveTenantContext,
    @Query('academicYear') academicYear?: string,
    @Query('periodNumber') periodNumber?: string,
  ) {
    return {
      success: true,
      data: await this.academicUseCase.listPeriodRecoveries(
        p.schoolId,
        this.parseYear(academicYear, p.academicYear),
        periodNumber && /^\d+$/.test(periodNumber)
          ? Number(periodNumber)
          : undefined,
      ),
    };
  }

  @Post('recoveries')
  @Roles(...WRITE_ROLES, CommunityRole.TEACHER)
  @HttpCode(HttpStatus.CREATED)
  async saveRecovery(
    @CurrentUser() p: ActiveTenantContext,
    @Body() dto: SavePeriodRecoveryDto,
  ) {
    return {
      success: true,
      data: await this.academicUseCase.savePeriodRecovery(p.schoolId, dto),
    };
  }

  @Get('honor-roll')
  @Roles(...READ_ROLES)
  async listHonorRoll(
    @CurrentUser() p: ActiveTenantContext,
    @Query('academicYear') academicYear?: string,
    @Query('periodNumber') periodNumber?: string,
  ) {
    return {
      success: true,
      data: await this.academicUseCase.calculateAndListHonorRoll(
        p.schoolId,
        this.parseYear(academicYear, p.academicYear),
        periodNumber && /^\d+$/.test(periodNumber) ? Number(periodNumber) : 1,
        false,
      ),
    };
  }

  @Post('honor-roll/calculate')
  @Roles(...WRITE_ROLES)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Calcular y persistir Cuadro de Honor y puestos por grupo/grado' })
  async calculateHonorRoll(
    @CurrentUser() p: ActiveTenantContext,
    @Body() dto: HonorRollRequestDto,
  ) {
    return {
      success: true,
      data: await this.academicUseCase.calculateAndListHonorRoll(
        p.schoolId,
        dto.academicYear,
        dto.periodNumber,
        true,
      ),
    };
  }

  @Post('achievements/uppercase')
  @Roles(...RECTOR_ROLES, CommunityRole.COORDINATOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Convertir descripciones de logros e indicadores del año a MAYÚSCULAS' })
  async uppercaseAchievements(
    @CurrentUser() p: ActiveTenantContext,
    @Body() dto: UppercaseAchievementsDto,
  ) {
    return {
      success: true,
      data: await this.academicUseCase.uppercaseAchievementStandards(
        p.schoolId,
        dto.academicYear,
      ),
    };
  }

  private parseYear(raw: string | undefined, fallback: number): number {
    return raw && /^\d{4}$/.test(raw) ? Number(raw) : fallback;
  }
}
