import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import * as XLSX from 'xlsx';
import { LoadMaskService } from '../../services/common/load-mask.service';
import { MessagesService } from '../../services/messages.service';
import {
  CourseGradebookView,
  PreReportRow,
  StudentAbsenceRow,
  TeacherCourseSummary,
  V3PortalService,
} from '../../services/v3-portal.service';
import { V3UnifiedAuthService } from '../../services/v3-unified-auth.service';
import { CustomTooltipDirective } from '../../shared/directives/custom-tooltip.directive';

type GradebookTab = 'scores' | 'preReports' | 'absences';

/**
 * Planilla Docente Interactiva de Calificaciones, Preinformes e Inasistencias
 * (reemplaza NotasView, PreinformesView y AusenciasView de ExtJS / asaie-teachers).
 */
@Component({
  selector: 'app-teacher-gradebook',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CustomTooltipDirective],
  template: `
    <div class="container-fluid py-3">
      <div class="breadcrumb-card mb-25 d-md-flex align-items-center justify-content-between">
        <div>
          <h5 class="mb-0 fw-bold">Planilla de Calificaciones, Preinformes y Asistencia</h5>
          <small class="text-muted">Año lectivo {{ academicYear() }} · Periodo {{ selectedPeriod }}</small>
        </div>
        <ol class="breadcrumb list-unstyled mt-0 mb-0 p-0">
          <li class="breadcrumb-item d-inline-block position-relative">
            <a routerLink="/teacher" class="d-inline-block position-relative">Portal Docente</a>
          </li>
          <li class="breadcrumb-item d-inline-block position-relative">Planilla</li>
        </ol>
      </div>

      <div class="trezo-card bg-white border-radius p-4 shadow-sm mb-4">
        <div class="row g-2 align-items-end">
          <div class="col-md-5">
            <label class="form-label small fw-semibold">Curso / Asignatura *</label>
            <select class="form-select form-select-sm" [(ngModel)]="selectedCourseId" (ngModelChange)="loadCourseData()">
              <option [ngValue]="0">Seleccione curso...</option>
              @for (c of courses(); track c.id) {
                <option [ngValue]="c.id">{{ c.gradeName }}-{{ c.groupCode }} · {{ c.subjectName }} ({{ c.campusName }})</option>
              }
            </select>
          </div>
          <div class="col-md-2">
            <label class="form-label small fw-semibold">Periodo</label>
            <select class="form-select form-select-sm" [(ngModel)]="selectedPeriod" (ngModelChange)="loadCourseData()">
              @for (p of [1, 2, 3, 4]; track p) {
                <option [ngValue]="p">Periodo {{ p }}</option>
              }
            </select>
          </div>
          <div class="col-md-5 d-flex flex-wrap gap-2 justify-content-md-end">
            <button
              type="button"
              class="btn btn-sm btn-outline-success"
              [disabled]="!gradebook() || gradebook()!.students.length === 0"
              (click)="exportExcel()"
              [appCustomTooltip]="'Exportar planilla actual a Excel (.xlsx)'"
            >
              <i class="material-symbols-outlined fs-6 align-middle me-1">table_view</i>
              Exportar Excel
            </button>
            <button
              type="button"
              class="btn btn-sm btn-primary"
              [disabled]="!gradebook() || gradebook()!.isPeriodClosed || gradebook()!.students.length === 0"
              (click)="saveAllGrades()"
            >
              <i class="material-symbols-outlined fs-6 align-middle me-1">save</i>
              Guardar Planilla
            </button>
          </div>
        </div>
      </div>

      <ul class="nav nav-pills mb-3 gap-2">
        <li class="nav-item">
          <button type="button" class="nav-link" [class.active]="activeTab() === 'scores'" (click)="activeTab.set('scores')">
            Planilla de Notas ({{ gradebook()?.students?.length ?? 0 }})
          </button>
        </li>
        <li class="nav-item">
          <button type="button" class="nav-link" [class.active]="activeTab() === 'preReports'" (click)="activeTab.set('preReports')">
            Preinformes ({{ preReports().length }})
          </button>
        </li>
        <li class="nav-item">
          <button type="button" class="nav-link" [class.active]="activeTab() === 'absences'" (click)="activeTab.set('absences')">
            Inasistencias ({{ absences().length }})
          </button>
        </li>
      </ul>

      <div class="trezo-card bg-white border-radius p-4 shadow-sm">
        @if (gradebook()?.isPeriodClosed) {
          <div class="alert alert-warning py-2 small">
            Este periodo académico se encuentra cerrado; la planilla es de solo lectura.
          </div>
        }

        @switch (activeTab()) {
          @case ('scores') {
            <div class="table-responsive">
              <table class="table table-sm table-hover v3-grid-table mb-0">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Estudiante</th>
                    <th style="width: 90px;">Saber</th>
                    <th style="width: 90px;">Hacer</th>
                    <th style="width: 90px;">Ser</th>
                    <th style="width: 90px;">Eval.</th>
                    <th style="width: 95px;">Definitiva</th>
                    <th style="width: 90px;">Recup.</th>
                    <th style="width: 75px;">Faltas</th>
                    <th>Observación</th>
                  </tr>
                </thead>
                <tbody>
                  @for (st of gradebook()?.students ?? []; track st.enrollmentId; let i = $index) {
                    <tr>
                      <td class="text-muted small">{{ i + 1 }}</td>
                      <td>
                        <div class="fw-semibold small">{{ st.studentFullName }}</div>
                        <small class="text-muted font-monospace">{{ st.studentDocumentNumber }}</small>
                      </td>
                      <td>
                        <input type="number" step="0.1" min="0" max="100" class="form-control form-control-sm" [(ngModel)]="st.conceptualScore" [disabled]="st.isLocked || gradebook()!.isPeriodClosed" (ngModelChange)="recalcRow(st)" />
                      </td>
                      <td>
                        <input type="number" step="0.1" min="0" max="100" class="form-control form-control-sm" [(ngModel)]="st.proceduralScore" [disabled]="st.isLocked || gradebook()!.isPeriodClosed" (ngModelChange)="recalcRow(st)" />
                      </td>
                      <td>
                        <input type="number" step="0.1" min="0" max="100" class="form-control form-control-sm" [(ngModel)]="st.attitudinalScore" [disabled]="st.isLocked || gradebook()!.isPeriodClosed" (ngModelChange)="recalcRow(st)" />
                      </td>
                      <td>
                        <input type="number" step="0.1" min="0" max="100" class="form-control form-control-sm" [(ngModel)]="st.evaluationExamScore" [disabled]="st.isLocked || gradebook()!.isPeriodClosed" (ngModelChange)="recalcRow(st)" />
                      </td>
                      <td>
                        <input type="number" step="0.1" min="0" max="100" class="form-control form-control-sm fw-bold" [(ngModel)]="st.finalScore" [disabled]="st.isLocked || gradebook()!.isPeriodClosed" />
                      </td>
                      <td>
                        <input type="number" step="0.1" min="0" max="100" class="form-control form-control-sm" [(ngModel)]="st.recoveryScore" [disabled]="st.isLocked || gradebook()!.isPeriodClosed" />
                      </td>
                      <td>
                        <input type="number" min="0" class="form-control form-control-sm" [(ngModel)]="st.unjustifiedAbsences" [disabled]="st.isLocked || gradebook()!.isPeriodClosed" />
                      </td>
                      <td>
                        <input type="text" class="form-control form-control-sm" [(ngModel)]="st.teacherObservations" [disabled]="st.isLocked || gradebook()!.isPeriodClosed" placeholder="Observación..." />
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="10" class="text-center text-muted py-4">Seleccione un curso con estudiantes matriculados.</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }

          @case ('preReports') {
            <div class="row g-2 align-items-end mb-4 p-3 rounded bg-light border">
              <div class="col-md-4">
                <label class="form-label small fw-semibold">Estudiante *</label>
                <select class="form-select form-select-sm" [(ngModel)]="preReportForm.enrollmentId">
                  <option [ngValue]="0">Seleccione...</option>
                  @for (st of gradebook()?.students ?? []; track st.enrollmentId) {
                    <option [ngValue]="st.enrollmentId">{{ st.studentFullName }}</option>
                  }
                </select>
              </div>
              <div class="col-md-2">
                <label class="form-label small fw-semibold">Nota parcial *</label>
                <input type="number" step="0.1" class="form-control form-control-sm" [(ngModel)]="preReportForm.partialScore" />
              </div>
              <div class="col-md-4">
                <label class="form-label small fw-semibold">Alerta / Recomendación</label>
                <input type="text" class="form-control form-control-sm" [(ngModel)]="preReportForm.observations" placeholder="Ej. Reforzar talleres de álgebra..." />
              </div>
              <div class="col-md-2 d-grid">
                <button type="button" class="btn btn-sm btn-primary" [disabled]="!selectedCourseId || !preReportForm.enrollmentId" (click)="savePreReport()">
                  Registrar
                </button>
              </div>
            </div>

            <div class="table-responsive">
              <table class="table table-hover v3-grid-table mb-0">
                <thead>
                  <tr>
                    <th>Estudiante</th>
                    <th class="text-center">Nota Parcial</th>
                    <th>Observación Preventiva</th>
                  </tr>
                </thead>
                <tbody>
                  @for (pr of preReports(); track pr.id) {
                    <tr>
                      <td class="fw-semibold">{{ pr.studentFullName }}</td>
                      <td class="text-center fw-bold text-warning">{{ pr.partialScore }}</td>
                      <td class="small">{{ pr.observations || '—' }}</td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="3" class="text-center text-muted py-3">Sin preinformes registrados.</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }

          @case ('absences') {
            <div class="row g-2 align-items-end mb-4 p-3 rounded bg-light border">
              <div class="col-md-3">
                <label class="form-label small fw-semibold">Estudiante *</label>
                <select class="form-select form-select-sm" [(ngModel)]="absenceForm.enrollmentId">
                  <option [ngValue]="0">Seleccione...</option>
                  @for (st of gradebook()?.students ?? []; track st.enrollmentId) {
                    <option [ngValue]="st.enrollmentId">{{ st.studentFullName }}</option>
                  }
                </select>
              </div>
              <div class="col-md-2">
                <label class="form-label small fw-semibold">Fecha *</label>
                <input type="date" class="form-control form-control-sm" [(ngModel)]="absenceForm.absenceDate" />
              </div>
              <div class="col-md-1">
                <label class="form-label small fw-semibold">Horas</label>
                <input type="number" min="1" max="12" class="form-control form-control-sm" [(ngModel)]="absenceForm.hoursMissed" />
              </div>
              <div class="col-md-2">
                <div class="form-check form-switch">
                  <input class="form-check-input" type="checkbox" id="absJust" [(ngModel)]="absenceForm.isJustified" />
                  <label class="form-check-label small" for="absJust">Justificada</label>
                </div>
              </div>
              <div class="col-md-2">
                <label class="form-label small fw-semibold">Soporte</label>
                <input type="text" class="form-control form-control-sm" [(ngModel)]="absenceForm.justificationNotes" placeholder="Excusa médica..." />
              </div>
              <div class="col-md-2 d-grid">
                <button type="button" class="btn btn-sm btn-primary" [disabled]="!selectedCourseId || !absenceForm.enrollmentId" (click)="recordAbsence()">
                  Registrar Falta
                </button>
              </div>
            </div>

            <div class="table-responsive">
              <table class="table table-hover v3-grid-table mb-0">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Estudiante</th>
                    <th class="text-center">Horas</th>
                    <th class="text-center">Tipo</th>
                    <th>Nota</th>
                    <th class="text-end">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  @for (ab of absences(); track ab.id) {
                    <tr>
                      <td class="small">{{ ab.absenceDate }}</td>
                      <td class="fw-semibold">{{ ab.studentFullName }}</td>
                      <td class="text-center">{{ ab.hoursMissed }}</td>
                      <td class="text-center">
                        <span class="badge" [ngClass]="ab.isJustified ? 'text-bg-info' : 'text-bg-danger'">
                          {{ ab.isJustified ? 'Justificada' : 'Injustificada' }}
                        </span>
                      </td>
                      <td class="small">{{ ab.justificationNotes || '—' }}</td>
                      <td class="text-end">
                        <button type="button" class="btn btn-sm btn-outline-danger" (click)="deleteAbsence(ab.id)" [appCustomTooltip]="'Eliminar inasistencia'">
                          <i class="material-symbols-outlined fs-6">delete</i>
                        </button>
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="6" class="text-center text-muted py-3">Sin inasistencias registradas.</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        }
      </div>
    </div>
  `,
})
export class TeacherGradebookComponent implements OnInit {
  private readonly portalService = inject(V3PortalService);
  private readonly auth = inject(V3UnifiedAuthService);
  private readonly messages = inject(MessagesService);
  private readonly loadMask = inject(LoadMaskService);

