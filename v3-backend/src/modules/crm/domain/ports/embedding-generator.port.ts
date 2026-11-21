export const EMBEDDING_GENERATOR_PORT = Symbol('EMBEDDING_GENERATOR_PORT');

export interface IEmbeddingGeneratorPort {
  readonly dimensions: number;
  generateEmbedding(text: string): Promise<number[]>;
  validateVector(vector: number[]): number[];
}
