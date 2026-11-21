import { Injectable } from '@nestjs/common';
import * as crypto from 'node:crypto';
import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';
import { ResourceNotFoundException } from '../../../../shared/domain/exceptions/resource-not-found.exception';
import { TenantAccessDeniedException } from '../../../../shared/domain/exceptions/tenant-access-denied.exception';
import { PostgresRlsService } from '../../../../shared/infrastructure/database/postgres-rls.service';
import {
  CreateCrmAnnouncementInput,
  CreateCrmConversationInput,
  CreateCrmSupportTicketInput,
  CrmAnnouncementItem,
  CrmConversationSummary,
  CrmMessageItem,
  CrmSupportTicketItem,
  ISchoolCrmRepositoryPort,
  SemanticSearchMatch,
  SendCrmMessageInput,
  UpdateCrmSupportTicketInput,
  UpsertKnowledgeEmbeddingInput,
} from '../../domain/ports/school-crm.repository.port';

interface ConversationRow {
  id: string;
  school_id: string;
  channel_id: number;
  subject: string;
  conversation_type: string;
  status: string;
  unread_count?: number;
  last_message_at: Date;
  created_at: Date;
}

interface MessageRow {
  id: string;
  conversation_id: string;
  sender_user_id: string;
  channel_id: number;
  body_text: string;
  attachment_file_id: string | null;
  delivery_status: string;
  sent_at: Date;
}

interface AnnouncementRow {
  id: string;
  school_id: string;
  author_user_id: string;
  target_roles: string[];
  title: string;
  content_body: string;
  priority_level: string;
  requires_acknowledgment: boolean;
  published_at: Date;
  expires_at: Date | null;
  acknowledged_at: Date | null;
}

interface TicketRow {
  id: string;
  school_id: string;
  ticket_code: string;
  category_id: number;
  requester_user_id: string;
  assigned_user_id: string | null;
  subject: string;
  description: string;
  priority: string;
  status: string;
  due_at: Date | null;
  resolved_at: Date | null;
  created_at: Date;
}

interface SemanticMatchRow {
  id: string;
  school_id: string;
  document_source: string;
  title: string;
  chunk_text: string;
  cosine_distance: string;
  metadata: Record<string, unknown>;
}

/**
 * Adaptador de infraestructura PostgreSQL 17 + pgvector para el CRM Escolar Omnicanal.
 * Aplica aislamiento estricto Multi-Tenant (RLS), control de pertenencia por participante,
 * inserciones batch sin N+1, paginacion acotada y busqueda vectorial iterativa HNSW.
 */
@Injectable()
export class PostgresSchoolCrmRepository implements ISchoolCrmRepositoryPort {
  constructor(private readonly db: PostgresRlsService) {}

