import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize, forkJoin, Observable, of } from 'rxjs';
import * as XLSX from 'xlsx';
import { LoadMaskService } from '../../services/common/load-mask.service';
import { MessagesService } from '../../services/messages.service';
import {
  AchievementStandardRow,
  CourseGradebookView,
  GradeAchievementAssignedRow,
  GradebookStudentRow,
  PreReportRow,
  StudentAbsenceRow,
  TeacherCourseSummary,
  TeacherGradebookColumnRow,
  V3PortalService,
} from '../../services/v3-portal.service';
import {
  EvaluationDimensionRecord,
  V3SettingsService,
} from '../../services/v3-settings.service';
import { V3UnifiedAuthService } from '../../services/v3-unified-auth.service';
import { V3ModalDialogComponent } from '../../shared/components/v3-modal-dialog/v3-modal-dialog.component';
import { CustomTooltipDirective } from '../../shared/directives/custom-tooltip.directive';

type GradebookTab = 'scores' | 'preReports' | 'absences';
type GenderFilter = 'ALL' | 'M' | 'F';

/**
 * Planilla Docente Interactiva de Calificaciones con columnas dinámicas n1..n30,
 * filtro por sexo, autoguardado con temporizador, sincronización y asignación de
 * descriptores/sugerencias, importar/exportar Excel, preinformes e inasistencias
 * (paridad 100% con NotasAcademicasDocentes, ConfigColumnView, LogrosNotasView,
 * SugerenciasEstudiantesView, Preinforme y AusenciasView de asaie-teachers).
 */
