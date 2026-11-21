import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { InstitutionalReportDataset } from './institutional-report-data.service';

interface TabularSheetData {
  readonly sheetName: string;
  readonly columns: Array<{
    readonly key: string;
    readonly label: string;
    readonly align?: 'left' | 'center' | 'right';
    readonly isScore?: boolean;
  }>;
  readonly rows: Array<Record<string, string | number | null>>;
  readonly failingCellKeys: Set<string>;
  readonly footerTotals?: Record<string, string | number>;
}

/**
 * Constructor nativo de libros Excel (.xlsx) con estilos institucionales mediante ExcelJS
 * y exportación CSV UTF-8 con BOM compatible con Microsoft Excel.
 */
@Injectable()
export class ExcelReportBuilder {
  public async buildXlsx(dataset: InstitutionalReportDataset): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'ASAIE ÉXODO V3';
    workbook.created = new Date();
    workbook.modified = new Date();

    const tabular = this.flattenToTabular(dataset);
    const worksheet = workbook.addWorksheet(tabular.sheetName, {
      pageSetup: {
        paperSize:
          dataset.paperSize === 'LEGAL' ? ExcelJS.PaperSize.Legal : undefined,
        orientation:
          dataset.orientation === 'landscape' ? 'landscape' : 'portrait',
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0,
      },
    });

    const colCount = Math.max(1, tabular.columns.length);

    // Encabezado institucional
    worksheet.mergeCells(1, 1, 1, colCount);
    const schoolCell = worksheet.getCell(1, 1);
    schoolCell.value = dataset.branding.schoolName.toUpperCase();
    schoolCell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FF0F172A' } };
    schoolCell.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(1).height = 24;

    worksheet.mergeCells(2, 1, 2, colCount);
    const titleCell = worksheet.getCell(2, 1);
    titleCell.value = `${dataset.title} — ${dataset.subtitle}`;
    titleCell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF1E3A8A' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(2).height = 20;

    worksheet.mergeCells(3, 1, 3, colCount);
    const metaCell = worksheet.getCell(3, 1);
    metaCell.value = `DANE: ${dataset.branding.daneCode ?? 'N/D'} | NIT: ${dataset.branding.nit ?? 'N/D'} | Generado por: ${dataset.generatedBy}`;
    metaCell.font = { name: 'Calibri', size: 9, italic: true, color: { argb: 'FF475569' } };
    metaCell.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(3).height = 17;

    // Fila 5: cabeceras de columna
    const headerRowIndex = 5;
    const headerRow = worksheet.getRow(headerRowIndex);
    headerRow.height = 24;

    tabular.columns.forEach((col, index) => {
      const cell = headerRow.getCell(index + 1);
      cell.value = col.label;
      cell.font = {
        name: 'Calibri',
        size: 10,
        bold: true,
        color: { argb: 'FFFFFFFF' },
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF0F172A' },
      };
      cell.alignment = {
        horizontal: col.align ?? 'center',
        vertical: 'middle',
        wrapText: true,
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      };
    });

    // Filas de datos
    const colWidths = tabular.columns.map((c) => Math.max(10, c.label.length + 3));

    tabular.rows.forEach((row, rowIdx) => {
      const excelRow = worksheet.getRow(headerRowIndex + 1 + rowIdx);
      const isEven = rowIdx % 2 === 1;

      tabular.columns.forEach((col, colIdx) => {
        const rawValue = row[col.key];
        const cell = excelRow.getCell(colIdx + 1);
        const numericScore =
          col.isScore && typeof rawValue === 'number'
            ? rawValue
            : col.isScore &&
                typeof rawValue === 'string' &&
                rawValue.trim() !== '' &&
                !Number.isNaN(Number(rawValue))
              ? Number(rawValue)
              : null;

        if (numericScore !== null) {
          cell.value = numericScore;
          cell.numFmt = '0.00';
        } else {
          cell.value = rawValue ?? '';
        }

        const displayLen = String(rawValue ?? '').length + 2;
        if (displayLen > colWidths[colIdx]) {
          colWidths[colIdx] = Math.min(44, displayLen);
        }

        const isFailing = tabular.failingCellKeys.has(`${rowIdx}:${col.key}`);
        cell.font = {
          name: 'Calibri',
          size: 10,
          bold: isFailing,
          color: { argb: isFailing ? 'FFB91C1C' : 'FF0F172A' },
        };
        if (isFailing) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFEE2E2' },
          };
        } else if (isEven) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF8FAFC' },
          };
        }

