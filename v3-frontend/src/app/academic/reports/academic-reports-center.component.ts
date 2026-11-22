import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { LoadMaskService } from '../../services/common/load-mask.service';
import { MessagesService } from '../../services/messages.service';
import {
  ConsolidatedReportView,
  V3AcademicService,
} from '../../services/v3-academic.service';
import {
  GroupManagerRecord,
  V3AdministrationService,
} from '../../services/v3-administration.service';
import {
  SchoolAcademicContextCatalogs,
  V3CatalogsService,
} from '../../services/v3-catalogs.service';
import { V3UnifiedAuthService } from '../../services/v3-unified-auth.service';
import { V3ModalDialogComponent } from '../../shared/components/v3-modal-dialog/v3-modal-dialog.component';
import {
  SearchableSelectOption,
  V3SearchableSelectComponent,
} from '../../shared/components/v3-searchable-select/v3-searchable-select.component';
import { CustomTooltipDirective } from '../../shared/directives/custom-tooltip.directive';

interface ReportTemplateDefinition {
  readonly key: string;
  readonly category: 'boletines' | 'consolidados' | 'matriculas' | 'certificados';
  readonly title: string;
  readonly description: string;
  readonly templateName: string;
  readonly defaultFormat: 'pdf' | 'xlsx';
  readonly icon: string;
}

interface QueuedReportItem {
  readonly jobId: string;
  readonly title: string;
  readonly format: string;
  readonly state: string;
  readonly downloadUrl: string | null;
}

/**
 * Centro unificado de reportes institucionales (motor cloud-native Gotenberg 8 PDF + ExcelJS + BullMQ/S3
 * con visor interactivo de Consolidado SIEE y materialización de promedios por área).
 */
