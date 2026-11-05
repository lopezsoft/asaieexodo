import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { SmartLoggerService } from '../../../../shared/infrastructure/logging/smart-logger.service';

interface MysqlTableMetadata {
  TABLE_SCHEMA: string;
  TABLE_NAME: string;
  TABLE_TYPE: string;
  TABLE_ROWS: string | null;
}

interface MysqlColumnMetadata {
  TABLE_SCHEMA: string;
  TABLE_NAME: string;
  ORDINAL_POSITION: string;
  COLUMN_NAME: string;
  DATA_TYPE: string;
  COLUMN_TYPE: string;
  CHARACTER_MAXIMUM_LENGTH: string | null;
  NUMERIC_PRECISION: string | null;
  NUMERIC_SCALE: string | null;
  IS_NULLABLE: string;
  COLUMN_DEFAULT: string | null;
  EXTRA: string;
  COLUMN_KEY: string;
}

/**
 * Servicio CLI para la migracion integral (Esquema + Datos ETL) de las dos bases de datos
 * legacy (myschoolsadmin_exodo y asaie_exodo) hacia PostgreSQL 17 Unificado con RLS.
 */
export class FullDatabaseMigrationCli {
  private readonly logger = new SmartLoggerService();
  private readonly mysqlBin: string;
  private readonly mysqlHost: string;
  private readonly mysqlPort: string;
  private readonly mysqlUser: string;
  private readonly mysqlPassword: string;
  private readonly bridgeDbName: string;
  private readonly schoolDbName: string;
  private readonly defaultSchoolId: number;

  constructor() {
    this.mysqlBin =
      process.env.LEGACY_MYSQL_BIN ??
      'D:/wamp64/bin/mariadb/mariadb10.3.23/bin/mysql.exe';
    this.mysqlHost = process.env.LEGACY_MYSQL_HOST ?? '127.0.0.1';
    this.mysqlPort = process.env.LEGACY_MYSQL_PORT ?? '3307';
    this.mysqlUser = process.env.LEGACY_MYSQL_USER ?? 'root';
    this.mysqlPassword = process.env.LEGACY_MYSQL_PASSWORD ?? '';
    this.bridgeDbName = process.env.LEGACY_BRIDGE_DB ?? 'myschoolsadmin_exodo';
    this.schoolDbName = process.env.LEGACY_SCHOOL_DB ?? 'asaie_exodo';
    this.defaultSchoolId = Number(process.env.LEGACY_SCHOOL_TENANT_ID ?? '10');
  }

  /**
   * Ejecuta una consulta en MariaDB/MySQL enviando el SQL por stdin en UTF-8.
   */
  public runMysqlQuery(sql: string, includeHeaders = false): string {
    const args = [
      '-h',
      this.mysqlHost,
      '-P',
      this.mysqlPort,
      '-u',
      this.mysqlUser,
      '--default-character-set=utf8mb4',
      '--batch',
    ];
    if (!includeHeaders) {
      args.push('-N');
    }
    if (this.mysqlPassword) {
      args.push(`-p${this.mysqlPassword}`);
    }

    const res = spawnSync(this.mysqlBin, args, {
      input: `SET NAMES utf8mb4;\n${sql}\n`,
      encoding: 'utf8',
      maxBuffer: 350 * 1024 * 1024,
    });

    if (res.status !== 0) {
      throw new Error(
        `Error ejecutando consulta en MariaDB legacy: ${res.stderr || res.stdout}`,
      );
    }
    return res.stdout;
  }

  /**
   * Ejecuta un bloque SQL o COPY en el contenedor PostgreSQL 17 unificado.
   */
  public runPostgresSql(sql: string): string {
    const res = spawnSync(
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
        input: sql,
        encoding: 'utf8',
        maxBuffer: 350 * 1024 * 1024,
      },
    );

