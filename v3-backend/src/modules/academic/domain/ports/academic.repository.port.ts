export interface AcademicAreaRecord {
  readonly id: number;
  readonly name: string;
  readonly abbreviation: string | null;
  readonly failsSchoolYear: boolean;
  readonly displayOrder: number;
  readonly isActive: boolean;
}

export interface SubjectRecord {
  readonly id: number;
  readonly academicAreaId: number;
  readonly academicAreaName: string;
  readonly name: string;
  readonly abbreviation: string | null;
  readonly isElective: boolean;
  readonly displayOrder: number;
  readonly isActive: boolean;
}

export interface StudyPlanRecord {
  readonly id: number;
  readonly campusId: number | null;
  readonly campusName: string | null;
  readonly gradeId: number;
  readonly gradeName: string;
  readonly subjectId: number;
  readonly subjectName: string;
  readonly academicAreaName: string;
  readonly academicYear: number;
  readonly weeklyHours: number;
  readonly areaWeightPercentage: number;
  readonly isActive: boolean;
}

export interface CourseAssignmentRecord {
  readonly id: number;
  readonly campusId: number;
  readonly campusName: string;
  readonly shiftId: number;
  readonly shiftName: string;
  readonly gradeId: number;
  readonly gradeName: string;
  readonly academicGroupId: number;
  readonly groupCode: string;
  readonly subjectId: number;
  readonly subjectName: string;
  readonly academicAreaName: string;
  readonly teacherProfileId: number;
  readonly teacherName: string;
  readonly academicYear: number;
  readonly weeklyHours: number;
  readonly areaWeightPercentage: number;
  readonly isActive: boolean;
}

export interface StudentProfileRecord {
  readonly id: number;
  readonly documentTypeId: number | null;
  readonly documentTypeCode: string | null;
  readonly documentNumber: string;
  readonly firstName: string;
  readonly middleName: string | null;
  readonly lastName: string;
  readonly secondLastName: string | null;
  readonly fullName: string;
  readonly genderId: number | null;
  readonly birthDate: string | null;
  readonly bloodType: string | null;
  readonly address: string | null;
  readonly suburb: string | null;
  readonly zoneId: number | null;
  readonly socioeconomicStratum: string | null;
  readonly sisbenScore: string | null;
  readonly phone: string | null;
  readonly email: string | null;
  readonly isActive: boolean;
}

export interface FamilyProfileRecord {
  readonly id: number;
  readonly documentTypeId: number | null;
  readonly documentNumber: string;
  readonly fullName: string;
  readonly phone: string | null;
  readonly mobilePhone: string | null;
  readonly email: string | null;
  readonly address: string | null;
  readonly occupation: string | null;
  readonly isActive: boolean;
}

export interface StudentFamilyLinkRecord {
  readonly id: number;
  readonly studentProfileId: number;
  readonly familyProfileId: number;
  readonly familyFullName: string;
  readonly familyDocumentNumber: string;
  readonly familyPhone: string | null;
  readonly relationshipTypeId: number;
  readonly relationshipName: string;
  readonly isPrimaryGuardian: boolean;
  readonly isFinancialResponsible: boolean;
}

export interface EnrollmentRecord {
  readonly id: number;
  readonly studentProfileId: number;
  readonly studentDocumentNumber: string;
  readonly studentFullName: string;
  readonly campusId: number;
  readonly campusName: string;
  readonly shiftId: number;
  readonly shiftName: string;
  readonly gradeId: number;
  readonly gradeName: string;
  readonly academicGroupId: number;
  readonly groupCode: string;
  readonly enrollmentStatusId: number;
  readonly enrollmentStatusName: string;
  readonly academicYear: number;
  readonly registrationNumber: string | null;
  readonly folioNumber: string | null;
  readonly enrollmentDate: string;
  readonly withdrawalDate: string | null;
  readonly isRepeatingGrade: boolean;
  readonly isNewStudent: boolean;
  readonly observations: string | null;
}

