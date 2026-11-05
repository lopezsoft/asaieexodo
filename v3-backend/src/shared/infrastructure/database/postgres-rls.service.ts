import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import { SmartLoggerService } from '../logging/smart-logger.service';

/**
 * Adaptador de persistencia en PostgreSQL 17 con soporte nativo de Row-Level Security (RLS).
 * Cambia al rol `asaie_app_runtime` (NOBYPASSRLS) y fija `app.current_school_id` dentro de cada
 * transaccion para garantizar aislamiento fisico absoluto entre colegios.
 */
@Injectable()
export class PostgresRlsService implements OnModuleDestroy {
  private readonly pool: Pool;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: SmartLoggerService,
  ) {
    this.pool = new Pool({
      host: this.configService.get<string>('DB_HOST', '127.0.0.1'),
      port: Number(this.configService.get<string>('DB_PORT', '5434')),
      user: this.configService.get<string>('DB_USER', 'asaie_admin'),
      password: this.configService.get<string>(
        'DB_PASSWORD',
        'asaie_local_secret_2026',
      ),
      database: this.configService.get<string>('DB_NAME', 'asaie_v3_unified'),
      max: 25,
      idleTimeoutMillis: 30000,
    });
  }

  /**
   * Ejecuta una operacion dentro de una transaccion con rol `asaie_app_runtime` (NOBYPASSRLS)
   * y `app.current_school_id` activo para RLS.
   */
  async withTenantTransaction<T>(
    schoolId: bigint,
    operation: (client: PoolClient) => Promise<T>,
  ): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('SET LOCAL ROLE asaie_app_runtime');
      await client.query(
        `SELECT set_config('app.current_school_id', $1, true)`,
        [String(schoolId)],
      );
      const result = await operation(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      this.logger.error('Transaccion RLS revertida por error', {
        schoolId: String(schoolId),
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Ejecuta una consulta global en tablas compartidas (ej. schools, users, catalogos DANE).
   */
  async queryGlobal<TRow extends QueryResultRow = QueryResultRow>(
    sqlText: string,
    values: unknown[] = [],
  ): Promise<QueryResult<TRow>> {
    return this.pool.query<TRow>(sqlText, values);
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }
}
