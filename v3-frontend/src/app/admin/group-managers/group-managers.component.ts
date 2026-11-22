import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  OnInit,
  PLATFORM_ID,
  signal,
  untracked,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
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
import { V3AcademicService } from '../../services/v3-academic.service';
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
import { V3ModalDialogComponent } from '../../shared/components/v3-modal-dialog/v3-modal-dialog.component';
import {
  SearchableSelectOption,
  V3SearchableSelectComponent,
} from '../../shared/components/v3-searchable-select/v3-searchable-select.component';
import { CustomTooltipDirective } from '../../shared/directives/custom-tooltip.directive';
import {
  ExodoExportColumn,
  exportGridRowsToExcel,
} from '../../shared/utils/exodo-grid-export.util';
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
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    ExodolibsModule,
    V3ModalDialogComponent,
    V3SearchableSelectComponent,
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
            <a routerLink="/dashboard" class="d-inline-block position-relative">
              <i class="material-symbols-outlined">home</i>
              Inicio
            </a>
          </li>
          <li class="breadcrumb-item d-inline-block position-relative">
            <a routerLink="/admin" class="d-inline-block position-relative">Administrativo</a>
          </li>
          <li class="breadcrumb-item d-inline-block position-relative">Directores de Grupo</li>
        </ol>
      </div>

      <div class="v3-admin-filter-strip">
        <div class="v3-admin-filter-group">
          <span class="v3-admin-filter-label">Vista rápida</span>
          <div class="v3-rbac-segment-bar" role="group" aria-label="Filtrar grupos por estado y asignación">
            <button
              type="button"
              class="v3-rbac-segment-pill"
              [class.is-active]="viewFilter() === 'ACTIVE'"
              (click)="setViewFilter('ACTIVE')"
            >
              <span>Activos</span>
            </button>
            <button
              type="button"
              class="v3-rbac-segment-pill"
              [class.is-active]="viewFilter() === 'UNASSIGNED'"
              (click)="setViewFilter('UNASSIGNED')"
            >
              <span>Sin director</span>
            </button>
            <button
              type="button"
              class="v3-rbac-segment-pill"
              [class.is-active]="viewFilter() === 'INACTIVE'"
              (click)="setViewFilter('INACTIVE')"
            >
              <span>Inactivos</span>
            </button>
            <button
              type="button"
              class="v3-rbac-segment-pill"
              [class.is-active]="viewFilter() === 'ALL'"
              (click)="setViewFilter('ALL')"
            >
              <span>Todos</span>
            </button>
          </div>
        </div>

        <div class="v3-admin-filter-group v3-admin-filter-select">
          <span class="v3-admin-filter-label">Sede</span>
          <div class="flex-grow-1">
            <app-v3-searchable-select
              size="sm"
              [ngModel]="selectedCampusFilterId"
              (ngModelChange)="onCampusFilterChange($event)"
              [options]="campusOptions()"
              [clearable]="true"
              placeholder="Todas las sedes..."
              searchPlaceholder="Buscar sede..."
            />
          </div>
        </div>
      </div>

      <exodo-grid
        #groupManagersGrid
        mode="remote"
        [caption]="'Directores de Grupo — Año ' + v3Auth.academicYear()"
        [columns]="columns"
        [dataSource]="dataSource"
        [proxy]="proxy"
        [customBody]="true"
        [allowSorting]="true"
        [allowFiltering]="true"
        [showPagination]="true"
        [limit]="15"
        [theme]="gridTheme"
        placeholder="Buscar grupo, grado, sede o docente..."
        (loadError)="onGridLoadError()"
      >
        <div header class="v3-exodo-toolbar">
          <button
            type="button"
            class="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1"
            (click)="downloadGroupDirectorsReport()"
            [appCustomTooltip]="'Descargar informe oficial en PDF de directores de grupo'"
          >
            <i class="material-symbols-outlined fs-6">picture_as_pdf</i>
            <span>Reporte PDF</span>
          </button>

          <button
            type="button"
            class="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
            (click)="groupManagersGrid.clearFilters()"
            [appCustomTooltip]="'Limpiar filtros y ordenamiento'"
          >
            <i class="material-symbols-outlined fs-6">filter_alt_off</i>
            <span>Limpiar</span>
          </button>

          @if (groupManagerRows.length > 0) {
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
              [appCustomTooltip]="'Asignar nuevo director de grupo'"
            >
              <i class="material-symbols-outlined fs-6">add</i>
              <span>Asignar director</span>
            </button>
          }
        </div>

        @for (group of groupManagerRows; track group.id) {
          <tr>
            <td class="text-center text-muted small">
              {{ (groupManagersGrid.dataRecords?.from || 1) + $index }}
            </td>
            <td>{{ group.campusName }}</td>
            <td>{{ group.shiftName }}</td>
            <td class="fw-medium">{{ group.gradeName }}</td>
            <td class="text-center">{{ group.groupCode }}</td>
            <td>
              @if (group.homeroomTeacherName) {
                <span class="fw-medium">{{ group.homeroomTeacherName }}</span>
              } @else {
                <span class="badge rounded-pill bg-warning-subtle text-warning-emphasis">
                  Sin director
                </span>
              }
            </td>
            <td class="text-center">{{ group.maxCapacity }}</td>
            <td class="text-center">
              <span
                class="badge rounded-pill"
                [ngClass]="
                  group.isActive
                    ? 'bg-success-subtle text-success'
                    : 'bg-secondary-subtle text-secondary'
                "
              >
                {{ group.isActive ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td class="text-end text-nowrap">
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
                  class="btn btn-sm me-1"
                  [ngClass]="group.isActive ? 'btn-outline-warning' : 'btn-outline-success'"
                  (click)="toggleActiveState(group)"
                  [appCustomTooltip]="group.isActive ? 'Inactivar grupo' : 'Reactivar grupo'"
                >
                  <i class="material-symbols-outlined fs-6">
                    {{ group.isActive ? 'block' : 'check_circle' }}
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
            </td>
          </tr>
        }
      </exodo-grid>
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
          @if (editingGroup(); as currentGroup) {
            <div class="col-12">
              <div class="v3-form-panel v3-form-panel--info d-flex align-items-start gap-2 mb-0">
                <i class="material-symbols-outlined text-primary fs-5">school</i>
                <div>
                  <div class="fw-semibold">
                    {{ currentGroup.gradeName }} · Grupo {{ currentGroup.groupCode }}
                  </div>
                  <small class="text-muted">
                    {{ currentGroup.campusName }} · Jornada {{ currentGroup.shiftName }} · Año {{ currentGroup.academicYear }}
                  </small>
                </div>
              </div>
            </div>
          } @else {
            <div class="col-12 col-md-6">
              <label class="form-label">Sede educativa *</label>
              <app-v3-searchable-select
                formControlName="campusId"
                [options]="campusOptions()"
                [clearable]="true"
                placeholder="Seleccione..."
                searchPlaceholder="Buscar sede..."
              />
            </div>
            <div class="col-12 col-md-6">
              <label class="form-label">Jornada *</label>
              <app-v3-searchable-select
                formControlName="shiftId"
                [options]="shiftOptions()"
                [clearable]="true"
                placeholder="Seleccione..."
                searchPlaceholder="Buscar jornada..."
              />
            </div>

            <div class="col-12 col-md-6">
              <label class="form-label">Grado *</label>
              <app-v3-searchable-select
                formControlName="gradeId"
                [options]="gradeOptions()"
                [clearable]="true"
                placeholder="Seleccione..."
                searchPlaceholder="Buscar grado..."
              />
            </div>
            <div class="col-12 col-md-6">
              <label class="form-label">Código de grupo *</label>
              <input type="text" class="form-control" formControlName="groupCode" placeholder="Ej. 01, A, B" />
            </div>
          }

          <div class="col-12 col-md-6">
            <label class="form-label">Cupo máximo</label>
            <input type="number" class="form-control" formControlName="maxCapacity" min="1" max="200" />
          </div>
          <div class="col-12 col-md-6">
            <label class="form-label">Docente Director de Grupo</label>
            <app-v3-searchable-select
              formControlName="homeroomTeacherId"
              [options]="homeroomTeacherOptions()"
              [clearable]="true"
              placeholder="Sin asignar"
              searchPlaceholder="Buscar docente..."
            />
          </div>

          <div class="col-12 col-md-6">
            <div class="v3-form-switch-box">
              <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" id="groupActive" formControlName="isActive" />
                <label class="form-check-label" for="groupActive">Grupo activo</label>
              </div>
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
export class GroupManagersComponent implements OnInit, AfterViewInit {
  @ViewChild('groupManagersGrid') private groupManagersGrid?: ExodoGridComponent;

  protected readonly v3Auth = inject(V3UnifiedAuthService);
  private readonly fb = inject(FormBuilder);
  private readonly academicService = inject(V3AcademicService);
  private readonly adminService = inject(V3AdministrationService);
  private readonly catalogsService = inject(V3CatalogsService);
  private readonly themeService = inject(CustomizerSettingsService);
  private readonly maskService = inject(LoadMaskService);
  private readonly messages = inject(MessagesService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private initLoadTimer: ReturnType<typeof setTimeout> | null = null;
  private viewReady = false;

  readonly dataSource: DataSourceContract = { rows: [], dataRecords: null };
  readonly proxy: Proxy = {
    api: { read: `${environment.APIURL}/admin/group-managers` },
  };
  readonly activeTeachers = signal<TeacherProfileRecord[]>([]);
  readonly schoolContext = signal<SchoolAcademicContextCatalogs | null>(null);
  readonly formModalOpen = signal(false);
  readonly editingGroup = signal<GroupManagerRecord | null>(null);
  readonly viewFilter = signal<'ACTIVE' | 'UNASSIGNED' | 'INACTIVE' | 'ALL'>('ACTIVE');
  selectedCampusFilterId: number | null = null;

  readonly campusOptions = computed(() => this.toNamedOptions(this.schoolContext()?.campuses));
  readonly shiftOptions = computed(() => this.toNamedOptions(this.schoolContext()?.shifts));
  readonly gradeOptions = computed(() => this.toNamedOptions(this.schoolContext()?.grades));
  readonly homeroomTeacherOptions = computed<SearchableSelectOption<number>[]>(() =>
    this.activeTeachers().map((teacher) => ({
      value: teacher.id,
      label: `${teacher.fullName} (${teacher.documentNumber})`,
    }))
  );

  private toNamedOptions(
    items?: readonly { id: number; name: string }[]
  ): SearchableSelectOption<number>[] {
    return (items ?? []).map((item) => ({ value: item.id, label: item.name }));
  }

  readonly canWrite = computed(() =>
    this.v3Auth.hasPermission('admin.group_managers.write'),
  );

  get gridTheme(): 'dark' | 'glacial' {
    return this.themeService.isDark() ? 'dark' : 'glacial';
  }

  get groupManagerRows(): GroupManagerRecord[] {
    return (this.groupManagersGrid?.rows as GroupManagerRecord[] | undefined) ?? [];
  }

  readonly columns: ColumnContract[] = [
    { text: '#', width: '48px', align: 'center', sortable: false },
    { text: 'Sede', dataIndex: 'campusName' },
    { text: 'Jornada', dataIndex: 'shiftName' },
    { text: 'Grado', dataIndex: 'gradeName' },
    { text: 'Grupo', dataIndex: 'groupCode', align: 'center' },
    { text: 'Director de Grupo', dataIndex: 'homeroomTeacherName' },
    { text: 'Cupo', dataIndex: 'maxCapacity', align: 'center' },
    { text: 'Estado', dataIndex: 'isActive', align: 'center' },
    { text: 'Acciones', width: '140px', align: 'right', sortable: false },
  ];

  private readonly exportColumns: readonly ExodoExportColumn<GroupManagerRecord>[] = [
    { header: 'Sede', value: (r) => r.campusName },
    { header: 'Jornada', value: (r) => r.shiftName },
    { header: 'Grado', value: (r) => r.gradeName },
    { header: 'Grupo', value: (r) => r.groupCode },
    {
      header: 'Director de Grupo',
      value: (r) => r.homeroomTeacherName || 'Sin asignar',
    },
    { header: 'Cupo', value: (r) => r.maxCapacity },
    { header: 'Estado', value: (r) => (r.isActive ? 'Activo' : 'Inactivo') },
  ];

  readonly groupForm: FormGroup;

  constructor() {
    this.destroyRef.onDestroy(() => {
      if (this.initLoadTimer !== null) {
        clearTimeout(this.initLoadTimer);
        this.initLoadTimer = null;
      }
    });

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
      if (this.viewReady && this.v3Auth.isAuthenticated() && year) {
        untracked(() => this.loadGroupManagers(year));
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

  ngAfterViewInit(): void {
    this.viewReady = true;
    const year = this.v3Auth.academicYear();
    this.groupManagersGrid?.onLoad(this.buildGridBaseParams(year), false);
    if (this.isBrowser) {
      this.initLoadTimer = setTimeout(() => {
        this.initLoadTimer = null;
        if (year) {
          this.loadGroupManagers(year);
        }
      });
    }
  }

  setViewFilter(view: 'ACTIVE' | 'UNASSIGNED' | 'INACTIVE' | 'ALL'): void {
    if (this.viewFilter() === view) {
      return;
    }
    this.viewFilter.set(view);
    this.loadGroupManagers();
  }

  onCampusFilterChange(campusId: number | null | undefined): void {
    const parsed = campusId !== null && campusId !== undefined ? Number(campusId) : null;
    this.selectedCampusFilterId =
      parsed !== null && Number.isFinite(parsed) && parsed > 0 ? parsed : null;
    this.loadGroupManagers();
  }

  loadGroupManagers(year = this.v3Auth.academicYear()): void {
    this.groupManagersGrid?.onLoad(this.buildGridBaseParams(year), true);
  }

  private buildGridBaseParams(
    year = this.v3Auth.academicYear(),
  ): Record<string, string | number> {
    const view = this.viewFilter();
    const status =
      view === 'INACTIVE' ? 'INACTIVE' : view === 'ALL' ? 'ALL' : 'ACTIVE';
    return {
      academicYear: year,
      paginated: '1',
      status,
      ...(view === 'UNASSIGNED' ? { assignmentState: 'UNASSIGNED' } : {}),
      ...(this.selectedCampusFilterId !== null && this.selectedCampusFilterId > 0
        ? { campusId: this.selectedCampusFilterId }
        : {}),
    };
  }

  exportCurrentPage(): void {
    exportGridRowsToExcel(
      this.groupManagerRows,
      this.exportColumns,
      `directores-grupo-${this.v3Auth.academicYear()}`,
    );
  }

  onGridLoadError(): void {
    this.messages.showError(
      'No fue posible cargar el listado de directores de grupo.',
    );
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
    const nextActive = !group.isActive;
    void this.messages
      .showConfirm({
        title: nextActive ? 'Reactivar grupo' : 'Inactivar grupo',
        message: nextActive
          ? `¿Deseas reactivar el grupo ${group.gradeName} - ${group.groupCode} (${group.campusName})?`
          : `¿Deseas inactivar el grupo ${group.gradeName} - ${group.groupCode} (${group.campusName})? Podrás reactivarlo luego desde la vista de inactivos.`,
      })
      .then((res) => {
        if (!res.isConfirmed) {
          return;
        }
        this.maskService.show('messages.processing');
        this.adminService
          .updateGroupManager(group.id, { isActive: nextActive })
          .pipe(finalize(() => this.maskService.hide()))
          .subscribe({
            next: () => {
              this.messages.showSuccess(
                nextActive ? 'Grupo reactivado.' : 'Grupo marcado como inactivo.',
              );
              this.loadGroupManagers();
            },
          });
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

  downloadGroupDirectorsReport(): void {
    const year = this.v3Auth.academicYear();
    this.maskService.show('messages.processing');
    this.academicService
      .downloadDirectReport({
        templateName: 'dir_grupo',
        outputFormat: 'pdf',
        parameters: {
          P_YEAR: year,
        },
      })
      .pipe(finalize(() => this.maskService.hide()))
      .subscribe({
        next: (response) => {
          this.academicService.triggerBrowserBlobDownload(
            response,
            `directores-grupo-${year}.pdf`,
          );
          this.messages.showSuccess(
            'Informe PDF de directores de grupo descargado correctamente.',
          );
        },
        error: () => {
          this.messages.showError(
            'No fue posible generar el PDF de directores de grupo.',
          );
        },
      });
  }
}
