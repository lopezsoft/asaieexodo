import { Injectable } from '@nestjs/common';
import {
  BulletinStudentPage,
  CertificateDocumentPage,
  InstitutionalReportDataset,
  MatrixTableDocument,
  SchoolBrandingHeader,
  StudentCardItem,
} from './institutional-report-data.service';

/**
 * Constructor de plantillas HTML5 + CSS de impresión institucionales para Gotenberg 8 (Chromium)
 * y exportación directa HTML/Word. Todo contenido dinámico es estrictamente escapado contra XSS.
 */
@Injectable()
export class HtmlReportTemplateBuilder {
  public buildHtml(dataset: InstitutionalReportDataset): string {
    const pageDimensions = this.resolvePageCss(
      dataset.paperSize,
      dataset.orientation,
    );
    const generatedAt = this.formatBogotaDateTime(new Date());

    let bodyContent = '';
    switch (dataset.kind) {
      case 'BULLETIN':
        bodyContent = this.renderBulletins(dataset, generatedAt);
        break;
      case 'CERTIFICATE':
        bodyContent = this.renderCertificates(dataset, generatedAt);
        break;
      case 'CARDS':
        bodyContent = this.renderCards(dataset, generatedAt);
        break;
      case 'MATRIX_TABLE':
        bodyContent = this.renderMatrixTable(dataset, generatedAt);
        break;
    }

    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>${this.escapeHtml(dataset.title)} - ${this.escapeHtml(dataset.branding.schoolName)}</title>
  <style>
    @page {
      size: ${pageDimensions};
      margin: 10mm 10mm 12mm 10mm;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
      font-size: 9.5px;
      line-height: 1.35;
      color: #0f172a;
      background: #ffffff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .page-sheet {
      page-break-after: always;
      break-after: page;
    }
    .page-sheet:last-child {
      page-break-after: auto;
      break-after: auto;
    }
    .inst-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 8px;
      margin-bottom: 10px;
    }
    .inst-crest {
      width: 54px;
      height: 54px;
      flex: 0 0 54px;
      border-radius: 10px;
      background: linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 16px;
      letter-spacing: 0.5px;
    }
    .inst-center {
      flex: 1;
      text-align: center;
    }
    .inst-line-top {
      font-size: 8px;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      color: #475569;
    }
    .inst-name {
      font-size: 13px;
      font-weight: 800;
      text-transform: uppercase;
      color: #0f172a;
      margin: 2px 0;
    }
    .inst-meta {
      font-size: 8px;
      color: #334155;
    }
    .inst-report-badge {
      flex: 0 0 auto;
      text-align: right;
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 5px 8px;
      min-width: 120px;
    }
    .inst-report-title {
      font-size: 8.5px;
      font-weight: 700;
      color: #0f172a;
      text-transform: uppercase;
    }
    .inst-report-sub {
      font-size: 7.5px;
      color: #475569;
      margin-top: 2px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 6px;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 7px 9px;
      margin-bottom: 9px;
    }
    .info-item label {
      display: block;
      font-size: 7px;
      font-weight: 700;
      text-transform: uppercase;
      color: #64748b;
    }
    .info-item span {
      display: block;
      font-size: 9px;
      font-weight: 600;
      color: #0f172a;
    }
    .info-item.span-2 {
      grid-column: span 2;
    }
    .scale-strip {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      align-items: center;
      margin-bottom: 8px;
      font-size: 7.5px;
      color: #334155;
    }
    .scale-pill {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      border: 1px solid #cbd5e1;
      border-radius: 999px;
      padding: 2px 7px;
      background: #ffffff;
    }
    .scale-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      display: inline-block;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 10px;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 4px 5px;
      vertical-align: top;
    }
    th {
      background: #0f172a;
      color: #ffffff;
      font-weight: 700;
      font-size: 8px;
      text-transform: uppercase;
      letter-spacing: 0.2px;
    }
    tbody tr:nth-child(even) {
      background: #f8fafc;
    }
    .area-row td {
      background: #e2e8f0 !important;
      font-weight: 700;
      color: #0f172a;
      font-size: 8.5px;
      padding: 4px 6px;
    }
    .text-left { text-align: left; }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .score-fail {
      background: #fee2e2 !important;
      color: #b91c1c !important;
      font-weight: 700;
    }
    .score-pass {
      font-weight: 600;
      color: #0f172a;
    }
    .badge-scale {
      display: inline-block;
      padding: 1px 5px;
      border-radius: 4px;
      font-size: 7.5px;
      font-weight: 700;
      color: #ffffff;
    }
    .ach-list {
      margin: 2px 0 0 0;
      padding-left: 12px;
      font-size: 7.8px;
      color: #334155;
    }
    .ach-list li {
      margin-bottom: 1px;
    }
    .sug-note {
      margin-top: 2px;
      font-size: 7.5px;
      color: #92400e;
      font-style: italic;
    }
    .summary-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 8px;
    }
    .summary-badge {
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 4px 9px;
      font-size: 8px;
    }
    .summary-badge strong {
      color: #0f172a;
      margin-left: 4px;
    }
    .totals-row td {
      background: #e2e8f0 !important;
      font-weight: 800;
      border-top: 2px solid #0f172a;
    }
    .cert-title {
      text-align: center;
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.6px;
      text-transform: uppercase;
      margin: 14px 0 8px 0;
      color: #0f172a;
    }
    .cert-consecutive {
      text-align: right;
      font-size: 8.5px;
      font-weight: 700;
      color: #1d4ed8;
      margin-bottom: 6px;
    }
    .cert-body {
      font-size: 10.5px;
      line-height: 1.65;
      text-align: justify;
      margin: 10px 0 14px 0;
    }
    .signatures {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 36px;
      margin-top: 26px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .signatures.three-cols {
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }
    .sig-box {
      text-align: center;
      padding-top: 22px;
    }
    .sig-line {
      border-top: 1px solid #334155;
      margin-bottom: 4px;
    }
    .sig-name {
      font-size: 8.5px;
      font-weight: 700;
      color: #0f172a;
    }
    .sig-role {
      font-size: 7.5px;
      color: #475569;
    }
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }
    .student-card {
      border: 1.5px solid #1e3a8a;
      border-radius: 10px;
      overflow: hidden;
      background: #ffffff;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .card-top {
      background: linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%);
      color: #ffffff;
      padding: 7px 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .card-school {
      font-size: 8.5px;
      font-weight: 800;
      text-transform: uppercase;
    }
    .card-year {
      font-size: 8px;
      font-weight: 700;
      background: rgba(255,255,255,0.18);
      padding: 2px 6px;
      border-radius: 999px;
    }
    .card-body {
      padding: 9px 10px;
      display: flex;
      gap: 10px;
      align-items: center;
    }
    .card-avatar {
      width: 50px;
      height: 60px;
      border: 1px dashed #94a3b8;
      border-radius: 6px;
      background: #f8fafc;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 15px;
      font-weight: 800;
      color: #1e3a8a;
      flex: 0 0 50px;
    }
    .card-details {
      flex: 1;
      font-size: 8.2px;
    }
    .card-student-name {
      font-size: 9.5px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 3px;
    }
    .card-footer {
      background: #f1f5f9;
      border-top: 1px solid #cbd5e1;
      padding: 4px 10px;
      font-size: 7px;
      color: #475569;
      display: flex;
      justify-content: space-between;
    }
    .empty-state {
      border: 1px dashed #94a3b8;
      border-radius: 8px;
      padding: 26px;
      text-align: center;
      color: #475569;
      font-size: 10px;
      margin: 18px 0;
    }
    .doc-footer {
      margin-top: 10px;
      padding-top: 5px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      font-size: 7px;
      color: #64748b;
    }
  </style>
