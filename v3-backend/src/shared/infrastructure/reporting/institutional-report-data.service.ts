import { Injectable } from '@nestjs/common';
import { PoolClient } from 'pg';
import { PostgresRlsService } from '../database/postgres-rls.service';
import {
  REPORT_CATALOG_BY_NAME,
  ReportOrientation,
  ReportPaperSize,
} from './report-catalog.constants';

export interface SchoolBrandingHeader {
  readonly schoolName: string;
  readonly shortName: string | null;
  readonly daneCode: string | null;
  readonly nit: string | null;
  readonly headerLine1: string | null;
  readonly headerLine2: string | null;
  readonly footerText: string | null;
  readonly address: string | null;
  readonly phones: string | null;
  readonly email: string | null;
  readonly directorName: string | null;
  readonly directorDocument: string | null;
  readonly secretaryName: string | null;
  readonly secretaryDocument: string | null;
  readonly logoUrl: string | null;
  readonly shieldUrl: string | null;
  readonly scaleLegend: Array<{
    readonly name: string;
    readonly abbreviation: string;
    readonly minScore: number;
    readonly maxScore: number;
    readonly hexColor: string;
  }>;
}

export interface BulletinStudentPage {
  readonly enrollmentId: number;
  readonly studentFullName: string;
  readonly documentNumber: string;
  readonly campusName: string;
  readonly shiftName: string;
  readonly gradeName: string;
  readonly groupCode: string;
  readonly homeroomTeacherName: string | null;
  readonly registrationNumber: string | null;
  readonly bookNumber: string | null;
  readonly folioNumber: string | null;
  readonly groupRank: number | null;
  readonly groupTotalStudents: number | null;
  readonly averageScore: number;
  readonly totalAbsences: number;
  readonly areas: Array<{
    readonly areaName: string;
    readonly areaScore: number;
    readonly isAreaFailed: boolean;
    readonly subjects: Array<{
      readonly subjectName: string;
      readonly teacherName: string;
      readonly weeklyHours: number;
      readonly periodScores: Record<number, number>;
      readonly currentScore: number;
      readonly scaleName: string;
      readonly scaleAbbreviation: string;
      readonly scaleColor: string;
      readonly isFailed: boolean;
      readonly absences: number;
      readonly achievements: string[];
      readonly suggestions: string[];
    }>;
  }>;
}

export interface CertificateDocumentPage {
  readonly documentKind: 'CONSTANCIA' | 'CERTIFICADO' | 'ACTA_GRADO' | 'FICHA_MATRICULA';
  readonly consecutiveNumber: string;
  readonly enrollmentId: number;
  readonly studentFullName: string;
  readonly documentTypeCode: string;
  readonly documentNumber: string;
  readonly birthDate: string | null;
  readonly address: string | null;
  readonly phone: string | null;
  readonly email: string | null;
  readonly bloodType: string | null;
  readonly campusName: string;
  readonly shiftName: string;
  readonly gradeName: string;
  readonly groupCode: string;
  readonly enrollmentStatusName: string;
  readonly registrationNumber: string | null;
  readonly bookNumber: string | null;
  readonly folioNumber: string | null;
  readonly promotionStatusDescription: string | null;
  readonly actNumber: string | null;
  readonly diplomaNumber: string | null;
  readonly graduationFolio: string | null;
  readonly finalAverage: number | null;
  readonly guardians: Array<{
    readonly fullName: string;
    readonly documentNumber: string;
    readonly phone: string | null;
    readonly relationship: string;
  }>;
  readonly subjects: Array<{
    readonly areaName: string;
    readonly subjectName: string;
    readonly weeklyHours: number;
    readonly annualScore: number;
    readonly recoveryScore: number | null;
    readonly finalEffectiveScore: number;
    readonly scaleName: string;
  }>;
}

export interface StudentCardItem {
  readonly enrollmentId: number;
  readonly studentFullName: string;
  readonly documentNumber: string;
  readonly gradeGroup: string;
  readonly campusName: string;
  readonly shiftName: string;
  readonly bloodType: string | null;
  readonly academicYear: number;
}

export interface MatrixColumnDef {
  readonly key: string;
  readonly label: string;
  readonly align?: 'left' | 'center' | 'right';
  readonly isScore?: boolean;
}

export interface MatrixTableDocument {
  readonly columns: MatrixColumnDef[];
  readonly rows: Array<Record<string, string | number | null>>;
  readonly failingCellKeys: string[]; // format: `${rowIndex}:${colKey}`
  readonly footerTotals?: Record<string, string | number>;
  readonly summaryBadges: Array<{ readonly label: string; readonly value: string }>;
}

export type InstitutionalReportDataset =
  | {
      readonly kind: 'BULLETIN';
      readonly templateName: string;
      readonly title: string;
      readonly subtitle: string;
      readonly academicYear: number;
      readonly periodNumber: number;
      readonly paperSize: ReportPaperSize;
      readonly orientation: ReportOrientation;
      readonly generatedBy: string;
      readonly branding: SchoolBrandingHeader;
      readonly pages: BulletinStudentPage[];
    }
  | {
      readonly kind: 'CERTIFICATE';
      readonly templateName: string;
      readonly title: string;
      readonly subtitle: string;
      readonly academicYear: number;
      readonly paperSize: ReportPaperSize;
      readonly orientation: ReportOrientation;
      readonly generatedBy: string;
      readonly branding: SchoolBrandingHeader;
      readonly pages: CertificateDocumentPage[];
    }
  | {
      readonly kind: 'CARDS';
      readonly templateName: string;
      readonly title: string;
      readonly subtitle: string;
      readonly academicYear: number;
      readonly paperSize: ReportPaperSize;
      readonly orientation: ReportOrientation;
      readonly generatedBy: string;
      readonly branding: SchoolBrandingHeader;
      readonly cards: StudentCardItem[];
    }
  | {
      readonly kind: 'MATRIX_TABLE';
      readonly templateName: string;
      readonly title: string;
      readonly subtitle: string;
      readonly academicYear: number;
      readonly periodNumber: number | null;
      readonly paperSize: ReportPaperSize;
      readonly orientation: ReportOrientation;
      readonly generatedBy: string;
      readonly branding: SchoolBrandingHeader;
      readonly matrix: MatrixTableDocument;
    };

const BULLETIN_TEMPLATES = new Set([
  'boletin_carta_areas',
  'boletin_oficio_asignaturas',
  'boletin_preescolar',
  'boletin_areas',
  'boletin_asignaturas',
  'boletin_competencias',
  'boletin_areas_mod2',
  'boletin_desempenos',
]);

const CERTIFICATE_TEMPLATES = new Set([
  'constancia_estudio',
  'certificado_calificaciones',
  'acta_grado',
  'ficha_matricula',
]);

/**
 * Servicio de extracción de datos 100% RLS-safe sobre PostgreSQL 17 para los 31 reportes
 * institucionales oficiales de ASAIE ÉXODO.
 */
@Injectable()
export class InstitutionalReportDataService {
  constructor(private readonly db: PostgresRlsService) {}

  async buildDataset(params: {
    readonly schoolId: bigint;
    readonly templateName: string;
    readonly requestedByFullName: string;
    readonly parameters: Record<string, string | number | boolean>;
  }): Promise<InstitutionalReportDataset> {
    const { schoolId, templateName, requestedByFullName, parameters } = params;
    const catalogItem = REPORT_CATALOG_BY_NAME.get(templateName);
    const academicYear = this.parsePositiveInt(
      parameters.P_YEAR ?? parameters.YEAR,
      new Date().getFullYear(),
    );
    const periodNumber = Math.min(
      6,
      Math.max(1, this.parsePositiveInt(parameters.P_PERIOD ?? parameters.PERIOD, 1)),
    );
    const campusId = this.parseOptionalPositiveInt(
      parameters.P_CAMPUS_ID ?? parameters.CAMPUS_ID,
    );
    const groupId = this.parseOptionalPositiveInt(
      parameters.P_GROUP_ID ?? parameters.GROUP_ID,
    );
    const enrollmentId = this.parseOptionalPositiveInt(
      parameters.P_ENROLLMENT_ID ?? parameters.ENROLLMENT_ID,
    );
    const teacherProfileId = this.parseOptionalPositiveInt(
      parameters.P_TEACHER_ID ?? parameters.TEACHER_ID,
    );

    const paperParam = String(parameters.P_PAPER_SIZE ?? '').toUpperCase();
    const paperSize: ReportPaperSize =
      paperParam === 'OFICIO' || paperParam === 'LEGAL'
        ? 'LEGAL'
        : paperParam === 'CARTA' || paperParam === 'LETTER'
          ? 'LETTER'
          : (catalogItem?.paperSize ?? 'LETTER');

    const title =
      catalogItem?.title ??
      templateName.replace(/[_-]+/g, ' ').toUpperCase();

    return this.db.withTenantTransaction(schoolId, async (client) => {
      const branding = await this.loadSchoolBranding(
        client,
        schoolId,
        academicYear,
      );

      if (BULLETIN_TEMPLATES.has(templateName)) {
        const pages = await this.loadBulletinPages(client, schoolId, {
          academicYear,
          periodNumber,
          campusId,
          groupId,
          enrollmentId,
        });
        return {
          kind: 'BULLETIN',
          templateName,
          title,
          subtitle: `Año Lectivo ${academicYear} · Periodo ${periodNumber}`,
          academicYear,
          periodNumber,
          paperSize,
          orientation: 'portrait',
          generatedBy: requestedByFullName,
          branding,
          pages,
        };
      }

      if (CERTIFICATE_TEMPLATES.has(templateName)) {
        const pages = await this.loadCertificatePages(
          client,
          schoolId,
          templateName,
          { academicYear, campusId, groupId, enrollmentId },
        );
        return {
          kind: 'CERTIFICATE',
          templateName,
          title,
          subtitle: `Año Lectivo ${academicYear}`,
          academicYear,
          paperSize,
          orientation: 'portrait',
          generatedBy: requestedByFullName,
          branding,
          pages,
        };
      }

      if (templateName === 'carnets_estudiantiles') {
        const cards = await this.loadStudentCards(client, schoolId, {
          academicYear,
          campusId,
          groupId,
          enrollmentId,
        });
        return {
          kind: 'CARDS',
          templateName,
          title,
          subtitle: `Año Lectivo ${academicYear} · Carnés Estudiantiles`,
          academicYear,
          paperSize,
          orientation: 'portrait',
          generatedBy: requestedByFullName,
          branding,
          cards,
        };
      }

      const matrixResult = await this.loadMatrixDocument(
        client,
        schoolId,
        templateName,
        {
          academicYear,
          periodNumber,
          campusId,
          groupId,
          enrollmentId,
          teacherProfileId,
        },
      );

      const orientation: ReportOrientation =
        catalogItem?.orientation ??
        (matrixResult.matrix.columns.length > 7 ? 'landscape' : 'portrait');

      return {
        kind: 'MATRIX_TABLE',
        templateName,
        title,
        subtitle: matrixResult.subtitle,
        academicYear,
        periodNumber: matrixResult.usesPeriod ? periodNumber : null,
        paperSize,
        orientation,
        generatedBy: requestedByFullName,
        branding,
        matrix: matrixResult.matrix,
      };
    });
  }

