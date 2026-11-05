import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  RecordStudentGradeCommand,
  RecordStudentGradeUseCase,
} from '../../application/use-cases/record-student-grade.use-case';

@ApiTags('Academic Grading & Bulletins')
@ApiBearerAuth('jwt-auth')
@ApiHeader({
  name: 'x-school-id',
  description: 'ID de la Institución Educativa activa (Tenant RLS)',
  required: false,
})
@Controller('grading')
export class GradingController {
  constructor(
    private readonly recordStudentGradeUseCase: RecordStudentGradeUseCase,
  ) {}

  @Post('grades')
  @ApiOperation({
    summary: 'Registrar o actualizar calificación periódica de un estudiante',
    description:
      'Calcula la nota definitiva ponderada aplicando la estrategia de evaluación institucional (`WeightedDimensionGradingStrategy`) y la persiste en la tabla particionada `academic_grades` bajo RLS.',
  })
  @ApiResponse({
    status: 201,
    description: 'Calificación periódica calculada y almacenada exitosamente.',
  })
  async recordGrade(
    @Body() payload: RecordStudentGradeCommand,
  ): Promise<Record<string, unknown>> {
    const grade = await this.recordStudentGradeUseCase.execute({
      ...payload,
      schoolId: BigInt(payload.schoolId),
      enrollmentId: BigInt(payload.enrollmentId),
      courseAssignmentId: BigInt(payload.courseAssignmentId),
      academicPeriodId: BigInt(payload.academicPeriodId),
      updatedByUserId: BigInt(payload.updatedByUserId),
    });

    return {
      success: true,
      data: grade.toPrimitives(),
    };
  }

  @Get('bulletins/:schoolId/:enrollmentId')
  @ApiOperation({
    summary: 'Consultar boletín de calificaciones de un estudiante por periodo',
    description:
      'Obtiene el consolidado de áreas, asignaturas, intensidad horaria, nota final, nivelación y ausencias del estudiante aplicando aislamiento RLS.',
  })
  @ApiResponse({
    status: 200,
    description: 'Resumen de calificaciones del boletín estudiantil.',
  })
  async getStudentBulletin(
    @Param('schoolId') schoolId: string,
    @Param('enrollmentId') enrollmentId: string,
    @Query('academicYear') academicYear: string,
    @Query('academicPeriodId') academicPeriodId: string,
  ): Promise<Record<string, unknown>> {
    const items = await this.recordStudentGradeUseCase.getStudentBulletin(
      BigInt(schoolId),
      Number(academicYear),
      BigInt(enrollmentId),
      BigInt(academicPeriodId),
    );

    return {
      success: true,
      totalSubjects: items.length,
      data: items,
    };
  }
}
