import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'node:crypto';
import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';
import { SmartLoggerService } from '../../../../shared/infrastructure/logging/smart-logger.service';
import { IEmbeddingGeneratorPort } from '../../domain/ports/embedding-generator.port';

/**
 * Adaptador Hexagonal de generacion de embeddings de 768 dimensiones para pgvector.
 * - Si EMBEDDING_PROVIDER=external_http y existen EMBEDDING_API_URL + EMBEDDING_API_KEY,
 *   invoca el servicio externo con timeout estricto y validacion de 768 dims.
 * - En local/pruebas o fallback, usa un vector determinista L2-normalizado (tokens + trigramas)
 *   protegido contra norma cero y valores NaN/Infinity.
 */
@Injectable()
export class ConfigurableEmbeddingAdapter implements IEmbeddingGeneratorPort {
  public readonly dimensions = 768;
  private readonly provider: string;
  private readonly apiUrl: string;
  private readonly apiKey: string;
  private readonly model: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: SmartLoggerService,
  ) {
    this.provider = this.configService
      .get<string>('EMBEDDING_PROVIDER', 'fallback')
      .trim()
      .toLowerCase();
    this.apiUrl = this.configService.get<string>('EMBEDDING_API_URL', '').trim();
    this.apiKey = this.configService.get<string>('EMBEDDING_API_KEY', '').trim();
    this.model = this.configService
      .get<string>('EMBEDDING_MODEL', 'text-embedding-004')
      .trim();
  }

  public async generateEmbedding(text: string): Promise<number[]> {
    if (
      this.provider === 'external_http' &&
      this.apiUrl.length > 0 &&
      this.apiKey.length > 0
    ) {
      try {
        const externalVector = await this.fetchExternalEmbedding(text);
        return this.validateVector(externalVector);
      } catch (error) {
        this.logger.warn(
          'Fallo proveedor externo de embeddings; aplicando fallback determinista L2',
          {
            provider: this.provider,
            errorMessage:
              error instanceof Error ? error.message : 'Unknown error',
          },
        );
      }
    }

    return this.buildDeterministicVector(text);
  }

  public validateVector(vector: number[]): number[] {
    if (!Array.isArray(vector) || vector.length !== this.dimensions) {
      throw new DomainException(
        'INVALID_EMBEDDING_DIMENSIONS',
        `El vector de embedding debe contener exactamente ${this.dimensions} dimensiones numéricas.`,
      );
    }

    let normSquared = 0;
    for (let i = 0; i < vector.length; i++) {
      const val = vector[i];
      if (!Number.isFinite(val)) {
        throw new DomainException(
          'INVALID_EMBEDDING_VALUE',
          'El vector de embedding contiene valores no finitos (NaN o Infinity).',
        );
      }
      normSquared += val * val;
    }

    if (normSquared <= 0) {
      throw new DomainException(
        'ZERO_NORM_EMBEDDING_VECTOR',
        'El vector de embedding no puede ser un vector nulo (norma L2 igual a cero).',
      );
    }

    return vector;
  }

  private async fetchExternalEmbedding(text: string): Promise<number[]> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          input: text,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} desde proveedor de embeddings`);
      }

      const payload = (await response.json()) as {
        data?: Array<{ embedding?: number[] }>;
        embedding?: { values?: number[] } | number[];
      };

      const candidate =
        payload.data?.[0]?.embedding ??
        (Array.isArray(payload.embedding)
          ? payload.embedding
          : payload.embedding?.values);

      if (!candidate) {
        throw new Error('Respuesta del proveedor sin arreglo de embedding');
      }

      return candidate;
    } finally {
      clearTimeout(timer);
    }
  }

  private buildDeterministicVector(text: string): number[] {
    const vector = new Array<number>(this.dimensions).fill(0);
    const normalized = text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ');

    const tokens = normalized.split(/\s+/).filter((t) => t.length >= 2);
    if (tokens.length === 0) {
      vector[0] = 1;
      return vector;
    }

    const features: Array<{ key: string; weight: number }> = [];
    for (const token of tokens) {
      features.push({ key: `w:${token}`, weight: 1 + token.length * 0.1 });
      if (token.length >= 4) {
        for (let i = 0; i <= token.length - 3; i++) {
          features.push({ key: `g:${token.slice(i, i + 3)}`, weight: 0.35 });
        }
      }
    }

    for (const feat of features) {
      const digest = crypto.createHash('sha256').update(feat.key).digest();
      for (let i = 0; i < 8; i++) {
        const bucket = digest.readUInt16BE(i * 2) % this.dimensions;
        const sign = (digest[16 + i] & 1) === 0 ? 1 : -1;
        vector[bucket] += sign * feat.weight;
      }
    }

    let normSquared = 0;
    for (let i = 0; i < this.dimensions; i++) {
      normSquared += vector[i] * vector[i];
    }

    if (normSquared <= 0) {
      vector[0] = 1;
      return vector;
    }

    const norm = Math.sqrt(normSquared);
    for (let i = 0; i < this.dimensions; i++) {
      vector[i] = Number((vector[i] / norm).toFixed(6));
    }

    return vector;
  }
}