@Component({
  selector: 'app-teacher-gradebook',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    CustomTooltipDirective,
    V3ModalDialogComponent,
  ],
  template: `
    <div class="container-fluid py-3">
      <div class="breadcrumb-card mb-25 d-md-flex align-items-center justify-content-between">
        <div>
          <h5 class="mb-0 fw-bold">Planilla de Calificaciones, Columnas, Preinformes y Asistencia</h5>
          <small class="text-muted">
            Año lectivo {{ academicYear() }} · Periodo {{ selectedPeriod }} ·
            {{ columns().length }} columna(s) dinámica(s) configurada(s)
          </small>
        </div>
        <ol class="breadcrumb list-unstyled mt-0 mb-0 p-0">
          <li class="breadcrumb-item d-inline-block position-relative">
            <a routerLink="/teacher" class="d-inline-block position-relative">Portal Docente</a>
          </li>
          <li class="breadcrumb-item d-inline-block position-relative">Planilla</li>
        </ol>
      </div>

      <!-- Barra de selección y herramientas -->
      <div class="trezo-card bg-white border-radius p-4 shadow-sm mb-4">
        <div class="row g-2 align-items-end mb-3">
          <div class="col-md-4">
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
          <div class="col-md-2">
            <label class="form-label small fw-semibold">Filtro por Sexo</label>
            <select class="form-select form-select-sm" [(ngModel)]="genderFilter">
              <option value="ALL">Mixto (Todos)</option>
              <option value="M">Masculino (M)</option>
              <option value="F">Femenino (F)</option>
            </select>
          </div>
          <div class="col-md-4 d-flex align-items-center justify-content-md-end gap-2">
            <div class="form-check form-switch mb-0">
              <input
                class="form-check-input"
                type="checkbox"
                id="autoSaveSw"
                [ngModel]="autoSaveEnabled()"
                (ngModelChange)="toggleAutoSave($event)"
              />
              <label class="form-check-label small fw-semibold" for="autoSaveSw">
                Autoguardado @if (autoSaveEnabled()) { ({{ autoSaveCountdown() }}s) }
              </label>
            </div>
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

        <div class="d-flex flex-wrap gap-2 pt-2 border-top">
          <button
            type="button"
            class="btn btn-sm btn-outline-primary"
            [disabled]="!selectedCourseId"
            (click)="columnsModalOpen.set(true)"
            [appCustomTooltip]="'Configurar columnas dinámicas n1..n30 por competencia'"
          >
            <i class="material-symbols-outlined fs-6 align-middle me-1">view_column</i>
            Columnas N1–N30 ({{ columns().length }})
          </button>
          <button
            type="button"
            class="btn btn-sm btn-outline-info"
            [disabled]="!selectedCourseId || gradebook()?.isPeriodClosed"
            (click)="syncAchievements()"
            [appCustomTooltip]="'Sincronizar descriptores automáticamente según desempeño nacional de cada estudiante'"
          >
            <i class="material-symbols-outlined fs-6 align-middle me-1">sync</i>
            Sincronizar Descriptores
          </button>
          <button
            type="button"
            class="btn btn-sm btn-outline-secondary"
            [disabled]="!selectedCourseId"
            (click)="openAchievementsModal(null)"
            [appCustomTooltip]="'Ver y asignar logros o sugerencias a los estudiantes del curso'"
          >
            <i class="material-symbols-outlined fs-6 align-middle me-1">fact_check</i>
            Logros / Sugerencias ({{ assignedAchievements().length }})
          </button>
          <button
            type="button"
            class="btn btn-sm btn-outline-success"
            [disabled]="!gradebook() || gradebook()!.students.length === 0"
            (click)="exportExcel()"
            [appCustomTooltip]="'Exportar planilla actual a Excel (.xlsx)'"
          >
            <i class="material-symbols-outlined fs-6 align-middle me-1">download</i>
            Exportar Excel
          </button>
          <label
            class="btn btn-sm btn-outline-warning mb-0"
            [class.disabled]="!gradebook() || gradebook()!.isPeriodClosed"
            [appCustomTooltip]="'Importar calificaciones desde plantilla Excel (.xlsx)'"
          >
            <i class="material-symbols-outlined fs-6 align-middle me-1">upload</i>
            Importar Excel
            <input
              type="file"
              accept=".xlsx,.xls"
              class="d-none"
              [disabled]="!gradebook() || gradebook()!.isPeriodClosed"
              (change)="importExcel($event)"
            />
          </label>
          <button
            type="button"
            class="btn btn-sm btn-outline-dark ms-auto"
            [disabled]="!selectedCourseId"
            (click)="loadCourseData()"
            [appCustomTooltip]="'Deshacer cambios no guardados y recargar desde el servidor'"
          >
            <i class="material-symbols-outlined fs-6 align-middle me-1">undo</i>
            Deshacer
          </button>
        </div>
      </div>

      <ul class="nav nav-pills mb-3 gap-2">
        <li class="nav-item">
          <button type="button" class="nav-link" [class.active]="activeTab() === 'scores'" (click)="activeTab.set('scores')">
            Planilla de Notas ({{ visibleStudents().length }})
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
              <table class="table table-sm table-hover v3-grid-table align-middle mb-0">
                <thead>
                  <tr>
                    <th>#</th>
                    <th style="min-width: 190px;">Estudiante</th>
                    @for (col of columns(); track col.id) {
                      <th
                        style="min-width: 78px;"
                        class="text-center bg-light"
                        [appCustomTooltip]="col.dimensionName + ' · ' + col.description + ' (' + col.weightPercentage + '%)'"
                      >
                        N{{ col.columnNumber }}
                      </th>
                    }
                    <th style="width: 88px;">Definitiva</th>
                    <th style="width: 82px;">Recup.</th>
                    <th style="width: 56px;" [appCustomTooltip]="'Faltas Justificadas'">F.J</th>
                    <th style="width: 56px;" [appCustomTooltip]="'Faltas Injustificadas'">F.I</th>
                    <th style="width: 56px;" [appCustomTooltip]="'Retardos'">Ret.</th>
                    <th class="text-center">Logros</th>
                  </tr>
                </thead>
                <tbody>
                  @for (st of visibleStudents(); track st.enrollmentId; let i = $index) {
                    <tr>
                      <td class="text-muted small">{{ i + 1 }}</td>
                      <td>
                        <div class="fw-semibold small">{{ st.studentFullName }}</div>
                        <small class="text-muted font-monospace">
                          {{ st.studentDocumentNumber }}
                          @if (studentGender(st.enrollmentId)) {
                            · {{ studentGender(st.enrollmentId) }}
                          }
                        </small>
                      </td>
                      @for (col of columns(); track col.id) {
                        <td class="bg-light">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="100"
                            class="form-control form-control-sm text-center"
                            [ngModel]="getItemScore(st.enrollmentId, col.columnNumber)"
                            (ngModelChange)="setItemScore(st, col.columnNumber, $event)"
                            [disabled]="st.isLocked || gradebook()!.isPeriodClosed"
                          />
                        </td>
                      }
                      <td>
                        <input type="number" step="0.1" min="0" max="100" class="form-control form-control-sm fw-bold" [(ngModel)]="st.finalScore" [disabled]="st.isLocked || gradebook()!.isPeriodClosed" />
                      </td>
                      <td>
                        <input type="number" step="0.1" min="0" max="100" class="form-control form-control-sm" [(ngModel)]="st.recoveryScore" [disabled]="st.isLocked || gradebook()!.isPeriodClosed" />
                      </td>
                      <td>
                        <input type="number" min="0" class="form-control form-control-sm" [(ngModel)]="st.justifiedAbsences" [disabled]="st.isLocked || gradebook()!.isPeriodClosed" />
                      </td>
                      <td>
                        <input type="number" min="0" class="form-control form-control-sm" [(ngModel)]="st.unjustifiedAbsences" [disabled]="st.isLocked || gradebook()!.isPeriodClosed" />
                      </td>
                      <td>
                        <input type="number" min="0" class="form-control form-control-sm" [(ngModel)]="st.lateArrivals" [disabled]="st.isLocked || gradebook()!.isPeriodClosed" />
                      </td>
                      <td class="text-center">
                        <button
                          type="button"
                          class="btn btn-sm btn-outline-primary"
                          (click)="openAchievementsModal(st)"
                          [appCustomTooltip]="'Ver o asignar logros y sugerencias a ' + st.studentFullName"
                        >
                          {{ countStudentAchievements(st.enrollmentId) }}
                        </button>
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td [attr.colspan]="8 + columns().length" class="text-center text-muted py-4">
                        Seleccione un curso con estudiantes matriculados.
                      </td>
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

      <!-- Modal Configurar Columnas Dinámicas N1..N30 (ConfigColumnView.js) -->
      <app-v3-modal-dialog
        [open]="columnsModalOpen()"
        heading="Configurar Columnas de Planilla (N1..N30)"
        subtitle="Asocie cada columna de calificación a una competencia/dimensión evaluativa del periodo"
        icon="view_column"
        size="lg"
        (closed)="columnsModalOpen.set(false)"
      >
        <div class="row g-2 align-items-end mb-3 p-3 rounded bg-light border">
          <div class="col-md-3">
            <label class="form-label small fw-semibold">Dimensión / Competencia *</label>
            <select class="form-select form-select-sm" [(ngModel)]="colForm.dimensionId">
              <option [ngValue]="0">Seleccione...</option>
              @for (d of dimensions(); track d.id) {
                <option [ngValue]="d.id">{{ d.name }} ({{ d.weightPercentage }}%)</option>
              }
            </select>
          </div>
          <div class="col-md-2">
            <label class="form-label small fw-semibold">Columna # *</label>
            <input type="number" min="1" max="30" class="form-control form-control-sm" [(ngModel)]="colForm.columnNumber" />
          </div>
          <div class="col-md-3">
            <label class="form-label small fw-semibold">Descripción Actividad *</label>
            <input type="text" class="form-control form-control-sm" [(ngModel)]="colForm.description" placeholder="Ej. Taller 1, Quiz..." />
          </div>
          <div class="col-md-2">
            <label class="form-label small fw-semibold">Peso (%)</label>
            <input type="number" min="0" max="100" class="form-control form-control-sm" [(ngModel)]="colForm.weightPercentage" />
          </div>
          <div class="col-md-2 d-grid">
            <button
              type="button"
              class="btn btn-sm btn-primary"
              [disabled]="!colForm.dimensionId || !colForm.description.trim()"
              (click)="saveColumn()"
            >
              Guardar Col.
            </button>
          </div>
        </div>

        <div class="table-responsive">
          <table class="table table-sm align-middle mb-0">
            <thead>
              <tr>
                <th>Col.</th>
                <th>Dimensión</th>
                <th>Descripción</th>
                <th class="text-center">Peso</th>
                <th class="text-end">Acción</th>
              </tr>
            </thead>
            <tbody>
              @for (col of columns(); track col.id) {
                <tr>
                  <td><span class="badge text-bg-primary">N{{ col.columnNumber }}</span></td>
                  <td class="small fw-semibold">{{ col.dimensionName }}</td>
                  <td class="small">{{ col.description }}</td>
                  <td class="text-center small">{{ col.weightPercentage }}%</td>
                  <td class="text-end">
                    <button type="button" class="btn btn-sm btn-outline-danger" (click)="deleteColumn(col.id)" [appCustomTooltip]="'Eliminar columna'">
                      <i class="material-symbols-outlined fs-6">delete</i>
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="text-center text-muted py-3">Sin columnas dinámicas en este periodo.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </app-v3-modal-dialog>

      <!-- Modal Asignar / Ver Logros y Sugerencias (LogrosNotasView / SugerenciasEstudiantesView) -->
      <app-v3-modal-dialog
        [open]="achievementsModalOpen()"
        [heading]="focusedStudent() ? 'Logros y Sugerencias · ' + focusedStudent()!.studentFullName : 'Logros y Sugerencias del Curso'"
        icon="fact_check"
        size="lg"
        (closed)="achievementsModalOpen.set(false)"
      >
        <div class="row g-2 align-items-end mb-3 p-3 rounded bg-light border">
          <div class="col-md-9">
            <label class="form-label small fw-semibold">Agregar Logro o Sugerencia del Catálogo</label>
            <select class="form-select form-select-sm" [(ngModel)]="selectedAchievementToAssign">
              <option [ngValue]="0">Seleccione descriptor o sugerencia...</option>
              @for (a of courseAchievements(); track a.id) {
                <option [ngValue]="a.id">[{{ a.indicatorType }}] {{ a.description }}</option>
              }
            </select>
          </div>
          <div class="col-md-3 d-grid">
            <button
              type="button"
              class="btn btn-sm btn-primary"
              [disabled]="!selectedAchievementToAssign"
              (click)="assignAchievement()"
            >
              Asignar
            </button>
          </div>
        </div>

        <div class="table-responsive">
          <table class="table table-sm align-middle mb-0">
            <thead>
              <tr>
                <th>Estudiante</th>
                <th>Tipo</th>
                <th>Descripción</th>
                <th class="text-end">Quitar</th>
              </tr>
            </thead>
            <tbody>
              @for (item of modalAssignedAchievements(); track item.academicGradeId + ':' + item.achievementStandardId) {
                <tr>
                  <td class="small fw-semibold">{{ item.studentFullName }}</td>
                  <td><span class="badge text-bg-info">{{ item.indicatorType }}</span></td>
                  <td class="small">{{ item.description }}</td>
                  <td class="text-end">
                    <button type="button" class="btn btn-sm btn-outline-danger" (click)="unassignAchievement(item)" [appCustomTooltip]="'Quitar logro asignado'">
                      <i class="material-symbols-outlined fs-6">delete</i>
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="4" class="text-center text-muted py-3">
                    Sin logros o sugerencias asignados. Guarde primero la planilla o use "Sincronizar Descriptores".
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </app-v3-modal-dialog>
    </div>
  `,
})
export class TeacherGradebookComponent implements OnInit, OnDestroy {
  private readonly portalService = inject(V3PortalService);
  private readonly settingsService = inject(V3SettingsService);
  private readonly auth = inject(V3UnifiedAuthService);
  private readonly messages = inject(MessagesService);
  private readonly loadMask = inject(LoadMaskService);
  private readonly route = inject(ActivatedRoute);

