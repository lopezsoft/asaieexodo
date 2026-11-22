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
  AdministrativeStaffRecord,
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
 * Gestión de Personal Administrativo (reemplaza Admins.js y SaveAdmin.js de ExtJS).
 */
@Component({
  selector: 'app-administrative-staff',
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
          <h5 class="mb-0 fw-bold">Personal Administrativo</h5>
          <small class="text-muted">Directivos, secretaría y funcionarios administrativos</small>
        </div>
        <ol class="breadcrumb list-unstyled mt-0 mb-0 p-0">
          <li class="breadcrumb-item d-inline-block position-relative">
            <a routerLink="/admin" class="d-inline-block position-relative">Administrativo</a>
          </li>
          <li class="breadcrumb-item d-inline-block position-relative">Personal Administrativo</li>
        </ol>
      </div>

      <exodo-grid
        #staffGrid
        mode="remote"
        caption="Directorio de Personal Administrativo"
        [columns]="columns"
        [dataSource]="dataSource"
        [proxy]="proxy"
        [customBody]="true"
        [allowSorting]="true"
        [allowFiltering]="true"
        [showPagination]="true"
        [limit]="15"
        [theme]="gridTheme"
        placeholder="Buscar por documento, nombre o correo..."
        (loadError)="onGridLoadError()"
      >
        <div header class="v3-exodo-toolbar">
          <button
            type="button"
            class="btn btn-sm btn-outline-info d-inline-flex align-items-center gap-1"
            (click)="docsModalOpen.set(true)"
            [appCustomTooltip]="'Abrir repositorio digital de documentos administrativos'"
          >
            <i class="material-symbols-outlined fs-6">folder_shared</i>
            <span>Documentos digitales</span>
          </button>

          <button
            type="button"
            class="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
            (click)="staffGrid.clearFilters()"
            [appCustomTooltip]="'Limpiar filtros y ordenamiento'"
          >
            <i class="material-symbols-outlined fs-6">filter_alt_off</i>
            <span>Limpiar</span>
          </button>

          @if (staffRows.length > 0) {
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
              [appCustomTooltip]="'Registrar funcionario administrativo'"
            >
              <i class="material-symbols-outlined fs-6">person_add</i>
              <span>Nuevo funcionario</span>
            </button>
          }
        </div>

        @for (staff of staffRows; track staff.id) {
          <tr>
            <td class="text-center text-muted small">
              {{ (staffGrid.dataRecords?.from || 1) + $index }}
            </td>
            <td>
              {{
                staff.documentTypeCode
                  ? staff.documentTypeCode + ' ' + staff.documentNumber
                  : staff.documentNumber
              }}
            </td>
            <td class="fw-medium">{{ staff.fullName }}</td>
            <td>{{ staff.email || '—' }}</td>
            <td>{{ staff.phone || '—' }}</td>
            <td>{{ staff.hierarchyLevelName || '—' }}</td>
            <td>{{ staff.appointmentTypeName || '—' }}</td>
            <td class="text-center">
              <span
                class="badge rounded-pill"
                [ngClass]="
                  staff.isActive
                    ? 'bg-success-subtle text-success'
                    : 'bg-secondary-subtle text-secondary'
                "
              >
                {{ staff.isActive ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td class="text-end text-nowrap">
              @if (canWrite()) {
                <button
                  type="button"
                  class="btn btn-sm btn-outline-primary me-1"
                  (click)="openEditModal(staff)"
                  [appCustomTooltip]="'Editar funcionario'"
                >
                  <i class="material-symbols-outlined fs-6">edit</i>
                </button>
                <button
                  type="button"
                  class="btn btn-sm btn-outline-danger"
                  (click)="confirmDeleteStaff(staff)"
                  [appCustomTooltip]="'Eliminar funcionario'"
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
      [heading]="editingStaff() ? 'Editar Funcionario' : 'Registrar Funcionario Administrativo'"
      icon="badge"
      size="lg"
      (closed)="formModalOpen.set(false)"
    >
      <form [formGroup]="staffForm" (ngSubmit)="onStaffFormSubmit()">
        <app-v3-form-wizard
          [steps]="staffWizardSteps()"
          [(activeIndex)]="wizardStep"
          [allowFreeNavigation]="editingStaff() !== null"
          [showFooter]="false"
          (nextRequested)="onStaffStepNext($event)"
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
                @if (isControlInvalid(staffForm, 'documentNumber')) {
                  <small class="v3-field-error">El número de documento es obligatorio.</small>
                }
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label">Primer nombre *</label>
                <input type="text" class="form-control" formControlName="firstName" />
                @if (isControlInvalid(staffForm, 'firstName')) {
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
                @if (isControlInvalid(staffForm, 'lastName')) {
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
            </div>
          } @else if (wizardStep() === 1) {
            <div class="row g-3">
              <div class="col-12 col-md-6">
                <label class="form-label">Teléfono / Celular</label>
                <input type="text" class="form-control" formControlName="phone" />
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label">Correo electrónico</label>
                <input type="email" class="form-control" formControlName="email" />
                @if (isControlInvalid(staffForm, 'email')) {
                  <small class="v3-field-error">Ingresa un correo electrónico válido.</small>
                }
              </div>
            </div>
          } @else {
            <div class="row g-3">
              <div class="col-12 col-md-6">
                <label class="form-label">Nivel jerárquico</label>
                <app-v3-searchable-select
                  formControlName="hierarchyLevelId"
                  [options]="hierarchyLevelOptions()"
                  [clearable]="true"
                  placeholder="Seleccione..."
                  searchPlaceholder="Buscar nivel jerárquico..."
                />
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label">Carrera administrativa</label>
                <app-v3-searchable-select
                  formControlName="careerTypeId"
                  [options]="careerTypeOptions()"
                  [clearable]="true"
                  placeholder="Seleccione..."
                  searchPlaceholder="Buscar carrera..."
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
                <label class="form-label">Ubicación laboral</label>
                <app-v3-searchable-select
                  formControlName="workplaceLocationId"
                  [options]="workplaceLocationOptions()"
                  [clearable]="true"
                  placeholder="Seleccione..."
                  searchPlaceholder="Buscar ubicación..."
                />
              </div>
              <div class="col-12 col-md-6">
                <div class="v3-form-switch-box">
                  <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" id="staffActive" formControlName="isActive" />
                    <label class="form-check-label" for="staffActive">Funcionario activo</label>
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
              [ngClass]="editingStaff() ? 'btn-outline-primary' : 'btn-primary'"
              (click)="onStaffStepNext(wizardStep())"
            >
              Siguiente
            </button>
          }
          @if (wizardStep() === 2 || editingStaff()) {
            <button
              type="button"
              class="btn btn-sm btn-primary"
              [disabled]="staffForm.invalid"
              (click)="saveStaff()"
            >
              Guardar funcionario
            </button>
          }
        </div>
      </div>
    </app-v3-modal-dialog>

    <app-v3-file-manager-modal
      [open]="docsModalOpen()"
      heading="Documentos de Personal Administrativo"
      category="GENERAL"
      [canUpload]="canWrite()"
      [canDelete]="canWrite()"
      (closed)="docsModalOpen.set(false)"
    />
  `,
})
export class AdministrativeStaffComponent implements OnInit, AfterViewInit {
  @ViewChild('staffGrid') private staffGrid?: ExodoGridComponent;

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

  protected readonly isControlInvalid = isControlInvalid;

  readonly dataSource: DataSourceContract = { rows: [], dataRecords: null };
  readonly proxy: Proxy = { api: { read: `${environment.APIURL}/admin/staff` } };
  readonly catalogs = signal<GlobalCatalogsBundle | null>(null);
  readonly formModalOpen = signal(false);
  readonly docsModalOpen = signal(false);
  readonly editingStaff = signal<AdministrativeStaffRecord | null>(null);
  readonly wizardStep = signal(0);

  readonly staffWizardSteps = computed<readonly V3WizardStep[]>(() => [
    {
      id: 'personal',
      title: 'Datos Personales',
      subtitle: 'Identificación y nombres completos',
      icon: 'badge',
      invalid: Boolean(
        (this.staffForm?.get('documentNumber')?.invalid &&
          this.staffForm?.get('documentNumber')?.touched) ||
          (this.staffForm?.get('firstName')?.invalid &&
            this.staffForm?.get('firstName')?.touched) ||
          (this.staffForm?.get('lastName')?.invalid &&
            this.staffForm?.get('lastName')?.touched)
      ),
    },
    {
      id: 'contact',
      title: 'Contacto',
      subtitle: 'Teléfono y correo institucional',
      icon: 'call',
      invalid: Boolean(
        this.staffForm?.get('email')?.invalid &&
          this.staffForm?.get('email')?.touched
      ),
    },
    {
      id: 'position',
      title: 'Cargo y Vinculación',
      subtitle: 'Nivel jerárquico, carrera y ubicación laboral',
      icon: 'work',
    },
  ]);

  readonly documentTypeOptions = computed<SearchableSelectOption<number>[]>(() =>
    (this.catalogs()?.documentTypes ?? []).map((item) => ({
      value: item.id,
      label: `${item.code} - ${item.name}`,
    }))
  );
  readonly genderOptions = computed(() => this.toNamedOptions(this.catalogs()?.genders));
  readonly hierarchyLevelOptions = computed(() =>
    this.toNamedOptions(this.catalogs()?.hierarchyLevels)
  );
  readonly careerTypeOptions = computed(() =>
    this.toNamedOptions(this.catalogs()?.administrativeCareerTypes)
  );
  readonly appointmentTypeOptions = computed(() =>
    this.toNamedOptions(this.catalogs()?.staffAppointmentTypes)
  );
  readonly workplaceLocationOptions = computed(() =>
    this.toNamedOptions(this.catalogs()?.workplaceLocations)
  );

  private toNamedOptions(
    items?: readonly { id: number; name: string }[]
  ): SearchableSelectOption<number>[] {
    return (items ?? []).map((item) => ({ value: item.id, label: item.name }));
  }

  readonly canWrite = computed(() =>
    this.v3Auth.hasPermission('admin.staff.write'),
  );

  get gridTheme(): 'dark' | 'glacial' {
    return this.themeService.isDark() ? 'dark' : 'glacial';
  }

  get staffRows(): AdministrativeStaffRecord[] {
    return (this.staffGrid?.rows as AdministrativeStaffRecord[] | undefined) ?? [];
  }

  readonly columns: ColumnContract[] = [
    { text: '#', width: '48px', align: 'center', sortable: false },
    { text: 'Documento', dataIndex: 'documentNumber' },
    { text: 'Funcionario', dataIndex: 'fullName' },
    { text: 'Correo', dataIndex: 'email' },
    { text: 'Teléfono', dataIndex: 'phone' },
    { text: 'Nivel jerárquico', dataIndex: 'hierarchyLevelName' },
    { text: 'Vinculación', dataIndex: 'appointmentTypeName' },
    { text: 'Estado', dataIndex: 'isActive', align: 'center' },
    { text: 'Acciones', width: '110px', align: 'right', sortable: false },
  ];

  private readonly exportColumns: readonly ExodoExportColumn<AdministrativeStaffRecord>[] =
    [
      {
        header: 'Documento',
        value: (r) =>
          r.documentTypeCode
            ? `${r.documentTypeCode} ${r.documentNumber}`
            : r.documentNumber,
      },
      { header: 'Funcionario', value: (r) => r.fullName },
      { header: 'Correo', value: (r) => r.email ?? '' },
      { header: 'Teléfono', value: (r) => r.phone ?? '' },
      { header: 'Nivel jerárquico', value: (r) => r.hierarchyLevelName ?? '' },
      { header: 'Vinculación', value: (r) => r.appointmentTypeName ?? '' },
      { header: 'Estado', value: (r) => (r.isActive ? 'Activo' : 'Inactivo') },
    ];

  readonly staffForm: FormGroup;

  constructor() {
    this.destroyRef.onDestroy(() => {
      if (this.initLoadTimer !== null) {
        clearTimeout(this.initLoadTimer);
        this.initLoadTimer = null;
      }
    });
    this.staffForm = this.fb.group({
      documentTypeId: [1],
      documentNumber: ['', [Validators.required, Validators.maxLength(30)]],
      firstName: ['', [Validators.required, Validators.maxLength(80)]],
      middleName: [''],
      lastName: ['', [Validators.required, Validators.maxLength(80)]],
      secondLastName: [''],
      genderId: [null],
      birthDate: [''],
      phone: [''],
      email: ['', [Validators.email]],
      hierarchyLevelId: [null],
      careerTypeId: [null],
      appointmentTypeId: [null],
      workplaceLocationId: [null],
      isActive: [true],
    });
  }

  ngOnInit(): void {
    this.catalogsService.getGlobalBundle().subscribe((b) => this.catalogs.set(b));
  }

  ngAfterViewInit(): void {
    this.staffGrid?.onLoad({ paginated: '1' }, false);
    if (this.isBrowser) {
      this.initLoadTimer = setTimeout(() => {
        this.initLoadTimer = null;
        this.staffGrid?.onLoad({ paginated: '1' }, true);
      });
    }
  }

  loadStaff(): void {
    this.staffGrid?.rebuildGrid();
  }

  exportCurrentPage(): void {
    exportGridRowsToExcel(
      this.staffRows,
      this.exportColumns,
      'personal-administrativo',
    );
  }

  onGridLoadError(): void {
    this.messages.showError(
      'No fue posible cargar el listado de personal administrativo.',
    );
  }

  openCreateModal(): void {
    this.editingStaff.set(null);
    this.wizardStep.set(0);
    this.staffForm.reset({
      documentTypeId: 1,
      documentNumber: '',
      firstName: '',
      middleName: '',
      lastName: '',
      secondLastName: '',
      genderId: null,
      birthDate: '',
      phone: '',
      email: '',
      hierarchyLevelId: null,
      careerTypeId: null,
      appointmentTypeId: null,
      workplaceLocationId: null,
      isActive: true,
    });
    this.formModalOpen.set(true);
  }

  openEditModal(staff: AdministrativeStaffRecord): void {
    this.editingStaff.set(staff);
    this.wizardStep.set(0);
    this.staffForm.patchValue({
      documentTypeId: staff.documentTypeId ?? 1,
      documentNumber: staff.documentNumber,
      firstName: staff.firstName,
      middleName: staff.middleName ?? '',
      lastName: staff.lastName,
      secondLastName: staff.secondLastName ?? '',
      genderId: staff.genderId,
      birthDate: staff.birthDate ?? '',
      phone: staff.phone ?? '',
      email: staff.email ?? '',
      hierarchyLevelId: staff.hierarchyLevelId,
      careerTypeId: staff.careerTypeId,
      appointmentTypeId: staff.appointmentTypeId,
      workplaceLocationId: staff.workplaceLocationId,
      isActive: staff.isActive,
    });
    this.formModalOpen.set(true);
  }

  onStaffStepNext(stepIndex: number): void {
    if (stepIndex === 0) {
      const requiredControls = ['documentNumber', 'firstName', 'lastName'];
      let hasInvalid = false;
      for (const name of requiredControls) {
        const ctrl = this.staffForm.get(name);
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
      const emailCtrl = this.staffForm.get('email');
      if (emailCtrl?.invalid) {
        emailCtrl.markAsTouched();
        return;
      }
      this.wizardStep.set(2);
    }
  }

  onStaffFormSubmit(): void {
    if (this.wizardStep() < 2 && !this.editingStaff()) {
      this.onStaffStepNext(this.wizardStep());
      return;
    }
    this.saveStaff();
  }

  saveStaff(): void {
    if (this.staffForm.invalid) {
      markAllAsTouched(this.staffForm);
      return;
    }

    const raw = this.staffForm.getRawValue();
    const payload = {
      documentTypeId: raw.documentTypeId || 1,
      documentNumber: raw.documentNumber,
      firstName: raw.firstName,
      middleName: raw.middleName || null,
      lastName: raw.lastName,
      secondLastName: raw.secondLastName || null,
      genderId: raw.genderId || null,
      birthDate: raw.birthDate || null,
      phone: raw.phone || null,
      email: raw.email || null,
      hierarchyLevelId: raw.hierarchyLevelId || null,
      careerTypeId: raw.careerTypeId || null,
      appointmentTypeId: raw.appointmentTypeId || null,
      workplaceLocationId: raw.workplaceLocationId || null,
      isActive: Boolean(raw.isActive),
    };

    const editing = this.editingStaff();
    this.maskService.show('messages.saving');
    const request$ = editing
      ? this.adminService.updateAdministrativeStaff(editing.id, payload)
      : this.adminService.createAdministrativeStaff(payload);

    request$.pipe(finalize(() => this.maskService.hide())).subscribe({
      next: () => {
        this.messages.showSuccess(
          editing
            ? 'Funcionario actualizado correctamente.'
            : 'Funcionario registrado correctamente.',
        );
        this.formModalOpen.set(false);
        this.loadStaff();
      },
    });
  }

  confirmDeleteStaff(staff: AdministrativeStaffRecord): void {
    void this.messages
      .confirmDelete(`¿Deseas eliminar al funcionario "${staff.fullName}"?`)
      .then((res) => {
        if (res.isConfirmed) {
          this.maskService.show('messages.processing');
          this.adminService
            .deleteAdministrativeStaff(staff.id)
            .pipe(finalize(() => this.maskService.hide()))
            .subscribe({
              next: () => {
                this.messages.showSuccess('Funcionario eliminado correctamente.');
                this.loadStaff();
              },
            });
        }
      });
  }
}
