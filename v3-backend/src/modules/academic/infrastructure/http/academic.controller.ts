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
  RequireModule,
  RequirePermissions,
} from '../../../../shared/infrastructure/http/decorators/security.decorators';
import { PositiveBigIntPipe } from '../../../../shared/infrastructure/http/pipes/positive-bigint.pipe';
import {
  RBAC_MODULES,
  RBAC_PERMISSIONS,
} from '../../../../shared/infrastructure/rbac/rbac-permissions.constants';
import { ManageAcademicUseCase } from '../../application/use-cases/manage-academic.use-case';
import {
  AdminUpdateGradeScoreDto,
  HonorRollRequestDto,
  LinkStudentFamilyDto,
  MaterializeAreaResultsDto,
  MoveEnrollmentsDto,
  ReassignTeacherCoursesDto,
  RecordEnrollmentNoveltyDto,
  RenumberFoliosDto,
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

@ApiTags('Academic Management, Curriculum, Enrollments & Grades Control')
@ApiBearerAuth('jwt-auth')
@Controller('academic')
export class AcademicController {
  constructor(private readonly academicUseCase: ManageAcademicUseCase) {}

  // Áreas y asignaturas (Currículo)
  @Get('areas')
  @RequireModule(RBAC_MODULES.ACADEMIC_GRADES)
  @RequirePermissions(RBAC_PERMISSIONS.ACADEMIC_CURRICULUM_VIEW)
  async listAreas(@CurrentUser() p: ActiveTenantContext) {
    return {
      success: true,
      data: await this.academicUseCase.listAreas(p.schoolId),
    };
  }

  @Post('areas')
  @RequireModule(RBAC_MODULES.ACADEMIC_GRADES)
  @RequirePermissions(RBAC_PERMISSIONS.ACADEMIC_CURRICULUM_WRITE)
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
  @RequireModule(RBAC_MODULES.ACADEMIC_GRADES)
  @RequirePermissions(RBAC_PERMISSIONS.ACADEMIC_CURRICULUM_WRITE)
  async updateArea(
    @CurrentUser() p: ActiveTenantContext,
    @Param('areaId', PositiveBigIntPipe) areaId: bigint,
    @Body() dto: SaveAcademicAreaDto,
  ) {
    return {
      success: true,
      data: await this.academicUseCase.saveArea(p.schoolId, {
        ...dto,
        id: areaId,
      }),
    };
  }

  @Delete('areas/:areaId')
  @RequireModule(RBAC_MODULES.ACADEMIC_GRADES)
  @RequirePermissions(RBAC_PERMISSIONS.ACADEMIC_CURRICULUM_DELETE)
  async deleteArea(
    @CurrentUser() p: ActiveTenantContext,
    @Param('areaId', PositiveBigIntPipe) areaId: bigint,
  ) {
    await this.academicUseCase.deleteArea(p.schoolId, areaId);
    return { success: true, data: { deleted: true, id: Number(areaId) } };
  }

  @Get('subjects')
  @RequireModule(RBAC_MODULES.ACADEMIC_GRADES)
  @RequirePermissions(RBAC_PERMISSIONS.ACADEMIC_CURRICULUM_VIEW)
  async listSubjects(@CurrentUser() p: ActiveTenantContext) {
    return {
      success: true,
      data: await this.academicUseCase.listSubjects(p.schoolId),
    };
  }

  @Post('subjects')
  @RequireModule(RBAC_MODULES.ACADEMIC_GRADES)
  @RequirePermissions(RBAC_PERMISSIONS.ACADEMIC_CURRICULUM_WRITE)
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
  @RequireModule(RBAC_MODULES.ACADEMIC_GRADES)
  @RequirePermissions(RBAC_PERMISSIONS.ACADEMIC_CURRICULUM_WRITE)
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
  @RequireModule(RBAC_MODULES.ACADEMIC_GRADES)
  @RequirePermissions(RBAC_PERMISSIONS.ACADEMIC_CURRICULUM_DELETE)
  async deleteSubject(
    @CurrentUser() p: ActiveTenantContext,
    @Param('subjectId', PositiveBigIntPipe) subjectId: bigint,
  ) {
    await this.academicUseCase.deleteSubject(p.schoolId, subjectId);
    return { success: true, data: { deleted: true, id: Number(subjectId) } };
  }

  // Plan de estudios y carga académica
  @Get('study-plans')
  @RequireModule(RBAC_MODULES.ACADEMIC_GRADES)
  @RequirePermissions(RBAC_PERMISSIONS.ACADEMIC_CURRICULUM_VIEW)
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
  @RequireModule(RBAC_MODULES.ACADEMIC_GRADES)
  @RequirePermissions(RBAC_PERMISSIONS.ACADEMIC_CURRICULUM_WRITE)
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
  @RequireModule(RBAC_MODULES.ACADEMIC_GRADES)
  @RequirePermissions(RBAC_PERMISSIONS.ACADEMIC_CURRICULUM_WRITE)
  async deleteStudyPlan(
    @CurrentUser() p: ActiveTenantContext,
    @Param('planId', PositiveBigIntPipe) planId: bigint,
  ) {
    await this.academicUseCase.deleteStudyPlan(p.schoolId, planId);
    return { success: true, data: { deleted: true, id: Number(planId) } };
  }

  @Get('course-assignments')
  @RequireModule(RBAC_MODULES.ACADEMIC_GRADES)
  @RequirePermissions(RBAC_PERMISSIONS.ACADEMIC_COURSE_ASSIGNMENTS_VIEW)
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
  @RequireModule(RBAC_MODULES.ACADEMIC_GRADES)
  @RequirePermissions(RBAC_PERMISSIONS.ACADEMIC_COURSE_ASSIGNMENTS_WRITE)
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
  @RequireModule(RBAC_MODULES.ACADEMIC_GRADES)
  @RequirePermissions(RBAC_PERMISSIONS.ACADEMIC_COURSE_ASSIGNMENTS_WRITE)
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
  @RequireModule(RBAC_MODULES.ACADEMIC_GRADES)
  @RequirePermissions(RBAC_PERMISSIONS.ACADEMIC_COURSE_ASSIGNMENTS_WRITE)
  async deleteCourseAssignment(
    @CurrentUser() p: ActiveTenantContext,
    @Param('assignmentId', PositiveBigIntPipe) assignmentId: bigint,
  ) {
    await this.academicUseCase.deleteCourseAssignment(p.schoolId, assignmentId);
    return { success: true, data: { deleted: true, id: Number(assignmentId) } };
  }

  @Post('course-assignments/reassign-teacher')
  @RequireModule(RBAC_MODULES.ACADEMIC_GRADES)
  @RequirePermissions(RBAC_PERMISSIONS.ACADEMIC_COURSE_ASSIGNMENTS_REASSIGN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reasignación masiva de carga académica de un docente a otro',
  })
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
  @RequireModule(RBAC_MODULES.ENROLLMENTS)
  @RequirePermissions(RBAC_PERMISSIONS.ACADEMIC_ENROLLMENTS_VIEW)
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
  @RequireModule(RBAC_MODULES.ENROLLMENTS)
  @RequirePermissions(RBAC_PERMISSIONS.ACADEMIC_ENROLLMENTS_WRITE)
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
  @RequireModule(RBAC_MODULES.ENROLLMENTS)
  @RequirePermissions(RBAC_PERMISSIONS.ACADEMIC_ENROLLMENTS_WRITE)
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
  @RequireModule(RBAC_MODULES.ENROLLMENTS)
  @RequirePermissions(RBAC_PERMISSIONS.ACADEMIC_ENROLLMENTS_DELETE)
  async deleteStudent(
    @CurrentUser() p: ActiveTenantContext,
    @Param('studentId', PositiveBigIntPipe) studentId: bigint,
  ) {
    await this.academicUseCase.deleteStudent(p.schoolId, studentId);
    return { success: true, data: { deleted: true, id: Number(studentId) } };
  }

  @Get('families')
  @RequireModule(RBAC_MODULES.ENROLLMENTS)
  @RequirePermissions(RBAC_PERMISSIONS.ACADEMIC_ENROLLMENTS_VIEW)
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
  @RequireModule(RBAC_MODULES.ENROLLMENTS)
  @RequirePermissions(RBAC_PERMISSIONS.ACADEMIC_ENROLLMENTS_WRITE)
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
  @RequireModule(RBAC_MODULES.ENROLLMENTS)
  @RequirePermissions(RBAC_PERMISSIONS.ACADEMIC_ENROLLMENTS_VIEW)
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
  @RequireModule(RBAC_MODULES.ENROLLMENTS)
  @RequirePermissions(RBAC_PERMISSIONS.ACADEMIC_ENROLLMENTS_WRITE)
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
  @RequireModule(RBAC_MODULES.ENROLLMENTS)
  @RequirePermissions(RBAC_PERMISSIONS.ACADEMIC_ENROLLMENTS_WRITE)
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
  @RequireModule(RBAC_MODULES.ENROLLMENTS)
  @RequirePermissions(RBAC_PERMISSIONS.ACADEMIC_ENROLLMENTS_VIEW)
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
  @RequireModule(RBAC_MODULES.ENROLLMENTS)
  @RequirePermissions(RBAC_PERMISSIONS.ACADEMIC_ENROLLMENTS_WRITE)
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
  @RequireModule(RBAC_MODULES.ENROLLMENTS)
  @RequirePermissions(RBAC_PERMISSIONS.ACADEMIC_ENROLLMENTS_MOVE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Mover estudiantes matriculados a otra sede, jornada, grado o grupo',
  })
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
  @RequireModule(RBAC_MODULES.ENROLLMENTS)
  @RequirePermissions(RBAC_PERMISSIONS.ACADEMIC_ENROLLMENTS_VIEW)
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
  @RequireModule(RBAC_MODULES.ENROLLMENTS)
  @RequirePermissions(RBAC_PERMISSIONS.ACADEMIC_ENROLLMENTS_WRITE)
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
  @RequireModule(RBAC_MODULES.ACADEMIC_GRADES)
  @RequirePermissions(RBAC_PERMISSIONS.ACADEMIC_GRADES_VIEW)
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
  @RequireModule(RBAC_MODULES.ACADEMIC_GRADES)
  @RequirePermissions(RBAC_PERMISSIONS.ACADEMIC_GRADES_VIEW)
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
  @RequireModule(RBAC_MODULES.ACADEMIC_GRADES)
  @RequirePermissions(RBAC_PERMISSIONS.ACADEMIC_GRADES_RECTOR_OVERRIDE)
  @ApiOperation({
    summary: 'Edición administrativa directa de nota con registro de auditoría',
  })
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
  @RequireModule(RBAC_MODULES.ACADEMIC_GRADES)
  @RequirePermissions(RBAC_PERMISSIONS.ACADEMIC_GRADES_TRANSFER)
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
  @RequireModule(RBAC_MODULES.ACADEMIC_GRADES)
  @RequirePermissions(RBAC_PERMISSIONS.ACADEMIC_RECOVERIES_VIEW)
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
  @RequireModule(RBAC_MODULES.ACADEMIC_GRADES)
  @RequirePermissions(RBAC_PERMISSIONS.ACADEMIC_RECOVERIES_WRITE)
  @HttpCode(HttpStatus.CREATED)
  async saveRecovery(
    @CurrentUser() p: ActiveTenantContext,
    @Body() dto: SavePeriodRecoveryDto,
  ) {
    return {
      success: true,
      data: await this.academicUseCase.savePeriodRecovery(
        p.schoolId,
        dto,
        p.userId,
      ),
    };
  }

  @Get('honor-roll')
  @RequireModule(RBAC_MODULES.ACADEMIC_GRADES)
  @RequirePermissions(RBAC_PERMISSIONS.ACADEMIC_HONOR_ROLL_VIEW)
  async listHonorRoll(
    @CurrentUser() p: ActiveTenantContext,
    @Query('academicYear') academicYear?: string,
    @Query('periodNumber') periodNumber?: string,
    @Query('honorScope') honorScope?: string,
    @Query('topLimit') topLimit?: string,
    @Query('mode') mode?: string,
  ) {
    return {
      success: true,
      data: await this.academicUseCase.calculateAndListHonorRoll(
        p.schoolId,
        this.parseYear(academicYear, p.academicYear),
        periodNumber && /^\d+$/.test(periodNumber) ? Number(periodNumber) : 1,
        false,
        {
          honorScope:
            honorScope && /^[1-5]$/.test(honorScope)
              ? Number(honorScope)
              : undefined,
          topLimit:
            topLimit && /^\d+$/.test(topLimit) ? Number(topLimit) : undefined,
          mode: mode === 'ANNUAL' ? 'ANNUAL' : 'PERIOD',
        },
      ),
    };
  }

  @Post('honor-roll/calculate')
  @RequireModule(RBAC_MODULES.ACADEMIC_GRADES)
  @RequirePermissions(RBAC_PERMISSIONS.ACADEMIC_HONOR_ROLL_CALCULATE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Calcular y persistir Cuadro de Honor y puestos por grupo/grado bajo SIEE',
  })
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
        {
          honorScope: dto.honorScope,
          topLimit: dto.topLimit,
          mode: 'PERIOD',
        },
      ),
    };
  }

  @Get('consolidated')
  @RequireModule(RBAC_MODULES.ACADEMIC_GRADES)
  @RequirePermissions(RBAC_PERMISSIONS.ACADEMIC_CONSOLIDATED_VIEW)
  @ApiOperation({
    summary:
      'Generar consolidado/sábana SIEE por asignaturas, áreas o docente (periodo individual o todos los periodos)',
  })
  async getConsolidated(
    @CurrentUser() p: ActiveTenantContext,
    @Query('academicYear') academicYear?: string,
    @Query('mode') mode?: string,
    @Query('academicGroupId') academicGroupId?: string,
    @Query('teacherProfileId') teacherProfileId?: string,
    @Query('periodNumber') periodNumber?: string,
    @Query('allPeriods') allPeriods?: string,
  ) {
    const safeMode: 'subjects' | 'areas' | 'teacher' =
      mode === 'areas' || mode === 'teacher' ? mode : 'subjects';
    return {
      success: true,
      data: await this.academicUseCase.getConsolidatedReport(p.schoolId, {
        academicYear: this.parseYear(academicYear, p.academicYear),
        mode: safeMode,
        academicGroupId:
          academicGroupId && /^\d+$/.test(academicGroupId)
            ? Number(academicGroupId)
            : undefined,
        teacherProfileId:
          teacherProfileId && /^\d+$/.test(teacherProfileId)
            ? Number(teacherProfileId)
            : undefined,
        periodNumber:
          periodNumber && /^[1-6]$/.test(periodNumber)
            ? Number(periodNumber)
            : 1,
        allPeriods: allPeriods === 'true' || allPeriods === '1',
      }),
    };
  }

  @Post('consolidated/materialize-areas')
  @RequireModule(RBAC_MODULES.ACADEMIC_GRADES)
  @RequirePermissions(RBAC_PERMISSIONS.ACADEMIC_CONSOLIDATED_MATERIALIZE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Materializar resultados ponderados por área y periodo en academic_area_period_results',
  })
  async materializeAreaResults(
    @CurrentUser() p: ActiveTenantContext,
    @Body() dto: MaterializeAreaResultsDto,
  ) {
    return {
      success: true,
      data: await this.academicUseCase.materializeAreaPeriodResults(
        p.schoolId,
        dto.academicYear,
        dto.periodNumber,
      ),
    };
  }

  @Post('enrollments/renumber-folios')
  @RequireModule(RBAC_MODULES.ENROLLMENTS)
  @RequirePermissions(RBAC_PERMISSIONS.ACADEMIC_ENROLLMENTS_RENUMBER_FOLIOS)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Renumerar secuencialmente número de registro, libro y folio de matrículas del año según students_per_book',
  })
  async renumberFolios(
    @CurrentUser() p: ActiveTenantContext,
    @Body() dto: RenumberFoliosDto,
  ) {
    return {
      success: true,
      data: await this.academicUseCase.renumberEnrollmentFolios(
        p.schoolId,
        dto.academicYear,
        dto.onlyActive ?? true,
      ),
    };
  }

  @Post('achievements/uppercase')
  @RequireModule(RBAC_MODULES.ACADEMIC_GRADES)
  @RequirePermissions(RBAC_PERMISSIONS.ACADEMIC_ACHIEVEMENTS_UPPERCASE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Convertir descripciones de logros e indicadores del año a MAYÚSCULAS',
  })
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