@Component({
  selector: 'app-academic-reports-center',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    CustomTooltipDirective,
    V3ModalDialogComponent,
    V3SearchableSelectComponent,
  ],
  template: `
    <div class="container-fluid py-3">
      <div class="breadcrumb-card mb-25 d-md-flex align-items-center justify-content-between">
        <div>
          <h5 class="mb-0 fw-bold">Centro de Reportes Oficiales (Motor Nativo PDF / Excel + S3)</h5>
          <small class="text-muted">Año lectivo {{ academicYear() }} · Descarga inmediata Gotenberg 8 / ExcelJS o cola asíncrona S3</small>
        </div>
        <ol class="breadcrumb list-unstyled mt-0 mb-0 p-0">
          <li class="breadcrumb-item d-inline-block position-relative">
            <a routerLink="/academic" class="d-inline-block position-relative">Académico</a>
          </li>
          <li class="breadcrumb-item d-inline-block position-relative">Reportes</li>
        </ol>
      </div>

      <div class="trezo-card bg-white border-radius p-4 shadow-sm mb-4">
        <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          <h6 class="fw-semibold mb-0">Parámetros de Generación</h6>
          <div class="d-flex flex-wrap gap-2">
            <button
              type="button"
              class="btn btn-sm btn-outline-info"
              (click)="openConsolidatedPreview('subjects')"
              [appCustomTooltip]="'Consultar sábana consolidada por asignaturas en pantalla'"
            >
              <i class="material-symbols-outlined fs-6 align-middle me-1">grid_on</i>
              Ver Consolidado Asignaturas
            </button>
            <button
              type="button"
              class="btn btn-sm btn-outline-primary"
              (click)="openConsolidatedPreview('areas')"
              [appCustomTooltip]="'Consultar sábana consolidada ponderada por áreas SIEE en pantalla'"
            >
              <i class="material-symbols-outlined fs-6 align-middle me-1">table_chart</i>
              Ver Consolidado Áreas
            </button>
            <button
              type="button"
              class="btn btn-sm btn-outline-warning"
              (click)="materializeAreaResults()"
              [appCustomTooltip]="'Recalcular y materializar promedios ponderados de áreas para el periodo seleccionado'"
            >
              <i class="material-symbols-outlined fs-6 align-middle me-1">sync</i>
              Materializar Áreas P{{ params.periodNumber }}
            </button>
          </div>
        </div>
        <div class="row g-3">
          <div class="col-12 col-md-6">
            <label class="form-label">Sede</label>
            <app-v3-searchable-select
              placeholder="Todas las sedes"
              searchPlaceholder="Buscar sede..."
              [options]="campusOptions()"
              [(ngModel)]="params.campusId"
            />
          </div>
          <div class="col-12 col-md-6">
            <label class="form-label">Grupo</label>
            <app-v3-searchable-select
              placeholder="Todos los grupos"
              searchPlaceholder="Buscar grupo o sede..."
              [options]="groupOptions()"
              [(ngModel)]="params.groupId"
            />
          </div>
          <div class="col-12 col-md-6">
            <label class="form-label">Periodo</label>
            <app-v3-searchable-select
              placeholder="Periodo"
              searchPlaceholder="Buscar periodo..."
              [options]="periodOptions"
              [(ngModel)]="params.periodNumber"
            />
          </div>
          <div class="col-12 col-md-6">
            <label class="form-label">Formato de salida</label>
            <app-v3-searchable-select
              placeholder="Formato"
              searchPlaceholder="Buscar formato..."
              [options]="outputFormatOptions"
              [(ngModel)]="params.outputFormat"
            />
          </div>
          <div class="col-12 col-md-6">
            <label class="form-label">Categoría</label>
            <app-v3-searchable-select
              placeholder="Categoría"
              searchPlaceholder="Buscar categoría..."
              [options]="categoryOptions"
              [(ngModel)]="selectedCategory"
            />
          </div>
        </div>
      </div>

      <div class="row g-3 mb-4">
        @for (tpl of filteredTemplates(); track tpl.key) {
          <div class="col-md-6 col-xl-4">
            <div class="trezo-card bg-white border-radius p-3 shadow-sm h-100 d-flex flex-column justify-content-between">
              <div class="d-flex gap-3">
                <span class="v3-kpi-icon kpi-primary flex-shrink-0">
                  <i class="material-symbols-outlined">{{ tpl.icon }}</i>
                </span>
                <div>
                  <h6 class="fw-semibold mb-1">{{ tpl.title }}</h6>
                  <p class="small text-muted mb-0">{{ tpl.description }}</p>
                </div>
              </div>
              <div class="mt-3 pt-2 border-top d-flex justify-content-between align-items-center gap-2">
                <code class="small text-muted text-truncate">{{ tpl.templateName }}</code>
                <div class="d-flex gap-1 flex-shrink-0">
                  <button
                    type="button"
                    class="btn btn-sm btn-primary"
                    (click)="downloadDirect(tpl)"
                    [appCustomTooltip]="'Descargar inmediatamente ' + tpl.title + ' (' + params.outputFormat.toUpperCase() + ')'"
                  >
                    <i class="material-symbols-outlined fs-6 align-middle me-1">download</i>
                    Descargar
                  </button>
                  <button
                    type="button"
                    class="btn btn-sm btn-outline-secondary"
                    (click)="generateReport(tpl)"
                    [appCustomTooltip]="'Encolar generación en segundo plano (BullMQ + S3)'"
                  >
                    <i class="material-symbols-outlined fs-6 align-middle">cloud_queue</i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Modal Consolidado Interactivo SIEE -->
      <app-v3-modal-dialog
        [open]="consolidatedModalOpen()"
        [heading]="'Consolidado SIEE (' + (consolidatedMode() === 'areas' ? 'Áreas' : 'Asignaturas') + ') · P' + params.periodNumber"
        icon="table_chart"
        size="xl"
        (closed)="consolidatedModalOpen.set(false)"
      >
        @if (consolidatedReport(); as rep) {
          <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
            <div class="d-flex flex-wrap gap-2 small">
              <span class="badge text-bg-primary">Estudiantes: {{ rep.summary.totalStudents }}</span>
              <span class="badge text-bg-success">Sin reprobaciones: {{ rep.summary.studentsWithZeroFailures }}</span>
              <span class="badge text-bg-danger">Con reprobaciones: {{ rep.summary.studentsWithFailures }}</span>
            </div>
            <div class="d-flex gap-2">
              <button
                type="button"
                class="btn btn-sm btn-outline-success"
                (click)="downloadTemplateDirect(consolidatedMode() === 'areas' ? 'consolidado_areas' : 'consolidado_asignaturas', 'xlsx')"
              >
                Descargar Excel (.xlsx)
              </button>
              <button
                type="button"
                class="btn btn-sm btn-outline-danger"
                (click)="downloadTemplateDirect(consolidatedMode() === 'areas' ? 'consolidado_areas' : 'consolidado_asignaturas', 'pdf')"
              >
                Descargar PDF
              </button>
            </div>
          </div>
          <div class="table-responsive" style="max-height: 62vh;">
            <table class="table table-sm table-bordered align-middle mb-0 small">
              <thead class="table-dark sticky-top">
                <tr>
                  <th class="text-center">#</th>
                  <th>Estudiante</th>
                  <th class="text-center">Grupo</th>
                  @for (col of rep.columns; track col.key) {
                    <th class="text-center" [appCustomTooltip]="col.name">
                      {{ col.abbreviation || col.name.slice(0, 6) }}
                    </th>
                  }
                  <th class="text-center">Prom.</th>
                  <th class="text-center">Rep.</th>
                </tr>
              </thead>
              <tbody>
                @for (row of rep.rows; track row.enrollmentId; let idx = $index) {
                  <tr>
                    <td class="text-center">{{ idx + 1 }}</td>
                    <td class="fw-semibold text-nowrap">{{ row.studentFullName }}</td>
                    <td class="text-center">{{ row.gradeName }}-{{ row.groupCode }}</td>
                    @for (col of rep.columns; track col.key) {
                      @let cell = row.cells[col.key];
                      <td
                        class="text-center"
                        [ngClass]="cell?.isFailed ? 'table-danger fw-bold text-danger' : ''"
                      >
                        {{ cell ? cell.score : '—' }}
                      </td>
                    }
                    <td class="text-center fw-bold text-primary">{{ row.averageScore }}</td>
                    <td class="text-center">
                      <span class="badge" [ngClass]="row.failedCount > 0 ? 'text-bg-danger' : 'text-bg-success'">
                        {{ row.failedCount }}
                      </span>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td [attr.colspan]="rep.columns.length + 5" class="text-center text-muted py-4">
                      Sin calificaciones registradas para los filtros seleccionados.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </app-v3-modal-dialog>

      @if (queuedJobs().length > 0) {
        <div class="trezo-card bg-white border-radius p-4 shadow-sm">
          <h6 class="fw-semibold mb-3">Cola de Reportes Generados en esta Sesión</h6>
          <div class="table-responsive">
            <table class="table table-sm table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>Job ID</th>
                  <th>Reporte</th>
                  <th>Formato</th>
                  <th>Estado</th>
                  <th class="text-end">Acción</th>
                </tr>
              </thead>
              <tbody>
                @for (job of queuedJobs(); track job.jobId) {
                  <tr>
                    <td class="font-monospace small">{{ job.jobId }}</td>
                    <td class="fw-semibold">{{ job.title }}</td>
                    <td class="text-uppercase small">{{ job.format }}</td>
                    <td>
                      <span
                        class="badge"
                        [ngClass]="
                          job.state === 'completed'
                            ? 'text-bg-success'
                            : job.state === 'failed'
                              ? 'text-bg-danger'
                              : 'text-bg-warning'
                        "
                      >
                        {{ job.state }}
                      </span>
                    </td>
                    <td class="text-end text-nowrap">
                      <button
                        type="button"
                        class="btn btn-sm btn-outline-secondary me-1"
                        (click)="refreshJob(job)"
                        [appCustomTooltip]="'Actualizar estado del trabajo'"
                      >
                        <i class="material-symbols-outlined fs-6">refresh</i>
                      </button>
                      @if (job.downloadUrl) {
                        <a
                          [href]="job.downloadUrl"
                          target="_blank"
                          rel="noopener noreferrer"
                          class="btn btn-sm btn-success"
                        >
                          Descargar S3
                        </a>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `,
})
export class AcademicReportsCenterComponent implements OnInit {
  private readonly academicService = inject(V3AcademicService);
  private readonly adminService = inject(V3AdministrationService);
  private readonly catalogsService = inject(V3CatalogsService);
  private readonly auth = inject(V3UnifiedAuthService);
  private readonly messages = inject(MessagesService);
  private readonly loadMask = inject(LoadMaskService);

