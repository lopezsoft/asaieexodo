import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { LoadMaskService } from '../../services/common/load-mask.service';
import { MessagesService } from '../../services/messages.service';
import { V3AcademicService } from '../../services/v3-academic.service';
import {
  AchievementStandardRow,
  LessonPlanRow,
  TeacherCourseSummary,
  V3PortalService,
} from '../../services/v3-portal.service';
import {
  EvaluationDimensionRecord,
  NationalGradingScaleItem,
  V3SettingsService,
} from '../../services/v3-settings.service';
import { V3UnifiedAuthService } from '../../services/v3-unified-auth.service';
import {
  SearchableSelectOption,
  V3SearchableSelectComponent,
} from '../../shared/components/v3-searchable-select/v3-searchable-select.component';
import { CustomTooltipDirective } from '../../shared/directives/custom-tooltip.directive';

type PlanningTab = 'achievements' | 'suggestions' | 'lessonPlans';

/**
 * Banco de Descriptores Multi-Escala, Sugerencias/Observaciones, Importación Interanual
 * y Parcelador / Plan Semanal con impresión PDF JasperReports
 * (paridad 100% con AsignacionDescriptores, DescriptoresSave, ImportarDescriptores,
 * SugerenciasForm, ParceladorView y PlanSemanalView de asaie-teachers).
 */
