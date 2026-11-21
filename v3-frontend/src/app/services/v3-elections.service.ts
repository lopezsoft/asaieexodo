import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiEnvelope } from './v3-unified-auth.service';

export interface CandidacyTypeItem {
  readonly id: number;
  readonly name: string;
}

export interface SchoolElectionRecord {
  readonly id: number;
  readonly academicYear: number;
  readonly electionName: string;
  readonly electionDate: string;
  readonly startTime: string;
  readonly endTime: string;
  readonly allowsBlankVote: boolean;
  readonly isActive: boolean;
}

export interface ElectionJuryRecord {
  readonly id: number;
  readonly pollingStationId: number;
  readonly fullName: string;
  readonly roleTitle: string;
}

export interface PollingStationRecord {
  readonly id: number;
  readonly electionId: number;
  readonly campusId: number | null;
  readonly campusName: string | null;
  readonly stationNumber: string;
  readonly stationName: string;
  readonly locationDescription: string | null;
  readonly allowedGrades: number[];
  readonly isActive: boolean;
  readonly juries: ElectionJuryRecord[];
}

export interface ElectionCandidateRecord {
  readonly id: number;
  readonly electionId: number;
  readonly candidacyTypeId: number;
  readonly candidacyTypeName: string;
  readonly enrollmentId: number | null;
  readonly ballotNumber: string;
  readonly candidateName: string;
  readonly proposalText: string | null;
  readonly photoUrl: string | null;
  readonly isBlankVoteOption: boolean;
  readonly isActive: boolean;
}

export interface StudentActiveBallotView {
  readonly election: SchoolElectionRecord | null;
  readonly enrollmentId: number | null;
  readonly studentFullName: string | null;
  readonly gradeName: string | null;
  readonly votedCandidacyTypeIds: number[];
  readonly candidacies: Array<{
    readonly candidacyTypeId: number;
    readonly candidacyTypeName: string;
    readonly alreadyVoted: boolean;
    readonly candidates: ElectionCandidateRecord[];
  }>;
}

export interface ElectionResultsView {
  readonly election: SchoolElectionRecord;
  readonly totalEligibleStudents: number;
  readonly uniqueVotersCount: number;
  readonly participationPercentage: number;
  readonly resultsByCandidacy: Array<{
    readonly candidacyTypeId: number;
    readonly candidacyTypeName: string;
    readonly totalVotes: number;
    readonly candidates: Array<{
      readonly candidateId: number;
      readonly ballotNumber: string;
      readonly candidateName: string;
      readonly isBlankVoteOption: boolean;
      readonly votesCount: number;
      readonly votePercentage: number;
    }>;
  }>;
  readonly stationTallies: Array<{
    readonly stationId: number | null;
    readonly stationName: string;
    readonly votesCount: number;
  }>;
}

/**
 * Servicio HTTP V3 para Gobierno Escolar, Mesas, Jurados, Candidatos,
 * Cabina Electoral Estudiantil y Escrutinio en Tiempo Real.
 */
