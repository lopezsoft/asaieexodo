import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiProperty,
  ApiPropertyOptional,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { ActiveTenantContext } from '../../../../shared/application/context/tenant-context.service';
import { TenantAccessDeniedException } from '../../../../shared/domain/exceptions/tenant-access-denied.exception';
import { PostgresRlsService } from '../../../../shared/infrastructure/database/postgres-rls.service';
import {
  CurrentUser,
  RequireAnyPermission,
  RequireModule,
} from '../../../../shared/infrastructure/http/decorators/security.decorators';
import { PositiveBigIntPipe } from '../../../../shared/infrastructure/http/pipes/positive-bigint.pipe';
import {
  RBAC_MODULES,
  RBAC_PERMISSIONS,
} from '../../../../shared/infrastructure/rbac/rbac-permissions.constants';
import { RbacPermissionsService } from '../../../../shared/infrastructure/rbac/rbac-permissions.service';
import { RecordStudentGradeUseCase } from '../../application/use-cases/record-student-grade.use-case';

export class CompetencyScoreItemDto {
  @ApiProperty({
    example: 1,
    description: 'ID de la dimensión o competencia evaluativa',
  })
  @IsInt()
  @Min(1)
  competencyId!: number;

  @ApiProperty({
    example: 40,
    description: 'Peso porcentual de la competencia (0 < peso <= 100)',
  })
  @IsNumber()
  @Min(0.01)
  @Max(100)
  weightPercentage!: number;

  @ApiProperty({ example: 4.5, description: 'Promedio obtenido en la competencia' })
  @IsNumber()
  @Min(0)
  @Max(100)
  averageScore!: number;
}

export class RecordStudentGradeRequestDto {
  @ApiProperty({ example: 2026 })
  @IsInt()
  @Min(1990)
  @Max(2034)
  academicYear!: number;

  @ApiProperty({ example: 101 })
  @IsInt()
  @Min(1)
  enrollmentId!: number;

  @ApiProperty({ example: 15 })
  @IsInt()
  @Min(1)
  courseAssignmentId!: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  periodId!: number;

  @ApiProperty({
    example: 'WEIGHTED_COMPETENCIES',
    enum: ['WEIGHTED_COMPETENCIES', 'ARITHMETIC_AVERAGE'],
  })
  @IsString()
  @IsIn(['WEIGHTED_COMPETENCIES', 'ARITHMETIC_AVERAGE'])
  evaluationMode!: 'WEIGHTED_COMPETENCIES' | 'ARITHMETIC_AVERAGE';