  readonly academicYear = computed(() => this.auth.academicYear());
  readonly activeTab = signal<GradebookTab>('scores');
  readonly courses = signal<TeacherCourseSummary[]>([]);
  readonly gradebook = signal<CourseGradebookView | null>(null);
  readonly preReports = signal<PreReportRow[]>([]);
  readonly absences = signal<StudentAbsenceRow[]>([]);
  readonly columns = signal<TeacherGradebookColumnRow[]>([]);
  readonly dimensions = signal<EvaluationDimensionRecord[]>([]);
  readonly assignedAchievements = signal<GradeAchievementAssignedRow[]>([]);
  readonly courseAchievements = signal<AchievementStandardRow[]>([]);

  readonly columnsModalOpen = signal(false);
  readonly achievementsModalOpen = signal(false);
  readonly focusedStudent = signal<GradebookStudentRow | null>(null);

  readonly autoSaveEnabled = signal(false);
  readonly autoSaveCountdown = signal(60);

  private autoSaveIntervalId: ReturnType<typeof setInterval> | null = null;
  private readonly genderByEnrollment = new Map<number, string>();
  private readonly itemScoresByEnrollment = new Map<number, Record<number, number>>();

  selectedCourseId = 0;
  selectedPeriod = 1;
  genderFilter: GenderFilter = 'ALL';
  selectedAchievementToAssign = 0;

