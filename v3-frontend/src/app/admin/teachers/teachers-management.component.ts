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
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
  TeacherProfileRecord,
  V3AdministrationService,
} from '../../services/v3-administration.service';
import {
  GlobalCatalogsBundle,
  V3CatalogsService,
} from '../../services/v3-catalogs.service';
import { V3UnifiedAuthService } from '../../services/v3-unified-auth.service';
import { V3FileManagerModalComponent } from '../../shared/components/v3-file-manager-modal/v3-file-manager-modal.component';
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
 * Gestión de Personal Docente (reemplaza Teachers.js y SaveTeacher.js de ExtJS).
 */
@Component({
  selector: 'app-teachers-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    ExodolibsModule,
    V3ModalDialogComponent,
    V3FileManagerModalComponent,
    V3FormWizardComponent,
    V3SearchableSelectComponent,
    CustomTooltipDirective,
  ],
  template: `
    <div class="container-fluid py-3">
      <div class="breadcrumb-card mb-25 d-md-flex align-items-center justify-content-between">
        <div>
          <h5 class="mb-0 fw-bold">Personal Docente</h5>
          <small class="text-muted">Registro institucional de planta docente y expediente digital</small>
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
          <li class="breadcrumb-item d-inline-block position-relative">Personal Docente</li>
        </ol>
      </div>

      <div class="v3-admin-filter-strip">
        <div class="v3-admin-filter-group">
          <span class="v3-admin-filter-label">Estado</span>
          <div class="v3-rbac-segment-bar" role="group" aria-label="Filtrar docentes por estado">
            <button
              type="button"
              class="v3-rbac-segment-pill"
              [class.is-active]="statusFilter() === 'ACTIVE'"
              (click)="setStatusFilter('ACTIVE')"
            >
              <span>Activos</span>
            </button>
            <button
              type="button"
              class="v3-rbac-segment-pill"
              [class.is-active]="statusFilter() === 'INACTIVE'"
              (click)="setStatusFilter('INACTIVE')"
            >
              <span>Inactivos</span>
            </button>
            <button
              type="button"
              class="v3-rbac-segment-pill"
              [class.is-active]="statusFilter() === 'ALL'"
              (click)="setStatusFilter('ALL')"
            >
              <span>Todos</span>
            </button>
          </div>
        </div>
      </div>

      <exodo-grid
        #teachersGrid
        mode="remote"
        caption="Directorio de Docentes"
        [columns]="columns"
        [dataSource]="dataSource"
        [proxy]="proxy"
        [customBody]="true"
        [allowSorting]="true"
        [allowFiltering]="true"
        [showPagination]="true"
        [limit]="15"
        [theme]="gridTheme"
        placeholder="Buscar docente, documento o correo..."
        (loadError)="onGridLoadError()"
      >
        <div header class="v3-exodo-toolbar">
          <button
            type="button"
            class="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
            (click)="teachersGrid.clearFilters()"
            [appCustomTooltip]="'Limpiar filtros y ordenamiento'"
          >
            <i class="material-symbols-outlined fs-6">filter_alt_off</i>
            <span>Limpiar</span>
          </button>

          @if (teacherRows.length > 0) {
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
              [appCustomTooltip]="'Registrar nuevo docente'"
            >
              <i class="material-symbols-outlined fs-6">person_add</i>
              <span>Nuevo docente</span>
            </button>
          }
        </div>

        @for (teacher of teacherRows; track teacher.id) {
          <tr>
            <td class="text-center text-muted small">
              {{ (teachersGrid.dataRecords?.from || 1) + $index }}
            </td>
            <td>
              {{
                teacher.documentTypeCode
                  ? teacher.documentTypeCode + ' ' + teacher.documentNumber
                  : teacher.documentNumber
              }}
            </td>
            <td class="fw-medium">{{ teacher.fullName }}</td>
            <td>
              @if (teacher.email || teacher.phone) {
                <div class="v3-contact-stack">
                  @if (teacher.email) {
                    <span class="v3-contact-primary">{{ teacher.email }}</span>
                  }
                  @if (teacher.phone) {
                    <span class="v3-contact-secondary">
                      <i class="material-symbols-outlined fs-6">call</i>
                      {{ teacher.phone }}
                    </span>
                  }
                </div>
              } @else {
                <span class="text-muted">—</span>
              }
            </td>
            <td>{{ teacher.teachingAreaName || '—' }}</td>
            <td>{{ teacher.payScaleName || '—' }}</td>
            <td class="text-center">
              <span
                class="badge rounded-pill"
                [ngClass]="
                  teacher.isActive
                    ? 'bg-success-subtle text-success'
                    : 'bg-secondary-subtle text-secondary'
                "
              >
                {{ teacher.isActive ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td class="text-end text-nowrap">
              <button
                type="button"
                class="btn btn-sm btn-outline-info me-1"
                (click)="openTeacherDocsModal(teacher)"
                [appCustomTooltip]="'Documentos digitales de ' + teacher.fullName"
              >
                <i class="material-symbols-outlined fs-6">folder_shared</i>
              </button>
              @if (canWrite()) {
                <button
                  type="button"
                  class="btn btn-sm me-1"
                  [ngClass]="teacher.isActive ? 'btn-outline-warning' : 'btn-outline-success'"
                  (click)="toggleTeacherStatus(teacher)"
                  [appCustomTooltip]="teacher.isActive ? 'Inactivar docente' : 'Reactivar docente'"
                >
                  <i class="material-symbols-outlined fs-6">
                    {{ teacher.isActive ? 'block' : 'check_circle' }}
                  </i>
                </button>
                <button
                  type="button"
                  class="btn btn-sm btn-outline-primary me-1"
                  (click)="openEditModal(teacher)"
                  [appCustomTooltip]="'Editar docente'"
                >
                  <i class="material-symbols-outlined fs-6">edit</i>
                </button>
              }
              @if (canDelete()) {
                <button
                  type="button"
                  class="btn btn-sm btn-outline-danger"
                  (click)="confirmDeleteTeacher(teacher)"
                  [appCustomTooltip]="'Eliminar docente'"
                >
                  <i class="material-symbols-outlined fs-6">delete</i>
                </button>
              }
            </td>
          </tr>
        }
      </exodo-grid>
    </div>

    <app-v3-modal-dialog
      [open]="formModalOpen()"
      [heading]="editingTeacher() ? 'Editar Docente' : 'Registrar Docente'"
      icon="school"
      size="lg"
      (closed)="formModalOpen.set(false)"
    >
      <form [formGroup]="teacherForm" (ngSubmit)="onTeacherFormSubmit()">
        <app-v3-form-wizard
          [steps]="teacherWizardSteps()"
          [(activeIndex)]="wizardStep"
          [allowFreeNavigation]="editingTeacher() !== null"
          [showFooter]="false"
          (nextRequested)="onTeacherStepNext($event)"
        >
          @if (wizardStep() === 0) {
            <div class="row g-3">
              <div class="col-12 col-md-6">
                <label class="form-label">Tipo de documento</label>
                <app-v3-searchable-select
                  formControlName="documentTypeId"
                  [options]="documentTypeOptions()"
                  placeholder="Seleccione tipo..."
                  searchPlaceholder="Buscar tipo de documento..."
                />
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label">Número de documento *</label>
                <input type="text" class="form-control" formControlName="documentNumber" />
                @if (isControlInvalid(teacherForm, 'documentNumber')) {
                  <small class="v3-field-error">El número de documento es obligatorio.</small>
                }
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label">Primer nombre *</label>
                <input type="text" class="form-control" formControlName="firstName" />
                @if (isControlInvalid(teacherForm, 'firstName')) {
                  <small class="v3-field-error">El primer nombre es obligatorio.</small>
                }
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label">Segundo nombre</label>
                <input type="text" class="form-control" formControlName="middleName" />
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label">Primer apellido *</label>
                <input type="text" class="form-control" formControlName="lastName" />
                @if (isControlInvalid(teacherForm, 'lastName')) {
                  <small class="v3-field-error">El primer apellido es obligatorio.</small>
                }
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label">Segundo apellido</label>
                <input type="text" class="form-control" formControlName="secondLastName" />
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label">Género</label>
                <app-v3-searchable-select
                  formControlName="genderId"
                  [options]="genderOptions()"
                  [clearable]="true"
                  placeholder="Seleccione..."
                  searchPlaceholder="Buscar género..."
                />
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label">Fecha de nacimiento</label>
                <input type="date" class="form-control" formControlName="birthDate" />
              </div>
              @if (!editingTeacher()) {
                <div class="col-12">
                  <div class="v3-form-panel v3-form-panel--info d-flex align-items-start gap-2 mb-0">
                    <i class="material-symbols-outlined text-primary fs-5">badge</i>
                    <small>
                      Al registrar el docente se habilita su acceso al portal usando su número de documento como usuario y contraseña inicial (podrá actualizarla en su primer ingreso).
                    </small>
                  </div>
                </div>
              }
            </div>
          } @else if (wizardStep() === 1) {
            <div class="row g-3">
              <div class="col-12 col-md-6">
                <label class="form-label">Correo electrónico</label>
                <input type="email" class="form-control" formControlName="email" />
                @if (isControlInvalid(teacherForm, 'email')) {
                  <small class="v3-field-error">Ingresa un correo electrónico válido.</small>
                }
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label">Teléfono / Celular</label>
                <input type="text" class="form-control" formControlName="phone" />
              </div>
              <div class="col-12">
                <label class="form-label">Dirección de residencia</label>
                <input type="text" class="form-control" formControlName="address" />
              </div>
            </div>
          } @else {
            <div class="row g-3">
              <div class="col-12 col-md-6">
                <label class="form-label">Nivel académico / Formación</label>
                <app-v3-searchable-select
                  formControlName="academicDegreeId"
                  [options]="academicDegreeOptions()"
                  [clearable]="true"
                  placeholder="Seleccione..."
                  searchPlaceholder="Buscar nivel académico..."
                />
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label">Escalafón docente</label>
                <app-v3-searchable-select
                  formControlName="payScaleId"
                  [options]="payScaleOptions()"
                  [clearable]="true"
                  placeholder="Seleccione..."
                  searchPlaceholder="Buscar escalafón..."
                />
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label">Área de enseñanza</label>
                <app-v3-searchable-select
                  formControlName="teachingAreaId"
                  [options]="teachingAreaOptions()"
                  [clearable]="true"
                  placeholder="Seleccione..."
                  searchPlaceholder="Buscar área..."
                />
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label">Tipo de vinculación</label>
                <app-v3-searchable-select
                  formControlName="appointmentTypeId"
                  [options]="appointmentTypeOptions()"
                  [clearable]="true"
                  placeholder="Seleccione..."
                  searchPlaceholder="Buscar vinculación..."
                />
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label">Cargo docente</label>
                <app-v3-searchable-select
                  formControlName="positionId"
                  [options]="positionOptions()"
                  [clearable]="true"
                  placeholder="Seleccione..."
                  searchPlaceholder="Buscar cargo..."
                />
              </div>
              <div class="col-12 col-md-6 d-flex align-items-end">
                <div class="v3-form-switch-box">
                  <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" id="teacherActive" formControlName="isActive" />
                    <label class="form-check-label" for="teacherActive">Docente activo</label>
                  </div>
                </div>
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
          @if (wizardStep() < 2) {
            <button
              type="button"
              class="btn btn-sm"
              [ngClass]="editingTeacher() ? 'btn-outline-primary' : 'btn-primary'"
              (click)="onTeacherStepNext(wizardStep())"
            >
              Siguiente
            </button>
          }
          @if (wizardStep() === 2 || editingTeacher()) {
            <button
              type="button"
              class="btn btn-sm btn-primary"
              [disabled]="teacherForm.invalid"
              (click)="saveTeacher()"
            >
              Guardar docente
            </button>
          }
        </div>
      </div>
    </app-v3-modal-dialog>

    <app-v3-file-manager-modal
      [open]="docsModalOpen()"
      [heading]="'Documentos Digitales · ' + (selectedTeacherForDocs()?.fullName || 'Docente')"
      subtitle="Expediente digital enlazado al docente seleccionado"
      category="TEACHER_DOCUMENTS"
      ownerEntityType="TEACHER"
      [ownerEntityId]="selectedTeacherForDocs()?.id ?? null"
      [ownerDisplayName]="selectedTeacherForDocs()?.fullName ?? null"
      [ownerDocumentNumber]="selectedTeacherForDocs()?.documentNumber ?? null"
      [canUpload]="canManageDocs()"
      [canDelete]="canManageDocs()"
      (closed)="closeTeacherDocsModal()"
    />
  `,
})
export class TeachersManagementComponent implements OnInit, AfterViewInit {
  @ViewChild('teachersGrid') private teachersGrid?: ExodoGridComponent;

