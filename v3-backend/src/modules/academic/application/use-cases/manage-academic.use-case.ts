import { Injectable } from '@nestjs/common';
import {
  AcademicRepositoryPort,
} from '../../domain/ports/academic.repository.port';

@Injectable()
export class ManageAcademicUseCase {
  constructor(private readonly repository: AcademicRepositoryPort) {}

  listAreas(schoolId: bigint) {
    return this.repository.listAreas(schoolId);
  }
  saveArea(
    schoolId: bigint,
    input: Parameters<AcademicRepositoryPort['saveArea']>[1],
  ) {
    return this.repository.saveArea(schoolId, input);
  }
  deleteArea(schoolId: bigint, areaId: bigint) {
    return this.repository.deleteArea(schoolId, areaId);
  }

  listSubjects(schoolId: bigint) {
    return this.repository.listSubjects(schoolId);
  }
  saveSubject(
    schoolId: bigint,
    input: Parameters<AcademicRepositoryPort['saveSubject']>[1],
  ) {
    return this.repository.saveSubject(schoolId, input);
  }
  deleteSubject(schoolId: bigint, subjectId: bigint) {
    return this.repository.deleteSubject(schoolId, subjectId);
  }

  listStudyPlans(schoolId: bigint, academicYear: number) {
    return this.repository.listStudyPlans(schoolId, academicYear);
  }
  upsertStudyPlan(
    schoolId: bigint,
    input: Parameters<AcademicRepositoryPort['upsertStudyPlan']>[1],
  ) {
    return this.repository.upsertStudyPlan(schoolId, input);
  }
  deleteStudyPlan(schoolId: bigint, planId: bigint) {
    return this.repository.deleteStudyPlan(schoolId, planId);
  }

  listCourseAssignments(schoolId: bigint, academicYear: number) {
    return this.repository.listCourseAssignments(schoolId, academicYear);
  }
  saveCourseAssignment(
    schoolId: bigint,
    input: Parameters<AcademicRepositoryPort['saveCourseAssignment']>[1],
  ) {
    return this.repository.saveCourseAssignment(schoolId, input);
  }
  deleteCourseAssignment(schoolId: bigint, assignmentId: bigint) {
    return this.repository.deleteCourseAssignment(schoolId, assignmentId);
  }
  reassignTeacherCourses(
    schoolId: bigint,
    input: Parameters<AcademicRepositoryPort['reassignTeacherCourses']>[1],
  ) {
    return this.repository.reassignTeacherCourses(schoolId, input);
  }

  listStudents(schoolId: bigint, search?: string, limit?: number) {
    return this.repository.listStudents(
      schoolId,
      search?.trim(),
      Math.min(Math.max(limit ?? 250, 1), 500),
    );
  }
  saveStudent(
    schoolId: bigint,
    input: Parameters<AcademicRepositoryPort['saveStudent']>[1],
  ) {
    return this.repository.saveStudent(schoolId, input);
  }
  deleteStudent(schoolId: bigint, studentId: bigint) {
    return this.repository.deleteStudent(schoolId, studentId);
  }

  listFamilies(schoolId: bigint, search?: string) {
    return this.repository.listFamilies(schoolId, search?.trim());
  }
  saveFamily(
    schoolId: bigint,
    input: Parameters<AcademicRepositoryPort['saveFamily']>[1],
  ) {
    return this.repository.saveFamily(schoolId, input);
  }
  listStudentFamilies(schoolId: bigint, studentProfileId: bigint) {
    return this.repository.listStudentFamilies(schoolId, studentProfileId);
  }
  linkStudentFamily(
    schoolId: bigint,
    studentProfileId: bigint,
    input: Parameters<AcademicRepositoryPort['linkStudentFamily']>[2],
  ) {
    return this.repository.linkStudentFamily(schoolId, studentProfileId, input);
  }
  unlinkStudentFamily(
    schoolId: bigint,
    studentProfileId: bigint,
    linkId: bigint,
  ) {
    return this.repository.unlinkStudentFamily(
      schoolId,
      studentProfileId,
      linkId,
    );
  }

