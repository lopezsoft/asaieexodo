import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class UpdateTeacherSelfProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  middleName?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  lastName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  secondLastName?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  address?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string | null;

  @IsOptional()
  @IsEmail()
  @MaxLength(180)
  email?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  signatureUrl?: string | null;
}

export class UpsertTeacherColumnDto {
  @IsInt()
  @Min(1)
  dimensionId!: number;

  @IsInt()
  @Min(1)
  @Max(6)
  periodNumber!: number;

  @IsInt()
  @Min(1)
  @Max(30)
  columnNumber!: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  description!: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  weightPercentage!: number;

  @IsOptional()
  @IsDateString()
  activityDate?: string | null;
}

export class GradeItemInputDto {
  @IsInt()
  @Min(1)
  enrollmentId!: number;

  @IsInt()
  @Min(1)
  @Max(30)
  itemNumber!: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  score!: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  dimensionId?: number | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  gradebookColumnId?: number | null;
}

export class SaveGradeItemsBatchDto {
  @IsInt()
  @Min(1990)
  @Max(2100)
  academicYear!: number;

  @IsInt()
  @Min(1)
  @Max(6)
  periodNumber!: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => GradeItemInputDto)
  items!: GradeItemInputDto[];
}

export class AchievementVariantInputDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  nationalScaleId?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  code?: string | null;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  description!: string;
}

export class CreateAchievementsMultiScaleDto {
  @IsInt()
  @Min(1)
  gradeId!: number;

  @IsInt()
  @Min(1)
  subjectId!: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  dimensionId?: number | null;

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
  @MaxLength(30)
  indicatorType!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => AchievementVariantInputDto)
  variants!: AchievementVariantInputDto[];
}

export class AssignAchievementsBatchDto {
  @IsInt()
  @Min(1990)
  @Max(2100)
  academicYear!: number;

  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  academicGradeIds!: number[];

  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  achievementStandardIds!: number[];
}

export class SyncCourseAchievementsDto {
  @IsInt()
  @Min(1990)
  @Max(2100)
  academicYear!: number;

  @IsInt()
  @Min(1)
  @Max(6)
  periodNumber!: number;
}

export class TeacherLevelingRowInputDto {
  @IsInt()
  @Min(1)
  enrollmentId!: number;

  @IsInt()
  @Min(1)
  courseAssignmentId!: number;

  @IsInt()
  @Min(1)
  @Max(6)
  periodNumber!: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  previousScore!: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  recoveryScore!: number;

  @IsOptional()
  @IsDateString()
  recoveryDate?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  actNumber?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  observations?: string | null;
}

export class SaveLevelingsBatchDto {
  @IsInt()
  @Min(1990)
  @Max(2100)
  academicYear!: number;

  @IsIn(['PERIOD_RECOVERY', 'FINAL_RECOVERY'])
  recoveryType!: 'PERIOD_RECOVERY' | 'FINAL_RECOVERY';

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => TeacherLevelingRowInputDto)
  rows!: TeacherLevelingRowInputDto[];
}

export class SaveObserverExtendedDto {
  @IsOptional()
  @IsObject()
  observerModel5?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  observerModel3?: Record<
    string,
    { p1?: string; p2?: string; p3?: string; p4?: string }
  >;
}

export class TrackingFormatRowDto {
  @IsInt()
  @Min(1)
  studentProfileId!: number;

  @IsString()
  @MaxLength(1000)
  observations!: string;

  @IsBoolean()
  pv!: boolean;

  @IsBoolean()
  tv!: boolean;

  @IsBoolean()
  gw!: boolean;

  @IsBoolean()
  gf!: boolean;

  @IsBoolean()
  otherAccess!: boolean;

  @IsBoolean()
  ee!: boolean;

  @IsBoolean()
  internet!: boolean;

  @IsBoolean()
  tvService!: boolean;

  @IsBoolean()
  mobileData!: boolean;
}

export class SaveTrackingFormatBatchDto {
  @IsInt()
  @Min(1990)
  @Max(2100)
  academicYear!: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => TrackingFormatRowDto)
  rows!: TrackingFormatRowDto[];
}