  readonly academicYear = computed(() => this.auth.academicYear());
  readonly activeTab = signal<GradebookTab>('scores');
  readonly courses = signal<TeacherCourseSummary[]>([]);
  readonly gradebook = signal<CourseGradebookView | null>(null);
  readonly preReports = signal<PreReportRow[]>([]);
  readonly absences = signal<StudentAbsenceRow[]>([]);

  selectedCourseId = 0;
  selectedPeriod = 1;

  preReportForm = { enrollmentId: 0, partialScore: 2.5, observations: '' };
  absenceForm = {
    enrollmentId: 0,
    absenceDate: new Date().toISOString().slice(0, 10),
    hoursMissed: 1,
    isJustified: false,
    justificationNotes: '',
  };

  ngOnInit(): void {
    this.portalService.listTeacherCourses(this.academicYear()).subscribe((rows) => {
      this.courses.set(rows);
      if (rows.length > 0) {
        this.selectedCourseId = rows[0].id;
        this.loadCourseData();
      }
    });
  }

  loadCourseData(): void {
    if (!this.selectedCourseId) return;
    this.loadMask.show('Cargando planilla...');
    const year = this.academicYear();
    forkJoin({
      gradebook: this.portalService.getCourseGradebook(
        this.selectedCourseId,
        year,
        this.selectedPeriod,
      ),
      preReports: this.portalService.listPreReports(
        this.selectedCourseId,
        year,
        this.selectedPeriod,
      ),
      absences: this.portalService.listAbsences(
        this.selectedCourseId,
        this.selectedPeriod,
      ),
    })
      .pipe(finalize(() => this.loadMask.hide()))
      .subscribe({
        next: (res) => {
          this.gradebook.set(res.gradebook);
          this.preReports.set(res.preReports);
          this.absences.set(res.absences);
        },
      });
  }