  private readonly fb = inject(FormBuilder);
  private readonly adminService = inject(V3AdministrationService);
  private readonly catalogsService = inject(V3CatalogsService);
  private readonly v3Auth = inject(V3UnifiedAuthService);
  private readonly themeService = inject(CustomizerSettingsService);
  private readonly maskService = inject(LoadMaskService);
  private readonly messages = inject(MessagesService);
  protected readonly isControlInvalid = isControlInvalid;

  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private initLoadTimer: ReturnType<typeof setTimeout> | null = null;

  readonly wizardStep = signal(0);
  readonly teacherWizardSteps = computed<readonly V3WizardStep[]>(() => [
    {
      id: 'personal',
      title: 'Datos Personales',
      subtitle: 'Documento, nombres completos y nacimiento',
      icon: 'person',
      invalid: Boolean(
        (this.teacherForm?.get('documentNumber')?.invalid &&
          this.teacherForm?.get('documentNumber')?.touched) ||
          (this.teacherForm?.get('firstName')?.invalid &&
            this.teacherForm?.get('firstName')?.touched) ||
          (this.teacherForm?.get('lastName')?.invalid &&
            this.teacherForm?.get('lastName')?.touched)
      ),
    },
    {
      id: 'contact',
      title: 'Contacto y Residencia',
      subtitle: 'Correo electrónico, teléfono y dirección',
      icon: 'contact_mail',
      invalid: Boolean(
        this.teacherForm?.get('email')?.invalid &&
          this.teacherForm?.get('email')?.touched
      ),
    },
    {
      id: 'profile',
      title: 'Perfil Docente',
      subtitle: 'Formación, escalafón, área y vinculación',
      icon: 'workspace_premium',
    },
  ]);

