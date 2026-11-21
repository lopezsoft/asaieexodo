import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { execFile } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { access, mkdir, readFile, unlink } from 'node:fs/promises';
import { join, resolve, sep } from 'node:path';
import { promisify } from 'node:util';
import {
  GeneratedReportResult,
  GenerateJasperReportInput,
  ReportGeneratorPort,
} from '../../application/ports/report-generator.port';
import { DomainException } from '../../domain/exceptions/domain.exception';
import { ResourceNotFoundException } from '../../domain/exceptions/resource-not-found.exception';
import { SmartLoggerService } from '../logging/smart-logger.service';

const execFileAsync = promisify(execFile);

const TEMPLATE_NAME_REGEX = /^[a-zA-Z0-9_-]{1,100}$/;
const PARAM_KEY_REGEX = /^[A-Z][A-Z0-9_]{1,49}$/;
const FORBIDDEN_CLIENT_PARAMS = new Set([
  'SQL_PARAM',
  'GET_SELECT',
  'P_SCHOOL_ID',
  'P_USER',
  'HOME_DIR',
  'SUBREPORT_DIR',
  'R_MARKETING',
  'R_FOOTER',
  'AWS_PATH',
]);

/**
 * Adaptador de infraestructura para JasperReports conectado a PostgreSQL 17.
 * Endurecido contra Path Traversal, inyeccion de parametros reservados (SQL_PARAM, P_SCHOOL_ID),
 * inyeccion de flags CLI y fuga de archivos temporales.
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
    this.reportsRootPath = resolve(join(process.cwd(), 'resources', 'reports'));
    this.subreportsPath = `${join(this.reportsRootPath, 'subreports')}${sep}`;
    this.tempOutputPath = resolve(join(process.cwd(), 'storage', 'temp-reports'));
  }

  public validateTemplateAndParameters(
    templateName: string,
    parameters: Record<string, string | number | boolean>,
  ): { compiledJasperPath: string; sanitizedClientParams: Record<string, string | number | boolean> } {
    if (!TEMPLATE_NAME_REGEX.test(templateName)) {
      throw new DomainException(
        'INVALID_REPORT_TEMPLATE_NAME',
        'El nombre de la plantilla Jasper contiene caracteres no permitidos.',
      );
    }

    const compiledJasperPath = resolve(
      join(this.reportsRootPath, `${templateName}.jasper`),
    );

    if (!compiledJasperPath.startsWith(`${this.reportsRootPath}${sep}`)) {
      throw new DomainException(
        'REPORT_PATH_TRAVERSAL_BLOCKED',
        'Acceso bloqueado fuera del directorio autorizado de plantillas de reporte.',
      );
    }

    const sanitizedClientParams: Record<string, string | number | boolean> = {};
    for (const [rawKey, rawValue] of Object.entries(parameters ?? {})) {
      const upperKey = rawKey.toUpperCase();
      if (FORBIDDEN_CLIENT_PARAMS.has(upperKey)) {
        throw new DomainException(
          'FORBIDDEN_REPORT_PARAMETER',
          `El parámetro '${rawKey}' está reservado para el sistema y no puede ser enviado por el cliente.`,
        );
      }
      if (!PARAM_KEY_REGEX.test(rawKey)) {
        throw new DomainException(
          'INVALID_REPORT_PARAMETER_NAME',
          `El nombre de parámetro '${rawKey}' no cumple el formato institucional seguro.`,
        );
      }
      if (typeof rawValue === 'string' && /[\0\r\n]/.test(rawValue)) {
        throw new DomainException(
          'INVALID_REPORT_PARAMETER_VALUE',
          `El valor del parámetro '${rawKey}' contiene caracteres de control prohibidos.`,
        );
      }
      sanitizedClientParams[rawKey] = rawValue;
    }

    return { compiledJasperPath, sanitizedClientParams };
  }

  async generateFromTemplate(
    input: GenerateJasperReportInput,
  ): Promise<GeneratedReportResult> {
    const { compiledJasperPath, sanitizedClientParams } =
      this.validateTemplateAndParameters(input.templateName, input.parameters);

    try {
      await access(compiledJasperPath);
    } catch {
      throw new ResourceNotFoundException(
        'JasperReportTemplate',
        `${input.templateName}.jasper`,
      );
    }

    await mkdir(this.tempOutputPath, { recursive: true });

    const executionId = randomUUID();
    const outputBaseFile = join(this.tempOutputPath, `report_${executionId}`);
    const finalFilePath = `${outputBaseFile}.${input.outputFormat}`;

    // Parametros del cliente SIEMPRE antes de los del sistema para impedir cualquier sobreescritura
    const awsUrl = this.configService.get<string>(
      'AWS_URL',
      'https://asaie-app-storage.s3.us-west-2.amazonaws.com',
    );
    const reportParams: Record<string, string | number | boolean> = {
      ...sanitizedClientParams,
      P_SCHOOL_ID: Number(input.schoolId),
      P_USER: input.requestedByFullName.replace(/[\0\r\n]/g, ' ').trim(),
      R_MARKETING:
        'Software Académico y Administrativo ASAIE ÉXODO - https://asaie.co/',
      R_FOOTER: 'PIE DE PAGINA',
      HOME_DIR: `${this.reportsRootPath}${sep}`,
      SUBREPORT_DIR: this.subreportsPath,
      AWS_PATH: `${awsUrl.replace(/\/+$/, '')}/`,
    };

    const paramArgs: string[] = [];
    for (const [key, value] of Object.entries(reportParams)) {
      paramArgs.push(`${key}=${String(value)}`);
    }

    const jasperDbUser =
      this.configService.get<string>('JASPER_DB_USER', '').trim() ||
      this.configService.get<string>('DB_USER', 'asaie_admin');
    const jasperDbPassword =
      this.configService.get<string>('JASPER_DB_PASSWORD', '').trim() ||
      this.configService.get<string>('DB_PASSWORD', '');

    try {
      const jasperBinary = this.configService.get<string>(
        'JASPER_STARTER_BIN',
        'jasperstarter',
      );

      await execFileAsync(
        jasperBinary,
        [
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
          jasperDbUser,
          '--db-port',
          this.configService.get<string>('DB_PORT', '5434'),
          ...(jasperDbPassword ? ['-p', jasperDbPassword] : []),
          '-P',
          ...paramArgs,
        ],
        {
          timeout: 60_000,
          maxBuffer: 10 * 1024 * 1024,
          env: {
            ...process.env,
            PGPASSWORD: jasperDbPassword,
          },
        },
      );

      const fileBuffer = await readFile(finalFilePath);

      return {
        fileName: `${input.templateName}_${executionId}.${input.outputFormat}`,
        mimeType: this.resolveMimeType(input.outputFormat),
        buffer: fileBuffer,
      };
    } catch (error) {
      if (
        error instanceof DomainException ||
        error instanceof ResourceNotFoundException
      ) {
        throw error;
      }

      this.logger.error('Fallo al procesar plantilla en JasperReportAdapter', {
        schoolId: String(input.schoolId),
        templateName: input.templateName,
        outputFormat: input.outputFormat,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new InternalServerErrorException(
        'No fue posible generar el reporte oficial solicitado.',
      );
    } finally {
      await unlink(finalFilePath).catch(() => undefined);
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
