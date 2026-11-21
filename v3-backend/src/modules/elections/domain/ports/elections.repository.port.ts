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

export interface ElectionJuryRecord {
  readonly id: number;
  readonly pollingStationId: number;
  readonly fullName: string;
  readonly roleTitle: string;
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

export abstract class ElectionsRepositoryPort {
  abstract listCandidacyTypes(schoolId: bigint): Promise<CandidacyTypeItem[]>;

  abstract listElections(schoolId: bigint): Promise<SchoolElectionRecord[]>;
  abstract saveElection(
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
  ): Promise<SchoolElectionRecord>;
  abstract deleteElection(schoolId: bigint, electionId: bigint): Promise<void>;

  abstract listStations(
    schoolId: bigint,
    electionId: bigint,
  ): Promise<PollingStationRecord[]>;
  abstract saveStation(
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
  ): Promise<PollingStationRecord>;
  abstract deleteStation(schoolId: bigint, stationId: bigint): Promise<void>;

  abstract addJury(
    schoolId: bigint,
    stationId: bigint,
    input: { fullName: string; roleTitle?: string },
  ): Promise<ElectionJuryRecord>;
  abstract deleteJury(schoolId: bigint, juryId: bigint): Promise<void>;

  abstract listCandidates(
    schoolId: bigint,
    electionId: bigint,
  ): Promise<ElectionCandidateRecord[]>;
  abstract saveCandidate(
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
  ): Promise<ElectionCandidateRecord>;
  abstract deleteCandidate(schoolId: bigint, candidateId: bigint): Promise<void>;

  abstract getActiveBallot(
    schoolId: bigint,
    userId: bigint,
    academicYear: number,
  ): Promise<StudentActiveBallotView>;

  abstract castVote(
    schoolId: bigint,
    userId: bigint,
    electionId: bigint,
    input: {
      candidacyTypeId: number;
      candidateId: number;
      pollingStationId?: number | null;
    },
  ): Promise<{ votedAt: string; candidacyTypeId: number }>;

  abstract getElectionResults(
    schoolId: bigint,
    electionId: bigint,
  ): Promise<ElectionResultsView>;
}