        cell.alignment = {
          horizontal: col.align ?? (col.isScore ? 'center' : 'left'),
          vertical: 'middle',
          wrapText: true,
        };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        };
      });
    });

    // Fila de totales si existe
    if (tabular.footerTotals) {
      const totalsRow = worksheet.getRow(headerRowIndex + 1 + tabular.rows.length);
      totalsRow.height = 22;
      tabular.columns.forEach((col, colIdx) => {
        const cell = totalsRow.getCell(colIdx + 1);
        cell.value = tabular.footerTotals?.[col.key] ?? '';
        cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF0F172A' } };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE2E8F0' },
        };
        cell.alignment = { horizontal: col.align ?? 'center', vertical: 'middle' };
        cell.border = {
          top: { style: 'medium', color: { argb: 'FF0F172A' } },
          bottom: { style: 'thin', color: { argb: 'FF0F172A' } },
          left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
          right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        };
      });
    }

    // Anchos de columna, congelamiento de paneles y autofiltro
    colWidths.forEach((width, idx) => {
      worksheet.getColumn(idx + 1).width = Math.max(8, Math.min(44, width));
    });

    worksheet.views = [{ state: 'frozen', ySplit: headerRowIndex }];
    worksheet.autoFilter = {
      from: { row: headerRowIndex, column: 1 },
      to: { row: headerRowIndex, column: colCount },
    };

    const arrayBuffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(arrayBuffer);
  }

  public buildCsv(dataset: InstitutionalReportDataset): Buffer {
    const tabular = this.flattenToTabular(dataset);
    const lines: string[] = [];
    lines.push(tabular.columns.map((c) => this.escapeCsv(c.label)).join(','));

    for (const row of tabular.rows) {
      lines.push(
        tabular.columns
          .map((c) => this.escapeCsv(row[c.key] ?? ''))
          .join(','),
      );
    }

    if (tabular.footerTotals) {
      lines.push(
        tabular.columns
          .map((c) => this.escapeCsv(tabular.footerTotals?.[c.key] ?? ''))
          .join(','),
      );
    }

    // UTF-8 BOM para compatibilidad directa de tildes y ñ en Excel Windows
    return Buffer.from(`\uFEFF${lines.join('\r\n')}`, 'utf8');
  }

  private flattenToTabular(dataset: InstitutionalReportDataset): TabularSheetData {
    const safeSheetName = dataset.title
      .replace(/[\\/*?:[\]]/g, '')
      .slice(0, 31) || 'Reporte';

    if (dataset.kind === 'MATRIX_TABLE') {
      return {
        sheetName: safeSheetName,
        columns: dataset.matrix.columns,
        rows: dataset.matrix.rows,
        failingCellKeys: new Set(dataset.matrix.failingCellKeys),
        footerTotals: dataset.matrix.footerTotals,
      };
    }

    if (dataset.kind === 'BULLETIN') {
      const rows: Array<Record<string, string | number | null>> = [];
      const failingCellKeys = new Set<string>();
      for (const page of dataset.pages) {
        for (const area of page.areas) {
          for (const subj of area.subjects) {
            const idx = rows.length;
            rows.push({
              student: page.studentFullName,
              document: page.documentNumber,
              gradeGroup: `${page.gradeName} - ${page.groupCode}`,
              area: area.areaName,
              subject: subj.subjectName,
              teacher: subj.teacherName,
              hours: subj.weeklyHours,
              score: subj.currentScore,
              scale: subj.scaleName,
              absences: subj.absences,
              average: page.averageScore,
              rank: page.groupRank ?? '-',
            });
            if (subj.isFailed) {
              failingCellKeys.add(`${idx}:score`);
            }
          }
        }
      }
      return {
        sheetName: safeSheetName,
        columns: [
          { key: 'student', label: 'Estudiante', align: 'left' },
          { key: 'document', label: 'Documento', align: 'center' },
          { key: 'gradeGroup', label: 'Grado/Grupo', align: 'center' },
          { key: 'area', label: 'Área', align: 'left' },
          { key: 'subject', label: 'Asignatura', align: 'left' },
          { key: 'teacher', label: 'Docente', align: 'left' },
          { key: 'hours', label: 'IH', align: 'center' },
          { key: 'score', label: `Nota P${dataset.periodNumber}`, align: 'center', isScore: true },
          { key: 'scale', label: 'Desempeño', align: 'center' },
          { key: 'absences', label: 'Faltas', align: 'center' },
          { key: 'average', label: 'Promedio', align: 'center', isScore: true },
          { key: 'rank', label: 'Puesto', align: 'center' },
        ],
        rows,
        failingCellKeys,
      };
    }

    if (dataset.kind === 'CARDS') {
      return {
        sheetName: safeSheetName,
        columns: [
          { key: 'student', label: 'Estudiante', align: 'left' },
          { key: 'document', label: 'Documento', align: 'center' },
          { key: 'gradeGroup', label: 'Grado/Grupo', align: 'center' },
          { key: 'campus', label: 'Sede', align: 'left' },
          { key: 'shift', label: 'Jornada', align: 'center' },
          { key: 'bloodType', label: 'RH', align: 'center' },
          { key: 'year', label: 'Año Lectivo', align: 'center' },
        ],
        rows: dataset.cards.map((c) => ({
          student: c.studentFullName,
          document: c.documentNumber,
          gradeGroup: c.gradeGroup,
          campus: c.campusName,
          shift: c.shiftName,
          bloodType: c.bloodType ?? 'N/D',
          year: c.academicYear,
        })),
        failingCellKeys: new Set<string>(),
      };
    }

    // CERTIFICATE
    return {
      sheetName: safeSheetName,
      columns: [
        { key: 'consecutive', label: 'Consecutivo', align: 'center' },
        { key: 'student', label: 'Estudiante', align: 'left' },
        { key: 'document', label: 'Documento', align: 'center' },
        { key: 'campus', label: 'Sede', align: 'left' },
        { key: 'shift', label: 'Jornada', align: 'center' },
        { key: 'gradeGroup', label: 'Grado/Grupo', align: 'center' },
        { key: 'status', label: 'Estado', align: 'center' },
        { key: 'finalAverage', label: 'Promedio Final', align: 'center', isScore: true },
        { key: 'promotion', label: 'Promoción', align: 'left' },
      ],
      rows: dataset.pages.map((p) => ({
        consecutive: p.consecutiveNumber,
        student: p.studentFullName,
        document: `${p.documentTypeCode} ${p.documentNumber}`,
        campus: p.campusName,
        shift: p.shiftName,
        gradeGroup: `${p.gradeName} - ${p.groupCode}`,
        status: p.enrollmentStatusName,
        finalAverage: p.finalAverage,
        promotion: p.promotionStatusDescription ?? 'N/D',
      })),
      failingCellKeys: new Set<string>(),
    };
  }

  private escapeCsv(value: string | number): string {
    const str = String(value);
    if (/[",\r\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }
}