  private async loadSchoolBranding(
    client: PoolClient,
    schoolId: bigint,
    academicYear: number,
  ): Promise<SchoolBrandingHeader> {
    const schoolRes = await client.query<{
      name: string;
      short_name: string | null;
      dane_code: string | null;
      nit: string | null;
      header_line_1: string | null;
      header_line_2: string | null;
      footer_text: string | null;
      address: string | null;
      phones: string | null;
      email: string | null;
      director_name: string | null;
      director_document: string | null;
      secretary_name: string | null;
      secretary_document: string | null;
      logo_url: string | null;
      shield_url: string | null;
    }>(
      `SELECT name, short_name, dane_code, tax_id AS nit, header_line_1, header_line_2,
              footer_text, address, phones, email, director_name, director_document,
              secretary_name, secretary_document, logo_url, shield_url
         FROM schools
        WHERE id = $1
        LIMIT 1`,
      [schoolId.toString()],
    );

    const scaleRes = await client.query<{
      name: string;
      abbreviation: string | null;
      min_score: string;
      max_score: string;
      hex_color: string | null;
    }>(
      `SELECT DISTINCT ON (ns.id)
              ns.name, ns.abbreviation, gs.min_score, gs.max_score, ns.hex_color
         FROM grading_scales gs
         INNER JOIN national_grading_scales ns ON ns.id = gs.national_scale_id
        WHERE gs.school_id = $1 AND gs.academic_year = $2
        ORDER BY ns.id ASC, gs.grade_group_id NULLS LAST`,
      [schoolId.toString(), academicYear],
    );

    const s = schoolRes.rows[0];
    return {
      schoolName: s?.name ?? 'Institución Educativa ASAIE ÉXODO',
      shortName: s?.short_name ?? null,
      daneCode: s?.dane_code ?? null,
      nit: s?.nit ?? null,
      headerLine1: s?.header_line_1 ?? null,
      headerLine2: s?.header_line_2 ?? null,
      footerText: s?.footer_text ?? null,
      address: s?.address ?? null,
      phones: s?.phones ?? null,
      email: s?.email ?? null,
      directorName: s?.director_name ?? null,
      directorDocument: s?.director_document ?? null,
      secretaryName: s?.secretary_name ?? null,
      secretaryDocument: s?.secretary_document ?? null,
      logoUrl: s?.logo_url ?? null,
      shieldUrl: s?.shield_url ?? null,
      scaleLegend: scaleRes.rows.map((r) => ({
        name: r.name,
        abbreviation: r.abbreviation ?? r.name.slice(0, 3).toUpperCase(),
        minScore: Number(r.min_score),
        maxScore: Number(r.max_score),
        hexColor: r.hex_color ?? '#334155',
      })),
    };
  }

  private async loadBulletinPages(
    client: PoolClient,
    schoolId: bigint,
    filter: {
      academicYear: number;
      periodNumber: number;
      campusId: number | null;
      groupId: number | null;
      enrollmentId: number | null;
    },
  ): Promise<BulletinStudentPage[]> {
    const params: unknown[] = [schoolId.toString(), filter.academicYear];
    const clauses: string[] = [];
    if (filter.enrollmentId) {
      params.push(filter.enrollmentId);
      clauses.push(`AND se.id = $${params.length}`);
    } else if (filter.groupId) {
      params.push(filter.groupId);
      clauses.push(`AND se.academic_group_id = $${params.length}`);
    } else if (filter.campusId) {
      params.push(filter.campusId);
      clauses.push(`AND se.campus_id = $${params.length}`);
    }

    const studentsRes = await client.query<{
      enrollment_id: string;
      full_name: string;
      document_number: string;
      campus_name: string;
      shift_name: string;
      grade_name: string;
      group_code: string;
      homeroom_teacher: string | null;
      registration_number: string | null;
      book_number: string | null;
      folio_number: string | null;
      group_rank: number | null;
      group_total_students: number | null;
      average_score: string | null;
    }>(
      `SELECT se.id AS enrollment_id,
              TRIM(CONCAT_WS(' ', sp.last_name, sp.second_last_name, sp.first_name, sp.middle_name)) AS full_name,
              sp.document_number,
              c.name AS campus_name,
              ss.name AS shift_name,
              g.name AS grade_name,
              ag.group_code,
              TRIM(CONCAT_WS(' ', ht.first_name, ht.last_name)) AS homeroom_teacher,
              se.registration_number,
              se.book_number,
              se.folio_number,
              spr.group_rank,
              spr.group_total_students,
              spr.average_score
         FROM student_enrollments se
         INNER JOIN student_profiles sp ON sp.school_id = se.school_id AND sp.id = se.student_profile_id
         INNER JOIN campuses c ON c.school_id = se.school_id AND c.id = se.campus_id
         INNER JOIN school_shifts ss ON ss.school_id = se.school_id AND ss.id = se.shift_id
         INNER JOIN grades g ON g.school_id = se.school_id AND g.id = se.grade_id
         INNER JOIN academic_groups ag ON ag.school_id = se.school_id AND ag.id = se.academic_group_id
         LEFT JOIN teacher_profiles ht ON ht.school_id = ag.school_id AND ht.id = ag.homeroom_teacher_id
         LEFT JOIN student_period_rankings spr
           ON spr.school_id = se.school_id
          AND spr.academic_year = se.academic_year
          AND spr.enrollment_id = se.id
          AND spr.period_number = ${filter.periodNumber}
        WHERE se.school_id = $1
          AND se.academic_year = $2
          AND se.enrollment_status_id = 2
          ${clauses.join(' ')}
        ORDER BY g.display_order ASC, ag.group_code ASC, full_name ASC
        LIMIT 80`,
      params,
    );

    if (studentsRes.rows.length === 0) {
      return [];
    }

    const enrollmentIds = studentsRes.rows.map((r) => Number(r.enrollment_id));

    // Cargar todas las notas P1..Pn de los estudiantes en 1 query set-based
    const scoresRes = await client.query<{
      academic_score_id: string;
      enrollment_id: string;
      academic_area_id: string | null;
      area_name: string;
      area_order: number;
      subject_id: string;
      subject_name: string;
      subject_order: number;
      teacher_name: string;
      weekly_hours: string;
      period_number: number;
      effective_score: string;
      scale_name: string | null;
      scale_abbr: string | null;
      scale_color: string | null;
      is_failed: boolean;
      absences: number;
    }>(
      `SELECT v.academic_score_id,
              v.enrollment_id,
              v.academic_area_id,
              COALESCE(aa.name, 'ÁREA GENERAL') AS area_name,
              COALESCE(aa.display_order, 999) AS area_order,
              v.subject_id,
              s.name AS subject_name,
              COALESCE(s.display_order, 999) AS subject_order,
              TRIM(CONCAT_WS(' ', tp.first_name, tp.last_name)) AS teacher_name,
              v.weekly_hours,
              v.period_number,
              v.effective_score,
              ngs.name AS scale_name,
              ngs.abbreviation AS scale_abbr,
              ngs.hex_color AS scale_color,
              (
                v.effective_score <= COALESCE(
                  (SELECT MAX(gs.max_score) FROM grading_scales gs
                    WHERE gs.school_id = v.school_id AND gs.academic_year = v.academic_year
                      AND gs.is_failing = TRUE
                      AND (gs.grade_group_id IS NULL OR gs.grade_group_id = v.grade_group_id)),
                  2.99
                )
              ) AS is_failed,
              (v.justified_absences + v.unjustified_absences)::integer AS absences
         FROM v_siee_subject_period_scores v
         INNER JOIN subjects s ON s.school_id = v.school_id AND s.id = v.subject_id
         LEFT JOIN academic_areas aa ON aa.school_id = v.school_id AND aa.id = v.academic_area_id
         LEFT JOIN teacher_profiles tp ON tp.school_id = v.school_id AND tp.id = v.teacher_profile_id
         LEFT JOIN national_grading_scales ngs ON ngs.id = v.national_scale_id
        WHERE v.school_id = $1
          AND v.academic_year = $2
          AND v.enrollment_id = ANY($3::bigint[])
          AND v.period_number <= $4
        ORDER BY v.enrollment_id, area_order, area_name, subject_order, subject_name, v.period_number`,
      [schoolId.toString(), filter.academicYear, enrollmentIds, filter.periodNumber],
    );

    // Cargar promedios oficiales de área para el periodo solicitado
    const areaScoresRes = await client.query<{
      enrollment_id: string;
      academic_area_id: string;
      area_score: string;
      is_area_failed: boolean;
    }>(
      `SELECT enrollment_id, academic_area_id, area_score, is_area_failed
         FROM v_siee_area_period_scores
        WHERE school_id = $1
          AND academic_year = $2
          AND period_number = $3
          AND enrollment_id = ANY($4::bigint[])`,
      [schoolId.toString(), filter.academicYear, filter.periodNumber, enrollmentIds],
    );
    const areaScoreMap = new Map<string, { score: number; failed: boolean }>();
    for (const r of areaScoresRes.rows) {
      areaScoreMap.set(`${r.enrollment_id}:${r.academic_area_id}`, {
        score: Number(r.area_score),
        failed: Boolean(r.is_area_failed),
      });
    }

    // Cargar logros y sugerencias asignados al periodo actual
    const currentScoreIds = scoresRes.rows
      .filter((r) => Number(r.period_number) === filter.periodNumber)
      .map((r) => Number(r.academic_score_id));

    const achievementsByScoreId = new Map<number, string[]>();
    const suggestionsByScoreId = new Map<number, string[]>();

    if (currentScoreIds.length > 0) {
      const achRes = await client.query<{
        academic_score_id: string;
        description: string;
      }>(
        `SELECT asa.academic_score_id, ast.description
           FROM academic_score_achievements asa
           INNER JOIN achievement_standards ast
             ON ast.school_id = asa.school_id AND ast.id = asa.achievement_standard_id
          WHERE asa.school_id = $1
            AND asa.academic_year = $2
            AND asa.academic_score_id = ANY($3::bigint[])
          ORDER BY asa.academic_score_id, ast.sequence_number NULLS LAST, ast.id`,
        [schoolId.toString(), filter.academicYear, currentScoreIds],
      );
      for (const r of achRes.rows) {
        const sid = Number(r.academic_score_id);
        const list = achievementsByScoreId.get(sid) ?? [];
        list.push(r.description);
        achievementsByScoreId.set(sid, list);
      }

      const sugRes = await client.query<{
        academic_score_id: string;
        description: string;
      }>(
        `SELECT ass.academic_score_id, sug.description
           FROM academic_score_suggestions ass
           INNER JOIN academic_suggestions sug
             ON sug.school_id = ass.school_id AND sug.id = ass.suggestion_id
          WHERE ass.school_id = $1
            AND ass.academic_year = $2
            AND ass.academic_score_id = ANY($3::bigint[])
          ORDER BY ass.academic_score_id, sug.id`,
        [schoolId.toString(), filter.academicYear, currentScoreIds],
      );
      for (const r of sugRes.rows) {
        const sid = Number(r.academic_score_id);
        const list = suggestionsByScoreId.get(sid) ?? [];
        list.push(r.description);
        suggestionsByScoreId.set(sid, list);
      }
    }

    const rowsByEnrollment = new Map<number, typeof scoresRes.rows>();
    for (const r of scoresRes.rows) {
      const eid = Number(r.enrollment_id);
      const list = rowsByEnrollment.get(eid) ?? [];
      list.push(r);
      rowsByEnrollment.set(eid, list);
    }

    return studentsRes.rows.map((st) => {
      const eid = Number(st.enrollment_id);
      const stScores = rowsByEnrollment.get(eid) ?? [];

      const areaGroups = new Map<
        string,
        {
          areaId: string;
          areaName: string;
          subjectsMap: Map<
            number,
            {
              subjectName: string;
              teacherName: string;
              weeklyHours: number;
              periodScores: Record<number, number>;
              currentScore: number;
              currentScoreId: number | null;
              scaleName: string;
              scaleAbbreviation: string;
              scaleColor: string;
              isFailed: boolean;
              absences: number;
            }
          >;
        }
      >();

      let totalAbsences = 0;
      let currentSum = 0;
      let currentCount = 0;

      for (const row of stScores) {
        const areaId = row.academic_area_id ?? '0';
        const areaKey = `${areaId}:${row.area_name}`;
        let areaBucket = areaGroups.get(areaKey);
        if (!areaBucket) {
          areaBucket = {
            areaId,
            areaName: row.area_name,
            subjectsMap: new Map(),
          };
          areaGroups.set(areaKey, areaBucket);
        }

        const subjId = Number(row.subject_id);
        let subj = areaBucket.subjectsMap.get(subjId);
        if (!subj) {
          subj = {
            subjectName: row.subject_name,
            teacherName: row.teacher_name,
            weeklyHours: Number(row.weekly_hours),
            periodScores: {},
            currentScore: 0,
            currentScoreId: null,
            scaleName: row.scale_name ?? 'Sin escala',
            scaleAbbreviation: row.scale_abbr ?? '-',
            scaleColor: row.scale_color ?? '#334155',
            isFailed: false,
            absences: 0,
          };
          areaBucket.subjectsMap.set(subjId, subj);
        }

        const pNum = Number(row.period_number);
        const eff = Number(row.effective_score);
        subj.periodScores[pNum] = eff;
        if (pNum === filter.periodNumber) {
          subj.currentScore = eff;
          subj.currentScoreId = Number(row.academic_score_id);
          subj.scaleName = row.scale_name ?? 'Sin escala';
          subj.scaleAbbreviation = row.scale_abbr ?? '-';
          subj.scaleColor = row.scale_color ?? '#334155';
          subj.isFailed = Boolean(row.is_failed);
          subj.absences = Number(row.absences);
          totalAbsences += subj.absences;
          currentSum += eff;
          currentCount += 1;
        }
      }

      const areas = Array.from(areaGroups.values()).map((ab) => {
        const subjects = Array.from(ab.subjectsMap.values()).map((s) => ({
          subjectName: s.subjectName,
          teacherName: s.teacherName,
          weeklyHours: s.weeklyHours,
          periodScores: s.periodScores,
          currentScore: s.currentScore,
          scaleName: s.scaleName,
          scaleAbbreviation: s.scaleAbbreviation,
          scaleColor: s.scaleColor,
          isFailed: s.isFailed,
          absences: s.absences,
          achievements: s.currentScoreId
            ? (achievementsByScoreId.get(s.currentScoreId) ?? [])
            : [],
          suggestions: s.currentScoreId
            ? (suggestionsByScoreId.get(s.currentScoreId) ?? [])
            : [],
        }));

        const officialArea = areaScoreMap.get(`${eid}:${ab.areaId}`);
        const fallbackAvg =
          subjects.length > 0
            ? Number(
                (
                  subjects.reduce((acc, item) => acc + item.currentScore, 0) /
                  subjects.length
                ).toFixed(2),
              )
            : 0;

        return {
          areaName: ab.areaName,
          areaScore: officialArea?.score ?? fallbackAvg,
          isAreaFailed: officialArea?.failed ?? false,
          subjects,
        };
      });

      const computedAvg =
        st.average_score !== null
          ? Number(st.average_score)
          : currentCount > 0
            ? Number((currentSum / currentCount).toFixed(2))
            : 0;

      return {
        enrollmentId: eid,
        studentFullName: st.full_name,
        documentNumber: st.document_number,
        campusName: st.campus_name,
        shiftName: st.shift_name,
        gradeName: st.grade_name,
        groupCode: st.group_code,
        homeroomTeacherName: st.homeroom_teacher || null,
        registrationNumber: st.registration_number,
        bookNumber: st.book_number,
        folioNumber: st.folio_number,
        groupRank: st.group_rank !== null ? Number(st.group_rank) : null,
        groupTotalStudents:
          st.group_total_students !== null
            ? Number(st.group_total_students)
            : null,
        averageScore: computedAvg,
        totalAbsences,
        areas,
      };
    });
  }

