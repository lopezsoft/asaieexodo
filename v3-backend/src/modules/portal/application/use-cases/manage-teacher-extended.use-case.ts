import { Injectable } from '@nestjs/common';
import {
  GradeAchievementAssignedRow,
  ObserverExtendedData,
  StudentTrackingFormatRow,
  TeacherExtendedRepositoryPort,
  TeacherGradebookColumnRow,
  TeacherLevelingListView,
  TeacherPeriodSummary,
  TeacherSelfProfile,
} from '../../domain/ports/teacher-extended.repository.port';
import {
  AssignAchievementsBatchDto,
  CreateAchievementsMultiScaleDto,
  SaveGradeItemsBatchDto,
  SaveLevelingsBatchDto,
  SaveObserverExtendedDto,
  SaveTrackingFormatBatchDto,
  SyncCourseAchievementsDto,
  UpdateTeacherSelfProfileDto,
  UpsertTeacherColumnDto,
} from '../../infrastructure/http/dto/teacher-extended.dto';

@Injectable()
export class ManageTeacherExtendedUseCase {
  constructor(private readonly repository: TeacherExtendedRepositoryPort) {}

  listTeacherPeriods(
    schoolId: bigint,
    academicYear: number,
  ): Promise<TeacherPeriodSummary[]> {
    return this.repository.listTeacherPeriods(schoolId, academicYear);
  }

  getTeacherSelfProfile(
    schoolId: bigint,
    userId: bigint,
  ): Promise<TeacherSelfProfile | null> {
    return this.repository.getTeacherSelfProfile(schoolId, userId);
  }

  updateTeacherSelfProfile(
    schoolId: bigint,
    userId: bigint,
    dto: UpdateTeacherSelfProfileDto,
  ): Promise<TeacherSelfProfile> {
    return this.repository.updateTeacherSelfProfile(schoolId, userId, dto);
  }

  listCourseColumns(
    schoolId: bigint,
    courseAssignmentId: bigint,
    periodNumber: number,
  ): Promise<TeacherGradebookColumnRow[]> {
    return this.repository.listCourseColumns(
      schoolId,
      courseAssignmentId,
      periodNumber,
    );
  }

  upsertCourseColumn(
    schoolId: bigint,
    courseAssignmentId: bigint,
    dto: UpsertTeacherColumnDto,
  ): Promise<TeacherGradebookColumnRow> {
    return this.repository.upsertCourseColumn(schoolId, courseAssignmentId, dto);
  }

  deleteCourseColumn(schoolId: bigint, columnId: bigint): Promise<void> {
    return this.repository.deleteCourseColumn(schoolId, columnId);
  }

  listCourseGradeItems(
    schoolId: bigint,
    courseAssignmentId: bigint,
    academicYear: number,
    periodNumber: number,
  ) {
    return this.repository.listCourseGradeItems(
      schoolId,
      courseAssignmentId,
      academicYear,
      periodNumber,
    );
  }

  saveGradeItemsBatch(
    schoolId: bigint,
    courseAssignmentId: bigint,
    dto: SaveGradeItemsBatchDto,
  ): Promise<{ savedCount: number }> {
    return this.repository.saveGradeItemsBatch(schoolId, courseAssignmentId, dto);
  }

  createAchievementsMultiScale(
    schoolId: bigint,
    dto: CreateAchievementsMultiScaleDto,
  ): Promise<{ createdCount: number }> {
    return this.repository.createAchievementsMultiScale(schoolId, dto);
  }

  listCourseAssignedAchievements(
    schoolId: bigint,
    courseAssignmentId: bigint,
    academicYear: number,
    periodNumber: number,
  ): Promise<GradeAchievementAssignedRow[]> {
    return this.repository.listCourseAssignedAchievements(
      schoolId,
      courseAssignmentId,
      academicYear,
      periodNumber,
    );
  }

  assignAchievementsBatch(
    schoolId: bigint,
    dto: AssignAchievementsBatchDto,
  ): Promise<{ assignedCount: number }> {
    return this.repository.assignAchievementsBatch(schoolId, dto);
  }

  unassignAchievement(
    schoolId: bigint,
    academicYear: number,
    linkId: bigint,
  ): Promise<void> {
    return this.repository.unassignAchievement(schoolId, academicYear, linkId);
  }

  syncCourseAchievements(
    schoolId: bigint,
    courseAssignmentId: bigint,
    dto: SyncCourseAchievementsDto,
  ): Promise<{ syncedCount: number }> {
    return this.repository.syncCourseAchievements(
      schoolId,
      courseAssignmentId,
      dto,
    );
  }

  listPeriodicLevelings(
    schoolId: bigint,
    courseAssignmentId: bigint,
    academicYear: number,
    periodNumber: number,
  ): Promise<TeacherLevelingListView> {
    return this.repository.listPeriodicLevelings(
      schoolId,
      courseAssignmentId,
      academicYear,
      periodNumber,
    );
  }

  listFinalLevelings(
    schoolId: bigint,
    userId: bigint,
    role: string,
    academicYear: number,
  ): Promise<TeacherLevelingListView> {
    return this.repository.listFinalLevelings(schoolId, userId, role, academicYear);
  }

  saveLevelingsBatch(
    schoolId: bigint,
    dto: SaveLevelingsBatchDto,
  ): Promise<{ savedCount: number }> {
    return this.repository.saveLevelingsBatch(schoolId, dto);
  }

  getObserverExtendedData(
    schoolId: bigint,
    enrollmentId: bigint,
  ): Promise<ObserverExtendedData> {
    return this.repository.getObserverExtendedData(schoolId, enrollmentId);
  }

  saveObserverExtendedData(
    schoolId: bigint,
    enrollmentId: bigint,
    dto: SaveObserverExtendedDto,
  ): Promise<ObserverExtendedData> {
    return this.repository.saveObserverExtendedData(schoolId, enrollmentId, dto);
  }

  listTrackingFormat(
    schoolId: bigint,
    academicGroupId: bigint,
    academicYear: number,
  ): Promise<StudentTrackingFormatRow[]> {
    return this.repository.listTrackingFormat(
      schoolId,
      academicGroupId,
      academicYear,
    );
  }

  saveTrackingFormatBatch(
    schoolId: bigint,
    dto: SaveTrackingFormatBatchDto,
  ): Promise<{ savedCount: number }> {
    return this.repository.saveTrackingFormatBatch(
      schoolId,
      dto.academicYear,
      dto.rows,
    );
  }
}
