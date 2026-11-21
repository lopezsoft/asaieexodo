import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { LoadMaskService } from '../../services/common/load-mask.service';
import { MessagesService } from '../../services/messages.service';
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
import {
  V3DataGridComponent,
  V3GridColumn,
} from '../../shared/components/v3-data-grid/v3-data-grid.component';
import { V3ModalDialogComponent } from '../../shared/components/v3-modal-dialog/v3-modal-dialog.component';
import { CustomTooltipDirective } from '../../shared/directives/custom-tooltip.directive';
import { markAllAsTouched } from '../../utils/form-validators';

/**
 * Directores de Grupo por Año Lectivo
 * (reemplaza GroupManagers.js, SaveGroupManagers.js y reporte group-directors de ExtJS).
 */
@Component({
  selector: 'app-group-managers',
  standalone: true,
  imports: [
    CommonModule,
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
          <h5 class="mb-0 fw-bold">Directores de Grupo ({{ v3Auth.academicYear() }})</h5>
          <small class="text-muted">Asignación de docentes titulares a cada curso del año lectivo</small>
        </div>
        <ol class="breadcrumb list-unstyled mt-0 mb-0 p-0">
          <li class="breadcrumb-item d-inline-block position-relative">
            <a routerLink="/admin" class="d-inline-block position-relative">Administrativo</a>
          </li>
          <li class="breadcrumb-item d-inline-block position-relative">Directores de Grupo</li>
        </ol>
      </div>

      <app-v3-data-grid
        [heading]="'Directores de Grupo — Año ' + v3Auth.academicYear()"
        subtitle="Sincronizado automáticamente con el selector de año lectivo de la barra superior"
        [columns]="columns"
        [rows]="groups()"
        [loading]="loading()"
        [exportFileName]="'directores-grupo-' + v3Auth.academicYear()"
        searchPlaceholder="Buscar por sede, grado, grupo o docente..."
        (refreshRequested)="loadGroupManagers()"
      >
        <button
          grid-toolbar
          type="button"
          class="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1"
          (click)="enqueueGroupDirectorsReport()"
          [appCustomTooltip]="'Generar reporte PDF de directores de grupo vía JasperReports'"
        >
          <i class="material-symbols-outlined fs-6">picture_as_pdf</i>
          <span>Reporte PDF</span>
        </button>

        @if (canWrite()) {
          <button
            grid-toolbar
            type="button"
            class="btn btn-sm btn-primary d-inline-flex align-items-center gap-1"
            (click)="openCreateModal()"
            [appCustomTooltip]="'Asignar nuevo director de grupo'"
          >
            <i class="material-symbols-outlined fs-6">add</i>
            <span>Asignar director</span>
          </button>
        }

        <ng-template #rowActions let-group>
          @if (canWrite()) {
            <button
              type="button"
              class="btn btn-sm btn-outline-primary me-1"
              (click)="openEditModal(group)"
              [appCustomTooltip]="'Editar director o cupo del grupo'"
            >
              <i class="material-symbols-outlined fs-6">edit</i>
            </button>
            <button
              type="button"
              class="btn btn-sm btn-outline-secondary me-1"
              (click)="toggleActiveState(group)"
              [appCustomTooltip]="group.isActive ? 'Inactivar grupo' : 'Activar grupo'"
            >
              <i class="material-symbols-outlined fs-6">
                {{ group.isActive ? 'toggle_on' : 'toggle_off' }}
              </i>
            </button>
            <button
              type="button"
              class="btn btn-sm btn-outline-danger"
              (click)="confirmDeleteGroup(group)"
              [appCustomTooltip]="'Eliminar o desvincular director de grupo'"
            >
              <i class="material-symbols-outlined fs-6">delete</i>
            </button>
          }
        </ng-template>
      </app-v3-data-grid>
    </div>

    <app-v3-modal-dialog
      [open]="formModalOpen()"
      [heading]="editingGroup() ? 'Editar Director de Grupo' : 'Asignar Director de Grupo'"
      icon="groups"
      size="lg"
      (closed)="formModalOpen.set(false)"
    >
      <form [formGroup]="groupForm" (ngSubmit)="saveGroup()">
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label">Sede educativa *</label>
            <select class="form-select" formControlName="campusId">
              <option [ngValue]="null">Seleccione...</option>
              @for (item of schoolContext()?.campuses ?? []; track item.id) {
                <option [ngValue]="item.id">{{ item.name }}</option>
              }
            </select>
          </div>
          <div class="col-md-6">
            <label class="form-label">Jornada *</label>
            <select class="form-select" formControlName="shiftId">
              <option [ngValue]="null">Seleccione...</option>
              @for (item of schoolContext()?.shifts ?? []; track item.id) {
                <option [ngValue]="item.id">{{ item.name }}</option>
              }
            </select>
          </div>

          <div class="col-md-4">
            <label class="form-label">Grado *</label>
            <select class="form-select" formControlName="gradeId">
              <option [ngValue]="null">Seleccione...</option>
              @for (item of schoolContext()?.grades ?? []; track item.id) {
                <option [ngValue]="item.id">{{ item.name }}</option>
              }
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label">Código de grupo *</label>
            <input type="text" class="form-control" formControlName="groupCode" placeholder="Ej. 01, A, B" />
          </div>
          <div class="col-md-4">
            <label class="form-label">Cupo máximo</label>
            <input type="number" class="form-control" formControlName="maxCapacity" min="1" max="200" />
          </div>

          <div class="col-md-8">
            <label class="form-label">Docente Director de Grupo</label>
            <select class="form-select" formControlName="homeroomTeacherId">
              <option [ngValue]="null">Sin asignar</option>
              @for (teacher of activeTeachers(); track teacher.id) {
                <option [ngValue]="teacher.id">
                  {{ teacher.fullName }} ({{ teacher.documentNumber }})
                </option>
              }
            </select>
          </div>
          <div class="col-md-4 d-flex align-items-end">
            <div class="form-check form-switch">
              <input class="form-check-input" type="checkbox" id="groupActive" formControlName="isActive" />
              <label class="form-check-label" for="groupActive">Grupo activo</label>
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
          [disabled]="groupForm.invalid"
          (click)="saveGroup()"
        >
          Guardar asignación
        </button>
      </div>
    </app-v3-modal-dialog>
  `,
})
export class GroupManagersComponent implements OnInit {
  protected readonly v3Auth = inject(V3UnifiedAuthService);
  private readonly fb = inject(FormBuilder);
  private readonly adminService = inject(V3AdministrationService);
  private readonly catalogsService = inject(V3CatalogsService);
  private readonly maskService = inject(LoadMaskService);
  private readonly messages = inject(MessagesService);

  readonly groups = signal<GroupManagerRecord[]>([]);
  readonly activeTeachers = signal<TeacherProfileRecord[]>([]);
  readonly schoolContext = signal<SchoolAcademicContextCatalogs | null>(null);
  readonly loading = signal(false);
  readonly formModalOpen = signal(false);
  readonly editingGroup = signal<GroupManagerRecord | null>(null);

  readonly canWrite = computed(() => {
    const role = this.v3Auth.activeRole();
    return (
      role === 'SUPER_ADMIN' ||
      role === 'SCHOOL_ADMIN' ||
      role === 'RECTOR' ||
      role === 'COORDINATOR'
    );
  });

  readonly columns: V3GridColumn<GroupManagerRecord>[] = [
    { key: 'campusName', label: 'Sede' },
    { key: 'shiftName', label: 'Jornada' },
    { key: 'gradeName', label: 'Grado' },
    { key: 'groupCode', label: 'Grupo', align: 'center' },
    {
      key: 'homeroomTeacherName',
      label: 'Director de Grupo',
      formatter: (r) => r.homeroomTeacherName || 'Sin asignar',
    },
    { key: 'maxCapacity', label: 'Cupo', align: 'center' },
    { key: 'isActive', label: 'Estado', align: 'center', badge: true },
  ];

  readonly groupForm: FormGroup;

  constructor() {
    this.groupForm = this.fb.group({
      campusId: [null, [Validators.required]],
      shiftId: [null, [Validators.required]],
      gradeId: [null, [Validators.required]],
      groupCode: ['01', [Validators.required, Validators.maxLength(10)]],
      homeroomTeacherId: [null],
      maxCapacity: [40, [Validators.required, Validators.min(1), Validators.max(200)]],
      isActive: [true],
    });

    effect(() => {
      const year = this.v3Auth.academicYear();
      if (this.v3Auth.isAuthenticated() && year) {
        this.loadGroupManagers(year);
      }
    });
  }

  ngOnInit(): void {
    this.catalogsService
      .getSchoolContext()
      .subscribe((ctx) => this.schoolContext.set(ctx));
    this.adminService
      .listTeachers({ onlyActive: true, limit: 500 })
      .subscribe((res) => this.activeTeachers.set(res.items));
  }

  loadGroupManagers(year = this.v3Auth.academicYear()): void {
    this.loading.set(true);
    this.adminService
      .listGroupManagers(year)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (rows) => this.groups.set(rows),
      });
  }

  openCreateModal(): void {
    this.editingGroup.set(null);
    this.groupForm.enable();
    this.groupForm.reset({
      campusId: this.schoolContext()?.campuses[0]?.id ?? null,
      shiftId: this.schoolContext()?.shifts[0]?.id ?? null,
      gradeId: this.schoolContext()?.grades[0]?.id ?? null,
      groupCode: '01',
      homeroomTeacherId: null,
      maxCapacity: 40,
      isActive: true,
    });
    this.formModalOpen.set(true);
  }

  openEditModal(group: GroupManagerRecord): void {
    this.editingGroup.set(group);
    this.groupForm.patchValue({
      campusId: group.campusId,
      shiftId: group.shiftId,
      gradeId: group.gradeId,
      groupCode: group.groupCode,
      homeroomTeacherId: group.homeroomTeacherId,
      maxCapacity: group.maxCapacity,
      isActive: group.isActive,
    });
    this.groupForm.get('campusId')?.disable();
    this.groupForm.get('shiftId')?.disable();
    this.groupForm.get('gradeId')?.disable();
    this.groupForm.get('groupCode')?.disable();
    this.formModalOpen.set(true);
  }

  saveGroup(): void {
    if (this.groupForm.invalid) {
      markAllAsTouched(this.groupForm);
      return;
    }

    const raw = this.groupForm.getRawValue();
    const editing = this.editingGroup();
    this.maskService.show('messages.saving');

    const request$ = editing
      ? this.adminService.updateGroupManager(editing.id, {
          homeroomTeacherId: raw.homeroomTeacherId || null,
          maxCapacity: Number(raw.maxCapacity),
          isActive: Boolean(raw.isActive),
        })
      : this.adminService.upsertGroupManager({
          campusId: Number(raw.campusId),
          shiftId: Number(raw.shiftId),
          gradeId: Number(raw.gradeId),
          groupCode: raw.groupCode,
          academicYear: this.v3Auth.academicYear(),
          homeroomTeacherId: raw.homeroomTeacherId || null,
          maxCapacity: Number(raw.maxCapacity),
          isActive: Boolean(raw.isActive),
        });

    request$.pipe(finalize(() => this.maskService.hide())).subscribe({
      next: () => {
        this.messages.showSuccess('Director de grupo guardado correctamente.');
        this.formModalOpen.set(false);
        this.loadGroupManagers();
      },
    });
  }

  toggleActiveState(group: GroupManagerRecord): void {
    this.adminService
      .updateGroupManager(group.id, { isActive: !group.isActive })
      .subscribe({
        next: () => {
          this.messages.showSuccess(
            group.isActive ? 'Grupo marcado como inactivo.' : 'Grupo reactivado.',
          );
          this.loadGroupManagers();
        },
      });
  }

  confirmDeleteGroup(group: GroupManagerRecord): void {
    void this.messages
      .confirmDelete(
        `¿Deseas eliminar el grupo ${group.gradeName} - ${group.groupCode} (${group.campusName})?`,
      )
      .then((res) => {
        if (res.isConfirmed) {
          this.maskService.show('messages.processing');
          this.adminService
            .deleteGroupManager(group.id)
            .pipe(finalize(() => this.maskService.hide()))
            .subscribe({
              next: () => {
                this.messages.showSuccess('Asignación eliminada correctamente.');
                this.loadGroupManagers();
              },
            });
        }
      });
  }

  enqueueGroupDirectorsReport(): void {
    this.maskService.show('messages.processing');
    this.adminService
      .enqueueJasperReport({
        templateName: 'dir_grupo',
        outputFormat: 'pdf',
        parameters: {
          P_YEAR: this.v3Auth.academicYear(),
        },
      })
      .pipe(finalize(() => this.maskService.hide()))
      .subscribe({
        next: (job) => {
          this.messages.showSuccess(
            `Reporte encolado en BullMQ (Job #${job.jobId}). Estará disponible en S3 al finalizar.`,
          );
        },
      });
  }
}
