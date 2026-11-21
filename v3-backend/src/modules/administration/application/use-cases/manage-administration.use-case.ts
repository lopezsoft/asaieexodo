import { Injectable } from '@nestjs/common';
import {
  AdministrationRepositoryPort,
  AdministrativeStaffRecord,
  CampusEducationLevelRecord,
  CampusRecord,
  CampusShiftRecord,
  DashboardStatisticsResponse,
  GroupManagerRecord,
  PaginatedRecords,
  SaveAdministrativeStaffInput,
  SaveCampusInput,
  SaveTeacherInput,
  SchoolProfileRecord,
  TeacherProfileRecord,
  UpdateGroupManagerInput,
  UpdateSchoolProfileInput,
  UpsertGroupManagerInput,
} from '../../domain/ports/administration.repository.port';

@Injectable()
export class ManageAdministrationUseCase {
  constructor(
    private readonly repository: AdministrationRepositoryPort,
  ) {}

  getDashboardStatistics(
    schoolId: bigint,
    academicYear?: number,
  ): Promise<DashboardStatisticsResponse> {
    const targetYear = academicYear ?? new Date().getFullYear();
    return this.repository.getDashboardStatistics(schoolId, targetYear);
  }

  getSchoolProfile(schoolId: bigint): Promise<SchoolProfileRecord> {
    return this.repository.getSchoolProfile(schoolId);
  }

  updateSchoolProfile(
    schoolId: bigint,
    input: UpdateSchoolProfileInput,
  ): Promise<SchoolProfileRecord> {
    return this.repository.updateSchoolProfile(schoolId, input);
  }

  listCampuses(schoolId: bigint): Promise<CampusRecord[]> {
    return this.repository.listCampuses(schoolId);
  }

  createCampus(
    schoolId: bigint,
    input: SaveCampusInput,
  ): Promise<CampusRecord> {
    return this.repository.createCampus(schoolId, input);
  }

  updateCampus(
    schoolId: bigint,
    campusId: bigint,
    input: SaveCampusInput,
  ): Promise<CampusRecord> {
    return this.repository.updateCampus(schoolId, campusId, input);
  }

  deleteCampus(schoolId: bigint, campusId: bigint): Promise<void> {
    return this.repository.deleteCampus(schoolId, campusId);
  }

  listCampusShifts(
    schoolId: bigint,
    campusId: bigint,
  ): Promise<CampusShiftRecord[]> {
    return this.repository.listCampusShifts(schoolId, campusId);
  }

  assignCampusShift(
    schoolId: bigint,
    campusId: bigint,
    shiftId: bigint,
  ): Promise<CampusShiftRecord> {
    return this.repository.assignCampusShift(schoolId, campusId, shiftId);
  }

  removeCampusShift(
    schoolId: bigint,
    campusId: bigint,
    assignmentId: bigint,
  ): Promise<void> {
    return this.repository.removeCampusShift(schoolId, campusId, assignmentId);
  }

  listCampusEducationLevels(
    schoolId: bigint,
    campusId: bigint,
  ): Promise<CampusEducationLevelRecord[]> {
    return this.repository.listCampusEducationLevels(schoolId, campusId);
  }

  assignCampusEducationLevel(
    schoolId: bigint,
    campusId: bigint,
    educationLevelId: bigint,
  ): Promise<CampusEducationLevelRecord> {
    return this.repository.assignCampusEducationLevel(
      schoolId,
      campusId,
      educationLevelId,
    );
  }

  removeCampusEducationLevel(
    schoolId: bigint,
    campusId: bigint,
    assignmentId: bigint,
  ): Promise<void> {
    return this.repository.removeCampusEducationLevel(
      schoolId,
      campusId,
      assignmentId,
    );
  }

  listTeachers(
    schoolId: bigint,
    options?: { search?: string; onlyActive?: boolean; limit?: number; offset?: number },
  ): Promise<PaginatedRecords<TeacherProfileRecord>> {
    return this.repository.listTeachers(schoolId, {
      search: options?.search?.trim(),
      onlyActive: options?.onlyActive,
      limit: Math.min(Math.max(options?.limit ?? 100, 1), 500),
      offset: Math.max(options?.offset ?? 0, 0),
    });
  }

  createTeacher(
    schoolId: bigint,
    input: SaveTeacherInput,
  ): Promise<TeacherProfileRecord> {
    return this.repository.createTeacher(schoolId, input);
  }

  updateTeacher(
    schoolId: bigint,
    teacherId: bigint,
    input: SaveTeacherInput,
  ): Promise<TeacherProfileRecord> {
    return this.repository.updateTeacher(schoolId, teacherId, input);
  }

  deleteTeacher(schoolId: bigint, teacherId: bigint): Promise<void> {
    return this.repository.deleteTeacher(schoolId, teacherId);
  }

  listAdministrativeStaff(
    schoolId: bigint,
    options?: { search?: string; onlyActive?: boolean; limit?: number; offset?: number },
  ): Promise<PaginatedRecords<AdministrativeStaffRecord>> {
    return this.repository.listAdministrativeStaff(schoolId, {
      search: options?.search?.trim(),
      onlyActive: options?.onlyActive,
      limit: Math.min(Math.max(options?.limit ?? 100, 1), 500),
      offset: Math.max(options?.offset ?? 0, 0),
    });
  }

  createAdministrativeStaff(
    schoolId: bigint,
    input: SaveAdministrativeStaffInput,
  ): Promise<AdministrativeStaffRecord> {
    return this.repository.createAdministrativeStaff(schoolId, input);
  }

  updateAdministrativeStaff(
    schoolId: bigint,
    staffId: bigint,
    input: SaveAdministrativeStaffInput,
  ): Promise<AdministrativeStaffRecord> {
    return this.repository.updateAdministrativeStaff(schoolId, staffId, input);
  }

  deleteAdministrativeStaff(schoolId: bigint, staffId: bigint): Promise<void> {
    return this.repository.deleteAdministrativeStaff(schoolId, staffId);
  }

  listGroupManagers(
    schoolId: bigint,
    academicYear?: number,
  ): Promise<GroupManagerRecord[]> {
    return this.repository.listGroupManagers(
      schoolId,
      academicYear ?? new Date().getFullYear(),
    );
  }

  upsertGroupManager(
    schoolId: bigint,
    input: UpsertGroupManagerInput,
  ): Promise<GroupManagerRecord> {
    return this.repository.upsertGroupManager(schoolId, input);
  }

  updateGroupManager(
    schoolId: bigint,
    groupId: bigint,
    input: UpdateGroupManagerInput,
  ): Promise<GroupManagerRecord> {
    return this.repository.updateGroupManager(schoolId, groupId, input);
  }

  deleteGroupManager(schoolId: bigint, groupId: bigint): Promise<void> {
    return this.repository.deleteGroupManager(schoolId, groupId);
  }
}
