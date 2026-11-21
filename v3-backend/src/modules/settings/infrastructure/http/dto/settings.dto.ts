import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class UpsertAcademicYearDto {
  @ApiProperty({ example: 2026 })
  @IsInt()
  @Min(1990)
  @Max(2100)
  year!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  onlineEnrollmentClosedAt?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isOnlineEnrollmentOpen?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isClosed?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  reportCardSettings?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  certificateSettings?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  graduationActSettings?: Record<string, unknown>;
}

export class UpsertGradingRuleDto {
  @ApiProperty({ example: 2026 })
  @IsInt()
  @Min(1990)
  @Max(2100)
  academicYear!: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  gradeGroupId!: number;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(4)
  decimalsCount?: number;

  @ApiPropertyOptional({ example: 3.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  minPassingScore?: number;

  @ApiPropertyOptional({ example: 3.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  maxRecoveryScore?: number;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  failedAreasLimit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  failsAfterRecovery?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  promotionMode?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  usesWeightedAreas?: boolean;

  @ApiPropertyOptional({ example: 25 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  absenceFailPercentage?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  roundsPeriodScore?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  roundsFinalScore?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  promotionDate?: string | null;
}

export class SaveShiftDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  @Max(99)
  shiftCode!: number;

  @ApiProperty({ example: 'Mañana' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  name!: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class SaveEducationLevelDto {
  @ApiProperty({ example: 'PRIMARIA' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  levelCode!: string;

  @ApiProperty({ example: 'Básica Primaria' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional({ example: 'PRIM' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  abbreviation?: string | null;

  @ApiPropertyOptional({ example: 2 })
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

export class SaveGradeGroupDto {
  @ApiProperty({ example: 'Básica Primaria (1° a 5°)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isCycleEnd?: boolean;
}

export class SaveGradeDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  educationLevelId!: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  gradeGroupId?: number | null;

  @ApiProperty({ example: '01' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  gradeCode!: string;

  @ApiProperty({ example: 'Primero' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(99)
  displayOrder?: number;

  @ApiPropertyOptional({ example: '02' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  nextGradeCode?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class SaveAcademicPeriodDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  gradeGroupId?: number | null;

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

  @ApiProperty({ example: 'Primer Periodo' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  name!: string;

  @ApiProperty({ example: 25 })
  @IsNumber()
  @Min(0)
  @Max(100)
  weightPercentage!: number;

  @ApiProperty({ example: '2026-01-20' })
  @IsDateString()
  startDate!: string;

  @ApiProperty({ example: '2026-04-05' })
  @IsDateString()
  endDate!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  gradingOpenDate?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  gradingCloseDate?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  recoveryOpenDate?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  recoveryCloseDate?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isClosed?: boolean;
}

export class SaveGradingScaleDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  gradeGroupId?: number | null;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  nationalScaleId!: number;

  @ApiProperty({ example: 2026 })
  @IsInt()
  @Min(1990)
  @Max(2100)
  academicYear!: number;

  @ApiProperty({ example: 1.0 })
  @IsNumber()
  @Min(0)
  @Max(100)
  minScore!: number;

  @ApiProperty({ example: 2.99 })
  @IsNumber()
  @Min(0)
  @Max(100)
  maxScore!: number;

  @ApiPropertyOptional({ example: '1' })
  @IsOptional()
  @IsString()
  @MaxLength(5)
  rankOrder?: string | null;
}

export class SaveEvaluationDimensionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  gradeGroupId?: number | null;

  @ApiProperty({ example: 2026 })
  @IsInt()
  @Min(1990)
  @Max(2100)
  academicYear!: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  @Max(20)
  dimensionCode!: number;

  @ApiProperty({ example: 'Saber (Cognitivo)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name!: string;

  @ApiPropertyOptional({ example: 'COG' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  abbreviation?: string | null;

  @ApiProperty({ example: 40 })
  @IsNumber()
  @Min(0)
  @Max(100)
  weightPercentage!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isEditable?: boolean;
}

export class SaveDimensionColumnDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  @Max(30)
  columnNumber!: number;

  @ApiProperty({ example: 'Evaluación parcial 1' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  label!: string;

  @ApiProperty({ example: 50 })
  @IsNumber()
  @Min(0)
  @Max(100)
  weightPercentage!: number;
}

export class SaveObserverTemplateDto {
  @ApiProperty({ example: 'Modelo Institucional 2026' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  headerConfig?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class SaveObserverSectionDto {
  @ApiProperty({ example: 'Aspecto Convivencial' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isCoexistenceSection?: boolean;

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

export class SaveObserverCriteriaDto {
  @ApiProperty({ example: 'Cumple con el manual de convivencia institucional' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  description!: string;

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

export class UpdateBrandingSettingsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  headerLine1?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  headerLine2?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  footerText?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(150)
  directorName?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(30)
  directorDocument?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1024)
  directorSignatureUrl?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(150)
  secretaryName?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(30)
  secretaryDocument?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1024)
  secretarySignatureUrl?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1024)
  logoUrl?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1024)
  shieldUrl?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  settings?: Record<string, unknown>;
}

export class ToggleSchoolModuleDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  isActive!: boolean;
}

export class CleanupZeroGradesDto {
  @ApiProperty({ example: 2026 })
  @IsInt()
  @Min(1990)
  @Max(2100)
  academicYear!: number;
}
