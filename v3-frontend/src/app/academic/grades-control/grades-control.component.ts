import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';
import { LoadMaskService } from '../../services/common/load-mask.service';
import { MessagesService } from '../../services/messages.service';
import {
  CourseAssignmentRecord,
  EnrollmentGradeRow,
  EnrollmentRecord,
  HonorRollRecord,
  PeriodRecoveryRecord,
  ReportedCourseSummary,
  V3AcademicService,
} from '../../services/v3-academic.service';
import { V3UnifiedAuthService } from '../../services/v3-unified-auth.service';
import {
  SearchableSelectOption,
  V3SearchableSelectComponent,
} from '../../shared/components/v3-searchable-select/v3-searchable-select.component';
import { CustomTooltipDirective } from '../../shared/directives/custom-tooltip.directive';

type GradesControlTab = 'reported' | 'rectorEdit' | 'recoveries' | 'honorRoll';

/**
 * Control Académico de Notas, Transferencias, Nivelaciones, Cuadro de Honor y Mayúsculas de Logros
 * (reemplaza NotasReportadasView, NotasAcademicasRectorView, TransferirNotasView,
 * NivelacionesPeriodosView, CuadroHonorView y MayusculaLogrosView).
 */
@Component({
  selector: 'app-grades-control',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CustomTooltipDirective,
    V3SearchableSelectComponent,
  ],
  template: `
    <div class="container-fluid py-3">
      <div class="breadcrumb-card mb-25 d-md-flex align-items-center justify-content-between">
        <div>
          <h5 class="mb-0 fw-bold">Control de Notas, Nivelaciones y Cuadro de Honor</h5>
          <small class="text-muted">Año lectivo {{ academicYear() }} · Periodo {{ selectedPeriod() }}</small>
        </div>
        <div class="d-flex align-items-center gap-2">
          <app-v3-searchable-select
            size="sm"
            style="width: 150px;"
            placeholder="Periodo"
            searchPlaceholder="Buscar periodo..."
            [options]="periodOptions"
            [ngModel]="selectedPeriod()"
            (ngModelChange)="onPeriodChange($event)"
            aria-label="Seleccionar periodo"
          />
          @if (isRectorOrCoordinator()) {
            <button
              type="button"
              class="btn btn-sm btn-outline-secondary"
              (click)="uppercaseAchievements()"
              [appCustomTooltip]="'Convertir logros e indicadores del año lectivo a MAYÚSCULAS'"
            >
              <i class="material-symbols-outlined fs-6 align-middle me-1">format_size</i>
              Logros a MAYÚSCULAS
            </button>
          }
        </div>
      </div>

      <ul class="nav nav-pills mb-3 gap-2">
        <li class="nav-item">
          <button type="button" class="nav-link" [class.active]="activeTab() === 'reported'" (click)="activeTab.set('reported')">
            Avance Reportado ({{ reportedSummary().length }})
          </button>
        </li>
        <li class="nav-item">
          <button type="button" class="nav-link" [class.active]="activeTab() === 'rectorEdit'" (click)="activeTab.set('rectorEdit')">
            Editor Rectoral y Transferencia
          </button>
        </li>
        <li class="nav-item">
          <button type="button" class="nav-link" [class.active]="activeTab() === 'recoveries'" (click)="activeTab.set('recoveries')">
            Nivelaciones ({{ recoveries().length }})
          </button>
        </li>
        <li class="nav-item">
          <button type="button" class="nav-link" [class.active]="activeTab() === 'honorRoll'" (click)="activeTab.set('honorRoll')">
            Cuadro de Honor ({{ honorRoll().length }})
          </button>
        </li>
      </ul>

      <div class="trezo-card bg-white border-radius p-4 shadow-sm">
        @switch (activeTab()) {
          @case ('reported') {
            <div class="table-responsive">
              <table class="table table-hover v3-grid-table mb-0">
                <thead>
                  <tr>
                    <th>Docente</th>
                    <th>Asignatura</th>
                    <th>Grado / Grupo</th>
                    <th>Sede</th>
                    <th class="text-center">Calificados / Matriculados</th>
                    <th style="width: 200px;">Cumplimiento</th>
                  </tr>
                </thead>
                <tbody>
                  @for (row of reportedSummary(); track row.courseAssignmentId) {
                    <tr>
                      <td class="fw-semibold">{{ row.teacherName }}</td>
                      <td>{{ row.subjectName }}</td>
                      <td><span class="badge text-bg-light border text-dark">{{ row.gradeName }} - {{ row.groupCode }}</span></td>
                      <td class="small">{{ row.campusName }}</td>
                      <td class="text-center">{{ row.gradedStudents }} / {{ row.enrolledStudents }}</td>
                      <td>
                        <div class="d-flex align-items-center gap-2">
                          <div class="progress flex-grow-1" style="height: 8px;">
                            <div
                              class="progress-bar"
                              [ngClass]="row.completionPercentage >= 100 ? 'bg-success' : row.completionPercentage >= 50 ? 'bg-info' : 'bg-warning'"
                              [style.width.%]="row.completionPercentage"
                            ></div>
                          </div>
                          <span class="small fw-semibold">{{ row.completionPercentage }}%</span>
                        </div>
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="6" class="text-center text-muted py-4">No hay carga académica reportada para el periodo {{ selectedPeriod() }}.</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }

          @case ('rectorEdit') {
            <div class="row g-2 align-items-end mb-4 p-3 rounded bg-light border">
              <div class="col-md-6">
                <label class="form-label small fw-semibold">Seleccionar estudiante matriculado</label>
                <app-v3-searchable-select
                  size="sm"
                  placeholder="Seleccione estudiante..."
                  searchPlaceholder="Buscar por nombre, documento o grupo..."
                  [options]="enrollmentOptions()"
                  [(ngModel)]="selectedEnrollmentId"
                  (ngModelChange)="loadEnrollmentGrades()"
                />
              </div>
              <div class="col-md-6 text-md-end small text-muted">
                Toda edición rectoral registra auditoría automática en base de datos.
              </div>
            </div>

            <div class="table-responsive mb-4">
              <table class="table table-hover v3-grid-table mb-0">
                <thead>
                  <tr>
                    <th>Periodo</th>
                    <th>Asignatura</th>
                    <th>Docente</th>
                    <th style="width: 110px;">Definitiva</th>
                    <th style="width: 110px;">Recuperación</th>
                    <th class="text-center">Efectiva</th>
                    <th class="text-end">Guardar</th>
                  </tr>
                </thead>
                <tbody>
                  @for (g of enrollmentGrades(); track g.id) {
                    <tr>
                      <td>P{{ g.periodNumber }}</td>
                      <td class="fw-semibold">{{ g.subjectName }}</td>
                      <td class="small">{{ g.teacherName }}</td>
                      <td>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          class="form-control form-control-sm"
                          [value]="g.finalScore"
                          #finalInput
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          class="form-control form-control-sm"
                          [value]="g.recoveryScore"
                          #recInput
                        />
                      </td>
                      <td class="text-center fw-bold">{{ g.effectiveScore }}</td>
                      <td class="text-end">
                        @if (isRector()) {
                          <button
                            type="button"
                            class="btn btn-sm btn-primary"
                            (click)="saveRectorGrade(g, finalInput.value, recInput.value)"
                            [appCustomTooltip]="'Actualizar calificación con auditoría'"
                          >
                            Guardar
                          </button>
                        }
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="7" class="text-center text-muted py-4">Seleccione un estudiante para ver sus calificaciones.</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            @if (canTransferGrades()) {
              <div class="v3-form-panel v3-form-panel--info mb-0">
                <h6 class="fw-semibold mb-3">Transferir Notas entre Cursos / Asignaciones</h6>
                <div class="row g-3">
                  <div class="col-12 col-md-6">
                    <label class="form-label">Curso origen</label>
                    <app-v3-searchable-select
                      placeholder="Seleccione curso origen..."
                      searchPlaceholder="Buscar curso, grupo o docente..."
                      [options]="assignmentOptions()"
                      [(ngModel)]="transferForm.fromCourseAssignmentId"
                    />
                  </div>
                  <div class="col-12 col-md-6">
                    <label class="form-label">Curso destino</label>
                    <app-v3-searchable-select
                      placeholder="Seleccione curso destino..."
                      searchPlaceholder="Buscar curso, grupo o docente..."
                      [options]="assignmentOptions()"
                      [(ngModel)]="transferForm.toCourseAssignmentId"
                    />
                  </div>
                  <div class="col-12 d-flex justify-content-end">
                    <button
                      type="button"
                      class="btn btn-sm btn-primary"
                      [disabled]="!selectedEnrollmentId || !transferForm.fromCourseAssignmentId || !transferForm.toCourseAssignmentId"
                      (click)="transferGrades()"
                    >
                      Transferir Notas del Estudiante
                    </button>
                  </div>
                </div>
              </div>
            }
          }

          @case ('recoveries') {
            @if (canWriteRecoveries()) {
              <div class="v3-form-panel">
                <div class="row g-3">
                  <div class="col-12 col-md-6">
                    <label class="form-label">Estudiante *</label>
                    <app-v3-searchable-select
                      placeholder="Seleccione estudiante..."
                      searchPlaceholder="Buscar por nombre, documento o grupo..."
                      [options]="enrollmentOptions()"
                      [(ngModel)]="recoveryForm.enrollmentId"
                    />
                  </div>
                  <div class="col-12 col-md-6">
                    <label class="form-label">Asignatura / Curso *</label>
                    <app-v3-searchable-select
                      placeholder="Seleccione asignatura o curso..."
                      searchPlaceholder="Buscar asignatura, grupo o docente..."
                      [options]="assignmentOptions()"
                      [(ngModel)]="recoveryForm.courseAssignmentId"
                    />
                  </div>
                  <div class="col-12 col-md-6">
                    <label class="form-label">Nota anterior</label>
                    <input type="number" step="0.1" class="form-control" [(ngModel)]="recoveryForm.previousScore" />
                  </div>
                  <div class="col-12 col-md-6">
                    <label class="form-label">Nota recuperación *</label>
                    <input type="number" step="0.1" class="form-control" [(ngModel)]="recoveryForm.recoveryScore" />
                  </div>
                  <div class="col-12 col-md-6">
                    <label class="form-label">No. Acta</label>
                    <input type="text" class="form-control" [(ngModel)]="recoveryForm.actNumber" placeholder="ACT-01" />
                  </div>
                  <div class="col-12 col-md-6 d-flex align-items-end justify-content-md-end">
                    <button
                      type="button"
                      class="btn btn-sm btn-primary"
                      [disabled]="!recoveryForm.enrollmentId || !recoveryForm.courseAssignmentId"
                      (click)="saveRecovery()"
                    >
                      Registrar nivelación
                    </button>
                  </div>
                </div>
              </div>
            }

            <div class="table-responsive">
              <table class="table table-hover v3-grid-table mb-0">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Acta</th>
                    <th>Estudiante</th>
                    <th>Asignatura</th>
                    <th class="text-center">Nota Ant.</th>
                    <th class="text-center">Nota Nivelada</th>
                    <th>Tipo</th>
                  </tr>
                </thead>
                <tbody>
                  @for (rec of recoveries(); track rec.id) {
                    <tr>
                      <td class="small">{{ rec.recoveryDate }}</td>
                      <td>{{ rec.actNumber || '—' }}</td>
                      <td class="fw-semibold">{{ rec.studentFullName }}</td>
                      <td>{{ rec.subjectName }}</td>
                      <td class="text-center text-danger">{{ rec.previousScore }}</td>
                      <td class="text-center text-success fw-bold">{{ rec.recoveryScore }}</td>
                      <td class="small">{{ rec.recoveryType }}</td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="7" class="text-center text-muted py-4">No hay actas de nivelación en este periodo.</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }

          @case ('honorRoll') {
            <div class="d-flex justify-content-between align-items-center mb-3">
              <p class="small text-muted mb-0">
                Puestos por grupo y grado calculados con promedio ponderado sobre notas efectivas del periodo {{ selectedPeriod() }}.
              </p>
              @if (canCalculateHonorRoll()) {
                <button type="button" class="btn btn-sm btn-primary" (click)="recalculateHonorRoll()">
                  <i class="material-symbols-outlined fs-6 align-middle me-1">emoji_events</i>
                  Recalcular Cuadro de Honor
                </button>
              }
            </div>
            <div class="table-responsive">
              <table class="table table-hover v3-grid-table mb-0">
                <thead>
                  <tr>
                    <th class="text-center">Puesto Grupo</th>
                    <th class="text-center">Puesto Grado</th>
                    <th>Estudiante</th>
                    <th>Grado / Grupo</th>
                    <th class="text-center">Promedio</th>
                    <th class="text-center">Reprobadas</th>
                    <th class="text-center">Distinción</th>
                  </tr>
                </thead>
                <tbody>
                  @for (hr of honorRoll(); track hr.id) {
                    <tr>
                      <td class="text-center fw-bold">#{{ hr.groupRank }}</td>
                      <td class="text-center">#{{ hr.gradeRank ?? '—' }}</td>
                      <td class="fw-semibold">{{ hr.studentFullName }}</td>
                      <td>{{ hr.gradeName }} - {{ hr.groupCode }} <small class="text-muted">({{ hr.campusName }})</small></td>
                      <td class="text-center fw-bold text-primary">{{ hr.averageScore }}</td>
                      <td class="text-center">{{ hr.failedSubjectsCount }}</td>
                      <td class="text-center">
                        @if (hr.isHonorRoll) {
                          <span class="badge text-bg-warning">Cuadro de Honor</span>
                        } @else {
                          <span class="text-muted small">—</span>
                        }
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="7" class="text-center text-muted py-4">Presione "Recalcular Cuadro de Honor" para generar los puestos.</td>
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
export class GradesControlComponent implements OnInit {
  private readonly academicService = inject(V3AcademicService);
  private readonly auth = inject(V3UnifiedAuthService);
  private readonly messages = inject(MessagesService);
  private readonly loadMask = inject(LoadMaskService);

  readonly academicYear = computed(() => this.auth.academicYear());
  readonly isRector = computed(() =>
    this.auth.hasPermission('academic.grades.rector_override'),
  );
  readonly isRectorOrCoordinator = computed(() =>
    this.auth.hasPermission('academic.achievements.uppercase'),
  );
  readonly canTransferGrades = computed(() =>
    this.auth.hasPermission('academic.grades.transfer'),
  );
  readonly canWriteRecoveries = computed(() =>
    this.auth.hasPermission('academic.recoveries.write'),
  );
  readonly canCalculateHonorRoll = computed(() =>
    this.auth.hasPermission('academic.honor_roll.calculate'),
  );

  readonly activeTab = signal<GradesControlTab>('reported');
  readonly selectedPeriod = signal<number>(1);

  readonly reportedSummary = signal<ReportedCourseSummary[]>([]);
  readonly enrollments = signal<EnrollmentRecord[]>([]);
  readonly assignments = signal<CourseAssignmentRecord[]>([]);
  readonly enrollmentGrades = signal<EnrollmentGradeRow[]>([]);
  readonly recoveries = signal<PeriodRecoveryRecord[]>([]);
  readonly honorRoll = signal<HonorRollRecord[]>([]);

  readonly periodOptions: readonly SearchableSelectOption<number>[] = [
    { value: 1, label: 'Periodo 1' },
    { value: 2, label: 'Periodo 2' },
    { value: 3, label: 'Periodo 3' },
    { value: 4, label: 'Periodo 4' },
  ];

  readonly enrollmentOptions = computed<SearchableSelectOption<number>[]>(() => [
    { value: 0, label: 'Seleccione estudiante...' },
    ...this.enrollments().map((e) => ({
      value: e.id,
      label: e.studentFullName,
      badge: `${e.gradeName}-${e.groupCode}`,
      subtitle: e.studentDocumentNumber,
      keywords: `${e.studentDocumentNumber} ${e.gradeName} ${e.groupCode}`,
    })),
  ]);

  readonly assignmentOptions = computed<SearchableSelectOption<number>[]>(() => [
    { value: 0, label: 'Seleccione curso...' },
    ...this.assignments().map((c) => ({
      value: c.id,
      label: `${c.gradeName}-${c.groupCode} · ${c.subjectName}`,
      subtitle: c.teacherName,
      keywords: `${c.teacherName} ${c.subjectName}`,
    })),
  ]);

  selectedEnrollmentId = 0;
  transferForm = { fromCourseAssignmentId: 0, toCourseAssignmentId: 0 };
  recoveryForm = {
    enrollmentId: 0,
    courseAssignmentId: 0,
    previousScore: 2.0,
    recoveryScore: 3.0,
    actNumber: '',
  };

  ngOnInit(): void {
    this.loadPeriodData();
  }

  onPeriodChange(period: number): void {
    this.selectedPeriod.set(Number(period));
    this.loadPeriodData();
  }

  loadPeriodData(): void {
    this.loadMask.show('Cargando control académico...');
    const year = this.academicYear();
    const period = this.selectedPeriod();
    forkJoin({
      reported: this.academicService.listReportedGradesSummary(year, period),
      enrollments: this.academicService.listEnrollments(year),
      assignments: this.academicService.listCourseAssignments(year),
      recoveries: this.academicService.listPeriodRecoveries(year, period),
      honorRoll: this.academicService.listHonorRoll(year, period),
    })
      .pipe(finalize(() => this.loadMask.hide()))
      .subscribe({
        next: (res) => {
          this.reportedSummary.set(res.reported);
          this.enrollments.set(res.enrollments);
          this.assignments.set(res.assignments);
          this.recoveries.set(res.recoveries);
          this.honorRoll.set(res.honorRoll);
          if (this.selectedEnrollmentId) {
            this.loadEnrollmentGrades();
          }
        },
      });
  }

  loadEnrollmentGrades(): void {
    if (!this.selectedEnrollmentId) {
      this.enrollmentGrades.set([]);
      return;
    }
    this.academicService
      .listEnrollmentGrades(
        Number(this.selectedEnrollmentId),
        this.academicYear(),
        this.selectedPeriod(),
      )
      .subscribe((rows) => this.enrollmentGrades.set(rows));
  }

  saveRectorGrade(
    row: EnrollmentGradeRow,
    finalRaw: string,
    recoveryRaw: string,
  ): void {
    this.academicService
      .adminUpdateGradeScore(row.id, {
        academicYear: row.academicYear,
        finalScore: Number(finalRaw),
        recoveryScore: Number(recoveryRaw),
        reason: 'Ajuste rectoral desde panel V3',
      })
      .subscribe({
        next: () => {
          this.messages.showSuccess('Calificación actualizada con registro de auditoría.');
          this.loadEnrollmentGrades();
        },
      });
  }

  transferGrades(): void {
    this.academicService
      .transferStudentGrades({
        academicYear: this.academicYear(),
        enrollmentId: Number(this.selectedEnrollmentId),
        fromCourseAssignmentId: Number(this.transferForm.fromCourseAssignmentId),
        toCourseAssignmentId: Number(this.transferForm.toCourseAssignmentId),
      })
      .subscribe({
        next: ({ transferredCount }) => {
          this.messages.showSuccess(`Se transfirieron ${transferredCount} calificaciones.`);
          this.loadEnrollmentGrades();
        },
      });
  }

  saveRecovery(): void {
    this.academicService
      .savePeriodRecovery({
        academicYear: this.academicYear(),
        enrollmentId: Number(this.recoveryForm.enrollmentId),
        courseAssignmentId: Number(this.recoveryForm.courseAssignmentId),
        periodNumber: this.selectedPeriod(),
        previousScore: Number(this.recoveryForm.previousScore),
        recoveryScore: Number(this.recoveryForm.recoveryScore),
        actNumber: this.recoveryForm.actNumber.trim() || null,
        recoveryType: 'PERIOD_RECOVERY',
      })
      .subscribe({
        next: () => {
          this.messages.showSuccess('Nivelación registrada exitosamente.');
          this.loadPeriodData();
        },
      });
  }

  recalculateHonorRoll(): void {
    this.loadMask.show('Calculando puestos y Cuadro de Honor...');
    this.academicService
      .calculateHonorRoll(this.academicYear(), this.selectedPeriod())
      .pipe(finalize(() => this.loadMask.hide()))
      .subscribe({
        next: (rows) => {
          this.honorRoll.set(rows);
          this.messages.showSuccess(`Cuadro de Honor actualizado (${rows.length} estudiantes).`);
        },
      });
  }

  uppercaseAchievements(): void {
    void this.messages
      .confirmDelete(
        `¿Convertir todos los logros e indicadores del año ${this.academicYear()} a MAYÚSCULAS?`,
      )
      .then((r) => {
        if (!r.isConfirmed) return;
        this.academicService.uppercaseAchievements(this.academicYear()).subscribe({
          next: ({ updatedCount }) => {
            this.messages.showSuccess(`Se normalizaron ${updatedCount} logros e indicadores a MAYÚSCULAS.`);
          },
        });
      });
  }
}
