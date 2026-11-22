import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { LoadMaskService } from '../../services/common/load-mask.service';
import { MessagesService } from '../../services/messages.service';
import {
  AcademicYearRecord,
  EducationLevelRecord,
  GradeGroupRecord,
  GradeRecord,
  SchoolShiftRecord,
  V3SettingsService,
} from '../../services/v3-settings.service';
import { V3UnifiedAuthService } from '../../services/v3-unified-auth.service';
import {
  SearchableSelectOption,
  V3SearchableSelectComponent,
} from '../../shared/components/v3-searchable-select/v3-searchable-select.component';
import { CustomTooltipDirective } from '../../shared/directives/custom-tooltip.directive';

type StructureTab = 'years' | 'shifts' | 'levels' | 'groups' | 'grades';

/**
 * Estructura Académica (reemplaza JornadasView, NivelesAcademicosView,
 * GradosAgrupadosView, GradosAcademicosView y Años Lectivos de ExtJS).
 */
@Component({
  selector: 'app-academic-structure-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, V3SearchableSelectComponent, CustomTooltipDirective],
  template: `
    <div class="container-fluid py-3">
      <div class="breadcrumb-card mb-25 d-md-flex align-items-center justify-content-between">
        <div>
          <h5 class="mb-0 fw-bold">Estructura Académica</h5>
          <small class="text-muted">Años lectivos, jornadas, niveles, grupos de grados y grados</small>
        </div>
        <ol class="breadcrumb list-unstyled mt-0 mb-0 p-0">
          <li class="breadcrumb-item d-inline-block position-relative">
            <a routerLink="/settings" class="d-inline-block position-relative">Configuraciones</a>
          </li>
          <li class="breadcrumb-item d-inline-block position-relative">Estructura Académica</li>
        </ol>
      </div>

      <ul class="nav nav-pills mb-3 gap-2">
        <li class="nav-item">
          <button type="button" class="nav-link" [class.active]="activeTab() === 'years'" (click)="activeTab.set('years')">
            Años Lectivos ({{ years().length }})
          </button>
        </li>
        <li class="nav-item">
          <button type="button" class="nav-link" [class.active]="activeTab() === 'shifts'" (click)="activeTab.set('shifts')">
            Jornadas ({{ shifts().length }})
          </button>
        </li>
        <li class="nav-item">
          <button type="button" class="nav-link" [class.active]="activeTab() === 'levels'" (click)="activeTab.set('levels')">
            Niveles ({{ levels().length }})
          </button>
        </li>
        <li class="nav-item">
          <button type="button" class="nav-link" [class.active]="activeTab() === 'groups'" (click)="activeTab.set('groups')">
            Grupos de Grados ({{ gradeGroups().length }})
          </button>
        </li>
        <li class="nav-item">
          <button type="button" class="nav-link" [class.active]="activeTab() === 'grades'" (click)="activeTab.set('grades')">
            Grados ({{ grades().length }})
          </button>
        </li>
      </ul>

      <div class="trezo-card bg-white border-radius p-4 shadow-sm">
        @switch (activeTab()) {
          @case ('years') {
            @if (canWrite()) {
              <div class="v3-form-panel">
                <div class="row g-3">
                  <div class="col-12 col-md-6">
                    <label class="form-label">Año *</label>
                    <input type="number" class="form-control" [(ngModel)]="newYear.year" />
                  </div>
                  <div class="col-12 col-md-6 d-flex align-items-end">
                    <div class="v3-form-switch-box">
                      <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" id="onlineOpen" [(ngModel)]="newYear.isOnlineEnrollmentOpen" />
                        <label class="form-check-label" for="onlineOpen">Matrícula en línea abierta</label>
                      </div>
                    </div>
                  </div>
                  <div class="col-12 col-md-6">
                    <label class="form-label">Fecha de inicio</label>
                    <input type="date" class="form-control" [(ngModel)]="newYear.startDate" />
                  </div>
                  <div class="col-12 col-md-6">
                    <label class="form-label">Fecha de finalización</label>
                    <input type="date" class="form-control" [(ngModel)]="newYear.endDate" />
                  </div>
                  <div class="col-12 d-flex justify-content-end">
                    <button type="button" class="btn btn-sm btn-primary" (click)="saveYear()">Guardar año</button>
                  </div>
                </div>
              </div>
            }
            <div class="table-responsive">
              <table class="table table-hover v3-grid-table mb-0">
                <thead>
                  <tr>
                    <th>Año</th>
                    <th>Inicio</th>
                    <th>Fin</th>
                    <th class="text-center">Matrícula Online</th>
                    <th class="text-center">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  @for (yr of years(); track yr.id) {
                    <tr>
                      <td class="fw-bold">{{ yr.year }}</td>
                      <td>{{ yr.startDate || '—' }}</td>
                      <td>{{ yr.endDate || '—' }}</td>
                      <td class="text-center">
                        <span class="badge" [ngClass]="yr.isOnlineEnrollmentOpen ? 'text-bg-info' : 'text-bg-secondary'">
                          {{ yr.isOnlineEnrollmentOpen ? 'Abierta' : 'Cerrada' }}
                        </span>
                      </td>
                      <td class="text-center">
                        <span class="badge" [ngClass]="yr.isClosed ? 'text-bg-danger' : 'text-bg-success'">
                          {{ yr.isClosed ? 'Cerrado' : 'Activo' }}
                        </span>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }

          @case ('shifts') {
            @if (canWrite()) {
              <div class="v3-form-panel">
                <div class="row g-3">
                  <div class="col-12 col-md-6">
                    <label class="form-label">Código de jornada *</label>
                    <input type="number" class="form-control" [(ngModel)]="newShift.shiftCode" />
                  </div>
                  <div class="col-12 col-md-6">
                    <label class="form-label">Nombre de jornada *</label>
                    <input type="text" class="form-control" [(ngModel)]="newShift.name" placeholder="Ej. Mañana, Tarde, Única" />
                  </div>
                  <div class="col-12 d-flex justify-content-end">
                    <button type="button" class="btn btn-sm btn-primary" [disabled]="!newShift.name.trim()" (click)="saveShift()">
                      Guardar jornada
                    </button>
                  </div>
                </div>
              </div>
            }
            <div class="table-responsive">
              <table class="table table-hover v3-grid-table mb-0">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Jornada</th>
                    <th class="text-center">Estado</th>
                    <th class="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  @for (s of shifts(); track s.id) {
                    <tr>
                      <td>{{ s.shiftCode }}</td>
                      <td class="fw-medium">{{ s.name }}</td>
                      <td class="text-center">
                        <span class="badge" [ngClass]="s.isActive ? 'text-bg-success' : 'text-bg-secondary'">
                          {{ s.isActive ? 'Activa' : 'Inactiva' }}
                        </span>
                      </td>
                      <td class="text-end">
                        @if (canWrite()) {
                          <button type="button" class="btn btn-sm btn-outline-danger" (click)="deleteShift(s)" [appCustomTooltip]="'Eliminar jornada'">
                            <i class="material-symbols-outlined fs-6">delete</i>
                          </button>
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }

          @case ('levels') {
            @if (canWrite()) {
              <div class="v3-form-panel">
                <div class="row g-3">
                  <div class="col-12 col-md-6">
                    <label class="form-label">Código del nivel *</label>
                    <input type="text" class="form-control" [(ngModel)]="newLevel.levelCode" placeholder="PRIM" />
                  </div>
                  <div class="col-12 col-md-6">
                    <label class="form-label">Nombre del nivel *</label>
                    <input type="text" class="form-control" [(ngModel)]="newLevel.name" placeholder="Básica Primaria" />
                  </div>
                  <div class="col-12 col-md-6">
                    <label class="form-label">Abreviatura</label>
                    <input type="text" class="form-control" [(ngModel)]="newLevel.abbreviation" />
                  </div>
                  <div class="col-12 col-md-6">
                    <label class="form-label">Orden de visualización</label>
                    <input type="number" class="form-control" [(ngModel)]="newLevel.displayOrder" />
                  </div>
                  <div class="col-12 d-flex justify-content-end">
                    <button type="button" class="btn btn-sm btn-primary" [disabled]="!newLevel.levelCode.trim() || !newLevel.name.trim()" (click)="saveLevel()">
                      Guardar nivel
                    </button>
                  </div>
                </div>
              </div>
            }
            <div class="table-responsive">
              <table class="table table-hover v3-grid-table mb-0">
                <thead>
                  <tr>
                    <th>Orden</th>
                    <th>Código</th>
                    <th>Nivel Educativo</th>
                    <th>Abrev.</th>
                    <th class="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  @for (lvl of levels(); track lvl.id) {
                    <tr>
                      <td>{{ lvl.displayOrder }}</td>
                      <td><code>{{ lvl.levelCode }}</code></td>
                      <td class="fw-medium">{{ lvl.name }}</td>
                      <td>{{ lvl.abbreviation || '—' }}</td>
                      <td class="text-end">
                        @if (canWrite()) {
                          <button type="button" class="btn btn-sm btn-outline-danger" (click)="deleteLevel(lvl)" [appCustomTooltip]="'Eliminar nivel'">
                            <i class="material-symbols-outlined fs-6">delete</i>
                          </button>
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }

          @case ('groups') {
            @if (canWrite()) {
              <div class="v3-form-panel">
                <div class="row g-3">
                  <div class="col-12 col-md-6">
                    <label class="form-label">Nombre del grupo de grados *</label>
                    <input type="text" class="form-control" [(ngModel)]="newGroup.name" placeholder="Ej. Básica Primaria (1° a 5°)" />
                  </div>
                  <div class="col-12 col-md-6 d-flex align-items-end">
                    <div class="v3-form-switch-box">
                      <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" id="cycleEnd" [(ngModel)]="newGroup.isCycleEnd" />
                        <label class="form-check-label" for="cycleEnd">Fin de ciclo</label>
                      </div>
                    </div>
                  </div>
                  <div class="col-12 d-flex justify-content-end">
                    <button type="button" class="btn btn-sm btn-primary" [disabled]="!newGroup.name.trim()" (click)="saveGradeGroup()">
                      Guardar grupo
                    </button>
                  </div>
                </div>
              </div>
            }
            <div class="table-responsive">
              <table class="table table-hover v3-grid-table mb-0">
                <thead>
                  <tr>
                    <th>Nombre del Grupo de Grados</th>
                    <th class="text-center">Fin de ciclo</th>
                    <th class="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  @for (g of gradeGroups(); track g.id) {
                    <tr>
                      <td class="fw-medium">{{ g.name }}</td>
                      <td class="text-center">{{ g.isCycleEnd ? 'Sí' : 'No' }}</td>
                      <td class="text-end">
                        @if (canWrite()) {
                          <button type="button" class="btn btn-sm btn-outline-danger" (click)="deleteGradeGroup(g)" [appCustomTooltip]="'Eliminar grupo de grados'">
                            <i class="material-symbols-outlined fs-6">delete</i>
                          </button>
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }

          @case ('grades') {
            @if (canWrite()) {
              <div class="v3-form-panel">
                <div class="row g-3">
                  <div class="col-12 col-md-6">
                    <label class="form-label">Código del grado *</label>
                    <input type="text" class="form-control" [(ngModel)]="newGrade.gradeCode" placeholder="01" />
                  </div>
                  <div class="col-12 col-md-6">
                    <label class="form-label">Nombre del grado *</label>
                    <input type="text" class="form-control" [(ngModel)]="newGrade.name" placeholder="Primero" />
                  </div>
                  <div class="col-12 col-md-6">
                    <label class="form-label">Nivel educativo *</label>
                    <app-v3-searchable-select
                      [(ngModel)]="newGrade.educationLevelId"
                      [options]="educationLevelOptions()"
                      [clearable]="true"
                      placeholder="Seleccione..."
                      searchPlaceholder="Buscar nivel..."
                    />
                  </div>
                  <div class="col-12 col-md-6">
                    <label class="form-label">Grupo de grados</label>
                    <app-v3-searchable-select
                      [(ngModel)]="newGrade.gradeGroupId"
                      [options]="gradeGroupOptions()"
                      [clearable]="true"
                      placeholder="Ninguno"
                      searchPlaceholder="Buscar grupo..."
                    />
                  </div>
                  <div class="col-12 d-flex justify-content-end">
                    <button type="button" class="btn btn-sm btn-primary" [disabled]="!newGrade.gradeCode.trim() || !newGrade.name.trim() || !newGrade.educationLevelId" (click)="saveGrade()">
                      Guardar grado
                    </button>
                  </div>
                </div>
              </div>
            }
            <div class="table-responsive">
              <table class="table table-hover v3-grid-table mb-0">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Grado</th>
                    <th>Nivel Educativo</th>
                    <th>Grupo de Grados</th>
                    <th class="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  @for (gr of grades(); track gr.id) {
                    <tr>
                      <td><code>{{ gr.gradeCode }}</code></td>
                      <td class="fw-medium">{{ gr.name }}</td>
                      <td>{{ gr.educationLevelName }}</td>
                      <td>{{ gr.gradeGroupName || '—' }}</td>
                      <td class="text-end">
                        @if (canWrite()) {
                          <button type="button" class="btn btn-sm btn-outline-danger" (click)="deleteGrade(gr)" [appCustomTooltip]="'Eliminar grado'">
                            <i class="material-symbols-outlined fs-6">delete</i>
                          </button>
                        }
                      </td>
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
export class AcademicStructureSettingsComponent implements OnInit {
  private readonly settingsService = inject(V3SettingsService);
  private readonly v3Auth = inject(V3UnifiedAuthService);
  private readonly maskService = inject(LoadMaskService);
  private readonly messages = inject(MessagesService);

  readonly activeTab = signal<StructureTab>('years');
  readonly years = signal<AcademicYearRecord[]>([]);
  readonly shifts = signal<SchoolShiftRecord[]>([]);
  readonly levels = signal<EducationLevelRecord[]>([]);
  readonly gradeGroups = signal<GradeGroupRecord[]>([]);
  readonly grades = signal<GradeRecord[]>([]);

  readonly educationLevelOptions = computed<SearchableSelectOption<number>[]>(() =>
    this.levels().map((lvl) => ({ value: lvl.id, label: lvl.name }))
  );
  readonly gradeGroupOptions = computed<SearchableSelectOption<number>[]>(() =>
    this.gradeGroups().map((gg) => ({ value: gg.id, label: gg.name }))
  );

  readonly canWrite = computed(() =>
    this.v3Auth.hasPermission('settings.structure.write'),
  );

  newYear = { year: new Date().getFullYear(), startDate: '', endDate: '', isOnlineEnrollmentOpen: false };
  newShift = { shiftCode: 1, name: '' };
  newLevel = { levelCode: '', name: '', abbreviation: '', displayOrder: 1 };
  newGroup = { name: '', isCycleEnd: false };
  newGrade: { gradeCode: string; name: string; educationLevelId: number | null; gradeGroupId: number | null } = {
    gradeCode: '',
    name: '',
    educationLevelId: null,
    gradeGroupId: null,
  };

  ngOnInit(): void {
    this.reloadAll();
  }

  reloadAll(): void {
    this.settingsService.listAcademicYears().subscribe((r) => this.years.set(r));
    this.settingsService.listShifts().subscribe((r) => this.shifts.set(r));
    this.settingsService.listEducationLevels().subscribe((r) => this.levels.set(r));
    this.settingsService.listGradeGroups().subscribe((r) => this.gradeGroups.set(r));
    this.settingsService.listGrades().subscribe((r) => this.grades.set(r));
  }

  saveYear(): void {
    this.maskService.show('messages.saving');
    this.settingsService
      .upsertAcademicYear({
        year: Number(this.newYear.year),
        startDate: this.newYear.startDate || null,
        endDate: this.newYear.endDate || null,
        isOnlineEnrollmentOpen: this.newYear.isOnlineEnrollmentOpen,
      })
      .pipe(finalize(() => this.maskService.hide()))
      .subscribe(() => {
        this.messages.showSuccess('Año lectivo guardado correctamente.');
        this.settingsService.listAcademicYears().subscribe((r) => this.years.set(r));
      });
  }

  saveShift(): void {
    this.maskService.show('messages.saving');
    this.settingsService
      .saveShift({ shiftCode: Number(this.newShift.shiftCode), name: this.newShift.name })
      .pipe(finalize(() => this.maskService.hide()))
      .subscribe(() => {
        this.newShift = { shiftCode: this.shifts().length + 2, name: '' };
        this.messages.showSuccess('Jornada guardada.');
        this.settingsService.listShifts().subscribe((r) => this.shifts.set(r));
      });
  }

  deleteShift(shift: SchoolShiftRecord): void {
    void this.messages.confirmDelete(`¿Eliminar la jornada "${shift.name}"?`).then((r) => {
      if (r.isConfirmed) {
        this.settingsService.deleteShift(shift.id).subscribe(() => {
          this.messages.showSuccess('Jornada eliminada.');
          this.settingsService.listShifts().subscribe((rows) => this.shifts.set(rows));
        });
      }
    });
  }

  saveLevel(): void {
    this.maskService.show('messages.saving');
    this.settingsService
      .saveEducationLevel({
        levelCode: this.newLevel.levelCode,
        name: this.newLevel.name,
        abbreviation: this.newLevel.abbreviation || null,
        displayOrder: Number(this.newLevel.displayOrder) || 1,
      })
      .pipe(finalize(() => this.maskService.hide()))
      .subscribe(() => {
        this.newLevel = { levelCode: '', name: '', abbreviation: '', displayOrder: this.levels().length + 2 };
        this.messages.showSuccess('Nivel educativo guardado.');
        this.settingsService.listEducationLevels().subscribe((rows) => this.levels.set(rows));
      });
  }

  deleteLevel(lvl: EducationLevelRecord): void {
    void this.messages.confirmDelete(`¿Eliminar el nivel "${lvl.name}"?`).then((r) => {
      if (r.isConfirmed) {
        this.settingsService.deleteEducationLevel(lvl.id).subscribe(() => {
          this.messages.showSuccess('Nivel educativo eliminado.');
          this.settingsService.listEducationLevels().subscribe((rows) => this.levels.set(rows));
        });
      }
    });
  }

  saveGradeGroup(): void {
    this.maskService.show('messages.saving');
    this.settingsService
      .saveGradeGroup({ name: this.newGroup.name, isCycleEnd: this.newGroup.isCycleEnd })
      .pipe(finalize(() => this.maskService.hide()))
      .subscribe(() => {
        this.newGroup = { name: '', isCycleEnd: false };
        this.messages.showSuccess('Grupo de grados guardado.');
        this.settingsService.listGradeGroups().subscribe((rows) => this.gradeGroups.set(rows));
      });
  }

  deleteGradeGroup(group: GradeGroupRecord): void {
    void this.messages.confirmDelete(`¿Eliminar el grupo "${group.name}"?`).then((r) => {
      if (r.isConfirmed) {
        this.settingsService.deleteGradeGroup(group.id).subscribe(() => {
          this.messages.showSuccess('Grupo de grados eliminado.');
          this.settingsService.listGradeGroups().subscribe((rows) => this.gradeGroups.set(rows));
        });
      }
    });
  }

  saveGrade(): void {
    if (!this.newGrade.educationLevelId) {
      return;
    }
    this.maskService.show('messages.saving');
    this.settingsService
      .saveGrade({
        gradeCode: this.newGrade.gradeCode,
        name: this.newGrade.name,
        educationLevelId: Number(this.newGrade.educationLevelId),
        gradeGroupId: this.newGrade.gradeGroupId ? Number(this.newGrade.gradeGroupId) : null,
      })
      .pipe(finalize(() => this.maskService.hide()))
      .subscribe(() => {
        this.newGrade = {
          gradeCode: '',
          name: '',
          educationLevelId: this.newGrade.educationLevelId,
          gradeGroupId: null,
        };
        this.messages.showSuccess('Grado académico guardado.');
        this.settingsService.listGrades().subscribe((rows) => this.grades.set(rows));
      });
  }

  deleteGrade(grade: GradeRecord): void {
    void this.messages.confirmDelete(`¿Eliminar el grado "${grade.name}"?`).then((r) => {
      if (r.isConfirmed) {
        this.settingsService.deleteGrade(grade.id).subscribe(() => {
          this.messages.showSuccess('Grado académico eliminado.');
          this.settingsService.listGrades().subscribe((rows) => this.grades.set(rows));
        });
      }
    });
  }
}
