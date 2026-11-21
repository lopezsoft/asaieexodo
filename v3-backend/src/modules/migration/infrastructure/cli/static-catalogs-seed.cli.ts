import * as crypto from 'node:crypto';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { Client } from 'pg';
import { SmartLoggerService } from '../../../../shared/infrastructure/logging/smart-logger.service';

/**
 * Servicio CLI Cloud-Native para aplicar el esquema relacional normalizado (3NF en ingles),
 * los 55 catalogos estaticos oficiales (MEN/DANE/SIMAT) y el Diccionario de Datos.
 * Se conecta directamente a PostgreSQL 17 mediante el driver `pg` (sin acoplarse a `docker exec`),
 * permitiendo su ejecucion identica en local, CI/CD, ECS y AWS RDS/Aurora.
 */
export class StaticCatalogsSeedCli {
  private readonly logger = new SmartLoggerService();

  private createPgClient(): Client {
    const isProduction = process.env.NODE_ENV === 'production';
    const useSsl =
      (process.env.DB_SSL ?? (isProduction ? 'true' : 'false')) === 'true';

    return new Client({
      host: process.env.DB_HOST ?? '127.0.0.1',
      port: Number(process.env.DB_PORT ?? '5434'),
      user: process.env.DB_USER ?? 'asaie_admin',
      password:
        process.env.DB_PASSWORD ??
        (isProduction ? '' : 'asaie_local_secret_2026'),
      database: process.env.DB_NAME ?? 'asaie_v3_unified',
      ...(useSsl ? { ssl: { rejectUnauthorized: isProduction } } : {}),
    });
  }

  /**
   * Aplica los scripts SQL ordenados y registra su checksum SHA-256 en `schema_migrations`.
   */
  public async runSchemaAndSeeds(): Promise<void> {
    const initDir = process.env.SQL_INIT_DIR
      ? path.resolve(process.env.SQL_INIT_DIR)
      : path.resolve(__dirname, '../../../../../../v3-infra/postgres/init');

    const orderedFiles = [
      '01-extensions.sql',
      '02-core-schema-rls.sql',
      '03-static-catalogs-seeds.sql',
      '04-data-dictionary-comments.sql',
    ];

    // Validacion previa Fail-Fast: ningun archivo puede omitirse silenciosamente
    for (const fileName of orderedFiles) {
      const fullPath = path.join(initDir, fileName);
      if (!fs.existsSync(fullPath)) {
        throw new Error(
          `Archivo SQL obligatorio no encontrado en '${initDir}': ${fileName}`,
        );
      }
    }

    const client = this.createPgClient();
    await client.connect();

    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
          filename VARCHAR(150) PRIMARY KEY,
          checksum_sha256 VARCHAR(64) NOT NULL,
          applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);

      for (const fileName of orderedFiles) {
        const fullPath = path.join(initDir, fileName);
        const sqlContent = fs.readFileSync(fullPath, 'utf8');
        const checksum = crypto
          .createHash('sha256')
          .update(sqlContent)
          .digest('hex');

        this.logger.log(`Aplicando ${fileName} en PostgreSQL 17...`, {
          fileName,
          checksumPrefix: checksum.slice(0, 12),
        });

        await client.query(sqlContent);

        await client.query(
          `INSERT INTO schema_migrations (filename, checksum_sha256, applied_at)
           VALUES ($1, $2, NOW())
           ON CONFLICT (filename)
           DO UPDATE SET checksum_sha256 = EXCLUDED.checksum_sha256, applied_at = NOW()`,
          [fileName, checksum],
        );
      }

      this.logger.log(
        'Esquema 3NF en ingles, 55 catalogos estaticos y Diccionario de Datos aplicados correctamente.',
        StaticCatalogsSeedCli.name,
      );
    } finally {
      await client.end();
    }
  }
}