  public async createConversationWithInitialMessage(
    input: CreateCrmConversationInput,
  ): Promise<CrmConversationSummary> {
    return this.db.withTenantTransaction(input.schoolId, async (client) => {
      // Construir lista unica de participantes asegurando incluir al creador
      const participantsMap = new Map<string, string>();
      participantsMap.set(String(input.createdByUserId), input.createdByRole);
      for (const participant of input.participantUserIds) {
        participantsMap.set(
          String(participant.userId),
          participant.participantRole,
        );
      }

      const participantIds = Array.from(participantsMap.keys());
      const participantRoles = Array.from(participantsMap.values());

      // Verificar que todos los participantes pertenezcan al mismo colegio (RLS)
      const membershipCheck = await client.query<{ user_id: string }>(
        `SELECT DISTINCT user_id::text AS user_id
         FROM user_school_memberships
         WHERE school_id = $1
           AND user_id = ANY($2::bigint[])
           AND is_active = TRUE
           AND status = 'ACTIVE'`,
        [String(input.schoolId), participantIds],
      );

      const validMembers = new Set(membershipCheck.rows.map((r) => r.user_id));
      for (const pid of participantIds) {
        if (!validMembers.has(pid)) {
          throw new TenantAccessDeniedException(
            `El usuario participante ${pid} no pertenece activamente a esta institución educativa.`,
          );
        }
      }

      const convRes = await client.query<ConversationRow>(
        `INSERT INTO crm_conversations (
           school_id, channel_id, created_by_user_id, student_enrollment_id,
           subject, conversation_type, status
         )
         VALUES ($1, $2, $3, $4, $5, $6, 'OPEN')
         RETURNING id, school_id, channel_id, subject, conversation_type, status, last_message_at, created_at`,
        [
          String(input.schoolId),
          input.channelId,
          String(input.createdByUserId),
          input.studentEnrollmentId ? String(input.studentEnrollmentId) : null,
          input.subject,
          input.conversationType,
        ],
      );

      const conversation = convRes.rows[0];

      // Insercion en lote con UNNEST (evita N+1) + unread_count = 1 para receptores
      await client.query(
        `INSERT INTO crm_conversation_participants (
           school_id, conversation_id, user_id, participant_role, unread_count
         )
         SELECT
           $1::bigint,
           $2::bigint,
           u.uid,
           u.urole,
           CASE WHEN u.uid = $3::bigint THEN 0 ELSE 1 END
         FROM UNNEST($4::bigint[], $5::varchar[]) AS u(uid, urole)
         ON CONFLICT (school_id, conversation_id, user_id) DO NOTHING`,
        [
          String(input.schoolId),
          conversation.id,
          String(input.createdByUserId),
          participantIds,
          participantRoles,
        ],
      );

      await client.query(
        `INSERT INTO crm_messages (
           school_id, conversation_id, sender_user_id, channel_id, body_text, delivery_status
         )
         VALUES ($1, $2, $3, $4, $5, 'SENT')`,
        [
          String(input.schoolId),
          conversation.id,
          String(input.createdByUserId),
          input.channelId,
          input.initialMessageBody,
        ],
      );

      return {
        id: conversation.id,
        schoolId: conversation.school_id,
        channelId: conversation.channel_id,
        subject: conversation.subject,
        conversationType: conversation.conversation_type,
        status: conversation.status,
        unreadCount: 0,
        lastMessageAt: new Date(conversation.last_message_at).toISOString(),
        createdAt: new Date(conversation.created_at).toISOString(),
      };
    });
  }

