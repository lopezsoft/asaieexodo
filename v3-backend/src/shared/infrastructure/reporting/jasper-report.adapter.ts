import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { execFile } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { mkdir, readFile, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';
import {
  GeneratedReportResult,
  GenerateJasperReportInput,
  ReportGeneratorPort,
} from '../../application/ports/report-generator.port';
import { SmartLoggerService } from '../logging/smart-logger.service';

const execFileAsync = promisify(execFile);

/**
 * Adaptador de infraestructura para JasperReports conectado a PostgreSQL 17.
 * Reutiliza las ~192 plantillas .jrxml / .jasper existentes en resources/reports/
 * inyectando P_SCHOOL_ID para aislamiento Multi-Tenant sin recompilar en tiempo de ejecucion.
 */
@Injectable()
export class JasperReportAdapter implements ReportGeneratorPort {
  private readonly reportsRootPath: string;
  private readonly subreportsPath: string;
  private readonly tempOutputPath: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: SmartLoggerService,
  ) {
    this.reportsRootPath = join(process.cwd(), 'resources', 'reports');
    this.subreportsPath = `${join(this.reportsRootPath, 'subreports')}/`;
    this.tempOutputPath = join(process.cwd(), 'storage', 'temp-reports');
  }

  async generateFromTemplate(
    input: GenerateJasperReportInput,
  ): Promise<GeneratedReportResult> {
    await mkdir(this.tempOutputPath, { recursive: true });

    const compiledJasperPath = join(
      this.reportsRootPath,
      `${input.templateName}.jasper`,
    );
    const executionId = randomUUID();
    const outputBaseFile = join(
      this.tempOutputPath,
      `${input.templateName}_${executionId}`,
    );
    const finalFilePath = `${outputBaseFile}.${input.outputFormat}`;

    const reportParams: Record<string, string | number | boolean> = {
      P_SCHOOL_ID: Number(input.schoolId),
      P_USER: input.requestedByFullName,
      R_MARKETING:
        'Software Académico y Administrativo ASAIE ÉXODO - https://asaie.co/',
      R_FOOTER: 'PIE DE PAGINA',
      HOME_DIR: `${this.reportsRootPath}/`,
      SUBREPORT_DIR: this.subreportsPath,
      ...input.parameters,
    };

    const paramArgs: string[] = [];
    for (const [key, value] of Object.entries(reportParams)) {
      paramArgs.push(`${key}=${String(value)}`);
    }

    try {
      const jasperBinary = this.configService.get<string>(
        'JASPER_STARTER_BIN',
        'jasperstarter',
      );

      await execFileAsync(jasperBinary, [
        'pr',
        compiledJasperPath,
        '-o',
        outputBaseFile,
        '-f',
        input.outputFormat,
        '-t',
        'postgres',
        '-H',
        this.configService.get<string>('DB_HOST', '127.0.0.1'),
        '-n',
        this.configService.get<string>('DB_NAME', 'asaie_v3_unified'),
        '-u',
        this.configService.get<string>('DB_USER', 'asaie_admin'),
        '-p',
        this.configService.get<string>(
          'DB_PASSWORD',
          'asaie_local_secret_2026',
        ),
        '--db-port',
        this.configService.get<string>('DB_PORT', '5432'),
        '-P',
        ...paramArgs,
      ]);

      const fileBuffer = await readFile(finalFilePath);
      await unlink(finalFilePath);

      return {
        fileName: `${input.templateName}_${executionId}.${input.outputFormat}`,
        mimeType: this.resolveMimeType(input.outputFormat),
        buffer: fileBuffer,
      };
    } catch (error) {
      this.logger.error('Fallo al procesar plantilla en JasperReportAdapter', {
        schoolId: String(input.schoolId),
        templateName: input.templateName,
        outputFormat: input.outputFormat,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new InternalServerErrorException(
        'No fue posible generar el reporte oficial solicitado.',
      );
    }
  }

  private resolveMimeType(format: string): string {
    const mimeTypes: Record<string, string> = {
      pdf: 'application/pdf',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      csv: 'text/csv',
      html: 'text/html',
    };
    return mimeTypes[format] ?? 'application/octet-stream';
  }
}
