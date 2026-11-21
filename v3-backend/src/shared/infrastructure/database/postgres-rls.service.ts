import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import { TenantAccessDeniedException } from '../../domain/exceptions/tenant-access-denied.exception';
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
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');
    const isProduction = nodeEnv === 'production';
    const useSsl =
      this.configService.get<string>('DB_SSL', isProduction ? 'true' : 'false') ===
      'true';

    this.pool = new Pool({
      host: this.configService.get<string>('DB_HOST', '127.0.0.1'),
      port: Number(this.configService.get<string>('DB_PORT', '5434')),
      user: this.configService.get<string>('DB_USER', 'asaie_admin'),
      password: this.configService.get<string>(
        'DB_PASSWORD',
        isProduction ? '' : 'asaie_local_secret_2026',
      ),
      database: this.configService.get<string>('DB_NAME', 'asaie_v3_unified'),
      max: Number(this.configService.get<string>('DB_POOL_MAX', '25')),
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
      statement_timeout: 15000,
      ...(useSsl ? { ssl: { rejectUnauthorized: isProduction } } : {}),
    });

    this.pool.on('error', (err: Error) => {
      this.logger.error('Error inesperado en cliente inactivo del pool PostgreSQL', {
        errorMessage: err.message,
      });
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
    if (schoolId <= 0n) {
      throw new TenantAccessDeniedException(
        'Identificador de institucion educativa invalido para transaccion RLS.',
      );
    }

    const client = await this.pool.connect();
    let releaseError: Error | undefined;

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
      try {
        await client.query('ROLLBACK');
      } catch (rollbackErr) {
        releaseError =
          rollbackErr instanceof Error
            ? rollbackErr
            : new Error('ROLLBACK_FAILED');
        this.logger.error('Fallo ejecutando ROLLBACK en transaccion RLS', {
          schoolId: String(schoolId),
          errorMessage: releaseError.message,
        });
      }

      this.logger.error('Transaccion RLS revertida por error', {
        schoolId: String(schoolId),
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    } finally {
      client.release(releaseError);
    }
  }

  /**
   * Ejecuta una operacion global atomica dentro de una transaccion PostgreSQL.
   * Ideal para flujos de onboarding donde se crean registros globales (schools, users)
   * y posteriormente se activa SET LOCAL ROLE + app.current_school_id dentro de la misma transaccion.
   */
  async withGlobalTransaction<T>(
    operation: (client: PoolClient) => Promise<T>,
  ): Promise<T> {
    const client = await this.pool.connect();
    let releaseError: Error | undefined;

    try {
      await client.query('BEGIN');
      const result = await operation(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackErr) {
        releaseError =
          rollbackErr instanceof Error
            ? rollbackErr
            : new Error('ROLLBACK_FAILED');
        this.logger.error('Fallo ejecutando ROLLBACK en transaccion global', {
          errorMessage: releaseError.message,
        });
      }

      this.logger.error('Transaccion global revertida por error', {
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    } finally {
      client.release(releaseError);
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
