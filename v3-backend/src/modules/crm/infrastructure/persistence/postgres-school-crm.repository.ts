import { Injectable } from '@nestjs/common';
import { PostgresRlsService } from '../../../../shared/infrastructure/database/postgres-rls.service';
import {
  CreateCrmConversationInput,
  CrmConversationSummary,
  ISchoolCrmRepositoryPort,
  SemanticSearchMatch,
  UpsertKnowledgeEmbeddingInput,
} from '../../domain/ports/school-crm.repository.port';

interface ConversationRow {
  id: string;
  school_id: string;
  channel_id: number;
  subject: string;
  conversation_type: string;
  status: string;
  last_message_at: Date;
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
 * Aplica aislamiento estricto Multi-Tenant (RLS) mediante PostgresRlsService.
 */
@Injectable()
export class PostgresSchoolCrmRepository implements ISchoolCrmRepositoryPort {
  constructor(private readonly db: PostgresRlsService) {}

  public async createConversationWithInitialMessage(
    input: CreateCrmConversationInput,
  ): Promise<CrmConversationSummary> {
    return this.db.withTenantTransaction(input.schoolId, async (client) => {
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

      for (const participant of input.participantUserIds) {
        await client.query(
          `INSERT INTO crm_conversation_participants (
             school_id, conversation_id, user_id, participant_role
           )
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (school_id, conversation_id, user_id) DO NOTHING`,
          [
            String(input.schoolId),
            conversation.id,
            String(participant.userId),
            participant.participantRole,
          ],
        );
      }

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
        lastMessageAt: new Date(conversation.last_message_at).toISOString(),
        createdAt: new Date(conversation.created_at).toISOString(),
      };
    });
  }

  public async listSchoolConversations(
    schoolId: bigint,
  ): Promise<CrmConversationSummary[]> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query<ConversationRow>(
        `SELECT id, school_id, channel_id, subject, conversation_type, status, last_message_at, created_at
         FROM crm_conversations
         WHERE school_id = $1
         ORDER BY last_message_at DESC
         LIMIT 100`,
        [String(schoolId)],
      );

      return res.rows.map((r) => ({
        id: r.id,
        schoolId: r.school_id,
        channelId: r.channel_id,
        subject: r.subject,
        conversationType: r.conversation_type,
        status: r.status,
        lastMessageAt: new Date(r.last_message_at).toISOString(),
        createdAt: new Date(r.created_at).toISOString(),
      }));
    });
  }

  public async upsertKnowledgeEmbedding(
    input: UpsertKnowledgeEmbeddingInput,
  ): Promise<{ id: string; schoolId: string; title: string }> {
    const vectorLiteral = `[${input.embedding.join(',')}]`;

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
    const vectorLiteral = `[${queryEmbedding.join(',')}]`;

    return this.db.withTenantTransaction(schoolId, async (client) => {
      const params: unknown[] = [String(schoolId), vectorLiteral, limit];
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
        const distance = Number(r.cosine_distance);
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
}
