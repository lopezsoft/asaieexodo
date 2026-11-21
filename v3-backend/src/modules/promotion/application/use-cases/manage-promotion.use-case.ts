import { Injectable } from '@nestjs/common';
import {
  CloseAcademicYearResult,
  FinalSabanaReport,
  PromotionRecordView,
  PromotionRepositoryPort,
  PromotionStatusOption,
  StudentAcademicHistoryYear,
  YearCertificateHeadersRecord,
} from '../../domain/ports/promotion.repository.port';
import {
  AdvancePromotionDto,
  CloseAcademicYearDto,
  EnrollReturningStudentsDto,
  GenerateFinalBookDto,
  GenerateFinalRecoveriesDto,
  UpdateCertificateHeadersDto,
  UpdatePromotionRecordDto,
} from '../../infrastructure/http/dto/promotion.dto';

@Injectable()
export class ManagePromotionUseCase {
  constructor(private readonly repository: PromotionRepositoryPort) {}

  listPromotionStatuses(): Promise<PromotionStatusOption[]> {
    return this.repository.listPromotionStatuses();
  }

  listPromotionRecords(
    schoolId: bigint,
    academicYear: number,
    academicGroupId?: number,
  ): Promise<PromotionRecordView[]> {
    return this.repository.listPromotionRecords(
      schoolId,
      academicYear,
      academicGroupId,
    );
  }

  generateFinalBook(
    schoolId: bigint,
    dto: GenerateFinalBookDto,
  ): Promise<{ processedCount: number; records: PromotionRecordView[] }> {
    return this.repository.generateFinalBook(schoolId, dto);
  }

  updatePromotionRecord(
    schoolId: bigint,
    recordId: bigint,
    dto: UpdatePromotionRecordDto,
  ): Promise<PromotionRecordView> {
    return this.repository.updatePromotionRecord(schoolId, recordId, dto);
  }

  applyAdvancePromotion(
    schoolId: bigint,
    dto: AdvancePromotionDto,
  ): Promise<PromotionRecordView> {
    return this.repository.applyAdvancePromotion(schoolId, dto);
  }

  enrollReturningStudents(
    schoolId: bigint,
    dto: EnrollReturningStudentsDto,
  ): Promise<{ enrolledCount: number; skippedCount: number }> {
    return this.repository.enrollReturningStudents(schoolId, dto);
  }

  getStudentAcademicHistory(
    schoolId: bigint,
    studentProfileId: bigint,
  ): Promise<StudentAcademicHistoryYear[]> {
    return this.repository.getStudentAcademicHistory(schoolId, studentProfileId);
  }

  getCertificateHeaders(
    schoolId: bigint,
    academicYear: number,
  ): Promise<YearCertificateHeadersRecord> {
    return this.repository.getCertificateHeaders(schoolId, academicYear);
  }

  updateCertificateHeaders(
    schoolId: bigint,
    dto: UpdateCertificateHeadersDto,
  ): Promise<YearCertificateHeadersRecord> {
    return this.repository.updateCertificateHeaders(schoolId, dto);
  }

  generateFinalRecoveries(
    schoolId: bigint,
    dto: GenerateFinalRecoveriesDto,
  ): Promise<{
    eligibleStudentsCount: number;
    generatedRecordsCount: number;
    skippedExistingCount: number;
  }> {
    return this.repository.generateFinalRecoveries(schoolId, dto);
  }

  getFinalSabana(
    schoolId: bigint,
    academicYear: number,
    academicGroupId?: number,
  ): Promise<FinalSabanaReport> {
    return this.repository.getFinalSabana(
      schoolId,
      academicYear,
      academicGroupId,
    );
  }

  setAcademicYearClosedState(
    schoolId: bigint,
    dto: CloseAcademicYearDto,
  ): Promise<CloseAcademicYearResult> {
    return this.repository.setAcademicYearClosedState(
      schoolId,
      dto.academicYear,
      dto.isClosed ?? true,
      { cloneToNextYear: dto.cloneToNextYear ?? true },
    );
  }
}
