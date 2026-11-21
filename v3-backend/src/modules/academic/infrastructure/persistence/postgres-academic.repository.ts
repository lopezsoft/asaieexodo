import { BadRequestException, Injectable } from '@nestjs/common';
import { ResourceNotFoundException } from '../../../../shared/domain/exceptions/resource-not-found.exception';
import { PostgresRlsService } from '../../../../shared/infrastructure/database/postgres-rls.service';
import { roundHalfAwayFromZero } from '../../../grading/domain/helpers/siee-decimal.helper';
import { IamCommunityProvisioningService } from '../../../iam/application/services/iam-community-provisioning.service';
import { CommunityRole } from '../../../iam/domain/enums/community-role.enum';
import { EnrollmentNumberingService } from '../../application/services/enrollment-numbering.service';
import {
  AcademicAreaRecord,
  AcademicRepositoryPort,
  ConsolidatedColumn,
  ConsolidatedReportView,
  ConsolidatedStudentRow,
  CourseAssignmentRecord,
  EnrollmentGradeRow,
  EnrollmentNoveltyRecord,
  EnrollmentRecord,
  FamilyProfileRecord,
  HonorRollRecord,
  PeriodRecoveryRecord,
  ReportedCourseSummary,
  StudentFamilyLinkRecord,
  StudentProfileRecord,
  StudyPlanRecord,
  SubjectRecord,
} from '../../domain/ports/academic.repository.port';

@Injectable()
export class PostgresAcademicRepository implements AcademicRepositoryPort {
  constructor(
    private readonly db: PostgresRlsService,
    private readonly iamProvisioning: IamCommunityProvisioningService,
    private readonly enrollmentNumbering: EnrollmentNumberingService,
  ) {}

