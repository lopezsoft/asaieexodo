import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { LoadMaskService } from '../../services/common/load-mask.service';
import { MessagesService } from '../../services/messages.service';
import { V3AcademicService } from '../../services/v3-academic.service';
import {
  GroupManagerRecord,
  V3AdministrationService,
} from '../../services/v3-administration.service';
import {
  SchoolAcademicContextCatalogs,
  V3CatalogsService,
} from '../../services/v3-catalogs.service';
import { V3UnifiedAuthService } from '../../services/v3-unified-auth.service';
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
 * Centro unificado de reportes institucionales (consolida los 17 reportes JasperReports
 * heredados de ExtJS general/ y academico/ sobre la cola BullMQ + AWS S3).
 */
@Component({
  selector: 'app-academic-reports-center',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CustomTooltipDirective],
  template: `
    <div class="container-fluid py-3">
      <div class="breadcrumb-card mb-25 d-md-flex align-items-center justify-content-between">
        <div>
          <h5 class="mb-0 fw-bold">Centro de Reportes Oficiales (JasperReports + S3)</h5>
          <small class="text-muted">Año lectivo {{ academicYear() }} · Generación asíncrona auditada</small>
        </div>
        <ol class="breadcrumb list-unstyled mt-0 mb-0 p-0">
          <li class="breadcrumb-item d-inline-block position-relative">
            <a routerLink="/academic" class="d-inline-block position-relative">Académico</a>
          </li>
          <li class="breadcrumb-item d-inline-block position-relative">Reportes</li>
        </ol>
      </div>

      <div class="trezo-card bg-white border-radius p-4 shadow-sm mb-4">
        <h6 class="fw-semibold mb-3">Parámetros de Generación</h6>
        <div class="row g-3">
          <div class="col-md-3">
            <label class="form-label small fw-semibold">Sede</label>
            <select class="form-select form-select-sm" [(ngModel)]="params.campusId">
              <option [ngValue]="0">Todas las sedes</option>
              @for (c of context()?.campuses ?? []; track c.id) {
                <option [ngValue]="c.id">{{ c.name }}</option>
              }
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label small fw-semibold">Grupo</label>
            <select class="form-select form-select-sm" [(ngModel)]="params.groupId">
              <option [ngValue]="0">Todos los grupos</option>
              @for (g of groups(); track g.id) {
                <option [ngValue]="g.id">{{ g.gradeName }}-{{ g.groupCode }} ({{ g.campusName }})</option>
              }
            </select>
          </div>
          <div class="col-md-2">
            <label class="form-label small fw-semibold">Periodo</label>
            <select class="form-select form-select-sm" [(ngModel)]="params.periodNumber">
              @for (p of [1, 2, 3, 4]; track p) {
                <option [ngValue]="p">Periodo {{ p }}</option>
              }
            </select>
          </div>
          <div class="col-md-2">
            <label class="form-label small fw-semibold">Formato salida</label>
            <select class="form-select form-select-sm" [(ngModel)]="params.outputFormat">
              <option value="pdf">PDF (Oficial)</option>
              <option value="xlsx">Excel (.xlsx)</option>
              <option value="docx">Word (.docx)</option>
            </select>
          </div>
          <div class="col-md-2">
            <label class="form-label small fw-semibold">Categoría</label>
            <select class="form-select form-select-sm" [(ngModel)]="selectedCategory">
              <option value="all">Todas (17)</option>
              <option value="boletines">Boletines</option>
              <option value="consolidados">Consolidados / Estad.</option>
              <option value="matriculas">Matrículas y Listas</option>
              <option value="certificados">Constancias / Carnés</option>
            </select>
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
              <div class="mt-3 pt-2 border-top d-flex justify-content-between align-items-center">
                <code class="small text-muted">{{ tpl.templateName }}</code>
                <button
                  type="button"
                  class="btn btn-sm btn-primary"
                  (click)="generateReport(tpl)"
                  [appCustomTooltip]="'Encolar generación de ' + tpl.title"
                >
                  <i class="material-symbols-outlined fs-6 align-middle me-1">print</i>
                  Generar
                </button>
              </div>
            </div>
          </div>
        }
      </div>

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

  selectedCategory = 'all';
  params = {
    campusId: 0,
    groupId: 0,
    periodNumber: 1,
    outputFormat: 'pdf' as 'pdf' | 'xlsx' | 'docx',
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
    if (this.selectedCategory === 'all') {
      return this.templates;
    }
    return this.templates.filter((t) => t.category === this.selectedCategory);
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

  generateReport(tpl: ReportTemplateDefinition): void {
    this.academicService
      .enqueueJasperReport({
        templateName: tpl.templateName,
        outputFormat: this.params.outputFormat,
        parameters: {
          P_YEAR: this.academicYear(),
          P_PERIOD: this.params.periodNumber,
          P_CAMPUS_ID: this.params.campusId,
          P_GROUP_ID: this.params.groupId,
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