@Component({
  selector: 'app-teacher-achievements-planning',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, V3SearchableSelectComponent, CustomTooltipDirective],
  template: `
    <div class="container-fluid py-3">
      <div class="breadcrumb-card mb-25 d-md-flex align-items-center justify-content-between">
        <div>
          <h5 class="mb-0 fw-bold">Descriptores, Sugerencias, Parcelador y Plan Semanal</h5>
          <small class="text-muted">Año lectivo {{ academicYear() }}</small>
        </div>
        <ol class="breadcrumb list-unstyled mt-0 mb-0 p-0">
          <li class="breadcrumb-item d-inline-block position-relative">
            <a routerLink="/teacher" class="d-inline-block position-relative">Portal Docente</a>
          </li>
          <li class="breadcrumb-item d-inline-block position-relative">Planeación</li>
        </ol>
      </div>

      <ul class="nav nav-pills mb-3 gap-2">
        <li class="nav-item">
          <button type="button" class="nav-link" [class.active]="activeTab() === 'achievements'" (click)="activeTab.set('achievements')">
            Descriptores / Logros ({{ descriptorRows().length }})
          </button>
        </li>
        <li class="nav-item">
          <button type="button" class="nav-link" [class.active]="activeTab() === 'suggestions'" (click)="activeTab.set('suggestions')">
            Sugerencias y Observaciones ({{ suggestionRows().length }})
          </button>
        </li>
        <li class="nav-item">
          <button type="button" class="nav-link" [class.active]="activeTab() === 'lessonPlans'" (click)="activeTab.set('lessonPlans')">
            Parcelador y Plan Semanal ({{ lessonPlans().length }})
          </button>
        </li>
      </ul>

      <div class="trezo-card bg-white border-radius p-4 shadow-sm">
        @switch (activeTab()) {
          @case ('achievements') {
            <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
              <div class="form-check form-switch mb-0">
                <input
                  class="form-check-input"
                  type="checkbox"
                  id="multiScaleSw"
                  [(ngModel)]="achForm.generateMultiScale"
                />
                <label class="form-check-label small fw-semibold" for="multiScaleSw">
                  Generar automáticamente para los {{ nationalScales().length }} desempeños nacionales (Multi-Escala)
                </label>
              </div>
              <button
                type="button"
                class="btn btn-sm btn-outline-info"
                (click)="importFromPreviousYear()"
                [appCustomTooltip]="'Copiar descriptores del año lectivo anterior hacia el actual'"
              >
                <i class="material-symbols-outlined fs-6 align-middle me-1">download</i>
                Importar de {{ academicYear() - 1 }}
              </button>
            </div>

            <div class="v3-form-panel">
              <div class="row g-3">
                <div class="col-12 col-md-6">
                  <label class="form-label">Curso (Grado / Asignatura) *</label>
                  <app-v3-searchable-select
                    [(ngModel)]="achCourseId"
                    [options]="courseOptions()"
                    placeholder="Seleccione curso..."
                    searchPlaceholder="Buscar curso..."
                  />
                </div>
                <div class="col-12 col-md-6">
                  <label class="form-label">Periodo</label>
                  <app-v3-searchable-select
                    [(ngModel)]="achForm.periodNumber"
                    [options]="periodOptions"
                    placeholder="Per."
                    searchPlaceholder="Buscar..."
                  />
                </div>
                <div class="col-12 col-md-6">
                  <label class="form-label">Competencia</label>
                  <app-v3-searchable-select
                    [(ngModel)]="achForm.dimensionId"
                    [options]="dimensionOptions()"
                    [clearable]="true"
                    placeholder="General"
                    searchPlaceholder="Buscar competencia..."
                  />
                </div>
                <div class="col-12 col-md-6">
                  <label class="form-label">Texto Base del Descriptor *</label>
                  <input
                    type="text"
                    class="form-control"
                    [(ngModel)]="achForm.description"
                    placeholder="Ej. Reconoce y resuelve ecuaciones lineales..."
                  />
                </div>

                @if (achForm.generateMultiScale && achForm.description.trim()) {
                  <div class="col-12">
                    <div class="small text-muted">
                      <strong>Vista previa por escala nacional:</strong>
                      @for (sc of nationalScales(); track sc.id) {
                        <div class="mt-1">
                          <span class="badge text-bg-secondary me-1">{{ sc.name }}</span>
                          {{ buildScaleDescription(sc, achForm.description) }}
                        </div>
                      }
                    </div>
                  </div>
                }

                <div class="col-12 d-flex justify-content-end">
                  <button
                    type="button"
                    class="btn btn-sm btn-primary"
                    [disabled]="!achCourseId || !achForm.description.trim()"
                    (click)="saveAchievement()"
                  >
                    {{ achForm.generateMultiScale ? 'Crear Multi-Escala' : 'Agregar descriptor' }}
                  </button>
                </div>
              </div>
            </div>

            <div class="table-responsive">
              <table class="table table-hover v3-grid-table mb-0">
                <thead>
                  <tr>
                    <th>Per.</th>
                    <th>Grado / Asignatura</th>
                    <th>Tipo</th>
                    <th>Descripción</th>
                    <th class="text-end">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  @for (a of descriptorRows(); track a.id) {
                    <tr>
                      <td><span class="badge text-bg-light border text-dark">P{{ a.periodNumber }}</span></td>
                      <td class="small fw-semibold">{{ a.gradeName }} · {{ a.subjectName }}</td>
                      <td><span class="badge text-bg-info">{{ a.indicatorType }}</span></td>
                      <td class="small">{{ a.description }}</td>
                      <td class="text-end">
                        <button type="button" class="btn btn-sm btn-outline-danger" (click)="deleteAchievement(a.id)" [appCustomTooltip]="'Eliminar descriptor'">
                          <i class="material-symbols-outlined fs-6">delete</i>
                        </button>
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="5" class="text-center text-muted py-4">No hay descriptores registrados para {{ academicYear() }}.</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }

          @case ('suggestions') {
            <div class="v3-form-panel">
              <div class="row g-3">
                <div class="col-12 col-md-6">
                  <label class="form-label">Curso (Grado / Asignatura) *</label>
                  <app-v3-searchable-select
                    [(ngModel)]="sugForm.courseId"
                    [options]="courseOptions()"
                    placeholder="Seleccione curso..."
                    searchPlaceholder="Buscar curso..."
                  />
                </div>
                <div class="col-12 col-md-6">
                  <label class="form-label">Periodo</label>
                  <app-v3-searchable-select
                    [(ngModel)]="sugForm.periodNumber"
                    [options]="periodOptions"
                    placeholder="Per."
                    searchPlaceholder="Buscar..."
                  />
                </div>
                <div class="col-12 col-md-6">
                  <label class="form-label">Categoría</label>
                  <app-v3-searchable-select
                    [(ngModel)]="sugForm.indicatorType"
                    [options]="suggestionTypeOptions"
                    placeholder="Categoría..."
                    searchPlaceholder="Buscar categoría..."
                  />
                </div>
                <div class="col-12 col-md-6">
                  <label class="form-label">Texto de Sugerencia / Observación *</label>
                  <input
                    type="text"
                    class="form-control"
                    [(ngModel)]="sugForm.description"
                    placeholder="Ej. Dedicar mayor tiempo a lectura comprensiva en casa..."
                  />
                </div>
                <div class="col-12 d-flex justify-content-end">
                  <button
                    type="button"
                    class="btn btn-sm btn-primary"
                    [disabled]="!sugForm.courseId || !sugForm.description.trim()"
                    (click)="saveSuggestion()"
                  >
                    Guardar sugerencia
                  </button>
                </div>
              </div>
            </div>

            <div class="table-responsive">
              <table class="table table-hover v3-grid-table mb-0">
                <thead>
                  <tr>
                    <th>Per.</th>
                    <th>Grado / Asignatura</th>
                    <th>Categoría</th>
                    <th>Detalle</th>
                    <th class="text-end">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  @for (s of suggestionRows(); track s.id) {
                    <tr>
                      <td><span class="badge text-bg-light border text-dark">P{{ s.periodNumber }}</span></td>
                      <td class="small fw-semibold">{{ s.gradeName }} · {{ s.subjectName }}</td>
                      <td>
                        <span class="badge" [ngClass]="s.indicatorType === 'SUGGESTION' ? 'text-bg-warning' : 'text-bg-secondary'">
                          {{ s.indicatorType === 'SUGGESTION' ? 'Sugerencia' : 'Observación' }}
                        </span>
                      </td>
                      <td class="small">{{ s.description }}</td>
                      <td class="text-end">
                        <button type="button" class="btn btn-sm btn-outline-danger" (click)="deleteAchievement(s.id)" [appCustomTooltip]="'Eliminar sugerencia'">
                          <i class="material-symbols-outlined fs-6">delete</i>
                        </button>
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="5" class="text-center text-muted py-4">Sin sugerencias u observaciones creadas.</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }

          @case ('lessonPlans') {
            <div class="v3-form-panel">
              <div class="row g-3">
                <div class="col-12 col-md-6">
                  <label class="form-label">Curso *</label>
                  <app-v3-searchable-select
                    [(ngModel)]="planForm.courseAssignmentId"
                    [options]="lessonPlanCourseOptions()"
                    placeholder="Seleccione curso..."
                    searchPlaceholder="Buscar curso..."
                  />
                </div>
                <div class="col-12 col-md-6">
                  <label class="form-label">Periodo</label>
                  <app-v3-searchable-select
                    [(ngModel)]="planForm.periodNumber"
                    [options]="periodOptions"
                    placeholder="Per."
                    searchPlaceholder="Buscar..."
                  />
                </div>
                <div class="col-12 col-md-6">
                  <label class="form-label">Título Parcelador / Plan *</label>
                  <input type="text" class="form-control" [(ngModel)]="planForm.title" placeholder="Parcelador Periodo 1" />
                </div>
                <div class="col-12 col-md-6">
                  <label class="form-label">Objetivo / Estándar</label>
                  <input type="text" class="form-control" [(ngModel)]="planForm.generalObjective" />
                </div>
                <div class="col-12 d-flex justify-content-end">
                  <button
                    type="button"
                    class="btn btn-sm btn-primary"
                    [disabled]="!planForm.courseAssignmentId || !planForm.title.trim()"
                    (click)="createLessonPlan()"
                  >
                    Crear Plan
                  </button>
                </div>
              </div>
            </div>

            @for (plan of lessonPlans(); track plan.id) {
              <div class="border rounded p-3 mb-3">
                <div class="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-2">
                  <div>
                    <span class="badge text-bg-primary me-2">P{{ plan.periodNumber }}</span>
                    <strong>{{ plan.title }}</strong>
                    <small class="text-muted ms-2">{{ plan.gradeGroupLabel }} · {{ plan.subjectName }}</small>
                    @if (plan.generalObjective) {
                      <div class="small text-muted mt-1">{{ plan.generalObjective }}</div>
                    }
                  </div>
                  <div class="d-flex gap-1">
                    <button
                      type="button"
                      class="btn btn-sm btn-outline-secondary"
                      (click)="printLessonPlan(plan)"
                      [appCustomTooltip]="'Imprimir parcelador / plan semanal en PDF'"
                    >
                      <i class="material-symbols-outlined fs-6 align-middle me-1">print</i>
                      PDF
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-danger" (click)="deleteLessonPlan(plan.id)" [appCustomTooltip]="'Eliminar plan de clase'">
                      <i class="material-symbols-outlined fs-6">delete</i>
                    </button>
                  </div>
                </div>

                <!-- Agregar unidad / semana del Plan Semanal (PlanSemanalView.js) -->
                <div class="v3-form-panel mb-2">
                  <div class="row g-3">
                    <div class="col-12 col-md-6">
                      <label class="form-label">Tema / Semana</label>
                      <input type="text" class="form-control" #topicIn placeholder="Tema / Semana..." />
                    </div>
                    <div class="col-12 col-md-6">
                      <label class="form-label">Actividades pedagógicas</label>
                      <input type="text" class="form-control" #actIn placeholder="Actividades pedagógicas..." />
                    </div>
                    <div class="col-12 col-md-6">
                      <label class="form-label">Evaluación / Indicador</label>
                      <input type="text" class="form-control" #evalIn placeholder="Evaluación / Indicador..." />
                    </div>
                    <div class="col-12 col-md-6">
                      <label class="form-label">Fecha programada</label>
                      <input type="date" class="form-control" #dateIn />
                    </div>
                    <div class="col-12 col-md-6">
                      <label class="form-label">Horas planeadas</label>
                      <input type="number" min="1" max="40" value="2" class="form-control" #hrsIn [appCustomTooltip]="'Horas planeadas'" />
                    </div>
                    <div class="col-12 col-md-6 d-flex align-items-end justify-content-md-end">
                      <button
                        type="button"
                        class="btn btn-sm btn-outline-primary"
                        (click)="addUnit(plan.id, topicIn.value, actIn.value, evalIn.value, dateIn.value, hrsIn.value); topicIn.value=''; actIn.value=''; evalIn.value=''"
                      >
                        Agregar unidad
                      </button>
                    </div>
                  </div>
                </div>

                <ul class="list-group list-group-flush small">
                  @for (u of plan.units; track u.id) {
                    <li class="list-group-item px-0 py-1 d-flex justify-content-between align-items-center">
                      <div>
                        <strong>U{{ u.unitNumber }}: {{ u.topicTitle }}</strong>
                        @if (u.executionDate) {
                          <span class="badge text-bg-light border text-dark ms-1">{{ u.executionDate }}</span>
                        }
                        <span class="badge text-bg-info ms-1">{{ u.plannedHours }}h</span>
                        @if (u.pedagogicalActivities) {
                          <span class="text-muted"> · {{ u.pedagogicalActivities }}</span>
                        }
                        @if (u.evaluationStrategy) {
                          <span class="text-muted"> · Eval: {{ u.evaluationStrategy }}</span>
                        }
                      </div>
                      <button type="button" class="btn btn-sm btn-link text-danger p-0" (click)="deleteUnit(u.id)" [appCustomTooltip]="'Quitar unidad'">
                        <i class="material-symbols-outlined fs-6">close</i>
                      </button>
                    </li>
                  } @empty {
                    <li class="list-group-item px-0 py-1 text-muted">Sin unidades o semanas registradas aún.</li>
                  }
                </ul>
              </div>
            } @empty {
              <p class="text-center text-muted py-4 mb-0">No hay planes de clase creados.</p>
            }
          }
        }
      </div>
    </div>
  `,
})
export class TeacherAchievementsPlanningComponent implements OnInit {
  private readonly portalService = inject(V3PortalService);
  private readonly settingsService = inject(V3SettingsService);
  private readonly academicService = inject(V3AcademicService);
  private readonly auth = inject(V3UnifiedAuthService);
  private readonly messages = inject(MessagesService);
  private readonly loadMask = inject(LoadMaskService);