@Injectable({ providedIn: 'root' })
export class V3ElectionsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.APIURL}/elections`;

  listCandidacyTypes(): Observable<CandidacyTypeItem[]> {
    return this.http
      .get<ApiEnvelope<CandidacyTypeItem[]>>(`${this.baseUrl}/candidacy-types`)
      .pipe(map((r) => r.data));
  }

  listElections(): Observable<SchoolElectionRecord[]> {
    return this.http
      .get<ApiEnvelope<SchoolElectionRecord[]>>(this.baseUrl)
      .pipe(map((r) => r.data));
  }

  saveElection(
    payload: Record<string, unknown>,
    electionId?: number,
  ): Observable<SchoolElectionRecord> {
    const req$ = electionId
      ? this.http.patch<ApiEnvelope<SchoolElectionRecord>>(
          `${this.baseUrl}/${electionId}`,
          payload,
        )
      : this.http.post<ApiEnvelope<SchoolElectionRecord>>(this.baseUrl, payload);
    return req$.pipe(map((r) => r.data));
  }

  deleteElection(electionId: number): Observable<{ deleted: boolean }> {
    return this.http
      .delete<ApiEnvelope<{ deleted: boolean }>>(`${this.baseUrl}/${electionId}`)
      .pipe(map((r) => r.data));
  }

  listStations(electionId: number): Observable<PollingStationRecord[]> {
    return this.http
      .get<ApiEnvelope<PollingStationRecord[]>>(
        `${this.baseUrl}/${electionId}/stations`,
      )
      .pipe(map((r) => r.data));
  }

  createStation(
    electionId: number,
    payload: Record<string, unknown>,
  ): Observable<PollingStationRecord> {
    return this.http
      .post<ApiEnvelope<PollingStationRecord>>(
        `${this.baseUrl}/${electionId}/stations`,
        payload,
      )
      .pipe(map((r) => r.data));
  }

  deleteStation(stationId: number): Observable<{ deleted: boolean }> {
    return this.http
      .delete<ApiEnvelope<{ deleted: boolean }>>(
        `${this.baseUrl}/stations/${stationId}`,
      )
      .pipe(map((r) => r.data));
  }

  addJury(
    stationId: number,
    payload: { fullName: string; roleTitle?: string },
  ): Observable<ElectionJuryRecord> {
    return this.http
      .post<ApiEnvelope<ElectionJuryRecord>>(
        `${this.baseUrl}/stations/${stationId}/juries`,
        payload,
      )
      .pipe(map((r) => r.data));
  }

  deleteJury(juryId: number): Observable<{ deleted: boolean }> {
    return this.http
      .delete<ApiEnvelope<{ deleted: boolean }>>(
        `${this.baseUrl}/juries/${juryId}`,
      )
      .pipe(map((r) => r.data));
  }

  listCandidates(electionId: number): Observable<ElectionCandidateRecord[]> {
    return this.http
      .get<ApiEnvelope<ElectionCandidateRecord[]>>(
        `${this.baseUrl}/${electionId}/candidates`,
      )
      .pipe(map((r) => r.data));
  }

  saveCandidate(
    electionId: number,
    payload: Record<string, unknown>,
    candidateId?: number,
  ): Observable<ElectionCandidateRecord> {
    const req$ = candidateId
      ? this.http.patch<ApiEnvelope<ElectionCandidateRecord>>(
          `${this.baseUrl}/${electionId}/candidates/${candidateId}`,
          payload,
        )
      : this.http.post<ApiEnvelope<ElectionCandidateRecord>>(
          `${this.baseUrl}/${electionId}/candidates`,
          payload,
        );
    return req$.pipe(map((r) => r.data));
  }

  deleteCandidate(candidateId: number): Observable<{ deleted: boolean }> {
    return this.http
      .delete<ApiEnvelope<{ deleted: boolean }>>(
        `${this.baseUrl}/candidates/${candidateId}`,
      )
      .pipe(map((r) => r.data));
  }

  getActiveBallot(academicYear: number): Observable<StudentActiveBallotView> {
    const params = new HttpParams().set('academicYear', String(academicYear));
    return this.http
      .get<ApiEnvelope<StudentActiveBallotView>>(
        `${this.baseUrl}/active-ballot`,
        { params },
      )
      .pipe(map((r) => r.data));
  }

  castVote(
    electionId: number,
    payload: {
      candidacyTypeId: number;
      candidateId: number;
      pollingStationId?: number | null;
    },
  ): Observable<{ votedAt: string; candidacyTypeId: number }> {
    return this.http
      .post<ApiEnvelope<{ votedAt: string; candidacyTypeId: number }>>(
        `${this.baseUrl}/${electionId}/vote`,
        payload,
      )
      .pipe(map((r) => r.data));
  }

  getResults(electionId: number): Observable<ElectionResultsView> {
    return this.http
      .get<ApiEnvelope<ElectionResultsView>>(
        `${this.baseUrl}/${electionId}/results`,
      )
      .pipe(map((r) => r.data));
  }
}
