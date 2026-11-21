import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class SaveSchoolElectionDto {
  @ApiProperty({ example: 2026 })
  @IsInt()
  @Min(1990)
  @Max(2100)
  academicYear!: number;

  @ApiProperty({ example: 'Elecciones Gobierno Escolar 2026' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  electionName!: string;

  @ApiProperty({ example: '2026-03-15' })
  @IsDateString()
  electionDate!: string;

  @ApiProperty({ example: '07:00' })
  @IsString()
  @Matches(/^\d{2}:\d{2}(:\d{2})?$/)
  startTime!: string;

  @ApiProperty({ example: '16:00' })
  @IsString()
  @Matches(/^\d{2}:\d{2}(:\d{2})?$/)
  endTime!: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  allowsBlankVote?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class SavePollingStationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  campusId?: number | null;

  @ApiProperty({ example: 'M-01' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  stationNumber!: string;

  @ApiProperty({ example: 'Mesa Principal Bachillerato' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  stationName!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(250)
  locationDescription?: string | null;

  @ApiPropertyOptional({ type: [Number] })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  allowedGrades?: number[];

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class AddElectionJuryDto {
  @ApiProperty({ example: 'Prof. Carlos Ramírez' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  fullName!: string;

  @ApiPropertyOptional({ example: 'JURADO PRESIDENTE' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  roleTitle?: string;
}

export class SaveElectionCandidateDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  candidacyTypeId!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  enrollmentId?: number | null;

  @ApiProperty({ example: '01' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  ballotNumber!: string;

  @ApiProperty({ example: 'Laura Valentina Gómez' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  candidateName!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  proposalText?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  photoUrl?: string | null;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isBlankVoteOption?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CastElectionVoteDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  candidacyTypeId!: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  candidateId!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  pollingStationId?: number | null;
}
