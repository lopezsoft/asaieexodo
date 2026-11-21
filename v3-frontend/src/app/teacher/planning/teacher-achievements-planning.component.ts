import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { LoadMaskService } from '../../services/common/load-mask.service';
import { MessagesService } from '../../services/messages.service';
import {
  AchievementStandardRow,
  LessonPlanRow,
  TeacherCourseSummary,
  V3PortalService,
} from '../../services/v3-portal.service';
import { V3UnifiedAuthService } from '../../services/v3-unified-auth.service';
import { CustomTooltipDirective } from '../../shared/directives/custom-tooltip.directive';

/**
 * Banco de Logros/Indicadores (con importación interanual) y Planes de Clase / Parcelador
 * (reemplaza LogrosView, ImportarLogrosView y ParceladorView de ExtJS / asaie-teachers).
 */
@Component({
  selector: 'app-teacher-achievements-planning',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CustomTooltipDirective],
  template: `
    <div class="container-fluid py-3">
      <div class="breadcrumb-card mb-25 d-md-flex align-items-center justify-content-between">
        <div>
          <h5 class="mb-0 fw-bold">Logros, Indicadores y Planes de Clase</h5>
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
            Logros y Sugerencias ({{ achievements().length }})
          </button>
        </li>
        <li class="nav-item">
          <button type="button" class="nav-link" [class.active]="activeTab() === 'lessonPlans'" (click)="activeTab.set('lessonPlans')">
            Planes de Clase / Parcelador ({{ lessonPlans().length }})
          </button>
        </li>
      </ul>

      <div class="trezo-card bg-white border-radius p-4 shadow-sm">
        @if (activeTab() === 'achievements') {
          <div class="d-flex justify-content-end mb-3">
            <button
              type="button"
              class="btn btn-sm btn-outline-info"
              (click)="importFromPreviousYear()"
              [appCustomTooltip]="'Copiar logros del año lectivo anterior hacia el actual'"
            >
              <i class="material-symbols-outlined fs-6 align-middle me-1">download</i>
              Importar logros de {{ academicYear() - 1 }}
            </button>
          </div>

          <div class="row g-2 align-items-end mb-4 p-3 rounded bg-light border">
            <div class="col-md-3">
              <label class="form-label small fw-semibold">Curso (Grado / Asignatura) *</label>
              <select class="form-select form-select-sm" [(ngModel)]="achCourseId">
                @for (c of courses(); track c.id) {
                  <option [ngValue]="c.id">{{ c.gradeName }} · {{ c.subjectName }}</option>
                }
              </select>
            </div>
            <div class="col-md-1">
              <label class="form-label small fw-semibold">Per.</label>
              <select class="form-select form-select-sm" [(ngModel)]="achForm.periodNumber">
                @for (p of [1, 2, 3, 4]; track p) {
                  <option [ngValue]="p">P{{ p }}</option>
                }
              </select>
            </div>
            <div class="col-md-2">
              <label class="form-label small fw-semibold">Tipo</label>
              <select class="form-select form-select-sm" [(ngModel)]="achForm.indicatorType">
                <option value="ACHIEVEMENT">Logro / Indicador</option>
                <option value="SUGGESTION">Sugerencia</option>
                <option value="STRENGTH">Fortaleza</option>
                <option value="DIFFICULTY">Dificultad</option>
              </select>
            </div>
            <div class="col-md-4">
              <label class="form-label small fw-semibold">Descripción *</label>
              <input type="text" class="form-control form-control-sm" [(ngModel)]="achForm.description" placeholder="Reconoce y resuelve ecuaciones..." />
            </div>
            <div class="col-md-2 d-grid">
              <button
                type="button"
                class="btn btn-sm btn-primary"
                [disabled]="!achCourseId || !achForm.description.trim()"
                (click)="saveAchievement()"
              >
                Agregar Logro
              </button>
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
                @for (a of achievements(); track a.id) {
                  <tr>
                    <td><span class="badge text-bg-light border text-dark">P{{ a.periodNumber }}</span></td>
                    <td class="small fw-semibold">{{ a.gradeName }} · {{ a.subjectName }}</td>
                    <td><span class="badge text-bg-info">{{ a.indicatorType }}</span></td>
                    <td class="small">{{ a.description }}</td>
                    <td class="text-end">
                      <button type="button" class="btn btn-sm btn-outline-danger" (click)="deleteAchievement(a.id)" [appCustomTooltip]="'Eliminar logro'">
                        <i class="material-symbols-outlined fs-6">delete</i>
                      </button>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="5" class="text-center text-muted py-4">No hay logros registrados para {{ academicYear() }}.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else {
          <div class="row g-2 align-items-end mb-4 p-3 rounded bg-light border">
            <div class="col-md-3">
              <label class="form-label small fw-semibold">Curso *</label>
              <select class="form-select form-select-sm" [(ngModel)]="planForm.courseAssignmentId">
                @for (c of courses(); track c.id) {
                  <option [ngValue]="c.id">{{ c.gradeName }}-{{ c.groupCode }} · {{ c.subjectName }}</option>
                }
              </select>
            </div>
            <div class="col-md-1">
              <label class="form-label small fw-semibold">Per.</label>
              <select class="form-select form-select-sm" [(ngModel)]="planForm.periodNumber">
                @for (p of [1, 2, 3, 4]; track p) {
                  <option [ngValue]="p">P{{ p }}</option>
                }
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label small fw-semibold">Título del Plan *</label>
              <input type="text" class="form-control form-control-sm" [(ngModel)]="planForm.title" placeholder="Plan de Periodo 1" />
            </div>
            <div class="col-md-3">
              <label class="form-label small fw-semibold">Objetivo General</label>
              <input type="text" class="form-control form-control-sm" [(ngModel)]="planForm.generalObjective" />
            </div>
            <div class="col-md-2 d-grid">
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

          @for (plan of lessonPlans(); track plan.id) {
            <div class="border rounded p-3 mb-3">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <span class="badge text-bg-primary me-2">P{{ plan.periodNumber }}</span>
                  <strong>{{ plan.title }}</strong>
                  <small class="text-muted ms-2">{{ plan.gradeGroupLabel }} · {{ plan.subjectName }}</small>
                  @if (plan.generalObjective) {
                    <div class="small text-muted mt-1">{{ plan.generalObjective }}</div>
                  }
                </div>
                <button type="button" class="btn btn-sm btn-outline-danger" (click)="deleteLessonPlan(plan.id)" [appCustomTooltip]="'Eliminar plan de clase'">
                  <i class="material-symbols-outlined fs-6">delete</i>
                </button>
              </div>

              <div class="input-group input-group-sm mb-2">
                <input type="text" class="form-control" #topicIn placeholder="Nuevo tema o unidad del parcelador..." />
                <input type="text" class="form-control" #actIn placeholder="Actividades pedagógicas..." />
                <button
                  type="button"
                  class="btn btn-outline-primary"
                  (click)="addUnit(plan.id, topicIn.value, actIn.value); topicIn.value = ''; actIn.value = ''"
                >
                  + Unidad
                </button>
              </div>

              <ul class="list-group list-group-flush small">
                @for (u of plan.units; track u.id) {
                  <li class="list-group-item px-0 py-1 d-flex justify-content-between align-items-center">
                    <div>
                      <strong>Unidad {{ u.unitNumber }}: {{ u.topicTitle }}</strong>
                      @if (u.pedagogicalActivities) {
                        <span class="text-muted"> — {{ u.pedagogicalActivities }}</span>
                      }
                    </div>
                    <button type="button" class="btn btn-sm btn-link text-danger p-0" (click)="deleteUnit(u.id)" [appCustomTooltip]="'Quitar unidad'">
                      <i class="material-symbols-outlined fs-6">close</i>
                    </button>
                  </li>
                } @empty {
                  <li class="list-group-item px-0 py-1 text-muted">Sin unidades parceladas aún.</li>
                }
              </ul>
            </div>
          } @empty {
            <p class="text-center text-muted py-4 mb-0">No hay planes de clase creados.</p>
          }
        }
      </div>
    </div>
  `,
})
export class TeacherAchievementsPlanningComponent implements OnInit {
  private readonly portalService = inject(V3PortalService);
  private readonly auth = inject(V3UnifiedAuthService);
  private readonly messages = inject(MessagesService);
  private readonly loadMask = inject(LoadMaskService);

