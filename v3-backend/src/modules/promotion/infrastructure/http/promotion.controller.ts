import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ActiveTenantContext } from '../../../../shared/application/context/tenant-context.service';
import {
  CurrentUser,
  Roles,
} from '../../../../shared/infrastructure/http/decorators/security.decorators';
import { PositiveBigIntPipe } from '../../../../shared/infrastructure/http/pipes/positive-bigint.pipe';
import { CommunityRole } from '../../../iam/domain/enums/community-role.enum';
import { ManagePromotionUseCase } from '../../application/use-cases/manage-promotion.use-case';
import {
  AdvancePromotionDto,
  CloseAcademicYearDto,
  EnrollReturningStudentsDto,
  GenerateFinalBookDto,
  GenerateFinalRecoveriesDto,
  UpdateCertificateHeadersDto,
  UpdatePromotionRecordDto,
} from './dto/promotion.dto';

const READ_ROLES = [
  CommunityRole.SUPER_ADMIN,
  CommunityRole.SCHOOL_ADMIN,
  CommunityRole.RECTOR,
  CommunityRole.COORDINATOR,
  CommunityRole.SECRETARY,
  CommunityRole.TEACHER,
] as const;

const WRITE_ROLES = [
  CommunityRole.SUPER_ADMIN,
  CommunityRole.SCHOOL_ADMIN,
  CommunityRole.RECTOR,
  CommunityRole.COORDINATOR,
  CommunityRole.SECRETARY,
] as const;

const RECTOR_ROLES = [
  CommunityRole.SUPER_ADMIN,
  CommunityRole.SCHOOL_ADMIN,
  CommunityRole.RECTOR,
] as const;

@ApiTags('Promotion, Final Book, Returning Enrollments & Year Closing')
@ApiBearerAuth('jwt-auth')
@Controller('promotion')
export class PromotionController {
  constructor(private readonly promotionUseCase: ManagePromotionUseCase) {}

  @Get('statuses')
  @Roles(...READ_ROLES)
  async listStatuses() {
    return {
      success: true,
      data: await this.promotionUseCase.listPromotionStatuses(),
    };
  }

  @Get('records')
  @Roles(...READ_ROLES)
  async listRecords(
    @CurrentUser() p: ActiveTenantContext,
    @Query('academicYear') academicYear?: string,
    @Query('academicGroupId') academicGroupId?: string,
  ) {
    return {
      success: true,
      data: await this.promotionUseCase.listPromotionRecords(
        p.schoolId,
        this.parseYear(academicYear, p.academicYear),
        academicGroupId && /^\d+$/.test(academicGroupId)
          ? Number(academicGroupId)
          : undefined,
      ),
    };
  }

  @Post('generate-final-book')
  @Roles(...RECTOR_ROLES, CommunityRole.COORDINATOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generar libro final de calificaciones y actas de promoción bajo reglas SIEE Decreto 1290' })
  async generateFinalBook(
    @CurrentUser() p: ActiveTenantContext,
    @Body() dto: GenerateFinalBookDto,
  ) {
    return {
      success: true,
      data: await this.promotionUseCase.generateFinalBook(p.schoolId, dto),
    };
  }

  @Post('final-recoveries/generate')
  @Roles(...RECTOR_ROLES, CommunityRole.COORDINATOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Generar actas de nivelación/habilitación final únicamente para estudiantes elegibles SIEE (0 < áreas reprobadas < límite)',
  })
  async generateFinalRecoveries(
    @CurrentUser() p: ActiveTenantContext,
    @Body() dto: GenerateFinalRecoveriesDto,
  ) {
    return {
      success: true,
      data: await this.promotionUseCase.generateFinalRecoveries(p.schoolId, dto),
    };
  }

  @Get('final-sabana')
  @Roles(...READ_ROLES)
  @ApiOperation({
    summary:
      'Consultar sábana final anual consolidada por grupo con notas definitivas, nivelaciones finales y estado de promoción',
  })
  async getFinalSabana(
    @CurrentUser() p: ActiveTenantContext,
    @Query('academicYear') academicYear?: string,
    @Query('academicGroupId') academicGroupId?: string,
  ) {
    return {
      success: true,
      data: await this.promotionUseCase.getFinalSabana(
        p.schoolId,
        this.parseYear(academicYear, p.academicYear),
        academicGroupId && /^\d+$/.test(academicGroupId)
          ? Number(academicGroupId)
          : undefined,
      ),
    };
  }

  @Patch('records/:recordId')
  @Roles(...WRITE_ROLES)
  async updateRecord(
    @CurrentUser() p: ActiveTenantContext,
    @Param('recordId', PositiveBigIntPipe) recordId: bigint,
    @Body() dto: UpdatePromotionRecordDto,
  ) {
    return {
      success: true,
      data: await this.promotionUseCase.updatePromotionRecord(
        p.schoolId,
        recordId,
        dto,
      ),
    };
  }

  @Post('advance')
  @Roles(...RECTOR_ROLES, CommunityRole.COORDINATOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Registrar promoción anticipada de estudiante' })
  async applyAdvancePromotion(
    @CurrentUser() p: ActiveTenantContext,
    @Body() dto: AdvancePromotionDto,
  ) {
    return {
      success: true,
      data: await this.promotionUseCase.applyAdvancePromotion(p.schoolId, dto),
    };
  }

  @Post('enroll-returning')
  @Roles(...WRITE_ROLES)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Matricular masivamente estudiantes antiguos al nuevo año lectivo' })
  async enrollReturning(
    @CurrentUser() p: ActiveTenantContext,
    @Body() dto: EnrollReturningStudentsDto,
  ) {
    return {
      success: true,
      data: await this.promotionUseCase.enrollReturningStudents(p.schoolId, dto),
    };
  }

  @Get('academic-history/:studentProfileId')
  @Roles(...READ_ROLES)
  async getAcademicHistory(
    @CurrentUser() p: ActiveTenantContext,
    @Param('studentProfileId', PositiveBigIntPipe) studentProfileId: bigint,
  ) {
    return {
      success: true,
      data: await this.promotionUseCase.getStudentAcademicHistory(
        p.schoolId,
        studentProfileId,
      ),
    };
  }

  @Get('certificate-headers')
  @Roles(...READ_ROLES)
  async getCertificateHeaders(
    @CurrentUser() p: ActiveTenantContext,
    @Query('academicYear') academicYear?: string,
  ) {
    return {
      success: true,
      data: await this.promotionUseCase.getCertificateHeaders(
        p.schoolId,
        this.parseYear(academicYear, p.academicYear),
      ),
    };
  }

  @Patch('certificate-headers')
  @Roles(...RECTOR_ROLES, CommunityRole.SECRETARY)
  async updateCertificateHeaders(
    @CurrentUser() p: ActiveTenantContext,
    @Body() dto: UpdateCertificateHeadersDto,
  ) {
    return {
      success: true,
      data: await this.promotionUseCase.updateCertificateHeaders(p.schoolId, dto),
    };
  }

  @Post('close-year')
  @Roles(...RECTOR_ROLES)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cerrar o reabrir el año lectivo y sus periodos académicos' })
  async closeYear(
    @CurrentUser() p: ActiveTenantContext,
    @Body() dto: CloseAcademicYearDto,
  ) {
    return {
      success: true,
      data: await this.promotionUseCase.setAcademicYearClosedState(
        p.schoolId,
        dto,
      ),
    };
  }

  private parseYear(raw: string | undefined, fallback: number): number {
    return raw && /^\d{4}$/.test(raw) ? Number(raw) : fallback;
  }
}
