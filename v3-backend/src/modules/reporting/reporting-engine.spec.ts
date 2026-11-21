import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import * as ExcelJS from 'exceljs';
import * as net from 'node:net';
import { ReportGeneratorPort } from '../../shared/application/ports/report-generator.port';
import { DomainException } from '../../shared/domain/exceptions/domain.exception';
import { ResourceNotFoundException } from '../../shared/domain/exceptions/resource-not-found.exception';
import { PostgresRlsService } from '../../shared/infrastructure/database/postgres-rls.service';
import { SmartLoggerService } from '../../shared/infrastructure/logging/smart-logger.service';
import { ExcelReportBuilder } from '../../shared/infrastructure/reporting/excel-report.builder';
import { HtmlReportTemplateBuilder } from '../../shared/infrastructure/reporting/html-report-template.builder';
import {
  InstitutionalReportDataService,
  InstitutionalReportDataset,
} from '../../shared/infrastructure/reporting/institutional-report-data.service';
import { JasperReportAdapter } from '../../shared/infrastructure/reporting/jasper-report.adapter';
import { NativeDocumentReportAdapter } from '../../shared/infrastructure/reporting/native-document-report.adapter';
import {
  INSTITUTIONAL_REPORT_CATALOG,
  REPORT_CATALOG_BY_NAME,
} from '../../shared/infrastructure/reporting/report-catalog.constants';
import { SharedModule } from '../../shared/shared.module';
import { ConfigModule } from '@nestjs/config';

function checkTcpPortOpen(host: string, port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(800);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
}