export interface EnrollmentNoveltyRecord {
  readonly id: number;
  readonly enrollmentId: number;
  readonly enrollmentStatusId: number;
  readonly enrollmentStatusName: string;
  readonly noveltyDate: string;
  readonly reason: string;
  readonly createdAt: string;
}

export interface ReportedCourseSummary {
  readonly courseAssignmentId: number;
  readonly teacherName: string;
  readonly subjectName: string;
  readonly gradeName: string;
  readonly groupCode: string;
  readonly campusName: string;
  readonly enrolledStudents: number;
  readonly gradedStudents: number;
  readonly completionPercentage: number;
}

export interface EnrollmentGradeRow {
  readonly id: number;
  readonly academicYear: number;
  readonly enrollmentId: number;
  readonly courseAssignmentId: number;
  readonly subjectName: string;
  readonly teacherName: string;
  readonly periodId: number;
  readonly periodNumber: number;
  readonly finalScore: number;
  readonly recoveryScore: number;
  readonly levelingScore: number;
  readonly effectiveScore: number;
  readonly justifiedAbsences: number;
  readonly unjustifiedAbsences: number;
  readonly isLocked: boolean;
}

export interface PeriodRecoveryRecord {
  readonly id: number;
  readonly academicYear: number;
  readonly enrollmentId: number;
  readonly studentFullName: string;
  readonly courseAssignmentId: number;
  readonly subjectName: string;
  readonly periodNumber: number | null;
  readonly actNumber: string | null;
  readonly previousScore: number;
  readonly recoveryScore: number;
  readonly recoveryType: string;
  readonly recoveryDate: string;
  readonly observations: string | null;
}

export interface HonorRollRecord {
  readonly id: number;
  readonly academicYear: number;
  readonly enrollmentId: number;
  readonly studentFullName: string;
  readonly studentDocumentNumber: string;
  readonly academicGroupId: number;
  readonly gradeName: string;
  readonly groupCode: string;
  readonly campusName: string;
  readonly periodNumber: number;
  readonly averageScore: number;
  readonly totalScore: number | null;
  readonly maxScore: number | null;
  readonly minScore: number | null;
  readonly groupRank: number;
  readonly groupTotalStudents: number | null;
  readonly gradeRank: number | null;
  readonly failedSubjectsCount: number;
  readonly isHonorRoll: boolean;
  readonly honorRollRank: number | null;
  readonly honorRollScope: number | null;
}

export interface ConsolidatedColumn {
  readonly key: string;
  readonly entityId: number;
  readonly name: string;
  readonly abbreviation: string | null;
  readonly areaName?: string;
}

export interface ConsolidatedStudentRow {
  readonly enrollmentId: number;
  readonly studentDocumentNumber: string;
  readonly studentFullName: string;
  readonly gradeName: string;
  readonly groupCode: string;
  readonly averageScore: number;
  readonly failedCount: number;
  readonly cells: Record<
    string,
    {
      readonly score: number;
      readonly isFailed: boolean;
      readonly periodScores?: Record<number, number>;
    }
  >;
}

export interface ConsolidatedReportView {
  readonly academicYear: number;
  readonly mode: 'subjects' | 'areas' | 'teacher';
  readonly periodNumber: number | null;
  readonly allPeriods: boolean;
  readonly columns: ConsolidatedColumn[];
  readonly rows: ConsolidatedStudentRow[];
  readonly failedTotalsByColumn: Record<string, number>;
  readonly summary: {
    readonly totalStudents: number;
    readonly studentsWithZeroFailures: number;
    readonly studentsWithFailures: number;
  };
}

export abstract class AcademicRepositoryPort {
  abstract listAreas(schoolId: bigint): Promise<AcademicAreaRecord[]>;
  abstract saveArea(
    schoolId: bigint,
    input: {
      id?: bigint;
      name: string;
      abbreviation?: string | null;
      failsSchoolYear?: boolean;
      displayOrder?: number;
      isActive?: boolean;
    },
  ): Promise<AcademicAreaRecord>;
  abstract deleteArea(schoolId: bigint, areaId: bigint): Promise<void>;

