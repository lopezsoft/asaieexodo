import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { LoadMaskService } from '../../services/common/load-mask.service';
import { MessagesService } from '../../services/messages.service';
import {
  EnrollmentRecord,
  V3AcademicService,
} from '../../services/v3-academic.service';
import { V3AdministrationService } from '../../services/v3-administration.service';
import { V3PortalService } from '../../services/v3-portal.service';
import { V3UnifiedAuthService } from '../../services/v3-unified-auth.service';
import { CustomTooltipDirective } from '../../shared/directives/custom-tooltip.directive';

interface GroupOption {
  readonly id: number;
  readonly label: string;
}

interface TeacherReportDef {
  readonly key: string;
  readonly title: string;
  readonly description: string;
  readonly templateName: string;
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
 * Informes y Boletines del Docente (reemplaza InformesDocentes.js y
 * BoletinesReportView.js de asaie-teachers sobre la cola BullMQ + JasperReports + S3).
 */
@Component({
  selector: 'app-teacher-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CustomTooltipDirective],
  template: `
    <div class="container-fluid py-3">
      <div class="breadcrumb-card mb-25 d-md-flex align-items-center justify-content-between">
        <div>
          <h5 class="mb-0 fw-bold">Informes y Boletines del Docente</h5>
          <small class="text-muted">Año lectivo {{ academicYear() }} · Generación oficial JasperReports + AWS S3</small>
        </div>
        <ol class="breadcrumb list-unstyled mt-0 mb-0 p-0">
          <li class="breadcrumb-item d-inline-block position-relative">
            <a routerLink="/teacher" class="d-inline-block position-relative">Portal Docente</a>
          </li>
          <li class="breadcrumb-item d-inline-block position-relative">Informes</li>
        </ol>
      </div>

      <!-- BoletinesReportView.js (6 tipos + tamaño papel + estudiante individual o grupo completo) -->
      <div class="trezo-card bg-white border-radius p-4 shadow-sm mb-4">
        <h6 class="fw-bold mb-3">Generador de Boletines Académicos</h6>
        <div class="row g-2 align-items-end mb-3">
          <div class="col-md-3">
            <label class="form-label small fw-semibold">Grupo *</label>
            <select class="form-select form-select-sm" [(ngModel)]="bulletinForm.groupId" (ngModelChange)="loadGroupStudents()">
              <option [ngValue]="0">Seleccione grupo...</option>
              @for (g of groups(); track g.id) {
                <option [ngValue]="g.id">{{ g.label }}</option>
              }
            </select>
          </div>
          <div class="col-md-2">
            <label class="form-label small fw-semibold">Periodo</label>
            <select class="form-select form-select-sm" [(ngModel)]="bulletinForm.periodNumber">
              @for (p of [1, 2, 3, 4]; track p) {
                <option [ngValue]="p">Periodo {{ p }}</option>
              }
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label small fw-semibold">Tipo de Boletín</label>
            <select class="form-select form-select-sm" [(ngModel)]="bulletinForm.bulletinType">
              <option value="boletin_areas">1. Boletín por Áreas</option>
              <option value="boletin_asignaturas">2. Boletín por Asignaturas</option>
              <option value="boletin_competencias">3. Boletín por Competencias</option>
              <option value="boletin_areas_mod2">4. Boletín Áreas Modelo 2</option>
              <option value="preinformes_periodo">5. Pre-Informe Académico</option>
              <option value="boletin_desempenos">6. Boletín por Desempeños</option>
            </select>
          </div>
          <div class="col-md-2">
            <label class="form-label small fw-semibold">Tamaño Papel</label>
            <select class="form-select form-select-sm" [(ngModel)]="bulletinForm.paperSize">
              <option value="OFICIO">Oficio</option>
              <option value="CARTA">Carta</option>
            </select>
          </div>
          <div class="col-md-2 d-grid">
            <button
              type="button"
              class="btn btn-sm btn-primary"
              [disabled]="!bulletinForm.groupId || (bulletinForm.singleStudentOnly && !bulletinForm.selectedEnrollmentId)"
              (click)="enqueueBulletin()"
            >
              <i class="material-symbols-outlined fs-6 align-middle me-1">print</i>
              Imprimir
            </button>
          </div>
        </div>

        <div class="form-check form-switch mb-2">
          <input
            class="form-check-input"
            type="checkbox"
            id="singleStudentSw"
            [(ngModel)]="bulletinForm.singleStudentOnly"
          />
          <label class="form-check-label small fw-semibold" for="singleStudentSw">
            Imprimir boletín solo para un estudiante seleccionado
          </label>
        </div>

        @if (bulletinForm.singleStudentOnly) {
          <div class="mt-2">
            <select class="form-select form-select-sm" [(ngModel)]="bulletinForm.selectedEnrollmentId">
              <option [ngValue]="0">Seleccione el estudiante del grupo...</option>
              @for (st of groupStudents(); track st.id) {
                <option [ngValue]="st.id">{{ st.studentFullName }} ({{ st.studentDocumentNumber }})</option>
              }
            </select>
          </div>
        }
      </div>

      <!-- Los 10 reportes de InformesDocentes.js -->
      <div class="d-flex justify-content-between align-items-center mb-2">
        <h6 class="fw-bold mb-0">Informes Oficiales Disponibles (10)</h6>
        <div class="d-flex align-items-center gap-2">
          <label class="small text-muted mb-0">Formato:</label>
          <select class="form-select form-select-sm w-auto" [(ngModel)]="outputFormat">
            <option value="pdf">PDF</option>
            <option value="xlsx">Excel (.xlsx)</option>
            <option value="docx">Word (.docx)</option>
          </select>
        </div>
      </div>

      <div class="row g-3 mb-4">
        @for (rep of teacherReports; track rep.key) {
          <div class="col-md-6 col-xl-4">
            <div class="trezo-card bg-white border-radius p-3 shadow-sm h-100 d-flex flex-column justify-content-between">
              <div class="d-flex gap-3">
                <span class="v3-kpi-icon kpi-primary flex-shrink-0">
                  <i class="material-symbols-outlined">{{ rep.icon }}</i>
                </span>
                <div>
                  <h6 class="fw-semibold mb-1">{{ rep.title }}</h6>
                  <p class="small text-muted mb-0">{{ rep.description }}</p>
                </div>
              </div>
              <div class="mt-3 pt-2 border-top d-flex justify-content-between align-items-center">
                <code class="small text-muted">{{ rep.templateName }}</code>
                <button
                  type="button"
                  class="btn btn-sm btn-outline-primary"
                  (click)="enqueueTeacherReport(rep)"
                  [appCustomTooltip]="'Encolar ' + rep.title"
                >
                  Generar
                </button>
              </div>
            </div>
          </div>
        }
      </div>

      @if (queuedJobs().length > 0) {
        <div class="trezo-card bg-white border-radius p-4 shadow-sm">
          <h6 class="fw-semibold mb-3">Cola de Descarga (JasperReports + S3)</h6>
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
                        [appCustomTooltip]="'Actualizar estado del reporte'"
                      >
                        <i class="material-symbols-outlined fs-6">refresh</i>
                      </button>
                      @if (job.downloadUrl) {
                        <a [href]="job.downloadUrl" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-success">
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
export class TeacherReportsComponent implements OnInit {
  private readonly portalService = inject(V3PortalService);
  private readonly academicService = inject(V3AcademicService);
  private readonly adminService = inject(V3AdministrationService);
  private readonly auth = inject(V3UnifiedAuthService);
  private readonly messages = inject(MessagesService);
  private readonly loadMask = inject(LoadMaskService);

  readonly academicYear = computed(() => this.auth.academicYear());
  readonly groups = signal<GroupOption[]>([]);
  readonly groupStudents = signal<EnrollmentRecord[]>([]);
  readonly queuedJobs = signal<QueuedReportItem[]>([]);

  outputFormat: 'pdf' | 'xlsx' | 'docx' = 'pdf';
  bulletinForm = {
    groupId: 0,
    periodNumber: 1,
    bulletinType: 'boletin_areas',
    paperSize: 'OFICIO',
    singleStudentOnly: false,
    selectedEnrollmentId: 0,
  };

  readonly teacherReports: TeacherReportDef[] = [
    { key: 'final', title: 'Informe Final de Grado', description: 'Consolidado definitivo de promoción y resultados anuales por grupo.', templateName: 'informe_final_grado', icon: 'workspace_premium' },
    { key: 'boletines', title: 'Boletines Periódicos', description: 'Impresión en lote de boletines por áreas, asignaturas y competencias.', templateName: 'boletin_carta_areas', icon: 'article' },
    { key: 'consolidado', title: 'Consolidado de Calificaciones', description: 'Sábana matricial de notas definitivas por asignatura y grupo.', templateName: 'consolidado_asignaturas', icon: 'table_chart' },
    { key: 'estadisticas', title: 'Estadísticas de Desempeño', description: 'Distribución cuantitativa por desempeño nacional (Bajo a Superior).', templateName: 'estadisticas_desempeno', icon: 'bar_chart' },
    { key: 'jornadas', title: 'Estudiantes por Jornadas', description: 'Resumen de matrícula activa agrupada por sede y jornada.', templateName: 'estudiantes_jornadas', icon: 'schedule' },
    { key: 'matriculados', title: 'Estudiantes Matriculados', description: 'Listado oficial de estudiantes con matrícula vigente en el año.', templateName: 'libro_matriculas', icon: 'groups' },
    { key: 'edades', title: 'Estadística por Edades', description: 'Distribución etaria y por sexo del estudiantado por grado.', templateName: 'estadistica_edades', icon: 'pie_chart' },
    { key: 'listas_carga', title: 'Listas con Carga Académica', description: 'Planillas auxiliares de clase vinculadas a la carga docente.', templateName: 'listas_con_carga', icon: 'fact_check' },
    { key: 'asignacion', title: 'Asignación Académica Docente', description: 'Reporte oficial de intensidad horaria y grupos asignados.', templateName: 'asignacion_academica_docente', icon: 'assignment' },
    { key: 'docentes', title: 'Listado de Docentes', description: 'Directorio del cuerpo docente activo del establecimiento.', templateName: 'listado_docentes', icon: 'school' },
  ];

  ngOnInit(): void {
    const year = this.academicYear();
    this.loadMask.show('Cargando grupos para informes...');
    forkJoin({
      courses: this.portalService.listTeacherCourses(year),
      groupManagers: this.adminService.listGroupManagers(year),
    })
      .pipe(finalize(() => this.loadMask.hide()))
      .subscribe({
        next: (res) => {
          const map = new Map<number, GroupOption>();
          for (const c of res.courses) {
            if (!map.has(c.academicGroupId)) {
              map.set(c.academicGroupId, {
                id: c.academicGroupId,
                label: `${c.gradeName}-${c.groupCode} (${c.campusName} · ${c.shiftName})`,
              });
            }
          }
          if (map.size === 0) {
            for (const g of res.groupManagers) {
              map.set(g.id, {
                id: g.id,
                label: `${g.gradeName}-${g.groupCode} (${g.campusName} · ${g.shiftName})`,
              });
            }
          }
          const list = Array.from(map.values());
          this.groups.set(list);
          if (list.length > 0) {
            this.bulletinForm.groupId = list[0].id;
            this.loadGroupStudents();
          }
        },
      });
  }

  loadGroupStudents(): void {
    this.bulletinForm.selectedEnrollmentId = 0;
    if (!this.bulletinForm.groupId) {
      this.groupStudents.set([]);
      return;
    }
    this.academicService
      .listEnrollments(this.academicYear(), Number(this.bulletinForm.groupId))
      .subscribe((list) => this.groupStudents.set(list));
  }

  enqueueBulletin(): void {
    const params: Record<string, string | number | boolean> = {
      P_YEAR: this.academicYear(),
      P_PERIOD: Number(this.bulletinForm.periodNumber),
      P_GROUP_ID: Number(this.bulletinForm.groupId),
      P_PAPER_SIZE: this.bulletinForm.paperSize,
      P_SINGLE_STUDENT: this.bulletinForm.singleStudentOnly,
    };
    if (this.bulletinForm.singleStudentOnly && this.bulletinForm.selectedEnrollmentId) {
      params['P_ENROLLMENT_ID'] = Number(this.bulletinForm.selectedEnrollmentId);
    }
    this.enqueueReport(
      this.bulletinForm.bulletinType,
      `Boletín (${this.bulletinForm.paperSize})`,
      'pdf',
      params,
    );
  }

  enqueueTeacherReport(rep: TeacherReportDef): void {
    this.enqueueReport(rep.templateName, rep.title, this.outputFormat, {
      P_YEAR: this.academicYear(),
      P_PERIOD: Number(this.bulletinForm.periodNumber),
      P_GROUP_ID: Number(this.bulletinForm.groupId),
    });
  }

  private enqueueReport(
    templateName: string,
    title: string,
    format: 'pdf' | 'xlsx' | 'docx',
    parameters: Record<string, string | number | boolean>,
  ): void {
    this.academicService
      .enqueueJasperReport({ templateName, outputFormat: format, parameters })
      .subscribe((res) => {
        this.messages.showSuccess(`Reporte "${title}" encolado (Job #${res.jobId}).`);
        this.queuedJobs.set([
          {
            jobId: res.jobId,
            title,
            format,
            state: res.status.toLowerCase(),
            downloadUrl: null,
          },
          ...this.queuedJobs(),
        ]);
      });
  }

  refreshJob(job: QueuedReportItem): void {
    this.academicService.getReportJobStatus(job.jobId).subscribe((st) => {
      this.queuedJobs.set(
        this.queuedJobs().map((item) =>
          item.jobId === job.jobId
            ? { ...item, state: st.state, downloadUrl: st.downloadUrl }
            : item,
        ),
      );
    });
  }
}