  readonly dataSource: DataSourceContract = { rows: [], dataRecords: null };
  readonly proxy: Proxy = {
    api: { read: `${environment.APIURL}/admin/teachers` },
  };
  readonly catalogs = signal<GlobalCatalogsBundle | null>(null);
  readonly formModalOpen = signal(false);
  readonly docsModalOpen = signal(false);
  readonly selectedTeacherForDocs = signal<TeacherProfileRecord | null>(null);
  readonly editingTeacher = signal<TeacherProfileRecord | null>(null);
  readonly statusFilter = signal<'ACTIVE' | 'INACTIVE' | 'ALL'>('ACTIVE');

  readonly documentTypeOptions = computed<SearchableSelectOption<number>[]>(() =>
    (this.catalogs()?.documentTypes ?? []).map((item) => ({
      value: item.id,
      label: `${item.code} - ${item.name}`,
    }))
  );
  readonly genderOptions = computed(() => this.toNamedOptions(this.catalogs()?.genders));
  readonly academicDegreeOptions = computed(() =>
    this.toNamedOptions(this.catalogs()?.academicDegrees)
  );
  readonly payScaleOptions = computed(() => this.toNamedOptions(this.catalogs()?.teacherPayScales));
  readonly teachingAreaOptions = computed(() =>
    this.toNamedOptions(this.catalogs()?.teachingAreas)
  );
  readonly appointmentTypeOptions = computed(() =>
    this.toNamedOptions(this.catalogs()?.staffAppointmentTypes)
  );
  readonly positionOptions = computed(() => this.toNamedOptions(this.catalogs()?.staffPositions));

