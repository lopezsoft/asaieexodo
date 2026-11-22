import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { LoadMaskService } from '../../services/common/load-mask.service';
import { MessagesService } from '../../services/messages.service';
import { V3AcademicService } from '../../services/v3-academic.service';
import {
  TeacherCourseSummary,
  TeacherLevelingCandidateRow,
  V3PortalService,
} from '../../services/v3-portal.service';
import { V3UnifiedAuthService } from '../../services/v3-unified-auth.service';
import {
  SearchableSelectOption,
  V3SearchableSelectComponent,
} from '../../shared/components/v3-searchable-select/v3-searchable-select.component';
import { CustomTooltipDirective } from '../../shared/directives/custom-tooltip.directive';

type LevelingTab = 'periodic' | 'final';

interface ReportJobState {
  readonly jobId: string;
  readonly title: string;
  readonly state: string;
  readonly downloadUrl: string | null;
}

/**
 * Módulo de Nivelaciones Periódicas y Recuperaciones Finales del Docente
 * (reemplaza PlanMejoramiento.js, PeriodicTeacherLeveling.js,
 * CargarNivelaciones.js y RecuperacionesFinalesView.js de asaie-teachers).
 */
@Component({
  selector: 'app-teacher-levelings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, V3SearchableSelectComponent, CustomTooltipDirective],
  template: `
    <div class="container-fluid py-3">
      <div class="breadcrumb-card mb-25 d-md-flex align-items-center justify-content-between">
        <div>
          <h5 class="mb-0 fw-bold">Plan de Mejoramiento y Nivelaciones</h5>
          <small class="text-muted">
            Año lectivo {{ academicYear() }} · Nota mínima aprobatoria: {{ minPassingScore() }} ·
            Tope máximo de nivelación: {{ maxRecoveryScore() }}
          </small>
        </div>
        <ol class="breadcrumb list-unstyled mt-0 mb-0 p-0">
          <li class="breadcrumb-item d-inline-block position-relative">
            <a routerLink="/teacher" class="d-inline-block position-relative">Portal Docente</a>
          </li>
          <li class="breadcrumb-item d-inline-block position-relative">Nivelaciones</li>
        </ol>
      </div>

      <ul class="nav nav-pills mb-3 gap-2">
        <li class="nav-item">
          <button
            type="button"
            class="nav-link"
            [class.active]="activeTab() === 'periodic'"
            (click)="switchTab('periodic')"
          >
            Nivelaciones Periódicas ({{ periodicRows().length }})
          </button>
        </li>
        <li class="nav-item">
          <button
            type="button"
            class="nav-link"
            [class.active]="activeTab() === 'final'"
            (click)="switchTab('final')"
          >
            Recuperaciones de Fin de Año ({{ finalRows().length }})
          </button>
        </li>
      </ul>

      @if (activeTab() === 'periodic') {
        <div class="trezo-card bg-white border-radius p-4 shadow-sm mb-4">
          <div class="row g-3">
            <div class="col-12 col-md-6">
              <label class="form-label">Curso / Asignatura *</label>
              <app-v3-searchable-select
                [(ngModel)]="selectedCourseId"
                [options]="courseSelectOptions()"
                [clearable]="true"
                placeholder="Seleccione curso..."
                searchPlaceholder="Buscar curso o sede..."
                (ngModelChange)="loadPeriodicLevelings()"
              />
            </div>
            <div class="col-12 col-md-6">
              <label class="form-label">Periodo</label>
              <app-v3-searchable-select
                [(ngModel)]="selectedPeriod"
                [options]="periodOptions"
                placeholder="Periodo..."
                searchPlaceholder="Buscar periodo..."
                (ngModelChange)="loadPeriodicLevelings()"
              />
            </div>
            <div class="col-12 d-flex flex-wrap gap-2 justify-content-end">
              <button
                type="button"
                class="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
                [disabled]="!selectedCourseId"
                (click)="printReport('nivelaciones_periodicas', 'Acta de Nivelaciones Periódicas')"
                [appCustomTooltip]="'Generar acta oficial de nivelaciones periódicas en PDF'"
              >
                <i class="material-symbols-outlined fs-6">print</i>
                <span>Acta PDF</span>
              </button>
              <button
                type="button"
                class="btn btn-sm btn-primary d-inline-flex align-items-center gap-1"
                [disabled]="periodicRows().length === 0"
                (click)="savePeriodicBatch()"
              >
                <i class="material-symbols-outlined fs-6">save</i>
                <span>Guardar Nivelaciones</span>
              </button>
            </div>
          </div>
        </div>

        <div class="trezo-card bg-white border-radius p-4 shadow-sm">
          <div class="alert alert-info py-2 small mb-3">
            Se listan automáticamente los estudiantes con calificación inferior a
            <strong>{{ minPassingScore() }}</strong> en el periodo seleccionado.
            La nota nivelada debe estar entre la nota anterior y <strong>{{ maxRecoveryScore() }}</strong>.
          </div>

          <div class="table-responsive">
            <table class="table table-sm table-hover v3-grid-table mb-0">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Estudiante</th>
                  <th class="text-center">Nota Anterior</th>
                  <th style="width: 115px;">Nota Nivelada</th>
                  <th style="width: 140px;">Fecha</th>
                  <th style="width: 110px;">N° Acta</th>
                  <th>Observaciones</th>
                  <th class="text-center">Estado</th>
                </tr>
              </thead>
              <tbody>
                @for (row of periodicRows(); track row.enrollmentId; let i = $index) {
                  <tr>
                    <td class="text-muted small">{{ i + 1 }}</td>
                    <td>
                      <div class="fw-semibold small">{{ row.studentFullName }}</div>
                      <small class="text-muted font-monospace">{{ row.studentDocumentNumber }}</small>
                    </td>
                    <td class="text-center fw-bold text-danger">{{ row.previousScore }}</td>
                    <td>
                      <input
                        type="number"
                        step="0.1"
                        [min]="row.previousScore"
                        [max]="maxRecoveryScore()"
                        class="form-control form-control-sm fw-semibold"
                        [(ngModel)]="row.recoveryScore"
                      />
                    </td>
                    <td>
                      <input type="date" class="form-control form-control-sm" [(ngModel)]="row.recoveryDate" />
                    </td>
                    <td>
                      <input type="text" class="form-control form-control-sm" [(ngModel)]="row.actNumber" placeholder="ACT-01" />
                    </td>
                    <td>
                      <input type="text" class="form-control form-control-sm" [(ngModel)]="row.observations" placeholder="Actividades de apoyo realizadas..." />
                    </td>
                    <td class="text-center">
                      @if (isInvalidScore(row)) {
                        <span class="badge text-bg-danger" [appCustomTooltip]="'Fuera de rango permitido'">Inválida</span>
                      } @else if (row.recoveryScore >= minPassingScore()) {
                        <span class="badge text-bg-success">Supera</span>
                      } @else {
                        <span class="badge text-bg-warning">Pendiente</span>
                      }
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="8" class="text-center text-muted py-4">
                      No se encontraron estudiantes reprobados en este curso y periodo.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      } @else {
        <div class="trezo-card bg-white border-radius p-4 shadow-sm">
          <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
            <div>
              <h6 class="fw-semibold mb-0">Estudiantes Reprobados al Cierre del Año ({{ academicYear() }})</h6>
              <small class="text-muted">Consolidado anual de asignaturas asignadas al docente con promedio menor a {{ minPassingScore() }}</small>
            </div>
            <div class="d-flex gap-2">
              <button
                type="button"
                class="btn btn-sm btn-outline-secondary"
                (click)="printReport('recuperaciones_finales', 'Acta de Recuperaciones Finales')"
                [appCustomTooltip]="'Generar acta PDF de recuperaciones de fin de año'"
              >
                <i class="material-symbols-outlined fs-6 align-middle me-1">print</i>
                Acta Final PDF
              </button>
              <button
                type="button"
                class="btn btn-sm btn-primary"
                [disabled]="finalRows().length === 0"
                (click)="saveFinalBatch()"
              >
                <i class="material-symbols-outlined fs-6 align-middle me-1">save</i>
                Guardar Recuperaciones Finales
              </button>
            </div>
          </div>

          <div class="table-responsive">
            <table class="table table-sm table-hover v3-grid-table mb-0">
              <thead>
                <tr>
                  <th>Grupo</th>
                  <th>Asignatura</th>
                  <th>Estudiante</th>
                  <th class="text-center">Def. Anual</th>
                  <th style="width: 115px;">Nivelación</th>
                  <th style="width: 140px;">Fecha</th>
                  <th style="width: 110px;">N° Acta</th>
                  <th>Observaciones</th>
                </tr>
              </thead>
              <tbody>
                @for (row of finalRows(); track row.enrollmentId + '-' + row.courseAssignmentId) {
                  <tr>
                    <td><span class="badge text-bg-primary">{{ row.gradeName }}-{{ row.groupCode }}</span></td>
                    <td class="small fw-semibold">{{ row.subjectName }}</td>
                    <td>
                      <div class="fw-semibold small">{{ row.studentFullName }}</div>
                      <small class="text-muted font-monospace">{{ row.studentDocumentNumber }}</small>
                    </td>
                    <td class="text-center fw-bold text-danger">{{ row.previousScore }}</td>
                    <td>
                      <input
                        type="number"
                        step="0.1"
                        [min]="row.previousScore"
                        [max]="maxRecoveryScore()"
                        class="form-control form-control-sm fw-semibold"
                        [(ngModel)]="row.recoveryScore"
                      />
                    </td>
                    <td>
                      <input type="date" class="form-control form-control-sm" [(ngModel)]="row.recoveryDate" />
                    </td>
                    <td>
                      <input type="text" class="form-control form-control-sm" [(ngModel)]="row.actNumber" placeholder="ACT-FIN" />
                    </td>
                    <td>
                      <input type="text" class="form-control form-control-sm" [(ngModel)]="row.observations" placeholder="Concepto final..." />
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="8" class="text-center text-muted py-4">
                      No hay estudiantes pendientes de recuperación final en {{ academicYear() }}.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      @if (reportJobs().length > 0) {
        <div class="trezo-card bg-white border-radius p-3 shadow-sm mt-4">
          <h6 class="fw-semibold mb-2">Actas PDF Generadas (JasperReports + S3)</h6>
          <div class="d-flex flex-column gap-2">
            @for (job of reportJobs(); track job.jobId) {
              <div class="d-flex justify-content-between align-items-center border rounded px-3 py-2 small">
                <div>
                  <strong>{{ job.title }}</strong>
                  <span class="badge text-bg-light border text-dark ms-2">{{ job.state }}</span>
                </div>
                <div class="d-flex gap-2">
                  <button type="button" class="btn btn-sm btn-outline-secondary" (click)="refreshJob(job)">
                    Actualizar
                  </button>
                  @if (job.downloadUrl) {
                    <a [href]="job.downloadUrl" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-success">
                      Descargar PDF
                    </a>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class TeacherLevelingsComponent implements OnInit {
  private readonly portalService = inject(V3PortalService);
  private readonly academicService = inject(V3AcademicService);
  private readonly auth = inject(V3UnifiedAuthService);
  private readonly messages = inject(MessagesService);
  private readonly loadMask = inject(LoadMaskService);
  private readonly route = inject(ActivatedRoute);

  readonly academicYear = computed(() => this.auth.academicYear());
  readonly activeTab = signal<LevelingTab>('periodic');
  readonly courses = signal<TeacherCourseSummary[]>([]);
  readonly periodicRows = signal<TeacherLevelingCandidateRow[]>([]);
  readonly finalRows = signal<TeacherLevelingCandidateRow[]>([]);
  readonly minPassingScore = signal(3.0);
  readonly maxRecoveryScore = signal(3.5);
  readonly reportJobs = signal<ReportJobState[]>([]);

  readonly periodOptions: SearchableSelectOption<number>[] = [1, 2, 3, 4].map((p) => ({
    value: p,
    label: `Periodo ${p}`,
  }));
  readonly courseSelectOptions = computed<SearchableSelectOption<number>[]>(() =>
    this.courses().map((c) => ({
      value: c.id,
      label: `${c.gradeName}-${c.groupCode} · ${c.subjectName} (${c.campusName})`,
    }))
  );

  selectedCourseId = 0;
  selectedPeriod = 1;

  ngOnInit(): void {
    const queryCourseId = Number(this.route.snapshot.queryParamMap.get('courseId') || 0);
    this.portalService.listTeacherCourses(this.academicYear()).subscribe((rows) => {
      this.courses.set(rows);
      if (queryCourseId && rows.some((r) => r.id === queryCourseId)) {
        this.selectedCourseId = queryCourseId;
      } else if (rows.length > 0) {
        this.selectedCourseId = rows[0].id;
      }
      if (this.selectedCourseId) {
        this.loadPeriodicLevelings();
      }
    });
  }

  switchTab(tab: LevelingTab): void {
    this.activeTab.set(tab);
    if (tab === 'final' && this.finalRows().length === 0) {
      this.loadFinalLevelings();
    }
  }

  loadPeriodicLevelings(): void {
    if (!this.selectedCourseId) return;
    this.loadMask.show('Cargando estudiantes reprobados...');
    this.portalService
      .listPeriodicLevelings(
        Number(this.selectedCourseId),
        this.academicYear(),
        Number(this.selectedPeriod),
      )
      .pipe(finalize(() => this.loadMask.hide()))
      .subscribe({
        next: (view) => {
          this.minPassingScore.set(view.minPassingScore);
          this.maxRecoveryScore.set(view.maxRecoveryScore);
          this.periodicRows.set(
            view.rows.map((r) => ({
              ...r,
              recoveryDate: r.recoveryDate || new Date().toISOString().slice(0, 10),
            })),
          );
        },
      });
  }

  loadFinalLevelings(): void {
    this.loadMask.show('Cargando recuperaciones finales...');
    this.portalService
      .listFinalLevelings(this.academicYear())
      .pipe(finalize(() => this.loadMask.hide()))
      .subscribe({
        next: (view) => {
          this.minPassingScore.set(view.minPassingScore);
          this.maxRecoveryScore.set(view.maxRecoveryScore);
          this.finalRows.set(
            view.rows.map((r) => ({
              ...r,
              recoveryDate: r.recoveryDate || new Date().toISOString().slice(0, 10),
            })),
          );
        },
      });
  }

  isInvalidScore(row: TeacherLevelingCandidateRow): boolean {
    const score = Number(row.recoveryScore || 0);
    if (score === 0) return false;
    return score < row.previousScore || score > this.maxRecoveryScore();
  }

  savePeriodicBatch(): void {
    this.saveBatch('PERIOD_RECOVERY', this.periodicRows());
  }

  saveFinalBatch(): void {
    this.saveBatch('FINAL_RECOVERY', this.finalRows());
  }

  private saveBatch(
    recoveryType: 'PERIOD_RECOVERY' | 'FINAL_RECOVERY',
    rows: TeacherLevelingCandidateRow[],
  ): void {
    const dirtyRows = rows.filter((r) => Number(r.recoveryScore || 0) > 0);
    if (dirtyRows.length === 0) {
      this.messages.showWarning('Digite al menos una nota de nivelación mayor a 0.');
      return;
    }
    const invalid = dirtyRows.find((r) => this.isInvalidScore(r));
    if (invalid) {
      this.messages.showError(
        `La nota de ${invalid.studentFullName} (${invalid.recoveryScore}) debe estar entre ${invalid.previousScore} y ${this.maxRecoveryScore()}.`,
      );
      return;
    }

    this.loadMask.show('Guardando nivelaciones...');
    this.portalService
      .saveLevelingsBatch({
        academicYear: this.academicYear(),
        recoveryType,
        rows: dirtyRows.map((r) => ({
          enrollmentId: r.enrollmentId,
          courseAssignmentId: r.courseAssignmentId,
          periodNumber: r.periodNumber,
          previousScore: Number(r.previousScore),
          recoveryScore: Number(r.recoveryScore),
          recoveryDate: r.recoveryDate || null,
          actNumber: r.actNumber?.trim() || null,
          observations: r.observations?.trim() || null,
        })),
      })
      .pipe(finalize(() => this.loadMask.hide()))
      .subscribe({
        next: ({ savedCount }) => {
          this.messages.showSuccess(`Se registraron ${savedCount} nivelaciones correctamente.`);
          if (recoveryType === 'PERIOD_RECOVERY') {
            this.loadPeriodicLevelings();
          } else {
            this.loadFinalLevelings();
          }
        },
      });
  }

  printReport(templateName: string, title: string): void {
    this.academicService
      .enqueueJasperReport({
        templateName,
        outputFormat: 'pdf',
        parameters: {
          P_YEAR: this.academicYear(),
          P_PERIOD: this.selectedPeriod,
          P_COURSE_ID: this.selectedCourseId,
        },
      })
      .subscribe((res) => {
        this.messages.showSuccess(`${title} encolada (Job #${res.jobId}).`);
        this.reportJobs.set([
          { jobId: res.jobId, title, state: res.status.toLowerCase(), downloadUrl: null },
          ...this.reportJobs(),
        ]);
      });
  }

  refreshJob(job: ReportJobState): void {
    this.academicService.getReportJobStatus(job.jobId).subscribe((st) => {
      this.reportJobs.set(
        this.reportJobs().map((item) =>
          item.jobId === job.jobId
            ? { ...item, state: st.state, downloadUrl: st.downloadUrl }
            : item,
        ),
      );
    });
  }
}