  readonly academicYear = computed(() => this.auth.academicYear());
  readonly activeTab = signal<PlanningTab>('achievements');
  readonly courses = signal<TeacherCourseSummary[]>([]);
  readonly achievements = signal<AchievementStandardRow[]>([]);
  readonly lessonPlans = signal<LessonPlanRow[]>([]);
  readonly nationalScales = signal<NationalGradingScaleItem[]>([]);
  readonly dimensions = signal<EvaluationDimensionRecord[]>([]);

  readonly periodOptions: SearchableSelectOption<number>[] = [1, 2, 3, 4].map((p) => ({
    value: p,
    label: `P${p}`,
  }));
  readonly suggestionTypeOptions: SearchableSelectOption<string>[] = [
    { value: 'SUGGESTION', label: 'Sugerencia' },
    { value: 'OBSERVATION', label: 'Observación' },
  ];
  readonly courseOptions = computed<SearchableSelectOption<number>[]>(() =>
    this.courses().map((c) => ({ value: c.id, label: `${c.gradeName} · ${c.subjectName}` }))
  );
  readonly lessonPlanCourseOptions = computed<SearchableSelectOption<number>[]>(() =>
    this.courses().map((c) => ({
      value: c.id,
      label: `${c.gradeName}-${c.groupCode} · ${c.subjectName}`,
    }))
  );
  readonly dimensionOptions = computed<SearchableSelectOption<number>[]>(() =>
    this.dimensions().map((d) => ({ value: d.id, label: d.name }))
  );