  private toNamedOptions(
    items?: readonly { id: number; name: string }[]
  ): SearchableSelectOption<number>[] {
    return (items ?? []).map((item) => ({ value: item.id, label: item.name }));
  }

  readonly canWrite = computed(() =>
    this.v3Auth.hasPermission('admin.teachers.write'),
  );

  readonly canDelete = computed(() =>
    this.v3Auth.hasPermission('admin.teachers.delete'),
  );

  readonly canManageDocs = computed(() =>
    this.v3Auth.hasPermission('storage.teacher_documents.write'),
  );

  get gridTheme(): 'dark' | 'glacial' {
    return this.themeService.isDark() ? 'dark' : 'glacial';
  }

  get teacherRows(): TeacherProfileRecord[] {
    return (this.teachersGrid?.rows as TeacherProfileRecord[] | undefined) ?? [];
  }

  readonly columns: ColumnContract[] = [
    { text: '#', width: '48px', align: 'center', sortable: false },
    { text: 'Documento', dataIndex: 'documentNumber' },
    { text: 'Docente', dataIndex: 'fullName' },
    { text: 'Contacto', dataIndex: 'email' },
    { text: 'Área enseñanza', dataIndex: 'teachingAreaName' },
    { text: 'Escalafón', dataIndex: 'payScaleName' },
    { text: 'Estado', dataIndex: 'isActive', align: 'center' },
    { text: 'Acciones', width: '175px', align: 'right', sortable: false },
  ];