  readonly academicYear = computed(() => this.auth.academicYear());
  readonly context = signal<SchoolAcademicContextCatalogs | null>(null);
  readonly groups = signal<GroupManagerRecord[]>([]);
  readonly queuedJobs = signal<QueuedReportItem[]>([]);
  readonly consolidatedModalOpen = signal(false);
  readonly consolidatedMode = signal<'subjects' | 'areas'>('subjects');
  readonly consolidatedReport = signal<ConsolidatedReportView | null>(null);

  readonly campusOptions = computed<SearchableSelectOption<number>[]>(() => [
    { value: 0, label: 'Todas las sedes' },
    ...(this.context()?.campuses ?? []).map((c) => ({
      value: c.id,
      label: c.name,
    })),
  ]);

  readonly groupOptions = computed<SearchableSelectOption<number>[]>(() => [
    { value: 0, label: 'Todos los grupos' },
    ...this.groups().map((g) => ({
      value: g.id,
      label: `${g.gradeName}-${g.groupCode}`,
      subtitle: g.campusName,
      keywords: g.campusName,
    })),
  ]);

  readonly periodOptions: readonly SearchableSelectOption<number>[] = [
    { value: 1, label: 'Periodo 1' },
    { value: 2, label: 'Periodo 2' },
    { value: 3, label: 'Periodo 3' },
    { value: 4, label: 'Periodo 4' },
  ];