  readonly descriptorRows = computed(() =>
    this.achievements().filter(
      (a) => a.indicatorType !== 'SUGGESTION' && a.indicatorType !== 'OBSERVATION',
    ),
  );
  readonly suggestionRows = computed(() =>
    this.achievements().filter(
      (a) => a.indicatorType === 'SUGGESTION' || a.indicatorType === 'OBSERVATION',
    ),
  );

  achCourseId = 0;
  achForm = {
    periodNumber: 1,
    dimensionId: null as number | null,
    indicatorType: 'ACHIEVEMENT',
    description: '',
    generateMultiScale: true,
  };
  sugForm = {
    courseId: 0,
    periodNumber: 1,
    indicatorType: 'SUGGESTION',
    description: '',
  };
  planForm = { courseAssignmentId: 0, periodNumber: 1, title: '', generalObjective: '' };

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.loadMask.show('Cargando planeación pedagógica...');
    const year = this.academicYear();
    forkJoin({
      courses: this.portalService.listTeacherCourses(year),
      achievements: this.portalService.listAchievements({ academicYear: year }),
      plans: this.portalService.listLessonPlans(year),
      nationalScales: this.settingsService.listNationalScales(),
      dimensions: this.settingsService.listDimensions(year),
    })
      .pipe(finalize(() => this.loadMask.hide()))
      .subscribe({
        next: (res) => {
          this.courses.set(res.courses);
          this.achievements.set(res.achievements);
          this.lessonPlans.set(res.plans);
          this.nationalScales.set(res.nationalScales);
          this.dimensions.set(res.dimensions);
          if (res.courses.length > 0) {
            if (!this.achCourseId) this.achCourseId = res.courses[0].id;
            if (!this.sugForm.courseId) this.sugForm.courseId = res.courses[0].id;
            if (!this.planForm.courseAssignmentId) {
              this.planForm.courseAssignmentId = res.courses[0].id;
            }
          }
        },
      });
  }

  buildScaleDescription(scale: NationalGradingScaleItem, baseText: string): string {
    const prefix = scale.reportMessage?.trim();
    const body = baseText.trim();
    return prefix ? `${prefix} ${body}` : `[${scale.name}] ${body}`;
  }

  saveAchievement(): void {
    const course = this.courses().find((c) => c.id === Number(this.achCourseId));
    if (!course) return;
    const baseText = this.achForm.description.trim();

    if (this.achForm.generateMultiScale && this.nationalScales().length > 0) {
      this.portalService
        .createAchievementsMultiScale({
          gradeId: course.gradeId,
          subjectId: course.subjectId,
          dimensionId: this.achForm.dimensionId || null,
          academicYear: this.academicYear(),
          periodNumber: Number(this.achForm.periodNumber),
          indicatorType: this.achForm.indicatorType,
          variants: this.nationalScales().map((sc) => ({
            nationalScaleId: sc.id,
            description: this.buildScaleDescription(sc, baseText),
          })),
        })
        .subscribe(({ createdCount }) => {
          this.messages.showSuccess(
            `Se crearon ${createdCount} descriptores multi-escala correctamente.`,
          );
          this.achForm.description = '';
          this.loadAll();
        });
      return;
    }

    this.portalService
      .saveAchievement({
        gradeId: course.gradeId,
        subjectId: course.subjectId,
        academicYear: this.academicYear(),
        periodNumber: Number(this.achForm.periodNumber),
        indicatorType: this.achForm.indicatorType,
        description: baseText,
      })
      .subscribe(() => {
        this.messages.showSuccess('Descriptor registrado.');
        this.achForm.description = '';
        this.loadAll();
      });
  }

  saveSuggestion(): void {
    const course = this.courses().find((c) => c.id === Number(this.sugForm.courseId));
    if (!course) return;
    this.portalService
      .saveAchievement({
        gradeId: course.gradeId,
        subjectId: course.subjectId,
        academicYear: this.academicYear(),
        periodNumber: Number(this.sugForm.periodNumber),
        indicatorType: this.sugForm.indicatorType,
        description: this.sugForm.description.trim(),
      })
      .subscribe(() => {
        this.messages.showSuccess('Sugerencia / observación registrada.');
        this.sugForm.description = '';
        this.loadAll();
      });
  }

  deleteAchievement(id: number): void {
    this.portalService.deleteAchievement(id).subscribe(() => {
      this.messages.showSuccess('Registro eliminado.');
      this.loadAll();
    });
  }

  importFromPreviousYear(): void {
    this.portalService
      .importAchievements({
        fromYear: this.academicYear() - 1,
        toYear: this.academicYear(),
      })
      .subscribe(({ importedCount }) => {
        this.messages.showSuccess(`Se importaron ${importedCount} descriptores desde ${this.academicYear() - 1}.`);
        this.loadAll();
      });
  }

  createLessonPlan(): void {
    this.portalService
      .createLessonPlan({
        courseAssignmentId: Number(this.planForm.courseAssignmentId),
        academicYear: this.academicYear(),
        periodNumber: Number(this.planForm.periodNumber),
        title: this.planForm.title.trim(),
        generalObjective: this.planForm.generalObjective.trim() || null,
      })
      .subscribe(() => {
        this.messages.showSuccess('Parcelador / plan de clase creado.');
        this.planForm.title = '';
        this.planForm.generalObjective = '';
        this.loadAll();
      });
  }

  deleteLessonPlan(id: number): void {
    this.portalService.deleteLessonPlan(id).subscribe(() => {
      this.messages.showSuccess('Plan eliminado.');
      this.loadAll();
    });
  }

  addUnit(
    planId: number,
    topicTitle: string,
    activities: string,
    evaluationStrategy: string,
    executionDate: string,
    plannedHoursRaw: string,
  ): void {
    if (!topicTitle.trim()) return;
    this.portalService
      .addLessonPlanUnit(planId, {
        topicTitle: topicTitle.trim(),
        pedagogicalActivities: activities.trim() || null,
        evaluationStrategy: evaluationStrategy.trim() || null,
        executionDate: executionDate || null,
        plannedHours: Number(plannedHoursRaw) || 2,
      })
      .subscribe(() => {
        this.messages.showSuccess('Unidad / semana agregada al parcelador.');
        this.loadAll();
      });
  }

  deleteUnit(unitId: number): void {
    this.portalService.deleteLessonPlanUnit(unitId).subscribe(() => this.loadAll());
  }

  printLessonPlan(plan: LessonPlanRow): void {
    this.academicService
      .enqueueJasperReport({
        templateName: 'parcelador_clases',
        outputFormat: 'pdf',
        parameters: {
          P_YEAR: this.academicYear(),
          P_LESSON_PLAN_ID: plan.id,
          P_PERIOD: plan.periodNumber,
        },
      })
      .subscribe((res) => {
        this.messages.showSuccess(
          `Parcelador "${plan.title}" encolado en PDF (Job #${res.jobId}). Descárguelo desde Informes.`,
        );
      });
  }
}