  public async listSchoolConversations(params: {
    schoolId: bigint;
    userId: bigint;
    canViewAllSchoolConversations: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ items: CrmConversationSummary[]; total: number }> {
    const safeLimit = Math.min(Math.max(1, params.limit ?? 20), 100);
    const safeOffset = Math.max(0, params.offset ?? 0);

    return this.db.withTenantTransaction(params.schoolId, async (client) => {
      if (params.canViewAllSchoolConversations) {
        const countRes = await client.query<{ total: string }>(
          `SELECT COUNT(*)::text AS total
           FROM crm_conversations
           WHERE school_id = $1`,
          [String(params.schoolId)],
        );

        const res = await client.query<ConversationRow>(
          `SELECT c.id, c.school_id, c.channel_id, c.subject, c.conversation_type,
                  c.status, COALESCE(p.unread_count, 0) AS unread_count,
                  c.last_message_at, c.created_at
           FROM crm_conversations c
           LEFT JOIN crm_conversation_participants p
             ON p.school_id = c.school_id
            AND p.conversation_id = c.id
            AND p.user_id = $2
           WHERE c.school_id = $1
           ORDER BY c.last_message_at DESC
           LIMIT $3 OFFSET $4`,
          [String(params.schoolId), String(params.userId), safeLimit, safeOffset],
        );

        return {
          total: Number(countRes.rows[0]?.total ?? 0),
          items: res.rows.map((r) => this.mapConversation(r)),
        };
      }

      const countRes = await client.query<{ total: string }>(
        `SELECT COUNT(*)::text AS total
         FROM crm_conversations c
         INNER JOIN crm_conversation_participants p
           ON p.school_id = c.school_id
          AND p.conversation_id = c.id
         WHERE c.school_id = $1 AND p.user_id = $2`,
        [String(params.schoolId), String(params.userId)],
      );

      const res = await client.query<ConversationRow>(
        `SELECT c.id, c.school_id, c.channel_id, c.subject, c.conversation_type,
                c.status, p.unread_count, c.last_message_at, c.created_at
         FROM crm_conversations c
         INNER JOIN crm_conversation_participants p
           ON p.school_id = c.school_id
          AND p.conversation_id = c.id
         WHERE c.school_id = $1 AND p.user_id = $2
         ORDER BY c.last_message_at DESC
         LIMIT $3 OFFSET $4`,
        [String(params.schoolId), String(params.userId), safeLimit, safeOffset],
      );

      return {
        total: Number(countRes.rows[0]?.total ?? 0),
        items: res.rows.map((r) => this.mapConversation(r)),
      };
    });
  }

  public async listConversationMessages(params: {
    schoolId: bigint;
    conversationId: bigint;
    userId: bigint;
    canViewAllSchoolConversations: boolean;
    limit?: number;
    offset?: number;
  }): Promise<CrmMessageItem[]> {
    const safeLimit = Math.min(Math.max(1, params.limit ?? 50), 100);
    const safeOffset = Math.max(0, params.offset ?? 0);

    return this.db.withTenantTransaction(params.schoolId, async (client) => {
      if (!params.canViewAllSchoolConversations) {
        const partRes = await client.query<{ id: string }>(
          `SELECT id
           FROM crm_conversation_participants
           WHERE school_id = $1 AND conversation_id = $2 AND user_id = $3
           LIMIT 1`,
          [
            String(params.schoolId),
            String(params.conversationId),
            String(params.userId),
          ],
        );
        if (partRes.rowCount === 0) {
          throw new TenantAccessDeniedException(
            'No tienes acceso a los mensajes de esta conversación.',
          );
        }
      }

      const res = await client.query<MessageRow>(
        `SELECT id, conversation_id, sender_user_id, channel_id, body_text,
                attachment_file_id, delivery_status, sent_at
         FROM crm_messages
         WHERE school_id = $1 AND conversation_id = $2
         ORDER BY sent_at ASC
         LIMIT $3 OFFSET $4`,
        [
          String(params.schoolId),
          String(params.conversationId),
          safeLimit,
          safeOffset,
        ],
      );

      return res.rows.map((r) => ({
        id: r.id,
        conversationId: r.conversation_id,
        senderUserId: r.sender_user_id,
        channelId: r.channel_id,
        bodyText: r.body_text,
        attachmentFileId: r.attachment_file_id,
        deliveryStatus: r.delivery_status,
        sentAt: new Date(r.sent_at).toISOString(),
      }));
    });
  }

  public async sendMessageToConversation(
    input: SendCrmMessageInput,
  ): Promise<CrmMessageItem> {
    return this.db.withTenantTransaction(input.schoolId, async (client) => {
      const convRes = await client.query<{
        id: string;
        channel_id: number;
        status: string;
      }>(
        `SELECT c.id, c.channel_id, c.status
         FROM crm_conversations c
         INNER JOIN crm_conversation_participants p
           ON p.school_id = c.school_id
          AND p.conversation_id = c.id
          AND p.user_id = $3
         WHERE c.school_id = $1 AND c.id = $2
         LIMIT 1`,
        [
          String(input.schoolId),
          String(input.conversationId),
          String(input.senderUserId),
        ],
      );

      if (convRes.rowCount === 0) {
        throw new TenantAccessDeniedException(
          'No perteneces a esta conversación o la conversación no existe en la institución.',
        );
      }

      if (convRes.rows[0].status === 'CLOSED') {
        throw new DomainException(
          'CONVERSATION_CLOSED',
          'No es posible enviar mensajes en una conversación cerrada.',
        );
      }

      const effectiveChannelId = input.channelId ?? convRes.rows[0].channel_id;
      const msgRes = await client.query<MessageRow>(
        `INSERT INTO crm_messages (
           school_id, conversation_id, sender_user_id, channel_id,
           body_text, attachment_file_id, delivery_status
         )
         VALUES ($1, $2, $3, $4, $5, $6, 'SENT')
         RETURNING id, conversation_id, sender_user_id, channel_id, body_text,
                   attachment_file_id, delivery_status, sent_at`,
        [
          String(input.schoolId),
          String(input.conversationId),
          String(input.senderUserId),
          effectiveChannelId,
          input.bodyText,
          input.attachmentFileId ? String(input.attachmentFileId) : null,
        ],
      );

      await client.query(
        `UPDATE crm_conversations
         SET last_message_at = NOW()
         WHERE school_id = $1 AND id = $2`,
        [String(input.schoolId), String(input.conversationId)],
      );

      await client.query(
        `UPDATE crm_conversation_participants
         SET unread_count = unread_count + 1
         WHERE school_id = $1 AND conversation_id = $2 AND user_id <> $3`,
        [
          String(input.schoolId),
          String(input.conversationId),
          String(input.senderUserId),
        ],
      );

      const row = msgRes.rows[0];
      return {
        id: row.id,
        conversationId: row.conversation_id,
        senderUserId: row.sender_user_id,
        channelId: row.channel_id,
        bodyText: row.body_text,
        attachmentFileId: row.attachment_file_id,
        deliveryStatus: row.delivery_status,
        sentAt: new Date(row.sent_at).toISOString(),
      };
    });
  }

  public async markConversationRead(
    schoolId: bigint,
    conversationId: bigint,
    userId: bigint,
  ): Promise<{ markedRead: boolean }> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query(
        `UPDATE crm_conversation_participants
         SET unread_count = 0,
             last_read_at = NOW()
         WHERE school_id = $1 AND conversation_id = $2 AND user_id = $3`,
        [String(schoolId), String(conversationId), String(userId)],
      );

      if (res.rowCount === 0) {
        throw new ResourceNotFoundException(
          'CrmConversationParticipant',
          conversationId,
        );
      }

      return { markedRead: true };
    });
  }

  public async createAnnouncement(
    input: CreateCrmAnnouncementInput,
  ): Promise<CrmAnnouncementItem> {
    return this.db.withTenantTransaction(input.schoolId, async (client) => {
      const res = await client.query<AnnouncementRow>(
        `INSERT INTO crm_announcements (
           school_id, author_user_id, campus_id, shift_id, grade_id,
           academic_group_id, target_roles, title, content_body,
           priority_level, requires_acknowledgment, expires_at
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7::text[], $8, $9, $10, $11, $12)
         RETURNING id, school_id, author_user_id, target_roles, title, content_body,
                   priority_level, requires_acknowledgment, published_at, expires_at,
                   NULL::timestamptz AS acknowledged_at`,
        [
          String(input.schoolId),
          String(input.authorUserId),
          input.campusId ? String(input.campusId) : null,
          input.shiftId ? String(input.shiftId) : null,
          input.gradeId ? String(input.gradeId) : null,
          input.academicGroupId ? String(input.academicGroupId) : null,
          input.targetRoles,
          input.title,
          input.contentBody,
          input.priorityLevel ?? 'NORMAL',
          input.requiresAcknowledgment ?? false,
          input.expiresAt ?? null,
        ],
      );

      return this.mapAnnouncement(res.rows[0]);
    });
  }

  public async listAnnouncements(params: {
    schoolId: bigint;
    userId: bigint;
    activeRole: string;
    limit?: number;
    offset?: number;
  }): Promise<CrmAnnouncementItem[]> {
    const safeLimit = Math.min(Math.max(1, params.limit ?? 20), 100);
    const safeOffset = Math.max(0, params.offset ?? 0);

    return this.db.withTenantTransaction(params.schoolId, async (client) => {
      const res = await client.query<AnnouncementRow>(
        `SELECT a.id, a.school_id, a.author_user_id, a.target_roles, a.title,
                a.content_body, a.priority_level, a.requires_acknowledgment,
                a.published_at, a.expires_at, r.acknowledged_at
         FROM crm_announcements a
         LEFT JOIN crm_announcement_receipts r
           ON r.school_id = a.school_id
          AND r.announcement_id = a.id
          AND r.user_id = $2
         WHERE a.school_id = $1
           AND (a.expires_at IS NULL OR a.expires_at > NOW())
           AND ($3 = ANY(a.target_roles) OR a.author_user_id = $2 OR $3 IN ('SUPER_ADMIN','SCHOOL_ADMIN','RECTOR','COORDINATOR'))
         ORDER BY a.published_at DESC
         LIMIT $4 OFFSET $5`,
        [
          String(params.schoolId),
          String(params.userId),
          params.activeRole,
          safeLimit,
          safeOffset,
        ],
      );

      return res.rows.map((r) => this.mapAnnouncement(r));
    });
  }

  public async acknowledgeAnnouncement(
    schoolId: bigint,
    announcementId: bigint,
    userId: bigint,
  ): Promise<{ acknowledged: boolean }> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const existsRes = await client.query<{ id: string }>(
        `SELECT id FROM crm_announcements WHERE school_id = $1 AND id = $2 LIMIT 1`,
        [String(schoolId), String(announcementId)],
      );
      if (existsRes.rowCount === 0) {
        throw new ResourceNotFoundException('CrmAnnouncement', announcementId);
      }

      await client.query(
        `INSERT INTO crm_announcement_receipts (school_id, announcement_id, user_id, read_at, acknowledged_at)
         VALUES ($1, $2, $3, NOW(), NOW())
         ON CONFLICT (school_id, announcement_id, user_id)
         DO UPDATE SET acknowledged_at = COALESCE(crm_announcement_receipts.acknowledged_at, NOW())`,
        [String(schoolId), String(announcementId), String(userId)],
      );

      return { acknowledged: true };
    });
  }

  public async createSupportTicket(
    input: CreateCrmSupportTicketInput,
  ): Promise<CrmSupportTicketItem> {
    return this.db.withTenantTransaction(input.schoolId, async (client) => {
      const catRes = await client.query<{ sla_hours: number }>(
        `SELECT sla_hours FROM crm_ticket_categories WHERE id = $1 AND is_active = TRUE LIMIT 1`,
        [input.categoryId],
      );
      if (catRes.rowCount === 0) {
        throw new ResourceNotFoundException(
          'CrmTicketCategory',
          input.categoryId,
        );
      }

      const slaHours = catRes.rows[0].sla_hours;
      const ticketCode = `PQR-${new Date().getFullYear()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

      const res = await client.query<TicketRow>(
        `INSERT INTO crm_support_tickets (
           school_id, ticket_code, category_id, requester_user_id,
           student_enrollment_id, subject, description, priority, status, due_at
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'OPEN', NOW() + ($9::int * INTERVAL '1 hour'))
         RETURNING id, school_id, ticket_code, category_id, requester_user_id,
                   assigned_user_id, subject, description, priority, status,
                   due_at, resolved_at, created_at`,
        [
          String(input.schoolId),
          ticketCode,
          input.categoryId,
          String(input.requesterUserId),
          input.studentEnrollmentId ? String(input.studentEnrollmentId) : null,
          input.subject,
          input.description,
          input.priority ?? 'MEDIUM',
          slaHours,
        ],
      );

      return this.mapTicket(res.rows[0]);
    });
  }

  public async listSupportTickets(params: {
    schoolId: bigint;
    userId: bigint;
    canViewAllTickets: boolean;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<CrmSupportTicketItem[]> {
    const safeLimit = Math.min(Math.max(1, params.limit ?? 20), 100);
    const safeOffset = Math.max(0, params.offset ?? 0);

    return this.db.withTenantTransaction(params.schoolId, async (client) => {
      const queryParams: unknown[] = [String(params.schoolId)];
      const clauses: string[] = ['school_id = $1'];

      if (!params.canViewAllTickets) {
        queryParams.push(String(params.userId));
        const idx = queryParams.length;
        clauses.push(`(requester_user_id = $${idx} OR assigned_user_id = $${idx})`);
      }

      if (params.status) {
        queryParams.push(params.status);
        clauses.push(`status = $${queryParams.length}`);
      }

      queryParams.push(safeLimit, safeOffset);
      const limitIdx = queryParams.length - 1;
      const offsetIdx = queryParams.length;

      const res = await client.query<TicketRow>(
        `SELECT id, school_id, ticket_code, category_id, requester_user_id,
                assigned_user_id, subject, description, priority, status,
                due_at, resolved_at, created_at
         FROM crm_support_tickets
         WHERE ${clauses.join(' AND ')}
         ORDER BY created_at DESC
         LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
        queryParams,
      );

      return res.rows.map((r) => this.mapTicket(r));
    });
  }

  public async updateSupportTicket(
    input: UpdateCrmSupportTicketInput,
  ): Promise<CrmSupportTicketItem> {
    return this.db.withTenantTransaction(input.schoolId, async (client) => {
      const isResolved =
        input.status === 'RESOLVED' || input.status === 'CLOSED';

      const res = await client.query<TicketRow>(
        `UPDATE crm_support_tickets
         SET assigned_user_id = COALESCE($3, assigned_user_id),
             status = COALESCE($4, status),
             priority = COALESCE($5, priority),
             resolved_at = CASE WHEN $6 THEN COALESCE(resolved_at, NOW()) ELSE resolved_at END
         WHERE school_id = $1 AND id = $2
         RETURNING id, school_id, ticket_code, category_id, requester_user_id,
                   assigned_user_id, subject, description, priority, status,
                   due_at, resolved_at, created_at`,
        [
          String(input.schoolId),
          String(input.ticketId),
          input.assignedUserId ? String(input.assignedUserId) : null,
          input.status ?? null,
          input.priority ?? null,
          isResolved,
        ],
      );

      if (res.rowCount === 0) {
        throw new ResourceNotFoundException('CrmSupportTicket', input.ticketId);
      }

      return this.mapTicket(res.rows[0]);
    });
  }

  public async upsertKnowledgeEmbedding(
    input: UpsertKnowledgeEmbeddingInput,
  ): Promise<{ id: string; schoolId: string; title: string }> {
    const vectorLiteral = this.serializeVector(input.embedding);

    return this.db.withTenantTransaction(input.schoolId, async (client) => {
      const res = await client.query<{
        id: string;
        school_id: string;
        title: string;
      }>(
        `INSERT INTO crm_knowledge_embeddings (
           school_id, document_source, source_reference_id, title, chunk_text, embedding, metadata
         )
         VALUES ($1, $2, $3, $4, $5, $6::vector, $7::jsonb)
         RETURNING id, school_id, title`,
        [
          String(input.schoolId),
          input.documentSource,
          input.sourceReferenceId ? String(input.sourceReferenceId) : null,
          input.title,
          input.chunkText,
          vectorLiteral,
          JSON.stringify(input.metadata ?? {}),
        ],
      );

      const row = res.rows[0];
      return {
        id: row.id,
        schoolId: row.school_id,
        title: row.title,
      };
    });
  }

  public async searchSemanticKnowledge(
    schoolId: bigint,
    queryEmbedding: number[],
    limit = 5,
    documentSource?: string,
  ): Promise<SemanticSearchMatch[]> {
    const safeLimit = Math.min(Math.max(1, Math.floor(limit)), 50);
    const vectorLiteral = this.serializeVector(queryEmbedding);

    return this.db.withTenantTransaction(schoolId, async (client) => {
      // Habilitar iterative_scan en pgvector 0.8+ para evitar resultados vacios bajo filtrado RLS
      await client
        .query(`SET LOCAL hnsw.iterative_scan = relaxed_order`)
        .catch(() => undefined);

      const params: unknown[] = [String(schoolId), vectorLiteral, safeLimit];
      let sourceFilterSql = '';
      if (documentSource) {
        params.push(documentSource);
        sourceFilterSql = `AND document_source = $4`;
      }

      const res = await client.query<SemanticMatchRow>(
        `SELECT
           id,
           school_id,
           document_source,
           title,
           chunk_text,
           (embedding <=> $2::vector) AS cosine_distance,
           metadata
         FROM crm_knowledge_embeddings
         WHERE school_id = $1
           ${sourceFilterSql}
         ORDER BY embedding <=> $2::vector ASC
         LIMIT $3`,
        params,
      );

      return res.rows.map((r) => {
        const rawDistance = Number(r.cosine_distance);
        const distance = Number.isFinite(rawDistance) ? rawDistance : 1;
        return {
          id: r.id,
          schoolId: r.school_id,
          documentSource: r.document_source,
          title: r.title,
          chunkText: r.chunk_text,
          cosineDistance: Number(distance.toFixed(6)),
          cosineSimilarity: Number((1 - distance).toFixed(6)),
          metadata: r.metadata ?? {},
        };
      });
    });
  }

  private serializeVector(embedding: number[]): string {
    for (const val of embedding) {
      if (!Number.isFinite(val)) {
        throw new DomainException(
          'INVALID_EMBEDDING_VALUE',
          'Todos los componentes del vector pgvector deben ser números finitos.',
        );
      }
    }
    return `[${embedding.join(',')}]`;
  }

  private mapConversation(r: ConversationRow): CrmConversationSummary {
    return {
      id: r.id,
      schoolId: r.school_id,
      channelId: r.channel_id,
      subject: r.subject,
      conversationType: r.conversation_type,
      status: r.status,
      unreadCount: Number(r.unread_count ?? 0),
      lastMessageAt: new Date(r.last_message_at).toISOString(),
      createdAt: new Date(r.created_at).toISOString(),
    };
  }

  private mapAnnouncement(r: AnnouncementRow): CrmAnnouncementItem {
    return {
      id: r.id,
      schoolId: r.school_id,
      authorUserId: r.author_user_id,
      targetRoles: r.target_roles ?? [],
      title: r.title,
      contentBody: r.content_body,
      priorityLevel: r.priority_level,
      requiresAcknowledgment: r.requires_acknowledgment,
      publishedAt: new Date(r.published_at).toISOString(),
      expiresAt: r.expires_at ? new Date(r.expires_at).toISOString() : null,
      acknowledgedAt: r.acknowledged_at
        ? new Date(r.acknowledged_at).toISOString()
        : null,
    };
  }

  private mapTicket(r: TicketRow): CrmSupportTicketItem {
    return {
      id: r.id,
      schoolId: r.school_id,
      ticketCode: r.ticket_code,
      categoryId: r.category_id,
      requesterUserId: r.requester_user_id,
      assignedUserId: r.assigned_user_id,
      subject: r.subject,
      description: r.description,
      priority: r.priority,
      status: r.status,
      dueAt: r.due_at ? new Date(r.due_at).toISOString() : null,
      resolvedAt: r.resolved_at ? new Date(r.resolved_at).toISOString() : null,
      createdAt: new Date(r.created_at).toISOString(),
    };
  }
}
