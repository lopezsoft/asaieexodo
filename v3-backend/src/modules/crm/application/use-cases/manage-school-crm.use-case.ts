import { Inject, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import {
  CreateCrmConversationInput,
  CrmConversationSummary,
  ISchoolCrmRepositoryPort,
  SCHOOL_CRM_REPOSITORY_PORT,
  SemanticSearchMatch,
  UpsertKnowledgeEmbeddingInput,
} from '../../domain/ports/school-crm.repository.port';

/**
 * Caso de Uso de Aplicacion para el CRM Escolar Omnicanal
 * y Busqueda Semantica Vectorial (pgvector 768 dimensiones)
 * aislado por Institucion Educativa (RLS).
 */
@Injectable()
export class ManageSchoolCrmUseCase {
  public static readonly VECTOR_DIMENSION = 768;

  constructor(
    @Inject(SCHOOL_CRM_REPOSITORY_PORT)
    private readonly crmRepository: ISchoolCrmRepositoryPort,
  ) {}

  public async startConversation(
    input: CreateCrmConversationInput,
  ): Promise<CrmConversationSummary> {
    return this.crmRepository.createConversationWithInitialMessage(input);
  }

  public async listConversations(
    schoolId: bigint,
  ): Promise<CrmConversationSummary[]> {
    return this.crmRepository.listSchoolConversations(schoolId);
  }

  public async indexInstitutionalKnowledge(
    input: Omit<UpsertKnowledgeEmbeddingInput, 'embedding'> & {
      embedding?: number[];
    },
  ): Promise<{ id: string; schoolId: string; title: string }> {
    const normalizedVector =
      input.embedding && input.embedding.length === ManageSchoolCrmUseCase.VECTOR_DIMENSION
        ? input.embedding
        : this.buildDeterministicSemanticVector(`${input.title} ${input.chunkText}`);

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
    const vector =
      params.queryEmbedding &&
      params.queryEmbedding.length === ManageSchoolCrmUseCase.VECTOR_DIMENSION
        ? params.queryEmbedding
        : this.buildDeterministicSemanticVector(params.queryText ?? '');

    return this.crmRepository.searchSemanticKnowledge(
      params.schoolId,
      vector,
      params.limit ?? 5,
      params.documentSource,
    );
  }

  /**
   * Genera un vector normalizado unitario (L2 = 1.0) de 768 dimensiones
   * basado en n-gramas semanticos cuando no se suministra un vector externo,
   * permitiendo pruebas locales deterministas y fallback sin latencia externa.
   */
  public buildDeterministicSemanticVector(text: string): number[] {
    const dimension = ManageSchoolCrmUseCase.VECTOR_DIMENSION;
    const vector = new Array<number>(dimension).fill(0);
    const normalized = text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ');

    const tokens = normalized
      .split(/\s+/)
      .filter((t) => t.length >= 2);

    if (tokens.length === 0) {
      vector[0] = 1;
      return vector;
    }

    for (const token of tokens) {
      const digest = crypto.createHash('sha256').update(token).digest();
      for (let i = 0; i < 8; i++) {
        const bucket = digest.readUInt16BE(i * 2) % dimension;
        const sign = (digest[16 + i] & 1) === 0 ? 1 : -1;
        vector[bucket] += sign * (1 + token.length * 0.1);
      }
    }

    let norm = 0;
    for (let i = 0; i < dimension; i++) {
      norm += vector[i] * vector[i];
    }
    norm = Math.sqrt(norm) || 1;

    for (let i = 0; i < dimension; i++) {
      vector[i] = Number((vector[i] / norm).toFixed(6));
    }

    return vector;
  }
}