  colForm = {
    dimensionId: 0,
    columnNumber: 1,
    description: '',
    weightPercentage: 25,
  };

  preReportForm = { enrollmentId: 0, partialScore: 2.5, observations: '' };
  absenceForm = {
    enrollmentId: 0,
    absenceDate: new Date().toISOString().slice(0, 10),
    hoursMissed: 1,
    isJustified: false,
    justificationNotes: '',
  };

  visibleStudents(): GradebookStudentRow[] {
    const all = this.gradebook()?.students ?? [];
    if (this.genderFilter === 'ALL') return all;
    return all.filter(
      (st) => (this.genderByEnrollment.get(st.enrollmentId) ?? '').toUpperCase() === this.genderFilter,
    );
  }

  modalAssignedAchievements(): GradeAchievementAssignedRow[] {
    const focused = this.focusedStudent();
    if (!focused) return this.assignedAchievements();
    return this.assignedAchievements().filter(
      (a) => a.enrollmentId === focused.enrollmentId,
    );
  }

  ngOnInit(): void {
    const queryCourseId = Number(this.route.snapshot.queryParamMap.get('courseId') || 0);
    const year = this.academicYear();
    forkJoin({
      courses: this.portalService.listTeacherCourses(year),
      dimensions: this.settingsService.listDimensions(year),
    }).subscribe((res) => {
      this.courses.set(res.courses);
      this.dimensions.set(res.dimensions);
      if (res.dimensions.length > 0) {
        this.colForm.dimensionId = res.dimensions[0].id;
      }
      if (queryCourseId && res.courses.some((c) => c.id === queryCourseId)) {
        this.selectedCourseId = queryCourseId;
      } else if (res.courses.length > 0) {
        this.selectedCourseId = res.courses[0].id;
      }
      if (this.selectedCourseId) {
        this.loadCourseData();
      }
    });
  }