  readonly outputFormatOptions: readonly SearchableSelectOption<
    'pdf' | 'xlsx' | 'csv' | 'docx'
  >[] = [
    { value: 'pdf', label: 'PDF (Oficial)' },
    { value: 'xlsx', label: 'Excel (.xlsx)' },
    { value: 'csv', label: 'CSV (.csv)' },
    { value: 'docx', label: 'Word (.docx)' },
  ];

  readonly categoryOptions: readonly SearchableSelectOption<string>[] = [
    { value: 'all', label: 'Todas (17)' },
    { value: 'boletines', label: 'Boletines' },
    { value: 'consolidados', label: 'Consolidados / Estad.' },
    { value: 'matriculas', label: 'Matrículas y Listas' },
    { value: 'certificados', label: 'Constancias / Carnés' },
  ];

  selectedCategory = 'all';
  params = {
    campusId: 0,
    groupId: 0,
    periodNumber: 1,
    outputFormat: 'pdf' as 'pdf' | 'xlsx' | 'csv' | 'docx',
  };

  readonly templates: ReportTemplateDefinition[] = [
    { key: 'bol_areas', category: 'boletines', title: 'Boletín por Áreas (Carta)', description: 'Boletín oficial periódico agrupado por áreas y asignaturas.', templateName: 'boletin_carta_areas', defaultFormat: 'pdf', icon: 'article' },
    { key: 'bol_oficio', category: 'boletines', title: 'Boletín por Asignaturas (Oficio)', description: 'Boletín detallado por asignaturas, logros e inasistencias.', templateName: 'boletin_oficio_asignaturas', defaultFormat: 'pdf', icon: 'article' },
    { key: 'bol_pre', category: 'boletines', title: 'Boletín Preescolar / Descriptivo', description: 'Informe cualitativo por dimensiones para educación inicial.', templateName: 'boletin_preescolar', defaultFormat: 'pdf', icon: 'child_care' },
    { key: 'preinformes', category: 'boletines', title: 'Preinformes Académicos', description: 'Alertas preventivas de bajo desempeño antes del cierre de periodo.', templateName: 'preinformes_periodo', defaultFormat: 'pdf', icon: 'notification_important' },
    { key: 'cons_asig', category: 'consolidados', title: 'Consolidado por Asignaturas', description: 'Sábana matricial de notas por grupo y asignatura.', templateName: 'consolidado_asignaturas', defaultFormat: 'xlsx', icon: 'grid_on' },
    { key: 'cons_areas', category: 'consolidados', title: 'Consolidado por Áreas', description: 'Sábana consolidada promediada por áreas fundamentales.', templateName: 'consolidado_areas', defaultFormat: 'xlsx', icon: 'table_chart' },
    { key: 'estadisticas', category: 'consolidados', title: 'Estadísticas de Desempeño', description: 'Distribución cuantitativa por desempeño nacional (Bajo a Superior).', templateName: 'estadisticas_desempeno', defaultFormat: 'pdf', icon: 'bar_chart' },
    { key: 'reprobados', category: 'consolidados', title: 'Estudiantes Reprobados por Periodo', description: 'Listado de estudiantes con asignaturas perdidas para comisión de evaluación.', templateName: 'reprobados_periodo', defaultFormat: 'pdf', icon: 'warning' },
    { key: 'cuadro_honor', category: 'consolidados', title: 'Cuadro de Honor y Puestos', description: 'Ranking institucional de mejores promedios por grado y grupo.', templateName: 'cuadro_honor', defaultFormat: 'pdf', icon: 'emoji_events' },
    { key: 'ficha_mat', category: 'matriculas', title: 'Ficha de Matrícula', description: 'Formato oficial de matrícula con datos del estudiante y acudientes.', templateName: 'ficha_matricula', defaultFormat: 'pdf', icon: 'assignment_ind' },
    { key: 'libro_mat', category: 'matriculas', title: 'Libro de Matrículas', description: 'Registro institucional foliado de matrículas del año lectivo.', templateName: 'libro_matriculas', defaultFormat: 'pdf', icon: 'menu_book' },
    { key: 'listas_sin', category: 'matriculas', title: 'Listas de Asistencia sin Carga', description: 'Planillas de control de clase por grupo ordenadas alfabéticamente.', templateName: 'listas_asistencia', defaultFormat: 'pdf', icon: 'checklist' },
    { key: 'listas_con', category: 'matriculas', title: 'Listas con Carga Académica', description: 'Planillas de notas auxiliares vinculadas a cada docente y materia.', templateName: 'listas_con_carga', defaultFormat: 'pdf', icon: 'fact_check' },
    { key: 'directorio', category: 'matriculas', title: 'Directorio de Estudiantes y Familias', description: 'Base de contacto con teléfonos, direcciones y acudientes.', templateName: 'directorio_estudiantes', defaultFormat: 'xlsx', icon: 'contacts' },
    { key: 'carnets', category: 'certificados', title: 'Carnés Estudiantiles', description: 'Generación masiva de carnés con código de identificación y escudo.', templateName: 'carnets_estudiantiles', defaultFormat: 'pdf', icon: 'badge' },
    { key: 'constancias', category: 'certificados', title: 'Constancias de Estudio', description: 'Constancia oficial de matrícula activa con firma de rectoría/secretaría.', templateName: 'constancia_estudio', defaultFormat: 'pdf', icon: 'verified' },
    { key: 'certificados', category: 'certificados', title: 'Certificados de Calificaciones', description: 'Certificado oficial de notas finales por año cursado.', templateName: 'certificado_calificaciones', defaultFormat: 'pdf', icon: 'workspace_premium' },
  ];

