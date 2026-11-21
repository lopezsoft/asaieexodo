import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { LoadMaskService } from '../../services/common/load-mask.service';
import { MessagesService } from '../../services/messages.service';
import {
  CampusEducationLevelRecord,
  CampusRecord,
  CampusShiftRecord,
  V3AdministrationService,
} from '../../services/v3-administration.service';
import {
  CityCatalogItem,
  CountryCatalogItem,
  DepartmentCatalogItem,
  GlobalCatalogsBundle,
  SchoolAcademicContextCatalogs,
  V3CatalogsService,
} from '../../services/v3-catalogs.service';
import { V3UnifiedAuthService } from '../../services/v3-unified-auth.service';
import {
  V3DataGridComponent,
  V3GridColumn,
} from '../../shared/components/v3-data-grid/v3-data-grid.component';
import { V3ModalDialogComponent } from '../../shared/components/v3-modal-dialog/v3-modal-dialog.component';
import { CustomTooltipDirective } from '../../shared/directives/custom-tooltip.directive';
import { markAllAsTouched } from '../../utils/form-validators';

/**
 * Sedes Educativas + Jornadas y Niveles por Sede
 * (reemplaza SchoolHeadquarters, SaveSchoolHeadquarters, JornSedesView y NivelesSedesView de ExtJS).
 */