  private async loadCertificatePages(
    client: PoolClient,
    schoolId: bigint,
    templateName: string,
    filter: {
      academicYear: number;
      campusId: number | null;
      groupId: number | null;
      enrollmentId: number | null;
    },
  ): Promise<CertificateDocumentPage[]> {
    const documentKind: CertificateDocumentPage['documentKind'] =
      templateName === 'constancia_estudio'
        ? 'CONSTANCIA'
        : templateName === 'certificado_calificaciones'
          ? 'CERTIFICADO'
          : templateName === 'acta_grado'
            ? 'ACTA_GRADO'
            : 'FICHA_MATRICULA';

    const params: unknown[] = [schoolId.toString(), filter.academicYear];
    const clauses: string[] = [];
    if (filter.enrollmentId) {
      params.push(filter.enrollmentId);
      clauses.push(`AND se.id = $${params.length}`);
    } else if (filter.groupId) {
      params.push(filter.groupId);
      clauses.push(`AND se.academic_group_id = $${params.length}`);
    } else if (filter.campusId) {
      params.push(filter.campusId);
      clauses.push(`AND se.campus_id = $${params.length}`);
    }

    const res = await client.query<{
      enrollment_id: string;
      student_profile_id: string;
      full_name: string;
      doc_type_code: string | null;
      document_number: string;
      birth_date: string | null;
      address: string | null;
      phone: string | null;
      email: string | null;
      blood_type: string | null;
      campus_name: string;
      shift_name: string;
      grade_name: string;
      group_code: string;
      enrollment_status_name: string;
      registration_number: string | null;
      book_number: string | null;
      folio_number: string | null;
      promotion_desc: string | null;
      act_number: string | null;
      diploma_number: string | null;
      graduation_folio: string | null;
      final_average: string | null;
    }>(
      `SELECT se.id AS enrollment_id,
              se.student_profile_id,
              TRIM(CONCAT_WS(' ', sp.last_name, sp.second_last_name, sp.first_name, sp.middle_name)) AS full_name,
              dt.code AS doc_type_code,
              sp.document_number,
              sp.birth_date::text,
              sp.address,
              sp.phone,
              sp.email,
              sp.blood_type,
              c.name AS campus_name,
              ss.name AS shift_name,
              g.name AS grade_name,
              ag.group_code,
              es.name AS enrollment_status_name,
              se.registration_number,
              se.book_number,
              se.folio_number,
              psc.description AS promotion_desc,
              pr.act_number,
              pr.diploma_number,
              pr.graduation_folio,
              pr.final_average
         FROM student_enrollments se
         INNER JOIN student_profiles sp ON sp.school_id = se.school_id AND sp.id = se.student_profile_id
         LEFT JOIN document_types dt ON dt.id = sp.document_type_id
         INNER JOIN campuses c ON c.school_id = se.school_id AND c.id = se.campus_id
         INNER JOIN school_shifts ss ON ss.school_id = se.school_id AND ss.id = se.shift_id
         INNER JOIN grades g ON g.school_id = se.school_id AND g.id = se.grade_id
         INNER JOIN academic_groups ag ON ag.school_id = se.school_id AND ag.id = se.academic_group_id
         INNER JOIN enrollment_statuses es ON es.id = se.enrollment_status_id
         LEFT JOIN promotion_records pr ON pr.school_id = se.school_id AND pr.enrollment_id = se.id
         LEFT JOIN promotion_statuses_catalog psc ON psc.id = COALESCE(pr.promotion_status_id, se.promotion_status_id)
        WHERE se.school_id = $1
          AND se.academic_year = $2
          ${clauses.join(' ')}
        ORDER BY g.display_order ASC, ag.group_code ASC, full_name ASC
        LIMIT 50`,
      params,
    );

    if (res.rows.length === 0) {
      return [];
    }

    const enrIds = res.rows.map((r) => Number(r.enrollment_id));
    const spIds = res.rows.map((r) => Number(r.student_profile_id));

    const guardiansByStudent = new Map<
      number,
      CertificateDocumentPage['guardians']
    >();
    const famRes = await client.query<{
      student_profile_id: string;
      full_name: string;
      document_number: string;
      phone: string | null;
      relationship: string;
    }>(
      `SELECT sfl.student_profile_id,
              fp.full_name,
              fp.document_number,
              COALESCE(fp.mobile_phone, fp.phone) AS phone,
              COALESCE(frt.name, 'Acudiente') AS relationship
         FROM student_family_links sfl
         INNER JOIN family_profiles fp ON fp.school_id = sfl.school_id AND fp.id = sfl.family_profile_id
         LEFT JOIN family_relationship_types frt ON frt.id = sfl.relationship_type_id
        WHERE sfl.school_id = $1 AND sfl.student_profile_id = ANY($2::bigint[])
        ORDER BY sfl.is_primary_guardian DESC, sfl.id ASC`,
      [schoolId.toString(), spIds],
    );
    for (const f of famRes.rows) {
      const sid = Number(f.student_profile_id);
      const list = guardiansByStudent.get(sid) ?? [];
      list.push({
        fullName: f.full_name,
        documentNumber: f.document_number,
        phone: f.phone,
        relationship: f.relationship,
      });
      guardiansByStudent.set(sid, list);
    }

    const subjectsByEnr = new Map<number, CertificateDocumentPage['subjects']>();
    if (documentKind === 'CERTIFICADO' || documentKind === 'ACTA_GRADO') {
      const subjRes = await client.query<{
        enrollment_id: string;
        area_name: string;
        subject_name: string;
        weekly_hours: string;
        annual_score: string;
        final_recovery_score: string | null;
        final_effective_score: string;
        scale_name: string | null;
      }>(
        `SELECT v.enrollment_id,
                COALESCE(aa.name, 'Sin área') AS area_name,
                s.name AS subject_name,
                v.weekly_hours,
                v.annual_score,
                v.final_recovery_score,
                v.final_effective_score,
                ngs.name AS scale_name
           FROM v_siee_subject_annual_scores v
           INNER JOIN subjects s ON s.school_id = v.school_id AND s.id = v.subject_id
           LEFT JOIN academic_areas aa ON aa.school_id = v.school_id AND aa.id = v.academic_area_id
           LEFT JOIN national_grading_scales ngs
             ON ngs.id = fn_siee_resolve_scale(v.school_id, v.academic_year, v.grade_group_id, v.final_effective_score, 2)
          WHERE v.school_id = $1
            AND v.academic_year = $2
            AND v.enrollment_id = ANY($3::bigint[])
          ORDER BY COALESCE(aa.display_order, 999), s.display_order, s.name`,
        [schoolId.toString(), filter.academicYear, enrIds],
      );
      for (const sr of subjRes.rows) {
        const eid = Number(sr.enrollment_id);
        const list = subjectsByEnr.get(eid) ?? [];
        list.push({
          areaName: sr.area_name,
          subjectName: sr.subject_name,
          weeklyHours: Number(sr.weekly_hours),
          annualScore: Number(sr.annual_score),
          recoveryScore:
            sr.final_recovery_score !== null
              ? Number(sr.final_recovery_score)
              : null,
          finalEffectiveScore: Number(sr.final_effective_score),
          scaleName: sr.scale_name ?? 'Sin escala',
        });
        subjectsByEnr.set(eid, list);
      }
    }

    // Asignar consecutivo oficial para Constancias y Certificados
    const pages: CertificateDocumentPage[] = [];
    for (const row of res.rows) {
      let consecutiveNumber = row.act_number ?? row.registration_number ?? 'S/N';
      if (documentKind === 'CONSTANCIA' || documentKind === 'CERTIFICADO') {
        const seqRes = await client.query<{ last_number: number }>(
          `INSERT INTO document_number_sequences (
             school_id, academic_year, document_type, last_number, updated_at
           )
           VALUES ($1, $2, $3, 1, NOW())
           ON CONFLICT (school_id, academic_year, document_type)
           DO UPDATE SET last_number = document_number_sequences.last_number + 1, updated_at = NOW()
           RETURNING last_number`,
          [schoolId.toString(), filter.academicYear, documentKind],
        );
        consecutiveNumber = `${documentKind.slice(0, 4)}-${filter.academicYear}-${String(seqRes.rows[0].last_number).padStart(4, '0')}`;
      }

      pages.push({
        documentKind,
        consecutiveNumber,
        enrollmentId: Number(row.enrollment_id),
        studentFullName: row.full_name,
        documentTypeCode: row.doc_type_code ?? 'TI',
        documentNumber: row.document_number,
        birthDate: row.birth_date,
        address: row.address,
        phone: row.phone,
        email: row.email,
        bloodType: row.blood_type,
        campusName: row.campus_name,
        shiftName: row.shift_name,
        gradeName: row.grade_name,
        groupCode: row.group_code,
        enrollmentStatusName: row.enrollment_status_name,
        registrationNumber: row.registration_number,
        bookNumber: row.book_number,
        folioNumber: row.folio_number,
        promotionStatusDescription: row.promotion_desc,
        actNumber: row.act_number,
        diplomaNumber: row.diploma_number,
        graduationFolio: row.graduation_folio,
        finalAverage:
          row.final_average !== null ? Number(row.final_average) : null,
        guardians: guardiansByStudent.get(Number(row.student_profile_id)) ?? [],
        subjects: subjectsByEnr.get(Number(row.enrollment_id)) ?? [],
      });
    }

    return pages;
  }