  ngOnDestroy(): void {
    this.clearAutoSaveTimer();
  }

  toggleAutoSave(enabled: boolean): void {
    this.autoSaveEnabled.set(enabled);
    this.clearAutoSaveTimer();
    if (enabled) {
      this.autoSaveCountdown.set(60);
      this.autoSaveIntervalId = setInterval(() => {
        const next = this.autoSaveCountdown() - 1;
        if (next <= 0) {
          this.autoSaveCountdown.set(60);
          if (this.gradebook() && !this.gradebook()!.isPeriodClosed) {
            this.saveAllGrades(true);
          }
        } else {
          this.autoSaveCountdown.set(next);
        }
      }, 1000);
    }
  }

  private clearAutoSaveTimer(): void {
    if (this.autoSaveIntervalId) {
      clearInterval(this.autoSaveIntervalId);
      this.autoSaveIntervalId = null;
    }
  }

  loadCourseData(): void {
    if (!this.selectedCourseId) return;
    this.loadMask.show('Cargando planilla completa...');
    const year = this.academicYear();
    const course = this.courses().find((c) => c.id === Number(this.selectedCourseId));
    forkJoin({
      gradebook: this.portalService.getCourseGradebook(this.selectedCourseId, year, this.selectedPeriod),
      preReports: this.portalService.listPreReports(this.selectedCourseId, year, this.selectedPeriod),
      absences: this.portalService.listAbsences(this.selectedCourseId, this.selectedPeriod),
      columns: this.portalService.listCourseColumns(this.selectedCourseId, this.selectedPeriod),
      gradeItems: this.portalService.listCourseGradeItems(this.selectedCourseId, year, this.selectedPeriod),
      assigned: this.portalService.listCourseAssignedAchievements(this.selectedCourseId, year, this.selectedPeriod),
      catalogAchievements: course
        ? this.portalService.listAchievements({
            academicYear: year,
            gradeId: course.gradeId,
            subjectId: course.subjectId,
            periodNumber: this.selectedPeriod,
          })
        : of([] as AchievementStandardRow[]),
    })
      .pipe(finalize(() => this.loadMask.hide()))
      .subscribe({
        next: (res) => {
          this.gradebook.set(res.gradebook);
          this.preReports.set(res.preReports);
          this.absences.set(res.absences);
          this.columns.set(res.columns);
          this.assignedAchievements.set(res.assigned);
          this.courseAchievements.set(res.catalogAchievements);
          this.genderByEnrollment.clear();
          this.itemScoresByEnrollment.clear();
          for (const row of res.gradeItems) {
            if (row.genderCode) {
              this.genderByEnrollment.set(row.enrollmentId, row.genderCode);
            }
            this.itemScoresByEnrollment.set(row.enrollmentId, { ...row.items });
          }
          const maxCol = res.columns.reduce((m, c) => Math.max(m, c.columnNumber), 0);
          this.colForm.columnNumber = Math.min(30, maxCol + 1);
        },
      });
  }