  recalcRow(st: {
    conceptualScore: number;
    proceduralScore: number;
    attitudinalScore: number;
    evaluationExamScore: number;
    finalScore: number;
  }): void {
    const scores = [
      Number(st.conceptualScore || 0),
      Number(st.proceduralScore || 0),
      Number(st.attitudinalScore || 0),
      Number(st.evaluationExamScore || 0),
    ].filter((v) => v > 0);
    if (scores.length > 0) {
      st.finalScore = Number(
        (scores.reduce((acc, v) => acc + v, 0) / scores.length).toFixed(2),
      );
    }
  }

  saveAllGrades(): void {
    const gb = this.gradebook();
    if (!gb || gb.students.length === 0) return;
    this.loadMask.show('Guardando calificaciones...');
    this.portalService
      .saveGradebookBatch(this.selectedCourseId, {
        academicYear: this.academicYear(),
        periodNumber: this.selectedPeriod,
        rows: gb.students.map((s) => ({
          enrollmentId: s.enrollmentId,
          conceptualScore: Number(s.conceptualScore || 0),
          proceduralScore: Number(s.proceduralScore || 0),
          attitudinalScore: Number(s.attitudinalScore || 0),
          evaluationExamScore: Number(s.evaluationExamScore || 0),
          finalScore: Number(s.finalScore || 0),
          recoveryScore: Number(s.recoveryScore || 0),
          levelingScore: Number(s.levelingScore || 0),
          justifiedAbsences: Number(s.justifiedAbsences || 0),
          unjustifiedAbsences: Number(s.unjustifiedAbsences || 0),
          lateArrivals: Number(s.lateArrivals || 0),
          teacherObservations: s.teacherObservations || null,
          hasPreReportAlert: s.hasPreReportAlert,
        })),
      })
      .pipe(finalize(() => this.loadMask.hide()))
      .subscribe({
        next: ({ savedCount }) => {
          this.messages.showSuccess(`Planilla guardada (${savedCount} estudiantes).`);
          this.loadCourseData();
        },
      });
  }