  private async loadStudentCards(
    client: PoolClient,
    schoolId: bigint,
    filter: {
      academicYear: number;
      campusId: number | null;
      groupId: number | null;
      enrollmentId: number | null;
    },
  ): Promise<StudentCardItem[]> {
    const params: unknown[] = [schoolId.toString(), filter.academicYear];
    const clauses: string[] = [];
    if (filter.enrollmentId) {
      params.push(filter.enrollmentId);
      clauses.push(`AND se.id = $${params.length}`);
    } else if (filter.groupId) {
      params.push(filter.groupId);
      clauses.push(`AND se.academic_group_id = $${params.length}`);
    } else if (filter.campusId) {
      params.push(filter.campusId);
      clauses.push(`AND se.campus_id = $${params.length}`);
    }

    const res = await client.query<{
      enrollment_id: string;
      full_name: string;
      document_number: string;
      grade_group: string;
      campus_name: string;
      shift_name: string;
      blood_type: string | null;
    }>(
      `SELECT se.id AS enrollment_id,
              TRIM(CONCAT_WS(' ', sp.last_name, sp.second_last_name, sp.first_name, sp.middle_name)) AS full_name,
              sp.document_number,
              CONCAT(g.name, ' - ', ag.group_code) AS grade_group,
              c.name AS campus_name,
              ss.name AS shift_name,
              sp.blood_type
         FROM student_enrollments se
         INNER JOIN student_profiles sp ON sp.school_id = se.school_id AND sp.id = se.student_profile_id
         INNER JOIN campuses c ON c.school_id = se.school_id AND c.id = se.campus_id
         INNER JOIN school_shifts ss ON ss.school_id = se.school_id AND ss.id = se.shift_id
         INNER JOIN grades g ON g.school_id = se.school_id AND g.id = se.grade_id
         INNER JOIN academic_groups ag ON ag.school_id = se.school_id AND ag.id = se.academic_group_id
        WHERE se.school_id = $1
          AND se.academic_year = $2
          AND se.enrollment_status_id = 2
          ${clauses.join(' ')}
        ORDER BY g.display_order ASC, ag.group_code ASC, full_name ASC
        LIMIT 200`,
      params,
    );

    return res.rows.map((r) => ({
      enrollmentId: Number(r.enrollment_id),
      studentFullName: r.full_name,
      documentNumber: r.document_number,
      gradeGroup: r.grade_group,
      campusName: r.campus_name,
      shiftName: r.shift_name,
      bloodType: r.blood_type,
      academicYear: filter.academicYear,
    }));
  }

