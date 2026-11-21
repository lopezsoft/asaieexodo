import { Injectable } from '@nestjs/common';
import {
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

  setAcademicYearClosedState(
    schoolId: bigint,
    dto: CloseAcademicYearDto,
  ): Promise<{ academicYear: number; isClosed: boolean; periodsUpdated: number }> {
    return this.repository.setAcademicYearClosedState(
      schoolId,
      dto.academicYear,
      dto.isClosed ?? true,
    );
  }
}