  openTeacherDocsModal(teacher: TeacherProfileRecord): void {
    this.selectedTeacherForDocs.set(teacher);
    this.docsModalOpen.set(true);
  }

  closeTeacherDocsModal(): void {
    this.docsModalOpen.set(false);
    this.selectedTeacherForDocs.set(null);
  }

  private readonly exportColumns: readonly ExodoExportColumn<TeacherProfileRecord>[] = [
    {
      header: 'Documento',
      value: (r) =>
        r.documentTypeCode
          ? `${r.documentTypeCode} ${r.documentNumber}`
          : r.documentNumber,
    },
    { header: 'Docente', value: (r) => r.fullName },
    { header: 'Correo', value: (r) => r.email ?? '' },
    { header: 'Teléfono', value: (r) => r.phone ?? '' },
    { header: 'Área enseñanza', value: (r) => r.teachingAreaName ?? '' },
    { header: 'Escalafón', value: (r) => r.payScaleName ?? '' },
    { header: 'Estado', value: (r) => (r.isActive ? 'Activo' : 'Inactivo') },
  ];

  readonly teacherForm: FormGroup;

  constructor() {
    this.destroyRef.onDestroy(() => {
      if (this.initLoadTimer !== null) {
        clearTimeout(this.initLoadTimer);
        this.initLoadTimer = null;
      }
    });
    this.teacherForm = this.fb.group({
      documentTypeId: [1],
      documentNumber: ['', [Validators.required, Validators.maxLength(30)]],
      firstName: ['', [Validators.required, Validators.maxLength(80)]],
      middleName: [''],
      lastName: ['', [Validators.required, Validators.maxLength(80)]],
      secondLastName: [''],
      genderId: [null],
      birthDate: [''],
      address: [''],
      phone: [''],
      email: ['', [Validators.email]],
      academicDegreeId: [null],
      payScaleId: [null],
      teachingAreaId: [null],
      appointmentTypeId: [null],
      positionId: [null],
      isActive: [true],
    });
  }