  studentGender(enrollmentId: number): string {
    return this.genderByEnrollment.get(enrollmentId) ?? '';
  }

  countStudentAchievements(enrollmentId: number): number {
    return this.assignedAchievements().filter((a) => a.enrollmentId === enrollmentId).length;
  }

  getItemScore(enrollmentId: number, colNumber: number): number | '' {
    const map = this.itemScoresByEnrollment.get(enrollmentId);
    const val = map?.[colNumber];
    return val === undefined ? '' : val;
  }

  setItemScore(st: GradebookStudentRow, colNumber: number, value: unknown): void {
    const num = Number(value);
    const current = this.itemScoresByEnrollment.get(st.enrollmentId) ?? {};
    if (value === '' || value === null || Number.isNaN(num)) {
      delete current[colNumber];
    } else {
      current[colNumber] = num;
    }
    this.itemScoresByEnrollment.set(st.enrollmentId, current);
    const values = Object.values(current).filter((v) => v > 0);
    if (values.length > 0) {
      st.finalScore = Number(
        (values.reduce((acc, v) => acc + v, 0) / values.length).toFixed(2),
      );
    }
  }

  saveAllGrades(silent = false): void {
    const gb = this.gradebook();
    if (!gb || gb.students.length === 0) return;
    if (!silent) {
      this.loadMask.show('Guardando calificaciones y columnas...');
    }
    const itemsPayload: Array<{
      enrollmentId: number;
      itemNumber: number;
      score: number;
      dimensionId?: number | null;
      gradebookColumnId?: number | null;
    }> = [];
    for (const st of gb.students) {
      const map = this.itemScoresByEnrollment.get(st.enrollmentId);
      if (!map) continue;
      for (const col of this.columns()) {
        const val = map[col.columnNumber];
        if (val !== undefined && !Number.isNaN(Number(val))) {
          itemsPayload.push({
            enrollmentId: st.enrollmentId,
            itemNumber: col.columnNumber,
            score: Number(val),
            dimensionId: col.dimensionId,
            gradebookColumnId: col.id,
          });
        }
      }
    }

    const calls: {
      grades: Observable<{ savedCount: number }>;
      items: Observable<{ savedCount: number }>;
    } = {
      grades: this.portalService.saveGradebookBatch(this.selectedCourseId, {
        academicYear: this.academicYear(),
        periodNumber: this.selectedPeriod,
        rows: gb.students.map((s) => ({
          enrollmentId: s.enrollmentId,
          finalScore: Number(s.finalScore || 0),
          recoveryScore: Number(s.recoveryScore || 0),
          justifiedAbsences: Number(s.justifiedAbsences || 0),
          unjustifiedAbsences: Number(s.unjustifiedAbsences || 0),
          lateArrivals: Number(s.lateArrivals || 0),
        })),
      }),
      items:
        itemsPayload.length > 0
          ? this.portalService.saveGradeItemsBatch(this.selectedCourseId, {
              academicYear: this.academicYear(),
              periodNumber: this.selectedPeriod,
              items: itemsPayload,
            })
          : of({ savedCount: 0 }),
    };

    forkJoin(calls)
      .pipe(finalize(() => { if (!silent) this.loadMask.hide(); }))
      .subscribe({
        next: ({ grades, items }) => {
          this.messages.showSuccess(
            silent
              ? `Autoguardado completado (${grades.savedCount} estudiantes).`
              : `Planilla guardada (${grades.savedCount} estudiantes, ${items.savedCount} notas parciales).`,
          );
          if (!silent) {
            this.loadCourseData();
          }
        },
      });
  }

