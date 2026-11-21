import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { createInterface } from 'node:readline';
import { SmartLoggerService } from '../../../../shared/infrastructure/logging/smart-logger.service';

export interface LegacyMysqlConnectionConfig {
  readonly host: string;
  readonly port: number;
  readonly user: string;
  readonly password: string;
  readonly bridgeDb: string;
  readonly schoolDb: string;
}

const WINDOWS_WAMP_MYSQL_CANDIDATES: readonly string[] = [
  'D:\\wamp64\\bin\\mariadb\\mariadb11.4.9\\bin\\mysql.exe',
  'D:\\wamp64\\bin\\mariadb\\mariadb11.3.2\\bin\\mysql.exe',
  'D:\\wamp64\\bin\\mariadb\\mariadb11.2.2\\bin\\mysql.exe',
  'D:\\wamp64\\bin\\mariadb\\mariadb10.3.23\\bin\\mysql.exe',
  'D:\\wamp64\\bin\\mysql\\mysql8.4.7\\bin\\mysql.exe',
  'D:\\wamp64\\bin\\mysql\\mysql8.3.0\\bin\\mysql.exe',
  'D:\\wamp64\\bin\\mysql\\mysql8.0.25\\bin\\mysql.exe',
];

/**
 * Lector en streaming de MariaDB/MySQL legacy mediante el binario nativo CLI (`mysql --batch --quick`).
 * Evita dependencias externas adicionales y permite procesar tablas de +1.5M de filas con consumo
 * constante de memoria aplicando backpressure por lotes.
 */
@Injectable()
export class LegacyMysqlCliReader {
  private readonly mysqlBin: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: SmartLoggerService,
  ) {
    this.mysqlBin = this.resolveMysqlBinary();
  }

  getConnectionConfig(): LegacyMysqlConnectionConfig {
    return {
      host: this.configService.get<string>('LEGACY_MYSQL_HOST', '127.0.0.1'),
      port: Number(this.configService.get<string>('LEGACY_MYSQL_PORT', '3307')),
      user: this.configService.get<string>('LEGACY_MYSQL_USER', 'root'),
      password: this.configService.get<string>('LEGACY_MYSQL_PASSWORD', ''),
      bridgeDb: this.configService.get<string>(
        'LEGACY_BRIDGE_DB',
        'mig-schools-admin',
      ),
      schoolDb: this.configService.get<string>(
        'LEGACY_SCHOOL_DB',
        'mig-schools-franjocal',
      ),
    };
  }

  quoteIdent(identifier: string): string {
    return `\`${identifier.replace(/`/g, '``')}\``;
  }

  async queryAll<TRow extends Record<string, string | null>>(
    sql: string,
  ): Promise<TRow[]> {
    const results: TRow[] = [];
    await this.streamBatches<TRow>(sql, 5000, async (batch) => {
      for (const row of batch) {
        results.push(row);
      }
    });
    return results;
  }

  async streamBatches<TRow extends Record<string, string | null>>(
    sql: string,
    batchSize: number,
    onBatch: (batch: TRow[]) => Promise<void>,
  ): Promise<number> {
    const cfg = this.getConnectionConfig();
    const args: string[] = [
      '-h',
      cfg.host,
      '-P',
      String(cfg.port),
      '-u',
      cfg.user,
      '--batch',
      '--quick',
      '--default-character-set=utf8mb4',
    ];
    if (cfg.password) {
      args.push(`-p${cfg.password}`);
    }

    return new Promise<number>((resolve, reject) => {
      const child = spawn(this.mysqlBin, args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        windowsHide: true,
      });

      let stderrText = '';
      child.stderr.on('data', (chunk: Buffer) => {
        stderrText += chunk.toString('utf8');
      });

      const rl = createInterface({
        input: child.stdout,
        crlfDelay: Infinity,
      });

      let headers: string[] | null = null;
      let buffer: TRow[] = [];
      let totalRows = 0;
      let failed = false;
      let processing: Promise<void> = Promise.resolve();

      const fail = (err: Error): void => {
        if (failed) return;
        failed = true;
        rl.close();
        child.kill();
        reject(err);
      };

      const flushBuffer = async (rows: TRow[]): Promise<void> => {
        if (rows.length === 0 || failed) return;
        await onBatch(rows);
      };

      rl.on('line', (line: string) => {
        if (failed) return;

        if (headers === null) {
          headers = line.split('\t');
          return;
        }

        const fields = line.split('\t');
        const row: Record<string, string | null> = {};
        for (let i = 0; i < headers.length; i++) {
          const raw = fields[i];
          row[headers[i]] =
            raw === undefined || raw === '\\N'
              ? null
              : this.unescapeBatchField(raw);
        }

        buffer.push(row as TRow);
        totalRows += 1;

        if (buffer.length >= batchSize) {
          const batchToSend = buffer;
          buffer = [];
          rl.pause();
          processing = processing
            .then(() => flushBuffer(batchToSend))
            .then(() => {
              if (!failed) {
                rl.resume();
              }
            })
            .catch((err: unknown) => {
              fail(err instanceof Error ? err : new Error(String(err)));
            });
        }
      });

      child.on('error', (err) => {
        fail(
          new Error(
            `No fue posible ejecutar binario MySQL CLI (${this.mysqlBin}): ${err.message}`,
          ),
        );
      });

      const closePromise = new Promise<number>((resClose) => {
        child.on('close', (code) => resClose(code ?? 0));
      });

      rl.on('close', () => {
        if (failed) return;
        const remaining = buffer;
        buffer = [];
        processing = processing
          .then(() => flushBuffer(remaining))
          .then(() => closePromise)
          .then((exitCode) => {
            if (exitCode !== 0) {
              throw new Error(
                `Consulta MariaDB/MySQL falló (exit ${exitCode}): ${stderrText.trim().slice(0, 600)}`,
              );
            }
            resolve(totalRows);
          })
          .catch((err: unknown) => {
            reject(err instanceof Error ? err : new Error(String(err)));
          });
      });

      child.stdin.on('error', () => {
        // Ignorar EPIPE si el proceso termina antes de vaciar stdin
      });
      child.stdin.end(`${sql.trim().replace(/;+$/, '')};\n`, 'utf8');
    });
  }

  private resolveMysqlBinary(): string {
    const explicit = this.configService
      .get<string>('LEGACY_MYSQL_BIN', '')
      .trim();
    if (explicit && existsSync(explicit)) {
      return explicit;
    }
    if (process.platform === 'win32') {
      for (const candidate of WINDOWS_WAMP_MYSQL_CANDIDATES) {
        if (existsSync(candidate)) {
          this.logger.log('Binario MariaDB/MySQL CLI detectado para ETL', {
            binary: candidate,
          });
          return candidate;
        }
      }
    }
    return 'mysql';
  }

  /**
   * Decodifica escapes estándar del formato `--batch` de MySQL/MariaDB en una sola pasada.
   */
  private unescapeBatchField(value: string): string {
    if (!value.includes('\\')) {
      return value;
    }
    let out = '';
    for (let i = 0; i < value.length; i++) {
      const ch = value[i];
      if (ch === '\\' && i + 1 < value.length) {
        const next = value[i + 1];
        if (next === 'n') {
          out += '\n';
          i += 1;
          continue;
        }
        if (next === 'r') {
          out += '\r';
          i += 1;
          continue;
        }
        if (next === 't') {
          out += '\t';
          i += 1;
          continue;
        }
        if (next === '\\') {
          out += '\\';
          i += 1;
          continue;
        }
        if (next === '0') {
          out += '\0';
          i += 1;
          continue;
        }
      }
      out += ch;
    }
    return out;
  }
}
