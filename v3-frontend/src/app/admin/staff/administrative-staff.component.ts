import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
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
import {
  V3DataGridComponent,
  V3GridColumn,
} from '../../shared/components/v3-data-grid/v3-data-grid.component';
import { V3FileManagerModalComponent } from '../../shared/components/v3-file-manager-modal/v3-file-manager-modal.component';
import { V3ModalDialogComponent } from '../../shared/components/v3-modal-dialog/v3-modal-dialog.component';
import { CustomTooltipDirective } from '../../shared/directives/custom-tooltip.directive';
import { markAllAsTouched } from '../../utils/form-validators';

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
    V3DataGridComponent,
    V3ModalDialogComponent,
    V3FileManagerModalComponent,
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

      <app-v3-data-grid
        heading="Directorio de Personal Administrativo"
        subtitle="Control de funcionarios, nivel jerárquico, vinculación y documentos digitales"
        [columns]="columns"
        [rows]="staffList()"
        [loading]="loading()"
        exportFileName="personal-administrativo"
        searchPlaceholder="Buscar por documento, nombre o correo..."
        (refreshRequested)="loadStaff()"
      >
        <button
          grid-toolbar
          type="button"
          class="btn btn-sm btn-outline-info d-inline-flex align-items-center gap-1"
          (click)="docsModalOpen.set(true)"
          [appCustomTooltip]="'Abrir documentos administrativos en AWS S3'"
        >
          <i class="material-symbols-outlined fs-6">folder_shared</i>
          <span>Documentos S3</span>
        </button>

        @if (canWrite()) {
          <button
            grid-toolbar
            type="button"
            class="btn btn-sm btn-primary d-inline-flex align-items-center gap-1"
            (click)="openCreateModal()"
            [appCustomTooltip]="'Registrar funcionario administrativo'"
          >
            <i class="material-symbols-outlined fs-6">person_add</i>
            <span>Nuevo funcionario</span>
          </button>
        }

        <ng-template #rowActions let-staff>
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
        </ng-template>
      </app-v3-data-grid>
    </div>

    <app-v3-modal-dialog
      [open]="formModalOpen()"
      [heading]="editingStaff() ? 'Editar Funcionario' : 'Registrar Funcionario Administrativo'"
      icon="badge"
      size="lg"
      (closed)="formModalOpen.set(false)"
    >
      <form [formGroup]="staffForm" (ngSubmit)="saveStaff()">
        <div class="row g-3">
          <div class="col-md-4">
            <label class="form-label">Tipo de documento</label>
            <select class="form-select" formControlName="documentTypeId">
              @for (item of catalogs()?.documentTypes ?? []; track item.id) {
                <option [ngValue]="item.id">{{ item.code }} - {{ item.name }}</option>
              }
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label">Número de documento *</label>
            <input type="text" class="form-control" formControlName="documentNumber" />
          </div>
          <div class="col-md-4">
            <label class="form-label">Género</label>
            <select class="form-select" formControlName="genderId">
              <option [ngValue]="null">Seleccione...</option>
              @for (item of catalogs()?.genders ?? []; track item.id) {
                <option [ngValue]="item.id">{{ item.name }}</option>
              }
            </select>
          </div>

          <div class="col-md-3">
            <label class="form-label">Primer nombre *</label>
            <input type="text" class="form-control" formControlName="firstName" />
          </div>
          <div class="col-md-3">
            <label class="form-label">Segundo nombre</label>
            <input type="text" class="form-control" formControlName="middleName" />
          </div>
          <div class="col-md-3">
            <label class="form-label">Primer apellido *</label>
            <input type="text" class="form-control" formControlName="lastName" />
          </div>
          <div class="col-md-3">
            <label class="form-label">Segundo apellido</label>
            <input type="text" class="form-control" formControlName="secondLastName" />
          </div>

          <div class="col-md-4">
            <label class="form-label">Fecha de nacimiento</label>
            <input type="date" class="form-control" formControlName="birthDate" />
          </div>
          <div class="col-md-4">
            <label class="form-label">Teléfono / Celular</label>
            <input type="text" class="form-control" formControlName="phone" />
          </div>
          <div class="col-md-4">
            <label class="form-label">Correo electrónico</label>
            <input type="email" class="form-control" formControlName="email" />
          </div>

          <div class="col-md-4">
            <label class="form-label">Nivel jerárquico</label>
            <select class="form-select" formControlName="hierarchyLevelId">
              <option [ngValue]="null">Seleccione...</option>
              @for (item of catalogs()?.hierarchyLevels ?? []; track item.id) {
                <option [ngValue]="item.id">{{ item.name }}</option>
              }
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label">Carrera administrativa</label>
            <select class="form-select" formControlName="careerTypeId">
              <option [ngValue]="null">Seleccione...</option>
              @for (item of catalogs()?.administrativeCareerTypes ?? []; track item.id) {
                <option [ngValue]="item.id">{{ item.name }}</option>
              }
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label">Tipo de vinculación</label>
            <select class="form-select" formControlName="appointmentTypeId">
              <option [ngValue]="null">Seleccione...</option>
              @for (item of catalogs()?.staffAppointmentTypes ?? []; track item.id) {
                <option [ngValue]="item.id">{{ item.name }}</option>
              }
            </select>
          </div>

          <div class="col-md-6">
            <label class="form-label">Ubicación laboral</label>
            <select class="form-select" formControlName="workplaceLocationId">
              <option [ngValue]="null">Seleccione...</option>
              @for (item of catalogs()?.workplaceLocations ?? []; track item.id) {
                <option [ngValue]="item.id">{{ item.name }}</option>
              }
            </select>
          </div>
          <div class="col-md-6 d-flex align-items-end">
            <div class="form-check form-switch">
              <input class="form-check-input" type="checkbox" id="staffActive" formControlName="isActive" />
              <label class="form-check-label" for="staffActive">Funcionario activo</label>
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
          [disabled]="staffForm.invalid"
          (click)="saveStaff()"
        >
          Guardar funcionario
        </button>
      </div>
    </app-v3-modal-dialog>

    <app-v3-file-manager-modal
      [open]="docsModalOpen()"
      heading="Documentos de Personal Administrativo"
      category="ADMINISTRATIVE_DOCUMENTS"
      (closed)="docsModalOpen.set(false)"
    />
  `,
})
export class AdministrativeStaffComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly adminService = inject(V3AdministrationService);
  private readonly catalogsService = inject(V3CatalogsService);
  private readonly v3Auth = inject(V3UnifiedAuthService);
  private readonly maskService = inject(LoadMaskService);
  private readonly messages = inject(MessagesService);

  readonly staffList = signal<AdministrativeStaffRecord[]>([]);
  readonly loading = signal(false);
  readonly catalogs = signal<GlobalCatalogsBundle | null>(null);
  readonly formModalOpen = signal(false);
  readonly docsModalOpen = signal(false);
  readonly editingStaff = signal<AdministrativeStaffRecord | null>(null);

  readonly canWrite = computed(() => {
    const role = this.v3Auth.activeRole();
    return role === 'SUPER_ADMIN' || role === 'SCHOOL_ADMIN' || role === 'RECTOR';
  });

  readonly columns: V3GridColumn<AdministrativeStaffRecord>[] = [
    {
      key: 'documentNumber',
      label: 'Documento',
      formatter: (r) =>
        r.documentTypeCode ? `${r.documentTypeCode} ${r.documentNumber}` : r.documentNumber,
    },
    { key: 'fullName', label: 'Funcionario' },
    { key: 'email', label: 'Correo' },
    { key: 'phone', label: 'Teléfono' },
    { key: 'hierarchyLevelName', label: 'Nivel jerárquico' },
    { key: 'appointmentTypeName', label: 'Vinculación' },
    { key: 'isActive', label: 'Estado', align: 'center', badge: true },
  ];

  readonly staffForm: FormGroup;

  constructor() {
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
    this.loadStaff();
  }

  loadStaff(): void {
    this.loading.set(true);
    this.adminService
      .listAdministrativeStaff({ limit: 500 })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (res) => this.staffList.set(res.items),
      });
  }

  openCreateModal(): void {
    this.editingStaff.set(null);
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
