import { Injectable } from '@nestjs/common';
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
import {
  AddElectionJuryDto,
  CastElectionVoteDto,
  SaveElectionCandidateDto,
  SavePollingStationDto,
  SaveSchoolElectionDto,
} from '../../infrastructure/http/dto/elections.dto';

@Injectable()
export class ManageElectionsUseCase {
  constructor(private readonly repository: ElectionsRepositoryPort) {}

  listCandidacyTypes(schoolId: bigint): Promise<CandidacyTypeItem[]> {
    return this.repository.listCandidacyTypes(schoolId);
  }

  listElections(schoolId: bigint): Promise<SchoolElectionRecord[]> {
    return this.repository.listElections(schoolId);
  }

  saveElection(
    schoolId: bigint,
    dto: SaveSchoolElectionDto & { id?: bigint },
  ): Promise<SchoolElectionRecord> {
    return this.repository.saveElection(schoolId, dto);
  }

  deleteElection(schoolId: bigint, electionId: bigint): Promise<void> {
    return this.repository.deleteElection(schoolId, electionId);
  }

  listStations(
    schoolId: bigint,
    electionId: bigint,
  ): Promise<PollingStationRecord[]> {
    return this.repository.listStations(schoolId, electionId);
  }

  saveStation(
    schoolId: bigint,
    electionId: bigint,
    dto: SavePollingStationDto & { id?: bigint },
  ): Promise<PollingStationRecord> {
    return this.repository.saveStation(schoolId, electionId, dto);
  }

  deleteStation(schoolId: bigint, stationId: bigint): Promise<void> {
    return this.repository.deleteStation(schoolId, stationId);
  }

  addJury(
    schoolId: bigint,
    stationId: bigint,
    dto: AddElectionJuryDto,
  ): Promise<ElectionJuryRecord> {
    return this.repository.addJury(schoolId, stationId, dto);
  }

  deleteJury(schoolId: bigint, juryId: bigint): Promise<void> {
    return this.repository.deleteJury(schoolId, juryId);
  }

  listCandidates(
    schoolId: bigint,
    electionId: bigint,
  ): Promise<ElectionCandidateRecord[]> {
    return this.repository.listCandidates(schoolId, electionId);
  }

  saveCandidate(
    schoolId: bigint,
    electionId: bigint,
    dto: SaveElectionCandidateDto & { id?: bigint },
  ): Promise<ElectionCandidateRecord> {
    return this.repository.saveCandidate(schoolId, electionId, dto);
  }

  deleteCandidate(schoolId: bigint, candidateId: bigint): Promise<void> {
    return this.repository.deleteCandidate(schoolId, candidateId);
  }

  getActiveBallot(
    schoolId: bigint,
    userId: bigint,
    academicYear: number,
  ): Promise<StudentActiveBallotView> {
    return this.repository.getActiveBallot(schoolId, userId, academicYear);
  }

  castVote(
    schoolId: bigint,
    userId: bigint,
    electionId: bigint,
    dto: CastElectionVoteDto,
  ): Promise<{ votedAt: string; candidacyTypeId: number }> {
    return this.repository.castVote(schoolId, userId, electionId, dto);
  }

  getElectionResults(
    schoolId: bigint,
    electionId: bigint,
  ): Promise<ElectionResultsView> {
    return this.repository.getElectionResults(schoolId, electionId);
  }
}