  @ApiProperty({ type: [CompetencyScoreItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CompetencyScoreItemDto)
  competencyScores!: CompetencyScoreItemDto[];

  @ApiPropertyOptional({ example: 3.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  recoveryScore?: number;

  @ApiPropertyOptional({ example: 3.2 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  levelingScore?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(200)
  justifiedAbsences?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(200)
  unjustifiedAbsences?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(200)
  lateArrivals?: number;

  @ApiPropertyOptional({ example: 'Excelente participación en clase.' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  teacherObservations?: string;

  @ApiPropertyOptional({ example: 'Actualización de nota de recuperación' })
  @IsOptional()
  @IsString()
  @MaxLength(250)
  changeReason?: string;
}

export class GetBulletinQueryDto {
  @ApiProperty({ example: 2026 })
  @Type(() => Number)
  @IsInt()
  @Min(1990)
  @Max(2034)
  academicYear!: number;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  periodId!: number;
}

@ApiTags('Academic Grading & Bulletins')
@ApiBearerAuth('jwt-auth')
@RequireModule(RBAC_MODULES.ACADEMIC_GRADES)
@Controller('grading')
export class GradingController {
  constructor(
    private readonly recordStudentGradeUseCase: RecordStudentGradeUseCase,
    private readonly rbacPermissions: RbacPermissionsService,
    private readonly db: PostgresRlsService,
  ) {}

  @Post('grades')
  @RequireAnyPermission(
    RBAC_PERMISSIONS.PORTAL_TEACHER_OWN,
    RBAC_PERMISSIONS.ACADEMIC_GRADES_RECTOR_OVERRIDE,
  )
  @ApiOperation({
    summary: 'Registrar o actualizar calificación periódica de un estudiante',
    description:
      'Calcula la nota definitiva aplicando las reglas institucionales (`academic_grading_rules`), registra trazabilidad en `academic_score_audit_logs`, sincroniza `academic_pre_reports` y persiste en `academic_scores` bajo RLS usando el `schoolId` y `userId` del JWT verificado.',
  })
  @ApiResponse({
    status: 201,
    description: 'Calificación periódica calculada y almacenada exitosamente.',
  })
  async recordGrade(
    @CurrentUser() principal: ActiveTenantContext,
    @Body() payload: RecordStudentGradeRequestDto,
  ): Promise<Record<string, unknown>> {
    const canOverride = await this.rbacPermissions.hasPermission(
      principal.schoolId,
      principal.userId,
      principal.activeRole,
      RBAC_PERMISSIONS.ACADEMIC_GRADES_RECTOR_OVERRIDE,
    );

    if (!canOverride) {
      // Verificar que el docente sea el titular de la asignación académica (anti-IDOR)
      const ownsCourse = await this.db.withTenantTransaction(
        principal.schoolId,
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
            [
              String(principal.schoolId),
              String(payload.courseAssignmentId),
              String(principal.userId),
            ],
          );
          return (res.rowCount ?? 0) > 0;
        },
      );

      if (!ownsCourse) {
        throw new TenantAccessDeniedException(
          'Solo el docente titular de esta asignatura o un directivo autorizado puede registrar calificaciones.',
        );
      }
    }

    const grade = await this.recordStudentGradeUseCase.execute({
      schoolId: principal.schoolId,
      academicYear: payload.academicYear,
      enrollmentId: BigInt(payload.enrollmentId),
      courseAssignmentId: BigInt(payload.courseAssignmentId),
      periodId: BigInt(payload.periodId),
      evaluationMode: payload.evaluationMode,
      competencyScores: payload.competencyScores.map((c) => ({
        competencyId: BigInt(c.competencyId),
        weightPercentage: c.weightPercentage,
        averageScore: c.averageScore,
      })),
      recoveryScore: payload.recoveryScore,
      levelingScore: payload.levelingScore,
      justifiedAbsences: payload.justifiedAbsences,
      unjustifiedAbsences: payload.unjustifiedAbsences,
      lateArrivals: payload.lateArrivals,
      teacherObservations: payload.teacherObservations,
      changeReason: payload.changeReason,
      updatedByUserId: principal.userId,
    });

    return {
      success: true,
      data: grade.toPrimitives(),
    };
  }

  @Get('bulletins/:enrollmentId')
  @RequireAnyPermission(
    RBAC_PERMISSIONS.ACADEMIC_GRADES_VIEW,
    RBAC_PERMISSIONS.PORTAL_TEACHER_OWN,
    RBAC_PERMISSIONS.PORTAL_STUDENT_OWN,
  )
  @ApiOperation({
    summary: 'Consultar boletín de calificaciones de un estudiante por periodo',
    description:
      'Obtiene el consolidado de áreas, asignaturas, intensidad horaria, nota final, recuperación, nivelación, escala nacional y ausencias aplicando aislamiento estricto RLS del JWT y verificación de pertenencia para estudiantes/familias.',
  })
  @ApiParam({ name: 'enrollmentId', example: 101 })
  @ApiResponse({
    status: 200,
    description: 'Resumen de calificaciones del boletín estudiantil.',
  })
  async getStudentBulletin(
    @CurrentUser() principal: ActiveTenantContext,
    @Param('enrollmentId', PositiveBigIntPipe) enrollmentId: bigint,
    @Query() query: GetBulletinQueryDto,
  ): Promise<Record<string, unknown>> {
    const canViewAllGrades = await this.rbacPermissions.hasPermission(
      principal.schoolId,
      principal.userId,
      principal.activeRole,
      RBAC_PERMISSIONS.ACADEMIC_GRADES_VIEW,
    );

    if (!canViewAllGrades) {
      const ownsEnrollment = await this.db.withTenantTransaction(
        principal.schoolId,
        async (client) => {
          const res = await client.query<{ ok: number }>(
            `SELECT 1 AS ok
               FROM student_enrollments se
               INNER JOIN student_profiles sp
                 ON sp.school_id = se.school_id AND sp.id = se.student_profile_id
              WHERE se.school_id = $1
                AND se.id = $2
                AND (
                  sp.user_id = $3
                  OR EXISTS (
                    SELECT 1
                      FROM student_family_links sfl
                      INNER JOIN family_profiles fp
                        ON fp.school_id = sfl.school_id AND fp.id = sfl.family_profile_id
                     WHERE sfl.school_id = se.school_id
                       AND sfl.student_profile_id = se.student_profile_id
                       AND fp.user_id = $3
                  )
                )
              LIMIT 1`,
            [
              String(principal.schoolId),
              String(enrollmentId),
              String(principal.userId),
            ],
          );
          return (res.rowCount ?? 0) > 0;
        },
      );

      if (!ownsEnrollment) {
        throw new TenantAccessDeniedException(
          'No tienes autorización para consultar el boletín de otro estudiante.',
        );
      }
    }

    const items = await this.recordStudentGradeUseCase.getStudentBulletin(
      principal.schoolId,
      query.academicYear,
      enrollmentId,
      BigInt(query.periodId),
    );

    return {
      success: true,
      totalSubjects: items.length,
      data: items,
    };
  }
}
