export const SCHOOL_CRM_REPOSITORY_PORT = Symbol('SCHOOL_CRM_REPOSITORY_PORT');

export interface CreateCrmConversationInput {
  readonly schoolId: bigint;
  readonly channelId: number;
  readonly createdByUserId: bigint;
  readonly studentEnrollmentId?: bigint | null;
  readonly subject: string;
  readonly conversationType:
    | 'DIRECT'
    | 'GROUP_ACADEMIC'
    | 'FAMILY_TEACHER'
    | 'ADMINISTRATIVE';
  readonly participantUserIds: Array<{
    readonly userId: bigint;
    readonly participantRole: string;
  }>;
  readonly initialMessageBody: string;
}

export interface CrmConversationSummary {
  readonly id: string;
  readonly schoolId: string;
  readonly channelId: number;
  readonly subject: string;
  readonly conversationType: string;
  readonly status: string;
  readonly lastMessageAt: string;
  readonly createdAt: string;
}

export interface UpsertKnowledgeEmbeddingInput {
  readonly schoolId: bigint;
  readonly documentSource:
    | 'PEI'
    | 'SIEE'
    | 'MANUAL_CONVIVENCIA'
    | 'FAQ_CIRCULAR'
    | 'CRM_MESSAGE'
    | 'ACADEMIC_CALENDAR';
  readonly sourceReferenceId?: bigint | null;
  readonly title: string;
  readonly chunkText: string;
  readonly embedding: number[];
  readonly metadata?: Record<string, unknown>;
}

export interface SemanticSearchMatch {
  readonly id: string;
  readonly schoolId: string;
  readonly documentSource: string;
  readonly title: string;
  readonly chunkText: string;
  readonly cosineSimilarity: number;
  readonly cosineDistance: number;
  readonly metadata: Record<string, unknown>;
}

export interface ISchoolCrmRepositoryPort {
  createConversationWithInitialMessage(
    input: CreateCrmConversationInput,
  ): Promise<CrmConversationSummary>;

  listSchoolConversations(schoolId: bigint): Promise<CrmConversationSummary[]>;

  upsertKnowledgeEmbedding(
    input: UpsertKnowledgeEmbeddingInput,
  ): Promise<{ id: string; schoolId: string; title: string }>;

  searchSemanticKnowledge(
    schoolId: bigint,
    queryEmbedding: number[],
    limit?: number,
    documentSource?: string,
  ): Promise<SemanticSearchMatch[]>;
}