  ngOnInit(): void {
    this.catalogsService.getGlobalBundle().subscribe((b) => this.catalogs.set(b));
  }

  ngAfterViewInit(): void {
    this.teachersGrid?.onLoad(
      { paginated: '1', status: this.statusFilter() },
      false,
    );
    if (this.isBrowser) {
      this.initLoadTimer = setTimeout(() => {
        this.initLoadTimer = null;
        this.teachersGrid?.onLoad(
          { paginated: '1', status: this.statusFilter() },
          true,
        );
      });
    }
  }

  setStatusFilter(status: 'ACTIVE' | 'INACTIVE' | 'ALL'): void {
    if (this.statusFilter() === status) {
      return;
    }
    this.statusFilter.set(status);
    this.teachersGrid?.onLoad({ paginated: '1', status }, true);
  }

  loadTeachers(): void {
    this.teachersGrid?.rebuildGrid();
  }

  exportCurrentPage(): void {
    exportGridRowsToExcel(
      this.teacherRows,
      this.exportColumns,
      'personal-docente',
    );
  }

  onGridLoadError(): void {
    this.messages.showError(
      'No fue posible cargar el listado de personal docente.',
    );
  }

  openCreateModal(): void {
    this.editingTeacher.set(null);
    this.wizardStep.set(0);
    this.teacherForm.reset({
      documentTypeId: 1,
      documentNumber: '',
      firstName: '',
      middleName: '',
      lastName: '',
      secondLastName: '',
      genderId: null,
      birthDate: '',
      address: '',
      phone: '',
      email: '',
      academicDegreeId: null,
      payScaleId: null,
      teachingAreaId: null,
      appointmentTypeId: null,
      positionId: null,
      isActive: true,
    });
    this.formModalOpen.set(true);
  }

  openEditModal(teacher: TeacherProfileRecord): void {
    this.editingTeacher.set(teacher);
    this.wizardStep.set(0);
    this.teacherForm.patchValue({
      documentTypeId: teacher.documentTypeId ?? 1,
      documentNumber: teacher.documentNumber,
      firstName: teacher.firstName,
      middleName: teacher.middleName ?? '',
      lastName: teacher.lastName,
      secondLastName: teacher.secondLastName ?? '',
      genderId: teacher.genderId,
      birthDate: teacher.birthDate ?? '',
      address: teacher.address ?? '',
      phone: teacher.phone ?? '',
      email: teacher.email ?? '',
      academicDegreeId: teacher.academicDegreeId,
      payScaleId: teacher.payScaleId,
      teachingAreaId: teacher.teachingAreaId,
      appointmentTypeId: teacher.appointmentTypeId,
      positionId: teacher.positionId,
      isActive: teacher.isActive,
    });
    this.formModalOpen.set(true);
  }

  onTeacherStepNext(stepIndex: number): void {
    if (stepIndex === 0) {
      const requiredControls = ['documentNumber', 'firstName', 'lastName'];
      let hasInvalid = false;
      for (const name of requiredControls) {
        const ctrl = this.teacherForm.get(name);
        if (ctrl?.invalid) {
          ctrl.markAsTouched();
          hasInvalid = true;
        }
      }
      if (hasInvalid) {
        return;
      }
      this.wizardStep.set(1);
      return;
    }

    if (stepIndex === 1) {
      const emailCtrl = this.teacherForm.get('email');
      if (emailCtrl?.invalid) {
        emailCtrl.markAsTouched();
        return;
      }
      this.wizardStep.set(2);
    }
  }

  onTeacherFormSubmit(): void {
    if (this.wizardStep() < 2 && !this.editingTeacher()) {
      this.onTeacherStepNext(this.wizardStep());
      return;
    }
    this.saveTeacher();
  }