    if (res.status !== 0) {
      throw new Error(
        `Error ejecutando SQL en PostgreSQL 17: ${res.stderr || res.stdout}`,
      );
    }
    return res.stdout;
  }

  /**
   * Extrae los metadatos completos de tablas y columnas desde information_schema.
   */
  public extractMetadata(): {
    tables: MysqlTableMetadata[];
    columnsByTable: Record<string, MysqlColumnMetadata[]>;
  } {
    const parseTsv = <T>(tsv: string): T[] => {
      const lines = tsv.trim().split(/\r?\n/);
      if (lines.length < 2) return [];
      const headers = lines[0].split('\t');
      return lines.slice(1).map((line) => {
        const values = line.split('\t');
        const record: Record<string, string | null> = {};
        headers.forEach((h, idx) => {
          record[h] = values[idx] === 'NULL' ? null : (values[idx] ?? null);
        });
        return record as unknown as T;
      });
    };

    const tablesTsv = this.runMysqlQuery(
      `SELECT TABLE_SCHEMA, TABLE_NAME, TABLE_TYPE, TABLE_ROWS
       FROM information_schema.TABLES
       WHERE TABLE_SCHEMA IN ('${this.bridgeDbName}', '${this.schoolDbName}')
       ORDER BY TABLE_SCHEMA, TABLE_NAME;`,
      true,
    );

    const columnsTsv = this.runMysqlQuery(
      `SELECT TABLE_SCHEMA, TABLE_NAME, ORDINAL_POSITION, COLUMN_NAME, DATA_TYPE, COLUMN_TYPE,
              CHARACTER_MAXIMUM_LENGTH, NUMERIC_PRECISION, NUMERIC_SCALE, IS_NULLABLE,
              COLUMN_DEFAULT, EXTRA, COLUMN_KEY
       FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA IN ('${this.bridgeDbName}', '${this.schoolDbName}')
       ORDER BY TABLE_SCHEMA, TABLE_NAME, ORDINAL_POSITION;`,
      true,
    );

    const tables = parseTsv<MysqlTableMetadata>(tablesTsv);
    const columns = parseTsv<MysqlColumnMetadata>(columnsTsv);
    const columnsByTable: Record<string, MysqlColumnMetadata[]> = {};

    for (const col of columns) {
      if (!col.TABLE_SCHEMA || !col.TABLE_NAME) continue;
      const key = `${col.TABLE_SCHEMA}.${col.TABLE_NAME}`;
      if (!columnsByTable[key]) {
        columnsByTable[key] = [];
      }
      columnsByTable[key].push(col);
    }

    return { tables, columnsByTable };
  }

  /**
   * Construye la expresion SELECT de MariaDB para sanitizar fechas invalidas y binarios.
   */
  private buildSelectExpression(col: MysqlColumnMetadata): string {
    const dataType = (col.DATA_TYPE || '').toLowerCase();
    const escapedName = '`' + col.COLUMN_NAME.replace(/`/g, '``') + '`';

    if (dataType.includes('blob') || dataType.includes('binary')) {
      return `CASE WHEN ${escapedName} IS NULL THEN NULL ELSE CONCAT('\\\\\\\\x', HEX(${escapedName})) END`;
    }
    if (dataType === 'date') {
      return `CASE WHEN ${escapedName} IS NULL OR CAST(${escapedName} AS CHAR) IN ('0000-00-00', '') THEN NULL ELSE CAST(${escapedName} AS CHAR) END`;
    }
    if (dataType === 'datetime' || dataType === 'timestamp') {
      return `CASE WHEN ${escapedName} IS NULL OR CAST(${escapedName} AS CHAR) IN ('0000-00-00 00:00:00', '0000-00-00', '') THEN NULL ELSE CAST(${escapedName} AS CHAR) END`;
    }
    if (dataType === 'time') {
      return `CASE WHEN ${escapedName} IS NULL OR CAST(${escapedName} AS CHAR) = '' THEN NULL ELSE CAST(${escapedName} AS CHAR) END`;
    }
    if (dataType === 'year') {
      return `CASE WHEN ${escapedName} IS NULL OR CAST(${escapedName} AS CHAR) IN ('0000', '') THEN NULL ELSE CAST(${escapedName} AS UNSIGNED) END`;
    }
    return escapedName;
  }

  /**
   * Transfiere de forma masiva los registros de una tabla MySQL hacia PostgreSQL 17 usando COPY.
   */
  public copyTableData(options: {
    mysqlSchema: string;
    mysqlTable: string;
    pgTable: string;
    columns: MysqlColumnMetadata[];
    prependCols?: string[];
    extraSelectExprs?: string[];
  }): number {
    const {
      mysqlSchema,
      mysqlTable,
      pgTable,
      columns,
      prependCols = [],
      extraSelectExprs = [],
    } = options;

    if (columns.length === 0) return 0;

    const countOut = this.runMysqlQuery(
      `SELECT COUNT(*) FROM \`${mysqlSchema}\`.\`${mysqlTable}\`;`,
    ).trim();
    const rowCount = parseInt(countOut, 10) || 0;
    if (rowCount === 0) return 0;

    const selectList = [
      ...extraSelectExprs,
      ...columns.map((c) => this.buildSelectExpression(c)),
    ].join(', ');

    const pgColList = [
      ...prependCols.map((c) => `"${c}"`),
      ...columns.map((c) => `"${c.COLUMN_NAME}"`),
    ].join(', ');

    const rawTsv = this.runMysqlQuery(
      `SELECT ${selectList} FROM \`${mysqlSchema}\`.\`${mysqlTable}\`;`,
    );

    const cleanTsv = rawTsv
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\\r')
      .replace(/\0/g, '')
      .replace(/(^|\t|\n)0000-00-00( 00:00:00)?(?=\t|\n|$)/g, '$1NULL');

    if (!cleanTsv.trim()) return 0;

    const deleteClause =
      prependCols.length === 1
        ? `DELETE FROM "${pgTable}" WHERE "${prependCols[0]}" = ${this.defaultSchoolId};`
        : prependCols.length === 2
          ? `DELETE FROM "${pgTable}" WHERE "${prependCols[0]}" = ${this.defaultSchoolId} AND "${prependCols[1]}" = '${this.schoolDbName}';`
          : '';

    const copySql = [
      deleteClause,
      `CREATE TEMP TABLE tmp_import (LIKE "${pgTable}" INCLUDING DEFAULTS);`,
      `COPY tmp_import (${pgColList}) FROM STDIN WITH (FORMAT text, NULL 'NULL');`,
      cleanTsv.endsWith('\n') ? `${cleanTsv}\\.\n` : `${cleanTsv}\n\\.\n`,
      `INSERT INTO "${pgTable}" (${pgColList}) OVERRIDING SYSTEM VALUE SELECT ${pgColList} FROM tmp_import ON CONFLICT DO NOTHING;`,
      `DROP TABLE tmp_import;`,
    ].join('\n');

    this.runPostgresSql(copySql);
    return rowCount;
  }

  /**
   * Ejecuta el flujo completo de migracion de esquema y datos para ambas bases de datos.
   */
  public executeFullMigration(): void {
    this.logger.log(
      `Iniciando migracion integral de ${this.bridgeDbName} y ${this.schoolDbName} hacia PostgreSQL 17...`,
      FullDatabaseMigrationCli.name,
    );

    const schemaSqlPath = path.resolve(
      __dirname,
      '../../../../../../v3-infra/postgres/init/03-full-unified-school-schema.sql',
    );
    if (fs.existsSync(schemaSqlPath)) {
      const schemaSql = fs.readFileSync(schemaSqlPath, 'utf8');
      this.runPostgresSql(schemaSql);
      this.logger.log(
        'Esquema unificado 03-full-unified-school-schema.sql aplicado en PostgreSQL 17.',
        FullDatabaseMigrationCli.name,
      );
    }

    const { tables, columnsByTable } = this.extractMetadata();
    this.logger.log(
      `Metadatos extraidos: ${tables.length} tablas/vistas detectadas.`,
      FullDatabaseMigrationCli.name,
    );

    const schoolSkip = new Set([
      'countries',
      'departments',
      'cities',
      'sexo',
      'users',
      'file_managers',
    ]);
    let migratedTables = 0;
    let totalRows = 0;

    for (const table of tables.filter(
      (t) =>
        t.TABLE_SCHEMA === this.schoolDbName && t.TABLE_TYPE === 'BASE TABLE',
    )) {
      if (schoolSkip.has(table.TABLE_NAME)) continue;
      const cols =
        columnsByTable[`${this.schoolDbName}.${table.TABLE_NAME}`] ?? [];
      const hasNativeSchoolId = cols.some(
        (c) => c.COLUMN_NAME.toLowerCase() === 'school_id',
      );
      const tenantCol = hasNativeSchoolId ? 'tenant_school_id' : 'school_id';
      const rows = this.copyTableData({
        mysqlSchema: this.schoolDbName,
        mysqlTable: table.TABLE_NAME,
        pgTable: table.TABLE_NAME,
        columns: cols,
        prependCols: [tenantCol],
        extraSelectExprs: [`${this.defaultSchoolId} AS ${tenantCol}`],
      });
      migratedTables++;
      totalRows += rows;
    }

    this.logger.log(
      `Migracion ETL completada: ${migratedTables} tablas escolares procesadas (${totalRows} registros).`,
      FullDatabaseMigrationCli.name,
    );
  }
}
