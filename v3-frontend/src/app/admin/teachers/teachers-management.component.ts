import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
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
import {
  V3DataGridComponent,
  V3GridColumn,
} from '../../shared/components/v3-data-grid/v3-data-grid.component';
import { V3FileManagerModalComponent } from '../../shared/components/v3-file-manager-modal/v3-file-manager-modal.component';
import { V3ModalDialogComponent } from '../../shared/components/v3-modal-dialog/v3-modal-dialog.component';
import { CustomTooltipDirective } from '../../shared/directives/custom-tooltip.directive';
import { markAllAsTouched } from '../../utils/form-validators';

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
    V3DataGridComponent,
    V3ModalDialogComponent,
    V3FileManagerModalComponent,
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
            <a routerLink="/admin" class="d-inline-block position-relative">Administrativo</a>
          </li>
          <li class="breadcrumb-item d-inline-block position-relative">Personal Docente</li>
        </ol>
      </div>

      <app-v3-data-grid
        heading="Directorio de Docentes"
        subtitle="Gestión de información personal, formación, escalafón y área de enseñanza"
        [columns]="columns"
        [rows]="teachers()"
        [loading]="loading()"
        exportFileName="personal-docente"
        searchPlaceholder="Buscar por documento, nombre o correo..."
        (refreshRequested)="loadTeachers()"
      >
        <button
          grid-toolbar
          type="button"
          class="btn btn-sm btn-outline-info d-inline-flex align-items-center gap-1"
          (click)="docsModalOpen.set(true)"
          [appCustomTooltip]="'Abrir documentos digitales del personal docente en S3'"
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
            [appCustomTooltip]="'Registrar nuevo docente'"
          >
            <i class="material-symbols-outlined fs-6">person_add</i>
            <span>Nuevo docente</span>
          </button>
        }

        <ng-template #rowActions let-teacher>
          @if (canWrite()) {
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
        </ng-template>
      </app-v3-data-grid>
    </div>

    <app-v3-modal-dialog
      [open]="formModalOpen()"
      [heading]="editingTeacher() ? 'Editar Docente' : 'Registrar Docente'"
      icon="school"
      size="xl"
      (closed)="formModalOpen.set(false)"
    >
      <form [formGroup]="teacherForm" (ngSubmit)="saveTeacher()">
        <div class="row g-3">
          <div class="col-md-3">
            <label class="form-label">Tipo de documento</label>
            <select class="form-select" formControlName="documentTypeId">
              @for (item of catalogs()?.documentTypes ?? []; track item.id) {
                <option [ngValue]="item.id">{{ item.code }} - {{ item.name }}</option>
              }
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Número de documento *</label>
            <input type="text" class="form-control" formControlName="documentNumber" />
          </div>
          <div class="col-md-3">
            <label class="form-label">Género</label>
            <select class="form-select" formControlName="genderId">
              <option [ngValue]="null">Seleccione...</option>
              @for (item of catalogs()?.genders ?? []; track item.id) {
                <option [ngValue]="item.id">{{ item.name }}</option>
              }
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Fecha de nacimiento</label>
            <input type="date" class="form-control" formControlName="birthDate" />
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
            <label class="form-label">Correo electrónico</label>
            <input type="email" class="form-control" formControlName="email" />
          </div>
          <div class="col-md-4">
            <label class="form-label">Teléfono / Celular</label>
            <input type="text" class="form-control" formControlName="phone" />
          </div>
          <div class="col-md-4">
            <label class="form-label">Dirección de residencia</label>
            <input type="text" class="form-control" formControlName="address" />
          </div>

          <div class="col-md-4">
            <label class="form-label">Nivel académico / Formación</label>
            <select class="form-select" formControlName="academicDegreeId">
              <option [ngValue]="null">Seleccione...</option>
              @for (item of catalogs()?.academicDegrees ?? []; track item.id) {
                <option [ngValue]="item.id">{{ item.name }}</option>
              }
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label">Escalafón docente</label>
            <select class="form-select" formControlName="payScaleId">
              <option [ngValue]="null">Seleccione...</option>
              @for (item of catalogs()?.teacherPayScales ?? []; track item.id) {
                <option [ngValue]="item.id">{{ item.name }}</option>
              }
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label">Área de enseñanza</label>
            <select class="form-select" formControlName="teachingAreaId">
              <option [ngValue]="null">Seleccione...</option>
              @for (item of catalogs()?.teachingAreas ?? []; track item.id) {
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
          <div class="col-md-4">
            <label class="form-label">Cargo docente</label>
            <select class="form-select" formControlName="positionId">
              <option [ngValue]="null">Seleccione...</option>
              @for (item of catalogs()?.staffPositions ?? []; track item.id) {
                <option [ngValue]="item.id">{{ item.name }}</option>
              }
            </select>
          </div>
          <div class="col-md-4 d-flex align-items-end">
            <div class="form-check form-switch">
              <input class="form-check-input" type="checkbox" id="teacherActive" formControlName="isActive" />
              <label class="form-check-label" for="teacherActive">Docente activo</label>
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
          [disabled]="teacherForm.invalid"
          (click)="saveTeacher()"
        >
          Guardar docente
        </button>
      </div>
    </app-v3-modal-dialog>

    <app-v3-file-manager-modal
      [open]="docsModalOpen()"
      heading="Expedientes y Documentos de Docentes"
      category="TEACHER_DOCUMENTS"
      (closed)="docsModalOpen.set(false)"
    />
  `,
})
export class TeachersManagementComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly adminService = inject(V3AdministrationService);
  private readonly catalogsService = inject(V3CatalogsService);
  private readonly v3Auth = inject(V3UnifiedAuthService);
  private readonly maskService = inject(LoadMaskService);
  private readonly messages = inject(MessagesService);

  readonly teachers = signal<TeacherProfileRecord[]>([]);
  readonly loading = signal(false);
  readonly catalogs = signal<GlobalCatalogsBundle | null>(null);
  readonly formModalOpen = signal(false);
  readonly docsModalOpen = signal(false);
  readonly editingTeacher = signal<TeacherProfileRecord | null>(null);

  readonly canWrite = computed(() => {
    const role = this.v3Auth.activeRole();
    return (
      role === 'SUPER_ADMIN' ||
      role === 'SCHOOL_ADMIN' ||
      role === 'RECTOR' ||
      role === 'COORDINATOR'
    );
  });

  readonly canDelete = computed(() => {
    const role = this.v3Auth.activeRole();
    return role === 'SUPER_ADMIN' || role === 'SCHOOL_ADMIN' || role === 'RECTOR';
  });

  readonly columns: V3GridColumn<TeacherProfileRecord>[] = [
    {
      key: 'documentNumber',
      label: 'Documento',
      formatter: (r) =>
        r.documentTypeCode ? `${r.documentTypeCode} ${r.documentNumber}` : r.documentNumber,
    },
    { key: 'fullName', label: 'Docente' },
    { key: 'email', label: 'Correo' },
    { key: 'phone', label: 'Teléfono' },
    { key: 'teachingAreaName', label: 'Área enseñanza' },
    { key: 'payScaleName', label: 'Escalafón' },
    { key: 'isActive', label: 'Estado', align: 'center', badge: true },
  ];

  readonly teacherForm: FormGroup;

  constructor() {
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
    this.loadTeachers();
  }

  loadTeachers(): void {
    this.loading.set(true);
    this.adminService
      .listTeachers({ limit: 500 })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (res) => this.teachers.set(res.items),
      });
  }

  openCreateModal(): void {
    this.editingTeacher.set(null);
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
