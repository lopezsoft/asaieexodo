import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import {
  GeneratedReportResult,
  GenerateJasperReportInput,
  ReportGeneratorPort,
} from '../../application/ports/report-generator.port';
import { DomainException } from '../../domain/exceptions/domain.exception';
import { ResourceNotFoundException } from '../../domain/exceptions/resource-not-found.exception';
import { SmartLoggerService } from '../logging/smart-logger.service';
import { ExcelReportBuilder } from './excel-report.builder';
import { HtmlReportTemplateBuilder } from './html-report-template.builder';
import {
  InstitutionalReportDataService,
  InstitutionalReportDataset,
} from './institutional-report-data.service';
import { JasperReportAdapter } from './jasper-report.adapter';
import {
  REPORT_CATALOG_BY_NAME,
  resolveCanonicalReportTemplate,
} from './report-catalog.constants';

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
 * Adaptador cloud-native de reportes institucionales (Gotenberg 8 HTML->PDF + ExcelJS + CSV/HTML/Word).
 * Reemplaza la dependencia de binaries Java/JasperStarter manteniendo 100% aislamiento RLS en PostgreSQL 17,
 * protección estricta contra inyección de parámetros y fallback opcional a JasperReportAdapter si REPORT_ENGINE=jasper.
 */
@Injectable()
export class NativeDocumentReportAdapter implements ReportGeneratorPort {
  constructor(
    private readonly configService: ConfigService,
    private readonly reportDataService: InstitutionalReportDataService,
    private readonly htmlBuilder: HtmlReportTemplateBuilder,
    private readonly excelBuilder: ExcelReportBuilder,
    private readonly jasperFallback: JasperReportAdapter,
    private readonly logger: SmartLoggerService,
  ) {}

  public validateTemplateAndParameters(
    templateName: string,
    parameters: Record<string, string | number | boolean>,
  ): {
    canonicalTemplateName: string;
    sanitizedClientParams: Record<string, string | number | boolean>;
  } {
    if (!TEMPLATE_NAME_REGEX.test(templateName)) {
      throw new DomainException(
        'INVALID_REPORT_TEMPLATE_NAME',
        'El nombre de la plantilla de reporte contiene caracteres no permitidos.',
      );
    }

    const canonicalTemplateName = resolveCanonicalReportTemplate(templateName);
    if (!REPORT_CATALOG_BY_NAME.has(canonicalTemplateName)) {
      throw new ResourceNotFoundException('InstitutionalReportTemplate', templateName);
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

    return { canonicalTemplateName, sanitizedClientParams };
  }

  async generateFromTemplate(
    input: GenerateJasperReportInput,
  ): Promise<GeneratedReportResult> {
    const engine = this.configService
      .get<string>('REPORT_ENGINE', 'native')
      .trim()
      .toLowerCase();

    if (engine === 'jasper') {
      return this.jasperFallback.generateFromTemplate(input);
    }

    const { canonicalTemplateName, sanitizedClientParams } =
      this.validateTemplateAndParameters(input.templateName, input.parameters);

    const executionId = randomUUID().slice(0, 8);
    const safeUserName = input.requestedByFullName
      .replace(/[\0\r\n]/g, ' ')
      .trim();

    try {
      const dataset = await this.reportDataService.buildDataset({
        schoolId: input.schoolId,
        templateName: canonicalTemplateName,
        requestedByFullName: safeUserName || 'Usuario ASAIE',
        parameters: sanitizedClientParams,
      });

      const buffer = await this.renderOutputBuffer(dataset, input.outputFormat);
      const mimeType = this.resolveMimeType(input.outputFormat);
      const fileName = `${canonicalTemplateName}_${dataset.academicYear}_${executionId}.${input.outputFormat}`;

      this.logger.log('Reporte institucional generado exitosamente (motor nativo)', {
        schoolId: String(input.schoolId),
        templateName: input.templateName,
        outputFormat: input.outputFormat,
        sizeBytes: buffer.byteLength,
      });

      return {
        fileName,
        mimeType,
        buffer,
      };
    } catch (error) {
      if (
        error instanceof DomainException ||
        error instanceof ResourceNotFoundException
      ) {
        throw error;
      }

      this.logger.error('Fallo generando reporte institucional en motor nativo', {
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

  private async renderOutputBuffer(
    dataset: InstitutionalReportDataset,
    outputFormat: GenerateJasperReportInput['outputFormat'],
  ): Promise<Buffer> {
    switch (outputFormat) {
      case 'pdf': {
        const html = this.htmlBuilder.buildHtml(dataset);
        return this.convertHtmlToPdfWithGotenberg(html, dataset);
      }
      case 'xlsx':
        return this.excelBuilder.buildXlsx(dataset);
      case 'csv':
        return this.excelBuilder.buildCsv(dataset);
      case 'html':
        return Buffer.from(this.htmlBuilder.buildHtml(dataset), 'utf8');
      case 'docx':
        return Buffer.from(this.htmlBuilder.buildWordHtml(dataset), 'utf8');
    }
  }

  private async convertHtmlToPdfWithGotenberg(
    html: string,
    dataset: InstitutionalReportDataset,
  ): Promise<Buffer> {
    const gotenbergUrl = this.configService
      .get<string>('GOTENBERG_URL', 'http://127.0.0.1:3010')
      .replace(/\/+$/, '');

    const formData = new FormData();
    formData.append(
      'files',
      new Blob([html], { type: 'text/html; charset=utf-8' }),
      'index.html',
    );
    formData.append('paperWidth', '8.5');
    formData.append(
      'paperHeight',
      dataset.paperSize === 'LEGAL' ? '14' : '11',
    );
    formData.append(
      'landscape',
      dataset.orientation === 'landscape' ? 'true' : 'false',
    );
    formData.append('printBackground', 'true');
    formData.append('preferCssPageSize', 'true');
    formData.append('marginTop', '0.35');
    formData.append('marginBottom', '0.4');
    formData.append('marginLeft', '0.35');
    formData.append('marginRight', '0.35');

    const response = await fetch(
      `${gotenbergUrl}/forms/chromium/convert/html`,
      {
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(55_000),
      },
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(
        `Gotenberg PDF render failed (${response.status}): ${errorText.slice(0, 300)}`,
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  private resolveMimeType(format: string): string {
    const mimeTypes: Record<string, string> = {
      pdf: 'application/pdf',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      csv: 'text/csv; charset=utf-8',
      html: 'text/html; charset=utf-8',
    };
    return mimeTypes[format] ?? 'application/octet-stream';
  }
}