  async listAreas(schoolId: bigint): Promise<AcademicAreaRecord[]> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query<Record<string, unknown>>(
        `SELECT * FROM academic_areas ORDER BY display_order ASC, name ASC`,
      );
      return res.rows.map((r) => this.mapArea(r));
    });
  }

  async saveArea(
    schoolId: bigint,
    input: Parameters<AcademicRepositoryPort['saveArea']>[1],
  ): Promise<AcademicAreaRecord> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const res = input.id
        ? await client.query<Record<string, unknown>>(
            `UPDATE academic_areas
             SET name = $2, abbreviation = $3,
                 fails_school_year = COALESCE($4, fails_school_year),
                 display_order = COALESCE($5, display_order),
                 is_active = COALESCE($6, is_active)
             WHERE id = $1
             RETURNING *`,
            [
              String(input.id),
              input.name.trim(),
              input.abbreviation?.trim() || null,
              input.failsSchoolYear ?? null,
              input.displayOrder ?? null,
              input.isActive ?? null,
            ],
          )
        : await client.query<Record<string, unknown>>(
            `INSERT INTO academic_areas (school_id, name, abbreviation, fails_school_year, display_order, is_active)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [
              String(schoolId),
              input.name.trim(),
              input.abbreviation?.trim() || null,
              input.failsSchoolYear ?? false,
              input.displayOrder ?? 1,
              input.isActive ?? true,
            ],
          );
      if (res.rowCount === 0) {
        throw new ResourceNotFoundException('AcademicArea', input.id ?? 0n);
      }
      return this.mapArea(res.rows[0]);
    });
  }

  async deleteArea(schoolId: bigint, areaId: bigint): Promise<void> {
    await this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query(`DELETE FROM academic_areas WHERE id = $1`, [
        String(areaId),
      ]);
      if (res.rowCount === 0) {
        throw new ResourceNotFoundException('AcademicArea', areaId);
      }
    });
  }

  async listSubjects(schoolId: bigint): Promise<SubjectRecord[]> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query<Record<string, unknown>>(
        `SELECT s.*, COALESCE(a.name, 'Sin área asignada') AS academic_area_name
         FROM subjects s
         LEFT JOIN academic_areas a ON a.school_id = s.school_id AND a.id = s.academic_area_id
         ORDER BY COALESCE(a.display_order, 999) ASC, s.display_order ASC, s.name ASC`,
      );
      return res.rows.map((r) => this.mapSubject(r));
    });
  }

  async saveSubject(
    schoolId: bigint,
    input: Parameters<AcademicRepositoryPort['saveSubject']>[1],
  ): Promise<SubjectRecord> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const saved = input.id
        ? await client.query<{ id: string }>(
            `UPDATE subjects
             SET academic_area_id = $2, name = $3, abbreviation = $4,
                 is_elective = COALESCE($5, is_elective),
                 display_order = COALESCE($6, display_order),
                 is_active = COALESCE($7, is_active)
             WHERE id = $1
             RETURNING id`,
            [
              String(input.id),
              String(input.academicAreaId),
              input.name.trim(),
              input.abbreviation?.trim() || null,
              input.isElective ?? null,
              input.displayOrder ?? null,
              input.isActive ?? null,
            ],
          )
        : await client.query<{ id: string }>(
            `INSERT INTO subjects (school_id, academic_area_id, name, abbreviation, is_elective, display_order, is_active)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING id`,
            [
              String(schoolId),
              String(input.academicAreaId),
              input.name.trim(),
              input.abbreviation?.trim() || null,
              input.isElective ?? false,
              input.displayOrder ?? 1,
              input.isActive ?? true,
            ],
          );
      if (saved.rowCount === 0) {
        throw new ResourceNotFoundException('Subject', input.id ?? 0n);
      }
      const res = await client.query<Record<string, unknown>>(
        `SELECT s.*, COALESCE(a.name, 'Sin área asignada') AS academic_area_name
         FROM subjects s
         LEFT JOIN academic_areas a ON a.school_id = s.school_id AND a.id = s.academic_area_id
         WHERE s.id = $1`,
        [saved.rows[0].id],
      );
      return this.mapSubject(res.rows[0]);
    });
  }

  async deleteSubject(schoolId: bigint, subjectId: bigint): Promise<void> {
    await this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query(`DELETE FROM subjects WHERE id = $1`, [
        String(subjectId),
      ]);
      if (res.rowCount === 0) {
        throw new ResourceNotFoundException('Subject', subjectId);
      }
    });
  }

  async listStudyPlans(
    schoolId: bigint,
    academicYear: number,
  ): Promise<StudyPlanRecord[]> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query<Record<string, unknown>>(
        `SELECT sp.*,
                cp.name AS campus_name,
                g.name AS grade_name,
                s.name AS subject_name,
                COALESCE(a.name, 'Sin área') AS academic_area_name
         FROM curriculum_study_plans sp
         LEFT JOIN campuses cp ON cp.school_id = sp.school_id AND cp.id = sp.campus_id
         INNER JOIN grades g ON g.school_id = sp.school_id AND g.id = sp.grade_id
         INNER JOIN subjects s ON s.school_id = sp.school_id AND s.id = sp.subject_id
         LEFT JOIN subject_area_assignments saa
           ON saa.school_id = sp.school_id
          AND saa.academic_year = sp.academic_year
          AND saa.subject_id = s.id
         LEFT JOIN academic_areas a
           ON a.school_id = s.school_id
          AND a.id = COALESCE(saa.academic_area_id, s.academic_area_id)
         WHERE sp.academic_year = $1
         ORDER BY g.display_order ASC, COALESCE(a.display_order, 999) ASC, s.name ASC`,
        [academicYear],
      );
      return res.rows.map((r) => this.mapStudyPlan(r));
    });
  }

  async upsertStudyPlan(
    schoolId: bigint,
    input: Parameters<AcademicRepositoryPort['upsertStudyPlan']>[1],
  ): Promise<StudyPlanRecord> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const saved = await client.query<{ id: string }>(
        `INSERT INTO curriculum_study_plans (
           school_id, campus_id, grade_id, subject_id, academic_year,
           weekly_hours, area_weight_percentage, is_active, updated_at
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE, NOW())
         ON CONFLICT (school_id, campus_id, grade_id, subject_id, academic_year)
         DO UPDATE SET
           weekly_hours = EXCLUDED.weekly_hours,
           area_weight_percentage = EXCLUDED.area_weight_percentage,
           is_active = TRUE,
           updated_at = NOW()
         RETURNING id`,
        [
          String(schoolId),
          input.campusId ? String(input.campusId) : null,
          String(input.gradeId),
          String(input.subjectId),
          input.academicYear,
          input.weeklyHours,
          input.areaWeightPercentage,
        ],
      );

      const res = await client.query<Record<string, unknown>>(
        `SELECT sp.*,
                cp.name AS campus_name,
                g.name AS grade_name,
                s.name AS subject_name,
                COALESCE(a.name, 'Sin área') AS academic_area_name
         FROM curriculum_study_plans sp
         LEFT JOIN campuses cp ON cp.school_id = sp.school_id AND cp.id = sp.campus_id
         INNER JOIN grades g ON g.school_id = sp.school_id AND g.id = sp.grade_id
         INNER JOIN subjects s ON s.school_id = sp.school_id AND s.id = sp.subject_id
         LEFT JOIN subject_area_assignments saa
           ON saa.school_id = sp.school_id
          AND saa.academic_year = sp.academic_year
          AND saa.subject_id = s.id
         LEFT JOIN academic_areas a
           ON a.school_id = s.school_id
          AND a.id = COALESCE(saa.academic_area_id, s.academic_area_id)
         WHERE sp.id = $1`,
        [saved.rows[0].id],
      );
      return this.mapStudyPlan(res.rows[0]);
    });
  }

  async deleteStudyPlan(schoolId: bigint, planId: bigint): Promise<void> {
    await this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query(
        `DELETE FROM curriculum_study_plans WHERE id = $1`,
        [String(planId)],
      );
      if (res.rowCount === 0) {
        throw new ResourceNotFoundException('CurriculumStudyPlan', planId);
      }
    });
  }

  async listCourseAssignments(
    schoolId: bigint,
    academicYear: number,
  ): Promise<CourseAssignmentRecord[]> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query<Record<string, unknown>>(
        `SELECT ca.*,
                cp.name AS campus_name,
                ss.name AS shift_name,
                g.name AS grade_name,
                ag.group_code,
                s.name AS subject_name,
                COALESCE(a.name, 'Sin área') AS academic_area_name,
                TRIM(CONCAT_WS(' ', tp.first_name, tp.middle_name, tp.last_name, tp.second_last_name)) AS teacher_name
         FROM course_assignments ca
         INNER JOIN campuses cp ON cp.school_id = ca.school_id AND cp.id = ca.campus_id
         INNER JOIN school_shifts ss ON ss.school_id = ca.school_id AND ss.id = ca.shift_id
         INNER JOIN grades g ON g.school_id = ca.school_id AND g.id = ca.grade_id
         INNER JOIN academic_groups ag ON ag.school_id = ca.school_id AND ag.id = ca.academic_group_id
         INNER JOIN subjects s ON s.school_id = ca.school_id AND s.id = ca.subject_id
         LEFT JOIN subject_area_assignments saa
           ON saa.school_id = ca.school_id
          AND saa.academic_year = ca.academic_year
          AND saa.subject_id = s.id
         LEFT JOIN academic_areas a
           ON a.school_id = s.school_id
          AND a.id = COALESCE(saa.academic_area_id, s.academic_area_id)
         INNER JOIN teacher_profiles tp ON tp.school_id = ca.school_id AND tp.id = ca.teacher_profile_id
         WHERE ca.academic_year = $1
         ORDER BY cp.name ASC, g.display_order ASC, ag.group_code ASC, s.name ASC`,
        [academicYear],
      );
      return res.rows.map((r) => this.mapCourseAssignment(r));
    });
  }

  async saveCourseAssignment(
    schoolId: bigint,
    input: Parameters<AcademicRepositoryPort['saveCourseAssignment']>[1],
  ): Promise<CourseAssignmentRecord> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const saved = input.id
        ? await client.query<{ id: string }>(
            `UPDATE course_assignments
             SET teacher_profile_id = $2,
                 weekly_hours = $3,
                 area_weight_percentage = $4,
                 is_active = COALESCE($5, is_active)
             WHERE id = $1
             RETURNING id`,
            [
              String(input.id),
              String(input.teacherProfileId),
              input.weeklyHours,
              input.areaWeightPercentage,
              input.isActive ?? null,
            ],
          )
        : await client.query<{ id: string }>(
            `INSERT INTO course_assignments (
               school_id, campus_id, shift_id, grade_id, academic_group_id,
               subject_id, teacher_profile_id, academic_year, weekly_hours,
               area_weight_percentage, is_active
             )
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
             RETURNING id`,
            [
              String(schoolId),
              String(input.campusId),
              String(input.shiftId),
              String(input.gradeId),
              String(input.academicGroupId),
              String(input.subjectId),
              String(input.teacherProfileId),
              input.academicYear,
              input.weeklyHours,
              input.areaWeightPercentage,
              input.isActive ?? true,
            ],
          );

      if (saved.rowCount === 0) {
        throw new ResourceNotFoundException('CourseAssignment', input.id ?? 0n);
      }

      const res = await client.query<Record<string, unknown>>(
        `SELECT ca.*,
                cp.name AS campus_name,
                ss.name AS shift_name,
                g.name AS grade_name,
                ag.group_code,
                s.name AS subject_name,
                COALESCE(a.name, 'Sin área') AS academic_area_name,
                TRIM(CONCAT_WS(' ', tp.first_name, tp.middle_name, tp.last_name, tp.second_last_name)) AS teacher_name
         FROM course_assignments ca
         INNER JOIN campuses cp ON cp.school_id = ca.school_id AND cp.id = ca.campus_id
         INNER JOIN school_shifts ss ON ss.school_id = ca.school_id AND ss.id = ca.shift_id
         INNER JOIN grades g ON g.school_id = ca.school_id AND g.id = ca.grade_id
         INNER JOIN academic_groups ag ON ag.school_id = ca.school_id AND ag.id = ca.academic_group_id
         INNER JOIN subjects s ON s.school_id = ca.school_id AND s.id = ca.subject_id
         LEFT JOIN subject_area_assignments saa
           ON saa.school_id = ca.school_id
          AND saa.academic_year = ca.academic_year
          AND saa.subject_id = s.id
         LEFT JOIN academic_areas a
           ON a.school_id = s.school_id
          AND a.id = COALESCE(saa.academic_area_id, s.academic_area_id)
         INNER JOIN teacher_profiles tp ON tp.school_id = ca.school_id AND tp.id = ca.teacher_profile_id
         WHERE ca.id = $1`,
        [saved.rows[0].id],
      );
      return this.mapCourseAssignment(res.rows[0]);
    });
  }

  async deleteCourseAssignment(
    schoolId: bigint,
    assignmentId: bigint,
  ): Promise<void> {
    await this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query(
        `DELETE FROM course_assignments WHERE id = $1`,
        [String(assignmentId)],
      );
      if (res.rowCount === 0) {
        throw new ResourceNotFoundException('CourseAssignment', assignmentId);
      }
    });
  }

  async reassignTeacherCourses(
    schoolId: bigint,
    input: { academicYear: number; fromTeacherId: number; toTeacherId: number },
  ): Promise<{ updatedCount: number }> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query(
        `UPDATE course_assignments
         SET teacher_profile_id = $3
         WHERE academic_year = $1
           AND teacher_profile_id = $2`,
        [input.academicYear, String(input.fromTeacherId), String(input.toTeacherId)],
      );
      return { updatedCount: res.rowCount ?? 0 };
    });
  }

  async listStudents(
    schoolId: bigint,
    search?: string,
    limit = 250,
  ): Promise<StudentProfileRecord[]> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const params: unknown[] = [];
      let whereSql = '';
      if (search && search.length > 0) {
        params.push(`%${search}%`);
        whereSql = `WHERE sp.document_number ILIKE $1 OR sp.first_name ILIKE $1 OR sp.last_name ILIKE $1`;
      }
      params.push(limit);
      const res = await client.query<Record<string, unknown>>(
        `SELECT sp.*, dt.code AS document_type_code
         FROM student_profiles sp
         LEFT JOIN document_types dt ON dt.id = sp.document_type_id
         ${whereSql}
         ORDER BY sp.last_name ASC, sp.first_name ASC
         LIMIT $${params.length}`,
        params,
      );
      return res.rows.map((r) => this.mapStudent(r));
    });
  }

  async saveStudent(
    schoolId: bigint,
    input: Parameters<AcademicRepositoryPort['saveStudent']>[1],
  ): Promise<StudentProfileRecord> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      // Aprovisionar automáticamente cuenta IAM (scrypt) + membresía STUDENT
      // (paridad trigger legacy `inscripciones_after_insert` sin SHA1)
      let provisionedUserId: bigint | null = null;
      if (!input.id) {
        provisionedUserId = await this.iamProvisioning.provisionCommunityUser(
          client,
          {
            schoolId,
            role: CommunityRole.STUDENT,
            documentTypeId: input.documentTypeId ?? 2,
            documentNumber: input.documentNumber,
            firstName: input.firstName,
            middleName: input.middleName,
            lastName: input.lastName,
            secondLastName: input.secondLastName,
            email: input.email,
            phone: input.phone,
            genderId: input.genderId,
            birthDate: input.birthDate,
          },
        );
      }

      const saved = input.id
        ? await client.query<{ id: string; user_id: string | null }>(
            `UPDATE student_profiles
             SET document_type_id = COALESCE($2, document_type_id),
                 document_number = $3, first_name = $4, middle_name = $5,
                 last_name = $6, second_last_name = $7, gender_id = $8,
                 birth_date = $9, blood_type = $10, address = $11, suburb = $12,
                 zone_id = COALESCE($13, zone_id), socioeconomic_stratum = $14,
                 sisben_score = $15, phone = $16, email = $17,
                 is_active = COALESCE($18, is_active), updated_at = NOW()
             WHERE id = $1
             RETURNING id, user_id`,
            [
              String(input.id),
              input.documentTypeId ?? null,
              input.documentNumber.trim(),
              input.firstName.trim().toUpperCase(),
              input.middleName?.trim().toUpperCase() || null,
              input.lastName.trim().toUpperCase(),
              input.secondLastName?.trim().toUpperCase() || null,
              input.genderId ?? null,
              input.birthDate || null,
              input.bloodType?.trim() || null,
              input.address?.trim() || null,
              input.suburb?.trim() || null,
              input.zoneId ?? null,
              input.socioeconomicStratum?.trim() || null,
              input.sisbenScore?.trim() || null,
              input.phone?.trim() || null,
              input.email?.trim() || null,
              input.isActive ?? null,
            ],
          )
        : await client.query<{ id: string; user_id: string | null }>(
            `INSERT INTO student_profiles (
               school_id, user_id, document_type_id, document_number,
               first_name, middle_name, last_name, second_last_name,
               gender_id, birth_date, blood_type, address, suburb, zone_id,
               socioeconomic_stratum, sisben_score, phone, email, is_active
             )
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
             RETURNING id, user_id`,
            [
              String(schoolId),
              provisionedUserId ? String(provisionedUserId) : null,
              input.documentTypeId ?? 2,
              input.documentNumber.trim(),
              input.firstName.trim().toUpperCase(),
              input.middleName?.trim().toUpperCase() || null,
              input.lastName.trim().toUpperCase(),
              input.secondLastName?.trim().toUpperCase() || null,
              input.genderId ?? null,
              input.birthDate || null,
              input.bloodType?.trim() || null,
              input.address?.trim() || null,
              input.suburb?.trim() || null,
              input.zoneId ?? 1,
              input.socioeconomicStratum?.trim() || null,
              input.sisbenScore?.trim() || null,
              input.phone?.trim() || null,
              input.email?.trim() || null,
              input.isActive ?? true,
            ],
          );

      if (saved.rowCount === 0) {
        throw new ResourceNotFoundException('StudentProfile', input.id ?? 0n);
      }

      // Si se editó un perfil existente sin cuenta IAM vinculada, aprovisionar y enlazar
      if (input.id && !saved.rows[0].user_id) {
        const linkedUserId = await this.iamProvisioning.provisionCommunityUser(
          client,
          {
            schoolId,
            role: CommunityRole.STUDENT,
            documentTypeId: input.documentTypeId ?? 2,
            documentNumber: input.documentNumber,
            firstName: input.firstName,
            middleName: input.middleName,
            lastName: input.lastName,
            secondLastName: input.secondLastName,
            email: input.email,
            phone: input.phone,
            genderId: input.genderId,
            birthDate: input.birthDate,
          },
        );
        await client.query(
          `UPDATE student_profiles SET user_id = $2 WHERE id = $1`,
          [saved.rows[0].id, String(linkedUserId)],
        );
      }

      const res = await client.query<Record<string, unknown>>(
        `SELECT sp.*, dt.code AS document_type_code
         FROM student_profiles sp
         LEFT JOIN document_types dt ON dt.id = sp.document_type_id
         WHERE sp.id = $1`,
        [saved.rows[0].id],
      );
      return this.mapStudent(res.rows[0]);
    });
  }

  async deleteStudent(schoolId: bigint, studentId: bigint): Promise<void> {
    await this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query(
        `DELETE FROM student_profiles WHERE id = $1`,
        [String(studentId)],
      );
      if (res.rowCount === 0) {
        throw new ResourceNotFoundException('StudentProfile', studentId);
      }
    });
  }

  async listFamilies(
    schoolId: bigint,
    search?: string,
  ): Promise<FamilyProfileRecord[]> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const params: unknown[] = [];
      let whereSql = '';
      if (search && search.length > 0) {
        params.push(`%${search}%`);
        whereSql = `WHERE document_number ILIKE $1 OR full_name ILIKE $1`;
      }
      const res = await client.query<Record<string, unknown>>(
        `SELECT * FROM family_profiles ${whereSql} ORDER BY full_name ASC LIMIT 250`,
        params,
      );
      return res.rows.map((r) => this.mapFamily(r));
    });
  }

  async saveFamily(
    schoolId: bigint,
    input: Parameters<AcademicRepositoryPort['saveFamily']>[1],
  ): Promise<FamilyProfileRecord> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const res = input.id
        ? await client.query<Record<string, unknown>>(
            `UPDATE family_profiles
             SET document_type_id = COALESCE($2, document_type_id),
                 document_number = $3, full_name = $4, phone = $5,
                 mobile_phone = $6, email = $7, address = $8, occupation = $9
             WHERE id = $1
             RETURNING *`,
            [
              String(input.id),
              input.documentTypeId ?? null,
              input.documentNumber.trim(),
              input.fullName.trim(),
              input.phone?.trim() || null,
              input.mobilePhone?.trim() || null,
              input.email?.trim() || null,
              input.address?.trim() || null,
              input.occupation?.trim() || null,
            ],
          )
        : await client.query<Record<string, unknown>>(
            `INSERT INTO family_profiles (
               school_id, document_type_id, document_number, full_name,
               phone, mobile_phone, email, address, occupation
             )
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING *`,
            [
              String(schoolId),
              input.documentTypeId ?? 1,
              input.documentNumber.trim(),
              input.fullName.trim(),
              input.phone?.trim() || null,
              input.mobilePhone?.trim() || null,
              input.email?.trim() || null,
              input.address?.trim() || null,
              input.occupation?.trim() || null,
            ],
          );
      if (res.rowCount === 0) {
        throw new ResourceNotFoundException('FamilyProfile', input.id ?? 0n);
      }
      return this.mapFamily(res.rows[0]);
    });
  }

  async listStudentFamilies(
    schoolId: bigint,
    studentProfileId: bigint,
  ): Promise<StudentFamilyLinkRecord[]> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query<Record<string, unknown>>(
        `SELECT l.*, fp.full_name AS family_full_name,
                fp.document_number AS family_document_number,
                COALESCE(fp.mobile_phone, fp.phone) AS family_phone,
                rt.name AS relationship_name
         FROM student_family_links l
         INNER JOIN family_profiles fp ON fp.school_id = l.school_id AND fp.id = l.family_profile_id
         INNER JOIN family_relationship_types rt ON rt.id = l.relationship_type_id
         WHERE l.student_profile_id = $1
         ORDER BY l.is_primary_guardian DESC, l.id ASC`,
        [String(studentProfileId)],
      );
      return res.rows.map((r) => this.mapStudentFamilyLink(r));
    });
  }

  async linkStudentFamily(
    schoolId: bigint,
    studentProfileId: bigint,
    input: Parameters<AcademicRepositoryPort['linkStudentFamily']>[2],
  ): Promise<StudentFamilyLinkRecord> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const saved = await client.query<{ id: string }>(
        `INSERT INTO student_family_links (
           school_id, student_profile_id, family_profile_id,
           relationship_type_id, is_primary_guardian, is_financial_responsible
         )
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (school_id, student_profile_id, family_profile_id)
         DO UPDATE SET
           relationship_type_id = EXCLUDED.relationship_type_id,
           is_primary_guardian = EXCLUDED.is_primary_guardian,
           is_financial_responsible = EXCLUDED.is_financial_responsible
         RETURNING id`,
        [
          String(schoolId),
          String(studentProfileId),
          String(input.familyProfileId),
          input.relationshipTypeId ?? 1,
          input.isPrimaryGuardian ?? false,
          input.isFinancialResponsible ?? false,
        ],
      );

      const res = await client.query<Record<string, unknown>>(
        `SELECT l.*, fp.full_name AS family_full_name,
                fp.document_number AS family_document_number,
                COALESCE(fp.mobile_phone, fp.phone) AS family_phone,
                rt.name AS relationship_name
         FROM student_family_links l
         INNER JOIN family_profiles fp ON fp.school_id = l.school_id AND fp.id = l.family_profile_id
         INNER JOIN family_relationship_types rt ON rt.id = l.relationship_type_id
         WHERE l.id = $1`,
        [saved.rows[0].id],
      );
      return this.mapStudentFamilyLink(res.rows[0]);
    });
  }

  async unlinkStudentFamily(
    schoolId: bigint,
    studentProfileId: bigint,
    linkId: bigint,
  ): Promise<void> {
    await this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query(
        `DELETE FROM student_family_links WHERE student_profile_id = $1 AND id = $2`,
        [String(studentProfileId), String(linkId)],
      );
      if (res.rowCount === 0) {
        throw new ResourceNotFoundException('StudentFamilyLink', linkId);
      }
    });
  }

  async listEnrollments(
    schoolId: bigint,
    options: { academicYear: number; academicGroupId?: number; search?: string },
  ): Promise<EnrollmentRecord[]> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const clauses = ['e.academic_year = $1'];
      const params: unknown[] = [options.academicYear];

      if (options.academicGroupId) {
        params.push(String(options.academicGroupId));
        clauses.push(`e.academic_group_id = $${params.length}`);
      }
      if (options.search && options.search.trim().length > 0) {
        params.push(`%${options.search.trim()}%`);
        clauses.push(
          `(sp.document_number ILIKE $${params.length} OR sp.first_name ILIKE $${params.length} OR sp.last_name ILIKE $${params.length})`,
        );
      }

      const res = await client.query<Record<string, unknown>>(
        `SELECT e.*,
                sp.document_number AS student_document_number,
                TRIM(CONCAT_WS(' ', sp.first_name, sp.middle_name, sp.last_name, sp.second_last_name)) AS student_full_name,
                cp.name AS campus_name,
                ss.name AS shift_name,
                g.name AS grade_name,
                ag.group_code,
                es.name AS enrollment_status_name
         FROM student_enrollments e
         INNER JOIN student_profiles sp ON sp.school_id = e.school_id AND sp.id = e.student_profile_id
         INNER JOIN campuses cp ON cp.school_id = e.school_id AND cp.id = e.campus_id
         INNER JOIN school_shifts ss ON ss.school_id = e.school_id AND ss.id = e.shift_id
         INNER JOIN grades g ON g.school_id = e.school_id AND g.id = e.grade_id
         INNER JOIN academic_groups ag ON ag.school_id = e.school_id AND ag.id = e.academic_group_id
         INNER JOIN enrollment_statuses es ON es.id = e.enrollment_status_id
         WHERE ${clauses.join(' AND ')}
         ORDER BY g.display_order ASC, ag.group_code ASC, sp.last_name ASC, sp.first_name ASC
         LIMIT 500`,
        params,
      );
      return res.rows.map((r) => this.mapEnrollment(r));
    });
  }

  async saveEnrollment(
    schoolId: bigint,
    input: Parameters<AcademicRepositoryPort['saveEnrollment']>[1],
  ): Promise<EnrollmentRecord> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      let registrationNumber = input.registrationNumber?.trim() || null;
      let folioNumber = input.folioNumber?.trim() || null;
      let bookNumber: string | null = null;
      if (!input.id && (!registrationNumber || !folioNumber)) {
        const allocated = await this.enrollmentNumbering.allocateNextNumbers(
          client,
          schoolId,
          input.academicYear,
        );
        registrationNumber = registrationNumber ?? allocated.registrationNumber;
        folioNumber = folioNumber ?? allocated.folioNumber;
        bookNumber = allocated.bookNumber;
      }

      const saved = input.id
        ? await client.query<{ id: string }>(
            `UPDATE student_enrollments
             SET campus_id = $2, shift_id = $3, grade_id = $4,
                 academic_group_id = $5, enrollment_status_id = COALESCE($6, enrollment_status_id),
                 registration_number = COALESCE($7, registration_number),
                 folio_number = COALESCE($8, folio_number),
                 is_repeating_grade = COALESCE($9, is_repeating_grade),
                 is_new_student = COALESCE($10, is_new_student),
                 observations = $11, updated_at = NOW()
             WHERE id = $1
             RETURNING id`,
            [
              String(input.id),
              String(input.campusId),
              String(input.shiftId),
              String(input.gradeId),
              String(input.academicGroupId),
              input.enrollmentStatusId ?? null,
              registrationNumber,
              folioNumber,
              input.isRepeatingGrade ?? null,
              input.isNewStudent ?? null,
              input.observations?.trim() || null,
            ],
          )
        : await client.query<{ id: string }>(
            `INSERT INTO student_enrollments (
               school_id, student_profile_id, campus_id, shift_id, grade_id,
               academic_group_id, academic_year, enrollment_status_id,
               registration_number, book_number, folio_number,
               is_repeating_grade, is_new_student, observations
             )
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
             ON CONFLICT (school_id, student_profile_id, academic_year, grade_id)
             DO UPDATE SET
               campus_id = EXCLUDED.campus_id,
               shift_id = EXCLUDED.shift_id,
               academic_group_id = EXCLUDED.academic_group_id,
               enrollment_status_id = EXCLUDED.enrollment_status_id,
               registration_number = COALESCE(student_enrollments.registration_number, EXCLUDED.registration_number),
               book_number = COALESCE(student_enrollments.book_number, EXCLUDED.book_number),
               folio_number = COALESCE(student_enrollments.folio_number, EXCLUDED.folio_number),
               updated_at = NOW()
             RETURNING id`,
            [
              String(schoolId),
              String(input.studentProfileId),
              String(input.campusId),
              String(input.shiftId),
              String(input.gradeId),
              String(input.academicGroupId),
              input.academicYear,
              input.enrollmentStatusId ?? 2,
              registrationNumber,
              bookNumber,
              folioNumber,
              input.isRepeatingGrade ?? false,
              input.isNewStudent ?? true,
              input.observations?.trim() || null,
            ],
          );

      if (saved.rowCount === 0) {
        throw new ResourceNotFoundException('StudentEnrollment', input.id ?? 0n);
      }

      await this.enrollmentNumbering.ensureAccessControl(
        client,
        schoolId,
        Number(saved.rows[0].id),
      );

      const res = await client.query<Record<string, unknown>>(
        `SELECT e.*,
                sp.document_number AS student_document_number,
                TRIM(CONCAT_WS(' ', sp.first_name, sp.middle_name, sp.last_name, sp.second_last_name)) AS student_full_name,
                cp.name AS campus_name,
                ss.name AS shift_name,
                g.name AS grade_name,
                ag.group_code,
                es.name AS enrollment_status_name
         FROM student_enrollments e
         INNER JOIN student_profiles sp ON sp.school_id = e.school_id AND sp.id = e.student_profile_id
         INNER JOIN campuses cp ON cp.school_id = e.school_id AND cp.id = e.campus_id
         INNER JOIN school_shifts ss ON ss.school_id = e.school_id AND ss.id = e.shift_id
         INNER JOIN grades g ON g.school_id = e.school_id AND g.id = e.grade_id
         INNER JOIN academic_groups ag ON ag.school_id = e.school_id AND ag.id = e.academic_group_id
         INNER JOIN enrollment_statuses es ON es.id = e.enrollment_status_id
         WHERE e.id = $1`,
        [saved.rows[0].id],
      );
      return this.mapEnrollment(res.rows[0]);
    });
  }

  async moveEnrollments(
    schoolId: bigint,
    input: Parameters<AcademicRepositoryPort['moveEnrollments']>[1],
  ): Promise<{ movedCount: number }> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query(
        `UPDATE student_enrollments
         SET campus_id = $2, shift_id = $3, grade_id = $4,
             academic_group_id = $5, updated_at = NOW()
         WHERE id = ANY($1::bigint[])`,
        [
          input.enrollmentIds.map(String),
          String(input.targetCampusId),
          String(input.targetShiftId),
          String(input.targetGradeId),
          String(input.targetGroupId),
        ],
      );
      return { movedCount: res.rowCount ?? 0 };
    });
  }

  async listEnrollmentNovelties(
    schoolId: bigint,
    enrollmentId: bigint,
  ): Promise<EnrollmentNoveltyRecord[]> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query<Record<string, unknown>>(
        `SELECT n.*, es.name AS enrollment_status_name
         FROM enrollment_novelties n
         INNER JOIN enrollment_statuses es ON es.id = n.enrollment_status_id
         WHERE n.enrollment_id = $1
         ORDER BY n.novelty_date DESC, n.id DESC`,
        [String(enrollmentId)],
      );
      return res.rows.map((r) => ({
        id: Number(r.id),
        enrollmentId: Number(r.enrollment_id),
        enrollmentStatusId: Number(r.enrollment_status_id),
        enrollmentStatusName: String(r.enrollment_status_name),
        noveltyDate: this.toIsoDate(r.novelty_date) ?? '',
        reason: String(r.reason),
        createdAt: new Date(r.created_at as string | Date).toISOString(),
      }));
    });
  }

  async recordEnrollmentNovelty(
    schoolId: bigint,
    enrollmentId: bigint,
    userId: bigint,
    input: { enrollmentStatusId: number; noveltyDate?: string; reason: string },
  ): Promise<EnrollmentNoveltyRecord> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const noveltyDate =
        input.noveltyDate ?? new Date().toISOString().slice(0, 10);
      const inserted = await client.query<{ id: string }>(
        `INSERT INTO enrollment_novelties (
           school_id, enrollment_id, enrollment_status_id, novelty_date, reason, created_by_user_id
         )
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [
          String(schoolId),
          String(enrollmentId),
          input.enrollmentStatusId,
          noveltyDate,
          input.reason.trim(),
          String(userId),
        ],
      );

      // Actualiza estado de matricula y fecha de retiro si aplica (4=Retirado, 7=Desertor)
      const isWithdrawal =
        input.enrollmentStatusId === 4 || input.enrollmentStatusId === 7;
      await client.query(
        `UPDATE student_enrollments
         SET enrollment_status_id = $2,
             withdrawal_date = CASE WHEN $3::boolean THEN $4::date ELSE NULL END,
             updated_at = NOW()
         WHERE id = $1`,
        [
          String(enrollmentId),
          input.enrollmentStatusId,
          isWithdrawal,
          noveltyDate,
        ],
      );

      const res = await client.query<Record<string, unknown>>(
        `SELECT n.*, es.name AS enrollment_status_name
         FROM enrollment_novelties n
         INNER JOIN enrollment_statuses es ON es.id = n.enrollment_status_id
         WHERE n.id = $1`,
        [inserted.rows[0].id],
      );
      const r = res.rows[0];
      return {
        id: Number(r.id),
        enrollmentId: Number(r.enrollment_id),
        enrollmentStatusId: Number(r.enrollment_status_id),
        enrollmentStatusName: String(r.enrollment_status_name),
        noveltyDate: this.toIsoDate(r.novelty_date) ?? '',
        reason: String(r.reason),
        createdAt: new Date(r.created_at as string | Date).toISOString(),
      };
    });
  }

  async listReportedGradesSummary(
    schoolId: bigint,
    academicYear: number,
    periodNumber: number,
  ): Promise<ReportedCourseSummary[]> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query<Record<string, unknown>>(
        `SELECT ca.id AS course_assignment_id,
                TRIM(CONCAT_WS(' ', tp.first_name, tp.last_name)) AS teacher_name,
                s.name AS subject_name,
                g.name AS grade_name,
                ag.group_code,
                cp.name AS campus_name,
                (SELECT COUNT(*)::int FROM student_enrollments e
                 WHERE e.academic_group_id = ca.academic_group_id
                   AND e.academic_year = ca.academic_year
                   AND e.enrollment_status_id IN (2, 3)) AS enrolled_students,
                (SELECT COUNT(*)::int FROM academic_scores gr
                 WHERE gr.course_assignment_id = ca.id
                   AND gr.academic_year = ca.academic_year
                   AND gr.period_number = $2
                   AND COALESCE(NULLIF(gr.recovery_score, 0), gr.final_score) > 0) AS graded_students
         FROM course_assignments ca
         INNER JOIN teacher_profiles tp ON tp.school_id = ca.school_id AND tp.id = ca.teacher_profile_id
         INNER JOIN subjects s ON s.school_id = ca.school_id AND s.id = ca.subject_id
         INNER JOIN grades g ON g.school_id = ca.school_id AND g.id = ca.grade_id
         INNER JOIN academic_groups ag ON ag.school_id = ca.school_id AND ag.id = ca.academic_group_id
         INNER JOIN campuses cp ON cp.school_id = ca.school_id AND cp.id = ca.campus_id
         WHERE ca.academic_year = $1 AND ca.is_active = TRUE
         ORDER BY tp.last_name ASC, g.display_order ASC, ag.group_code ASC`,
        [academicYear, periodNumber],
      );

      return res.rows.map((r) => {
        const enrolled = Number(r.enrolled_students ?? 0);
        const graded = Number(r.graded_students ?? 0);
        return {
          courseAssignmentId: Number(r.course_assignment_id),
          teacherName: String(r.teacher_name),
          subjectName: String(r.subject_name),
          gradeName: String(r.grade_name),
          groupCode: String(r.group_code),
          campusName: String(r.campus_name),
          enrolledStudents: enrolled,
          gradedStudents: graded,
          completionPercentage:
            enrolled > 0 ? Math.min(100, Math.round((graded / enrolled) * 100)) : 0,
        };
      });
    });
  }

  async listEnrollmentGrades(
    schoolId: bigint,
    enrollmentId: bigint,
    academicYear: number,
    periodNumber?: number,
  ): Promise<EnrollmentGradeRow[]> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const params: unknown[] = [String(enrollmentId), academicYear];
      let periodSql = '';
      if (periodNumber) {
        params.push(periodNumber);
        periodSql = `AND gr.period_number = $3`;
      }

      const res = await client.query<Record<string, unknown>>(
        `SELECT gr.*,
                GREATEST(COALESCE(gr.recovery_score, 0), gr.final_score) AS effective_score,
                s.name AS subject_name,
                TRIM(CONCAT_WS(' ', tp.first_name, tp.last_name)) AS teacher_name
         FROM academic_scores gr
         INNER JOIN course_assignments ca ON ca.school_id = gr.school_id AND ca.id = gr.course_assignment_id
         INNER JOIN subjects s ON s.school_id = ca.school_id AND s.id = ca.subject_id
         INNER JOIN teacher_profiles tp ON tp.school_id = ca.school_id AND tp.id = ca.teacher_profile_id
         WHERE gr.enrollment_id = $1 AND gr.academic_year = $2 ${periodSql}
         ORDER BY gr.period_number ASC, s.name ASC`,
        params,
      );
      return res.rows.map((r) => this.mapEnrollmentGrade(r));
    });
  }

  async adminUpdateGradeScore(
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
  ): Promise<EnrollmentGradeRow> {
    const changeReason = input.reason?.trim() || 'Ajuste administrativo de nota';
    return this.db.withTenantTransaction(
      schoolId,
      async (client) => {
        const prevRes = await client.query<{
          final_score: string;
          enrollment_id: string;
          course_assignment_id: string;
          period_number: number;
          grade_group_id: string | null;
          decimals_count: number | null;
        }>(
          `SELECT gr.final_score, gr.enrollment_id, gr.course_assignment_id, gr.period_number,
                  g.grade_group_id, agr.decimals_count
             FROM academic_scores gr
             INNER JOIN student_enrollments se ON se.school_id = gr.school_id AND se.id = gr.enrollment_id
             INNER JOIN grades g ON g.school_id = se.school_id AND g.id = se.grade_id
             LEFT JOIN academic_grading_rules agr
               ON agr.school_id = gr.school_id
              AND agr.academic_year = gr.academic_year
              AND agr.grade_group_id = g.grade_group_id
            WHERE gr.id = $1 AND gr.academic_year = $2`,
          [String(gradeId), academicYear],
        );
        if (prevRes.rowCount === 0) {
          throw new ResourceNotFoundException('AcademicScore', gradeId);
        }
        const prev = prevRes.rows[0];
        const recScore =
          input.recoveryScore !== undefined && input.recoveryScore > 0
            ? input.recoveryScore
            : null;

        // El trigger antifraude PG17 audita automáticamente el cambio usando auditContext
        await client.query(
          `UPDATE academic_scores
           SET final_score = $3,
               recovery_score = COALESCE($4, recovery_score),
               is_leveled = CASE WHEN $4 IS NOT NULL THEN TRUE ELSE is_leveled END,
               leveled_at = CASE WHEN $4 IS NOT NULL THEN CURRENT_DATE ELSE leveled_at END,
               national_scale_id = fn_siee_resolve_scale(
                 school_id,
                 academic_year,
                 $5::bigint,
                 GREATEST(COALESCE(COALESCE($4, recovery_score), 0), $3),
                 $6::smallint
               ),
               updated_at = NOW()
           WHERE id = $1 AND academic_year = $2`,
          [
            String(gradeId),
            academicYear,
            input.finalScore,
            recScore,
            prev.grade_group_id,
            prev.decimals_count ?? 2,
          ],
        );

        const res = await client.query<Record<string, unknown>>(
          `SELECT gr.*,
                  GREATEST(COALESCE(gr.recovery_score, 0), gr.final_score) AS effective_score,
                  s.name AS subject_name,
                  TRIM(CONCAT_WS(' ', tp.first_name, tp.last_name)) AS teacher_name
           FROM academic_scores gr
           INNER JOIN course_assignments ca ON ca.school_id = gr.school_id AND ca.id = gr.course_assignment_id
           INNER JOIN subjects s ON s.school_id = ca.school_id AND s.id = ca.subject_id
           INNER JOIN teacher_profiles tp ON tp.school_id = ca.school_id AND tp.id = ca.teacher_profile_id
           WHERE gr.id = $1 AND gr.academic_year = $2`,
          [String(gradeId), academicYear],
        );
        return this.mapEnrollmentGrade(res.rows[0]);
      },
      { userId, changeReason },
    );
  }

  async transferStudentGrades(
    schoolId: bigint,
    input: {
      academicYear: number;
      enrollmentId: number;
      fromCourseAssignmentId: number;
      toCourseAssignmentId: number;
    },
  ): Promise<{ transferredCount: number }> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query(
        `UPDATE academic_scores
         SET course_assignment_id = $4, updated_at = NOW()
         WHERE academic_year = $1
           AND enrollment_id = $2
           AND course_assignment_id = $3`,
        [
          input.academicYear,
          String(input.enrollmentId),
          String(input.fromCourseAssignmentId),
          String(input.toCourseAssignmentId),
        ],
      );
      return { transferredCount: res.rowCount ?? 0 };
    });
  }

  async listPeriodRecoveries(
    schoolId: bigint,
    academicYear: number,
    periodNumber?: number,
  ): Promise<PeriodRecoveryRecord[]> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const params: unknown[] = [academicYear];
      let periodSql = '';
      if (periodNumber) {
        params.push(periodNumber);
        periodSql = `AND pr.period_number = $2`;
      }

      const res = await client.query<Record<string, unknown>>(
        `SELECT pr.*,
                TRIM(CONCAT_WS(' ', sp.first_name, sp.last_name)) AS student_full_name,
                s.name AS subject_name
         FROM period_recovery_records pr
         INNER JOIN student_enrollments e ON e.school_id = pr.school_id AND e.id = pr.enrollment_id
         INNER JOIN student_profiles sp ON sp.school_id = e.school_id AND sp.id = e.student_profile_id
         INNER JOIN course_assignments ca ON ca.school_id = pr.school_id AND ca.id = pr.course_assignment_id
         INNER JOIN subjects s ON s.school_id = ca.school_id AND s.id = ca.subject_id
         WHERE pr.academic_year = $1 ${periodSql}
         ORDER BY pr.recovery_date DESC, pr.id DESC`,
        params,
      );
      return res.rows.map((r) => ({
        id: Number(r.id),
        academicYear: Number(r.academic_year),
        enrollmentId: Number(r.enrollment_id),
        studentFullName: String(r.student_full_name),
        courseAssignmentId: Number(r.course_assignment_id),
        subjectName: String(r.subject_name),
        periodNumber: r.period_number != null ? Number(r.period_number) : null,
        actNumber: (r.act_number as string | null) ?? null,
        previousScore: Number(r.previous_score),
        recoveryScore: Number(r.recovery_score),
        recoveryType: String(r.recovery_type),
        recoveryDate: this.toIsoDate(r.recovery_date) ?? '',
        observations: (r.observations as string | null) ?? null,
      }));
    });
  }

  async savePeriodRecovery(
    schoolId: bigint,
    input: Parameters<AcademicRepositoryPort['savePeriodRecovery']>[1],
    userId?: bigint,
  ): Promise<PeriodRecoveryRecord> {
    const recoveryType =
      input.recoveryType === 'FINAL_RECOVERY'
        ? 'FINAL_RECOVERY'
        : 'PERIOD_RECOVERY';

    if (recoveryType === 'PERIOD_RECOVERY' && !input.periodNumber) {
      throw new BadRequestException(
        'El número de periodo (1..6) es obligatorio para recuperaciones periódicas.',
      );
    }

    return this.db.withTenantTransaction(
      schoolId,
      async (client) => {
        const metaRes = await client.query<{
          grade_group_id: string | null;
          max_recovery_score: string | null;
          decimals_count: number | null;
          enforces_recovery_dates: boolean | null;
        }>(
          `SELECT g.grade_group_id,
                  agr.max_recovery_score,
                  agr.decimals_count,
                  agr.enforces_recovery_dates
             FROM course_assignments ca
             INNER JOIN grades g ON g.school_id = ca.school_id AND g.id = ca.grade_id
             LEFT JOIN academic_grading_rules agr
               ON agr.school_id = ca.school_id
              AND agr.academic_year = $2
              AND agr.grade_group_id = g.grade_group_id
            WHERE ca.school_id = $1 AND ca.id = $3
            LIMIT 1`,
          [String(schoolId), input.academicYear, String(input.courseAssignmentId)],
        );

        const gradeGroupId = metaRes.rows[0]?.grade_group_id ?? null;
        const maxRecoveryScore = metaRes.rows[0]?.max_recovery_score
          ? Number(metaRes.rows[0].max_recovery_score)
          : 5.0;
        const decimalsCount = metaRes.rows[0]?.decimals_count ?? 2;
        const enforcesRecoveryDates = Boolean(
          metaRes.rows[0]?.enforces_recovery_dates,
        );

        if (input.recoveryScore > 0) {
          if (input.recoveryScore < input.previousScore) {
            throw new BadRequestException(
              `La nota recuperada (${input.recoveryScore}) no puede ser menor a la nota previa (${input.previousScore}).`,
            );
          }
          if (maxRecoveryScore > 0 && input.recoveryScore > maxRecoveryScore) {
            throw new BadRequestException(
              `La nota de nivelación (${input.recoveryScore}) excede el máximo institucional (${maxRecoveryScore}).`,
            );
          }
        }

        const targetPeriodNumber =
          recoveryType === 'FINAL_RECOVERY' ? null : (input.periodNumber ?? null);

        if (recoveryType === 'PERIOD_RECOVERY' && targetPeriodNumber !== null) {
          const periodRes = await client.query<{
            is_closed: boolean;
            recovery_open_date: string | null;
            recovery_close_date: string | null;
          }>(
            `SELECT is_closed,
                    recovery_open_date::text,
                    recovery_close_date::text
               FROM academic_periods
              WHERE school_id = $1
                AND academic_year = $2
                AND period_number = $3
                AND (grade_group_id IS NULL OR grade_group_id = $4::bigint)
              ORDER BY (grade_group_id IS NOT NULL AND grade_group_id = $4::bigint) DESC, grade_group_id NULLS LAST
              LIMIT 1`,
            [
              String(schoolId),
              input.academicYear,
              targetPeriodNumber,
              gradeGroupId,
            ],
          );
          const period = periodRes.rows[0];
          if (period?.is_closed) {
            throw new BadRequestException(
              `El periodo ${targetPeriodNumber} del año ${input.academicYear} está cerrado y no admite nivelaciones.`,
            );
          }
          if (enforcesRecoveryDates && period) {
            const todayIso = new Date().toISOString().slice(0, 10);
            if (
              period.recovery_open_date &&
              todayIso < period.recovery_open_date
            ) {
              throw new BadRequestException(
                `La ventana de nivelación del periodo ${targetPeriodNumber} abre el ${period.recovery_open_date}.`,
              );
            }
            if (
              period.recovery_close_date &&
              todayIso > period.recovery_close_date
            ) {
              throw new BadRequestException(
                `La ventana de nivelación del periodo ${targetPeriodNumber} cerró el ${period.recovery_close_date}.`,
              );
            }
          }
        }

        // Upsert idempotente: evita duplicación en `period_recovery_records`
        const existingRec = await client.query<{ id: string }>(
          `SELECT id
             FROM period_recovery_records
            WHERE school_id = $1
              AND academic_year = $2
              AND enrollment_id = $3
              AND course_assignment_id = $4
              AND period_number IS NOT DISTINCT FROM $5
              AND recovery_type = $6
            ORDER BY id DESC
            LIMIT 1`,
          [
            String(schoolId),
            input.academicYear,
            String(input.enrollmentId),
            String(input.courseAssignmentId),
            targetPeriodNumber,
            recoveryType,
          ],
        );

        let recordId: string;
        if (existingRec.rowCount && existingRec.rowCount > 0) {
          recordId = existingRec.rows[0].id;
          await client.query(
            `UPDATE period_recovery_records
                SET act_number = COALESCE($2, act_number),
                    previous_score = $3,
                    recovery_score = $4,
                    observations = $5,
                    recovery_date = COALESCE(recovery_date, CURRENT_DATE),
                    updated_at = NOW()
              WHERE id = $1`,
            [
              recordId,
              input.actNumber?.trim() || null,
              input.previousScore,
              input.recoveryScore,
              input.observations?.trim() || null,
            ],
          );
        } else {
          const inserted = await client.query<{ id: string }>(
            `INSERT INTO period_recovery_records (
               school_id, academic_year, enrollment_id, course_assignment_id,
               period_number, act_number, previous_score, recovery_score,
               recovery_type, recovery_date, observations
             )
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_DATE, $10)
             RETURNING id`,
            [
              String(schoolId),
              input.academicYear,
              String(input.enrollmentId),
              String(input.courseAssignmentId),
              targetPeriodNumber,
              input.actNumber?.trim() || null,
              input.previousScore,
              input.recoveryScore,
              recoveryType,
              input.observations?.trim() || null,
            ],
          );
          recordId = inserted.rows[0].id;
        }

        // Sincronizar en `academic_scores` SOLO para `PERIOD_RECOVERY` (nunca contaminar `FINAL_RECOVERY`)
        if (recoveryType === 'PERIOD_RECOVERY' && targetPeriodNumber !== null) {
          await client.query(
            `UPDATE academic_scores
             SET lost_score = COALESCE(lost_score, final_score),
                 recovery_score = GREATEST(COALESCE(recovery_score, 0), $5),
                 is_leveled = TRUE,
                 leveled_at = CURRENT_DATE,
                 national_scale_id = fn_siee_resolve_scale(
                   school_id,
                   academic_year,
                   $6::bigint,
                   GREATEST(GREATEST(COALESCE(recovery_score, 0), $5), final_score),
                   $7::smallint
                 ),
                 updated_at = NOW()
             WHERE academic_year = $1
               AND enrollment_id = $2
               AND course_assignment_id = $3
               AND period_number = $4`,
            [
              input.academicYear,
              String(input.enrollmentId),
              String(input.courseAssignmentId),
              targetPeriodNumber,
              input.recoveryScore,
              gradeGroupId,
              decimalsCount,
            ],
          );
        }

        const list = await client.query<Record<string, unknown>>(
          `SELECT pr.*,
                  TRIM(CONCAT_WS(' ', sp.first_name, sp.last_name)) AS student_full_name,
                  s.name AS subject_name
           FROM period_recovery_records pr
           INNER JOIN student_enrollments e ON e.school_id = pr.school_id AND e.id = pr.enrollment_id
           INNER JOIN student_profiles sp ON sp.school_id = e.school_id AND sp.id = e.student_profile_id
           INNER JOIN course_assignments ca ON ca.school_id = pr.school_id AND ca.id = pr.course_assignment_id
           INNER JOIN subjects s ON s.school_id = ca.school_id AND s.id = ca.subject_id
           WHERE pr.id = $1`,
          [recordId],
        );
        const r = list.rows[0];
        return {
          id: Number(r.id),
          academicYear: Number(r.academic_year),
          enrollmentId: Number(r.enrollment_id),
          studentFullName: String(r.student_full_name),
          courseAssignmentId: Number(r.course_assignment_id),
          subjectName: String(r.subject_name),
          periodNumber: r.period_number != null ? Number(r.period_number) : null,
          actNumber: (r.act_number as string | null) ?? null,
          previousScore: Number(r.previous_score),
          recoveryScore: Number(r.recovery_score),
          recoveryType: String(r.recovery_type),
          recoveryDate: this.toIsoDate(r.recovery_date) ?? '',
          observations: (r.observations as string | null) ?? null,
        };
      },
      {
        userId: userId ?? null,
        changeReason:
          recoveryType === 'FINAL_RECOVERY'
            ? 'Registro administrativo de habilitación final'
            : 'Registro administrativo de recuperación periódica',
      },
    );
  }

  async calculateAndListHonorRoll(
    schoolId: bigint,
    academicYear: number,
    periodNumber: number,
    recalculate: boolean,
    options?: {
      honorScope?: number;
      topLimit?: number;
      mode?: 'PERIOD' | 'ANNUAL';
    },
  ): Promise<HonorRollRecord[]> {
    const honorScope = options?.honorScope ?? 1; // 1=Grupo, 2=Grado, 3=Sede, 4=Nivel, 5=Institución
    const topLimit = Math.min(Math.max(options?.topLimit ?? 3, 1), 50);
    const mode = options?.mode ?? 'PERIOD';

    return this.db.withTenantTransaction(schoolId, async (client) => {
      if (mode === 'ANNUAL') {
        // Ranking anual consolidado usando `v_siee_subject_annual_scores` sin alterar puestos periódicos
        const annualRes = await client.query<Record<string, unknown>>(
          `WITH student_metrics AS (
             SELECT v.enrollment_id,
                    v.academic_group_id,
                    v.grade_id,
                    v.campus_id,
                    v.education_level_id,
                    TRIM(CONCAT_WS(' ', sp.last_name, sp.second_last_name, sp.first_name, sp.middle_name)) AS student_full_name,
                    sp.document_number AS student_document_number,
                    g.name AS grade_name,
                    g.display_order AS grade_order,
                    ag.group_code,
                    cp.name AS campus_name,
                    ROUND(AVG(v.final_effective_score)::numeric, 2) AS avg_score,
                    ROUND(SUM(v.final_effective_score)::numeric, 2) AS total_score,
                    MAX(v.final_effective_score) AS max_score,
                    MIN(v.final_effective_score) AS min_score,
                    COUNT(*) FILTER (WHERE v.final_effective_score <= v.failing_max_score)::smallint AS failed_cnt
               FROM v_siee_subject_annual_scores v
               INNER JOIN student_profiles sp ON sp.school_id = v.school_id AND sp.id = v.student_profile_id
               INNER JOIN academic_groups ag ON ag.school_id = v.school_id AND ag.id = v.academic_group_id
               INNER JOIN grades g ON g.school_id = v.school_id AND g.id = v.grade_id
               INNER JOIN campuses cp ON cp.school_id = v.school_id AND cp.id = v.campus_id
              WHERE v.school_id = $1
                AND v.academic_year = $2
                AND v.enrollment_status_id = 2
                AND v.is_excluded_from_average = FALSE
                AND v.is_elective = FALSE
              GROUP BY v.enrollment_id, v.academic_group_id, v.grade_id, v.campus_id,
                       v.education_level_id, sp.last_name, sp.second_last_name, sp.first_name,
                       sp.middle_name, sp.document_number, g.name, g.display_order, ag.group_code, cp.name
           ),
           ranked AS (
             SELECT *,
                    DENSE_RANK() OVER (PARTITION BY academic_group_id ORDER BY avg_score DESC, max_score DESC, failed_cnt ASC)::smallint AS grp_rank,
                    COUNT(*) OVER (PARTITION BY academic_group_id)::smallint AS grp_total,
                    DENSE_RANK() OVER (PARTITION BY grade_id ORDER BY avg_score DESC, max_score DESC, failed_cnt ASC)::smallint AS grd_rank,
                    DENSE_RANK() OVER (
                      PARTITION BY CASE $3::smallint
                        WHEN 1 THEN academic_group_id
                        WHEN 2 THEN grade_id
                        WHEN 3 THEN campus_id
                        WHEN 4 THEN education_level_id
                        ELSE 0
                      END
                      ORDER BY avg_score DESC, max_score DESC, failed_cnt ASC
                    )::smallint AS scope_rank
               FROM student_metrics
           )
           SELECT *
             FROM ranked
            ORDER BY grade_order ASC, group_code ASC, grp_rank ASC, student_full_name ASC`,
          [String(schoolId), academicYear, honorScope],
        );

        return annualRes.rows.map((r, idx) => {
          const scopeRank = Number(r.scope_rank);
          const failedCnt = Number(r.failed_cnt);
          const isHonor = scopeRank <= topLimit && failedCnt === 0;
          return {
            id: idx + 1,
            academicYear,
            enrollmentId: Number(r.enrollment_id),
            studentFullName: String(r.student_full_name),
            studentDocumentNumber: String(r.student_document_number),
            academicGroupId: Number(r.academic_group_id),
            gradeName: String(r.grade_name),
            groupCode: String(r.group_code),
            campusName: String(r.campus_name),
            periodNumber: 0,
            averageScore: Number(r.avg_score),
            totalScore: Number(r.total_score),
            maxScore: Number(r.max_score),
            minScore: Number(r.min_score),
            groupRank: Number(r.grp_rank),
            groupTotalStudents: Number(r.grp_total),
            gradeRank: Number(r.grd_rank),
            failedSubjectsCount: failedCnt,
            isHonorRoll: isHonor,
            honorRollRank: isHonor ? scopeRank : null,
            honorRollScope: isHonor ? honorScope : null,
          };
        });
      }

      if (recalculate) {
        // Ranking SIEE oficial: respeta `ranks_by_area_average`, excluye electivas y excluidas,
        // usa `grading_scales.is_failing` por grade_group_id (cero 3.00 hardcodeado),
        // desempata por `max_score DESC` y persiste todas las columnas de `student_period_rankings`.
        await client.query(
          `WITH student_subject_metrics AS (
             SELECT v.enrollment_id,
                    v.academic_group_id,
                    v.grade_id,
                    v.grade_group_id,
                    v.campus_id,
                    v.education_level_id,
                    COALESCE(r.ranks_by_area_average, FALSE) AS ranks_by_area,
                    COALESCE(r.decimals_count, 2) AS decimals_count,
                    ROUND(AVG(v.effective_score)::numeric, GREATEST(0, LEAST(COALESCE(r.decimals_count, 2), 4))) AS subj_avg,
                    ROUND(SUM(v.effective_score)::numeric, 2) AS subj_total,
                    MAX(v.effective_score) AS subj_max,
                    MIN(v.effective_score) AS subj_min,
                    COUNT(*) FILTER (
                      WHERE v.effective_score <= COALESCE(
                        (
                          SELECT MAX(gs.max_score)
                            FROM grading_scales gs
                           WHERE gs.school_id = v.school_id
                             AND gs.academic_year = v.academic_year
                             AND gs.is_failing = TRUE
                             AND (gs.grade_group_id IS NULL OR gs.grade_group_id = v.grade_group_id)
                        ),
                        COALESCE(r.min_passing_score, 3.00) - 0.01
                      )
                    )::smallint AS subj_failed_cnt
               FROM v_siee_subject_period_scores v
               LEFT JOIN LATERAL (
                 SELECT agr.*
                   FROM academic_grading_rules agr
                  WHERE agr.school_id = v.school_id
                    AND agr.academic_year = v.academic_year
                    AND (agr.grade_group_id = v.grade_group_id OR v.grade_group_id IS NULL)
                  ORDER BY (agr.grade_group_id = v.grade_group_id) DESC, agr.id ASC
                  LIMIT 1
               ) r ON TRUE
              WHERE v.school_id = $3::bigint
                AND v.academic_year = $1
                AND v.period_number = $2
                AND v.enrollment_status_id = 2
                AND v.is_excluded_from_average = FALSE
                AND v.is_elective = FALSE
              GROUP BY v.enrollment_id, v.academic_group_id, v.grade_id, v.grade_group_id,
                       v.campus_id, v.education_level_id, r.ranks_by_area_average,
                       r.decimals_count, r.min_passing_score
           ),
           student_area_metrics AS (
             SELECT a.enrollment_id,
                    ROUND(AVG(a.area_score)::numeric, 2) AS area_avg,
                    ROUND(SUM(a.area_score)::numeric, 2) AS area_total,
                    MAX(a.area_score) AS area_max,
                    MIN(a.area_score) AS area_min,
                    COUNT(*) FILTER (WHERE a.is_area_failed)::smallint AS area_failed_cnt
               FROM v_siee_area_period_scores a
              WHERE a.school_id = $3::bigint
                AND a.academic_year = $1
                AND a.period_number = $2
                AND a.enrollment_status_id = 2
              GROUP BY a.enrollment_id
           ),
           merged AS (
             SELECT s.enrollment_id,
                    s.academic_group_id,
                    s.grade_id,
                    s.campus_id,
                    s.education_level_id,
                    CASE WHEN s.ranks_by_area AND a.area_avg IS NOT NULL THEN a.area_avg ELSE s.subj_avg END AS avg_score,
                    CASE WHEN s.ranks_by_area AND a.area_total IS NOT NULL THEN a.area_total ELSE s.subj_total END AS total_score,
                    CASE WHEN s.ranks_by_area AND a.area_max IS NOT NULL THEN a.area_max ELSE s.subj_max END AS max_score,
                    CASE WHEN s.ranks_by_area AND a.area_min IS NOT NULL THEN a.area_min ELSE s.subj_min END AS min_score,
                    CASE WHEN s.ranks_by_area AND a.area_failed_cnt IS NOT NULL THEN a.area_failed_cnt ELSE s.subj_failed_cnt END AS failed_cnt
               FROM student_subject_metrics s
               LEFT JOIN student_area_metrics a ON a.enrollment_id = s.enrollment_id
           ),
           ranked AS (
             SELECT enrollment_id,
                    academic_group_id,
                    avg_score,
                    total_score,
                    max_score,
                    min_score,
                    failed_cnt,
                    DENSE_RANK() OVER (PARTITION BY academic_group_id ORDER BY avg_score DESC, max_score DESC, failed_cnt ASC)::smallint AS grp_rank,
                    COUNT(*) OVER (PARTITION BY academic_group_id)::smallint AS grp_total,
                    DENSE_RANK() OVER (PARTITION BY grade_id ORDER BY avg_score DESC, max_score DESC, failed_cnt ASC)::smallint AS grd_rank,
                    DENSE_RANK() OVER (
                      PARTITION BY CASE $4::smallint
                        WHEN 1 THEN academic_group_id
                        WHEN 2 THEN grade_id
                        WHEN 3 THEN campus_id
                        WHEN 4 THEN education_level_id
                        ELSE 0
                      END
                      ORDER BY avg_score DESC, max_score DESC, failed_cnt ASC
                    )::smallint AS scope_rank
               FROM merged
           )
           INSERT INTO student_period_rankings (
             school_id, academic_year, enrollment_id, academic_group_id, period_number,
             average_score, total_score, max_score, min_score,
             group_rank, group_total_students, grade_rank, failed_subjects_count,
             is_honor_roll, honor_roll_rank, honor_roll_scope
           )
           SELECT $3::bigint, $1, enrollment_id, academic_group_id, $2,
                  avg_score, total_score, max_score, min_score,
                  grp_rank, grp_total, grd_rank, failed_cnt,
                  (scope_rank <= $5::smallint AND failed_cnt = 0),
                  CASE WHEN scope_rank <= $5::smallint AND failed_cnt = 0 THEN scope_rank ELSE NULL END,
                  CASE WHEN scope_rank <= $5::smallint AND failed_cnt = 0 THEN $4::smallint ELSE NULL END
             FROM ranked
           ON CONFLICT (school_id, academic_year, enrollment_id, period_number)
           DO UPDATE SET
             academic_group_id = EXCLUDED.academic_group_id,
             average_score = EXCLUDED.average_score,
             total_score = EXCLUDED.total_score,
             max_score = EXCLUDED.max_score,
             min_score = EXCLUDED.min_score,
             group_rank = EXCLUDED.group_rank,
             group_total_students = EXCLUDED.group_total_students,
             grade_rank = EXCLUDED.grade_rank,
             failed_subjects_count = EXCLUDED.failed_subjects_count,
             is_honor_roll = EXCLUDED.is_honor_roll,
             honor_roll_rank = EXCLUDED.honor_roll_rank,
             honor_roll_scope = EXCLUDED.honor_roll_scope`,
          [academicYear, periodNumber, String(schoolId), honorScope, topLimit],
        );
      }

      const res = await client.query<Record<string, unknown>>(
        `SELECT r.*,
                sp.document_number AS student_document_number,
                TRIM(CONCAT_WS(' ', sp.first_name, sp.middle_name, sp.last_name, sp.second_last_name)) AS student_full_name,
                g.name AS grade_name,
                ag.group_code,
                cp.name AS campus_name
         FROM student_period_rankings r
         INNER JOIN student_enrollments e ON e.school_id = r.school_id AND e.id = r.enrollment_id
         INNER JOIN student_profiles sp ON sp.school_id = e.school_id AND sp.id = e.student_profile_id
         INNER JOIN academic_groups ag ON ag.school_id = r.school_id AND ag.id = r.academic_group_id
         INNER JOIN grades g ON g.school_id = ag.school_id AND g.id = ag.grade_id
         INNER JOIN campuses cp ON cp.school_id = ag.school_id AND cp.id = ag.campus_id
         WHERE r.academic_year = $1 AND r.period_number = $2
         ORDER BY g.display_order ASC, ag.group_code ASC, r.group_rank ASC, student_full_name ASC`,
        [academicYear, periodNumber],
      );

      return res.rows.map((r) => ({
        id: Number(r.id),
        academicYear: Number(r.academic_year),
        enrollmentId: Number(r.enrollment_id),
        studentFullName: String(r.student_full_name),
        studentDocumentNumber: String(r.student_document_number),
        academicGroupId: Number(r.academic_group_id),
        gradeName: String(r.grade_name),
        groupCode: String(r.group_code),
        campusName: String(r.campus_name),
        periodNumber: Number(r.period_number),
        averageScore: Number(r.average_score),
        totalScore: r.total_score != null ? Number(r.total_score) : null,
        maxScore: r.max_score != null ? Number(r.max_score) : null,
        minScore: r.min_score != null ? Number(r.min_score) : null,
        groupRank: Number(r.group_rank),
        groupTotalStudents:
          r.group_total_students != null ? Number(r.group_total_students) : null,
        gradeRank: r.grade_rank != null ? Number(r.grade_rank) : null,
        failedSubjectsCount: Number(r.failed_subjects_count),
        isHonorRoll: Boolean(r.is_honor_roll),
        honorRollRank:
          r.honor_roll_rank != null ? Number(r.honor_roll_rank) : null,
        honorRollScope:
          r.honor_roll_scope != null ? Number(r.honor_roll_scope) : null,
      }));
    });
  }

  async getConsolidatedReport(
    schoolId: bigint,
    input: {
      academicYear: number;
      mode: 'subjects' | 'areas' | 'teacher';
      academicGroupId?: number;
      teacherProfileId?: number;
      periodNumber?: number;
      allPeriods?: boolean;
    },
  ): Promise<ConsolidatedReportView> {
    const allPeriods = Boolean(input.allPeriods);
    const periodNumber = allPeriods ? null : (input.periodNumber ?? 1);

    return this.db.withTenantTransaction(schoolId, async (client) => {
      const params: unknown[] = [String(schoolId), input.academicYear];
      const filters: string[] = [];

      if (input.academicGroupId) {
        params.push(input.academicGroupId);
        filters.push(`AND v.academic_group_id = $${params.length}`);
      }
      if (input.mode === 'teacher' && input.teacherProfileId) {
        params.push(input.teacherProfileId);
        filters.push(`AND v.teacher_profile_id = $${params.length}`);
      }
      if (!allPeriods && periodNumber !== null) {
        params.push(periodNumber);
        filters.push(`AND v.period_number = $${params.length}`);
      }

      interface RawConsolidatedRow {
        enrollment_id: string;
        document_number: string;
        full_name: string;
        grade_name: string;
        grade_order: number;
        group_code: string;
        entity_id: string;
        entity_name: string;
        entity_abbr: string | null;
        area_name: string | null;
        period_number: number;
        score: string;
        is_failed: boolean;
      }

      const sql =
        input.mode === 'areas'
          ? `SELECT v.enrollment_id,
                    sp.document_number,
                    TRIM(CONCAT_WS(' ', sp.last_name, sp.second_last_name, sp.first_name, sp.middle_name)) AS full_name,
                    g.name AS grade_name,
                    g.display_order AS grade_order,
                    ag.group_code,
                    v.academic_area_id AS entity_id,
                    COALESCE(aa.name, 'Sin área') AS entity_name,
                    aa.abbreviation AS entity_abbr,
                    NULL::text AS area_name,
                    v.period_number,
                    v.area_score::text AS score,
                    v.is_area_failed AS is_failed
               FROM v_siee_area_period_scores v
               INNER JOIN student_profiles sp ON sp.school_id = v.school_id AND sp.id = v.student_profile_id
               INNER JOIN grades g ON g.school_id = v.school_id AND g.id = v.grade_id
               INNER JOIN academic_groups ag ON ag.school_id = v.school_id AND ag.id = v.academic_group_id
               LEFT JOIN academic_areas aa ON aa.school_id = v.school_id AND aa.id = v.academic_area_id
              WHERE v.school_id = $1
                AND v.academic_year = $2
                AND v.enrollment_status_id = 2
                ${filters.join(' ')}
              ORDER BY g.display_order ASC, ag.group_code ASC, full_name ASC, COALESCE(aa.display_order, 999), v.period_number ASC`
          : `SELECT v.enrollment_id,
                    sp.document_number,
                    TRIM(CONCAT_WS(' ', sp.last_name, sp.second_last_name, sp.first_name, sp.middle_name)) AS full_name,
                    g.name AS grade_name,
                    g.display_order AS grade_order,
                    ag.group_code,
                    v.subject_id AS entity_id,
                    s.name AS entity_name,
                    s.abbreviation AS entity_abbr,
                    COALESCE(aa.name, 'Sin área') AS area_name,
                    v.period_number,
                    v.effective_score::text AS score,
                    (
                      v.effective_score <= COALESCE(
                        (
                          SELECT MAX(gs.max_score)
                            FROM grading_scales gs
                           WHERE gs.school_id = v.school_id
                             AND gs.academic_year = v.academic_year
                             AND gs.is_failing = TRUE
                             AND (gs.grade_group_id IS NULL OR gs.grade_group_id = v.grade_group_id)
                        ),
                        2.99
                      )
                    ) AS is_failed
               FROM v_siee_subject_period_scores v
               INNER JOIN student_profiles sp ON sp.school_id = v.school_id AND sp.id = v.student_profile_id
               INNER JOIN grades g ON g.school_id = v.school_id AND g.id = v.grade_id
               INNER JOIN academic_groups ag ON ag.school_id = v.school_id AND ag.id = v.academic_group_id
               INNER JOIN subjects s ON s.school_id = v.school_id AND s.id = v.subject_id
               LEFT JOIN academic_areas aa ON aa.school_id = v.school_id AND aa.id = v.academic_area_id
              WHERE v.school_id = $1
                AND v.academic_year = $2
                AND v.enrollment_status_id = 2
                AND v.is_excluded_from_average = FALSE
                ${filters.join(' ')}
              ORDER BY g.display_order ASC, ag.group_code ASC, full_name ASC, COALESCE(aa.display_order, 999), s.display_order ASC, v.period_number ASC`;

      const res = await client.query<RawConsolidatedRow>(sql, params);

      const columnsMap = new Map<string, ConsolidatedColumn>();
      const studentsMap = new Map<
        number,
        {
          enrollmentId: number;
          studentDocumentNumber: string;
          studentFullName: string;
          gradeName: string;
          groupCode: string;
          cellAccumulator: Map<
            string,
            { sum: number; count: number; failedCount: number; periodScores: Record<number, number> }
          >;
        }
      >();

      for (const r of res.rows) {
        const colKey = `${input.mode === 'areas' ? 'A' : 'S'}_${r.entity_id}`;
        if (!columnsMap.has(colKey)) {
          columnsMap.set(colKey, {
            key: colKey,
            entityId: Number(r.entity_id),
            name: r.entity_name,
            abbreviation: r.entity_abbr,
            ...(r.area_name ? { areaName: r.area_name } : {}),
          });
        }

        const enrId = Number(r.enrollment_id);
        let student = studentsMap.get(enrId);
        if (!student) {
          student = {
            enrollmentId: enrId,
            studentDocumentNumber: r.document_number,
            studentFullName: r.full_name,
            gradeName: r.grade_name,
            groupCode: r.group_code,
            cellAccumulator: new Map(),
          };
          studentsMap.set(enrId, student);
        }

        const scoreVal = Number(r.score);
        let acc = student.cellAccumulator.get(colKey);
        if (!acc) {
          acc = { sum: 0, count: 0, failedCount: 0, periodScores: {} };
          student.cellAccumulator.set(colKey, acc);
        }
        acc.sum += scoreVal;
        acc.count += 1;
        if (r.is_failed) acc.failedCount += 1;
        acc.periodScores[Number(r.period_number)] = scoreVal;
      }

      const failedTotalsByColumn: Record<string, number> = {};
      for (const colKey of columnsMap.keys()) {
        failedTotalsByColumn[colKey] = 0;
      }

      const rows: ConsolidatedStudentRow[] = [];
      let studentsWithZeroFailures = 0;
      let studentsWithFailures = 0;

      for (const st of studentsMap.values()) {
        const cells: ConsolidatedStudentRow['cells'] = {};
        let rowSum = 0;
        let rowCount = 0;
        let rowFailed = 0;

        for (const [colKey, acc] of st.cellAccumulator.entries()) {
          const cellScore =
            acc.count > 0 ? roundHalfAwayFromZero(acc.sum / acc.count, 2) : 0;
          const isFailed = allPeriods
            ? acc.failedCount > acc.count / 2
            : acc.failedCount > 0;
          if (isFailed) {
            rowFailed += 1;
            failedTotalsByColumn[colKey] =
              (failedTotalsByColumn[colKey] ?? 0) + 1;
          }
          rowSum += cellScore;
          rowCount += 1;
          cells[colKey] = {
            score: cellScore,
            isFailed,
            ...(allPeriods ? { periodScores: acc.periodScores } : {}),
          };
        }

        if (rowFailed === 0) {
          studentsWithZeroFailures += 1;
        } else {
          studentsWithFailures += 1;
        }

        rows.push({
          enrollmentId: st.enrollmentId,
          studentDocumentNumber: st.studentDocumentNumber,
          studentFullName: st.studentFullName,
          gradeName: st.gradeName,
          groupCode: st.groupCode,
          averageScore:
            rowCount > 0 ? roundHalfAwayFromZero(rowSum / rowCount, 2) : 0,
          failedCount: rowFailed,
          cells,
        });
      }

      return {
        academicYear: input.academicYear,
        mode: input.mode,
        periodNumber,
        allPeriods,
        columns: Array.from(columnsMap.values()),
        rows,
        failedTotalsByColumn,
        summary: {
          totalStudents: rows.length,
          studentsWithZeroFailures,
          studentsWithFailures,
        },
      };
    });
  }

  async materializeAreaPeriodResults(
    schoolId: bigint,
    academicYear: number,
    periodNumber: number,
  ): Promise<{ materializedCount: number }> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query(
        `INSERT INTO academic_area_period_results (
           school_id, academic_year, enrollment_id, academic_area_id, period_number,
           weighted_score, recovery_score, national_scale_id, is_failed
         )
         SELECT a.school_id,
                a.academic_year,
                a.enrollment_id,
                a.academic_area_id,
                a.period_number,
                a.area_score,
                0.00,
                fn_siee_resolve_scale(a.school_id, a.academic_year, a.grade_group_id, a.area_score, 2),
                a.is_area_failed
           FROM v_siee_area_period_scores a
          WHERE a.school_id = $1
            AND a.academic_year = $2
            AND a.period_number = $3
            AND a.enrollment_status_id = 2
         ON CONFLICT (school_id, academic_year, enrollment_id, academic_area_id, period_number)
         DO UPDATE SET
           weighted_score = EXCLUDED.weighted_score,
           national_scale_id = EXCLUDED.national_scale_id,
           is_failed = EXCLUDED.is_failed`,
        [String(schoolId), academicYear, periodNumber],
      );
      return { materializedCount: res.rowCount ?? 0 };
    });
  }

  async renumberEnrollmentFolios(
    schoolId: bigint,
    academicYear: number,
    onlyActive = true,
  ): Promise<{ updatedCount: number; studentsPerBook: number; totalBooks: number }> {
    return this.db.withTenantTransaction(schoolId, async (client) =>
      this.enrollmentNumbering.renumberAcademicYearFolios(
        client,
        schoolId,
        academicYear,
        onlyActive,
      ),
    );
  }

  async uppercaseAchievementStandards(
    schoolId: bigint,
    academicYear: number,
  ): Promise<{ updatedCount: number }> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query(
        `UPDATE achievement_standards
         SET description = UPPER(description)
         WHERE academic_year = $1`,
        [academicYear],
      );
      return { updatedCount: res.rowCount ?? 0 };
    });
  }

  private mapArea(r: Record<string, unknown>): AcademicAreaRecord {
    return {
      id: Number(r.id),
      name: String(r.name),
      abbreviation: (r.abbreviation as string | null) ?? null,
      failsSchoolYear: Boolean(r.fails_school_year),
      displayOrder: Number(r.display_order),
      isActive: Boolean(r.is_active),
    };
  }

  private mapSubject(r: Record<string, unknown>): SubjectRecord {
    return {
      id: Number(r.id),
      academicAreaId: Number(r.academic_area_id),
      academicAreaName: String(r.academic_area_name),
      name: String(r.name),
      abbreviation: (r.abbreviation as string | null) ?? null,
      isElective: Boolean(r.is_elective),
      displayOrder: Number(r.display_order),
      isActive: Boolean(r.is_active),
    };
  }

  private mapStudyPlan(r: Record<string, unknown>): StudyPlanRecord {
    return {
      id: Number(r.id),
      campusId: r.campus_id != null ? Number(r.campus_id) : null,
      campusName: (r.campus_name as string | null) ?? null,
      gradeId: Number(r.grade_id),
      gradeName: String(r.grade_name),
      subjectId: Number(r.subject_id),
      subjectName: String(r.subject_name),
      academicAreaName: String(r.academic_area_name),
      academicYear: Number(r.academic_year),
      weeklyHours: Number(r.weekly_hours),
      areaWeightPercentage: Number(r.area_weight_percentage),
      isActive: Boolean(r.is_active),
    };
  }

  private mapCourseAssignment(r: Record<string, unknown>): CourseAssignmentRecord {
    return {
      id: Number(r.id),
      campusId: Number(r.campus_id),
      campusName: String(r.campus_name),
      shiftId: Number(r.shift_id),
      shiftName: String(r.shift_name),
      gradeId: Number(r.grade_id),
      gradeName: String(r.grade_name),
      academicGroupId: Number(r.academic_group_id),
      groupCode: String(r.group_code),
      subjectId: Number(r.subject_id),
      subjectName: String(r.subject_name),
      academicAreaName: String(r.academic_area_name),
      teacherProfileId: Number(r.teacher_profile_id),
      teacherName: String(r.teacher_name),
      academicYear: Number(r.academic_year),
      weeklyHours: Number(r.weekly_hours),
      areaWeightPercentage: Number(r.area_weight_percentage),
      isActive: Boolean(r.is_active),
    };
  }

  private mapStudent(r: Record<string, unknown>): StudentProfileRecord {
    const fullName = [r.first_name, r.middle_name, r.last_name, r.second_last_name]
      .filter((p): p is string => Boolean(p && String(p).trim().length > 0))
      .join(' ');
    return {
      id: Number(r.id),
      documentTypeId:
        r.document_type_id != null ? Number(r.document_type_id) : null,
      documentTypeCode: (r.document_type_code as string | null) ?? null,
      documentNumber: String(r.document_number),
      firstName: String(r.first_name),
      middleName: (r.middle_name as string | null) ?? null,
      lastName: String(r.last_name),
      secondLastName: (r.second_last_name as string | null) ?? null,
      fullName,
      genderId: r.gender_id != null ? Number(r.gender_id) : null,
      birthDate: this.toIsoDate(r.birth_date),
      bloodType: (r.blood_type as string | null) ?? null,
      address: (r.address as string | null) ?? null,
      suburb: (r.suburb as string | null) ?? null,
      zoneId: r.zone_id != null ? Number(r.zone_id) : null,
      socioeconomicStratum: (r.socioeconomic_stratum as string | null) ?? null,
      sisbenScore: (r.sisben_score as string | null) ?? null,
      phone: (r.phone as string | null) ?? null,
      email: (r.email as string | null) ?? null,
      isActive: Boolean(r.is_active),
    };
  }

  private mapFamily(r: Record<string, unknown>): FamilyProfileRecord {
    return {
      id: Number(r.id),
      documentTypeId:
        r.document_type_id != null ? Number(r.document_type_id) : null,
      documentNumber: String(r.document_number),
      fullName: String(r.full_name),
      phone: (r.phone as string | null) ?? null,
      mobilePhone: (r.mobile_phone as string | null) ?? null,
      email: (r.email as string | null) ?? null,
      address: (r.address as string | null) ?? null,
      occupation: (r.occupation as string | null) ?? null,
      isActive: Boolean(r.is_active),
    };
  }

  private mapStudentFamilyLink(
    r: Record<string, unknown>,
  ): StudentFamilyLinkRecord {
    return {
      id: Number(r.id),
      studentProfileId: Number(r.student_profile_id),
      familyProfileId: Number(r.family_profile_id),
      familyFullName: String(r.family_full_name),
      familyDocumentNumber: String(r.family_document_number),
      familyPhone: (r.family_phone as string | null) ?? null,
      relationshipTypeId: Number(r.relationship_type_id),
      relationshipName: String(r.relationship_name),
      isPrimaryGuardian: Boolean(r.is_primary_guardian),
      isFinancialResponsible: Boolean(r.is_financial_responsible),
    };
  }

  private mapEnrollment(r: Record<string, unknown>): EnrollmentRecord {
    return {
      id: Number(r.id),
      studentProfileId: Number(r.student_profile_id),
      studentDocumentNumber: String(r.student_document_number),
      studentFullName: String(r.student_full_name),
      campusId: Number(r.campus_id),
      campusName: String(r.campus_name),
      shiftId: Number(r.shift_id),
      shiftName: String(r.shift_name),
      gradeId: Number(r.grade_id),
      gradeName: String(r.grade_name),
      academicGroupId: Number(r.academic_group_id),
      groupCode: String(r.group_code),
      enrollmentStatusId: Number(r.enrollment_status_id),
      enrollmentStatusName: String(r.enrollment_status_name),
      academicYear: Number(r.academic_year),
      registrationNumber: (r.registration_number as string | null) ?? null,
      folioNumber: (r.folio_number as string | null) ?? null,
      enrollmentDate: this.toIsoDate(r.enrollment_date) ?? '',
      withdrawalDate: this.toIsoDate(r.withdrawal_date),
      isRepeatingGrade: Boolean(r.is_repeating_grade),
      isNewStudent: Boolean(r.is_new_student),
      observations: (r.observations as string | null) ?? null,
    };
  }

  private mapEnrollmentGrade(r: Record<string, unknown>): EnrollmentGradeRow {
    const finalScore = Number(r.final_score);
    const recoveryScore = r.recovery_score != null ? Number(r.recovery_score) : 0;
    const effectiveScore =
      r.effective_score != null
        ? Number(r.effective_score)
        : recoveryScore > 0
          ? recoveryScore
          : finalScore;
    return {
      id: Number(r.id),
      academicYear: Number(r.academic_year),
      enrollmentId: Number(r.enrollment_id),
      courseAssignmentId: Number(r.course_assignment_id),
      subjectName: String(r.subject_name),
      teacherName: String(r.teacher_name),
      periodId: Number(r.period_number),
      periodNumber: Number(r.period_number),
      finalScore,
      recoveryScore,
      levelingScore: r.lost_score != null ? Number(r.lost_score) : 0,
      effectiveScore,
      justifiedAbsences: Number(r.justified_absences),
      unjustifiedAbsences: Number(r.unjustified_absences),
      isLocked: false,
    };
  }

  private toIsoDate(value: unknown): string | null {
    if (!value) {
      return null;
    }
    if (value instanceof Date) {
      return value.toISOString().slice(0, 10);
    }
    return String(value).slice(0, 10);
  }
}
