import { Injectable } from '@nestjs/common';
import { PoolClient } from 'pg';

export interface LegalEnrollmentNumbering {
  readonly registrationNumber: string;
  readonly bookNumber: string;
  readonly folioNumber: string;
}

/**
 * Servicio de numeración legal de matrículas (Libro / Folio / Registro) y control de acceso estudiantil.
 * Sustituye el trigger legacy `student_enrollment_before_insert` + `sp_renumber_folios`
 * con concurrencia segura mediante `pg_advisory_xact_lock` por colegio y año lectivo.
 */
@Injectable()
export class EnrollmentNumberingService {
  async resolveStudentsPerBook(
    client: PoolClient,
    schoolId: bigint,
    academicYear: number,
  ): Promise<number> {
    const res = await client.query<{ students_per_book: number }>(
      `SELECT students_per_book
         FROM academic_grading_rules
        WHERE school_id = $1 AND academic_year = $2
        ORDER BY id ASC
        LIMIT 1`,
      [schoolId.toString(), academicYear],
    );
    const configured = Number(res.rows[0]?.students_per_book ?? 500);
    return Number.isFinite(configured) && configured >= 1
      ? Math.floor(configured)
      : 500;
  }

  /**
   * Calcula el siguiente consecutivo legal `(registrationNumber, bookNumber, folioNumber)`
   * dentro de la transacción activa protegiéndolo con `pg_advisory_xact_lock`.
   */
  async allocateNextNumbers(
    client: PoolClient,
    schoolId: bigint,
    academicYear: number,
  ): Promise<LegalEnrollmentNumbering> {
    await client.query(`SELECT pg_advisory_xact_lock(hashtext($1))`, [
      `enroll_num:${schoolId.toString()}:${academicYear}`,
    ]);

    const studentsPerBook = await this.resolveStudentsPerBook(
      client,
      schoolId,
      academicYear,
    );

    const maxRes = await client.query<{ max_reg: string }>(
      `SELECT COALESCE(
                MAX(
                  CASE
                    WHEN registration_number ~ '^[0-9]+$'
                    THEN registration_number::bigint
                    ELSE 0
                  END
                ),
                0
              )::text AS max_reg
         FROM student_enrollments
        WHERE school_id = $1
          AND academic_year = $2`,
      [schoolId.toString(), academicYear],
    );

    const nextSeq = Number(maxRes.rows[0]?.max_reg ?? '0') + 1;
    const bookNumber = Math.ceil(nextSeq / studentsPerBook);
    const folioNumber = ((nextSeq - 1) % studentsPerBook) + 1;

    return {
      registrationNumber: String(nextSeq),
      bookNumber: String(bookNumber),
      folioNumber: String(folioNumber),
    };
  }

  /**
   * Inicializa el registro por defecto de permisos de acceso al portal estudiantil
   * (paridad con trigger legacy `student_enrollment_after_insert` -> `student_access`).
   */
  async ensureAccessControl(
    client: PoolClient,
    schoolId: bigint,
    enrollmentId: bigint | number,
  ): Promise<void> {
    await client.query(
      `INSERT INTO student_enrollment_access_controls (school_id, enrollment_id)
       VALUES ($1, $2)
       ON CONFLICT (school_id, enrollment_id) DO NOTHING`,
      [schoolId.toString(), String(enrollmentId)],
    );
  }

  /**
   * Renumera en bloque `registration_number`, `book_number` y `folio_number` de las matrículas
   * de un año lectivo en orden institucional (grado, grupo, apellidos, nombres).
   */
  async renumberAcademicYearFolios(
    client: PoolClient,
    schoolId: bigint,
    academicYear: number,
    onlyActive = true,
  ): Promise<{ updatedCount: number; studentsPerBook: number; totalBooks: number }> {
    await client.query(`SELECT pg_advisory_xact_lock(hashtext($1))`, [
      `enroll_num:${schoolId.toString()}:${academicYear}`,
    ]);

    const studentsPerBook = await this.resolveStudentsPerBook(
      client,
      schoolId,
      academicYear,
    );

    const statusFilter = onlyActive ? 'AND se.enrollment_status_id = 2' : '';

    const res = await client.query<{ updated_count: string }>(
      `WITH ordered AS (
         SELECT se.id,
                ROW_NUMBER() OVER (
                  ORDER BY g.display_order ASC,
                           ag.group_code ASC,
                           sp.last_name ASC,
                           COALESCE(sp.second_last_name, '') ASC,
                           sp.first_name ASC,
                           COALESCE(sp.middle_name, '') ASC,
                           se.id ASC
                ) AS seq
           FROM student_enrollments se
           INNER JOIN grades g ON g.school_id = se.school_id AND g.id = se.grade_id
           INNER JOIN academic_groups ag ON ag.school_id = se.school_id AND ag.id = se.academic_group_id
           INNER JOIN student_profiles sp ON sp.school_id = se.school_id AND sp.id = se.student_profile_id
          WHERE se.school_id = $1
            AND se.academic_year = $2
            ${statusFilter}
       ),
       updated AS (
         UPDATE student_enrollments se
            SET registration_number = o.seq::text,
                book_number = CEIL(o.seq::numeric / $3::numeric)::integer::text,
                folio_number = (((o.seq - 1) % $3::integer) + 1)::text,
                updated_at = NOW()
           FROM ordered o
          WHERE se.school_id = $1
            AND se.id = o.id
          RETURNING se.id
       )
       SELECT COUNT(*)::text AS updated_count FROM updated`,
      [schoolId.toString(), academicYear, studentsPerBook],
    );

    const updatedCount = Number(res.rows[0]?.updated_count ?? '0');
    const totalBooks =
      updatedCount > 0 ? Math.ceil(updatedCount / studentsPerBook) : 0;

    return { updatedCount, studentsPerBook, totalBooks };
  }
}
