import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  PLATFORM_ID,
  signal,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  ColumnContract,
  DataSourceContract,
  ExodoGridComponent,
  ExodolibsModule,
  Proxy,
} from 'exodolibs';
import { finalize } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CustomizerSettingsService } from '../../customizer-settings/customizer-settings.service';
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
import { V3ModalDialogComponent } from '../../shared/components/v3-modal-dialog/v3-modal-dialog.component';
import {
  V3FormWizardComponent,
  V3WizardStep,
} from '../../shared/components/v3-form-wizard/v3-form-wizard.component';
import {
  SearchableSelectOption,
  V3SearchableSelectComponent,
} from '../../shared/components/v3-searchable-select/v3-searchable-select.component';
import { CustomTooltipDirective } from '../../shared/directives/custom-tooltip.directive';
import {
  ExodoExportColumn,
  exportGridRowsToExcel,
} from '../../shared/utils/exodo-grid-export.util';
import { isControlInvalid, markAllAsTouched } from '../../utils/form-validators';

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
    ExodolibsModule,
    V3ModalDialogComponent,
    V3FormWizardComponent,
    V3SearchableSelectComponent,
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
            <a routerLink="/dashboard" class="d-inline-block position-relative">
              <i class="material-symbols-outlined">home</i>
              Inicio
            </a>
          </li>
          <li class="breadcrumb-item d-inline-block position-relative">
            <a routerLink="/admin" class="d-inline-block position-relative">Administrativo</a>
          </li>
          <li class="breadcrumb-item d-inline-block position-relative">Sedes Educativas</li>
        </ol>
      </div>

      <div class="v3-admin-filter-strip">
        <div class="v3-admin-filter-group">
          <span class="v3-admin-filter-label">Estado</span>
          <div class="v3-rbac-segment-bar" role="group" aria-label="Filtrar sedes por estado">
            <button
              type="button"
              class="v3-rbac-segment-pill"
              [class.is-active]="statusFilter() === 'ALL'"
              (click)="setStatusFilter('ALL')"
            >
              <span>Todas</span>
            </button>
            <button
              type="button"
              class="v3-rbac-segment-pill"
              [class.is-active]="statusFilter() === 'ACTIVE'"
              (click)="setStatusFilter('ACTIVE')"
            >
              <span>Activas</span>
            </button>
            <button
              type="button"
              class="v3-rbac-segment-pill"
              [class.is-active]="statusFilter() === 'INACTIVE'"
              (click)="setStatusFilter('INACTIVE')"
            >
              <span>Inactivas</span>
            </button>
          </div>
        </div>
      </div>

      <exodo-grid
        #campusesGrid
        mode="remote"
        caption="Listado de Sedes Educativas"
        [columns]="columns"
        [dataSource]="dataSource"
        [proxy]="proxy"
        [customBody]="true"
        [allowSorting]="true"
        [allowFiltering]="true"
        [showPagination]="true"
        [limit]="15"
        [theme]="gridTheme"
        placeholder="Buscar sede, DANE o ciudad..."
        (loadError)="onGridLoadError()"
      >
        <div header class="v3-exodo-toolbar">
          <button
            type="button"
            class="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
            (click)="campusesGrid.clearFilters()"
            [appCustomTooltip]="'Limpiar filtros y ordenamiento'"
          >
            <i class="material-symbols-outlined fs-6">filter_alt_off</i>
            <span>Limpiar</span>
          </button>
          @if (campusRows.length > 0) {
            <button
              type="button"
              class="btn btn-sm btn-outline-success d-inline-flex align-items-center gap-1"
              (click)="exportCurrentPage()"
              [appCustomTooltip]="'Exportar página actual a Excel (.xlsx)'"
            >
              <i class="material-symbols-outlined fs-6">download</i>
              <span>Excel</span>
            </button>
          }
          @if (canWrite()) {
            <button
              type="button"
              class="btn btn-sm btn-primary d-inline-flex align-items-center gap-1"
              (click)="openCreateModal()"
              [appCustomTooltip]="'Registrar nueva sede educativa'"
            >
              <i class="material-symbols-outlined fs-6">add</i>
              <span>Nueva sede</span>
            </button>
          }
        </div>

        @for (campus of campusRows; track campus.id) {
          <tr>
            <td class="text-center text-muted small">
              {{ (campusesGrid.dataRecords?.from || 1) + $index }}
            </td>
            <td class="fw-medium">{{ campus.name }}</td>
            <td>{{ campus.daneCode || '—' }}</td>
            <td>{{ campus.cityName || '—' }}</td>
            <td>{{ campus.zoneName || '—' }}</td>
            <td class="text-center">
              <button
                type="button"
                class="v3-campus-stat-btn"
                (click)="openRelationsModal(campus)"
                [appCustomTooltip]="'Configurar jornadas y niveles de ' + campus.name"
              >
                <i class="material-symbols-outlined fs-6">tune</i>
                <span>{{ campus.shiftsCount }} jor. · {{ campus.levelsCount }} niv.</span>
              </button>
            </td>
            <td class="text-center">
              <span
                class="badge rounded-pill"
                [ngClass]="
                  campus.isMainCampus
                    ? 'bg-primary-transparent text-primary'
                    : 'bg-secondary-subtle text-secondary'
                "
              >
                {{ campus.isMainCampus ? 'Principal' : 'Anexa' }}
              </span>
            </td>
            <td class="text-center">
              <span
                class="badge rounded-pill"
                [ngClass]="
                  campus.isActive
                    ? 'bg-success-subtle text-success'
                    : 'bg-secondary-subtle text-secondary'
                "
              >
                {{ campus.isActive ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td class="text-end text-nowrap">
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
            </td>
          </tr>
        }
      </exodo-grid>
    </div>

    <!-- Modal Crear / Editar Sede -->
    <app-v3-modal-dialog
      [open]="formModalOpen()"
      [heading]="editingCampus() ? 'Editar Sede Educativa' : 'Nueva Sede Educativa'"
      icon="location_city"
      size="lg"
      (closed)="formModalOpen.set(false)"
    >
      <form [formGroup]="campusForm" (ngSubmit)="onCampusFormSubmit()">
        <app-v3-form-wizard
          [steps]="campusWizardSteps()"
          [(activeIndex)]="wizardStep"
          [allowFreeNavigation]="editingCampus() !== null"
          [showFooter]="false"
          (nextRequested)="onCampusStepNext($event)"
        >
          @if (wizardStep() === 0) {
            <div class="row g-3">
              <div class="col-12">
                <label class="form-label">Nombre de la sede *</label>
                <input type="text" class="form-control" formControlName="name" />
                @if (isControlInvalid(campusForm, 'name')) {
                  <small class="v3-field-error">El nombre de la sede es obligatorio.</small>
                }
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label">Código DANE sede</label>
                <input type="text" class="form-control" formControlName="daneCode" />
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label">Consecutivo</label>
                <input type="text" class="form-control" formControlName="consecutiveCode" />
              </div>
              <div class="col-12">
                <label class="form-label">Zona geográfica</label>
                <app-v3-searchable-select
                  formControlName="zoneId"
                  [options]="zoneOptions()"
                  placeholder="Seleccione zona..."
                  searchPlaceholder="Buscar zona..."
                />
              </div>
              <div class="col-12 col-md-6">
                <div class="v3-form-switch-box">
                  <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" id="campusMain" formControlName="isMainCampus" />
                    <label class="form-check-label" for="campusMain">Sede principal</label>
                  </div>
                </div>
              </div>
              <div class="col-12 col-md-6">
                <div class="v3-form-switch-box">
                  <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" id="campusActive" formControlName="isActive" />
                    <label class="form-check-label" for="campusActive">Sede activa</label>
                  </div>
                </div>
              </div>
            </div>
          } @else {
            <div class="row g-3">
              <div class="col-12 col-md-6">
                <label class="form-label">País</label>
                <app-v3-searchable-select
                  formControlName="countryId"
                  [options]="countryOptions()"
                  placeholder="Seleccione país..."
                  searchPlaceholder="Buscar país..."
                  (selectionChange)="onCountryChanged()"
                />
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label">Departamento</label>
                <app-v3-searchable-select
                  formControlName="departmentId"
                  [options]="departmentOptions()"
                  [clearable]="true"
                  placeholder="Seleccione..."
                  searchPlaceholder="Buscar departamento..."
                  (selectionChange)="onDepartmentChanged()"
                />
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label">Municipio / Ciudad</label>
                <app-v3-searchable-select
                  formControlName="cityId"
                  [options]="cityOptions()"
                  [clearable]="true"
                  placeholder="Seleccione..."
                  searchPlaceholder="Buscar municipio o ciudad..."
                />
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label">Dirección</label>
                <input type="text" class="form-control" formControlName="address" />
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label">Teléfonos</label>
                <input type="text" class="form-control" formControlName="phones" />
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label">Correo electrónico</label>
                <input type="email" class="form-control" formControlName="email" />
              </div>
            </div>
          }
        </app-v3-form-wizard>
      </form>

      <div modal-footer class="v3-modal-footer-split">
        <button type="button" class="btn btn-sm btn-outline-secondary" (click)="formModalOpen.set(false)">
          Cancelar
        </button>
        <div class="v3-modal-footer-actions">
          @if (wizardStep() > 0) {
            <button type="button" class="btn btn-sm btn-outline-secondary" (click)="wizardStep.set(wizardStep() - 1)">
              Anterior
            </button>
          }
          @if (wizardStep() === 0) {
            <button
              type="button"
              class="btn btn-sm"
              [ngClass]="editingCampus() ? 'btn-outline-primary' : 'btn-primary'"
              (click)="onCampusStepNext(0)"
            >
              Siguiente
            </button>
          }
          @if (wizardStep() === 1 || editingCampus()) {
            <button
              type="button"
              class="btn btn-sm btn-primary"
              [disabled]="campusForm.invalid"
              (click)="saveCampus()"
            >
              Guardar sede
            </button>
          }
        </div>
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
            <div class="d-flex align-items-center gap-2 mb-3">
              <app-v3-searchable-select
                class="flex-grow-1"
                size="sm"
                [(ngModel)]="selectedShiftId"
                [options]="availableShiftOptions()"
                [clearable]="true"
                placeholder="Seleccionar jornada..."
                searchPlaceholder="Buscar jornada..."
              />
              <button
                type="button"
                class="btn btn-sm btn-primary flex-shrink-0"
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
            <div class="d-flex align-items-center gap-2 mb-3">
              <app-v3-searchable-select
                class="flex-grow-1"
                size="sm"
                [(ngModel)]="selectedLevelId"
                [options]="availableEducationLevelOptions()"
                [clearable]="true"
                placeholder="Seleccionar nivel..."
                searchPlaceholder="Buscar nivel educativo..."
              />
              <button
                type="button"
                class="btn btn-sm btn-primary flex-shrink-0"
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
        <button
          type="button"
          class="btn btn-sm btn-outline-secondary"
          (click)="relationsModalOpen.set(false)"
        >
          Cerrar
        </button>
      </div>
    </app-v3-modal-dialog>
  `,
})
export class CampusesManagementComponent implements OnInit, AfterViewInit {
  @ViewChild('campusesGrid') private campusesGrid?: ExodoGridComponent;

  private readonly fb = inject(FormBuilder);
  private readonly adminService = inject(V3AdministrationService);
  private readonly catalogsService = inject(V3CatalogsService);
  private readonly v3Auth = inject(V3UnifiedAuthService);
  private readonly themeService = inject(CustomizerSettingsService);
  private readonly maskService = inject(LoadMaskService);
  private readonly messages = inject(MessagesService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private initLoadTimer: ReturnType<typeof setTimeout> | null = null;

  readonly dataSource: DataSourceContract = { rows: [], dataRecords: null };
  readonly proxy: Proxy = { api: { read: `${environment.APIURL}/admin/campuses` } };
  readonly catalogs = signal<GlobalCatalogsBundle | null>(null);
  readonly schoolContext = signal<SchoolAcademicContextCatalogs | null>(null);
  readonly countries = signal<CountryCatalogItem[]>([]);
  readonly departments = signal<DepartmentCatalogItem[]>([]);
  readonly cities = signal<CityCatalogItem[]>([]);

  protected readonly isControlInvalid = isControlInvalid;

  readonly formModalOpen = signal(false);
  readonly editingCampus = signal<CampusRecord | null>(null);
  readonly wizardStep = signal(0);
  readonly statusFilter = signal<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  readonly campusWizardSteps = computed<readonly V3WizardStep[]>(() => [
    {
      id: 'identity',
      title: 'Identificación y Estado',
      subtitle: 'Nombre, códigos oficiales y estado de operación',
      icon: 'location_city',
      invalid: Boolean(this.campusForm?.get('name')?.invalid && this.campusForm?.get('name')?.touched),
    },
    {
      id: 'location',
      title: 'Ubicación y Contacto',
      subtitle: 'Dirección física y canales de comunicación',
      icon: 'pin_drop',
      invalid: Boolean(this.campusForm?.get('email')?.invalid && this.campusForm?.get('email')?.touched),
    },
  ]);

  readonly relationsModalOpen = signal(false);
  readonly selectedCampus = signal<CampusRecord | null>(null);
  readonly campusShifts = signal<CampusShiftRecord[]>([]);
  readonly campusLevels = signal<CampusEducationLevelRecord[]>([]);
  selectedShiftId: number | null = null;
  selectedLevelId: number | null = null;

  readonly countryOptions = computed(() => this.toNamedOptions(this.countries()));
  readonly departmentOptions = computed(() => this.toNamedOptions(this.departments()));
  readonly cityOptions = computed(() => this.toNamedOptions(this.cities()));
  readonly zoneOptions = computed(() => this.toNamedOptions(this.catalogs()?.geographicalZones));
  readonly shiftOptions = computed(() => this.toNamedOptions(this.schoolContext()?.shifts));
  readonly educationLevelOptions = computed(() =>
    this.toNamedOptions(this.schoolContext()?.educationLevels)
  );
  readonly availableShiftOptions = computed(() => {
    const linked = new Set(this.campusShifts().map((item) => item.shiftId));
    return this.shiftOptions().filter((opt) => !linked.has(opt.value));
  });
  readonly availableEducationLevelOptions = computed(() => {
    const linked = new Set(
      this.campusLevels().map((item) => item.educationLevelId),
    );
    return this.educationLevelOptions().filter((opt) => !linked.has(opt.value));
  });

  private toNamedOptions(
    items?: readonly { id: number; name: string }[]
  ): SearchableSelectOption<number>[] {
    return (items ?? []).map((item) => ({ value: item.id, label: item.name }));
  }

  readonly canWrite = computed(() =>
    this.v3Auth.hasPermission('admin.campuses.write'),
  );

  get gridTheme(): 'dark' | 'glacial' {
    return this.themeService.isDark() ? 'dark' : 'glacial';
  }

  get campusRows(): CampusRecord[] {
    return (this.campusesGrid?.rows as CampusRecord[] | undefined) ?? [];
  }

  readonly columns: ColumnContract[] = [
    { text: '#', width: '48px', align: 'center', sortable: false },
    { text: 'Sede', dataIndex: 'name' },
    { text: 'Código DANE', dataIndex: 'daneCode' },
    { text: 'Municipio', dataIndex: 'cityName' },
    { text: 'Zona', dataIndex: 'zoneName' },
    { text: 'Jornadas / Niveles', dataIndex: 'shiftsCount', align: 'center' },
    { text: 'Principal', dataIndex: 'isMainCampus', align: 'center' },
    { text: 'Estado', dataIndex: 'isActive', align: 'center' },
    { text: 'Acciones', width: '140px', align: 'right', sortable: false },
  ];

  private readonly exportColumns: readonly ExodoExportColumn<CampusRecord>[] = [
    { header: 'Sede', value: (r) => r.name },
    { header: 'Código DANE', value: (r) => r.daneCode ?? '' },
    { header: 'Municipio', value: (r) => r.cityName ?? '' },
    { header: 'Zona', value: (r) => r.zoneName ?? '' },
    { header: 'Jornadas / Niveles', value: (r) => `${r.shiftsCount} / ${r.levelsCount}` },
    { header: 'Principal', value: (r) => (r.isMainCampus ? 'Sí' : 'No') },
    { header: 'Estado', value: (r) => (r.isActive ? 'Activo' : 'Inactivo') },
  ];

  readonly campusForm: FormGroup;

  constructor() {
    this.destroyRef.onDestroy(() => {
      if (this.initLoadTimer !== null) {
        clearTimeout(this.initLoadTimer);
        this.initLoadTimer = null;
      }
    });
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
  }

  ngAfterViewInit(): void {
    this.campusesGrid?.onLoad(
      { paginated: '1', status: this.statusFilter() },
      false,
    );
    if (this.isBrowser) {
      this.initLoadTimer = setTimeout(() => {
        this.initLoadTimer = null;
        this.campusesGrid?.onLoad(
          { paginated: '1', status: this.statusFilter() },
          true,
        );
      });
    }
  }

  setStatusFilter(status: 'ALL' | 'ACTIVE' | 'INACTIVE'): void {
    if (this.statusFilter() === status) {
      return;
    }
    this.statusFilter.set(status);
    this.campusesGrid?.onLoad({ paginated: '1', status }, true);
  }

  loadCampuses(): void {
    this.campusesGrid?.rebuildGrid();
  }

  exportCurrentPage(): void {
    exportGridRowsToExcel(
      this.campusRows,
      this.exportColumns,
      'sedes-educativas',
    );
  }

  onGridLoadError(): void {
    this.messages.showError('No fue posible cargar el listado de sedes educativas.');
  }

  openCreateModal(): void {
    this.editingCampus.set(null);
    this.wizardStep.set(0);
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
    this.wizardStep.set(0);
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

  onCampusStepNext(stepIndex: number): void {
    if (stepIndex === 0) {
      const nameControl = this.campusForm.get('name');
      if (nameControl?.invalid) {
        nameControl.markAsTouched();
        return;
      }
      this.wizardStep.set(1);
    }
  }

  onCampusFormSubmit(): void {
    if (this.wizardStep() === 0 && !this.editingCampus()) {
      this.onCampusStepNext(0);
      return;
    }
    this.saveCampus();
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