  exportExcel(): void {
    const gb = this.gradebook();
    if (!gb) return;
    const sheetData = gb.students.map((s, idx) => ({
      No: idx + 1,
      Documento: s.studentDocumentNumber,
      Estudiante: s.studentFullName,
      Saber: s.conceptualScore,
      Hacer: s.proceduralScore,
      Ser: s.attitudinalScore,
      Evaluacion: s.evaluationExamScore,
      Definitiva: s.finalScore,
      Recuperacion: s.recoveryScore,
      Faltas: s.unjustifiedAbsences,
      Observaciones: s.teacherObservations ?? '',
    }));
    const ws = XLSX.utils.json_to_sheet(sheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `P${this.selectedPeriod}`);
    XLSX.writeFile(
      wb,
      `planilla_${gb.course.gradeName}_${gb.course.groupCode}_P${this.selectedPeriod}.xlsx`,
    );
  }

  savePreReport(): void {
    this.portalService
      .upsertPreReport(this.selectedCourseId, {
        academicYear: this.academicYear(),
        enrollmentId: Number(this.preReportForm.enrollmentId),
        periodNumber: this.selectedPeriod,
        partialScore: Number(this.preReportForm.partialScore),
        observations: this.preReportForm.observations.trim() || null,
      })
      .subscribe(() => {
        this.messages.showSuccess('Preinforme registrado.');
        this.preReportForm.observations = '';
        this.loadCourseData();
      });
  }

  recordAbsence(): void {
    this.portalService
      .recordAbsence({
        enrollmentId: Number(this.absenceForm.enrollmentId),
        courseAssignmentId: this.selectedCourseId,
        periodNumber: this.selectedPeriod,
        absenceDate: this.absenceForm.absenceDate,
        hoursMissed: Number(this.absenceForm.hoursMissed) || 1,
        isJustified: this.absenceForm.isJustified,
        justificationNotes: this.absenceForm.justificationNotes.trim() || null,
      })
      .subscribe(() => {
        this.messages.showSuccess('Inasistencia registrada.');
        this.loadCourseData();
      });
  }

  deleteAbsence(id: number): void {
    this.portalService.deleteAbsence(id).subscribe(() => {
      this.messages.showSuccess('Inasistencia eliminada.');
      this.loadCourseData();
    });
  }
}
