import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class GenerateFinalBookDto {
  @ApiProperty({ example: 2026 })
  @IsInt()
  @Min(1990)
  @Max(2100)
  academicYear!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  academicGroupId?: number;

  @ApiPropertyOptional({ example: 'ACTA-2026-01' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  actNumber?: string | null;
}

export class UpdatePromotionRecordDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  promotionStatusId?: number;

  @ApiPropertyOptional({ example: 'ACTA-2026-02' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  actNumber?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isCommissionPromoted?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isGraduated?: boolean;

  @ApiPropertyOptional({ example: 'DIP-2026-101' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  diplomaNumber?: string | null;

  @ApiPropertyOptional({ example: 'FOL-045' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  graduationFolio?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1500)
  observations?: string | null;
}

export class AdvancePromotionDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  enrollmentId!: number;

  @ApiProperty({ example: 2026 })
  @IsInt()
  @Min(1990)
  @Max(2100)
  academicYear!: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  promotionStatusId?: number;

  @ApiPropertyOptional({ example: 'ACTA-ANT-01' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  actNumber?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1500)
  observations?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  targetCampusId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  targetShiftId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  targetGradeId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  targetGroupId?: number;
}

export class EnrollReturningStudentsDto {
  @ApiProperty({ example: 2026 })
  @IsInt()
  @Min(1990)
  @Max(2100)
  fromYear!: number;

  @ApiProperty({ example: 2027 })
  @IsInt()
  @Min(1990)
  @Max(2100)
  toYear!: number;

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

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  targetGroupId!: number;
}

export class UpdateCertificateHeadersDto {
  @ApiProperty({ example: 2026 })
  @IsInt()
  @Min(1990)
  @Max(2100)
  academicYear!: number;

  @ApiProperty()
  @IsObject()
  certificateSettings!: Record<string, unknown>;

  @ApiProperty()
  @IsObject()
  graduationActSettings!: Record<string, unknown>;
}

export class GenerateFinalRecoveriesDto {
  @ApiProperty({ example: 2026 })
  @IsInt()
  @Min(1990)
  @Max(2100)
  academicYear!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  academicGroupId?: number;
}

export class CloseAcademicYearDto {
  @ApiProperty({ example: 2026 })
  @IsInt()
  @Min(1990)
  @Max(2100)
  academicYear!: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isClosed?: boolean;

  @ApiPropertyOptional({
    default: true,
    description:
      'Si es true al cerrar el año, crea el año lectivo siguiente y clona las 7 tablas maestras (escalas, dimensiones, reglas SIEE, plan de estudios, asignaturas/áreas, planta docente y periodos).',
  })
  @IsOptional()
  @IsBoolean()
  cloneToNextYear?: boolean;
}