  listEnrollments(
    schoolId: bigint,
    options: Parameters<AcademicRepositoryPort['listEnrollments']>[1],
  ) {
    return this.repository.listEnrollments(schoolId, options);
  }
  saveEnrollment(
    schoolId: bigint,
    input: Parameters<AcademicRepositoryPort['saveEnrollment']>[1],
  ) {
    return this.repository.saveEnrollment(schoolId, input);
  }
  moveEnrollments(
    schoolId: bigint,
    input: Parameters<AcademicRepositoryPort['moveEnrollments']>[1],
  ) {
    return this.repository.moveEnrollments(schoolId, input);
  }

  listEnrollmentNovelties(schoolId: bigint, enrollmentId: bigint) {
    return this.repository.listEnrollmentNovelties(schoolId, enrollmentId);
  }
  recordEnrollmentNovelty(
    schoolId: bigint,
    enrollmentId: bigint,
    userId: bigint,
    input: Parameters<AcademicRepositoryPort['recordEnrollmentNovelty']>[3],
  ) {
    return this.repository.recordEnrollmentNovelty(
      schoolId,
      enrollmentId,
      userId,
      input,
    );
  }

  listReportedGradesSummary(
    schoolId: bigint,
    academicYear: number,
    periodNumber: number,
  ) {
    return this.repository.listReportedGradesSummary(
      schoolId,
      academicYear,
      periodNumber,
    );
  }
  listEnrollmentGrades(
    schoolId: bigint,
    enrollmentId: bigint,
    academicYear: number,
    periodNumber?: number,
  ) {
    return this.repository.listEnrollmentGrades(
      schoolId,
      enrollmentId,
      academicYear,
      periodNumber,
    );
  }
  adminUpdateGradeScore(
    schoolId: bigint,
    gradeId: bigint,
    academicYear: number,
    userId: bigint,
    input: Parameters<AcademicRepositoryPort['adminUpdateGradeScore']>[4],
  ) {
    return this.repository.adminUpdateGradeScore(
      schoolId,
      gradeId,
      academicYear,
      userId,
      input,
    );
  }
  transferStudentGrades(
    schoolId: bigint,
    input: Parameters<AcademicRepositoryPort['transferStudentGrades']>[1],
  ) {
    return this.repository.transferStudentGrades(schoolId, input);
  }

  listPeriodRecoveries(
    schoolId: bigint,
    academicYear: number,
    periodNumber?: number,
  ) {
    return this.repository.listPeriodRecoveries(
      schoolId,
      academicYear,
      periodNumber,
    );
  }
  savePeriodRecovery(
    schoolId: bigint,
    input: Parameters<AcademicRepositoryPort['savePeriodRecovery']>[1],
    userId?: bigint,
  ) {
    return this.repository.savePeriodRecovery(schoolId, input, userId);
  }

  calculateAndListHonorRoll(
    schoolId: bigint,
    academicYear: number,
    periodNumber: number,
    recalculate: boolean,
    options?: {
      honorScope?: number;
      topLimit?: number;
      mode?: 'PERIOD' | 'ANNUAL';
    },
  ) {
    return this.repository.calculateAndListHonorRoll(
      schoolId,
      academicYear,
      periodNumber,
      recalculate,
      options,
    );
  }

  getConsolidatedReport(
    schoolId: bigint,
    input: Parameters<AcademicRepositoryPort['getConsolidatedReport']>[1],
  ) {
    return this.repository.getConsolidatedReport(schoolId, input);
  }

  materializeAreaPeriodResults(
    schoolId: bigint,
    academicYear: number,
    periodNumber: number,
  ) {
    return this.repository.materializeAreaPeriodResults(
      schoolId,
      academicYear,
      periodNumber,
    );
  }

  renumberEnrollmentFolios(
    schoolId: bigint,
    academicYear: number,
    onlyActive = true,
  ) {
    return this.repository.renumberEnrollmentFolios(
      schoolId,
      academicYear,
      onlyActive,
    );
  }

  uppercaseAchievementStandards(schoolId: bigint, academicYear: number) {
    return this.repository.uppercaseAchievementStandards(
      schoolId,
      academicYear,
    );
  }
}
