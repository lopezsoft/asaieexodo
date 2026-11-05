import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { SmartLoggerService } from '../../../../shared/infrastructure/logging/smart-logger.service';

/**
 * Servicio CLI para aplicar el esquema relacional normalizado (3NF en ingles)
 * y ejecutar los seeds de las 53 tablas de catalogos estaticos/configuracion (MEN/DANE/SIMAT).
 */
export class StaticCatalogsSeedCli {
  private readonly logger = new SmartLoggerService();

  /**
   * Ejecuta un archivo SQL sobre el contenedor PostgreSQL 17 unificado.
   */
  public executeSqlFile(filePath: string): void {
    const sqlContent = fs.readFileSync(filePath, 'utf8');
    const result = spawnSync(
      'docker',
      [
        'exec',
        '-i',
        'asaie-v3-postgres',
        'psql',
        '-v',
        'ON_ERROR_STOP=1',
        '-U',
        process.env.DB_USER ?? 'asaie_admin',
        '-d',
        process.env.DB_NAME ?? 'asaie_v3_unified',
      ],
      {
        input: sqlContent,
        encoding: 'utf8',
        maxBuffer: 100 * 1024 * 1024,
      },
    );

    if (result.status !== 0) {
      throw new Error(
        `Error aplicando archivo SQL (${path.basename(filePath)}): ${result.stderr || result.stdout}`,
      );
    }
  }

  /**
   * Aplica las migraciones de estructura 3NF y los seeds de catalogos estaticos.
   */
  public runSchemaAndSeeds(): void {
    const initDir = path.resolve(
      __dirname,
      '../../../../../../v3-infra/postgres/init',
    );
    const orderedFiles = [
      '01-extensions.sql',
      '02-core-schema-rls.sql',
      '03-static-catalogs-seeds.sql',
    ];

    for (const fileName of orderedFiles) {
      const fullPath = path.join(initDir, fileName);
      if (fs.existsSync(fullPath)) {
        this.logger.log(
          `Aplicando ${fileName} en PostgreSQL 17...`,
          StaticCatalogsSeedCli.name,
        );
        this.executeSqlFile(fullPath);
      }
    }

    this.logger.log(
      'Esquema 3NF en ingles y 53 catalogos estaticos insertados correctamente.',
      StaticCatalogsSeedCli.name,
    );
  }
}
