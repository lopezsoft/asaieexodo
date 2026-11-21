import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ResourceNotFoundException } from '../../../../shared/domain/exceptions/resource-not-found.exception';
import { PostgresRlsService } from '../../../../shared/infrastructure/database/postgres-rls.service';
import {
  CandidacyTypeItem,
  ElectionCandidateRecord,
  ElectionJuryRecord,
  ElectionResultsView,
  ElectionsRepositoryPort,
  PollingStationRecord,
  SchoolElectionRecord,
  StudentActiveBallotView,
} from '../../domain/ports/elections.repository.port';

@Injectable()
export class PostgresElectionsRepository extends ElectionsRepositoryPort {
  constructor(private readonly db: PostgresRlsService) {
    super();
  }

  async listCandidacyTypes(schoolId: bigint): Promise<CandidacyTypeItem[]> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query<{ id: string; name: string }>(
        `SELECT id, name FROM election_candidacy_types WHERE is_active = TRUE ORDER BY id`,
      );
      return res.rows.map((r) => ({ id: Number(r.id), name: r.name }));
    });
  }

  async listElections(schoolId: bigint): Promise<SchoolElectionRecord[]> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query<{
        id: string;
        academic_year: number;
        election_name: string;
        election_date: string;
        start_time: string;
        end_time: string;
        allows_blank_vote: boolean;
        is_active: boolean;
      }>(
        `SELECT id, academic_year, election_name, election_date::text, start_time::text, end_time::text,
                allows_blank_vote, is_active
           FROM school_elections
          WHERE school_id = $1
          ORDER BY academic_year DESC`,
        [schoolId.toString()],
      );
      return res.rows.map((r) => this.mapElection(r));
    });
  }

  async saveElection(
    schoolId: bigint,
    input: {
      id?: bigint;
      academicYear: number;
      electionName: string;
      electionDate: string;
      startTime: string;
      endTime: string;
      allowsBlankVote?: boolean;
      isActive?: boolean;
    },
  ): Promise<SchoolElectionRecord> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      if (input.id) {
        const res = await client.query<Record<string, unknown>>(
          `UPDATE school_elections
              SET election_name = $3,
                  election_date = $4,
                  start_time = $5,
                  end_time = $6,
                  allows_blank_vote = COALESCE($7, allows_blank_vote),
                  is_active = COALESCE($8, is_active)
            WHERE school_id = $1 AND id = $2
            RETURNING id, academic_year, election_name, election_date::text, start_time::text, end_time::text, allows_blank_vote, is_active`,
          [
            schoolId.toString(),
            input.id.toString(),
            input.electionName.trim(),
            input.electionDate,
            input.startTime,
            input.endTime,
            input.allowsBlankVote ?? null,
            input.isActive ?? null,
          ],
        );
        if (res.rowCount === 0) {
          throw new ResourceNotFoundException('SchoolElection', input.id.toString());
        }
        return this.mapElection(res.rows[0]);
      }

      const res = await client.query<Record<string, unknown>>(
        `INSERT INTO school_elections (
           school_id, academic_year, election_name, election_date, start_time, end_time,
           allows_blank_vote, is_active
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (school_id, academic_year) DO UPDATE SET
           election_name = EXCLUDED.election_name,
           election_date = EXCLUDED.election_date,
           start_time = EXCLUDED.start_time,
           end_time = EXCLUDED.end_time,
           allows_blank_vote = EXCLUDED.allows_blank_vote,
           is_active = EXCLUDED.is_active
         RETURNING id, academic_year, election_name, election_date::text, start_time::text, end_time::text, allows_blank_vote, is_active`,
        [
          schoolId.toString(),
          input.academicYear,
          input.electionName.trim(),
          input.electionDate,
          input.startTime,
          input.endTime,
          input.allowsBlankVote ?? true,
          input.isActive ?? true,
        ],
      );
      return this.mapElection(res.rows[0]);
    });
  }

  async deleteElection(schoolId: bigint, electionId: bigint): Promise<void> {
    await this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query(
        `DELETE FROM school_elections WHERE school_id = $1 AND id = $2`,
        [schoolId.toString(), electionId.toString()],
      );
      if (res.rowCount === 0) {
        throw new ResourceNotFoundException('SchoolElection', electionId.toString());
      }
    });
  }

  async listStations(
    schoolId: bigint,
    electionId: bigint,
  ): Promise<PollingStationRecord[]> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const stationsRes = await client.query<{
        id: string;
        election_id: string;
        campus_id: string | null;
        campus_name: string | null;
        station_number: string;
        station_name: string;
        location_description: string | null;
        allowed_grades: number[];
        is_active: boolean;
      }>(
        `SELECT s.id, s.election_id, s.campus_id, c.name AS campus_name,
                s.station_number, s.station_name, s.location_description,
                s.allowed_grades, s.is_active
           FROM election_polling_stations s
           LEFT JOIN campuses c ON c.school_id = s.school_id AND c.id = s.campus_id
          WHERE s.school_id = $1 AND s.election_id = $2
          ORDER BY s.station_number, s.id`,
        [schoolId.toString(), electionId.toString()],
      );

      const juriesRes = await client.query<{
        id: string;
        polling_station_id: string;
        full_name: string;
        role_title: string;
      }>(
        `SELECT j.id, j.polling_station_id, j.full_name, j.role_title
           FROM election_juries j
           INNER JOIN election_polling_stations s
             ON s.school_id = j.school_id AND s.id = j.polling_station_id
          WHERE s.school_id = $1 AND s.election_id = $2
          ORDER BY j.id`,
        [schoolId.toString(), electionId.toString()],
      );

      const juriesByStation = new Map<number, ElectionJuryRecord[]>();
      for (const j of juriesRes.rows) {
        const sid = Number(j.polling_station_id);
        const list = juriesByStation.get(sid) ?? [];
        list.push({
          id: Number(j.id),
          pollingStationId: sid,
          fullName: j.full_name,
          roleTitle: j.role_title,
        });
        juriesByStation.set(sid, list);
      }

      return stationsRes.rows.map((s) => ({
        id: Number(s.id),
        electionId: Number(s.election_id),
        campusId: s.campus_id ? Number(s.campus_id) : null,
        campusName: s.campus_name,
        stationNumber: s.station_number,
        stationName: s.station_name,
        locationDescription: s.location_description,
        allowedGrades: Array.isArray(s.allowed_grades) ? s.allowed_grades : [],
        isActive: s.is_active,
        juries: juriesByStation.get(Number(s.id)) ?? [],
      }));
    });
  }

  async saveStation(
    schoolId: bigint,
    electionId: bigint,
    input: {
      id?: bigint;
      campusId?: number | null;
      stationNumber: string;
      stationName: string;
      locationDescription?: string | null;
      allowedGrades?: number[];
      isActive?: boolean;
    },
  ): Promise<PollingStationRecord> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      let stationId: string;
      if (input.id) {
        const res = await client.query<{ id: string }>(
          `UPDATE election_polling_stations
              SET campus_id = $3,
                  station_number = $4,
                  station_name = $5,
                  location_description = $6,
                  allowed_grades = $7::jsonb,
                  is_active = COALESCE($8, is_active)
            WHERE school_id = $1 AND id = $2
            RETURNING id`,
          [
            schoolId.toString(),
            input.id.toString(),
            input.campusId ?? null,
            input.stationNumber.trim(),
            input.stationName.trim(),
            input.locationDescription ?? null,
            JSON.stringify(input.allowedGrades ?? []),
            input.isActive ?? null,
          ],
        );
        if (res.rowCount === 0) {
          throw new ResourceNotFoundException('PollingStation', input.id.toString());
        }
        stationId = res.rows[0].id;
      } else {
        const res = await client.query<{ id: string }>(
          `INSERT INTO election_polling_stations (
             school_id, election_id, campus_id, station_number, station_name,
             location_description, allowed_grades, is_active
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8)
           RETURNING id`,
          [
            schoolId.toString(),
            electionId.toString(),
            input.campusId ?? null,
            input.stationNumber.trim(),
            input.stationName.trim(),
            input.locationDescription ?? null,
            JSON.stringify(input.allowedGrades ?? []),
            input.isActive ?? true,
          ],
        );
        stationId = res.rows[0].id;
      }

      const rowRes = await client.query<{
        id: string;
        election_id: string;
        campus_id: string | null;
        campus_name: string | null;
        station_number: string;
        station_name: string;
        location_description: string | null;
        allowed_grades: number[];
        is_active: boolean;
      }>(
        `SELECT s.id, s.election_id, s.campus_id, c.name AS campus_name,
                s.station_number, s.station_name, s.location_description,
                s.allowed_grades, s.is_active
           FROM election_polling_stations s
           LEFT JOIN campuses c ON c.school_id = s.school_id AND c.id = s.campus_id
          WHERE s.school_id = $1 AND s.id = $2`,
        [schoolId.toString(), stationId],
      );
      const s = rowRes.rows[0];
      return {
        id: Number(s.id),
        electionId: Number(s.election_id),
        campusId: s.campus_id ? Number(s.campus_id) : null,
        campusName: s.campus_name,
        stationNumber: s.station_number,
        stationName: s.station_name,
        locationDescription: s.location_description,
        allowedGrades: Array.isArray(s.allowed_grades) ? s.allowed_grades : [],
        isActive: s.is_active,
        juries: [],
      };
    });
  }

  async deleteStation(schoolId: bigint, stationId: bigint): Promise<void> {
    await this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query(
        `DELETE FROM election_polling_stations WHERE school_id = $1 AND id = $2`,
        [schoolId.toString(), stationId.toString()],
      );
      if (res.rowCount === 0) {
        throw new ResourceNotFoundException('PollingStation', stationId.toString());
      }
    });
  }

  async addJury(
    schoolId: bigint,
    stationId: bigint,
    input: { fullName: string; roleTitle?: string },
  ): Promise<ElectionJuryRecord> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query<{
        id: string;
        polling_station_id: string;
        full_name: string;
        role_title: string;
      }>(
        `INSERT INTO election_juries (school_id, polling_station_id, full_name, role_title)
         VALUES ($1, $2, $3, $4)
         RETURNING id, polling_station_id, full_name, role_title`,
        [
          schoolId.toString(),
          stationId.toString(),
          input.fullName.trim(),
          input.roleTitle?.trim() || 'JURADO',
        ],
      );
      const r = res.rows[0];
      return {
        id: Number(r.id),
        pollingStationId: Number(r.polling_station_id),
        fullName: r.full_name,
        roleTitle: r.role_title,
      };
    });
  }

  async deleteJury(schoolId: bigint, juryId: bigint): Promise<void> {
    await this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query(
        `DELETE FROM election_juries WHERE school_id = $1 AND id = $2`,
        [schoolId.toString(), juryId.toString()],
      );
      if (res.rowCount === 0) {
        throw new ResourceNotFoundException('ElectionJury', juryId.toString());
      }
    });
  }

  async listCandidates(
    schoolId: bigint,
    electionId: bigint,
  ): Promise<ElectionCandidateRecord[]> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query<{
        id: string;
        election_id: string;
        candidacy_type_id: number;
        candidacy_type_name: string;
        enrollment_id: string | null;
        ballot_number: string;
        candidate_name: string;
        proposal_text: string | null;
        photo_url: string | null;
        is_blank_vote_option: boolean;
        is_active: boolean;
      }>(
        `SELECT c.id, c.election_id, c.candidacy_type_id, ct.name AS candidacy_type_name,
                c.enrollment_id, c.ballot_number, c.candidate_name, c.proposal_text,
                c.photo_url, c.is_blank_vote_option, c.is_active
           FROM election_candidates c
           INNER JOIN election_candidacy_types ct ON ct.id = c.candidacy_type_id
          WHERE c.school_id = $1 AND c.election_id = $2
          ORDER BY c.candidacy_type_id, c.is_blank_vote_option, c.ballot_number, c.id`,
        [schoolId.toString(), electionId.toString()],
      );

      return res.rows.map((r) => ({
        id: Number(r.id),
        electionId: Number(r.election_id),
        candidacyTypeId: Number(r.candidacy_type_id),
        candidacyTypeName: r.candidacy_type_name,
        enrollmentId: r.enrollment_id ? Number(r.enrollment_id) : null,
        ballotNumber: r.ballot_number,
        candidateName: r.candidate_name,
        proposalText: r.proposal_text,
        photoUrl: r.photo_url,
        isBlankVoteOption: r.is_blank_vote_option,
        isActive: r.is_active,
      }));
    });
  }

  async saveCandidate(
    schoolId: bigint,
    electionId: bigint,
    input: {
      id?: bigint;
      candidacyTypeId: number;
      enrollmentId?: number | null;
      ballotNumber: string;
      candidateName: string;
      proposalText?: string | null;
      photoUrl?: string | null;
      isBlankVoteOption?: boolean;
      isActive?: boolean;
    },
  ): Promise<ElectionCandidateRecord> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      let savedId: string;
      if (input.id) {
        const res = await client.query<{ id: string }>(
          `UPDATE election_candidates
              SET candidacy_type_id = $3,
                  enrollment_id = $4,
                  ballot_number = $5,
                  candidate_name = $6,
                  proposal_text = $7,
                  photo_url = $8,
                  is_blank_vote_option = COALESCE($9, is_blank_vote_option),
                  is_active = COALESCE($10, is_active)
            WHERE school_id = $1 AND id = $2
            RETURNING id`,
          [
            schoolId.toString(),
            input.id.toString(),
            input.candidacyTypeId,
            input.enrollmentId ?? null,
            input.ballotNumber.trim(),
            input.candidateName.trim(),
            input.proposalText ?? null,
            input.photoUrl ?? null,
            input.isBlankVoteOption ?? null,
            input.isActive ?? null,
          ],
        );
        if (res.rowCount === 0) {
          throw new ResourceNotFoundException('ElectionCandidate', input.id.toString());
        }
        savedId = res.rows[0].id;
      } else {
        const res = await client.query<{ id: string }>(
          `INSERT INTO election_candidates (
             school_id, election_id, candidacy_type_id, enrollment_id, ballot_number,
             candidate_name, proposal_text, photo_url, is_blank_vote_option, is_active
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           RETURNING id`,
          [
            schoolId.toString(),
            electionId.toString(),
            input.candidacyTypeId,
            input.enrollmentId ?? null,
            input.ballotNumber.trim(),
            input.candidateName.trim(),
            input.proposalText ?? null,
            input.photoUrl ?? null,
            input.isBlankVoteOption ?? false,
            input.isActive ?? true,
          ],
        );
        savedId = res.rows[0].id;
      }

      const rowRes = await client.query<{
        id: string;
        election_id: string;
        candidacy_type_id: number;
        candidacy_type_name: string;
        enrollment_id: string | null;
        ballot_number: string;
        candidate_name: string;
        proposal_text: string | null;
        photo_url: string | null;
        is_blank_vote_option: boolean;
        is_active: boolean;
      }>(
        `SELECT c.id, c.election_id, c.candidacy_type_id, ct.name AS candidacy_type_name,
                c.enrollment_id, c.ballot_number, c.candidate_name, c.proposal_text,
                c.photo_url, c.is_blank_vote_option, c.is_active
           FROM election_candidates c
           INNER JOIN election_candidacy_types ct ON ct.id = c.candidacy_type_id
          WHERE c.school_id = $1 AND c.id = $2`,
        [schoolId.toString(), savedId],
      );
      const r = rowRes.rows[0];
      return {
        id: Number(r.id),
        electionId: Number(r.election_id),
        candidacyTypeId: Number(r.candidacy_type_id),
        candidacyTypeName: r.candidacy_type_name,
        enrollmentId: r.enrollment_id ? Number(r.enrollment_id) : null,
        ballotNumber: r.ballot_number,
        candidateName: r.candidate_name,
        proposalText: r.proposal_text,
        photoUrl: r.photo_url,
        isBlankVoteOption: r.is_blank_vote_option,
        isActive: r.is_active,
      };
    });
  }

  async deleteCandidate(schoolId: bigint, candidateId: bigint): Promise<void> {
    await this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query(
        `DELETE FROM election_candidates WHERE school_id = $1 AND id = $2`,
        [schoolId.toString(), candidateId.toString()],
      );
      if (res.rowCount === 0) {
        throw new ResourceNotFoundException('ElectionCandidate', candidateId.toString());
      }
    });
  }

  async getActiveBallot(
    schoolId: bigint,
    userId: bigint,
    academicYear: number,
  ): Promise<StudentActiveBallotView> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const electionRes = await client.query<Record<string, unknown>>(
        `SELECT id, academic_year, election_name, election_date::text, start_time::text, end_time::text,
                allows_blank_vote, is_active
           FROM school_elections
          WHERE school_id = $1 AND academic_year = $2 AND is_active = TRUE
          LIMIT 1`,
        [schoolId.toString(), academicYear],
      );

      if (electionRes.rowCount === 0) {
        return {
          election: null,
          enrollmentId: null,
          studentFullName: null,
          gradeName: null,
          votedCandidacyTypeIds: [],
          candidacies: [],
        };
      }

      const election = this.mapElection(electionRes.rows[0]);

      const enrRes = await client.query<{
        enrollment_id: string;
        full_name: string;
        grade_name: string;
      }>(
        `SELECT se.id AS enrollment_id,
                TRIM(CONCAT_WS(' ', sp.first_name, sp.middle_name, sp.last_name, sp.second_last_name)) AS full_name,
                g.name AS grade_name
           FROM student_profiles sp
           INNER JOIN student_enrollments se
             ON se.school_id = sp.school_id AND se.student_profile_id = sp.id
           INNER JOIN grades g
             ON g.school_id = se.school_id AND g.id = se.grade_id
          WHERE sp.school_id = $1
            AND sp.user_id = $2
            AND se.academic_year = $3
          LIMIT 1`,
        [schoolId.toString(), userId.toString(), academicYear],
      );

      const enrollmentId = enrRes.rows[0] ? Number(enrRes.rows[0].enrollment_id) : null;
      const votedCandidacyTypeIds: number[] = [];

      if (enrollmentId) {
        const votesRes = await client.query<{ candidacy_type_id: number }>(
          `SELECT candidacy_type_id
             FROM election_votes
            WHERE school_id = $1 AND election_id = $2 AND enrollment_id = $3`,
          [schoolId.toString(), election.id, enrollmentId],
        );
        for (const v of votesRes.rows) {
          votedCandidacyTypeIds.push(Number(v.candidacy_type_id));
        }
      }

      const candRes = await client.query<{
        id: string;
        election_id: string;
        candidacy_type_id: number;
        candidacy_type_name: string;
        enrollment_id: string | null;
        ballot_number: string;
        candidate_name: string;
        proposal_text: string | null;
        photo_url: string | null;
        is_blank_vote_option: boolean;
        is_active: boolean;
      }>(
        `SELECT c.id, c.election_id, c.candidacy_type_id, ct.name AS candidacy_type_name,
                c.enrollment_id, c.ballot_number, c.candidate_name, c.proposal_text,
                c.photo_url, c.is_blank_vote_option, c.is_active
           FROM election_candidates c
           INNER JOIN election_candidacy_types ct ON ct.id = c.candidacy_type_id
          WHERE c.school_id = $1 AND c.election_id = $2 AND c.is_active = TRUE
          ORDER BY c.candidacy_type_id, c.is_blank_vote_option, c.ballot_number, c.id`,
        [schoolId.toString(), election.id],
      );

      const grouped = new Map<
        number,
        {
          candidacyTypeId: number;
          candidacyTypeName: string;
          candidates: ElectionCandidateRecord[];
        }
      >();

      for (const r of candRes.rows) {
        const cid = Number(r.candidacy_type_id);
        const bucket = grouped.get(cid) ?? {
          candidacyTypeId: cid,
          candidacyTypeName: r.candidacy_type_name,
          candidates: [],
        };
        bucket.candidates.push({
          id: Number(r.id),
          electionId: Number(r.election_id),
          candidacyTypeId: cid,
          candidacyTypeName: r.candidacy_type_name,
          enrollmentId: r.enrollment_id ? Number(r.enrollment_id) : null,
          ballotNumber: r.ballot_number,
          candidateName: r.candidate_name,
          proposalText: r.proposal_text,
          photoUrl: r.photo_url,
          isBlankVoteOption: r.is_blank_vote_option,
          isActive: r.is_active,
        });
        grouped.set(cid, bucket);
      }

      return {
        election,
        enrollmentId,
        studentFullName: enrRes.rows[0]?.full_name ?? null,
        gradeName: enrRes.rows[0]?.grade_name ?? null,
        votedCandidacyTypeIds,
        candidacies: Array.from(grouped.values()).map((b) => ({
          ...b,
          alreadyVoted: votedCandidacyTypeIds.includes(b.candidacyTypeId),
        })),
      };
    });
  }

  async castVote(
    schoolId: bigint,
    userId: bigint,
    electionId: bigint,
    input: {
      candidacyTypeId: number;
      candidateId: number;
      pollingStationId?: number | null;
    },
  ): Promise<{ votedAt: string; candidacyTypeId: number }> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const electionRes = await client.query<{
        academic_year: number;
        is_active: boolean;
        election_date: string;
        start_time: string;
        end_time: string;
        is_within_window: boolean;
      }>(
        `SELECT academic_year,
                is_active,
                election_date::text,
                start_time::text,
                end_time::text,
                (
                  election_date = CURRENT_DATE
                  AND LOCALTIME BETWEEN start_time AND end_time
                ) AS is_within_window
           FROM school_elections
          WHERE school_id = $1 AND id = $2`,
        [schoolId.toString(), electionId.toString()],
      );
      if (electionRes.rowCount === 0) {
        throw new ResourceNotFoundException('SchoolElection', electionId.toString());
      }
      const election = electionRes.rows[0];
      if (!election.is_active) {
        throw new ForbiddenException('La jornada electoral no se encuentra habilitada.');
      }
      if (!election.is_within_window) {
        throw new ForbiddenException(
          `La votación solo está permitida el ${election.election_date} entre las ${election.start_time.slice(0, 5)} y las ${election.end_time.slice(0, 5)}.`,
        );
      }

      const enrRes = await client.query<{
        enrollment_id: string;
        grade_id: string;
      }>(
        `SELECT se.id AS enrollment_id, se.grade_id
           FROM student_profiles sp
           INNER JOIN student_enrollments se
             ON se.school_id = sp.school_id AND se.student_profile_id = sp.id
          WHERE sp.school_id = $1
            AND sp.user_id = $2
            AND se.academic_year = $3
            AND se.enrollment_status_id = 2
          ORDER BY se.id DESC
          LIMIT 1`,
        [schoolId.toString(), userId.toString(), election.academic_year],
      );
      if (enrRes.rowCount === 0) {
        throw new ForbiddenException(
          'Solo estudiantes con matrícula activa en el año lectivo pueden ejercer el voto.',
        );
      }
      const enrollmentId = Number(enrRes.rows[0].enrollment_id);
      const studentGradeId = Number(enrRes.rows[0].grade_id);

      // Validar mesa electoral activa y pertenencia del grado a `allowed_grades`
      let resolvedStationId: number | null = input.pollingStationId ?? null;
      if (resolvedStationId !== null) {
        const stRes = await client.query<{
          id: string;
          is_active: boolean;
          allowed_grades: unknown;
        }>(
          `SELECT id, is_active, allowed_grades
             FROM election_polling_stations
            WHERE school_id = $1 AND election_id = $2 AND id = $3`,
          [schoolId.toString(), electionId.toString(), resolvedStationId],
        );
        if (stRes.rowCount === 0 || !stRes.rows[0].is_active) {
          throw new ForbiddenException(
            'La mesa de votación seleccionada no existe o no se encuentra habilitada.',
          );
        }
        const allowed = Array.isArray(stRes.rows[0].allowed_grades)
          ? (stRes.rows[0].allowed_grades as unknown[]).map(Number)
          : [];
        if (allowed.length > 0 && !allowed.includes(studentGradeId)) {
          throw new ForbiddenException(
            'Tu grado escolar no está habilitado para votar en la mesa seleccionada.',
          );
        }
      } else {
        const activeStationsRes = await client.query<{
          id: string;
          allowed_grades: unknown;
        }>(
          `SELECT id, allowed_grades
             FROM election_polling_stations
            WHERE school_id = $1 AND election_id = $2 AND is_active = TRUE
            ORDER BY id ASC`,
          [schoolId.toString(), electionId.toString()],
        );
        if (activeStationsRes.rows.length > 0) {
          const matching = activeStationsRes.rows.find((st) => {
            const allowed = Array.isArray(st.allowed_grades)
              ? (st.allowed_grades as unknown[]).map(Number)
              : [];
            return allowed.length === 0 || allowed.includes(studentGradeId);
          });
          if (!matching) {
            throw new ForbiddenException(
              'No existe una mesa de votación activa habilitada para tu grado escolar.',
            );
          }
          resolvedStationId = Number(matching.id);
        }
      }

      const candRes = await client.query<{ id: string }>(
        `SELECT id
           FROM election_candidates
          WHERE school_id = $1
            AND id = $2
            AND election_id = $3
            AND candidacy_type_id = $4
            AND is_active = TRUE`,
        [
          schoolId.toString(),
          input.candidateId,
          electionId.toString(),
          input.candidacyTypeId,
        ],
      );
      if (candRes.rowCount === 0) {
        throw new BadRequestException(
          'El candidato seleccionado no pertenece a esta jornada o candidatura.',
        );
      }

      const existing = await client.query(
        `SELECT 1 FROM election_votes
          WHERE school_id = $1 AND election_id = $2 AND candidacy_type_id = $3 AND enrollment_id = $4`,
        [
          schoolId.toString(),
          electionId.toString(),
          input.candidacyTypeId,
          enrollmentId,
        ],
      );
      if ((existing.rowCount ?? 0) > 0) {
        throw new ConflictException(
          'Ya registraste tu voto para esta candidatura en esta jornada electoral.',
        );
      }

      const insertRes = await client.query<{ voted_at: string }>(
        `INSERT INTO election_votes (
           school_id, election_id, polling_station_id, candidacy_type_id,
           enrollment_id, candidate_id
         )
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING voted_at::text`,
        [
          schoolId.toString(),
          electionId.toString(),
          resolvedStationId,
          input.candidacyTypeId,
          enrollmentId,
          input.candidateId,
        ],
      );

      return {
        votedAt: insertRes.rows[0].voted_at,
        candidacyTypeId: input.candidacyTypeId,
      };
    });
  }

  async getElectionResults(
    schoolId: bigint,
    electionId: bigint,
  ): Promise<ElectionResultsView> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const electionRes = await client.query<Record<string, unknown>>(
        `SELECT id, academic_year, election_name, election_date::text, start_time::text, end_time::text,
                allows_blank_vote, is_active
           FROM school_elections
          WHERE school_id = $1 AND id = $2`,
        [schoolId.toString(), electionId.toString()],
      );
      if (electionRes.rowCount === 0) {
        throw new ResourceNotFoundException('SchoolElection', electionId.toString());
      }
      const election = this.mapElection(electionRes.rows[0]);

      const eligibleRes = await client.query<{ total: string }>(
        `SELECT COUNT(*)::text AS total
           FROM student_enrollments
          WHERE school_id = $1 AND academic_year = $2 AND enrollment_status_id = 2`,
        [schoolId.toString(), election.academicYear],
      );
      const totalEligibleStudents = Number(eligibleRes.rows[0]?.total ?? 0);

      const votersRes = await client.query<{ total: string }>(
        `SELECT COUNT(DISTINCT enrollment_id)::text AS total
           FROM election_votes
          WHERE school_id = $1 AND election_id = $2`,
        [schoolId.toString(), electionId.toString()],
      );
      const uniqueVotersCount = Number(votersRes.rows[0]?.total ?? 0);

      const talliesRes = await client.query<{
        candidacy_type_id: number;
        candidacy_type_name: string;
        candidate_id: string;
        ballot_number: string;
        candidate_name: string;
        is_blank_vote_option: boolean;
        votes_count: string;
      }>(
        `SELECT c.candidacy_type_id,
                ct.name AS candidacy_type_name,
                c.id AS candidate_id,
                c.ballot_number,
                c.candidate_name,
                c.is_blank_vote_option,
                COUNT(v.id)::text AS votes_count
           FROM election_candidates c
           INNER JOIN election_candidacy_types ct ON ct.id = c.candidacy_type_id
           LEFT JOIN election_votes v
             ON v.school_id = c.school_id
            AND v.election_id = c.election_id
            AND v.candidate_id = c.id
          WHERE c.school_id = $1 AND c.election_id = $2
          GROUP BY c.candidacy_type_id, ct.name, c.id, c.ballot_number, c.candidate_name, c.is_blank_vote_option
          ORDER BY c.candidacy_type_id, COUNT(v.id) DESC, c.ballot_number`,
        [schoolId.toString(), electionId.toString()],
      );

      const byCand = new Map<
        number,
        {
          candidacyTypeId: number;
          candidacyTypeName: string;
          totalVotes: number;
          raw: Array<{
            candidateId: number;
            ballotNumber: string;
            candidateName: string;
            isBlankVoteOption: boolean;
            votesCount: number;
          }>;
        }
      >();

      for (const row of talliesRes.rows) {
        const cid = Number(row.candidacy_type_id);
        const votes = Number(row.votes_count);
        const bucket = byCand.get(cid) ?? {
          candidacyTypeId: cid,
          candidacyTypeName: row.candidacy_type_name,
          totalVotes: 0,
          raw: [],
        };
        bucket.totalVotes += votes;
        bucket.raw.push({
          candidateId: Number(row.candidate_id),
          ballotNumber: row.ballot_number,
          candidateName: row.candidate_name,
          isBlankVoteOption: row.is_blank_vote_option,
          votesCount: votes,
        });
        byCand.set(cid, bucket);
      }

      const stationRes = await client.query<{
        station_id: string | null;
        station_name: string;
        votes_count: string;
      }>(
        `SELECT v.polling_station_id AS station_id,
                COALESCE(s.station_name, 'Votación Virtual / Sin Mesa') AS station_name,
                COUNT(v.id)::text AS votes_count
           FROM election_votes v
           LEFT JOIN election_polling_stations s
             ON s.school_id = v.school_id AND s.id = v.polling_station_id
          WHERE v.school_id = $1 AND v.election_id = $2
          GROUP BY v.polling_station_id, s.station_name
          ORDER BY COUNT(v.id) DESC`,
        [schoolId.toString(), electionId.toString()],
      );

      return {
        election,
        totalEligibleStudents,
        uniqueVotersCount,
        participationPercentage:
          totalEligibleStudents > 0
            ? Number(((uniqueVotersCount / totalEligibleStudents) * 100).toFixed(1))
            : 0,
        resultsByCandidacy: Array.from(byCand.values()).map((b) => ({
          candidacyTypeId: b.candidacyTypeId,
          candidacyTypeName: b.candidacyTypeName,
          totalVotes: b.totalVotes,
          candidates: b.raw.map((c) => ({
            ...c,
            votePercentage:
              b.totalVotes > 0
                ? Number(((c.votesCount / b.totalVotes) * 100).toFixed(1))
                : 0,
          })),
        })),
        stationTallies: stationRes.rows.map((s) => ({
          stationId: s.station_id ? Number(s.station_id) : null,
          stationName: s.station_name,
          votesCount: Number(s.votes_count),
        })),
      };
    });
  }

  private mapElection(r: Record<string, unknown>): SchoolElectionRecord {
    return {
      id: Number(r['id']),
      academicYear: Number(r['academic_year']),
      electionName: String(r['election_name']),
      electionDate: String(r['election_date']),
      startTime: String(r['start_time']).slice(0, 5),
      endTime: String(r['end_time']).slice(0, 5),
      allowsBlankVote: Boolean(r['allows_blank_vote']),
      isActive: Boolean(r['is_active']),
    };
  }
}