</head>
<body>
${bodyContent}
</body>
</html>`;
  }

  public buildWordHtml(dataset: InstitutionalReportDataset): string {
    const html = this.buildHtml(dataset);
    return html.replace(
      '<html lang="es">',
      '<html lang="es" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">',
    );
  }

  private renderSchoolHeader(
    branding: SchoolBrandingHeader,
    title: string,
    subtitle: string,
  ): string {
    const initials = this.extractInitials(branding.shortName || branding.schoolName);
    const metaParts: string[] = [];
    if (branding.daneCode) metaParts.push(`DANE: ${branding.daneCode}`);
    if (branding.nit) metaParts.push(`NIT: ${branding.nit}`);
    if (branding.address) metaParts.push(branding.address);
    if (branding.phones) metaParts.push(`Tel: ${branding.phones}`);

    return `<div class="inst-header">
      <div class="inst-crest">${this.escapeHtml(initials)}</div>
      <div class="inst-center">
        ${branding.headerLine1 ? `<div class="inst-line-top">${this.escapeHtml(branding.headerLine1)}</div>` : ''}
        <div class="inst-name">${this.escapeHtml(branding.schoolName)}</div>
        ${branding.headerLine2 ? `<div class="inst-meta">${this.escapeHtml(branding.headerLine2)}</div>` : ''}
        ${metaParts.length > 0 ? `<div class="inst-meta">${this.escapeHtml(metaParts.join(' · '))}</div>` : ''}
      </div>
      <div class="inst-report-badge">
        <div class="inst-report-title">${this.escapeHtml(title)}</div>
        <div class="inst-report-sub">${this.escapeHtml(subtitle)}</div>
      </div>
    </div>`;
  }

  private renderScaleLegend(branding: SchoolBrandingHeader): string {
    if (branding.scaleLegend.length === 0) return '';
    const pills = branding.scaleLegend
      .map(
        (s) =>
          `<span class="scale-pill"><span class="scale-dot" style="background:${this.sanitizeHexColor(s.hexColor)}"></span><strong>${this.escapeHtml(s.name)}</strong> (${s.minScore.toFixed(1)} - ${s.maxScore.toFixed(1)})</span>`,
      )
      .join('');
    return `<div class="scale-strip"><strong>Escala Institucional:</strong> ${pills}</div>`;
  }

  private renderBulletins(
    dataset: Extract<InstitutionalReportDataset, { kind: 'BULLETIN' }>,
    generatedAt: string,
  ): string {
    if (dataset.pages.length === 0) {
      return `<div class="page-sheet">
        ${this.renderSchoolHeader(dataset.branding, dataset.title, dataset.subtitle)}
        <div class="empty-state">No se encontraron estudiantes matriculados con calificaciones para los filtros seleccionados (${this.escapeHtml(dataset.subtitle)}).</div>
        ${this.renderFooter(dataset.branding, dataset.generatedBy, generatedAt)}
      </div>`;
    }

    const periodCols = Array.from(
      { length: dataset.periodNumber },
      (_, idx) => idx + 1,
    );

    return dataset.pages
      .map((page) =>
        this.renderSingleBulletinPage(
          page,
          dataset,
          periodCols,
          generatedAt,
        ),
      )
      .join('\n');
  }

  private renderSingleBulletinPage(
    page: BulletinStudentPage,
    dataset: Extract<InstitutionalReportDataset, { kind: 'BULLETIN' }>,
    periodCols: number[],
    generatedAt: string,
  ): string {
    const rankLabel =
      page.groupRank && page.groupTotalStudents
        ? `${page.groupRank} de ${page.groupTotalStudents}`
        : page.groupRank
          ? `#${page.groupRank}`
          : 'N/D';

    const tableRows = page.areas
      .map((area) => {
        const totalCols = 4 + periodCols.length + 3;
        const areaRow = `<tr class="area-row">
          <td colspan="${totalCols - 2}" class="text-left">ÁREA: ${this.escapeHtml(area.areaName)}</td>
          <td class="text-center ${area.isAreaFailed ? 'score-fail' : ''}">${area.areaScore.toFixed(2)}</td>
          <td class="text-center">${area.isAreaFailed ? 'REPROBADA' : 'APROBADA'}</td>
        </tr>`;

        const subjectRows = area.subjects
          .map((subj) => {
            const periodCells = periodCols
              .map((p) => {
                const val = subj.periodScores[p];
                return `<td class="text-center">${val !== undefined ? val.toFixed(2) : '-'}</td>`;
              })
              .join('');

            const achHtml =
              subj.achievements.length > 0
                ? `<ul class="ach-list">${subj.achievements
                    .map((a) => `<li>${this.escapeHtml(a)}</li>`)
                    .join('')}</ul>`
                : '';

            const sugHtml =
              subj.suggestions.length > 0
                ? `<div class="sug-note">Recomendación: ${this.escapeHtml(subj.suggestions.join(' · '))}</div>`
                : '';

            return `<tr>
              <td class="text-left">
                <strong>${this.escapeHtml(subj.subjectName)}</strong>
                ${subj.teacherName ? `<div style="font-size:7.5px;color:#64748b;">Docente: ${this.escapeHtml(subj.teacherName)}</div>` : ''}
                ${achHtml}
                ${sugHtml}
              </td>
              <td class="text-center">${subj.weeklyHours}</td>
              ${periodCells}
              <td class="text-center ${subj.isFailed ? 'score-fail' : 'score-pass'}">${subj.currentScore.toFixed(2)}</td>
              <td class="text-center">
                <span class="badge-scale" style="background:${this.sanitizeHexColor(subj.scaleColor)}">${this.escapeHtml(subj.scaleName)}</span>
              </td>
              <td class="text-center">${subj.absences}</td>
            </tr>`;
          })
          .join('');

        return areaRow + subjectRows;
      })
      .join('');

    return `<div class="page-sheet">
      ${this.renderSchoolHeader(dataset.branding, dataset.title, dataset.subtitle)}
      <div class="info-grid">
        <div class="info-item span-2">
          <label>Estudiante</label>
          <span>${this.escapeHtml(page.studentFullName)}</span>
        </div>
        <div class="info-item">
          <label>Identificación</label>
          <span>${this.escapeHtml(page.documentNumber)}</span>
        </div>
        <div class="info-item">
          <label>Sede / Jornada</label>
          <span>${this.escapeHtml(page.campusName)} · ${this.escapeHtml(page.shiftName)}</span>
        </div>
        <div class="info-item">
          <label>Grado y Grupo</label>
          <span>${this.escapeHtml(page.gradeName)} - ${this.escapeHtml(page.groupCode)}</span>
        </div>
        <div class="info-item">
          <label>Director(a) de Grupo</label>
          <span>${this.escapeHtml(page.homeroomTeacherName ?? 'Por asignar')}</span>
        </div>
        <div class="info-item">
          <label>Promedio / Puesto</label>
          <span>${page.averageScore.toFixed(2)} · Puesto ${this.escapeHtml(rankLabel)}</span>
        </div>
        <div class="info-item">
          <label>Inasistencias / Folio</label>
          <span>${page.totalAbsences} faltas${page.folioNumber ? ` · Folio ${this.escapeHtml(page.folioNumber)}` : ''}</span>
        </div>
      </div>
      ${this.renderScaleLegend(dataset.branding)}
      <table>
        <thead>
          <tr>
            <th class="text-left" style="width:44%;">Área / Asignatura y Descriptores</th>
            <th class="text-center" style="width:5%;">IH</th>
            ${periodCols.map((p) => `<th class="text-center" style="width:6%;">P${p}</th>`).join('')}
            <th class="text-center" style="width:8%;">Def. P${dataset.periodNumber}</th>
            <th class="text-center" style="width:13%;">Desempeño</th>
            <th class="text-center" style="width:6%;">Faltas</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows || `<tr><td colspan="${4 + periodCols.length + 3}" class="text-center">Sin calificaciones registradas en el periodo.</td></tr>`}
        </tbody>
      </table>
      <div class="signatures three-cols">
        <div class="sig-box">
          <div class="sig-line"></div>
          <div class="sig-name">${this.escapeHtml(dataset.branding.directorName ?? 'Rector(a)')}</div>
          <div class="sig-role">Rectoría</div>
        </div>
        <div class="sig-box">
          <div class="sig-line"></div>
          <div class="sig-name">${this.escapeHtml(page.homeroomTeacherName ?? 'Director(a) de Grupo')}</div>
          <div class="sig-role">Director(a) de Grupo</div>
        </div>
        <div class="sig-box">
          <div class="sig-line"></div>
          <div class="sig-name">${this.escapeHtml(dataset.branding.secretaryName ?? 'Secretaría Académica')}</div>
          <div class="sig-role">Secretaría Académica</div>
        </div>
      </div>
      ${this.renderFooter(dataset.branding, dataset.generatedBy, generatedAt)}
    </div>`;
  }

  private renderCertificates(
    dataset: Extract<InstitutionalReportDataset, { kind: 'CERTIFICATE' }>,
    generatedAt: string,
  ): string {
    if (dataset.pages.length === 0) {
      return `<div class="page-sheet">
        ${this.renderSchoolHeader(dataset.branding, dataset.title, dataset.subtitle)}
        <div class="empty-state">No se encontraron registros estudiantiles para generar el documento oficial solicitado.</div>
        ${this.renderFooter(dataset.branding, dataset.generatedBy, generatedAt)}
      </div>`;
    }

    return dataset.pages
      .map((page) => this.renderSingleCertificate(page, dataset, generatedAt))
      .join('\n');
  }

  private renderSingleCertificate(
    page: CertificateDocumentPage,
    dataset: Extract<InstitutionalReportDataset, { kind: 'CERTIFICATE' }>,
    generatedAt: string,
  ): string {
    let bodySection = '';

    if (page.documentKind === 'CONSTANCIA') {
      bodySection = `
        <div class="cert-title">LA RECTORÍA Y LA SECRETARÍA ACADÉMICA HACEN CONSTAR QUE:</div>
        <div class="cert-body">
          El(La) estudiante <strong>${this.escapeHtml(page.studentFullName)}</strong>, identificado(a) con
          <strong>${this.escapeHtml(page.documentTypeCode)} No. ${this.escapeHtml(page.documentNumber)}</strong>,
          se encuentra legalmente matriculado(a) en esta Institución Educativa para el año lectivo
          <strong>${dataset.academicYear}</strong>, cursando el grado <strong>${this.escapeHtml(page.gradeName)}</strong>,
          grupo <strong>${this.escapeHtml(page.groupCode)}</strong>, sede <strong>${this.escapeHtml(page.campusName)}</strong>,
          jornada <strong>${this.escapeHtml(page.shiftName)}</strong>, en estado <strong>${this.escapeHtml(page.enrollmentStatusName)}</strong>
          ${page.registrationNumber ? `(Matrícula No. ${this.escapeHtml(page.registrationNumber)}, Libro ${this.escapeHtml(page.bookNumber ?? '-')}, Folio ${this.escapeHtml(page.folioNumber ?? '-')})` : ''}.
        </div>
        <div class="cert-body">
          Se expide la presente constancia a solicitud del interesado en la fecha <strong>${this.escapeHtml(generatedAt)}</strong>.
        </div>`;
    } else if (page.documentKind === 'FICHA_MATRICULA') {
      const guardiansHtml =
        page.guardians.length > 0
          ? `<table>
              <thead><tr><th class="text-left">Acudiente / Familiar</th><th class="text-center">Parentesco</th><th class="text-center">Documento</th><th class="text-center">Teléfono</th></tr></thead>
              <tbody>
                ${page.guardians
                  .map(
                    (g) =>
                      `<tr><td>${this.escapeHtml(g.fullName)}</td><td class="text-center">${this.escapeHtml(g.relationship)}</td><td class="text-center">${this.escapeHtml(g.documentNumber)}</td><td class="text-center">${this.escapeHtml(g.phone ?? '-')}</td></tr>`,
                  )
                  .join('')}
              </tbody>
            </table>`
          : '<div class="empty-state">Sin acudientes registrados en la ficha.</div>';

      bodySection = `
        <div class="cert-title">FICHA OFICIAL DE MATRÍCULA · AÑO LECTIVO ${dataset.academicYear}</div>
        <div class="info-grid">
          <div class="info-item span-2"><label>Estudiante</label><span>${this.escapeHtml(page.studentFullName)}</span></div>
          <div class="info-item"><label>Documento</label><span>${this.escapeHtml(page.documentTypeCode)} ${this.escapeHtml(page.documentNumber)}</span></div>
          <div class="info-item"><label>Nacimiento / RH</label><span>${this.escapeHtml(page.birthDate ?? 'N/D')} · ${this.escapeHtml(page.bloodType ?? 'N/D')}</span></div>
          <div class="info-item"><label>Sede / Jornada</label><span>${this.escapeHtml(page.campusName)} · ${this.escapeHtml(page.shiftName)}</span></div>
          <div class="info-item"><label>Grado / Grupo</label><span>${this.escapeHtml(page.gradeName)} - ${this.escapeHtml(page.groupCode)}</span></div>
          <div class="info-item"><label>Matrícula / Libro / Folio</label><span>${this.escapeHtml(page.registrationNumber ?? '-')} / ${this.escapeHtml(page.bookNumber ?? '-')} / ${this.escapeHtml(page.folioNumber ?? '-')}</span></div>
          <div class="info-item"><label>Teléfono / Dirección</label><span>${this.escapeHtml(page.phone ?? '-')} · ${this.escapeHtml(page.address ?? '-')}</span></div>
        </div>
        ${guardiansHtml}`;
    } else {
      const heading =
        page.documentKind === 'ACTA_GRADO'
          ? 'ACTA OFICIAL DE GRADO Y PROMOCIÓN'
          : 'CERTIFICADO OFICIAL DE CALIFICACIONES';

      const subjectsTable =
        page.subjects.length > 0
          ? `<table>
              <thead>
                <tr>
                  <th class="text-left">Área</th>
                  <th class="text-left">Asignatura</th>
                  <th class="text-center">IH</th>
                  <th class="text-center">Def. Anual</th>
                  <th class="text-center">Habilitación</th>
                  <th class="text-center">Final</th>
                  <th class="text-center">Desempeño</th>
                </tr>
              </thead>
              <tbody>
                ${page.subjects
                  .map(
                    (s) => `<tr>
                      <td>${this.escapeHtml(s.areaName)}</td>
                      <td>${this.escapeHtml(s.subjectName)}</td>
                      <td class="text-center">${s.weeklyHours}</td>
                      <td class="text-center">${s.annualScore.toFixed(2)}</td>
                      <td class="text-center">${s.recoveryScore !== null ? s.recoveryScore.toFixed(2) : '-'}</td>
                      <td class="text-center"><strong>${s.finalEffectiveScore.toFixed(2)}</strong></td>
                      <td class="text-center">${this.escapeHtml(s.scaleName)}</td>
                    </tr>`,
                  )
                  .join('')}
              </tbody>
            </table>`
          : '';

      bodySection = `
        <div class="cert-title">${heading}</div>
        <div class="cert-body">
          La Rectoría y la Secretaría Académica de <strong>${this.escapeHtml(dataset.branding.schoolName)}</strong>
          certifican que el(la) estudiante <strong>${this.escapeHtml(page.studentFullName)}</strong>, identificado(a) con
          <strong>${this.escapeHtml(page.documentTypeCode)} No. ${this.escapeHtml(page.documentNumber)}</strong>,
          cursó en el año lectivo <strong>${dataset.academicYear}</strong> el grado <strong>${this.escapeHtml(page.gradeName)}</strong>
          (grupo <strong>${this.escapeHtml(page.groupCode)}</strong>, sede <strong>${this.escapeHtml(page.campusName)}</strong>,
          jornada <strong>${this.escapeHtml(page.shiftName)}</strong>) obteniendo las siguientes valoraciones definitivas
          ${page.finalAverage !== null ? `con un promedio general de <strong>${page.finalAverage.toFixed(2)}</strong>` : ''}:
        </div>
        ${subjectsTable}
        <div class="cert-body">
          <strong>Concepto de Promoción:</strong> ${this.escapeHtml(page.promotionStatusDescription ?? 'Pendiente de acta final de promoción')}.
          ${page.actNumber ? ` · <strong>Acta No.:</strong> ${this.escapeHtml(page.actNumber)}` : ''}
          ${page.diplomaNumber ? ` · <strong>Diploma No.:</strong> ${this.escapeHtml(page.diplomaNumber)}` : ''}
          ${page.graduationFolio ? ` · <strong>Folio:</strong> ${this.escapeHtml(page.graduationFolio)}` : ''}
        </div>`;
    }

    return `<div class="page-sheet">
      ${this.renderSchoolHeader(dataset.branding, dataset.title, dataset.subtitle)}
      <div class="cert-consecutive">Consecutivo Oficial: ${this.escapeHtml(page.consecutiveNumber)}</div>
      ${bodySection}
      <div class="signatures">
        <div class="sig-box">
          <div class="sig-line"></div>
          <div class="sig-name">${this.escapeHtml(dataset.branding.directorName ?? 'Rector(a)')}</div>
          <div class="sig-role">Rector(a) ${dataset.branding.directorDocument ? `· CC ${this.escapeHtml(dataset.branding.directorDocument)}` : ''}</div>
        </div>
        <div class="sig-box">
          <div class="sig-line"></div>
          <div class="sig-name">${this.escapeHtml(dataset.branding.secretaryName ?? 'Secretario(a) Académico(a)')}</div>
          <div class="sig-role">Secretaría Académica ${dataset.branding.secretaryDocument ? `· CC ${this.escapeHtml(dataset.branding.secretaryDocument)}` : ''}</div>
        </div>
      </div>
      ${this.renderFooter(dataset.branding, dataset.generatedBy, generatedAt)}
    </div>`;
  }

  private renderCards(
    dataset: Extract<InstitutionalReportDataset, { kind: 'CARDS' }>,
    generatedAt: string,
  ): string {
    if (dataset.cards.length === 0) {
      return `<div class="page-sheet">
        ${this.renderSchoolHeader(dataset.branding, dataset.title, dataset.subtitle)}
        <div class="empty-state">No hay estudiantes activos para generar carnés en los filtros seleccionados.</div>
        ${this.renderFooter(dataset.branding, dataset.generatedBy, generatedAt)}
      </div>`;
    }

    const cardsHtml = dataset.cards
      .map((card: StudentCardItem) => {
        const initials = this.extractInitials(card.studentFullName);
        return `<div class="student-card">
          <div class="card-top">
            <div class="card-school">${this.escapeHtml(dataset.branding.shortName || dataset.branding.schoolName)}</div>
            <div class="card-year">AÑO ${card.academicYear}</div>
          </div>
          <div class="card-body">
            <div class="card-avatar">${this.escapeHtml(initials)}</div>
            <div class="card-details">
              <div class="card-student-name">${this.escapeHtml(card.studentFullName)}</div>
              <div><strong>Documento:</strong> ${this.escapeHtml(card.documentNumber)}</div>
              <div><strong>Grado/Grupo:</strong> ${this.escapeHtml(card.gradeGroup)}</div>
              <div><strong>Sede/Jornada:</strong> ${this.escapeHtml(card.campusName)} · ${this.escapeHtml(card.shiftName)}</div>
              <div><strong>Grupo RH:</strong> ${this.escapeHtml(card.bloodType ?? 'N/D')}</div>
            </div>
          </div>
          <div class="card-footer">
            <span>Carné Estudiantil Oficial</span>
            <span>DANE: ${this.escapeHtml(dataset.branding.daneCode ?? 'N/D')}</span>
          </div>
        </div>`;
      })
      .join('\n');

    return `<div class="page-sheet">
      ${this.renderSchoolHeader(dataset.branding, dataset.title, dataset.subtitle)}
      <div class="cards-grid">${cardsHtml}</div>
      ${this.renderFooter(dataset.branding, dataset.generatedBy, generatedAt)}
    </div>`;
  }

  private renderMatrixTable(
    dataset: Extract<InstitutionalReportDataset, { kind: 'MATRIX_TABLE' }>,
    generatedAt: string,
  ): string {
    const matrix: MatrixTableDocument = dataset.matrix;
    const failingSet = new Set(matrix.failingCellKeys);

    const badgesHtml =
      matrix.summaryBadges.length > 0
        ? `<div class="summary-badges">${matrix.summaryBadges
            .map(
              (b) =>
                `<span class="summary-badge">${this.escapeHtml(b.label)}:<strong>${this.escapeHtml(b.value)}</strong></span>`,
            )
            .join('')}</div>`
        : '';

    const headerCells = matrix.columns
      .map(
        (col) =>
          `<th class="text-${col.align ?? 'left'}">${this.escapeHtml(col.label)}</th>`,
      )
      .join('');

    const bodyRows =
      matrix.rows.length > 0
        ? matrix.rows
            .map((row, rowIndex) => {
              const tds = matrix.columns
                .map((col) => {
                  const raw = row[col.key];
                  const cellText =
                    raw === null || raw === undefined ? '' : String(raw);
                  const isFailing = failingSet.has(`${rowIndex}:${col.key}`);
                  return `<td class="text-${col.align ?? 'left'} ${isFailing ? 'score-fail' : ''}">${this.escapeHtml(cellText)}</td>`;
                })
                .join('');
              return `<tr>${tds}</tr>`;
            })
            .join('\n')
        : `<tr><td colspan="${Math.max(1, matrix.columns.length)}" class="text-center">Sin registros para los filtros seleccionados.</td></tr>`;

    const footerRow = matrix.footerTotals
      ? `<tr class="totals-row">${matrix.columns
          .map((col) => {
            const val = matrix.footerTotals?.[col.key];
            return `<td class="text-${col.align ?? 'left'}">${this.escapeHtml(val !== undefined ? String(val) : '')}</td>`;
          })
          .join('')}</tr>`
      : '';

    return `<div class="page-sheet">
      ${this.renderSchoolHeader(dataset.branding, dataset.title, dataset.subtitle)}
      ${badgesHtml}
      <table>
        <thead><tr>${headerCells}</tr></thead>
        <tbody>${bodyRows}${footerRow}</tbody>
      </table>
      ${this.renderFooter(dataset.branding, dataset.generatedBy, generatedAt)}
    </div>`;
  }

  private renderFooter(
    branding: SchoolBrandingHeader,
    generatedBy: string,
    generatedAt: string,
  ): string {
    const customFooter =
      branding.footerText ||
      'Software Académico y Administrativo ASAIE ÉXODO V3 · Documento Oficial';
    return `<div class="doc-footer">
      <span>${this.escapeHtml(customFooter)}</span>
      <span>Generado por ${this.escapeHtml(generatedBy)} · ${this.escapeHtml(generatedAt)}</span>
    </div>`;
  }

  private resolvePageCss(paperSize: string, orientation: string): string {
    const size = paperSize === 'LEGAL' ? 'legal' : 'letter';
    const orient = orientation === 'landscape' ? 'landscape' : 'portrait';
    return `${size} ${orient}`;
  }

  private extractInitials(text: string): string {
    const words = text
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0);
    if (words.length === 0) return 'AE';
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }

  private sanitizeHexColor(value: string | null | undefined): string {
    if (value && /^#[0-9a-fA-F]{3,8}$/.test(value.trim())) {
      return value.trim();
    }
    return '#334155';
  }

  private formatBogotaDateTime(date: Date): string {
    return new Intl.DateTimeFormat('es-CO', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'America/Bogota',
    }).format(date);
  }

  private escapeHtml(raw: string): string {
    return raw
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}
