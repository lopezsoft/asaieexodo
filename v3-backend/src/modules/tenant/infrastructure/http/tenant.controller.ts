import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiProperty,
  ApiPropertyOptional,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Roles } from '../../../../shared/infrastructure/http/decorators/security.decorators';
import { CommunityRole } from '../../../iam/domain/enums/community-role.enum';
import { ManageSchoolsUseCase } from '../../application/use-cases/manage-schools.use-case';

export class CreateSchoolRequestDto {
  @ApiPropertyOptional({ example: '323580006675', description: 'Código DANE oficial' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  daneCode?: string;

  @ApiPropertyOptional({ example: '812001234-5', description: 'NIT institucional' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  taxId?: string;

  @ApiProperty({ example: 'INSTITUCIÓN EDUCATIVA NUEVO HORIZONTE' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(250)
  name!: string;

  @ApiPropertyOptional({ example: 'IE NUEVO HORIZONTE' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  shortName?: string;

  @ApiPropertyOptional({ example: 'Rector Institucional' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  directorName?: string;

  @ApiPropertyOptional({ example: 'Secretaría Académica' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  secretaryName?: string;

  @ApiPropertyOptional({ example: 'Calle 10 # 20-30' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  address?: string;

  @ApiPropertyOptional({ example: '3001234567' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  phones?: string;

  @ApiPropertyOptional({ example: 'contacto@colegio.edu.co' })
  @IsOptional()
  @IsEmail()
  @MaxLength(180)
  email?: string;

  @ApiProperty({
    example: 'ie_nuevo_horizonte',
    description: 'Carpeta dedicada en AWS S3 para archivos de la institución',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9_-]{3,120}$/)
  storageFolder!: string;

  @ApiPropertyOptional({ example: 'ie_nuevo_horizonte' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  legacyDbName?: string;
}

@ApiTags('Tenants & Schools')
@ApiBearerAuth('jwt-auth')
@Roles(CommunityRole.SUPER_ADMIN)
@Controller('tenants/schools')
export class TenantController {
  constructor(private readonly manageSchoolsUseCase: ManageSchoolsUseCase) {}

  @Get()
  @ApiOperation({
    summary: 'Listar instituciones educativas activas (Solo SUPER_ADMIN)',
    description:
      'Retorna las instituciones educativas registradas en el esquema unificado `asaie_v3_unified` con su código DANE, carpeta de almacenamiento y estado de suscripción.',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado de instituciones educativas activas.',
  })
  async listActiveSchools(): Promise<Record<string, unknown>> {
    const schools = await this.manageSchoolsUseCase.listActiveSchools();
    return {
      success: true,
      total: schools.length,
      data: schools.map((school) => school.toPrimitives()),
    };
  }

  @Post()
  @ApiOperation({
    summary: 'Registrar una Institución Educativa (Solo SUPER_ADMIN)',
    description:
      'Registra un colegio dentro de la base de datos única PostgreSQL 17 habilitando su aislamiento automático mediante Row-Level Security (`school_id`).',
  })
  @ApiResponse({
    status: 201,
    description: 'Institución educativa registrada exitosamente.',
  })
  async registerSchool(
    @Body() payload: CreateSchoolRequestDto,
  ): Promise<Record<string, unknown>> {
    const school = await this.manageSchoolsUseCase.registerSchool(payload);
    return {
      success: true,
      data: school.toPrimitives(),
    };
  }
}