  filteredTemplates(): ReportTemplateDefinition[] {
    const allowed = this.templates.filter((t) => this.isTemplateAllowed(t));
    if (this.selectedCategory === 'all') {
      return allowed;
    }
    return allowed.filter((t) => t.category === this.selectedCategory);
  }

  private isTemplateAllowed(tpl: ReportTemplateDefinition): boolean {
    if (tpl.category === 'certificados') {
      return this.auth.hasPermission('reports.certificates.generate');
    }
    if (tpl.category === 'matriculas') {
      return this.auth.hasAnyPermission([
        'reports.directory.generate',
        ...(tpl.templateName === 'listas_asistencia' ||
        tpl.templateName === 'listas_con_carga'
          ? ['reports.teacher.generate']
          : []),
      ]);
    }
    return this.auth.hasAnyPermission([
      'reports.academic.generate',
      ...(tpl.templateName === 'preinformes_periodo'
        ? ['reports.teacher.generate']
        : []),
    ]);
  }

  ngOnInit(): void {
    this.loadMask.show('Cargando centro de reportes...');
    forkJoin({
      context: this.catalogsService.getSchoolContext(),
      groups: this.adminService.listGroupManagers(this.academicYear()),
    })
      .pipe(finalize(() => this.loadMask.hide()))
      .subscribe({
        next: (res) => {
          this.context.set(res.context);
          this.groups.set(res.groups);
        },
      });
  }