  saveTeacher(): void {
    if (this.teacherForm.invalid) {
      markAllAsTouched(this.teacherForm);
      return;
    }

    const raw = this.teacherForm.getRawValue();
    const payload = {
      documentTypeId: raw.documentTypeId || 1,
      documentNumber: raw.documentNumber,
      firstName: raw.firstName,
      middleName: raw.middleName || null,
      lastName: raw.lastName,
      secondLastName: raw.secondLastName || null,
      genderId: raw.genderId || null,
      birthDate: raw.birthDate || null,
      address: raw.address || null,
      phone: raw.phone || null,
      email: raw.email || null,
      academicDegreeId: raw.academicDegreeId || null,
      payScaleId: raw.payScaleId || null,
      teachingAreaId: raw.teachingAreaId || null,
      appointmentTypeId: raw.appointmentTypeId || null,
      positionId: raw.positionId || null,
      isActive: Boolean(raw.isActive),
    };

    const editing = this.editingTeacher();
    this.maskService.show('messages.saving');
    const request$ = editing
      ? this.adminService.updateTeacher(editing.id, payload)
      : this.adminService.createTeacher(payload);

    request$.pipe(finalize(() => this.maskService.hide())).subscribe({
      next: () => {
        this.messages.showSuccess(
          editing ? 'Docente actualizado correctamente.' : 'Docente registrado correctamente.',
        );
        this.formModalOpen.set(false);
        this.loadTeachers();
      },
    });
  }

  toggleTeacherStatus(teacher: TeacherProfileRecord): void {
    const nextActive = !teacher.isActive;
    void this.messages
      .showConfirm({
        title: nextActive ? 'Reactivar docente' : 'Inactivar docente',
        message: nextActive
          ? `¿Deseas reactivar a "${teacher.fullName}" en el directorio activo?`
          : `¿Deseas inactivar temporalmente a "${teacher.fullName}"? Podrás reactivarlo luego desde el filtro de inactivos.`,
      })
      .then((res) => {
        if (!res.isConfirmed) {
          return;
        }
        this.maskService.show('messages.processing');
        this.adminService
          .updateTeacher(
            teacher.id,
            this.buildTeacherPayloadFromRecord(teacher, nextActive),
          )
          .pipe(finalize(() => this.maskService.hide()))
          .subscribe({
            next: () => {
              this.messages.showSuccess(
                nextActive
                  ? 'Docente reactivado correctamente.'
                  : 'Docente inactivado correctamente.',
              );
              this.loadTeachers();
            },
          });
      });
  }

  private buildTeacherPayloadFromRecord(
    teacher: TeacherProfileRecord,
    isActive: boolean,
  ): Record<string, unknown> {
    return {
      documentTypeId: teacher.documentTypeId || 1,
      documentNumber: teacher.documentNumber,
      firstName: teacher.firstName,
      middleName: teacher.middleName || null,
      lastName: teacher.lastName,
      secondLastName: teacher.secondLastName || null,
      genderId: teacher.genderId || null,
      birthDate: teacher.birthDate ? teacher.birthDate.slice(0, 10) : null,
      address: teacher.address || null,
      phone: teacher.phone || null,
      email: teacher.email || null,
      academicDegreeId: teacher.academicDegreeId || null,
      payScaleId: teacher.payScaleId || null,
      teachingAreaId: teacher.teachingAreaId || null,
      appointmentTypeId: teacher.appointmentTypeId || null,
      positionId: teacher.positionId || null,
      isActive,
    };
  }

  confirmDeleteTeacher(teacher: TeacherProfileRecord): void {
    void this.messages
      .confirmDelete(`¿Deseas eliminar al docente "${teacher.fullName}"?`)
      .then((res) => {
        if (res.isConfirmed) {
          this.maskService.show('messages.processing');
          this.adminService
            .deleteTeacher(teacher.id)
            .pipe(finalize(() => this.maskService.hide()))
            .subscribe({
              next: () => {
                this.messages.showSuccess('Docente eliminado correctamente.');
                this.loadTeachers();
              },
            });
        }
      });
  }
}