  saveColumn(): void {
    this.portalService
      .upsertCourseColumn(this.selectedCourseId, {
        dimensionId: Number(this.colForm.dimensionId),
        periodNumber: Number(this.selectedPeriod),
        columnNumber: Number(this.colForm.columnNumber),
        description: this.colForm.description.trim(),
        weightPercentage: Number(this.colForm.weightPercentage) || 0,
      })
      .subscribe(() => {
        this.messages.showSuccess(`Columna N${this.colForm.columnNumber} guardada.`);
        this.colForm.description = '';
        this.loadCourseData();
      });
  }

  deleteColumn(columnId: number): void {
    this.portalService.deleteCourseColumn(columnId).subscribe(() => {
      this.messages.showSuccess('Columna eliminada.');
      this.loadCourseData();
    });
  }

  syncAchievements(): void {
    this.loadMask.show('Sincronizando descriptores por desempeño...');
    this.portalService
      .syncCourseAchievements(this.selectedCourseId, {
        academicYear: this.academicYear(),
        periodNumber: this.selectedPeriod,
      })
      .pipe(finalize(() => this.loadMask.hide()))
      .subscribe(({ syncedCount }) => {
        this.messages.showSuccess(
          `Sincronización completada: ${syncedCount} descriptor(es) asignado(s) automáticamente.`,
        );
        this.loadCourseData();
      });
  }