  abstract listSubjects(schoolId: bigint): Promise<SubjectRecord[]>;
  abstract saveSubject(
    schoolId: bigint,
    input: {
      id?: bigint;
      academicAreaId: number;
      name: string;
      abbreviation?: string | null;
      isElective?: boolean;
      displayOrder?: number;
      isActive?: boolean;
    },
  ): Promise<SubjectRecord>;
  abstract deleteSubject(schoolId: bigint, subjectId: bigint): Promise<void>;

  abstract listStudyPlans(
    schoolId: bigint,
    academicYear: number,
  ): Promise<StudyPlanRecord[]>;
  abstract upsertStudyPlan(
    schoolId: bigint,
    input: {
      campusId?: number | null;
      gradeId: number;
      subjectId: number;
      academicYear: number;
      weeklyHours: number;
      areaWeightPercentage: number;
    },
  ): Promise<StudyPlanRecord>;
  abstract deleteStudyPlan(schoolId: bigint, planId: bigint): Promise<void>;

  abstract listCourseAssignments(
    schoolId: bigint,
    academicYear: number,
  ): Promise<CourseAssignmentRecord[]>;
  abstract saveCourseAssignment(
    schoolId: bigint,
    input: {
      id?: bigint;
      campusId: number;
      shiftId: number;
      gradeId: number;
      academicGroupId: number;
      subjectId: number;
      teacherProfileId: number;
      academicYear: number;
      weeklyHours: number;
      areaWeightPercentage: number;
      isActive?: boolean;
    },
  ): Promise<CourseAssignmentRecord>;
  abstract deleteCourseAssignment(
    schoolId: bigint,
    assignmentId: bigint,
  ): Promise<void>;
  abstract reassignTeacherCourses(
    schoolId: bigint,
    input: {
      academicYear: number;
      fromTeacherId: number;
      toTeacherId: number;
    },
  ): Promise<{ updatedCount: number }>;

  abstract listStudents(
    schoolId: bigint,
    search?: string,
    limit?: number,
  ): Promise<StudentProfileRecord[]>;
  abstract saveStudent(
    schoolId: bigint,
    input: {
      id?: bigint;
      documentTypeId?: number | null;
      documentNumber: string;
      firstName: string;
      middleName?: string | null;
      lastName: string;
      secondLastName?: string | null;
      genderId?: number | null;
      birthDate?: string | null;
      bloodType?: string | null;
      address?: string | null;
      suburb?: string | null;
      zoneId?: number | null;
      socioeconomicStratum?: string | null;
      sisbenScore?: string | null;
      phone?: string | null;
      email?: string | null;
      isActive?: boolean;
    },
  ): Promise<StudentProfileRecord>;
  abstract deleteStudent(schoolId: bigint, studentId: bigint): Promise<void>;

  abstract listFamilies(
    schoolId: bigint,
    search?: string,
  ): Promise<FamilyProfileRecord[]>;
  abstract saveFamily(
    schoolId: bigint,
    input: {
      id?: bigint;
      documentTypeId?: number | null;
      documentNumber: string;
      fullName: string;
      phone?: string | null;
      mobilePhone?: string | null;
      email?: string | null;
      address?: string | null;
      occupation?: string | null;
    },
  ): Promise<FamilyProfileRecord>;
  abstract listStudentFamilies(
    schoolId: bigint,
    studentProfileId: bigint,
  ): Promise<StudentFamilyLinkRecord[]>;
  abstract linkStudentFamily(
    schoolId: bigint,
    studentProfileId: bigint,
    input: {
      familyProfileId: number;
      relationshipTypeId?: number;
      isPrimaryGuardian?: boolean;
      isFinancialResponsible?: boolean;
    },
  ): Promise<StudentFamilyLinkRecord>;
  abstract unlinkStudentFamily(
    schoolId: bigint,
    studentProfileId: bigint,
    linkId: bigint,
  ): Promise<void>;

