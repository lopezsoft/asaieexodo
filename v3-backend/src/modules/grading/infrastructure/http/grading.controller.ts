import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import {
  RecordStudentGradeCommand,
  RecordStudentGradeUseCase,
} from '../../application/use-cases/record-student-grade.use-case';

@Controller('grading')
export class GradingController {
  constructor(
    private readonly recordStudentGradeUseCase: RecordStudentGradeUseCase,
  ) {}

  @Post('grades')
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