  private async loadMatrixDocument(
    client: PoolClient,
    schoolId: bigint,
    templateName: string,
    filter: {
      academicYear: number;
      periodNumber: number;
      campusId: number | null;
      groupId: number | null;
      enrollmentId: number | null;
      teacherProfileId: number | null;
    },
  ): Promise<{ subtitle: string; usesPeriod: boolean; matrix: MatrixTableDocument }> {
    const schoolParam = schoolId.toString();

    // 1. Consolidados por asignaturas / áreas / docente
    if (
      templateName === 'consolidado_asignaturas' ||
      templateName === 'consolidado_areas' ||
      templateName === 'consolidado_docentes'
    ) {
      const byAreas = templateName === 'consolidado_areas';
      const params: unknown[] = [schoolParam, filter.academicYear, filter.periodNumber];
      const clauses: string[] = [];
      if (filter.groupId) {
        params.push(filter.groupId);
        clauses.push(`AND v.academic_group_id = $${params.length}`);
      } else if (filter.campusId) {
        params.push(filter.campusId);
        clauses.push(`AND v.campus_id = $${params.length}`);
      }
      if (templateName === 'consolidado_docentes' && filter.teacherProfileId) {
        params.push(filter.teacherProfileId);
        clauses.push(`AND v.teacher_profile_id = $${params.length}`);
      }

      const sql = byAreas
        ? `SELECT v.enrollment_id, sp.document_number,
                  TRIM(CONCAT_WS(' ', sp.last_name, sp.second_last_name, sp.first_name)) AS full_name,
                  CONCAT(g.name, '-', ag.group_code) AS grade_group,
                  v.academic_area_id AS entity_id,
                  COALESCE(aa.abbreviation, LEFT(aa.name, 10), 'AREA') AS entity_label,
                  v.area_score AS score,
                  v.is_area_failed AS is_failed
             FROM v_siee_area_period_scores v
             INNER JOIN student_profiles sp ON sp.school_id = v.school_id AND sp.id = v.student_profile_id
             INNER JOIN grades g ON g.school_id = v.school_id AND g.id = v.grade_id
             INNER JOIN academic_groups ag ON ag.school_id = v.school_id AND ag.id = v.academic_group_id
             LEFT JOIN academic_areas aa ON aa.school_id = v.school_id AND aa.id = v.academic_area_id
            WHERE v.school_id = $1 AND v.academic_year = $2 AND v.period_number = $3
              AND v.enrollment_status_id = 2 ${clauses.join(' ')}
            ORDER BY g.display_order, ag.group_code, full_name, COALESCE(aa.display_order, 999)
            LIMIT 8000`
        : `SELECT v.enrollment_id, sp.document_number,
                  TRIM(CONCAT_WS(' ', sp.last_name, sp.second_last_name, sp.first_name)) AS full_name,
                  CONCAT(g.name, '-', ag.group_code) AS grade_group,
                  v.subject_id AS entity_id,
                  COALESCE(s.abbreviation, LEFT(s.name, 10)) AS entity_label,
                  v.effective_score AS score,
                  (v.effective_score <= COALESCE(
                    (SELECT MAX(gs.max_score) FROM grading_scales gs
                      WHERE gs.school_id = v.school_id AND gs.academic_year = v.academic_year
                        AND gs.is_failing = TRUE
                        AND (gs.grade_group_id IS NULL OR gs.grade_group_id = v.grade_group_id)),
                    2.99
                  )) AS is_failed
             FROM v_siee_subject_period_scores v
             INNER JOIN student_profiles sp ON sp.school_id = v.school_id AND sp.id = v.student_profile_id
             INNER JOIN grades g ON g.school_id = v.school_id AND g.id = v.grade_id
             INNER JOIN academic_groups ag ON ag.school_id = v.school_id AND ag.id = v.academic_group_id
             INNER JOIN subjects s ON s.school_id = v.school_id AND s.id = v.subject_id
            WHERE v.school_id = $1 AND v.academic_year = $2 AND v.period_number = $3
              AND v.enrollment_status_id = 2 AND v.is_excluded_from_average = FALSE
              ${clauses.join(' ')}
            ORDER BY g.display_order, ag.group_code, full_name, s.display_order
            LIMIT 8000`;

      const res = await client.query<{
        enrollment_id: string;
        document_number: string;
        full_name: string;
        grade_group: string;
        entity_id: string;
        entity_label: string;
        score: string;
        is_failed: boolean;
      }>(sql, params);

      const entityCols = new Map<string, string>();
      const studentBuckets = new Map<
        number,
        {
          fullName: string;
          doc: string;
          gradeGroup: string;
          scores: Record<string, { score: number; isFailed: boolean }>;
        }
      >();

      for (const r of res.rows) {
        const colKey = `c_${r.entity_id}`;
        if (!entityCols.has(colKey)) {
          entityCols.set(colKey, r.entity_label);
        }
        const eid = Number(r.enrollment_id);
        let st = studentBuckets.get(eid);
        if (!st) {
          st = {
            fullName: r.full_name,
            doc: r.document_number,
            gradeGroup: r.grade_group,
            scores: {},
          };
          studentBuckets.set(eid, st);
        }
        st.scores[colKey] = { score: Number(r.score), isFailed: Boolean(r.is_failed) };
      }

      const columns: MatrixColumnDef[] = [
        { key: 'seq', label: '#', align: 'center' },
        { key: 'student', label: 'Estudiante', align: 'left' },
        { key: 'group', label: 'Grupo', align: 'center' },
        ...Array.from(entityCols.entries()).map(([key, label]) => ({
          key,
          label,
          align: 'center' as const,
          isScore: true,
        })),
        { key: 'avg', label: 'Prom', align: 'center', isScore: true },
        { key: 'failed', label: 'Rep', align: 'center' },
      ];

      const rows: Array<Record<string, string | number | null>> = [];
      const failingCellKeys: string[] = [];
      const failedTotals: Record<string, string | number> = {
        seq: '',
        student: 'TOTAL REPROBADOS POR COLUMNA',
        group: '',
      };
      for (const colKey of entityCols.keys()) {
        failedTotals[colKey] = 0;
      }

      let idx = 0;
      let totalWithFailures = 0;
      for (const st of studentBuckets.values()) {
        const rowObj: Record<string, string | number | null> = {
          seq: idx + 1,
          student: st.fullName,
          group: st.gradeGroup,
        };
        let sum = 0;
        let cnt = 0;
        let failedCnt = 0;
        for (const colKey of entityCols.keys()) {
          const cell = st.scores[colKey];
          if (cell) {
            rowObj[colKey] = cell.score;
            sum += cell.score;
            cnt += 1;
            if (cell.isFailed) {
              failedCnt += 1;
              failingCellKeys.push(`${idx}:${colKey}`);
              failedTotals[colKey] = Number(failedTotals[colKey]) + 1;
            }
          } else {
            rowObj[colKey] = null;
          }
        }
        rowObj['avg'] = cnt > 0 ? Number((sum / cnt).toFixed(2)) : 0;
        rowObj['failed'] = failedCnt;
        if (failedCnt > 0) {
          failingCellKeys.push(`${idx}:failed`);
          totalWithFailures += 1;
        }
        rows.push(rowObj);
        idx += 1;
      }
      failedTotals['avg'] = '';
      failedTotals['failed'] = totalWithFailures;

      return {
        subtitle: `Año Lectivo ${filter.academicYear} · Periodo ${filter.periodNumber}`,
        usesPeriod: true,
        matrix: {
          columns,
          rows,
          failingCellKeys,
          footerTotals: failedTotals,
          summaryBadges: [
            { label: 'Estudiantes', value: String(rows.length) },
            { label: 'Sin reprobaciones', value: String(rows.length - totalWithFailures) },
            { label: 'Con reprobaciones', value: String(totalWithFailures) },
          ],
        },
      };
    }

    // 2. Preinformes académicos
    if (templateName === 'preinformes_periodo') {
      const params: unknown[] = [schoolParam, filter.academicYear, filter.periodNumber];
      const clauses: string[] = [];
      if (filter.groupId) {
        params.push(filter.groupId);
        clauses.push(`AND se.academic_group_id = $${params.length}`);
      }
      const res = await client.query<{
        full_name: string;
        grade_group: string;
        subject_name: string;
        teacher_name: string;
        partial_score: string | null;
        observations: string | null;
      }>(
        `SELECT TRIM(CONCAT_WS(' ', sp.last_name, sp.second_last_name, sp.first_name)) AS full_name,
                CONCAT(g.name, '-', ag.group_code) AS grade_group,
                s.name AS subject_name,
                TRIM(CONCAT_WS(' ', tp.first_name, tp.last_name)) AS teacher_name,
                pr.partial_score,
                pr.observations
           FROM academic_pre_reports pr
           INNER JOIN student_enrollments se ON se.school_id = pr.school_id AND se.id = pr.enrollment_id AND se.enrollment_status_id = 2
           INNER JOIN student_profiles sp ON sp.school_id = se.school_id AND sp.id = se.student_profile_id
           INNER JOIN grades g ON g.school_id = se.school_id AND g.id = se.grade_id
           INNER JOIN academic_groups ag ON ag.school_id = se.school_id AND ag.id = se.academic_group_id
           INNER JOIN course_assignments ca ON ca.school_id = pr.school_id AND ca.id = pr.course_assignment_id
           INNER JOIN subjects s ON s.school_id = ca.school_id AND s.id = ca.subject_id
           INNER JOIN teacher_profiles tp ON tp.school_id = ca.school_id AND tp.id = ca.teacher_profile_id
          WHERE pr.school_id = $1 AND pr.academic_year = $2 AND pr.period_number = $3 AND pr.is_active = TRUE
            ${clauses.join(' ')}
          ORDER BY g.display_order, ag.group_code, full_name, s.name
          LIMIT 500`,
        params,
      );

      return {
        subtitle: `Año Lectivo ${filter.academicYear} · Periodo ${filter.periodNumber}`,
        usesPeriod: true,
        matrix: {
          columns: [
            { key: 'seq', label: '#', align: 'center' },
            { key: 'group', label: 'Grupo', align: 'center' },
            { key: 'student', label: 'Estudiante' },
            { key: 'subject', label: 'Asignatura' },
            { key: 'teacher', label: 'Docente' },
            { key: 'score', label: 'Parcial', align: 'center', isScore: true },
            { key: 'observations', label: 'Observaciones / Recomendación' },
          ],
          rows: res.rows.map((r, i) => ({
            seq: i + 1,
            group: r.grade_group,
            student: r.full_name,
            subject: r.subject_name,
            teacher: r.teacher_name,
            score: r.partial_score !== null ? Number(r.partial_score) : null,
            observations: r.observations ?? 'Alerta preventiva de bajo rendimiento',
          })),
          failingCellKeys: res.rows.map((_, i) => `${i}:score`),
          summaryBadges: [{ label: 'Alertas activas', value: String(res.rows.length) }],
        },
      };
    }

    // 3. Estadísticas de desempeño nacional
    if (templateName === 'estadisticas_desempeno') {
      const params: unknown[] = [schoolParam, filter.academicYear, filter.periodNumber];
      const clauses: string[] = [];
      if (filter.groupId) {
        params.push(filter.groupId);
        clauses.push(`AND v.academic_group_id = $${params.length}`);
      } else if (filter.campusId) {
        params.push(filter.campusId);
        clauses.push(`AND v.campus_id = $${params.length}`);
      }
      const res = await client.query<{
        grade_group: string;
        subject_name: string;
        total_cnt: string;
        bajo_cnt: string;
        basico_cnt: string;
        alto_cnt: string;
        superior_cnt: string;
        avg_score: string;
      }>(
        `SELECT CONCAT(g.name, '-', ag.group_code) AS grade_group,
                s.name AS subject_name,
                COUNT(*)::text AS total_cnt,
                COUNT(*) FILTER (WHERE v.national_scale_id = 1)::text AS bajo_cnt,
                COUNT(*) FILTER (WHERE v.national_scale_id = 2)::text AS basico_cnt,
                COUNT(*) FILTER (WHERE v.national_scale_id = 3)::text AS alto_cnt,
                COUNT(*) FILTER (WHERE v.national_scale_id = 4)::text AS superior_cnt,
                ROUND(AVG(v.effective_score)::numeric, 2)::text AS avg_score
           FROM v_siee_subject_period_scores v
           INNER JOIN grades g ON g.school_id = v.school_id AND g.id = v.grade_id
           INNER JOIN academic_groups ag ON ag.school_id = v.school_id AND ag.id = v.academic_group_id
           INNER JOIN subjects s ON s.school_id = v.school_id AND s.id = v.subject_id
          WHERE v.school_id = $1 AND v.academic_year = $2 AND v.period_number = $3
            AND v.enrollment_status_id = 2 ${clauses.join(' ')}
          GROUP BY g.display_order, g.name, ag.group_code, s.name
          ORDER BY g.display_order, ag.group_code, s.name
          LIMIT 500`,
        params,
      );

      return {
        subtitle: `Año Lectivo ${filter.academicYear} · Periodo ${filter.periodNumber}`,
        usesPeriod: true,
        matrix: {
          columns: [
            { key: 'group', label: 'Grupo', align: 'center' },
            { key: 'subject', label: 'Asignatura' },
            { key: 'total', label: 'Eval.', align: 'center' },
            { key: 'bajo', label: 'Bajo', align: 'center' },
            { key: 'basico', label: 'Básico', align: 'center' },
            { key: 'alto', label: 'Alto', align: 'center' },
            { key: 'superior', label: 'Superior', align: 'center' },
            { key: 'avg', label: 'Promedio', align: 'center', isScore: true },
          ],
          rows: res.rows.map((r) => ({
            group: r.grade_group,
            subject: r.subject_name,
            total: Number(r.total_cnt),
            bajo: Number(r.bajo_cnt),
            basico: Number(r.basico_cnt),
            alto: Number(r.alto_cnt),
            superior: Number(r.superior_cnt),
            avg: Number(r.avg_score),
          })),
          failingCellKeys: res.rows
            .map((r, i) => (Number(r.bajo_cnt) > 0 ? `${i}:bajo` : ''))
            .filter(Boolean),
          summaryBadges: [{ label: 'Cursos analizados', value: String(res.rows.length) }],
        },
      };
    }

    // 4. Estudiantes reprobados por periodo
    if (templateName === 'reprobados_periodo') {
      const params: unknown[] = [schoolParam, filter.academicYear, filter.periodNumber];
      const clauses: string[] = [];
      if (filter.groupId) {
        params.push(filter.groupId);
        clauses.push(`AND v.academic_group_id = $${params.length}`);
      } else if (filter.campusId) {
        params.push(filter.campusId);
        clauses.push(`AND v.campus_id = $${params.length}`);
      }
      const res = await client.query<{
        full_name: string;
        document_number: string;
        grade_group: string;
        failed_count: string;
        failed_subjects: string;
        avg_score: string;
      }>(
        `SELECT TRIM(CONCAT_WS(' ', sp.last_name, sp.second_last_name, sp.first_name)) AS full_name,
                sp.document_number,
                CONCAT(g.name, '-', ag.group_code) AS grade_group,
                COUNT(*)::text AS failed_count,
                STRING_AGG(CONCAT(s.name, ' (', TO_CHAR(v.effective_score, 'FM990.00'), ')'), ', ' ORDER BY s.name) AS failed_subjects,
                ROUND(AVG(v.effective_score)::numeric, 2)::text AS avg_score
           FROM v_siee_subject_period_scores v
           INNER JOIN student_profiles sp ON sp.school_id = v.school_id AND sp.id = v.student_profile_id
           INNER JOIN grades g ON g.school_id = v.school_id AND g.id = v.grade_id
           INNER JOIN academic_groups ag ON ag.school_id = v.school_id AND ag.id = v.academic_group_id
           INNER JOIN subjects s ON s.school_id = v.school_id AND s.id = v.subject_id
          WHERE v.school_id = $1 AND v.academic_year = $2 AND v.period_number = $3
            AND v.enrollment_status_id = 2 AND v.is_excluded_from_average = FALSE
            AND v.effective_score <= COALESCE(
              (SELECT MAX(gs.max_score) FROM grading_scales gs
                WHERE gs.school_id = v.school_id AND gs.academic_year = v.academic_year
                  AND gs.is_failing = TRUE
                  AND (gs.grade_group_id IS NULL OR gs.grade_group_id = v.grade_group_id)),
              2.99
            )
            ${clauses.join(' ')}
          GROUP BY g.display_order, g.name, ag.group_code, sp.document_number, sp.last_name, sp.second_last_name, sp.first_name
          ORDER BY g.display_order, ag.group_code, COUNT(*) DESC, full_name
          LIMIT 500`,
        params,
      );

      return {
        subtitle: `Año Lectivo ${filter.academicYear} · Periodo ${filter.periodNumber}`,
        usesPeriod: true,
        matrix: {
          columns: [
            { key: 'seq', label: '#', align: 'center' },
            { key: 'group', label: 'Grupo', align: 'center' },
            { key: 'doc', label: 'Documento', align: 'center' },
            { key: 'student', label: 'Estudiante' },
            { key: 'count', label: 'Cant.', align: 'center' },
            { key: 'subjects', label: 'Asignaturas Reprobadas (Nota)' },
          ],
          rows: res.rows.map((r, i) => ({
            seq: i + 1,
            group: r.grade_group,
            doc: r.document_number,
            student: r.full_name,
            count: Number(r.failed_count),
            subjects: r.failed_subjects,
          })),
          failingCellKeys: res.rows.map((_, i) => `${i}:count`),
          summaryBadges: [{ label: 'Estudiantes en riesgo', value: String(res.rows.length) }],
        },
      };
    }

    // 5. Cuadro de honor y puestos
    if (templateName === 'cuadro_honor') {
      const params: unknown[] = [schoolParam, filter.academicYear, filter.periodNumber];
      const clauses: string[] = [];
      if (filter.groupId) {
        params.push(filter.groupId);
        clauses.push(`AND r.academic_group_id = $${params.length}`);
      }
      const res = await client.query<{
        full_name: string;
        document_number: string;
        campus_name: string;
        grade_group: string;
        group_rank: number;
        grade_rank: number | null;
        average_score: string;
        failed_subjects_count: number;
        is_honor_roll: boolean;
      }>(
        `SELECT TRIM(CONCAT_WS(' ', sp.last_name, sp.second_last_name, sp.first_name)) AS full_name,
                sp.document_number,
                c.name AS campus_name,
                CONCAT(g.name, '-', ag.group_code) AS grade_group,
                r.group_rank,
                r.grade_rank,
                r.average_score,
                r.failed_subjects_count,
                r.is_honor_roll
           FROM student_period_rankings r
           INNER JOIN student_enrollments se ON se.school_id = r.school_id AND se.id = r.enrollment_id
           INNER JOIN student_profiles sp ON sp.school_id = se.school_id AND sp.id = se.student_profile_id
           INNER JOIN academic_groups ag ON ag.school_id = r.school_id AND ag.id = r.academic_group_id
           INNER JOIN grades g ON g.school_id = ag.school_id AND g.id = ag.grade_id
           INNER JOIN campuses c ON c.school_id = ag.school_id AND c.id = ag.campus_id
          WHERE r.school_id = $1 AND r.academic_year = $2 AND r.period_number = $3
            ${clauses.join(' ')}
          ORDER BY g.display_order, ag.group_code, r.group_rank ASC, full_name
          LIMIT 500`,
        params,
      );

      return {
        subtitle: `Año Lectivo ${filter.academicYear} · Periodo ${filter.periodNumber}`,
        usesPeriod: true,
        matrix: {
          columns: [
            { key: 'rank', label: 'Puesto', align: 'center' },
            { key: 'gradeRank', label: 'P. Grado', align: 'center' },
            { key: 'group', label: 'Grupo', align: 'center' },
            { key: 'doc', label: 'Documento', align: 'center' },
            { key: 'student', label: 'Estudiante' },
            { key: 'avg', label: 'Promedio', align: 'center', isScore: true },
            { key: 'failed', label: 'Reprob.', align: 'center' },
            { key: 'honor', label: 'Cuadro Honor', align: 'center' },
          ],
          rows: res.rows.map((r) => ({
            rank: Number(r.group_rank),
            gradeRank: r.grade_rank !== null ? Number(r.grade_rank) : '-',
            group: r.grade_group,
            doc: r.document_number,
            student: r.full_name,
            avg: Number(r.average_score),
            failed: Number(r.failed_subjects_count),
            honor: r.is_honor_roll ? 'SÍ' : 'NO',
          })),
          failingCellKeys: res.rows
            .map((r, i) => (Number(r.failed_subjects_count) > 0 ? `${i}:failed` : ''))
            .filter(Boolean),
          summaryBadges: [
            { label: 'Estudiantes clasificados', value: String(res.rows.length) },
            {
              label: 'En Cuadro de Honor',
              value: String(res.rows.filter((r) => r.is_honor_roll).length),
            },
          ],
        },
      };
    }

    // 6. Informe Final de Grado / Libro Final
    if (templateName === 'informe_final_grado' || templateName === 'libro_final') {
      const params: unknown[] = [schoolParam, filter.academicYear];
      const clauses: string[] = [];
      if (filter.groupId) {
        params.push(filter.groupId);
        clauses.push(`AND se.academic_group_id = $${params.length}`);
      } else if (filter.campusId) {
        params.push(filter.campusId);
        clauses.push(`AND se.campus_id = $${params.length}`);
      }
      const res = await client.query<{
        full_name: string;
        document_number: string;
        grade_group: string;
        final_average: string;
        recovery_average: string;
        passed_areas_count: number;
        failed_areas_count: number;
        group_rank: number | null;
        status_desc: string;
        act_number: string | null;
        is_commission_promoted: boolean;
      }>(
        `SELECT TRIM(CONCAT_WS(' ', sp.last_name, sp.second_last_name, sp.first_name)) AS full_name,
                sp.document_number,
                CONCAT(g.name, '-', ag.group_code) AS grade_group,
                pr.final_average,
                pr.recovery_average,
                pr.passed_areas_count,
                pr.failed_areas_count,
                pr.group_rank,
                psc.description AS status_desc,
                pr.act_number,
                pr.is_commission_promoted
           FROM promotion_records pr
           INNER JOIN student_enrollments se ON se.school_id = pr.school_id AND se.id = pr.enrollment_id
           INNER JOIN student_profiles sp ON sp.school_id = se.school_id AND sp.id = se.student_profile_id
           INNER JOIN grades g ON g.school_id = se.school_id AND g.id = se.grade_id
           INNER JOIN academic_groups ag ON ag.school_id = se.school_id AND ag.id = se.academic_group_id
           INNER JOIN promotion_statuses_catalog psc ON psc.id = pr.promotion_status_id
          WHERE pr.school_id = $1 AND pr.academic_year = $2 ${clauses.join(' ')}
          ORDER BY g.display_order, ag.group_code, pr.group_rank NULLS LAST, full_name
          LIMIT 800`,
        params,
      );

      return {
        subtitle: `Año Lectivo ${filter.academicYear} · Libro Oficial de Promoción`,
        usesPeriod: false,
        matrix: {
          columns: [
            { key: 'rank', label: 'Puesto', align: 'center' },
            { key: 'group', label: 'Grupo', align: 'center' },
            { key: 'doc', label: 'Documento', align: 'center' },
            { key: 'student', label: 'Estudiante' },
            { key: 'avg', label: 'Prom. Anual', align: 'center', isScore: true },
            { key: 'rec', label: 'Prom. Rec.', align: 'center', isScore: true },
            { key: 'passed', label: 'Áreas Apr.', align: 'center' },
            { key: 'failed', label: 'Áreas Rep.', align: 'center' },
            { key: 'status', label: 'Estado Final de Promoción' },
            { key: 'act', label: 'Acta', align: 'center' },
          ],
          rows: res.rows.map((r) => ({
            rank: r.group_rank ?? '-',
            group: r.grade_group,
            doc: r.document_number,
            student: r.full_name,
            avg: Number(r.final_average),
            rec: Number(r.recovery_average) > 0 ? Number(r.recovery_average) : '-',
            passed: Number(r.passed_areas_count),
            failed: Number(r.failed_areas_count),
            status: r.is_commission_promoted
              ? `${r.status_desc} (COMISIÓN)`
              : r.status_desc,
            act: r.act_number ?? '-',
          })),
          failingCellKeys: res.rows
            .map((r, i) => (Number(r.failed_areas_count) > 0 ? `${i}:failed` : ''))
            .filter(Boolean),
          summaryBadges: [{ label: 'Actas registradas', value: String(res.rows.length) }],
        },
      };
    }

    // 7. Estudiantes por Jornadas
    if (templateName === 'estudiantes_jornadas') {
      const res = await client.query<{
        campus_name: string;
        shift_name: string;
        grade_name: string;
        active_cnt: string;
        male_cnt: string;
        female_cnt: string;
      }>(
        `SELECT c.name AS campus_name,
                ss.name AS shift_name,
                g.name AS grade_name,
                COUNT(*)::text AS active_cnt,
                COUNT(*) FILTER (WHERE ge.code IN ('M','1'))::text AS male_cnt,
                COUNT(*) FILTER (WHERE ge.code IN ('F','2'))::text AS female_cnt
           FROM student_enrollments se
           INNER JOIN student_profiles sp ON sp.school_id = se.school_id AND sp.id = se.student_profile_id
           LEFT JOIN genders ge ON ge.id = sp.gender_id
           INNER JOIN campuses c ON c.school_id = se.school_id AND c.id = se.campus_id
           INNER JOIN school_shifts ss ON ss.school_id = se.school_id AND ss.id = se.shift_id
           INNER JOIN grades g ON g.school_id = se.school_id AND g.id = se.grade_id
          WHERE se.school_id = $1 AND se.academic_year = $2 AND se.enrollment_status_id = 2
          GROUP BY c.name, ss.name, g.display_order, g.name
          ORDER BY c.name, ss.name, g.display_order`,
        [schoolParam, filter.academicYear],
      );
      const total = res.rows.reduce((a, r) => a + Number(r.active_cnt), 0);
      return {
        subtitle: `Año Lectivo ${filter.academicYear} · Matrícula Activa por Sede y Jornada`,
        usesPeriod: false,
        matrix: {
          columns: [
            { key: 'campus', label: 'Sede' },
            { key: 'shift', label: 'Jornada', align: 'center' },
            { key: 'grade', label: 'Grado' },
            { key: 'male', label: 'Masc.', align: 'center' },
            { key: 'female', label: 'Fem.', align: 'center' },
            { key: 'total', label: 'Total Activos', align: 'center' },
          ],
          rows: res.rows.map((r) => ({
            campus: r.campus_name,
            shift: r.shift_name,
            grade: r.grade_name,
            male: Number(r.male_cnt),
            female: Number(r.female_cnt),
            total: Number(r.active_cnt),
          })),
          failingCellKeys: [],
          footerTotals: { campus: 'TOTAL INSTITUCIONAL', shift: '', grade: '', male: '', female: '', total },
          summaryBadges: [{ label: 'Total matriculados activos', value: String(total) }],
        },
      };
    }

    // 8. Estadística por edades (SIMAT / DANE)
    if (templateName === 'estadistica_edades') {
      const res = await client.query<{
        grade_name: string;
        age_years: number | null;
        male_cnt: string;
        female_cnt: string;
        total_cnt: string;
      }>(
        `SELECT g.name AS grade_name,
                CASE
                  WHEN sp.birth_date IS NOT NULL
                  THEN EXTRACT(YEAR FROM AGE(MAKE_DATE($2::int, 12, 31), sp.birth_date))::integer
                  ELSE NULL
                END AS age_years,
                COUNT(*) FILTER (WHERE ge.code IN ('M','1'))::text AS male_cnt,
                COUNT(*) FILTER (WHERE ge.code IN ('F','2'))::text AS female_cnt,
                COUNT(*)::text AS total_cnt
           FROM student_enrollments se
           INNER JOIN student_profiles sp ON sp.school_id = se.school_id AND sp.id = se.student_profile_id
           LEFT JOIN genders ge ON ge.id = sp.gender_id
           INNER JOIN grades g ON g.school_id = se.school_id AND g.id = se.grade_id
          WHERE se.school_id = $1 AND se.academic_year = $2 AND se.enrollment_status_id = 2
          GROUP BY g.display_order, g.name, age_years
          ORDER BY g.display_order, age_years NULLS LAST`,
        [schoolParam, filter.academicYear],
      );
      return {
        subtitle: `Año Lectivo ${filter.academicYear} · Distribución Etaria SIMAT/DANE`,
        usesPeriod: false,
        matrix: {
          columns: [
            { key: 'grade', label: 'Grado' },
            { key: 'age', label: 'Edad (Años)', align: 'center' },
            { key: 'male', label: 'Masculino', align: 'center' },
            { key: 'female', label: 'Femenino', align: 'center' },
            { key: 'total', label: 'Total', align: 'center' },
          ],
          rows: res.rows.map((r) => ({
            grade: r.grade_name,
            age: r.age_years !== null ? r.age_years : 'Sin fecha nac.',
            male: Number(r.male_cnt),
            female: Number(r.female_cnt),
            total: Number(r.total_cnt),
          })),
          failingCellKeys: [],
          summaryBadges: [{ label: 'Segmentos grado/edad', value: String(res.rows.length) }],
        },
      };
    }

    // 9. Asignación académica docente
    if (templateName === 'asignacion_academica_docente') {
      const params: unknown[] = [schoolParam, filter.academicYear];
      const clauses: string[] = [];
      if (filter.teacherProfileId) {
        params.push(filter.teacherProfileId);
        clauses.push(`AND ca.teacher_profile_id = $${params.length}`);
      }
      const res = await client.query<{
        teacher_name: string;
        campus_name: string;
        shift_name: string;
        grade_group: string;
        subject_name: string;
        weekly_hours: string;
      }>(
        `SELECT TRIM(CONCAT_WS(' ', tp.last_name, tp.second_last_name, tp.first_name)) AS teacher_name,
                c.name AS campus_name,
                ss.name AS shift_name,
                CONCAT(g.name, '-', ag.group_code) AS grade_group,
                s.name AS subject_name,
                ca.weekly_hours
           FROM course_assignments ca
           INNER JOIN teacher_profiles tp ON tp.school_id = ca.school_id AND tp.id = ca.teacher_profile_id
           INNER JOIN campuses c ON c.school_id = ca.school_id AND c.id = ca.campus_id
           INNER JOIN school_shifts ss ON ss.school_id = ca.school_id AND ss.id = ca.shift_id
           INNER JOIN grades g ON g.school_id = ca.school_id AND g.id = ca.grade_id
           INNER JOIN academic_groups ag ON ag.school_id = ca.school_id AND ag.id = ca.academic_group_id
           INNER JOIN subjects s ON s.school_id = ca.school_id AND s.id = ca.subject_id
          WHERE ca.school_id = $1 AND ca.academic_year = $2 AND ca.is_active = TRUE
            ${clauses.join(' ')}
          ORDER BY teacher_name, g.display_order, ag.group_code, s.name
          LIMIT 1000`,
        params,
      );
      const totalHours = res.rows.reduce((a, r) => a + Number(r.weekly_hours), 0);
      return {
        subtitle: `Año Lectivo ${filter.academicYear} · Carga Académica Docente`,
        usesPeriod: false,
        matrix: {
          columns: [
            { key: 'teacher', label: 'Docente' },
            { key: 'campus', label: 'Sede' },
            { key: 'shift', label: 'Jornada', align: 'center' },
            { key: 'group', label: 'Grupo', align: 'center' },
            { key: 'subject', label: 'Asignatura' },
            { key: 'hours', label: 'I.H. Sem.', align: 'center' },
          ],
          rows: res.rows.map((r) => ({
            teacher: r.teacher_name,
            campus: r.campus_name,
            shift: r.shift_name,
            group: r.grade_group,
            subject: r.subject_name,
            hours: Number(r.weekly_hours),
          })),
          failingCellKeys: [],
          footerTotals: { teacher: 'TOTAL ASIGNACIONES', campus: '', shift: '', group: '', subject: '', hours: Number(totalHours.toFixed(1)) },
          summaryBadges: [
            { label: 'Cursos asignados', value: String(res.rows.length) },
            { label: 'Horas semanales totales', value: totalHours.toFixed(1) },
          ],
        },
      };
    }

    // 10. Listado de docentes
    if (templateName === 'listado_docentes') {
      const res = await client.query<{
        document_number: string;
        full_name: string;
        phone: string | null;
        email: string | null;
        area_name: string | null;
        is_active: boolean;
      }>(
        `SELECT tp.document_number,
                TRIM(CONCAT_WS(' ', tp.last_name, tp.second_last_name, tp.first_name, tp.middle_name)) AS full_name,
                tp.phone,
                tp.email,
                ta.name AS area_name,
                tp.is_active
           FROM teacher_profiles tp
           LEFT JOIN teaching_areas ta ON ta.id = tp.teaching_area_id
          WHERE tp.school_id = $1 AND tp.is_active = TRUE
          ORDER BY full_name ASC`,
        [schoolParam],
      );
      return {
        subtitle: `Año Lectivo ${filter.academicYear} · Planta Docente Activa`,
        usesPeriod: false,
        matrix: {
          columns: [
            { key: 'seq', label: '#', align: 'center' },
            { key: 'doc', label: 'Documento', align: 'center' },
            { key: 'name', label: 'Docente' },
            { key: 'area', label: 'Área de Enseñanza' },
            { key: 'phone', label: 'Teléfono', align: 'center' },
            { key: 'email', label: 'Correo Electrónico' },
          ],
          rows: res.rows.map((r, i) => ({
            seq: i + 1,
            doc: r.document_number,
            name: r.full_name,
            area: r.area_name ?? '-',
            phone: r.phone ?? '-',
            email: r.email ?? '-',
          })),
          failingCellKeys: [],
          summaryBadges: [{ label: 'Docentes activos', value: String(res.rows.length) }],
        },
      };
    }

    // 11. Directores de grupo
    if (templateName === 'dir_grupo') {
      const res = await client.query<{
        campus_name: string;
        shift_name: string;
        grade_name: string;
        group_code: string;
        teacher_name: string | null;
        teacher_doc: string | null;
        students_cnt: string;
      }>(
        `SELECT c.name AS campus_name,
                ss.name AS shift_name,
                g.name AS grade_name,
                ag.group_code,
                TRIM(CONCAT_WS(' ', tp.last_name, tp.second_last_name, tp.first_name)) AS teacher_name,
                tp.document_number AS teacher_doc,
                (SELECT COUNT(*)::text FROM student_enrollments se
                  WHERE se.school_id = ag.school_id
                    AND se.academic_year = ag.academic_year
                    AND se.academic_group_id = ag.id
                    AND se.enrollment_status_id = 2) AS students_cnt
           FROM academic_groups ag
           INNER JOIN campuses c ON c.school_id = ag.school_id AND c.id = ag.campus_id
           INNER JOIN school_shifts ss ON ss.school_id = ag.school_id AND ss.id = ag.shift_id
           INNER JOIN grades g ON g.school_id = ag.school_id AND g.id = ag.grade_id
           LEFT JOIN teacher_profiles tp ON tp.school_id = ag.school_id AND tp.id = ag.homeroom_teacher_id
          WHERE ag.school_id = $1 AND ag.academic_year = $2 AND ag.is_active = TRUE
          ORDER BY c.name, ss.name, g.display_order, ag.group_code`,
        [schoolParam, filter.academicYear],
      );
      return {
        subtitle: `Año Lectivo ${filter.academicYear} · Dirección de Grupos`,
        usesPeriod: false,
        matrix: {
          columns: [
            { key: 'seq', label: '#', align: 'center' },
            { key: 'campus', label: 'Sede' },
            { key: 'shift', label: 'Jornada', align: 'center' },
            { key: 'group', label: 'Grado - Grupo', align: 'center' },
            { key: 'teacher', label: 'Director(a) de Grupo' },
            { key: 'doc', label: 'Documento', align: 'center' },
            { key: 'students', label: 'Estudiantes', align: 'center' },
          ],
          rows: res.rows.map((r, i) => ({
            seq: i + 1,
            campus: r.campus_name,
            shift: r.shift_name,
            group: `${r.grade_name} - ${r.group_code}`,
            teacher: r.teacher_name || 'Sin asignar',
            doc: r.teacher_doc ?? '-',
            students: Number(r.students_cnt),
          })),
          failingCellKeys: [],
          summaryBadges: [{ label: 'Grupos activos', value: String(res.rows.length) }],
        },
      };
    }

    // 11b. Parcelador de clases
    if (templateName === 'parcelador_clases') {
      const params: unknown[] = [schoolParam, filter.academicYear];
      const clauses: string[] = [];
      if (filter.groupId) {
        params.push(filter.groupId);
        clauses.push(`AND ca.academic_group_id = $${params.length}`);
      }
      if (filter.teacherProfileId) {
        params.push(filter.teacherProfileId);
        clauses.push(`AND ca.teacher_profile_id = $${params.length}`);
      }
      const res = await client.query<{
        period_number: number;
        grade_group: string;
        subject_name: string;
        teacher_name: string;
        title: string;
        general_objective: string | null;
        methodology_notes: string | null;
      }>(
        `SELECT lp.period_number,
                CONCAT(g.name, '-', ag.group_code) AS grade_group,
                s.name AS subject_name,
                TRIM(CONCAT_WS(' ', tp.first_name, tp.last_name)) AS teacher_name,
                lp.title,
                lp.general_objective,
                lp.methodology_notes
           FROM lesson_plans lp
           INNER JOIN course_assignments ca ON ca.school_id = lp.school_id AND ca.id = lp.course_assignment_id
           INNER JOIN grades g ON g.school_id = ca.school_id AND g.id = ca.grade_id
           INNER JOIN academic_groups ag ON ag.school_id = ca.school_id AND ag.id = ca.academic_group_id
           INNER JOIN subjects s ON s.school_id = ca.school_id AND s.id = ca.subject_id
           INNER JOIN teacher_profiles tp ON tp.school_id = ca.school_id AND tp.id = ca.teacher_profile_id
          WHERE lp.school_id = $1 AND lp.academic_year = $2 ${clauses.join(' ')}
          ORDER BY lp.period_number, g.display_order, ag.group_code, s.name
          LIMIT 500`,
        params,
      );
      return {
        subtitle: `Año Lectivo ${filter.academicYear} · Parcelador de Clases`,
        usesPeriod: false,
        matrix: {
          columns: [
            { key: 'period', label: 'Per.', align: 'center' },
            { key: 'group', label: 'Grupo', align: 'center' },
            { key: 'subject', label: 'Asignatura' },
            { key: 'teacher', label: 'Docente' },
            { key: 'title', label: 'Unidad / Tema' },
            { key: 'objective', label: 'Objetivo General' },
            { key: 'methodology', label: 'Metodología' },
          ],
          rows: res.rows.map((r) => ({
            period: Number(r.period_number),
            group: r.grade_group,
            subject: r.subject_name,
            teacher: r.teacher_name,
            title: r.title,
            objective: r.general_objective ?? '-',
            methodology: r.methodology_notes ?? '-',
          })),
          failingCellKeys: [],
          summaryBadges: [{ label: 'Planes registrados', value: String(res.rows.length) }],
        },
      };
    }

    // 11c. Actas de Nivelaciones Periódicas y Recuperaciones Finales
    if (
      templateName === 'nivelaciones_periodicas' ||
      templateName === 'recuperaciones_finales'
    ) {
      const recoveryType =
        templateName === 'recuperaciones_finales' ? 'FINAL' : 'PERIOD';
      const params: unknown[] = [schoolParam, filter.academicYear, recoveryType];
      const clauses: string[] = [];
      if (recoveryType === 'PERIOD') {
        params.push(filter.periodNumber);
        clauses.push(`AND prr.period_number = $${params.length}`);
      }
      if (filter.groupId) {
        params.push(filter.groupId);
        clauses.push(`AND se.academic_group_id = $${params.length}`);
      }
      const res = await client.query<{
        act_number: string | null;
        recovery_date: string | null;
        grade_group: string;
        document_number: string;
        full_name: string;
        subject_name: string;
        previous_score: string;
        recovery_score: string;
        observations: string | null;
      }>(
        `SELECT prr.act_number,
                prr.recovery_date::text,
                CONCAT(g.name, '-', ag.group_code) AS grade_group,
                sp.document_number,
                TRIM(CONCAT_WS(' ', sp.last_name, sp.second_last_name, sp.first_name)) AS full_name,
                s.name AS subject_name,
                prr.previous_score,
                prr.recovery_score,
                prr.observations
           FROM period_recovery_records prr
           INNER JOIN student_enrollments se ON se.school_id = prr.school_id AND se.id = prr.enrollment_id
           INNER JOIN student_profiles sp ON sp.school_id = se.school_id AND sp.id = se.student_profile_id
           INNER JOIN grades g ON g.school_id = se.school_id AND g.id = se.grade_id
           INNER JOIN academic_groups ag ON ag.school_id = se.school_id AND ag.id = se.academic_group_id
           INNER JOIN course_assignments ca ON ca.school_id = prr.school_id AND ca.id = prr.course_assignment_id
           INNER JOIN subjects s ON s.school_id = ca.school_id AND s.id = ca.subject_id
          WHERE prr.school_id = $1 AND prr.academic_year = $2 AND prr.recovery_type = $3
            ${clauses.join(' ')}
          ORDER BY g.display_order, ag.group_code, full_name, s.name
          LIMIT 800`,
        params,
      );
      return {
        subtitle:
          recoveryType === 'FINAL'
            ? `Año Lectivo ${filter.academicYear} · Acta Oficial de Recuperaciones Finales`
            : `Año Lectivo ${filter.academicYear} · Periodo ${filter.periodNumber} · Nivelaciones`,
        usesPeriod: recoveryType === 'PERIOD',
        matrix: {
          columns: [
            { key: 'act', label: 'Acta', align: 'center' },
            { key: 'date', label: 'Fecha', align: 'center' },
            { key: 'group', label: 'Grupo', align: 'center' },
            { key: 'doc', label: 'Documento', align: 'center' },
            { key: 'student', label: 'Estudiante' },
            { key: 'subject', label: 'Asignatura' },
            { key: 'prev', label: 'Nota Ant.', align: 'center', isScore: true },
            { key: 'rec', label: 'Nota Rec.', align: 'center', isScore: true },
            { key: 'obs', label: 'Observaciones' },
          ],
          rows: res.rows.map((r) => ({
            act: r.act_number ?? '-',
            date: r.recovery_date ?? '-',
            group: r.grade_group,
            doc: r.document_number,
            student: r.full_name,
            subject: r.subject_name,
            prev: Number(r.previous_score),
            rec: Number(r.recovery_score),
            obs: r.observations ?? '-',
          })),
          failingCellKeys: res.rows.map((_, i) => `${i}:prev`),
          summaryBadges: [{ label: 'Actas registradas', value: String(res.rows.length) }],
        },
      };
    }

    // 11d. Observador del estudiante
    if (templateName === 'observador_estudiante') {
      const params: unknown[] = [schoolParam, filter.academicYear];
      const clauses: string[] = [];
      if (filter.enrollmentId) {
        params.push(filter.enrollmentId);
        clauses.push(`AND se.id = $${params.length}`);
      } else if (filter.groupId) {
        params.push(filter.groupId);
        clauses.push(`AND se.academic_group_id = $${params.length}`);
      }
      const res = await client.query<{
        full_name: string;
        grade_group: string;
        annotation_date: string;
        period_number: number;
        severity_level: string;
        situation_description: string;
        pedagogical_commitment: string | null;
      }>(
        `SELECT TRIM(CONCAT_WS(' ', sp.last_name, sp.second_last_name, sp.first_name)) AS full_name,
                CONCAT(g.name, '-', ag.group_code) AS grade_group,
                oa.annotation_date::text,
                oa.period_number,
                oa.severity_level,
                oa.situation_description,
                oa.pedagogical_commitment
           FROM observer_annotations oa
           INNER JOIN student_observers so ON so.school_id = oa.school_id AND so.id = oa.student_observer_id
           INNER JOIN student_enrollments se ON se.school_id = so.school_id AND se.id = so.enrollment_id
           INNER JOIN student_profiles sp ON sp.school_id = se.school_id AND sp.id = se.student_profile_id
           INNER JOIN grades g ON g.school_id = se.school_id AND g.id = se.grade_id
           INNER JOIN academic_groups ag ON ag.school_id = se.school_id AND ag.id = se.academic_group_id
          WHERE oa.school_id = $1 AND so.academic_year = $2 ${clauses.join(' ')}
          ORDER BY oa.annotation_date DESC, full_name
          LIMIT 500`,
        params,
      );
      return {
        subtitle: `Año Lectivo ${filter.academicYear} · Registro del Observador`,
        usesPeriod: false,
        matrix: {
          columns: [
            { key: 'date', label: 'Fecha', align: 'center' },
            { key: 'period', label: 'Per.', align: 'center' },
            { key: 'group', label: 'Grupo', align: 'center' },
            { key: 'student', label: 'Estudiante' },
            { key: 'severity', label: 'Tipo', align: 'center' },
            { key: 'situation', label: 'Descripción de Situación' },
            { key: 'commitment', label: 'Compromiso Pedagógico' },
          ],
          rows: res.rows.map((r) => ({
            date: r.annotation_date,
            period: Number(r.period_number),
            group: r.grade_group,
            student: r.full_name,
            severity: r.severity_level,
            situation: r.situation_description,
            commitment: r.pedagogical_commitment ?? '-',
          })),
          failingCellKeys: [],
          summaryBadges: [{ label: 'Anotaciones registradas', value: String(res.rows.length) }],
        },
      };
    }

    // 12. Libro de matrículas, Listas de asistencia, Listas con carga, Directorio de estudiantes (default)
    const params: unknown[] = [schoolParam, filter.academicYear];
    const clauses: string[] = [];
    if (filter.groupId) {
      params.push(filter.groupId);
      clauses.push(`AND se.academic_group_id = $${params.length}`);
    } else if (filter.campusId) {
      params.push(filter.campusId);
      clauses.push(`AND se.campus_id = $${params.length}`);
    }

    const res = await client.query<{
      registration_number: string | null;
      book_number: string | null;
      folio_number: string | null;
      document_number: string;
      full_name: string;
      campus_name: string;
      shift_name: string;
      grade_group: string;
      status_name: string;
      phone: string | null;
      address: string | null;
      email: string | null;
      guardian_name: string | null;
      guardian_phone: string | null;
    }>(
      `SELECT se.registration_number,
              se.book_number,
              se.folio_number,
              sp.document_number,
              TRIM(CONCAT_WS(' ', sp.last_name, sp.second_last_name, sp.first_name, sp.middle_name)) AS full_name,
              c.name AS campus_name,
              ss.name AS shift_name,
              CONCAT(g.name, '-', ag.group_code) AS grade_group,
              es.name AS status_name,
              sp.phone,
              sp.address,
              sp.email,
              fam.full_name AS guardian_name,
              COALESCE(fam.mobile_phone, fam.phone) AS guardian_phone
         FROM student_enrollments se
         INNER JOIN student_profiles sp ON sp.school_id = se.school_id AND sp.id = se.student_profile_id
         INNER JOIN campuses c ON c.school_id = se.school_id AND c.id = se.campus_id
         INNER JOIN school_shifts ss ON ss.school_id = se.school_id AND ss.id = se.shift_id
         INNER JOIN grades g ON g.school_id = se.school_id AND g.id = se.grade_id
         INNER JOIN academic_groups ag ON ag.school_id = se.school_id AND ag.id = se.academic_group_id
         INNER JOIN enrollment_statuses es ON es.id = se.enrollment_status_id
         LEFT JOIN LATERAL (
           SELECT fp.full_name, fp.mobile_phone, fp.phone
             FROM student_family_links sfl
             INNER JOIN family_profiles fp ON fp.school_id = sfl.school_id AND fp.id = sfl.family_profile_id
            WHERE sfl.school_id = sp.school_id AND sfl.student_profile_id = sp.id
            ORDER BY sfl.is_primary_guardian DESC, sfl.id ASC
            LIMIT 1
         ) fam ON TRUE
        WHERE se.school_id = $1 AND se.academic_year = $2
          AND se.enrollment_status_id = 2 ${clauses.join(' ')}
        ORDER BY g.display_order, ag.group_code, full_name
        LIMIT 1000`,
      params,
    );

    if (templateName === 'directorio_estudiantes') {
      return {
        subtitle: `Año Lectivo ${filter.academicYear} · Directorio Estudiantil y Acudientes`,
        usesPeriod: false,
        matrix: {
          columns: [
            { key: 'seq', label: '#', align: 'center' },
            { key: 'group', label: 'Grupo', align: 'center' },
            { key: 'doc', label: 'Documento', align: 'center' },
            { key: 'student', label: 'Estudiante' },
            { key: 'phone', label: 'Tel. Estudiante', align: 'center' },
            { key: 'address', label: 'Dirección' },
            { key: 'guardian', label: 'Acudiente Principal' },
            { key: 'guardianPhone', label: 'Tel. Acudiente', align: 'center' },
          ],
          rows: res.rows.map((r, i) => ({
            seq: i + 1,
            group: r.grade_group,
            doc: r.document_number,
            student: r.full_name,
            phone: r.phone ?? '-',
            address: r.address ?? '-',
            guardian: r.guardian_name ?? '-',
            guardianPhone: r.guardian_phone ?? '-',
          })),
          failingCellKeys: [],
          summaryBadges: [{ label: 'Registros', value: String(res.rows.length) }],
        },
      };
    }

    if (
      templateName === 'listas_asistencia' ||
      templateName === 'listas_con_carga'
    ) {
      return {
        subtitle: `Año Lectivo ${filter.academicYear} · Planilla de Control`,
        usesPeriod: true,
        matrix: {
          columns: [
            { key: 'seq', label: '#', align: 'center' },
            { key: 'doc', label: 'Documento', align: 'center' },
            { key: 'student', label: 'Apellidos y Nombres' },
            { key: 'group', label: 'Grupo', align: 'center' },
            { key: 'c1', label: 'N1', align: 'center' },
            { key: 'c2', label: 'N2', align: 'center' },
            { key: 'c3', label: 'N3', align: 'center' },
            { key: 'c4', label: 'N4', align: 'center' },
            { key: 'c5', label: 'N5', align: 'center' },
            { key: 'def', label: 'DEF', align: 'center' },
          ],
          rows: res.rows.map((r, i) => ({
            seq: i + 1,
            doc: r.document_number,
            student: r.full_name,
            group: r.grade_group,
            c1: '',
            c2: '',
            c3: '',
            c4: '',
            c5: '',
            def: '',
          })),
          failingCellKeys: [],
          summaryBadges: [{ label: 'Estudiantes en lista', value: String(res.rows.length) }],
        },
      };
    }

    // Default: Libro de Matrículas foliado
    return {
      subtitle: `Año Lectivo ${filter.academicYear} · Libro Oficial de Matrículas`,
      usesPeriod: false,
      matrix: {
        columns: [
          { key: 'reg', label: 'No. Reg.', align: 'center' },
          { key: 'book', label: 'Libro', align: 'center' },
          { key: 'folio', label: 'Folio', align: 'center' },
          { key: 'doc', label: 'Documento', align: 'center' },
          { key: 'student', label: 'Apellidos y Nombres' },
          { key: 'campus', label: 'Sede' },
          { key: 'shift', label: 'Jornada', align: 'center' },
          { key: 'group', label: 'Grado-Grupo', align: 'center' },
          { key: 'status', label: 'Estado', align: 'center' },
        ],
        rows: res.rows.map((r, i) => ({
          reg: r.registration_number ?? String(i + 1),
          book: r.book_number ?? '1',
          folio: r.folio_number ?? String(i + 1),
          doc: r.document_number,
          student: r.full_name,
          campus: r.campus_name,
          shift: r.shift_name,
          group: r.grade_group,
          status: r.status_name,
        })),
        failingCellKeys: [],
        summaryBadges: [{ label: 'Matrículas foliadas', value: String(res.rows.length) }],
      },
    };
  }

  private parsePositiveInt(raw: unknown, fallback: number): number {
    const n = Number(raw);
    return Number.isInteger(n) && n > 0 ? n : fallback;
  }

  private parseOptionalPositiveInt(raw: unknown): number | null {
    const n = Number(raw);
    return Number.isInteger(n) && n > 0 ? n : null;
  }
}