  abstract listEnrollments(
    schoolId: bigint,
    options: { academicYear: number; academicGroupId?: number; search?: string },
  ): Promise<EnrollmentRecord[]>;
  abstract saveEnrollment(
    schoolId: bigint,
    input: {
      id?: bigint;
      studentProfileId: number;
      campusId: number;
      shiftId: number;
      gradeId: number;
      academicGroupId: number;
      academicYear: number;
      enrollmentStatusId?: number;
      registrationNumber?: string | null;
      folioNumber?: string | null;
      isRepeatingGrade?: boolean;
      isNewStudent?: boolean;
      observations?: string | null;
    },
  ): Promise<EnrollmentRecord>;
  abstract moveEnrollments(
    schoolId: bigint,
    input: {
      enrollmentIds: number[];
      targetCampusId: number;
      targetShiftId: number;
      targetGradeId: number;
      targetGroupId: number;
    },
  ): Promise<{ movedCount: number }>;

  abstract listEnrollmentNovelties(
    schoolId: bigint,
    enrollmentId: bigint,
  ): Promise<EnrollmentNoveltyRecord[]>;
  abstract recordEnrollmentNovelty(
    schoolId: bigint,
    enrollmentId: bigint,
    userId: bigint,
    input: {
      enrollmentStatusId: number;
      noveltyDate?: string;
      reason: string;
    },
  ): Promise<EnrollmentNoveltyRecord>;

  abstract listReportedGradesSummary(
    schoolId: bigint,
    academicYear: number,
    periodNumber: number,
  ): Promise<ReportedCourseSummary[]>;
  abstract listEnrollmentGrades(
    schoolId: bigint,
    enrollmentId: bigint,
    academicYear: number,
    periodNumber?: number,
  ): Promise<EnrollmentGradeRow[]>;
  abstract adminUpdateGradeScore(
    schoolId: bigint,
    gradeId: bigint,
    academicYear: number,
    userId: bigint,
    input: {
      finalScore: number;
      recoveryScore?: number;
      levelingScore?: number;
      isLocked?: boolean;
      reason?: string;
    },
  ): Promise<EnrollmentGradeRow>;
  abstract transferStudentGrades(
    schoolId: bigint,
    input: {
      academicYear: number;
      enrollmentId: number;
      fromCourseAssignmentId: number;
      toCourseAssignmentId: number;
    },
  ): Promise<{ transferredCount: number }>;

  abstract listPeriodRecoveries(
    schoolId: bigint,
    academicYear: number,
    periodNumber?: number,
  ): Promise<PeriodRecoveryRecord[]>;
  abstract savePeriodRecovery(
    schoolId: bigint,
    input: {
      academicYear: number;
      enrollmentId: number;
      courseAssignmentId: number;
      periodNumber?: number | null;
      actNumber?: string | null;
      previousScore: number;
      recoveryScore: number;
      recoveryType?: string;
      observations?: string | null;
    },
    userId?: bigint,
  ): Promise<PeriodRecoveryRecord>;

  abstract calculateAndListHonorRoll(
    schoolId: bigint,
    academicYear: number,
    periodNumber: number,
    recalculate: boolean,
    options?: {
      honorScope?: number;
      topLimit?: number;
      mode?: 'PERIOD' | 'ANNUAL';
    },
  ): Promise<HonorRollRecord[]>;

  abstract getConsolidatedReport(
    schoolId: bigint,
    input: {
      academicYear: number;
      mode: 'subjects' | 'areas' | 'teacher';
      academicGroupId?: number;
      teacherProfileId?: number;
      periodNumber?: number;
      allPeriods?: boolean;
    },
  ): Promise<ConsolidatedReportView>;

  abstract materializeAreaPeriodResults(
    schoolId: bigint,
    academicYear: number,
    periodNumber: number,
  ): Promise<{ materializedCount: number }>;

  abstract renumberEnrollmentFolios(
    schoolId: bigint,
    academicYear: number,
    onlyActive?: boolean,
  ): Promise<{ updatedCount: number; studentsPerBook: number; totalBooks: number }>;

  abstract uppercaseAchievementStandards(
    schoolId: bigint,
    academicYear: number,
  ): Promise<{ updatedCount: number }>;
}