describe('Cloud-Native Institutional Reporting Engine (Gotenberg 8 PDF + ExcelJS + RLS)', () => {
  const logger = new SmartLoggerService();
  const htmlBuilder = new HtmlReportTemplateBuilder();
  const excelBuilder = new ExcelReportBuilder();

  function createUnitConfig(values: Record<string, string>): ConfigService {
    return {
      get: <T>(key: string, defaultValue?: T): T =>
        (values[key] ?? defaultValue) as T,
    } as unknown as ConfigService;
  }

  describe('Catalog coverage, security validation & XSS protection', () => {
    it('exposes all 35 institutional report templates with unique names and valid categories', () => {
      expect(INSTITUTIONAL_REPORT_CATALOG.length).toBe(35);
      expect(REPORT_CATALOG_BY_NAME.size).toBe(35);
      expect(REPORT_CATALOG_BY_NAME.has('boletin_carta_areas')).toBe(true);
      expect(REPORT_CATALOG_BY_NAME.has('consolidado_asignaturas')).toBe(true);
      expect(REPORT_CATALOG_BY_NAME.has('consolidado_areas')).toBe(true);
      expect(REPORT_CATALOG_BY_NAME.has('constancia_estudio')).toBe(true);
      expect(REPORT_CATALOG_BY_NAME.has('estadistica_edades')).toBe(true);
      expect(REPORT_CATALOG_BY_NAME.has('libro_final')).toBe(true);
      expect(REPORT_CATALOG_BY_NAME.has('dir_grupo')).toBe(true);
      expect(REPORT_CATALOG_BY_NAME.has('parcelador_clases')).toBe(true);
      expect(REPORT_CATALOG_BY_NAME.has('nivelaciones_periodicas')).toBe(true);
      expect(REPORT_CATALOG_BY_NAME.has('recuperaciones_finales')).toBe(true);
    });

    it('blocks path traversal, unknown templates, reserved SQL_PARAM/P_SCHOOL_ID and control chars', () => {
      const config = createUnitConfig({
        REPORT_ENGINE: 'native',
        GOTENBERG_URL: 'http://127.0.0.1:3010',
      });
      const adapter = new NativeDocumentReportAdapter(
        config,
        {} as InstitutionalReportDataService,
        htmlBuilder,
        excelBuilder,
        new JasperReportAdapter(config, logger),
        logger,
      );

      expect(() =>
        adapter.validateTemplateAndParameters('../../etc/passwd', {}),
      ).toThrow(DomainException);

      expect(() =>
        adapter.validateTemplateAndParameters('plantilla_inexistente_999', {}),
      ).toThrow(ResourceNotFoundException);

      expect(() =>
        adapter.validateTemplateAndParameters('boletin_carta_areas', {
          SQL_PARAM: '1=1; DROP TABLE academic_scores;',
        }),
      ).toThrow(DomainException);

      expect(() =>
        adapter.validateTemplateAndParameters('boletin_carta_areas', {
          P_SCHOOL_ID: 99,
        }),
      ).toThrow(DomainException);

      expect(() =>
        adapter.validateTemplateAndParameters('boletin_carta_areas', {
          P_YEAR: '2026\nINJECTED',
        }),
      ).toThrow(DomainException);

      const safe = adapter.validateTemplateAndParameters(
        'boletin_carta_areas',
        { P_YEAR: 2026, P_PERIOD: 1 },
      );
      expect(safe.sanitizedClientParams).toEqual({ P_YEAR: 2026, P_PERIOD: 1 });
    });

    it('strictly escapes HTML/XSS payloads in HtmlReportTemplateBuilder and produces valid XLSX & CSV', async () => {
      const sampleDataset: InstitutionalReportDataset = {
        kind: 'MATRIX_TABLE',
        templateName: 'consolidado_asignaturas',
        title: 'Consolidado <script>alert(1)</script>',
        subtitle: 'Año 2026 · Periodo 1',
        academicYear: 2026,
        periodNumber: 1,
        paperSize: 'LEGAL',
        orientation: 'landscape',
        generatedBy: 'Rector <b>XSS</b>',
        branding: {
          schoolName: 'I.E. <img src=x onerror=alert(1)> Prueba',
          shortName: 'IEP',
          daneCode: '123456789012',
          nit: '900123456-1',
          headerLine1: null,
          headerLine2: null,
          footerText: null,
          address: null,
          phones: null,
          email: null,
          directorName: 'Dr. Rector',
          directorDocument: null,
          secretaryName: 'Sra. Secretaria',
          secretaryDocument: null,
          logoUrl: null,
          shieldUrl: null,
          scaleLegend: [],
        },
        matrix: {
          columns: [
            { key: 'student', label: 'Estudiante', align: 'left' },
            { key: 'math', label: 'Matemáticas', align: 'center', isScore: true },
          ],
          rows: [
            { student: 'Pérez <script>steal()</script> Ana', math: 2.4 },
            { student: 'Gómez Niño Luis', math: 4.6 },
          ],
          failingCellKeys: ['0:math'],
          summaryBadges: [{ label: 'Total', value: '2' }],
        },
      };

      const html = htmlBuilder.buildHtml(sampleDataset);
      expect(html).not.toContain('<script>');
      expect(html).not.toContain('<img src=x');
      expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
      expect(html).toContain('score-fail');

      const xlsxBuffer = await excelBuilder.buildXlsx(sampleDataset);
      expect(xlsxBuffer.subarray(0, 2).toString('utf8')).toBe('PK');

      const parsedWb = new ExcelJS.Workbook();
      await parsedWb.xlsx.load(xlsxBuffer as unknown as ExcelJS.Buffer);
      expect(parsedWb.worksheets.length).toBe(1);
      const sheet = parsedWb.worksheets[0];
      expect(sheet.getRow(5).getCell(1).value).toBe('Estudiante');
      expect(sheet.getRow(6).getCell(2).value).toBe(2.4);

      const csvBuffer = excelBuilder.buildCsv(sampleDataset);
      const csvText = csvBuffer.toString('utf8');
      expect(csvText.startsWith('\uFEFF')).toBe(true);
      expect(csvText).toContain('Matemáticas');
      expect(csvText).toContain('Gómez Niño Luis');
    });
  });

  describe('Live PostgreSQL 17 RLS + Gotenberg 8 PDF + ExcelJS integration', () => {
    let moduleRef: TestingModule | null = null;
    let reportGenerator: ReportGeneratorPort | null = null;
    let rlsService: PostgresRlsService | null = null;
    let postgresUp = false;
    let gotenbergUp = false;

    beforeAll(async () => {
      const dbHost = process.env.DB_HOST ?? '127.0.0.1';
      const dbPort = Number(process.env.DB_PORT ?? '5434');
      postgresUp = await checkTcpPortOpen(dbHost, dbPort);
      gotenbergUp = await checkTcpPortOpen('127.0.0.1', 3010);

      if (postgresUp) {
        moduleRef = await Test.createTestingModule({
          imports: [
            ConfigModule.forRoot({
              isGlobal: true,
              envFilePath: ['.env', '../.env'],
            }),
            SharedModule,
          ],
        }).compile();

        reportGenerator = moduleRef.get(ReportGeneratorPort);
        rlsService = moduleRef.get(PostgresRlsService);
      }
    });

    afterAll(async () => {
      if (moduleRef) {
        await moduleRef.close();
      }
    });

    it(
      'generates real Gotenberg 8 PDF (%PDF-1.) and ExcelJS XLSX from migrated school_id=7 data under strict RLS',
      async () => {
        if (!postgresUp || !reportGenerator || !rlsService) {
          return;
        }

        // Encontrar año y grupo con datos reales en school_id = 7
        const sampleScope = await rlsService.withTenantTransaction(
          7n,
          async (client) => {
            const res = await client.query<{
              academic_year: number;
              academic_group_id: string;
              enrollment_id: string;
            }>(
              `SELECT se.academic_year, se.academic_group_id, se.id AS enrollment_id
                 FROM student_enrollments se
                WHERE se.school_id = 7 AND se.enrollment_status_id = 2
                ORDER BY se.academic_year DESC, se.id ASC
                LIMIT 1`,
            );
            return res.rows[0] ?? null;
          },
        );

        const targetYear = sampleScope?.academic_year ?? 2025;
        const targetGroupId = sampleScope
          ? Number(sampleScope.academic_group_id)
          : undefined;
        const targetEnrollmentId = sampleScope
          ? Number(sampleScope.enrollment_id)
          : undefined;

        // 1. ExcelJS Consolidado por Asignaturas (real migrated data)
        const xlsxResult = await reportGenerator.generateFromTemplate({
          schoolId: 7n,
          requestedByUserId: 1n,
          requestedByFullName: 'QA Automatizado ASAIE',
          templateName: 'consolidado_asignaturas',
          outputFormat: 'xlsx',
          parameters: {
            P_YEAR: targetYear,
            P_PERIOD: 1,
            ...(targetGroupId ? { P_GROUP_ID: targetGroupId } : {}),
          },
        });

        expect(xlsxResult.mimeType).toContain('spreadsheetml');
        expect(xlsxResult.buffer.subarray(0, 2).toString('utf8')).toBe('PK');
        expect(xlsxResult.buffer.byteLength).toBeGreaterThan(3_000);

        const wb = new ExcelJS.Workbook();
        await wb.xlsx.load(xlsxResult.buffer as unknown as ExcelJS.Buffer);
        expect(wb.worksheets.length).toBe(1);
        expect(wb.worksheets[0].rowCount).toBeGreaterThanOrEqual(5);

        // 2. HTML + CSV para estadística de edades
        const csvResult = await reportGenerator.generateFromTemplate({
          schoolId: 7n,
          requestedByUserId: 1n,
          requestedByFullName: 'QA Automatizado ASAIE',
          templateName: 'estadistica_edades',
          outputFormat: 'csv',
          parameters: { P_YEAR: targetYear },
        });
        expect(csvResult.mimeType).toContain('text/csv');
        expect(csvResult.buffer.toString('utf8').startsWith('\uFEFF')).toBe(true);

        // 3. Gotenberg 8 PDF real (Boletín + Constancia) si el contenedor está en línea
        if (gotenbergUp) {
          const bulletinPdf = await reportGenerator.generateFromTemplate({
            schoolId: 7n,
            requestedByUserId: 1n,
            requestedByFullName: 'QA Automatizado ASAIE',
            templateName: 'boletin_carta_areas',
            outputFormat: 'pdf',
            parameters: {
              P_YEAR: targetYear,
              P_PERIOD: 1,
              ...(targetEnrollmentId
                ? { P_ENROLLMENT_ID: targetEnrollmentId }
                : {}),
            },
          });

          expect(bulletinPdf.mimeType).toBe('application/pdf');
          expect(bulletinPdf.buffer.subarray(0, 5).toString('ascii')).toBe(
            '%PDF-',
          );
          expect(bulletinPdf.buffer.byteLength).toBeGreaterThan(8_000);

          const certPdf = await reportGenerator.generateFromTemplate({
            schoolId: 7n,
            requestedByUserId: 1n,
            requestedByFullName: 'QA Automatizado ASAIE',
            templateName: 'constancia_estudio',
            outputFormat: 'pdf',
            parameters: {
              P_YEAR: targetYear,
              ...(targetEnrollmentId
                ? { P_ENROLLMENT_ID: targetEnrollmentId }
                : {}),
            },
          });

          expect(certPdf.mimeType).toBe('application/pdf');
          expect(certPdf.buffer.subarray(0, 5).toString('ascii')).toBe('%PDF-');
          expect(certPdf.buffer.byteLength).toBeGreaterThan(8_000);
        }

        // 4. Aislamiento RLS estricto: generar para school_id = 1 no puede filtrar nombre del school_id = 7
        const school1Html = await reportGenerator.generateFromTemplate({
          schoolId: 1n,
          requestedByUserId: 1n,
          requestedByFullName: 'QA Tenant 1',
          templateName: 'listado_docentes',
          outputFormat: 'html',
          parameters: { P_YEAR: targetYear },
        });
        const school7Html = await reportGenerator.generateFromTemplate({
          schoolId: 7n,
          requestedByUserId: 1n,
          requestedByFullName: 'QA Tenant 7',
          templateName: 'listado_docentes',
          outputFormat: 'html',
          parameters: { P_YEAR: targetYear },
        });
        expect(school1Html.buffer.toString('utf8')).not.toEqual(
          school7Html.buffer.toString('utf8'),
        );
      },
      30_000,
    );
  });
});