  openAchievementsModal(student: GradebookStudentRow | null): void {
    this.focusedStudent.set(student);
    this.selectedAchievementToAssign = 0;
    this.achievementsModalOpen.set(true);
  }

  assignAchievement(): void {
    const achId = Number(this.selectedAchievementToAssign);
    if (!achId) return;
    const focused = this.focusedStudent();
    const targetGradeIds = focused
      ? focused.gradeId
        ? [focused.gradeId]
        : []
      : (this.gradebook()?.students ?? [])
          .map((s) => s.gradeId)
          .filter((id): id is number => id !== null);

    if (targetGradeIds.length === 0) {
      this.messages.showWarning('Guarde primero la planilla de notas para asignar descriptores.');
      return;
    }

    this.portalService
      .assignAchievementsBatch({
        academicYear: this.academicYear(),
        academicGradeIds: targetGradeIds,
        achievementStandardIds: [achId],
      })
      .subscribe(({ assignedCount }) => {
        this.messages.showSuccess(`Se asignaron ${assignedCount} registro(s) de logros/sugerencias.`);
        this.loadCourseData();
      });
  }

  unassignAchievement(item: GradeAchievementAssignedRow): void {
    this.portalService
      .unassignAchievement(
        item.academicGradeId,
        item.achievementStandardId,
        this.academicYear(),
      )
      .subscribe(() => {
        this.messages.showSuccess('Logro desvinculado de la calificación.');
        this.loadCourseData();
      });
  }

  exportExcel(): void {
    const gb = this.gradebook();
    if (!gb) return;
    const sheetData = gb.students.map((s, idx) => {
      const base: Record<string, unknown> = {
        No: idx + 1,
        Documento: s.studentDocumentNumber,
        Estudiante: s.studentFullName,
      };
      for (const col of this.columns()) {
        base[`N${col.columnNumber}`] = this.getItemScore(s.enrollmentId, col.columnNumber);
      }
      base['Definitiva'] = s.finalScore;
      base['Recuperacion'] = s.recoveryScore;
      base['Faltas'] = s.unjustifiedAbsences;
      return base;
    });
    const ws = XLSX.utils.json_to_sheet(sheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `P${this.selectedPeriod}`);
    XLSX.writeFile(
      wb,
      `planilla_${gb.course.gradeName}_${gb.course.groupCode}_P${this.selectedPeriod}.xlsx`,
    );
  }

  importExcel(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0];
    const gb = this.gradebook();
    if (!file || !gb) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const workbook = XLSX.read(reader.result as ArrayBuffer, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet);
        let matched = 0;

        for (const r of rows) {
          const doc = String(r['Documento'] ?? '').trim();
          const student = gb.students.find((s) => s.studentDocumentNumber === doc);
          if (!student || student.isLocked) continue;
          matched++;

          if (r['Definitiva'] !== undefined) student.finalScore = Number(r['Definitiva']) || 0;
          if (r['Recuperacion'] !== undefined) student.recoveryScore = Number(r['Recuperacion']) || 0;
          if (r['Faltas'] !== undefined) student.unjustifiedAbsences = Number(r['Faltas']) || 0;
          for (const col of this.columns()) {
            const key = `N${col.columnNumber}`;
            if (r[key] !== undefined && r[key] !== '') {
              this.setItemScore(student, col.columnNumber, r[key]);
            }
          }
        }
        this.messages.showSuccess(
          `Excel cargado (${matched} estudiante(s) actualizados). Revise y presione "Guardar Planilla".`,
        );
      } catch {
        this.messages.showError('No fue posible leer la plantilla Excel seleccionada.');
      } finally {
        if (input) input.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
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
