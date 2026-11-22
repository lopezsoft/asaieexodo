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
  RequireAnyPermission,
  RequireModule,
  RequirePermissions,
} from '../../../../shared/infrastructure/http/decorators/security.decorators';
import { PositiveBigIntPipe } from '../../../../shared/infrastructure/http/pipes/positive-bigint.pipe';
import {
  RBAC_MODULES,
  RBAC_PERMISSIONS,
} from '../../../../shared/infrastructure/rbac/rbac-permissions.constants';
import { RbacPermissionsService } from '../../../../shared/infrastructure/rbac/rbac-permissions.service';
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

@ApiTags('Promotion, Final Book, Returning Enrollments & Year Closing')
@ApiBearerAuth('jwt-auth')
@Controller('promotion')
export class PromotionController {
  constructor(
    private readonly promotionUseCase: ManagePromotionUseCase,
    private readonly rbacPermissions: RbacPermissionsService,
  ) {}

  @Get('statuses')
  @RequireAnyPermission(
    RBAC_PERMISSIONS.PROMOTION_FINAL_BOOK_VIEW,
    RBAC_PERMISSIONS.ACADEMIC_ENROLLMENTS_VIEW,
    RBAC_PERMISSIONS.PORTAL_TEACHER_OWN,
  )
  async listStatuses() {
    return {
      success: true,
      data: await this.promotionUseCase.listPromotionStatuses(),
    };
  }

  @Get('records')
  @RequireModule(RBAC_MODULES.ACADEMIC_GRADES)
  @RequirePermissions(RBAC_PERMISSIONS.PROMOTION_FINAL_BOOK_VIEW)
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
  @RequireModule(RBAC_MODULES.ACADEMIC_GRADES)
  @RequirePermissions(RBAC_PERMISSIONS.PROMOTION_FINAL_BOOK_GENERATE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Generar libro final de calificaciones y actas de promoción bajo reglas SIEE Decreto 1290',
  })
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
  @RequireModule(RBAC_MODULES.ACADEMIC_GRADES)
  @RequirePermissions(RBAC_PERMISSIONS.PROMOTION_FINAL_BOOK_GENERATE)
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
  @RequireModule(RBAC_MODULES.ACADEMIC_GRADES)
  @RequirePermissions(RBAC_PERMISSIONS.PROMOTION_FINAL_BOOK_VIEW)
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
  @RequireModule(RBAC_MODULES.ACADEMIC_GRADES)
  @RequireAnyPermission(
    RBAC_PERMISSIONS.PROMOTION_RECORDS_COMMISSION_EDIT,
    RBAC_PERMISSIONS.PROMOTION_RECORDS_FOLIOS_EDIT,
  )
  async updateRecord(
    @CurrentUser() p: ActiveTenantContext,
    @Param('recordId', PositiveBigIntPipe) recordId: bigint,
    @Body() dto: UpdatePromotionRecordDto,
  ) {
    const editsCommissionFields =
      dto.promotionStatusId !== undefined ||
      dto.isCommissionPromoted !== undefined ||
      dto.isGraduated !== undefined;

    if (editsCommissionFields) {
      await this.rbacPermissions.assertAnyPermission(
        p.schoolId,
        p.userId,
        p.activeRole,
        [RBAC_PERMISSIONS.PROMOTION_RECORDS_COMMISSION_EDIT],
        'Se requiere el permiso promotion.records.commission_edit para modificar el estado de promoción, graduación o decisión de comisión.',
      );
    }

    const editsFolioFields =
      dto.diplomaNumber !== undefined || dto.graduationFolio !== undefined;

    if (editsFolioFields) {
      await this.rbacPermissions.assertAnyPermission(
        p.schoolId,
        p.userId,
        p.activeRole,
        [RBAC_PERMISSIONS.PROMOTION_RECORDS_FOLIOS_EDIT],
        'Se requiere el permiso promotion.records.folios_edit para editar número de diploma o folio de grado.',
      );
    }

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
  @RequireModule(RBAC_MODULES.ACADEMIC_GRADES)
  @RequirePermissions(RBAC_PERMISSIONS.PROMOTION_ADVANCE_EXECUTE)
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
  @RequireModule(RBAC_MODULES.ENROLLMENTS)
  @RequirePermissions(RBAC_PERMISSIONS.PROMOTION_RETURNING_ENROLL)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Matricular masivamente estudiantes antiguos al nuevo año lectivo',
  })
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
  @RequireAnyPermission(
    RBAC_PERMISSIONS.PROMOTION_FINAL_BOOK_VIEW,
    RBAC_PERMISSIONS.ACADEMIC_ENROLLMENTS_VIEW,
    RBAC_PERMISSIONS.ACADEMIC_GRADES_VIEW,
  )
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
  @RequireAnyPermission(
    RBAC_PERMISSIONS.PROMOTION_CERTIFICATE_HEADERS_WRITE,
    RBAC_PERMISSIONS.REPORTS_CERTIFICATES_GENERATE,
    RBAC_PERMISSIONS.PROMOTION_FINAL_BOOK_VIEW,
  )
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
  @RequireModule(RBAC_MODULES.INSTITUTIONAL_REPORTS)
  @RequirePermissions(RBAC_PERMISSIONS.PROMOTION_CERTIFICATE_HEADERS_WRITE)
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
  @RequireModule(RBAC_MODULES.ACADEMIC_GRADES)
  @RequirePermissions(RBAC_PERMISSIONS.PROMOTION_YEAR_CLOSE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cerrar o reabrir el año lectivo y sus periodos académicos',
  })
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