  readonly academicYear = computed(() => this.auth.academicYear());
  readonly activeTab = signal<'achievements' | 'lessonPlans'>('achievements');
  readonly courses = signal<TeacherCourseSummary[]>([]);
  readonly achievements = signal<AchievementStandardRow[]>([]);
  readonly lessonPlans = signal<LessonPlanRow[]>([]);

  achCourseId = 0;
  achForm = { periodNumber: 1, indicatorType: 'ACHIEVEMENT', description: '' };
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
    })
      .pipe(finalize(() => this.loadMask.hide()))
      .subscribe({
        next: (res) => {
          this.courses.set(res.courses);
          this.achievements.set(res.achievements);
          this.lessonPlans.set(res.plans);
          if (res.courses.length > 0 && !this.achCourseId) {
            this.achCourseId = res.courses[0].id;
            this.planForm.courseAssignmentId = res.courses[0].id;
          }
        },
      });
  }

  saveAchievement(): void {
    const course = this.courses().find((c) => c.id === Number(this.achCourseId));
    if (!course) return;
    this.portalService
      .saveAchievement({
        gradeId: course.gradeId,
        subjectId: course.subjectId,
        academicYear: this.academicYear(),
        periodNumber: Number(this.achForm.periodNumber),
        indicatorType: this.achForm.indicatorType,
        description: this.achForm.description.trim(),
      })
      .subscribe(() => {
        this.messages.showSuccess('Logro registrado.');
        this.achForm.description = '';
        this.loadAll();
      });
  }

  deleteAchievement(id: number): void {
    this.portalService.deleteAchievement(id).subscribe(() => {
      this.messages.showSuccess('Logro eliminado.');
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
        this.messages.showSuccess(`Se importaron ${importedCount} logros desde ${this.academicYear() - 1}.`);
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
        this.messages.showSuccess('Plan de clase creado.');
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

  addUnit(planId: number, topicTitle: string, activities: string): void {
    if (!topicTitle.trim()) return;
    this.portalService
      .addLessonPlanUnit(planId, {
        topicTitle: topicTitle.trim(),
        pedagogicalActivities: activities.trim() || null,
      })
      .subscribe(() => {
        this.messages.showSuccess('Unidad agregada al parcelador.');
        this.loadAll();
      });
  }

  deleteUnit(unitId: number): void {
    this.portalService.deleteLessonPlanUnit(unitId).subscribe(() => this.loadAll());
  }
}
