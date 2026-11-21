import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class GradebookRowInputDto {
  @IsInt()
  @Min(1)
  enrollmentId!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  conceptualScore?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  proceduralScore?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  attitudinalScore?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  evaluationExamScore?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  finalScore!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  recoveryScore?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  levelingScore?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  justifiedAbsences?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  unjustifiedAbsences?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  lateArrivals?: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  teacherObservations?: string | null;

  @IsOptional()
  @IsBoolean()
  hasPreReportAlert?: boolean;
}

export class SaveGradebookBatchDto {
  @ApiProperty({ example: 2026 })
  @IsInt()
  @Min(1990)
  @Max(2100)
  academicYear!: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  @Max(6)
  periodNumber!: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => GradebookRowInputDto)
  rows!: GradebookRowInputDto[];
}

export class UpsertPreReportDto {
  @IsInt()
  @Min(1990)
  @Max(2100)
  academicYear!: number;

  @IsInt()
  @Min(1)
  enrollmentId!: number;

  @IsInt()
  @Min(1)
  @Max(6)
  periodNumber!: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  partialScore!: number;

  @IsOptional()
  @IsString()
  @MaxLength(1500)
  observations?: string | null;
}

export class SaveAchievementStandardDto {
  @IsInt()
  @Min(1)
  gradeId!: number;

  @IsInt()
  @Min(1)
  subjectId!: number;

  @IsInt()
  @Min(1990)
  @Max(2100)
  academicYear!: number;

  @IsInt()
  @Min(1)
  @Max(6)
  periodNumber!: number;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  code?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  indicatorType?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  description!: string;
}

export class ImportAchievementsDto {
  @IsInt()
  @Min(1990)
  @Max(2100)
  fromYear!: number;

  @IsInt()
  @Min(1990)
  @Max(2100)
  toYear!: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  gradeId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  subjectId?: number;
}

export class RecordStudentAbsenceDto {
  @IsInt()
  @Min(1)
  enrollmentId!: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  courseAssignmentId?: number | null;

  @IsInt()
  @Min(1)
  @Max(6)
  periodNumber!: number;

  @IsDateString()
  absenceDate!: string;

  @IsInt()
  @Min(1)
  @Max(24)
  hoursMissed!: number;

  @IsOptional()
  @IsBoolean()
  isJustified?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  justificationNotes?: string | null;
}

export class UpsertStudentObserverDto {
  @IsInt()
  @Min(1)
  enrollmentId!: number;

  @IsInt()
  @Min(1990)
  @Max(2100)
  academicYear!: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  templateId?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(3000)
  strengths?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(3000)
  difficulties?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(3000)
  commitments?: string | null;
}

export class AddObserverAnnotationDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  sectionId?: number | null;

  @IsInt()
  @Min(1)
  @Max(6)
  periodNumber!: number;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  annotationType?: string;

  @IsOptional()
  @IsIn(['PRAISE', 'MILD', 'SERIOUS', 'VERY_SERIOUS'])
  severityLevel?: 'PRAISE' | 'MILD' | 'SERIOUS' | 'VERY_SERIOUS';

  @IsString()
  @IsNotEmpty()
  @MaxLength(3000)
  situationDescription!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  studentVersion?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  pedagogicalCommitment?: string | null;

  @IsOptional()
  @IsBoolean()
  guardianNotified?: boolean;

  @IsOptional()
  @IsDateString()
  annotationDate?: string;
}

export class CreateLessonPlanDto {
  @IsInt()
  @Min(1)
  courseAssignmentId!: number;

  @IsInt()
  @Min(1990)
  @Max(2100)
  academicYear!: number;

  @IsInt()
  @Min(1)
  @Max(6)
  periodNumber!: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(250)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(3000)
  generalObjective?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(3000)
  methodologyNotes?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  bibliography?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  observations?: string | null;
}

export class AddLessonPlanUnitDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  unitNumber?: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(250)
  topicTitle!: string;

  @IsOptional()
  @IsString()
  @MaxLength(3000)
  contentDescription?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(3000)
  pedagogicalActivities?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  evaluationStrategy?: string | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(60)
  plannedHours?: number;

  @IsOptional()
  @IsDateString()
  executionDate?: string | null;
}

export class CreateVirtualActivityDto {
  @IsInt()
  @Min(1)
  courseAssignmentId!: number;

  @IsInt()
  @Min(1)
  @Max(6)
  periodNumber!: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(250)
  title!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  instructions!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  resourceUrl?: string | null;

  @IsOptional()
  @IsDateString()
  dueDate?: string | null;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class GradeActivitySubmissionDto {
  @IsNumber()
  @Min(0)
  @Max(100)
  score!: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  teacherFeedback?: string | null;
}

export class CreateOnlineEvaluationDto {
  @IsInt()
  @Min(1)
  courseAssignmentId!: number;

  @IsInt()
  @Min(1)
  @Max(6)
  periodNumber!: number;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  evaluationType?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(250)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string | null;

  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(240)
  durationMinutes?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  maxAttempts?: number;

  @IsOptional()
  @IsDateString()
  availableFrom?: string | null;

  @IsOptional()
  @IsDateString()
  availableUntil?: string | null;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class EvaluationOptionInputDto {
  @IsOptional()
  @IsString()
  @MaxLength(10)
  optionLabel?: string | null;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  optionText!: string;

  @IsBoolean()
  isCorrect!: boolean;
}

export class AddEvaluationQuestionDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(4)
  questionTypeId?: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  questionText!: string;

  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(100)
  points?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  displayOrder?: number;

  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => EvaluationOptionInputDto)
  options!: EvaluationOptionInputDto[];
}

export class CreateLiveClassDto {
  @IsInt()
  @Min(1)
  courseAssignmentId!: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(250)
  title!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  meetingUrl!: string;

  @IsDateString()
  scheduledStart!: string;

  @IsOptional()
  @IsDateString()
  scheduledEnd?: string | null;
}

export class SubmitStudentActivityDto {
  @ApiProperty({ example: 'Adjunto mi solución completa del taller.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  studentComment!: string;
}

export class StudentEvaluationAnswerDto {
  @IsInt()
  @Min(1)
  questionId!: number;

  @IsInt()
  @Min(1)
  selectedOptionId!: number;
}

export class SubmitStudentEvaluationDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => StudentEvaluationAnswerDto)
  answers!: StudentEvaluationAnswerDto[];
}
