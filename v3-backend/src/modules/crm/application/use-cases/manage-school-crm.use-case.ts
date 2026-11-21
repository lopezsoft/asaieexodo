import { Inject, Injectable } from '@nestjs/common';
import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';
import { CommunityRole } from '../../../iam/domain/enums/community-role.enum';
import {
  EMBEDDING_GENERATOR_PORT,
  IEmbeddingGeneratorPort,
} from '../../domain/ports/embedding-generator.port';
import {
  CreateCrmAnnouncementInput,
  CreateCrmConversationInput,
  CreateCrmSupportTicketInput,
  CrmAnnouncementItem,
  CrmConversationSummary,
  CrmMessageItem,
  CrmSupportTicketItem,
  ISchoolCrmRepositoryPort,
  SCHOOL_CRM_REPOSITORY_PORT,
  SemanticSearchMatch,
  SendCrmMessageInput,
  UpdateCrmSupportTicketInput,
  UpsertKnowledgeEmbeddingInput,
} from '../../domain/ports/school-crm.repository.port';

const SUPERVISOR_ROLES = new Set<string>([
  CommunityRole.SUPER_ADMIN,
  CommunityRole.SCHOOL_ADMIN,
  CommunityRole.RECTOR,
  CommunityRole.COORDINATOR,
]);

/**
 * Caso de Uso de Aplicacion para el CRM Escolar Omnicanal
 * (Conversaciones, Mensajes, Circulares, PQRSD) y Busqueda Semantica Vectorial (pgvector 768 dims).
 */
@Injectable()
export class ManageSchoolCrmUseCase {
  public static readonly VECTOR_DIMENSION = 768;

  constructor(
    @Inject(SCHOOL_CRM_REPOSITORY_PORT)
    private readonly crmRepository: ISchoolCrmRepositoryPort,
    @Inject(EMBEDDING_GENERATOR_PORT)
    private readonly embeddingGenerator: IEmbeddingGeneratorPort,
  ) {}

  public async startConversation(
    input: CreateCrmConversationInput,
  ): Promise<CrmConversationSummary> {
    return this.crmRepository.createConversationWithInitialMessage(input);
  }

  public async listConversations(params: {
    schoolId: bigint;
    userId: bigint;
    activeRole: CommunityRole;
    limit?: number;
    offset?: number;
  }): Promise<{ items: CrmConversationSummary[]; total: number }> {
    return this.crmRepository.listSchoolConversations({
      schoolId: params.schoolId,
      userId: params.userId,
      canViewAllSchoolConversations: SUPERVISOR_ROLES.has(params.activeRole),
      limit: params.limit,
      offset: params.offset,
    });
  }

  public async listConversationMessages(params: {
    schoolId: bigint;
    conversationId: bigint;
    userId: bigint;
    activeRole: CommunityRole;
    limit?: number;
    offset?: number;
  }): Promise<CrmMessageItem[]> {
    return this.crmRepository.listConversationMessages({
      schoolId: params.schoolId,
      conversationId: params.conversationId,
      userId: params.userId,
      canViewAllSchoolConversations: SUPERVISOR_ROLES.has(params.activeRole),
      limit: params.limit,
      offset: params.offset,
    });
  }

  public async sendMessage(
    input: SendCrmMessageInput,
  ): Promise<CrmMessageItem> {
    return this.crmRepository.sendMessageToConversation(input);
  }

  public async markConversationRead(
    schoolId: bigint,
    conversationId: bigint,
    userId: bigint,
  ): Promise<{ markedRead: boolean }> {
    return this.crmRepository.markConversationRead(
      schoolId,
      conversationId,
      userId,
    );
  }

  public async publishAnnouncement(
    input: CreateCrmAnnouncementInput,
  ): Promise<CrmAnnouncementItem> {
    return this.crmRepository.createAnnouncement(input);
  }

  public async listAnnouncements(params: {
    schoolId: bigint;
    userId: bigint;
    activeRole: CommunityRole;
    limit?: number;
    offset?: number;
  }): Promise<CrmAnnouncementItem[]> {
    return this.crmRepository.listAnnouncements(params);
  }

  public async acknowledgeAnnouncement(
    schoolId: bigint,
    announcementId: bigint,
    userId: bigint,
  ): Promise<{ acknowledged: boolean }> {
    return this.crmRepository.acknowledgeAnnouncement(
      schoolId,
      announcementId,
      userId,
    );
  }

  public async createSupportTicket(
    input: CreateCrmSupportTicketInput,
  ): Promise<CrmSupportTicketItem> {
    return this.crmRepository.createSupportTicket(input);
  }

  public async listSupportTickets(params: {
    schoolId: bigint;
    userId: bigint;
    activeRole: CommunityRole;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<CrmSupportTicketItem[]> {
    return this.crmRepository.listSupportTickets({
      schoolId: params.schoolId,
      userId: params.userId,
      canViewAllTickets:
        SUPERVISOR_ROLES.has(params.activeRole) ||
        params.activeRole === CommunityRole.SECRETARY,
      status: params.status,
      limit: params.limit,
      offset: params.offset,
    });
  }

  public async updateSupportTicket(
    input: UpdateCrmSupportTicketInput,
  ): Promise<CrmSupportTicketItem> {
    return this.crmRepository.updateSupportTicket(input);
  }

  public async indexInstitutionalKnowledge(
    input: Omit<UpsertKnowledgeEmbeddingInput, 'embedding'> & {
      embedding?: number[];
    },
  ): Promise<{ id: string; schoolId: string; title: string }> {
    const normalizedVector =
      input.embedding !== undefined
        ? this.embeddingGenerator.validateVector(input.embedding)
        : await this.embeddingGenerator.generateEmbedding(
            `${input.title} ${input.chunkText}`,
          );

    return this.crmRepository.upsertKnowledgeEmbedding({
      ...input,
      embedding: normalizedVector,
    });
  }

  public async searchKnowledgeBase(params: {
    schoolId: bigint;
    queryText?: string;
    queryEmbedding?: number[];
    limit?: number;
    documentSource?: string;
  }): Promise<SemanticSearchMatch[]> {
    const hasText = Boolean(params.queryText && params.queryText.trim().length > 0);
    const hasEmbedding = params.queryEmbedding !== undefined;

    if (!hasText && !hasEmbedding) {
      throw new DomainException(
        'EMPTY_SEMANTIC_QUERY',
        'Debe suministrar queryText o queryEmbedding (768 dimensiones) para ejecutar la búsqueda semántica.',
      );
    }

    const vector = hasEmbedding
      ? this.embeddingGenerator.validateVector(params.queryEmbedding!)
      : await this.embeddingGenerator.generateEmbedding(params.queryText!.trim());

    return this.crmRepository.searchSemanticKnowledge(
      params.schoolId,
      vector,
      params.limit ?? 5,
      params.documentSource,
    );
  }
}
