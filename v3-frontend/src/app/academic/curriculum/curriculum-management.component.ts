import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { LoadMaskService } from '../../services/common/load-mask.service';
import { MessagesService } from '../../services/messages.service';
import {
  AcademicAreaRecord,
  CourseAssignmentRecord,
  StudyPlanRecord,
  SubjectRecord,
  V3AcademicService,
} from '../../services/v3-academic.service';
import {
  GroupManagerRecord,
  TeacherProfileRecord,
  V3AdministrationService,
} from '../../services/v3-administration.service';
import {
  SchoolAcademicContextCatalogs,
  V3CatalogsService,
} from '../../services/v3-catalogs.service';
import { V3UnifiedAuthService } from '../../services/v3-unified-auth.service';
import { CustomTooltipDirective } from '../../shared/directives/custom-tooltip.directive';

type CurriculumTab = 'areas' | 'subjects' | 'studyPlans' | 'assignments';

/**
 * Currículo y Carga Académica (reemplaza AreasView, AsignaturasView, PlanEstudiosView,
 * CargaAcademicaView y TrasladoCargaView de ExtJS).
 */
@Component({
  selector: 'app-curriculum-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CustomTooltipDirective],
  template: `
    <div class="container-fluid py-3">
      <div class="breadcrumb-card mb-25 d-md-flex align-items-center justify-content-between">
        <div>
          <h5 class="mb-0 fw-bold">Currículo y Carga Académica</h5>
          <small class="text-muted">
            Año lectivo {{ academicYear() }} · Áreas, asignaturas, plan de estudios y carga docente
          </small>
        </div>
        <ol class="breadcrumb list-unstyled mt-0 mb-0 p-0">
          <li class="breadcrumb-item d-inline-block position-relative">
            <a routerLink="/academic" class="d-inline-block position-relative">Académico</a>
          </li>
          <li class="breadcrumb-item d-inline-block position-relative">Currículo y Carga</li>
        </ol>
      </div>

      <ul class="nav nav-pills mb-3 gap-2">
        <li class="nav-item">
          <button type="button" class="nav-link" [class.active]="activeTab() === 'areas'" (click)="activeTab.set('areas')">
            Áreas ({{ areas().length }})
          </button>
        </li>
        <li class="nav-item">
          <button type="button" class="nav-link" [class.active]="activeTab() === 'subjects'" (click)="activeTab.set('subjects')">
            Asignaturas ({{ subjects().length }})
          </button>
        </li>
        <li class="nav-item">
          <button type="button" class="nav-link" [class.active]="activeTab() === 'studyPlans'" (click)="activeTab.set('studyPlans')">
            Plan de Estudios ({{ studyPlans().length }})
          </button>
        </li>
        <li class="nav-item">
          <button type="button" class="nav-link" [class.active]="activeTab() === 'assignments'" (click)="activeTab.set('assignments')">
            Carga Académica ({{ assignments().length }})
          </button>
        </li>
      </ul>

      <div class="trezo-card bg-white border-radius p-4 shadow-sm">
        @switch (activeTab()) {
          @case ('areas') {
            @if (canWrite()) {
              <div class="row g-2 align-items-end mb-4 p-3 rounded bg-light border">
                <div class="col-md-4">
                  <label class="form-label small fw-semibold">Nombre del área *</label>
                  <input type="text" class="form-control form-control-sm" [(ngModel)]="areaForm.name" placeholder="Ej. Matemáticas" />
                </div>
                <div class="col-md-2">
                  <label class="form-label small fw-semibold">Abreviatura</label>
                  <input type="text" class="form-control form-control-sm" [(ngModel)]="areaForm.abbreviation" placeholder="MAT" />
                </div>
                <div class="col-md-1">
                  <label class="form-label small fw-semibold">Orden</label>
                  <input type="number" class="form-control form-control-sm" [(ngModel)]="areaForm.displayOrder" />
                </div>
                <div class="col-md-3">
                  <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" id="failsYear" [(ngModel)]="areaForm.failsSchoolYear" />
                    <label class="form-check-label small" for="failsYear">Reprueba año escolar</label>
                  </div>
                </div>
                <div class="col-md-2 d-flex gap-1">
                  <button type="button" class="btn btn-sm btn-primary flex-grow-1" [disabled]="!areaForm.name.trim()" (click)="saveArea()">
                    {{ editingAreaId() ? 'Actualizar' : 'Agregar' }}
                  </button>
                  @if (editingAreaId()) {
                    <button type="button" class="btn btn-sm btn-outline-secondary" (click)="resetAreaForm()" [appCustomTooltip]="'Cancelar edición'">
                      <i class="material-symbols-outlined fs-6">close</i>
                    </button>
                  }
                </div>
              </div>
            }
            <div class="table-responsive">
              <table class="table table-hover v3-grid-table mb-0">
                <thead>
                  <tr>
                    <th>Orden</th>
                    <th>Área Académica</th>
                    <th>Abrev.</th>
                    <th class="text-center">Reprueba Año</th>
                    <th class="text-center">Estado</th>
                    <th class="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  @for (area of areas(); track area.id) {
                    <tr>
                      <td>{{ area.displayOrder }}</td>
                      <td class="fw-semibold">{{ area.name }}</td>
                      <td>{{ area.abbreviation || '—' }}</td>
                      <td class="text-center">
                        <span class="badge" [ngClass]="area.failsSchoolYear ? 'text-bg-warning' : 'text-bg-secondary'">
                          {{ area.failsSchoolYear ? 'Sí' : 'No' }}
                        </span>
                      </td>
                      <td class="text-center">
                        <span class="badge" [ngClass]="area.isActive ? 'text-bg-success' : 'text-bg-secondary'">
                          {{ area.isActive ? 'Activa' : 'Inactiva' }}
                        </span>
                      </td>
                      <td class="text-end text-nowrap">
                        @if (canWrite()) {
                          <button type="button" class="btn btn-sm btn-outline-primary me-1" (click)="editArea(area)" [appCustomTooltip]="'Editar área'">
                            <i class="material-symbols-outlined fs-6">edit</i>
                          </button>
                        }
                        @if (canDelete()) {
                          <button type="button" class="btn btn-sm btn-outline-danger" (click)="deleteArea(area)" [appCustomTooltip]="'Eliminar área'">
                            <i class="material-symbols-outlined fs-6">delete</i>
                          </button>
                        }
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="6" class="text-center text-muted py-4">No hay áreas académicas registradas.</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }

          @case ('subjects') {
            @if (canWrite()) {
              <div class="row g-2 align-items-end mb-4 p-3 rounded bg-light border">
                <div class="col-md-3">
                  <label class="form-label small fw-semibold">Área *</label>
                  <select class="form-select form-select-sm" [(ngModel)]="subjectForm.academicAreaId">
                    <option [ngValue]="0">Seleccione área...</option>
                    @for (a of areas(); track a.id) {
                      <option [ngValue]="a.id">{{ a.name }}</option>
                    }
                  </select>
                </div>
                <div class="col-md-3">
                  <label class="form-label small fw-semibold">Asignatura *</label>
                  <input type="text" class="form-control form-control-sm" [(ngModel)]="subjectForm.name" placeholder="Ej. Álgebra" />
                </div>
                <div class="col-md-2">
                  <label class="form-label small fw-semibold">Abrev.</label>
                  <input type="text" class="form-control form-control-sm" [(ngModel)]="subjectForm.abbreviation" placeholder="ALG" />
                </div>
                <div class="col-md-2">
                  <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" id="isElective" [(ngModel)]="subjectForm.isElective" />
                    <label class="form-check-label small" for="isElective">Optativa / Electiva</label>
                  </div>
                </div>
                <div class="col-md-2 d-flex gap-1">
                  <button
                    type="button"
                    class="btn btn-sm btn-primary flex-grow-1"
                    [disabled]="!subjectForm.name.trim() || !subjectForm.academicAreaId"
                    (click)="saveSubject()"
                  >
                    {{ editingSubjectId() ? 'Actualizar' : 'Agregar' }}
                  </button>
                  @if (editingSubjectId()) {
                    <button type="button" class="btn btn-sm btn-outline-secondary" (click)="resetSubjectForm()" [appCustomTooltip]="'Cancelar edición'">
                      <i class="material-symbols-outlined fs-6">close</i>
                    </button>
                  }
                </div>
              </div>
            }
            <div class="table-responsive">
              <table class="table table-hover v3-grid-table mb-0">
                <thead>
                  <tr>
                    <th>Área</th>
                    <th>Asignatura</th>
                    <th>Abrev.</th>
                    <th class="text-center">Tipo</th>
                    <th class="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  @for (sub of subjects(); track sub.id) {
                    <tr>
                      <td>{{ sub.academicAreaName }}</td>
                      <td class="fw-semibold">{{ sub.name }}</td>
                      <td>{{ sub.abbreviation || '—' }}</td>
                      <td class="text-center">
                        <span class="badge" [ngClass]="sub.isElective ? 'text-bg-info' : 'text-bg-primary'">
                          {{ sub.isElective ? 'Electiva' : 'Obligatoria' }}
                        </span>
                      </td>
                      <td class="text-end text-nowrap">
                        @if (canWrite()) {
                          <button type="button" class="btn btn-sm btn-outline-primary me-1" (click)="editSubject(sub)" [appCustomTooltip]="'Editar asignatura'">
                            <i class="material-symbols-outlined fs-6">edit</i>
                          </button>
                        }
                        @if (canDelete()) {
                          <button type="button" class="btn btn-sm btn-outline-danger" (click)="deleteSubject(sub)" [appCustomTooltip]="'Eliminar asignatura'">
                            <i class="material-symbols-outlined fs-6">delete</i>
                          </button>
                        }
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="5" class="text-center text-muted py-4">No hay asignaturas registradas.</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }

          @case ('studyPlans') {
            @if (canWrite()) {
              <div class="row g-2 align-items-end mb-4 p-3 rounded bg-light border">
                <div class="col-md-3">
                  <label class="form-label small fw-semibold">Sede (opcional)</label>
                  <select class="form-select form-select-sm" [(ngModel)]="studyPlanForm.campusId">
                    <option [ngValue]="null">Todas las sedes</option>
                    @for (c of schoolContext()?.campuses ?? []; track c.id) {
                      <option [ngValue]="c.id">{{ c.name }}</option>
                    }
                  </select>
                </div>
                <div class="col-md-2">
                  <label class="form-label small fw-semibold">Grado *</label>
                  <select class="form-select form-select-sm" [(ngModel)]="studyPlanForm.gradeId">
                    <option [ngValue]="0">Seleccione...</option>
                    @for (g of schoolContext()?.grades ?? []; track g.id) {
                      <option [ngValue]="g.id">{{ g.name }}</option>
                    }
                  </select>
                </div>
                <div class="col-md-3">
                  <label class="form-label small fw-semibold">Asignatura *</label>
                  <select class="form-select form-select-sm" [(ngModel)]="studyPlanForm.subjectId">
                    <option [ngValue]="0">Seleccione...</option>
                    @for (s of subjects(); track s.id) {
                      <option [ngValue]="s.id">{{ s.academicAreaName }} · {{ s.name }}</option>
                    }
                  </select>
                </div>
                <div class="col-md-1">
                  <label class="form-label small fw-semibold">IHS *</label>
                  <input type="number" min="1" max="40" class="form-control form-control-sm" [(ngModel)]="studyPlanForm.weeklyHours" />
                </div>
                <div class="col-md-1">
                  <label class="form-label small fw-semibold">% Área</label>
                  <input type="number" min="0" max="100" class="form-control form-control-sm" [(ngModel)]="studyPlanForm.areaWeightPercentage" />
                </div>
                <div class="col-md-2 d-grid">
                  <button
                    type="button"
                    class="btn btn-sm btn-primary"
                    [disabled]="!studyPlanForm.gradeId || !studyPlanForm.subjectId"
                    (click)="saveStudyPlan()"
                  >
                    Guardar Plan
                  </button>
                </div>
              </div>
            }
            <div class="table-responsive">
              <table class="table table-hover v3-grid-table mb-0">
                <thead>
                  <tr>
                    <th>Sede</th>
                    <th>Grado</th>
                    <th>Área</th>
                    <th>Asignatura</th>
                    <th class="text-center">IHS</th>
                    <th class="text-center">% Área</th>
                    <th class="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  @for (p of studyPlans(); track p.id) {
                    <tr>
                      <td>{{ p.campusName || 'General' }}</td>
                      <td class="fw-semibold">{{ p.gradeName }}</td>
                      <td>{{ p.academicAreaName }}</td>
                      <td>{{ p.subjectName }}</td>
                      <td class="text-center">{{ p.weeklyHours }} h</td>
                      <td class="text-center">{{ p.areaWeightPercentage }}%</td>
                      <td class="text-end">
                        @if (canWrite()) {
                          <button type="button" class="btn btn-sm btn-outline-danger" (click)="deleteStudyPlan(p)" [appCustomTooltip]="'Quitar del plan de estudios'">
                            <i class="material-symbols-outlined fs-6">delete</i>
                          </button>
                        }
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="7" class="text-center text-muted py-4">No hay plan de estudios configurado para {{ academicYear() }}.</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }

          @case ('assignments') {
            @if (canWrite()) {
              <div class="row g-2 align-items-end mb-3 p-3 rounded bg-light border">
                <div class="col-md-3">
                  <label class="form-label small fw-semibold">Grupo (Sede · Jornada · Grado) *</label>
                  <select class="form-select form-select-sm" [(ngModel)]="assignmentForm.academicGroupId" (ngModelChange)="onAssignmentGroupChange($event)">
                    <option [ngValue]="0">Seleccione grupo...</option>
                    @for (grp of groups(); track grp.id) {
                      <option [ngValue]="grp.id">
                        {{ grp.gradeName }}-{{ grp.groupCode }} ({{ grp.campusName }} · {{ grp.shiftName }})
                      </option>
                    }
                  </select>
                </div>
                <div class="col-md-3">
                  <label class="form-label small fw-semibold">Asignatura *</label>
                  <select class="form-select form-select-sm" [(ngModel)]="assignmentForm.subjectId">
                    <option [ngValue]="0">Seleccione asignatura...</option>
                    @for (s of subjects(); track s.id) {
                      <option [ngValue]="s.id">{{ s.name }} ({{ s.academicAreaName }})</option>
                    }
                  </select>
                </div>
                <div class="col-md-3">
                  <label class="form-label small fw-semibold">Docente *</label>
                  <select class="form-select form-select-sm" [(ngModel)]="assignmentForm.teacherProfileId">
                    <option [ngValue]="0">Seleccione docente...</option>
                    @for (t of teachers(); track t.id) {
                      <option [ngValue]="t.id">{{ t.fullName }}</option>
                    }
                  </select>
                </div>
                <div class="col-md-1">
                  <label class="form-label small fw-semibold">IHS</label>
                  <input type="number" min="1" max="40" class="form-control form-control-sm" [(ngModel)]="assignmentForm.weeklyHours" />
                </div>
                <div class="col-md-2 d-grid">
                  <button
                    type="button"
                    class="btn btn-sm btn-primary"
                    [disabled]="!assignmentForm.academicGroupId || !assignmentForm.subjectId || !assignmentForm.teacherProfileId"
                    (click)="saveAssignment()"
                  >
                    Asignar Carga
                  </button>
                </div>
              </div>

              <div class="row g-2 align-items-end mb-4 p-3 rounded border border-warning-subtle bg-warning-subtle">
                <div class="col-md-4">
                  <label class="form-label small fw-semibold">Traslado masivo · Docente origen</label>
                  <select class="form-select form-select-sm" [(ngModel)]="reassignForm.fromTeacherId">
                    <option [ngValue]="0">Seleccione docente origen...</option>
                    @for (t of teachers(); track t.id) {
                      <option [ngValue]="t.id">{{ t.fullName }}</option>
                    }
                  </select>
                </div>
                <div class="col-md-4">
                  <label class="form-label small fw-semibold">Docente destino</label>
                  <select class="form-select form-select-sm" [(ngModel)]="reassignForm.toTeacherId">
                    <option [ngValue]="0">Seleccione docente destino...</option>
                    @for (t of teachers(); track t.id) {
                      <option [ngValue]="t.id">{{ t.fullName }}</option>
                    }
                  </select>
                </div>
                <div class="col-md-4 d-grid">
                  <button
                    type="button"
                    class="btn btn-sm btn-warning fw-semibold"
                    [disabled]="!reassignForm.fromTeacherId || !reassignForm.toTeacherId || reassignForm.fromTeacherId === reassignForm.toTeacherId"
                    (click)="reassignTeacher()"
                  >
                    <i class="material-symbols-outlined fs-6 align-middle me-1">swap_horiz</i>
                    Trasladar toda la carga ({{ academicYear() }})
                  </button>
                </div>
              </div>
            }

            <div class="table-responsive">
              <table class="table table-hover v3-grid-table mb-0">
                <thead>
                  <tr>
                    <th>Docente</th>
                    <th>Sede / Jornada</th>
                    <th>Grado / Grupo</th>
                    <th>Asignatura</th>
                    <th class="text-center">IHS</th>
                    <th class="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  @for (c of assignments(); track c.id) {
                    <tr>
                      <td class="fw-semibold">{{ c.teacherName }}</td>
                      <td class="small">{{ c.campusName }} · {{ c.shiftName }}</td>
                      <td>
                        <span class="badge text-bg-light border text-dark">{{ c.gradeName }} - {{ c.groupCode }}</span>
                      </td>
                      <td>{{ c.subjectName }} <small class="text-muted">({{ c.academicAreaName }})</small></td>
                      <td class="text-center">{{ c.weeklyHours }} h</td>
                      <td class="text-end">
                        @if (canWrite()) {
                          <button type="button" class="btn btn-sm btn-outline-danger" (click)="deleteAssignment(c)" [appCustomTooltip]="'Eliminar carga académica'">
                            <i class="material-symbols-outlined fs-6">delete</i>
                          </button>
                        }
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="6" class="text-center text-muted py-4">No hay carga académica asignada en {{ academicYear() }}.</td>
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
export class CurriculumManagementComponent implements OnInit {
  private readonly academicService = inject(V3AcademicService);
  private readonly adminService = inject(V3AdministrationService);
  private readonly catalogsService = inject(V3CatalogsService);
  private readonly auth = inject(V3UnifiedAuthService);
  private readonly messages = inject(MessagesService);
  private readonly loadMask = inject(LoadMaskService);

  readonly academicYear = computed(() => this.auth.academicYear());
  readonly canWrite = computed(() =>
    this.auth.hasAnyRole(['SUPER_ADMIN', 'SCHOOL_ADMIN', 'RECTOR', 'COORDINATOR', 'SECRETARY']),
  );
  readonly canDelete = computed(() =>
    this.auth.hasAnyRole(['SUPER_ADMIN', 'SCHOOL_ADMIN', 'RECTOR']),
  );

  readonly activeTab = signal<CurriculumTab>('areas');
  readonly areas = signal<AcademicAreaRecord[]>([]);
  readonly subjects = signal<SubjectRecord[]>([]);
  readonly studyPlans = signal<StudyPlanRecord[]>([]);
  readonly assignments = signal<CourseAssignmentRecord[]>([]);
  readonly teachers = signal<TeacherProfileRecord[]>([]);
  readonly groups = signal<GroupManagerRecord[]>([]);
  readonly schoolContext = signal<SchoolAcademicContextCatalogs | null>(null);

  readonly editingAreaId = signal<number | null>(null);
  readonly editingSubjectId = signal<number | null>(null);

  areaForm = { name: '', abbreviation: '', failsSchoolYear: true, displayOrder: 1 };
  subjectForm = { academicAreaId: 0, name: '', abbreviation: '', isElective: false, displayOrder: 1 };
  studyPlanForm = {
    campusId: null as number | null,
    gradeId: 0,
    subjectId: 0,
    weeklyHours: 4,
    areaWeightPercentage: 100,
  };
  assignmentForm = {
    campusId: 0,
    shiftId: 0,
    gradeId: 0,
    academicGroupId: 0,
    subjectId: 0,
    teacherProfileId: 0,
    weeklyHours: 4,
    areaWeightPercentage: 100,
  };
  reassignForm = { fromTeacherId: 0, toTeacherId: 0 };

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.loadMask.show('Cargando currículo y carga académica...');
    const year = this.academicYear();
    forkJoin({
      areas: this.academicService.listAreas(),
      subjects: this.academicService.listSubjects(),
      studyPlans: this.academicService.listStudyPlans(year),
      assignments: this.academicService.listCourseAssignments(year),
      teachers: this.adminService.listTeachers({ limit: 200 }),
      groups: this.adminService.listGroupManagers(year),
      context: this.catalogsService.getSchoolContext(),
    })
      .pipe(finalize(() => this.loadMask.hide()))
      .subscribe({
        next: (res) => {
          this.areas.set(res.areas);
          this.subjects.set(res.subjects);
          this.studyPlans.set(res.studyPlans);
          this.assignments.set(res.assignments);
          this.teachers.set(res.teachers.items);
          this.groups.set(res.groups);
          this.schoolContext.set(res.context);
        },
      });
  }

  editArea(area: AcademicAreaRecord): void {
    this.editingAreaId.set(area.id);
    this.areaForm = {
      name: area.name,
      abbreviation: area.abbreviation ?? '',
      failsSchoolYear: area.failsSchoolYear,
      displayOrder: area.displayOrder,
    };
  }

  resetAreaForm(): void {
    this.editingAreaId.set(null);
    this.areaForm = { name: '', abbreviation: '', failsSchoolYear: true, displayOrder: 1 };
  }

  saveArea(): void {
    this.academicService
      .saveArea(
        {
          name: this.areaForm.name.trim(),
          abbreviation: this.areaForm.abbreviation.trim() || null,
          failsSchoolYear: this.areaForm.failsSchoolYear,
          displayOrder: Number(this.areaForm.displayOrder) || 1,
        },
        this.editingAreaId() ?? undefined,
      )
      .subscribe({
        next: () => {
          this.messages.showSuccess('Área académica guardada correctamente.');
          this.resetAreaForm();
          this.loadAll();
        },
      });
  }

  deleteArea(area: AcademicAreaRecord): void {
    void this.messages.confirmDelete(`¿Eliminar el área "${area.name}"?`).then((r) => {
      if (!r.isConfirmed) return;
      this.academicService.deleteArea(area.id).subscribe({
        next: () => {
          this.messages.showSuccess('Área académica eliminada.');
          this.loadAll();
        },
      });
    });
  }

  editSubject(sub: SubjectRecord): void {
    this.editingSubjectId.set(sub.id);
    this.subjectForm = {
      academicAreaId: sub.academicAreaId,
      name: sub.name,
      abbreviation: sub.abbreviation ?? '',
      isElective: sub.isElective,
      displayOrder: sub.displayOrder,
    };
  }

  resetSubjectForm(): void {
    this.editingSubjectId.set(null);
    this.subjectForm = { academicAreaId: 0, name: '', abbreviation: '', isElective: false, displayOrder: 1 };
  }

  saveSubject(): void {
    this.academicService
      .saveSubject(
        {
          academicAreaId: Number(this.subjectForm.academicAreaId),
          name: this.subjectForm.name.trim(),
          abbreviation: this.subjectForm.abbreviation.trim() || null,
          isElective: this.subjectForm.isElective,
          displayOrder: Number(this.subjectForm.displayOrder) || 1,
        },
        this.editingSubjectId() ?? undefined,
      )
      .subscribe({
        next: () => {
          this.messages.showSuccess('Asignatura guardada correctamente.');
          this.resetSubjectForm();
          this.loadAll();
        },
      });
  }

  deleteSubject(sub: SubjectRecord): void {
    void this.messages.confirmDelete(`¿Eliminar la asignatura "${sub.name}"?`).then((r) => {
      if (!r.isConfirmed) return;
      this.academicService.deleteSubject(sub.id).subscribe({
        next: () => {
          this.messages.showSuccess('Asignatura eliminada.');
          this.loadAll();
        },
      });
    });
  }

  saveStudyPlan(): void {
    this.academicService
      .upsertStudyPlan({
        campusId: this.studyPlanForm.campusId || null,
        gradeId: Number(this.studyPlanForm.gradeId),
        subjectId: Number(this.studyPlanForm.subjectId),
        academicYear: this.academicYear(),
        weeklyHours: Number(this.studyPlanForm.weeklyHours) || 1,
        areaWeightPercentage: Number(this.studyPlanForm.areaWeightPercentage) || 100,
      })
      .subscribe({
        next: () => {
          this.messages.showSuccess('Plan de estudios actualizado.');
          this.loadAll();
        },
      });
  }

  deleteStudyPlan(plan: StudyPlanRecord): void {
    void this.messages
      .confirmDelete(`¿Eliminar ${plan.subjectName} del plan de ${plan.gradeName}?`)
      .then((r) => {
        if (!r.isConfirmed) return;
        this.academicService.deleteStudyPlan(plan.id).subscribe({
          next: () => {
            this.messages.showSuccess('Registro eliminado del plan de estudios.');
            this.loadAll();
          },
        });
      });
  }

  onAssignmentGroupChange(groupId: number): void {
    const grp = this.groups().find((g) => g.id === Number(groupId));
    if (grp) {
      this.assignmentForm.campusId = grp.campusId;
      this.assignmentForm.shiftId = grp.shiftId;
      this.assignmentForm.gradeId = grp.gradeId;
    }
  }

  saveAssignment(): void {
    this.academicService
      .saveCourseAssignment({
        ...this.assignmentForm,
        academicYear: this.academicYear(),
        weeklyHours: Number(this.assignmentForm.weeklyHours) || 1,
        areaWeightPercentage: Number(this.assignmentForm.areaWeightPercentage) || 100,
      })
      .subscribe({
        next: () => {
          this.messages.showSuccess('Carga académica asignada correctamente.');
          this.loadAll();
        },
      });
  }

  deleteAssignment(c: CourseAssignmentRecord): void {
    void this.messages
      .confirmDelete(`¿Quitar ${c.subjectName} (${c.gradeName}-${c.groupCode}) a ${c.teacherName}?`)
      .then((r) => {
        if (!r.isConfirmed) return;
        this.academicService.deleteCourseAssignment(c.id).subscribe({
          next: () => {
            this.messages.showSuccess('Carga académica eliminada.');
            this.loadAll();
          },
        });
      });
  }

  reassignTeacher(): void {
    void this.messages
      .confirmDelete(
        `¿Trasladar toda la carga académica del año ${this.academicYear()} al docente seleccionado?`,
      )
      .then((r) => {
        if (!r.isConfirmed) return;
        this.academicService
          .reassignTeacherCourses({
            academicYear: this.academicYear(),
            fromTeacherId: Number(this.reassignForm.fromTeacherId),
            toTeacherId: Number(this.reassignForm.toTeacherId),
          })
          .subscribe({
            next: ({ updatedCount }) => {
              this.messages.showSuccess(`Se trasladaron ${updatedCount} asignaciones docentes.`);
              this.reassignForm = { fromTeacherId: 0, toTeacherId: 0 };
              this.loadAll();
            },
          });
      });
  }
}