  openConsolidatedPreview(mode: 'subjects' | 'areas'): void {
    this.consolidatedMode.set(mode);
    this.loadMask.show('Calculando consolidado SIEE...');
    this.academicService
      .getConsolidatedReport({
        academicYear: this.academicYear(),
        mode,
        academicGroupId: this.params.groupId || undefined,
        periodNumber: this.params.periodNumber,
      })
      .pipe(finalize(() => this.loadMask.hide()))
      .subscribe({
        next: (report) => {
          this.consolidatedReport.set(report);
          this.consolidatedModalOpen.set(true);
        },
      });
  }

  materializeAreaResults(): void {
    this.loadMask.show('Materializando resultados ponderados de áreas SIEE...');
    this.academicService
      .materializeAreaPeriodResults(this.academicYear(), this.params.periodNumber)
      .pipe(finalize(() => this.loadMask.hide()))
      .subscribe({
        next: (res) => {
          this.messages.showSuccess(
            `Materialización completada: ${res.materializedCount} registro(s) de área actualizados para Periodo ${this.params.periodNumber}.`,
          );
        },
      });
  }

  downloadDirect(tpl: ReportTemplateDefinition): void {
    this.downloadTemplateDirect(tpl.templateName, this.params.outputFormat, tpl.title);
  }

  downloadTemplateDirect(
    templateName: string,
    outputFormat: 'pdf' | 'xlsx' | 'csv' | 'docx',
    title?: string,
  ): void {
    this.loadMask.show(`Generando ${title || templateName}...`);
    this.academicService
      .downloadDirectReport({
        templateName,
        outputFormat,
        parameters: {
          P_YEAR: this.academicYear(),
          P_PERIOD: this.params.periodNumber,
          ...(this.params.campusId ? { P_CAMPUS_ID: this.params.campusId } : {}),
          ...(this.params.groupId ? { P_GROUP_ID: this.params.groupId } : {}),
        },
      })
      .pipe(finalize(() => this.loadMask.hide()))
      .subscribe({
        next: (response) => {
          this.academicService.triggerBrowserBlobDownload(
            response,
            `${templateName}_${this.academicYear()}.${outputFormat}`,
          );
          this.messages.showSuccess(`Reporte "${title || templateName}" descargado correctamente.`);
        },
      });
  }

  generateReport(tpl: ReportTemplateDefinition): void {
    this.academicService
      .enqueueJasperReport({
        templateName: tpl.templateName,
        outputFormat: this.params.outputFormat,
        parameters: {
          P_YEAR: this.academicYear(),
          P_PERIOD: this.params.periodNumber,
          ...(this.params.campusId ? { P_CAMPUS_ID: this.params.campusId } : {}),
          ...(this.params.groupId ? { P_GROUP_ID: this.params.groupId } : {}),
        },
      })
      .subscribe({
        next: (res) => {
          this.messages.showSuccess(`Reporte "${tpl.title}" encolado (Job #${res.jobId}).`);
          this.queuedJobs.set([
            {
              jobId: res.jobId,
              title: tpl.title,
              format: this.params.outputFormat,
              state: res.status.toLowerCase(),
              downloadUrl: null,
            },
            ...this.queuedJobs(),
          ]);
        },
      });
  }

  refreshJob(job: QueuedReportItem): void {
    this.academicService.getReportJobStatus(job.jobId).subscribe({
      next: (status) => {
        this.queuedJobs.set(
          this.queuedJobs().map((item) =>
            item.jobId === job.jobId
              ? { ...item, state: status.state, downloadUrl: status.downloadUrl }
              : item,
          ),
        );
      },
    });
  }
}
