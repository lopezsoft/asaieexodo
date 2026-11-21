export const SCHOOL_CRM_REPOSITORY_PORT = Symbol('SCHOOL_CRM_REPOSITORY_PORT');

export interface CreateCrmConversationInput {
  readonly schoolId: bigint;
  readonly channelId: number;
  readonly createdByUserId: bigint;
  readonly createdByRole: string;
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
  readonly unreadCount: number;
  readonly lastMessageAt: string;
  readonly createdAt: string;
}

export interface CrmMessageItem {
  readonly id: string;
  readonly conversationId: string;
  readonly senderUserId: string;
  readonly channelId: number;
  readonly bodyText: string;
  readonly attachmentFileId: string | null;
  readonly deliveryStatus: string;
  readonly sentAt: string;
}

export interface SendCrmMessageInput {
  readonly schoolId: bigint;
  readonly conversationId: bigint;
  readonly senderUserId: bigint;
  readonly channelId?: number;
  readonly bodyText: string;
  readonly attachmentFileId?: bigint | null;
}

export interface CreateCrmAnnouncementInput {
  readonly schoolId: bigint;
  readonly authorUserId: bigint;
  readonly campusId?: bigint | null;
  readonly shiftId?: bigint | null;
  readonly gradeId?: bigint | null;
  readonly academicGroupId?: bigint | null;
  readonly targetRoles: string[];
  readonly title: string;
  readonly contentBody: string;
  readonly priorityLevel?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  readonly requiresAcknowledgment?: boolean;
  readonly expiresAt?: string | null;
}

export interface CrmAnnouncementItem {
  readonly id: string;
  readonly schoolId: string;
  readonly authorUserId: string;
  readonly targetRoles: string[];
  readonly title: string;
  readonly contentBody: string;
  readonly priorityLevel: string;
  readonly requiresAcknowledgment: boolean;
  readonly publishedAt: string;
  readonly expiresAt: string | null;
  readonly acknowledgedAt: string | null;
}

export interface CreateCrmSupportTicketInput {
  readonly schoolId: bigint;
  readonly categoryId: number;
  readonly requesterUserId: bigint;
  readonly studentEnrollmentId?: bigint | null;
  readonly subject: string;
  readonly description: string;
  readonly priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

export interface UpdateCrmSupportTicketInput {
  readonly schoolId: bigint;
  readonly ticketId: bigint;
  readonly assignedUserId?: bigint | null;
  readonly status?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  readonly priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

export interface CrmSupportTicketItem {
  readonly id: string;
  readonly schoolId: string;
  readonly ticketCode: string;
  readonly categoryId: number;
  readonly requesterUserId: string;
  readonly assignedUserId: string | null;
  readonly subject: string;
  readonly description: string;
  readonly priority: string;
  readonly status: string;
  readonly dueAt: string | null;
  readonly resolvedAt: string | null;
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

  listSchoolConversations(params: {
    schoolId: bigint;
    userId: bigint;
    canViewAllSchoolConversations: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ items: CrmConversationSummary[]; total: number }>;

  listConversationMessages(params: {
    schoolId: bigint;
    conversationId: bigint;
    userId: bigint;
    canViewAllSchoolConversations: boolean;
    limit?: number;
    offset?: number;
  }): Promise<CrmMessageItem[]>;

  sendMessageToConversation(input: SendCrmMessageInput): Promise<CrmMessageItem>;

  markConversationRead(
    schoolId: bigint,
    conversationId: bigint,
    userId: bigint,
  ): Promise<{ markedRead: boolean }>;

  createAnnouncement(
    input: CreateCrmAnnouncementInput,
  ): Promise<CrmAnnouncementItem>;

  listAnnouncements(params: {
    schoolId: bigint;
    userId: bigint;
    activeRole: string;
    limit?: number;
    offset?: number;
  }): Promise<CrmAnnouncementItem[]>;

  acknowledgeAnnouncement(
    schoolId: bigint,
    announcementId: bigint,
    userId: bigint,
  ): Promise<{ acknowledged: boolean }>;

  createSupportTicket(
    input: CreateCrmSupportTicketInput,
  ): Promise<CrmSupportTicketItem>;

  listSupportTickets(params: {
    schoolId: bigint;
    userId: bigint;
    canViewAllTickets: boolean;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<CrmSupportTicketItem[]>;

  updateSupportTicket(
    input: UpdateCrmSupportTicketInput,
  ): Promise<CrmSupportTicketItem>;

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