@Component({
  selector: 'app-campuses-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    V3DataGridComponent,
    V3ModalDialogComponent,
    CustomTooltipDirective,
  ],
  template: `
    <div class="container-fluid py-3">
      <div class="breadcrumb-card mb-25 d-md-flex align-items-center justify-content-between">
        <div>
          <h5 class="mb-0 fw-bold">Sedes Educativas</h5>
          <small class="text-muted">Administración de sedes, jornadas y niveles educativos</small>
        </div>
        <ol class="breadcrumb list-unstyled mt-0 mb-0 p-0">
          <li class="breadcrumb-item d-inline-block position-relative">
            <a routerLink="/admin" class="d-inline-block position-relative">Administrativo</a>
          </li>
          <li class="breadcrumb-item d-inline-block position-relative">Sedes Educativas</li>
        </ol>
      </div>

      <app-v3-data-grid
        heading="Listado de Sedes Educativas"
        subtitle="Cada sede puede vincular sus jornadas escolares y niveles educativos autorizados"
        [columns]="columns"
        [rows]="campuses()"
        [loading]="loading()"
        exportFileName="sedes-educativas"
        searchPlaceholder="Buscar por nombre, DANE o ciudad..."
        (refreshRequested)="loadCampuses()"
      >
        @if (canWrite()) {
          <button
            grid-toolbar
            type="button"
            class="btn btn-sm btn-primary d-inline-flex align-items-center gap-1"
            (click)="openCreateModal()"
            [appCustomTooltip]="'Registrar nueva sede educativa'"
          >
            <i class="material-symbols-outlined fs-6">add</i>
            <span>Nueva sede</span>
          </button>
        }

        <ng-template #rowActions let-campus>
          <button
            type="button"
            class="btn btn-sm btn-outline-info me-1"
            (click)="openRelationsModal(campus)"
            [appCustomTooltip]="'Configurar jornadas y niveles de esta sede'"
          >
            <i class="material-symbols-outlined fs-6">tune</i>
          </button>
          @if (canWrite()) {
            <button
              type="button"
              class="btn btn-sm btn-outline-primary me-1"
              (click)="openEditModal(campus)"
              [appCustomTooltip]="'Editar sede'"
            >
              <i class="material-symbols-outlined fs-6">edit</i>
            </button>
            <button
              type="button"
              class="btn btn-sm btn-outline-danger"
              (click)="confirmDeleteCampus(campus)"
              [appCustomTooltip]="'Eliminar sede'"
            >
              <i class="material-symbols-outlined fs-6">delete</i>
            </button>
          }
        </ng-template>
      </app-v3-data-grid>
    </div>

    <!-- Modal Crear / Editar Sede -->
    <app-v3-modal-dialog
      [open]="formModalOpen()"
      [heading]="editingCampus() ? 'Editar Sede Educativa' : 'Nueva Sede Educativa'"
      icon="location_city"
      size="lg"
      (closed)="formModalOpen.set(false)"
    >
      <form [formGroup]="campusForm" (ngSubmit)="saveCampus()">
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label">Nombre de la sede *</label>
            <input type="text" class="form-control" formControlName="name" />
          </div>
          <div class="col-md-3">
            <label class="form-label">Código DANE sede</label>
            <input type="text" class="form-control" formControlName="daneCode" />
          </div>
          <div class="col-md-3">
            <label class="form-label">Consecutivo</label>
            <input type="text" class="form-control" formControlName="consecutiveCode" />
          </div>

          <div class="col-md-4">
            <label class="form-label">País</label>
            <select class="form-select" formControlName="countryId" (change)="onCountryChanged()">
              @for (country of countries(); track country.id) {
                <option [ngValue]="country.id">{{ country.name }}</option>
              }
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label">Departamento</label>
            <select class="form-select" formControlName="departmentId" (change)="onDepartmentChanged()">
              <option [ngValue]="null">Seleccione...</option>
              @for (dept of departments(); track dept.id) {
                <option [ngValue]="dept.id">{{ dept.name }}</option>
              }
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label">Municipio / Ciudad</label>
            <select class="form-select" formControlName="cityId">
              <option [ngValue]="null">Seleccione...</option>
              @for (city of cities(); track city.id) {
                <option [ngValue]="city.id">{{ city.name }}</option>
              }
            </select>
          </div>

          <div class="col-md-4">
            <label class="form-label">Zona geográfica</label>
            <select class="form-select" formControlName="zoneId">
              @for (zone of catalogs()?.geographicalZones ?? []; track zone.id) {
                <option [ngValue]="zone.id">{{ zone.name }}</option>
              }
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label">Dirección</label>
            <input type="text" class="form-control" formControlName="address" />
          </div>
          <div class="col-md-4">
            <label class="form-label">Teléfonos</label>
            <input type="text" class="form-control" formControlName="phones" />
          </div>

          <div class="col-md-6">
            <label class="form-label">Correo electrónico</label>
            <input type="email" class="form-control" formControlName="email" />
          </div>
          <div class="col-md-3 d-flex align-items-end">
            <div class="form-check form-switch">
              <input class="form-check-input" type="checkbox" id="campusMain" formControlName="isMainCampus" />
              <label class="form-check-label" for="campusMain">Sede principal</label>
            </div>
          </div>
          <div class="col-md-3 d-flex align-items-end">
            <div class="form-check form-switch">
              <input class="form-check-input" type="checkbox" id="campusActive" formControlName="isActive" />
              <label class="form-check-label" for="campusActive">Sede activa</label>
            </div>
          </div>
        </div>
      </form>

      <div modal-footer>
        <button type="button" class="btn btn-sm btn-outline-secondary" (click)="formModalOpen.set(false)">
          Cancelar
        </button>
        <button
          type="button"
          class="btn btn-sm btn-primary"
          [disabled]="campusForm.invalid"
          (click)="saveCampus()"
        >
          Guardar sede
        </button>
      </div>
    </app-v3-modal-dialog>

    <!-- Modal Jornadas y Niveles Educativos por Sede -->
    <app-v3-modal-dialog
      [open]="relationsModalOpen()"
      [heading]="'Jornadas y Niveles — ' + (selectedCampus()?.name || '')"
      icon="tune"
      size="lg"
      (closed)="relationsModalOpen.set(false)"
    >
      <div class="row g-4">
        <div class="col-md-6">
          <h6 class="fw-semibold mb-2">Jornadas habilitadas</h6>
          @if (canWrite()) {
            <div class="input-group input-group-sm mb-3">
              <select class="form-select" [(ngModel)]="selectedShiftId">
                <option [ngValue]="null">Seleccionar jornada...</option>
                @for (shift of schoolContext()?.shifts ?? []; track shift.id) {
                  <option [ngValue]="shift.id">{{ shift.name }}</option>
                }
              </select>
              <button
                type="button"
                class="btn btn-primary"
                [disabled]="!selectedShiftId"
                (click)="addShiftToCampus()"
              >
                Vincular
              </button>
            </div>
          }
          <ul class="list-group">
            @for (item of campusShifts(); track item.id) {
              <li class="list-group-item d-flex align-items-center justify-content-between">
                <span>{{ item.shiftName }}</span>
                @if (canWrite()) {
                  <button
                    type="button"
                    class="btn btn-sm btn-outline-danger"
                    (click)="removeShiftFromCampus(item)"
                    [appCustomTooltip]="'Quitar jornada de la sede'"
                  >
                    <i class="material-symbols-outlined fs-6">delete</i>
                  </button>
                }
              </li>
            } @empty {
              <li class="list-group-item text-muted small">Sin jornadas vinculadas.</li>
            }
          </ul>
        </div>

        <div class="col-md-6">
          <h6 class="fw-semibold mb-2">Niveles educativos habilitados</h6>
          @if (canWrite()) {
            <div class="input-group input-group-sm mb-3">
              <select class="form-select" [(ngModel)]="selectedLevelId">
                <option [ngValue]="null">Seleccionar nivel...</option>
                @for (lvl of schoolContext()?.educationLevels ?? []; track lvl.id) {
                  <option [ngValue]="lvl.id">{{ lvl.name }}</option>
                }
              </select>
              <button
                type="button"
                class="btn btn-primary"
                [disabled]="!selectedLevelId"
                (click)="addLevelToCampus()"
              >
                Vincular
              </button>
            </div>
          }
          <ul class="list-group">
            @for (item of campusLevels(); track item.id) {
              <li class="list-group-item d-flex align-items-center justify-content-between">
                <span>{{ item.levelName }}</span>
                @if (canWrite()) {
                  <button
                    type="button"
                    class="btn btn-sm btn-outline-danger"
                    (click)="removeLevelFromCampus(item)"
                    [appCustomTooltip]="'Quitar nivel de la sede'"
                  >
                    <i class="material-symbols-outlined fs-6">delete</i>
                  </button>
                }
              </li>
            } @empty {
              <li class="list-group-item text-muted small">Sin niveles vinculados.</li>
            }
          </ul>
        </div>
      </div>

      <div modal-footer>
        <button type="button" class="btn btn-sm btn-secondary" (click)="relationsModalOpen.set(false)">
          Cerrar
        </button>
      </div>
    </app-v3-modal-dialog>
  `,
})
export class CampusesManagementComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly adminService = inject(V3AdministrationService);
  private readonly catalogsService = inject(V3CatalogsService);
  private readonly v3Auth = inject(V3UnifiedAuthService);
  private readonly maskService = inject(LoadMaskService);
  private readonly messages = inject(MessagesService);

  readonly campuses = signal<CampusRecord[]>([]);
  readonly loading = signal(false);
  readonly catalogs = signal<GlobalCatalogsBundle | null>(null);
  readonly schoolContext = signal<SchoolAcademicContextCatalogs | null>(null);
  readonly countries = signal<CountryCatalogItem[]>([]);
  readonly departments = signal<DepartmentCatalogItem[]>([]);
  readonly cities = signal<CityCatalogItem[]>([]);

  readonly formModalOpen = signal(false);
  readonly editingCampus = signal<CampusRecord | null>(null);

  readonly relationsModalOpen = signal(false);
  readonly selectedCampus = signal<CampusRecord | null>(null);
  readonly campusShifts = signal<CampusShiftRecord[]>([]);
  readonly campusLevels = signal<CampusEducationLevelRecord[]>([]);
  selectedShiftId: number | null = null;
  selectedLevelId: number | null = null;

  readonly canWrite = computed(() => {
    const role = this.v3Auth.activeRole();
    return role === 'SUPER_ADMIN' || role === 'SCHOOL_ADMIN' || role === 'RECTOR';
  });

  readonly columns: V3GridColumn<CampusRecord>[] = [
    { key: 'name', label: 'Sede' },
    { key: 'daneCode', label: 'Código DANE' },
    { key: 'cityName', label: 'Municipio' },
    { key: 'zoneName', label: 'Zona' },
    {
      key: 'shiftsCount',
      label: 'Jornadas / Niveles',
      align: 'center',
      formatter: (r) => `${r.shiftsCount} / ${r.levelsCount}`,
    },
    {
      key: 'isMainCampus',
      label: 'Principal',
      align: 'center',
      formatter: (r) => (r.isMainCampus ? 'Sí' : 'No'),
    },
    { key: 'isActive', label: 'Estado', align: 'center', badge: true },
  ];

  readonly campusForm: FormGroup;

  constructor() {
    this.campusForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(200)]],
      daneCode: [''],
      consecutiveCode: [''],
      countryId: [45],
      departmentId: [null],
      cityId: [null],
      zoneId: [1],
      address: [''],
      phones: [''],
      email: ['', [Validators.email]],
      isMainCampus: [false],
      isActive: [true],
    });
  }

  ngOnInit(): void {
    this.catalogsService.getGlobalBundle().subscribe((b) => this.catalogs.set(b));
    this.catalogsService.listCountries().subscribe((c) => this.countries.set(c));
    this.catalogsService
      .getSchoolContext()
      .subscribe((ctx) => this.schoolContext.set(ctx));
    this.loadCampuses();
  }

  loadCampuses(): void {
    this.loading.set(true);
    this.adminService
      .listCampuses()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (rows) => this.campuses.set(rows),
      });
  }

  openCreateModal(): void {
    this.editingCampus.set(null);
    this.campusForm.reset({
      name: '',
      daneCode: '',
      consecutiveCode: '',
      countryId: 45,
      departmentId: null,
      cityId: null,
      zoneId: 1,
      address: '',
      phones: '',
      email: '',
      isMainCampus: false,
      isActive: true,
    });
    this.cities.set([]);
    this.loadDepartments(45, null);
    this.formModalOpen.set(true);
  }

  openEditModal(campus: CampusRecord): void {
    this.editingCampus.set(campus);
    const countryId = campus.countryId ?? 45;
    this.campusForm.patchValue({
      name: campus.name,
      daneCode: campus.daneCode ?? '',
      consecutiveCode: campus.consecutiveCode ?? '',
      countryId,
      departmentId: campus.departmentId,
      cityId: campus.cityId,
      zoneId: campus.zoneId ?? 1,
      address: campus.address ?? '',
      phones: campus.phones ?? '',
      email: campus.email ?? '',
      isMainCampus: campus.isMainCampus,
      isActive: campus.isActive,
    });
    this.loadDepartments(countryId, campus.departmentId);
    this.formModalOpen.set(true);
  }

  onCountryChanged(): void {
    const countryId = this.campusForm.get('countryId')?.value as number | null;
    this.campusForm.patchValue({ departmentId: null, cityId: null });
    this.cities.set([]);
    if (countryId) {
      this.loadDepartments(countryId, null);
    }
  }

  onDepartmentChanged(): void {
    const deptId = this.campusForm.get('departmentId')?.value as number | null;
    this.campusForm.patchValue({ cityId: null });
    if (deptId) {
      this.catalogsService.listCities(deptId).subscribe((c) => this.cities.set(c));
    } else {
      this.cities.set([]);
    }
  }

  saveCampus(): void {
    if (this.campusForm.invalid) {
      markAllAsTouched(this.campusForm);
      return;
    }

    const raw = this.campusForm.getRawValue();
    const payload = {
      name: raw.name,
      daneCode: raw.daneCode || null,
      consecutiveCode: raw.consecutiveCode || null,
      cityId: raw.cityId || null,
      zoneId: raw.zoneId || 1,
      address: raw.address || null,
      phones: raw.phones || null,
      email: raw.email || null,
      isMainCampus: Boolean(raw.isMainCampus),
      isActive: Boolean(raw.isActive),
    };

    const editing = this.editingCampus();
    this.maskService.show('messages.saving');
    const request$ = editing
      ? this.adminService.updateCampus(editing.id, payload)
      : this.adminService.createCampus(payload);

    request$.pipe(finalize(() => this.maskService.hide())).subscribe({
      next: () => {
        this.messages.showSuccess(
          editing ? 'Sede actualizada correctamente.' : 'Sede creada correctamente.',
        );
        this.formModalOpen.set(false);
        this.loadCampuses();
      },
    });
  }

  confirmDeleteCampus(campus: CampusRecord): void {
    void this.messages
      .confirmDelete(`¿Deseas eliminar la sede "${campus.name}"?`)
      .then((result) => {
        if (result.isConfirmed) {
          this.maskService.show('messages.processing');
          this.adminService
            .deleteCampus(campus.id)
            .pipe(finalize(() => this.maskService.hide()))
            .subscribe({
              next: () => {
                this.messages.showSuccess('Sede eliminada correctamente.');
                this.loadCampuses();
              },
            });
        }
      });
  }

  openRelationsModal(campus: CampusRecord): void {
    this.selectedCampus.set(campus);
    this.selectedShiftId = null;
    this.selectedLevelId = null;
    this.relationsModalOpen.set(true);
    this.loadCampusRelations(campus.id);
  }

  addShiftToCampus(): void {
    const campus = this.selectedCampus();
    if (!campus || !this.selectedShiftId) {
      return;
    }
    this.adminService
      .assignCampusShift(campus.id, this.selectedShiftId)
      .subscribe({
        next: () => {
          this.selectedShiftId = null;
          this.messages.showSuccess('Jornada vinculada a la sede.');
          this.loadCampusRelations(campus.id);
          this.loadCampuses();
        },
      });
  }

  removeShiftFromCampus(item: CampusShiftRecord): void {
    const campus = this.selectedCampus();
    if (!campus) {
      return;
    }
    this.adminService.removeCampusShift(campus.id, item.id).subscribe({
      next: () => {
        this.messages.showSuccess('Jornada desvinculada.');
        this.loadCampusRelations(campus.id);
        this.loadCampuses();
      },
    });
  }

  addLevelToCampus(): void {
    const campus = this.selectedCampus();
    if (!campus || !this.selectedLevelId) {
      return;
    }
    this.adminService
      .assignCampusEducationLevel(campus.id, this.selectedLevelId)
      .subscribe({
        next: () => {
          this.selectedLevelId = null;
          this.messages.showSuccess('Nivel educativo vinculado a la sede.');
          this.loadCampusRelations(campus.id);
          this.loadCampuses();
        },
      });
  }

  removeLevelFromCampus(item: CampusEducationLevelRecord): void {
    const campus = this.selectedCampus();
    if (!campus) {
      return;
    }
    this.adminService.removeCampusEducationLevel(campus.id, item.id).subscribe({
      next: () => {
        this.messages.showSuccess('Nivel educativo desvinculado.');
        this.loadCampusRelations(campus.id);
        this.loadCampuses();
      },
    });
  }

  private loadCampusRelations(campusId: number): void {
    this.adminService
      .listCampusShifts(campusId)
      .subscribe((rows) => this.campusShifts.set(rows));
    this.adminService
      .listCampusEducationLevels(campusId)
      .subscribe((rows) => this.campusLevels.set(rows));
  }

  private loadDepartments(countryId: number, selectedDepartmentId: number | null): void {
    this.catalogsService.listDepartments(countryId).subscribe((depts) => {
      this.departments.set(depts);
      if (selectedDepartmentId) {
        this.catalogsService
          .listCities(selectedDepartmentId)
          .subscribe((cities) => this.cities.set(cities));
      }
    });
  }
}
