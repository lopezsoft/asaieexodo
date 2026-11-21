import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class SaveAcademicAreaDto {
  @ApiProperty({ example: 'Matemáticas' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @ApiPropertyOptional({ example: 'MAT' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  abbreviation?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  failsSchoolYear?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(99)
  displayOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class SaveSubjectDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  academicAreaId!: number;

  @ApiProperty({ example: 'Álgebra y Geometría' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @ApiPropertyOptional({ example: 'ALG' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  abbreviation?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isElective?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(99)
  displayOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpsertStudyPlanDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  campusId?: number | null;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  gradeId!: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  subjectId!: number;

  @ApiProperty({ example: 2026 })
  @IsInt()
  @Min(1990)
  @Max(2100)
  academicYear!: number;

  @ApiProperty({ example: 4.5 })
  @IsNumber()
  @Min(0.5)
  @Max(40)
  weeklyHours!: number;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  areaWeightPercentage!: number;
}

export class SaveCourseAssignmentDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  campusId!: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  shiftId!: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  gradeId!: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  academicGroupId!: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  subjectId!: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  teacherProfileId!: number;

  @ApiProperty({ example: 2026 })
  @IsInt()
  @Min(1990)
  @Max(2100)
  academicYear!: number;

  @ApiProperty({ example: 4.5 })
  @IsNumber()
  @Min(0.5)
  @Max(40)
  weeklyHours!: number;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  areaWeightPercentage!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ReassignTeacherCoursesDto {
  @ApiProperty({ example: 2026 })
  @IsInt()
  @Min(1990)
  @Max(2100)
  academicYear!: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  fromTeacherId!: number;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  toTeacherId!: number;
}

export class SaveStudentProfileDto {
  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  @Min(1)
  documentTypeId?: number | null;

  @ApiProperty({ example: '1088765432' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  documentNumber!: string;

  @ApiProperty({ example: 'Sofía' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  firstName!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80)
  middleName?: string | null;

  @ApiProperty({ example: 'Ramírez' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  lastName!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80)
  secondLastName?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  genderId?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  birthDate?: string | null;

  @ApiPropertyOptional({ example: 'O+' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  bloodType?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  address?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  suburb?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  zoneId?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(5)
  socioeconomicStratum?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(20)
  sisbenScore?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  @MaxLength(180)
  email?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class SaveFamilyProfileDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  documentTypeId?: number | null;

  @ApiProperty({ example: '52987654' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  documentNumber!: string;

  @ApiProperty({ example: 'Martha Cecilia Pérez' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  fullName!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  mobilePhone?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  @MaxLength(180)
  email?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  address?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(150)
  occupation?: string | null;
}

export class LinkStudentFamilyDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  familyProfileId!: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  relationshipTypeId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPrimaryGuardian?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isFinancialResponsible?: boolean;
}

export class SaveEnrollmentDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  studentProfileId!: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  campusId!: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  shiftId!: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  gradeId!: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  academicGroupId!: number;

  @ApiProperty({ example: 2026 })
  @IsInt()
  @Min(1990)
  @Max(2100)
  academicYear!: number;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  @Min(1)
  enrollmentStatusId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(40)
  registrationNumber?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(40)
  folioNumber?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isRepeatingGrade?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isNewStudent?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  observations?: string | null;
}

export class MoveEnrollmentsDto {
  @ApiProperty({ type: [Number] })
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  enrollmentIds!: number[];

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  targetCampusId!: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  targetShiftId!: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  targetGradeId!: number;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  targetGroupId!: number;
}

export class RecordEnrollmentNoveltyDto {
  @ApiProperty({ example: 4 })
  @IsInt()
  @Min(1)
  enrollmentStatusId!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  noveltyDate?: string;

  @ApiProperty({ example: 'Traslado de ciudad por motivo familiar' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  reason!: string;
}

export class AdminUpdateGradeScoreDto {
  @ApiProperty({ example: 2026 })
  @IsInt()
  @Min(1990)
  @Max(2100)
  academicYear!: number;

  @ApiProperty({ example: 4.2 })
  @IsNumber()
  @Min(0)
  @Max(100)
  finalScore!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  recoveryScore?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  levelingScore?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isLocked?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

export class TransferStudentGradesDto {
  @ApiProperty({ example: 2026 })
  @IsInt()
  @Min(1990)
  @Max(2100)
  academicYear!: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  enrollmentId!: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  fromCourseAssignmentId!: number;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  toCourseAssignmentId!: number;
}

export class SavePeriodRecoveryDto {
  @ApiProperty({ example: 2026 })
  @IsInt()
  @Min(1990)
  @Max(2100)
  academicYear!: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  enrollmentId!: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  courseAssignmentId!: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'Obligatorio para PERIOD_RECOVERY (1..6); opcional/nulo para FINAL_RECOVERY',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(6)
  periodNumber?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(30)
  actNumber?: string | null;

  @ApiProperty({ example: 2.3 })
  @IsNumber()
  @Min(0)
  @Max(100)
  previousScore!: number;

  @ApiProperty({ example: 3.2 })
  @IsNumber()
  @Min(0)
  @Max(100)
  recoveryScore!: number;

  @ApiPropertyOptional({ example: 'PERIOD_RECOVERY' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  recoveryType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  observations?: string | null;
}

export class HonorRollRequestDto {
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

  @ApiPropertyOptional({
    example: 1,
    description: '1=Grupo, 2=Grado, 3=Sede, 4=Nivel Educativo, 5=Institución',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  honorScope?: number;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  topLimit?: number;
}

export class MaterializeAreaResultsDto {
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
}

export class RenumberFoliosDto {
  @ApiProperty({ example: 2026 })
  @IsInt()
  @Min(1990)
  @Max(2100)
  academicYear!: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  onlyActive?: boolean;
}

export class UppercaseAchievementsDto {
  @ApiProperty({ example: 2026 })
  @IsInt()
  @Min(1990)
  @Max(2100)
  academicYear!: number;
}
