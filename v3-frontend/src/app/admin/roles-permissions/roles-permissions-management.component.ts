import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  PLATFORM_ID,
  signal,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  ColumnContract,
  DataSourceContract,
  ExodoGridComponent,
  ExodolibsModule,
  Proxy,
} from 'exodolibs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  finalize,
  of,
  Subject,
  switchMap,
} from 'rxjs';
import { environment } from '../../../environments/environment';
import { CustomizerSettingsService } from '../../customizer-settings/customizer-settings.service';
import { MessagesService } from '../../services/messages.service';
import {
  PermissionCatalogItem,
  RbacMembershipAudience,
  RbacMembershipsSummary,
  RolePermissionMatrixItem,
  RolesMatrixPayload,
  SchoolUserMembershipItem,
  UserPermissionOverrideItem,
  V3RbacService,
} from '../../services/v3-rbac.service';
import {
  COMMUNITY_ROLE_LABELS,
  CommunityRole,
  V3UnifiedAuthService,
} from '../../services/v3-unified-auth.service';
import { V3ModalDialogComponent } from '../../shared/components/v3-modal-dialog/v3-modal-dialog.component';
import {
  SearchableSelectOption,
  V3SearchableSelectComponent,
} from '../../shared/components/v3-searchable-select/v3-searchable-select.component';
import { RBAC_PERMISSIONS } from '../../shared/constants/rbac-permissions.constants';
import {
  resolveHumanPermissionDescription,
  resolveHumanPermissionName,
} from '../../shared/constants/rbac-human-copy.constants';
import { CustomTooltipDirective } from '../../shared/directives/custom-tooltip.directive';
import {
  ExodoExportColumn,
  exportGridRowsToExcel,
} from '../../shared/utils/exodo-grid-export.util';

type ActiveRbacTab = 'memberships' | 'matrix' | 'overrides';
type MatrixFilterMode = 'ALL' | 'CUSTOM' | 'SENSITIVE';
type OverridesFilterMode = 'ALL' | 'CUSTOM' | 'SENSITIVE';

interface ModuleNavSummary {
  readonly groupKey: string;
  readonly label: string;
  readonly icon: string;
  readonly total: number;
  readonly activeCount: number;
  readonly customizedCount: number;
  readonly pendingCount: number;
}

interface MatrixRowView {
  readonly catalog: PermissionCatalogItem;
  readonly entry: RolePermissionMatrixItem;
  readonly pendingEffect: 'ALLOW' | 'DENY' | 'DEFAULT' | null;
  readonly currentSelection: 'ALLOW' | 'DENY' | 'DEFAULT';
}

interface OverrideRowView {
  readonly catalog: PermissionCatalogItem;
  readonly entry: UserPermissionOverrideItem;
  readonly pendingEffect: 'ALLOW' | 'DENY' | 'INHERIT' | null;
  readonly currentSelection: 'ALLOW' | 'DENY' | 'INHERIT';
}

const DIRECTIVE_ROLE_ORDER: readonly CommunityRole[] = [
  'RECTOR',
  'SECRETARY',
  'COORDINATOR',
  'SCHOOL_ADMIN',
];

const SECONDARY_ROLE_ORDER: readonly CommunityRole[] = [
  'TEACHER',
  'MONITOR',
  'STUDENT',
  'FAMILY',
];

const ROLE_DESCRIPTIONS: Readonly<Record<CommunityRole, string>> = {
  SUPER_ADMIN: 'Control total multi-colegio y catálogo maestro.',
  SCHOOL_ADMIN: 'Configuración institucional, planta y accesos globales.',
  RECTOR: 'Gobierno institucional, actas, certificados, notas rectorales y cierre.',
  SECRETARY: 'Matrículas SIMAT, folios, transferencias de notas y certificados.',
  COORDINATOR: 'Supervisión docente, observador estudiantil y comisiones de evaluación.',
  TEACHER: 'Planillas de notas, observador, parcelador y reportes propios.',
  MONITOR: 'Apoyo de seguimiento académico y registro delegado.',
  STUDENT: 'Consulta académica, boletines y votaciones escolares.',
  FAMILY: 'Seguimiento familiar de calificaciones, citaciones y boletines.',
};

const MODULE_GROUP_LABELS: Readonly<Record<string, string>> = {
  DASHBOARD: 'Panel Principal y Vigencia',
  ADMIN: 'Administración Institucional',
  IAM: 'Usuarios, Roles y Accesos',
  SETTINGS: 'Configuraciones y Sistema de Evaluación (SIEE)',
  ACADEMIC: 'Gestión Académica, Currículo y Matrículas',
  PROMOTION: 'Promoción, Libro Final y Cierre de Año',
  ELECTIONS: 'Gobierno Escolar y Elecciones',
  REPORTS: 'Centro de Reportes y Certificados',
  PORTAL: 'Portales Docente y Estudiantil',
  STORAGE: 'Archivos y Almacenamiento Institucional',
  CRM: 'Comunicaciones, Circulares y Solicitudes',
};

const MODULE_GROUP_ICONS: Readonly<Record<string, string>> = {
  DASHBOARD: 'dashboard',
  ADMIN: 'apartment',
  IAM: 'admin_panel_settings',
  SETTINGS: 'tune',
  ACADEMIC: 'school',
  PROMOTION: 'workspace_premium',
  ELECTIONS: 'how_to_vote',
  REPORTS: 'description',
  PORTAL: 'cast_for_education',
  STORAGE: 'folder_managed',
  CRM: 'campaign',
};

/**
 * Consola institucional Directivo-First de Usuarios, Roles y Matriz RBAC Granular (Decreto 1290 / MEN).
 * Diseñada con paginación remota en servidor y búsqueda asíncrona para colegios de 3.000+ usuarios.
 */
@Component({
  selector: 'app-roles-permissions-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
          <h5 class="mb-0 fw-bold">Usuarios, Roles y Permisos</h5>
          <small class="text-muted">
            {{ v3Auth.activeSchoolName() }} · Gestión del equipo directivo, permisos por cargo y accesos personalizados
          </small>
        </div>
        <ol class="breadcrumb list-unstyled mt-0 mb-0 p-0">
          <li class="breadcrumb-item d-inline-block position-relative">
            <a routerLink="/dashboard" class="d-inline-block position-relative">
              <i class="material-symbols-outlined">home</i>
              Inicio
            </a>
          </li>
          <li class="breadcrumb-item d-inline-block position-relative">
            <a routerLink="/admin" class="d-inline-block position-relative">
              Administrativo
            </a>
          </li>
          <li class="breadcrumb-item d-inline-block position-relative">
            Roles y Permisos
          </li>
        </ol>
      </div>

      <!-- Barra de pestañas y jerarquía de permisos -->
      <div class="v3-rbac-nav-bar mb-4">
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <ul class="nav nav-pills">
            @if (canViewMemberships()) {
              <li class="nav-item">
                <button
                  type="button"
                  class="nav-link d-inline-flex align-items-center gap-2"
                  [class.active]="activeTab() === 'memberships'"
                  (click)="switchTab('memberships')"
                  [appCustomTooltip]="'Prioriza equipo directivo (Rectoría, Secretaría, Coordinación) y segmenta la comunidad'"
                >
                  <i class="material-symbols-outlined fs-6">manage_accounts</i>
                  <span>Equipo y Accesos</span>
                  @if (summary(); as s) {
                    <span class="badge bg-light text-dark ms-1">
                      {{ s.directivesTotal }} directivos
                    </span>
                  }
                </button>
              </li>
            }
            @if (canManageRbac()) {
              <li class="nav-item">
                <button
                  type="button"
                  class="nav-link d-inline-flex align-items-center gap-2"
                  [class.active]="activeTab() === 'matrix'"
                  (click)="switchTab('matrix')"
                  [appCustomTooltip]="'Personalizar permisos de cada cargo módulo por módulo'"
                >
                  <i class="material-symbols-outlined fs-6">admin_panel_settings</i>
                  <span>Permisos por Rol</span>
                </button>
              </li>
              <li class="nav-item">
                <button
                  type="button"
                  class="nav-link d-inline-flex align-items-center gap-2"
                  [class.active]="activeTab() === 'overrides'"
                  (click)="switchTab('overrides')"
                  [appCustomTooltip]="'Autorizar o restringir permisos a un funcionario específico sin alterar su cargo'"
                >
                  <i class="material-symbols-outlined fs-6">tune</i>
                  <span>Excepciones por Usuario</span>
                  @if (summary()?.withOverridesTotal) {
                    <span class="badge bg-warning-subtle text-warning-emphasis ms-1">
                      {{ summary()?.withOverridesTotal }}
                    </span>
                  }
                </button>
              </li>
            }
          </ul>

          <div class="d-flex align-items-center gap-2 small text-muted">
            <i class="material-symbols-outlined fs-6 text-primary">verified_user</i>
            <span>Prioridad: Base MEN → Rol del colegio → Ajuste individual</span>
          </div>
        </div>
      </div>

      <!-- TAB 1: EQUIPO DIRECTIVO Y SEGMENTACIÓN DE COMUNIDAD -->
      @if (activeTab() === 'memberships') {
        <!-- Tarjetas Ejecutivas Directivo-First -->
        <div class="row g-3 mb-3">
          <div class="col-12 col-sm-6 col-xl-3">
            <button
              type="button"
              class="v3-rbac-role-card"
              [class.is-active]="
                activeAudience() === 'DIRECTIVES' && !activeRoleFilter()
              "
              (click)="selectAudience('DIRECTIVES')"
              [appCustomTooltip]="'Ver todo el equipo directivo y administrativo del sistema'"
            >
              <div class="v3-rbac-role-card-top">
                <span class="v3-kpi-icon v3-kpi-icon--sm kpi-primary">
                  <i class="material-symbols-outlined fs-5">shield_person</i>
                </span>
                <span class="v3-rbac-role-count">
                  {{ summary()?.directivesTotal ?? 0 }}
                </span>
              </div>
              <div>
                <div class="v3-rbac-role-title">Equipo Directivo</div>
                <div class="v3-rbac-role-hint">
                  Rectoría, Secretaría Académica y Coordinación
                </div>
              </div>
            </button>
          </div>

          <div class="col-12 col-sm-6 col-xl-3">
            <button
              type="button"
              class="v3-rbac-role-card"
              [class.is-active]="activeRoleFilter() === 'RECTOR'"
              (click)="selectDirectiveRole('RECTOR')"
              [appCustomTooltip]="'Filtrar exclusivamente usuarios con rol Rectoría / Dirección'"
            >
              <div class="v3-rbac-role-card-top">
                <span class="v3-kpi-icon v3-kpi-icon--sm kpi-purple">
                  <i class="material-symbols-outlined fs-5">workspace_premium</i>
                </span>
                <span class="v3-rbac-role-count">
                  {{ summary()?.byRole?.RECTOR ?? 0 }}
                </span>
              </div>
              <div>
                <div class="v3-rbac-role-title">Rectoría / Dirección</div>
                <div class="v3-rbac-role-hint">
                  Gobierno escolar, cierre anual y firma institucional
                </div>
              </div>
            </button>
          </div>

          <div class="col-12 col-sm-6 col-xl-3">
            <button
              type="button"
              class="v3-rbac-role-card"
              [class.is-active]="activeRoleFilter() === 'SECRETARY'"
              (click)="selectDirectiveRole('SECRETARY')"
              [appCustomTooltip]="'Filtrar exclusivamente personal con rol Secretaría Académica'"
            >
              <div class="v3-rbac-role-card-top">
                <span class="v3-kpi-icon v3-kpi-icon--sm kpi-info">
                  <i class="material-symbols-outlined fs-5">badge</i>
                </span>
                <span class="v3-rbac-role-count">
                  {{ summary()?.byRole?.SECRETARY ?? 0 }}
                </span>
              </div>
              <div>
                <div class="v3-rbac-role-title">Secretaría Académica</div>
                <div class="v3-rbac-role-hint">
                  Matrículas, folios, constancias y certificados
                </div>
              </div>
            </button>
          </div>

          <div class="col-12 col-sm-6 col-xl-3">
            <button
              type="button"
              class="v3-rbac-role-card"
              [class.is-active]="activeRoleFilter() === 'COORDINATOR'"
              (click)="selectDirectiveRole('COORDINATOR')"
              [appCustomTooltip]="'Filtrar exclusivamente Coordinadores Académicos y de Convivencia'"
            >
              <div class="v3-rbac-role-card-top">
                <span class="v3-kpi-icon v3-kpi-icon--sm kpi-success">
                  <i class="material-symbols-outlined fs-5">supervisor_account</i>
                </span>
                <span class="v3-rbac-role-count">
                  {{ summary()?.byRole?.COORDINATOR ?? 0 }}
                </span>
              </div>
              <div>
                <div class="v3-rbac-role-title">Coordinadores</div>
                <div class="v3-rbac-role-hint">
                  Supervisión docente, observador y comisiones
                </div>
              </div>
            </button>
          </div>
        </div>

        <!-- Franja de segmentación ágil por audiencia -->
        <div class="v3-rbac-segment-bar mb-3">
          <button
            type="button"
            class="v3-rbac-segment-pill"
            [class.is-active]="
              activeAudience() === 'DIRECTIVES' && !activeRoleFilter()
            "
            (click)="selectAudience('DIRECTIVES')"
          >
            <i class="material-symbols-outlined">shield_person</i>
            <span>Equipo Directivo</span>
            <span class="v3-rbac-segment-count">
              {{ summary()?.directivesTotal ?? 0 }}
            </span>
          </button>

          <button
            type="button"
            class="v3-rbac-segment-pill"
            [class.is-active]="activeAudience() === 'TEACHERS'"
            (click)="selectAudience('TEACHERS')"
          >
            <i class="material-symbols-outlined">cast_for_education</i>
            <span>Docentes</span>
            <span class="v3-rbac-segment-count">
              {{ summary()?.teachersTotal ?? 0 }}
            </span>
          </button>

          <button
            type="button"
            class="v3-rbac-segment-pill"
            [class.is-active]="activeAudience() === 'STUDENTS'"
            (click)="selectAudience('STUDENTS')"
          >
            <i class="material-symbols-outlined">school</i>
            <span>Estudiantes</span>
            <span class="v3-rbac-segment-count">
              {{ summary()?.studentsTotal ?? 0 }}
            </span>
          </button>

          <button
            type="button"
            class="v3-rbac-segment-pill"
            [class.is-active]="activeAudience() === 'FAMILIES'"
            (click)="selectAudience('FAMILIES')"
          >
            <i class="material-symbols-outlined">family_restroom</i>
            <span>Acudientes y Monitores</span>
            <span class="v3-rbac-segment-count">
              {{ summary()?.familiesTotal ?? 0 }}
            </span>
          </button>

          <button
            type="button"
            class="v3-rbac-segment-pill"
            [class.is-active]="activeAudience() === 'EXCEPTIONS'"
            (click)="selectAudience('EXCEPTIONS')"
          >
            <i class="material-symbols-outlined">tune</i>
            <span>Con excepciones</span>
            <span class="v3-rbac-segment-count">
              {{ summary()?.withOverridesTotal ?? 0 }}
            </span>
          </button>

          <button
            type="button"
            class="v3-rbac-segment-pill"
            [class.is-active]="activeAudience() === 'ALL'"
            (click)="selectAudience('ALL')"
          >
            <i class="material-symbols-outlined">groups</i>
            <span>Toda la comunidad</span>
            <span class="v3-rbac-segment-count">
              {{ summary()?.totalUsers ?? 0 }}
            </span>
          </button>
        </div>

        <!-- DataGrid remoto paginado de alto volumen -->
        <exodo-grid
          #membershipsGrid
          mode="remote"
          [caption]="gridCaption()"
          [columns]="columns"
          [dataSource]="dataSource"
          [proxy]="proxy"
          [customBody]="true"
          [allowSorting]="true"
          [allowFiltering]="true"
          [showPagination]="true"
          [limit]="15"
          [theme]="gridTheme"
          placeholder="Buscar por nombre, documento, usuario o correo..."
          (loadError)="onGridLoadError()"
        >
          <div header class="v3-exodo-toolbar">
            <button
              type="button"
              class="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
              (click)="clearGridFilters()"
              [appCustomTooltip]="'Restablecer filtros y mostrar Equipo Directivo'"
            >
              <i class="material-symbols-outlined fs-6">filter_alt_off</i>
              <span>Limpiar</span>
            </button>

            @if (membershipRows.length > 0) {
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

            @if (canManageMemberships()) {
              <button
                type="button"
                class="btn btn-sm btn-primary d-inline-flex align-items-center gap-1"
                (click)="openAssignRoleModal()"
                [appCustomTooltip]="'Buscar usuario y asignar rol directivo o institucional'"
              >
                <i class="material-symbols-outlined fs-6">person_add</i>
                <span>Asignar rol</span>
              </button>
            }
          </div>

          @for (u of membershipRows; track u.userId) {
            <tr>
              <td class="text-center text-muted small">
                {{ (membershipsGrid.dataRecords?.from || 1) + $index }}
              </td>
              <td>
                <div class="fw-semibold">{{ u.fullName }}</div>
                <small class="text-muted">{{ formatUserIdentityLine(u) }}</small>
              </td>
              <td class="small text-nowrap">{{ u.documentNumber || '—' }}</td>
              <td>
                <div class="d-flex flex-wrap gap-2">
                  @for (m of u.memberships; track m.membershipId) {
                    <span
                      class="v3-rbac-role-badge"
                      [ngClass]="roleBadgeClass(m.role, m.isActive)"
                    >
                      <span>{{ roleLabel(m.role) }}</span>
                      @if (!m.isActive) {
                        <span class="small">(Suspendido)</span>
                      }
                      @if (canManageMemberships() && m.role !== 'SUPER_ADMIN') {
                        <button
                          type="button"
                          class="v3-rbac-chip-action"
                          (click)="toggleMembership(m.membershipId, !m.isActive)"
                          [appCustomTooltip]="
                            m.isActive
                              ? 'Suspender rol y revocar sesiones activas'
                              : 'Reactivar rol en el colegio'
                          "
                        >
                          <i class="material-symbols-outlined">
                            {{ m.isActive ? 'pause_circle' : 'play_circle' }}
                          </i>
                        </button>
                        <button
                          type="button"
                          class="v3-rbac-chip-action is-danger"
                          (click)="removeMembership(m.membershipId, u.fullName, m.role)"
                          [appCustomTooltip]="'Retirar este rol al usuario'"
                        >
                          <i class="material-symbols-outlined">close</i>
                        </button>
                      }
                    </span>
                  }
                </div>
              </td>
              <td class="text-center">
                @if (u.overridesCount > 0) {
                  <span class="badge bg-warning-subtle text-warning-emphasis border">
                    {{ u.overridesCount }} activa(s)
                  </span>
                } @else {
                  <span class="text-muted small">Por rol</span>
                }
              </td>
              <td class="text-end text-nowrap">
                @if (canManageMemberships()) {
                  <button
                    type="button"
                    class="btn btn-sm btn-outline-secondary me-1"
                    (click)="openAssignRoleModal(u)"
                    [appCustomTooltip]="'Asignar otro rol a este usuario'"
                  >
                    <i class="material-symbols-outlined fs-6">person_add</i>
                  </button>
                }
                @if (canManageRbac() && getEditableRoleForUser(u)) {
                  <button
                    type="button"
                    class="btn btn-sm btn-outline-primary"
                    (click)="openUserOverrides(u)"
                    [appCustomTooltip]="'Configurar excepciones puntuales para este usuario'"
                  >
                    <i class="material-symbols-outlined fs-6 align-middle me-1">tune</i>
                    Excepciones
                  </button>
                }
              </td>
            </tr>
          }
        </exodo-grid>
      }

      <!-- TAB 2: MATRIZ DE PERMISOS POR ROL (MASTER-DETAIL POR MÓDULO) -->
      @if (activeTab() === 'matrix' && canManageRbac()) {
        <div class="trezo-card p-4">
          <!-- Roles directivos prioritarios -->
          <div class="mb-3">
            <div class="small fw-semibold text-muted text-uppercase mb-2">
              Roles Directivos y de Gestión Principal
            </div>
            <div class="row g-2">
              @for (r of directiveMatrixRoles(); track r) {
                <div class="col-12 col-sm-6 col-xl-3">
                  <button
                    type="button"
                    class="v3-rbac-role-card"
                    [class.is-active]="selectedMatrixRole() === r"
                    (click)="selectMatrixRole(r)"
                    [appCustomTooltip]="'Editar matriz de permisos para ' + roleLabel(r)"
                  >
                    <div class="d-flex align-items-center justify-content-between gap-2">
                      <span class="fw-bold small">{{ roleLabel(r) }}</span>
                      @if (matrixRoleStats()[r]; as st) {
                        <span class="badge bg-primary-subtle text-primary">
                          {{ st.effectiveCount }} activos
                        </span>
                      }
                    </div>
                    <div class="v3-rbac-role-hint">{{ roleHint(r) }}</div>
                    @if ((matrixRoleStats()[r]?.customizedCount ?? 0) > 0) {
                      <div class="small text-warning-emphasis fw-semibold">
                        {{ matrixRoleStats()[r]?.customizedCount }} personalizado(s)
                      </div>
                    }
                  </button>
                </div>
              }
            </div>
          </div>

          <!-- Roles operativos y comunidad -->
          @if (secondaryMatrixRoles().length > 0) {
            <div class="d-flex flex-wrap align-items-center gap-2 pb-3 mb-3 border-bottom">
              <span class="small fw-semibold text-muted me-1">
                Otros roles de comunidad:
              </span>
              @for (r of secondaryMatrixRoles(); track r) {
                <button
                  type="button"
                  class="v3-rbac-segment-pill"
                  [class.is-active]="selectedMatrixRole() === r"
                  (click)="selectMatrixRole(r)"
                  [appCustomTooltip]="'Editar permisos del rol ' + roleLabel(r)"
                >
                  <span>{{ roleLabel(r) }}</span>
                  @if (matrixRoleStats()[r]; as st) {
                    <span class="v3-rbac-segment-count">{{ st.effectiveCount }}</span>
                  }
                </button>
              }
            </div>
          }

          <!-- Barra de búsqueda, filtro rápido y guardado -->
          <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
            <div class="d-flex flex-wrap align-items-center gap-2 flex-grow-1">
              <div class="v3-input-wrap" style="min-width: 250px; flex: 1 1 260px; max-width: 360px">
                <span class="material-symbols-outlined v3-input-icon" aria-hidden="true">
                  search
                </span>
                <input
                  type="text"
                  class="form-control form-control-sm"
                  [ngModel]="matrixSearch()"
                  (ngModelChange)="matrixSearch.set($event)"
                  placeholder="Buscar permiso o acción en todos los módulos..."
                />
              </div>

              <div class="v3-rbac-segment-bar">
                <button
                  type="button"
                  class="v3-rbac-segment-pill"
                  [class.is-active]="matrixFilter() === 'ALL'"
                  (click)="matrixFilter.set('ALL')"
                >
                  <span>Por módulo</span>
                </button>
                <button
                  type="button"
                  class="v3-rbac-segment-pill"
                  [class.is-active]="matrixFilter() === 'CUSTOM'"
                  (click)="matrixFilter.set('CUSTOM')"
                >
                  <span>Personalizados</span>
                  <span class="v3-rbac-segment-count">
                    {{ matrixFilterCounts().custom }}
                  </span>
                </button>
                <button
                  type="button"
                  class="v3-rbac-segment-pill"
                  [class.is-active]="matrixFilter() === 'SENSITIVE'"
                  (click)="matrixFilter.set('SENSITIVE')"
                >
                  <span>Sensibles</span>
                  <span class="v3-rbac-segment-count">
                    {{ matrixFilterCounts().sensitive }}
                  </span>
                </button>
              </div>
            </div>

            <div class="d-flex flex-wrap align-items-center gap-2">
              <button
                type="button"
                class="btn btn-sm btn-outline-warning"
                [disabled]="savingMatrix()"
                (click)="resetSelectedRoleToDefaults()"
                [appCustomTooltip]="'Vuelve a la configuración estándar recomendada del Ministerio de Educación'"
              >
                <i class="material-symbols-outlined fs-6 align-middle me-1">
                  restart_alt
                </i>
                Restablecer valores base
              </button>
              <button
                type="button"
                class="btn btn-sm btn-primary"
                [disabled]="savingMatrix() || pendingRoleChangesCount() === 0"
                (click)="saveMatrixChanges()"
                [appCustomTooltip]="'Guardar personalizaciones pendientes para el cargo activo'"
              >
                <i class="material-symbols-outlined fs-6 align-middle me-1">save</i>
                {{
                  savingMatrix()
                    ? 'Guardando...'
                    : 'Guardar cambios (' + pendingRoleChangesCount() + ')'
                }}
              </button>
            </div>
          </div>

          @if (loadingMatrix()) {
            <div class="text-center py-5 text-muted">
              <div class="spinner-border spinner-border-sm text-primary"></div>
              <span class="ms-2">Cargando permisos del cargo...</span>
            </div>
          } @else if (matrixGlobalFilterActive()) {
            <!-- Vista consolidada cuando hay búsqueda o filtro transversal -->
            <div class="d-flex align-items-center justify-content-between mb-3">
              <small class="text-muted">
                Mostrando coincidencias en todos los módulos para
                <strong>{{ roleLabel(selectedMatrixRole()) }}</strong>
              </small>
              <button
                type="button"
                class="btn btn-sm btn-outline-secondary"
                (click)="clearMatrixFilters()"
              >
                Volver a vista por módulo
              </button>
            </div>

            @for (group of filteredMatrixGroups(); track group.groupKey) {
              <div class="v3-rbac-perm-card mb-3">
                <div class="v3-rbac-perm-card-header">
                  <strong class="small text-uppercase d-flex align-items-center gap-2">
                    <i class="material-symbols-outlined fs-6 text-primary">
                      {{ moduleIcon(group.groupKey) }}
                    </i>
                    {{ groupLabel(group.groupKey) }}
                  </strong>
                  <span class="badge bg-secondary-subtle text-secondary">
                    {{ group.rows.length }} permiso(s)
                  </span>
                </div>
                @for (row of group.rows; track row.catalog.code) {
                  <ng-container
                    *ngTemplateOutlet="matrixRowTpl; context: { $implicit: row }"
                  />
                }
              </div>
            } @empty {
              <div class="text-center py-5 text-muted border rounded">
                <i class="material-symbols-outlined fs-2">search_off</i>
                <p class="mb-0 mt-2">
                  No se encontraron permisos con el filtro aplicado.
                </p>
              </div>
            }
          } @else {
            <!-- Vista Master-Detail por Módulo -->
            <div class="d-lg-none mb-3">
              <label class="form-label small fw-semibold">Módulo del sistema</label>
              <app-v3-searchable-select
                size="sm"
                placeholder="Selecciona un módulo..."
                searchPlaceholder="Buscar módulo..."
                [options]="matrixModuleOptions()"
                [ngModel]="activeMatrixModuleKey()"
                (ngModelChange)="selectedMatrixModule.set($event)"
              />
            </div>

            <div class="row g-3">
              <div class="d-none d-lg-block col-lg-4">
                <div class="v3-rbac-module-list">
                  @for (mod of matrixModuleSummaries(); track mod.groupKey) {
                    <button
                      type="button"
                      class="v3-rbac-module-btn"
                      [class.is-active]="activeMatrixModuleKey() === mod.groupKey"
                      (click)="selectedMatrixModule.set(mod.groupKey)"
                    >
                      <div class="v3-rbac-module-main">
                        <i class="material-symbols-outlined">{{ mod.icon }}</i>
                        <span>{{ mod.label }}</span>
                      </div>
                      <div class="d-flex align-items-center gap-2 flex-shrink-0">
                        @if (mod.pendingCount > 0 || mod.customizedCount > 0) {
                          <span
                            class="v3-rbac-module-dot"
                            [appCustomTooltip]="'Tiene ajustes personalizados o cambios sin guardar'"
                          ></span>
                        }
                        <span class="badge bg-light text-dark border">
                          {{ mod.activeCount }}/{{ mod.total }}
                        </span>
                      </div>
                    </button>
                  }
                </div>
              </div>

              <div class="col-12 col-lg-8">
                @if (activeMatrixModuleGroup(); as activeGroup) {
                  <div class="v3-rbac-perm-card">
                    <div class="v3-rbac-perm-card-header">
                      <strong class="small text-uppercase d-flex align-items-center gap-2">
                        <i class="material-symbols-outlined fs-6 text-primary">
                          {{ moduleIcon(activeGroup.groupKey) }}
                        </i>
                        {{ groupLabel(activeGroup.groupKey) }}
                      </strong>
                      <span class="badge bg-primary-subtle text-primary">
                        {{ activeGroup.rows.length }} acciones disponibles
                      </span>
                    </div>

                    @for (row of activeGroup.rows; track row.catalog.code) {
                      <ng-container
                        *ngTemplateOutlet="matrixRowTpl; context: { $implicit: row }"
                      />
                    }
                  </div>
                }
              </div>
            </div>
          }
        </div>
      }

      <!-- TAB 3: EXCEPCIONES POR USUARIO (BUSCADOR ÁGIL + MASTER-DETAIL) -->
      @if (activeTab() === 'overrides' && canManageRbac()) {
        <div class="trezo-card p-4">
          <div class="v3-form-panel v3-form-panel--info py-2 px-3 small d-flex align-items-center gap-2 mb-4">
            <i class="material-symbols-outlined fs-5 text-primary">info</i>
            <span>
              Útil para diferenciar perfiles con el mismo cargo — por ejemplo,
              <strong>Coordinador Académico</strong> vs.
              <strong>Coordinador de Convivencia</strong>, o delegar una acción puntual a Secretaría sin cambiar todo el rol.
            </span>
          </div>

          <!-- Formulario de selección estrictamente a 2 columnas -->
          <div class="row g-3 mb-4">
            <div class="col-12 col-md-6">
              <label class="form-label small fw-semibold">
                Buscar funcionario o usuario
              </label>

              @if (selectedOverrideUser(); as chosen) {
                <div class="v3-rbac-selected-user">
                  <div>
                    <div class="fw-bold">{{ chosen.fullName }}</div>
                    <small class="text-muted">
                      Doc: {{ chosen.documentNumber || '—' }} · {{ chosen.username }}
                    </small>
                  </div>
                  <button
                    type="button"
                    class="btn btn-sm btn-outline-secondary"
                    (click)="clearOverrideUserSelection()"
                  >
                    Cambiar usuario
                  </button>
                </div>
              } @else {
                <div class="v3-input-wrap mb-2">
                  <span class="material-symbols-outlined v3-input-icon" aria-hidden="true">
                    person_search
                  </span>
                  <input
                    type="text"
                    class="form-control"
                    [ngModel]="overrideUserQuery()"
                    (ngModelChange)="onOverrideUserQueryInput($event)"
                    placeholder="Buscar por nombre, documento o correo..."
                  />
                  @if (overrideUserQuery()) {
                    <button
                      type="button"
                      class="v3-input-action"
                      (click)="onOverrideUserQueryInput('')"
                      [appCustomTooltip]="'Limpiar búsqueda'"
                    >
                      <i class="material-symbols-outlined">close</i>
                    </button>
                  }
                </div>

                @if (searchingOverrideUsers()) {
                  <div class="small text-muted py-2">
                    <span class="spinner-border spinner-border-sm me-1"></span>
                    Buscando usuarios...
                  </div>
                } @else if (overrideUserSuggestions().length > 0) {
                  <div class="v3-rbac-user-results">
                    @for (candidate of overrideUserSuggestions(); track candidate.userId) {
                      <button
                        type="button"
                        class="v3-rbac-user-result-item"
                        (click)="selectOverrideUser(candidate)"
                      >
                        <div>
                          <div class="fw-semibold small">{{ candidate.fullName }}</div>
                          <small class="text-muted">
                            Doc: {{ candidate.documentNumber || '—' }} ·
                            {{ formatUserIdentityLine(candidate) }}
                          </small>
                        </div>
                        <div class="d-flex flex-wrap gap-1">
                          @for (m of candidate.memberships; track m.membershipId) {
                            <span
                              class="v3-rbac-role-badge"
                              [ngClass]="roleBadgeClass(m.role, m.isActive)"
                            >
                              {{ roleLabel(m.role) }}
                            </span>
                          }
                          @if (candidate.overridesCount > 0) {
                            <span class="badge bg-warning-subtle text-warning-emphasis">
                              {{ candidate.overridesCount }} exc.
                            </span>
                          }
                        </div>
                      </button>
                    }
                  </div>
                } @else if (overrideUserQuery().trim().length >= 2) {
                  <div class="small text-muted border rounded p-2">
                    Sin coincidencias para "{{ overrideUserQuery() }}".
                  </div>
                }

                @if (quickOverrideUsers().length > 0 && overrideUserQuery().trim().length === 0) {
                  <div class="mt-2">
                    <div class="small text-muted mb-1">
                      Acceso rápido (con excepciones o equipo directivo):
                    </div>
                    <div class="d-flex flex-wrap gap-2">
                      @for (quickUser of quickOverrideUsers(); track quickUser.userId) {
                        <button
                          type="button"
                          class="v3-rbac-segment-pill"
                          (click)="selectOverrideUser(quickUser)"
                        >
                          <span>{{ quickUser.fullName }}</span>
                          @if (quickUser.overridesCount > 0) {
                            <span class="v3-rbac-segment-count">
                              {{ quickUser.overridesCount }}
                            </span>
                          }
                        </button>
                      }
                    </div>
                  </div>
                }
              }
            </div>

            <div class="col-12 col-md-6">
              <label class="form-label small fw-semibold">Rol a ajustar</label>
              <app-v3-searchable-select
                placeholder="Selecciona un rol del usuario..."
                searchPlaceholder="Buscar rol..."
                [options]="overrideRoleOptions()"
                [disabled]="selectedOverrideUserRoles().length === 0"
                [ngModel]="selectedOverrideRole()"
                (ngModelChange)="onOverrideRoleSelected($event)"
              />
              @if (selectedOverrideRole(); as activeOvRole) {
                <small class="text-muted d-block mt-2">
                  {{ roleHint(activeOvRole) }}
                </small>
              }
            </div>
          </div>

          @if (!selectedOverrideUser()) {
            <div class="text-center py-5 text-muted border rounded">
              <i class="material-symbols-outlined fs-2">person_search</i>
              <p class="mb-0 mt-2">
                Busca y selecciona un funcionario o usuario para ajustar sus permisos puntuales.
              </p>
            </div>
          } @else if (loadingOverrides()) {
            <div class="text-center py-5 text-muted">
              <div class="spinner-border spinner-border-sm text-primary"></div>
              <span class="ms-2">Cargando excepciones del usuario...</span>
            </div>
          } @else {
            <!-- Toolbar de filtros y guardado -->
            <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 pt-3 border-top">
              <div class="d-flex flex-wrap align-items-center gap-2 flex-grow-1">
                <div class="v3-input-wrap" style="min-width: 240px; flex: 1 1 250px; max-width: 340px">
                  <span class="material-symbols-outlined v3-input-icon" aria-hidden="true">
                    search
                  </span>
                  <input
                    type="text"
                    class="form-control form-control-sm"
                    [ngModel]="overrideSearch()"
                    (ngModelChange)="overrideSearch.set($event)"
                    placeholder="Buscar permiso..."
                  />
                </div>

                <div class="v3-rbac-segment-bar">
                  <button
                    type="button"
                    class="v3-rbac-segment-pill"
                    [class.is-active]="overrideFilter() === 'ALL'"
                    (click)="overrideFilter.set('ALL')"
                  >
                    <span>Por módulo</span>
                  </button>
                  <button
                    type="button"
                    class="v3-rbac-segment-pill"
                    [class.is-active]="overrideFilter() === 'CUSTOM'"
                    (click)="overrideFilter.set('CUSTOM')"
                  >
                    <span>Solo excepciones</span>
                    <span class="v3-rbac-segment-count">
                      {{ overrideFilterCounts().custom }}
                    </span>
                  </button>
                  <button
                    type="button"
                    class="v3-rbac-segment-pill"
                    [class.is-active]="overrideFilter() === 'SENSITIVE'"
                    (click)="overrideFilter.set('SENSITIVE')"
                  >
                    <span>Sensibles</span>
                    <span class="v3-rbac-segment-count">
                      {{ overrideFilterCounts().sensitive }}
                    </span>
                  </button>
                </div>
              </div>

              <button
                type="button"
                class="btn btn-sm btn-primary text-nowrap"
                [disabled]="savingOverrides() || pendingOverrideChangesCount() === 0"
                (click)="saveUserOverrides()"
                [appCustomTooltip]="'Guardar excepciones individuales seleccionadas'"
              >
                <i class="material-symbols-outlined fs-6 align-middle me-1">save</i>
                {{
                  savingOverrides()
                    ? 'Guardando...'
                    : 'Guardar (' + pendingOverrideChangesCount() + ')'
                }}
              </button>
            </div>

            @if (overrideGlobalFilterActive()) {
              <div class="d-flex align-items-center justify-content-between mb-3">
                <small class="text-muted">
                  Coincidencias filtradas para
                  <strong>{{ selectedOverrideUser()?.fullName }}</strong>
                </small>
                <button
                  type="button"
                  class="btn btn-sm btn-outline-secondary"
                  (click)="clearOverrideFilters()"
                >
                  Volver a vista por módulo
                </button>
              </div>

              @for (group of filteredOverrideGroups(); track group.groupKey) {
                <div class="v3-rbac-perm-card mb-3">
                  <div class="v3-rbac-perm-card-header">
                    <strong class="small text-uppercase d-flex align-items-center gap-2">
                      <i class="material-symbols-outlined fs-6 text-primary">
                        {{ moduleIcon(group.groupKey) }}
                      </i>
                      {{ groupLabel(group.groupKey) }}
                    </strong>
                    <span class="badge bg-secondary-subtle text-secondary">
                      {{ group.rows.length }} permiso(s)
                    </span>
                  </div>
                  @for (row of group.rows; track row.catalog.code) {
                    <ng-container
                      *ngTemplateOutlet="overrideRowTpl; context: { $implicit: row }"
                    />
                  }
                </div>
              } @empty {
                <div class="text-center py-5 text-muted border rounded">
                  <i class="material-symbols-outlined fs-2">search_off</i>
                  <p class="mb-0 mt-2">
                    No hay permisos o excepciones que coincidan con el filtro.
                  </p>
                </div>
              }
            } @else {
              <div class="d-lg-none mb-3">
                <label class="form-label small fw-semibold">Módulo del sistema</label>
                <app-v3-searchable-select
                  size="sm"
                  placeholder="Selecciona un módulo..."
                  searchPlaceholder="Buscar módulo..."
                  [options]="overrideModuleOptions()"
                  [ngModel]="activeOverrideModuleKey()"
                  (ngModelChange)="selectedOverrideModule.set($event)"
                />
              </div>

              <div class="row g-3">
                <div class="d-none d-lg-block col-lg-4">
                  <div class="v3-rbac-module-list">
                    @for (mod of overrideModuleSummaries(); track mod.groupKey) {
                      <button
                        type="button"
                        class="v3-rbac-module-btn"
                        [class.is-active]="activeOverrideModuleKey() === mod.groupKey"
                        (click)="selectedOverrideModule.set(mod.groupKey)"
                      >
                        <div class="v3-rbac-module-main">
                          <i class="material-symbols-outlined">{{ mod.icon }}</i>
                          <span>{{ mod.label }}</span>
                        </div>
                        <div class="d-flex align-items-center gap-2 flex-shrink-0">
                          @if (mod.pendingCount > 0 || mod.customizedCount > 0) {
                            <span
                              class="v3-rbac-module-dot"
                              [appCustomTooltip]="'Tiene excepciones aplicadas o cambios sin guardar'"
                            ></span>
                          }
                          <span class="badge bg-light text-dark border">
                            {{ mod.activeCount }}/{{ mod.total }}
                          </span>
                        </div>
                      </button>
                    }
                  </div>
                </div>

                <div class="col-12 col-lg-8">
                  @if (activeOverrideModuleGroup(); as activeOvGroup) {
                    <div class="v3-rbac-perm-card">
                      <div class="v3-rbac-perm-card-header">
                        <strong class="small text-uppercase d-flex align-items-center gap-2">
                          <i class="material-symbols-outlined fs-6 text-primary">
                            {{ moduleIcon(activeOvGroup.groupKey) }}
                          </i>
                          {{ groupLabel(activeOvGroup.groupKey) }}
                        </strong>
                        <span class="badge bg-primary-subtle text-primary">
                          {{ activeOvGroup.rows.length }} acciones disponibles
                        </span>
                      </div>

                      @for (row of activeOvGroup.rows; track row.catalog.code) {
                        <ng-container
                          *ngTemplateOutlet="overrideRowTpl; context: { $implicit: row }"
                        />
                      }
                    </div>
                  }
                </div>
              </div>
            }
          }
        </div>
      }
    </div>

    <!-- Plantilla reutilizable: Fila de permiso para Matriz por Rol -->
    <ng-template #matrixRowTpl let-row>
      <div
        class="v3-rbac-perm-row"
        [class.is-pending]="row.pendingEffect !== null"
      >
        <div class="v3-rbac-perm-copy">
          <div class="d-flex flex-wrap align-items-center gap-2">
            <span class="fw-semibold">{{ humanPermName(row.catalog) }}</span>
            @if (row.catalog.isSensitive) {
              <span
                class="badge bg-danger-subtle text-danger small"
                [appCustomTooltip]="'Acción crítica con impacto institucional o legal'"
              >
                Sensible
              </span>
            }
            @if (row.entry.blockedByDisabledModule) {
              <span
                class="badge bg-secondary small"
                [appCustomTooltip]="'Este módulo está desactivado en el colegio'"
              >
                Módulo inactivo
              </span>
            }
            @if (row.pendingEffect !== null) {
              <span class="badge bg-warning-subtle text-warning-emphasis small">
                Sin guardar
              </span>
            }
          </div>
          <div class="small text-muted">{{ humanPermDescription(row.catalog) }}</div>
        </div>

        <div class="v3-rbac-perm-controls">
          @let status = matrixRowStatus(row);
          <span
            class="v3-perm-status"
            [ngClass]="status.cssClass"
            [appCustomTooltip]="status.tooltip"
          >
            <span class="v3-perm-status-dot"></span>
            <span>{{ status.label }}</span>
          </span>

          <div class="v3-perm-segment" role="group">
            <button
              type="button"
              class="v3-perm-segment-btn"
              [class.is-default-active]="row.currentSelection === 'DEFAULT'"
              (click)="setRoleEffect(row.catalog.code, 'DEFAULT')"
              [appCustomTooltip]="'Usar configuración recomendada del Ministerio de Educación'"
            >
              <i class="material-symbols-outlined">settings_backup_restore</i>
              <span>Por defecto</span>
            </button>
            <button
              type="button"
              class="v3-perm-segment-btn"
              [class.is-allow-active]="row.currentSelection === 'ALLOW'"
              (click)="setRoleEffect(row.catalog.code, 'ALLOW')"
              [appCustomTooltip]="'Habilitar este permiso para este rol'"
            >
              <i class="material-symbols-outlined">check_circle</i>
              <span>Permitir</span>
            </button>
            <button
              type="button"
              class="v3-perm-segment-btn"
              [class.is-deny-active]="row.currentSelection === 'DENY'"
              (click)="setRoleEffect(row.catalog.code, 'DENY')"
              [appCustomTooltip]="'Bloquear este permiso para este rol'"
            >
              <i class="material-symbols-outlined">block</i>
              <span>Denegar</span>
            </button>
          </div>
        </div>
      </div>
    </ng-template>

    <!-- Plantilla reutilizable: Fila de permiso para Excepciones por Usuario -->
    <ng-template #overrideRowTpl let-row>
      <div
        class="v3-rbac-perm-row"
        [class.is-pending]="row.pendingEffect !== null"
      >
        <div class="v3-rbac-perm-copy">
          <div class="d-flex flex-wrap align-items-center gap-2">
            <span class="fw-semibold">{{ humanPermName(row.catalog) }}</span>
            @if (row.catalog.isSensitive) {
              <span
                class="badge bg-danger-subtle text-danger small"
                [appCustomTooltip]="'Acción crítica con impacto institucional o legal'"
              >
                Sensible
              </span>
            }
            @if (row.entry.blockedByDisabledModule) {
              <span
                class="badge bg-secondary small"
                [appCustomTooltip]="'Este módulo está desactivado en el colegio'"
              >
                Módulo inactivo
              </span>
            }
            @if (row.pendingEffect !== null) {
              <span class="badge bg-warning-subtle text-warning-emphasis small">
                Sin guardar
              </span>
            }
          </div>
          <div class="small text-muted">{{ humanPermDescription(row.catalog) }}</div>
        </div>

        <div class="v3-rbac-perm-controls">
          @let ovStatus = overrideRowStatus(row);
          <span
            class="v3-perm-status"
            [ngClass]="ovStatus.cssClass"
            [appCustomTooltip]="ovStatus.tooltip"
          >
            <span class="v3-perm-status-dot"></span>
            <span>{{ ovStatus.label }}</span>
          </span>

          <div class="v3-perm-segment" role="group">
            <button
              type="button"
              class="v3-perm-segment-btn"
              [class.is-default-active]="row.currentSelection === 'INHERIT'"
              (click)="setUserOverrideEffect(row.catalog.code, 'INHERIT')"
              [appCustomTooltip]="'Seguir el permiso asignado al cargo'"
            >
              <i class="material-symbols-outlined">sync</i>
              <span>Del rol</span>
            </button>
            <button
              type="button"
              class="v3-perm-segment-btn"
              [class.is-allow-active]="row.currentSelection === 'ALLOW'"
              (click)="setUserOverrideEffect(row.catalog.code, 'ALLOW')"
              [appCustomTooltip]="'Autorizar excepcionalmente a este usuario'"
            >
              <i class="material-symbols-outlined">check_circle</i>
              <span>Permitir</span>
            </button>
            <button
              type="button"
              class="v3-perm-segment-btn"
              [class.is-deny-active]="row.currentSelection === 'DENY'"
              (click)="setUserOverrideEffect(row.catalog.code, 'DENY')"
              [appCustomTooltip]="'Bloquear excepcionalmente a este usuario'"
            >
              <i class="material-symbols-outlined">block</i>
              <span>Denegar</span>
            </button>
          </div>
        </div>
      </div>
    </ng-template>

    <!-- Modal 2-Columnas: Asignar Rol Institucional -->
    <app-v3-modal-dialog
      [open]="assignModalOpen()"
      heading="Asignar Rol Institucional"
      subtitle="Otorga acceso directivo, administrativo o académico sin perder la trazabilidad del colegio"
      icon="person_add"
      size="lg"
      (closed)="assignModalOpen.set(false)"
    >
      <form (ngSubmit)="submitAssignMembership()">
        <div class="row g-3">
          @if (assignTargetUser(); as target) {
            <div class="col-12 col-md-6">
              <label class="form-label">Usuario seleccionado</label>
              <div class="v3-rbac-selected-user">
                <div>
                  <div class="fw-bold">{{ target.fullName }}</div>
                  <small class="text-muted">
                    Doc: {{ target.documentNumber || '—' }} ·
                    {{ formatUserIdentityLine(target) }}
                  </small>
                </div>
                <button
                  type="button"
                  class="btn btn-sm btn-outline-secondary"
                  (click)="resetAssignTargetUser()"
                >
                  Cambiar
                </button>
              </div>
            </div>
          } @else {
            <div class="col-12 col-md-6">
              <label class="form-label">Buscar usuario (nombre, documento o correo) *</label>
              <div class="v3-input-wrap">
                <span class="material-symbols-outlined v3-input-icon" aria-hidden="true">
                  search
                </span>
                <input
                  type="text"
                  class="form-control"
                  name="assignSearchInput"
                  [ngModel]="assignSearchTerm()"
                  (ngModelChange)="onAssignSearchInput($event)"
                  placeholder="Ej. documento, nombre o usuario..."
                />
              </div>
            </div>
          }

          <div class="col-12 col-md-6">
            <label class="form-label">Rol institucional a asignar *</label>
            <app-v3-searchable-select
              name="assignRoleSelect"
              placeholder="Selecciona un rol..."
              searchPlaceholder="Buscar rol..."
              [options]="assignableRoleOptions()"
              [ngModel]="assignRole()"
              (ngModelChange)="assignRole.set($event)"
            />
          </div>

          <div class="col-12">
            <div class="v3-form-panel v3-form-panel--info mb-0 py-2 px-3 small">
              <strong>Alcance de {{ roleLabel(assignRole()) }}:</strong>
              {{ roleHint(assignRole()) }}
            </div>
          </div>

          @if (!assignTargetUser()) {
            <div class="col-12">
              @if (searchingAssignUsers()) {
                <div class="small text-muted py-2">
                  <span class="spinner-border spinner-border-sm me-1"></span>
                  Buscando coincidencias en el colegio...
                </div>
              } @else if (assignSearchResults().length > 0) {
                <div class="small fw-semibold text-muted mb-2">
                  Selecciona la persona a quien deseas asignar el rol:
                </div>
                <div class="v3-rbac-user-results">
                  @for (candidate of assignSearchResults(); track candidate.userId) {
                    <button
                      type="button"
                      class="v3-rbac-user-result-item"
                      (click)="selectAssignCandidate(candidate)"
                    >
                      <div>
                        <div class="fw-semibold small">{{ candidate.fullName }}</div>
                        <small class="text-muted">
                          Doc: {{ candidate.documentNumber || '—' }} ·
                          {{ formatUserIdentityLine(candidate) }}
                        </small>
                      </div>
                      <div class="d-flex flex-wrap gap-1">
                        @for (m of candidate.memberships; track m.membershipId) {
                          <span
                            class="v3-rbac-role-badge"
                            [ngClass]="roleBadgeClass(m.role, m.isActive)"
                          >
                            {{ roleLabel(m.role) }}
                          </span>
                        }
                      </div>
                    </button>
                  }
                </div>
              } @else if (assignSearchTerm().trim().length >= 3) {
                <div class="v3-form-panel v3-form-panel--warning mb-0 py-2 px-3 small">
                  Si el usuario ya existe en la plataforma con el documento, usuario o correo
                  <strong>"{{ assignSearchTerm().trim() }}"</strong> aunque aún no pertenezca a este colegio,
                  puedes asignarle el rol directamente haciendo clic en
                  <strong>Asignar rol</strong>.
                </div>
              }
            </div>
          }
        </div>
      </form>

      <div modal-footer>
        <button
          type="button"
          class="btn btn-sm btn-outline-secondary"
          (click)="assignModalOpen.set(false)"
        >
          Cancelar
        </button>
        <button
          type="button"
          class="btn btn-sm btn-primary"
          [disabled]="!canSubmitAssign()"
          (click)="submitAssignMembership()"
        >
          {{ assigningMembership() ? 'Asignando...' : 'Asignar rol' }}
        </button>
      </div>
    </app-v3-modal-dialog>
  `,
})
export class RolesPermissionsManagementComponent implements OnInit {
  private _membershipsGrid?: ExodoGridComponent;

  @ViewChild('membershipsGrid')
  set membershipsGridRef(grid: ExodoGridComponent | undefined) {
    const changed = this._membershipsGrid !== grid;
    this._membershipsGrid = grid;
    if (grid && changed && this.isBrowser) {
      this.scheduleGridLoad(true);
    }
  }

  get membershipsGrid(): ExodoGridComponent | undefined {
    return this._membershipsGrid;
  }

  protected readonly v3Auth = inject(V3UnifiedAuthService);
  private readonly rbacService = inject(V3RbacService);
  private readonly themeService = inject(CustomizerSettingsService);
  private readonly messages = inject(MessagesService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private gridLoadTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly assignSearch$ = new Subject<string>();
  private readonly overrideSearch$ = new Subject<string>();

  readonly dataSource: DataSourceContract = { rows: [], dataRecords: null };
  readonly proxy: Proxy = {
    api: { read: `${environment.APIURL}/rbac/memberships` },
  };

  readonly columns: ColumnContract[] = [
    { text: '#', width: '48px', align: 'center', sortable: false },
    { text: 'Usuario', dataIndex: 'fullName' },
    { text: 'Documento', dataIndex: 'documentNumber', width: '140px' },
    { text: 'Roles en la institución', dataIndex: 'roles' },
    { text: 'Excepciones', dataIndex: 'overridesCount', align: 'center', width: '130px' },
    { text: 'Acciones', width: '160px', align: 'right', sortable: false },
  ];

  private readonly exportColumns: readonly ExodoExportColumn<SchoolUserMembershipItem>[] = [
    { header: 'Nombre completo', value: (r) => r.fullName },
    { header: 'Documento', value: (r) => r.documentNumber },
    { header: 'Usuario', value: (r) => r.username },
    { header: 'Correo', value: (r) => r.email ?? '' },
    {
      header: 'Roles',
      value: (r) =>
        r.memberships
          .map((m) =>
            m.isActive
              ? this.roleLabel(m.role)
              : `${this.roleLabel(m.role)} (Suspendido)`,
          )
          .join(', '),
    },
    { header: 'Excepciones activas', value: (r) => r.overridesCount },
  ];

  readonly canViewMemberships = computed(() =>
    this.v3Auth.hasPermission(RBAC_PERMISSIONS.IAM_MEMBERSHIPS_VIEW),
  );
  readonly canManageMemberships = computed(() =>
    this.v3Auth.hasPermission(RBAC_PERMISSIONS.IAM_MEMBERSHIPS_MANAGE),
  );
  readonly canManageRbac = computed(() =>
    this.v3Auth.hasPermission(RBAC_PERMISSIONS.IAM_RBAC_MANAGE),
  );

  get gridTheme(): 'dark' | 'glacial' {
    return this.themeService.isDark() ? 'dark' : 'glacial';
  }

  get membershipRows(): SchoolUserMembershipItem[] {
    return (this._membershipsGrid?.rows as SchoolUserMembershipItem[] | undefined) ?? [];
  }

  readonly activeTab = signal<ActiveRbacTab>('memberships');
  readonly summary = signal<RbacMembershipsSummary | null>(null);
  readonly activeAudience = signal<RbacMembershipAudience>('DIRECTIVES');
  readonly activeRoleFilter = signal<CommunityRole | ''>('');

  readonly gridCaption = computed(() => {
    const role = this.activeRoleFilter();
    if (role) {
      return `Usuarios con rol: ${this.roleLabel(role)}`;
    }
    switch (this.activeAudience()) {
      case 'DIRECTIVES':
        return 'Equipo Directivo Institucional (Rectoría, Secretaría Académica y Coordinación)';
      case 'TEACHERS':
        return 'Planta Docente del Colegio';
      case 'STUDENTS':
        return 'Estudiantes Matriculados';
      case 'FAMILIES':
        return 'Acudientes y Monitores';
      case 'EXCEPTIONS':
        return 'Usuarios con Excepciones Puntuales de Permisos';
      case 'ALL':
      default:
        return 'Directorio Completo de la Comunidad Educativa';
    }
  });

  // Roles asignables en el orden directivo-first
  readonly assignableRoles = computed<CommunityRole[]>(() => {
    const base: CommunityRole[] = [
      'RECTOR',
      'SECRETARY',
      'COORDINATOR',
      'SCHOOL_ADMIN',
      'TEACHER',
      'MONITOR',
    ];
    if (this.v3Auth.activeRole() === 'SUPER_ADMIN') {
      return ['SUPER_ADMIN', ...base];
    }
    return base;
  });

  readonly assignableRoleOptions = computed<SearchableSelectOption<CommunityRole>[]>(
    () =>
      this.assignableRoles().map((r) => ({
        value: r,
        label: this.roleLabel(r),
        subtitle: this.roleHint(r),
      })),
  );

  // Estado Modal Asignar Rol (2 columnas + buscador remoto)
  readonly assignModalOpen = signal(false);
  readonly assignTargetUser = signal<SchoolUserMembershipItem | null>(null);
  readonly assignSearchTerm = signal('');
  readonly assignSearchResults = signal<SchoolUserMembershipItem[]>([]);
  readonly searchingAssignUsers = signal(false);
  readonly assignRole = signal<CommunityRole>('COORDINATOR');
  readonly assigningMembership = signal(false);

  readonly canSubmitAssign = computed(() => {
    if (this.assigningMembership() || !this.assignRole()) {
      return false;
    }
    return Boolean(
      this.assignTargetUser() || this.assignSearchTerm().trim().length >= 3,
    );
  });

  // Estado Tab 2: Matriz de Roles
  readonly matrixPayload = signal<RolesMatrixPayload | null>(null);
  readonly loadingMatrix = signal(false);
  readonly savingMatrix = signal(false);
  readonly selectedMatrixRole = signal<CommunityRole>('RECTOR');
  readonly selectedMatrixModule = signal<string>('');
  readonly matrixSearch = signal('');
  readonly matrixFilter = signal<MatrixFilterMode>('ALL');
  readonly pendingRoleChanges = signal<
    Record<string, 'ALLOW' | 'DENY' | 'DEFAULT'>
  >({});

  readonly directiveMatrixRoles = computed<CommunityRole[]>(() => {
    const available = new Set(this.matrixPayload()?.roles ?? []);
    return DIRECTIVE_ROLE_ORDER.filter((r) => available.has(r));
  });

  readonly secondaryMatrixRoles = computed<CommunityRole[]>(() => {
    const available = this.matrixPayload()?.roles ?? [];
    const directSet = new Set<CommunityRole>(DIRECTIVE_ROLE_ORDER);
    const orderedSecondary = SECONDARY_ROLE_ORDER.filter((r) =>
      available.includes(r),
    );
    const remaining = available.filter(
      (r) => !directSet.has(r) && !SECONDARY_ROLE_ORDER.includes(r),
    );
    return [...orderedSecondary, ...remaining];
  });

  readonly matrixRoleStats = computed<
    Partial<Record<CommunityRole, { effectiveCount: number; customizedCount: number }>>
  >(() => {
    const payload = this.matrixPayload();
    if (!payload) {
      return {};
    }
    const stats: Partial<
      Record<CommunityRole, { effectiveCount: number; customizedCount: number }>
    > = {};
    for (const role of payload.roles) {
      const entries = payload.matrixByRole[role] ?? [];
      let effectiveCount = 0;
      let customizedCount = 0;
      for (const e of entries) {
        if (e.effectiveGranted) {
          effectiveCount += 1;
        }
        if (e.schoolEffect !== null) {
          customizedCount += 1;
        }
      }
      stats[role] = { effectiveCount, customizedCount };
    }
    return stats;
  });

  readonly pendingRoleChangesCount = computed(
    () => Object.keys(this.pendingRoleChanges()).length,
  );

  readonly allMatrixGroups = computed(() => {
    const payload = this.matrixPayload();
    if (!payload) {
      return [];
    }
    const role = this.selectedMatrixRole();
    const entries = payload.matrixByRole[role] ?? [];
    const entryMap = new Map<string, RolePermissionMatrixItem>(
      entries.map((e) => [e.permissionCode, e]),
    );
    const pending = this.pendingRoleChanges();

    const groups = new Map<string, MatrixRowView[]>();
    for (const item of payload.catalog) {
      const entry = entryMap.get(item.code);
      if (!entry) {
        continue;
      }
      const pendingEffect = pending[item.code] ?? null;
      const currentSelection: 'ALLOW' | 'DENY' | 'DEFAULT' =
        pendingEffect ?? entry.schoolEffect ?? 'DEFAULT';
      const list = groups.get(item.moduleGroup) ?? [];
      list.push({ catalog: item, entry, pendingEffect, currentSelection });
      groups.set(item.moduleGroup, list);
    }

    return Array.from(groups.entries()).map(([groupKey, rows]) => ({
      groupKey,
      rows,
    }));
  });

  readonly matrixFilterCounts = computed(() => {
    let custom = 0;
    let sensitive = 0;
    for (const group of this.allMatrixGroups()) {
      for (const row of group.rows) {
        if (row.currentSelection !== 'DEFAULT') {
          custom += 1;
        }
        if (row.catalog.isSensitive) {
          sensitive += 1;
        }
      }
    }
    return { custom, sensitive };
  });

  readonly matrixGlobalFilterActive = computed(
    () =>
      this.matrixSearch().trim().length > 0 || this.matrixFilter() !== 'ALL',
  );

  readonly filteredMatrixGroups = computed(() =>
    this.filterPermissionGroups(
      this.allMatrixGroups(),
      this.matrixSearch(),
      this.matrixFilter(),
      (row) => row.currentSelection !== 'DEFAULT',
    ),
  );

  readonly matrixModuleSummaries = computed<ModuleNavSummary[]>(() =>
    this.buildModuleSummaries(
      this.allMatrixGroups(),
      (r) =>
        r.pendingEffect
          ? r.pendingEffect === 'ALLOW' ||
            (r.pendingEffect === 'DEFAULT' && r.entry.defaultGranted)
          : r.entry.effectiveGranted,
      (r) => r.currentSelection !== 'DEFAULT',
      (r) => r.pendingEffect !== null,
    ),
  );

  readonly matrixModuleOptions = computed<SearchableSelectOption<string>[]>(() =>
    this.matrixModuleSummaries().map((m) => ({
      value: m.groupKey,
      label: m.label,
      badge: `${m.activeCount}/${m.total}`,
    })),
  );

  readonly activeMatrixModuleKey = computed(() =>
    this.resolveActiveModuleKey(this.allMatrixGroups(), this.selectedMatrixModule()),
  );

  readonly activeMatrixModuleGroup = computed(() => {
    const key = this.activeMatrixModuleKey();
    return this.allMatrixGroups().find((g) => g.groupKey === key) ?? null;
  });

  // Estado Tab 3: Excepciones por Usuario
  readonly selectedOverrideUser = signal<SchoolUserMembershipItem | null>(null);
  readonly selectedOverrideRole = signal<CommunityRole | null>(null);
  readonly overrideUserQuery = signal('');
  readonly overrideUserSuggestions = signal<SchoolUserMembershipItem[]>([]);
  readonly quickOverrideUsers = signal<SchoolUserMembershipItem[]>([]);
  readonly searchingOverrideUsers = signal(false);
  readonly userOverrides = signal<UserPermissionOverrideItem[]>([]);
  readonly loadingOverrides = signal(false);
  readonly savingOverrides = signal(false);
  readonly selectedOverrideModule = signal<string>('');
  readonly overrideSearch = signal('');
  readonly overrideFilter = signal<OverridesFilterMode>('ALL');
  readonly pendingOverrideChanges = signal<
    Record<string, 'ALLOW' | 'DENY' | 'INHERIT'>
  >({});

  readonly selectedOverrideUserRoles = computed<CommunityRole[]>(() =>
    (this.selectedOverrideUser()?.memberships ?? [])
      .map((m) => m.role)
      .filter((r) => r !== 'SUPER_ADMIN'),
  );

  readonly overrideRoleOptions = computed<SearchableSelectOption<CommunityRole>[]>(
    () =>
      this.selectedOverrideUserRoles().map((r) => ({
        value: r,
        label: this.roleLabel(r),
      })),
  );

  readonly pendingOverrideChangesCount = computed(
    () => Object.keys(this.pendingOverrideChanges()).length,
  );

  readonly allOverrideGroups = computed(() => {
    const payload = this.matrixPayload();
    if (!payload) {
      return [];
    }
    const overrideMap = new Map<string, UserPermissionOverrideItem>(
      this.userOverrides().map((o) => [o.permissionCode, o]),
    );
    const pending = this.pendingOverrideChanges();
    const groups = new Map<string, OverrideRowView[]>();

    for (const item of payload.catalog) {
      const entry = overrideMap.get(item.code);
      if (!entry) {
        continue;
      }
      const pendingEffect = pending[item.code] ?? null;
      const currentSelection: 'ALLOW' | 'DENY' | 'INHERIT' =
        pendingEffect ?? entry.userEffect ?? 'INHERIT';
      const list = groups.get(item.moduleGroup) ?? [];
      list.push({ catalog: item, entry, pendingEffect, currentSelection });
      groups.set(item.moduleGroup, list);
    }

    return Array.from(groups.entries()).map(([groupKey, rows]) => ({
      groupKey,
      rows,
    }));
  });

  readonly overrideFilterCounts = computed(() => {
    let custom = 0;
    let sensitive = 0;
    for (const group of this.allOverrideGroups()) {
      for (const row of group.rows) {
        if (row.currentSelection !== 'INHERIT') {
          custom += 1;
        }
        if (row.catalog.isSensitive) {
          sensitive += 1;
        }
      }
    }
    return { custom, sensitive };
  });

  readonly overrideGlobalFilterActive = computed(
    () =>
      this.overrideSearch().trim().length > 0 || this.overrideFilter() !== 'ALL',
  );

  readonly filteredOverrideGroups = computed(() =>
    this.filterPermissionGroups(
      this.allOverrideGroups(),
      this.overrideSearch(),
      this.overrideFilter(),
      (row) => row.currentSelection !== 'INHERIT',
    ),
  );

  readonly overrideModuleSummaries = computed<ModuleNavSummary[]>(() =>
    this.buildModuleSummaries(
      this.allOverrideGroups(),
      (r) =>
        r.pendingEffect
          ? r.pendingEffect === 'ALLOW' ||
            (r.pendingEffect === 'INHERIT' && r.entry.roleEffectiveGranted)
          : r.entry.finalEffectiveGranted,
      (r) => r.currentSelection !== 'INHERIT',
      (r) => r.pendingEffect !== null,
    ),
  );

  readonly overrideModuleOptions = computed<SearchableSelectOption<string>[]>(() =>
    this.overrideModuleSummaries().map((m) => ({
      value: m.groupKey,
      label: m.label,
      badge: `${m.activeCount}/${m.total}`,
    })),
  );

  readonly activeOverrideModuleKey = computed(() =>
    this.resolveActiveModuleKey(
      this.allOverrideGroups(),
      this.selectedOverrideModule(),
    ),
  );

  readonly activeOverrideModuleGroup = computed(() => {
    const key = this.activeOverrideModuleKey();
    return this.allOverrideGroups().find((g) => g.groupKey === key) ?? null;
  });

  constructor() {
    this.destroyRef.onDestroy(() => {
      if (this.gridLoadTimer !== null) {
        clearTimeout(this.gridLoadTimer);
        this.gridLoadTimer = null;
      }
    });

    this.assignSearch$
      .pipe(
        debounceTime(280),
        distinctUntilChanged(),
        switchMap((term) => {
          const clean = term.trim();
          this.searchingAssignUsers.set(true);
          return this.rbacService
            .searchMemberships({
              search: clean || undefined,
              audience: clean ? 'ALL' : 'DIRECTIVES',
              limit: 8,
            })
            .pipe(
              catchError(() => of([])),
              finalize(() => this.searchingAssignUsers.set(false)),
            );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((rows) => this.assignSearchResults.set(rows));

    this.overrideSearch$
      .pipe(
        debounceTime(280),
        distinctUntilChanged(),
        switchMap((term) => {
          const clean = term.trim();
          if (clean.length < 2) {
            return of([] as SchoolUserMembershipItem[]);
          }
          this.searchingOverrideUsers.set(true);
          return this.rbacService
            .searchMemberships({
              search: clean,
              audience: 'ALL',
              limit: 8,
            })
            .pipe(
              catchError(() => of([])),
              finalize(() => this.searchingOverrideUsers.set(false)),
            );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((rows) => this.overrideUserSuggestions.set(rows));
  }

  ngOnInit(): void {
    if (this.canViewMemberships()) {
      this.activeTab.set('memberships');
      this.loadSummary();
    } else if (this.canManageRbac()) {
      this.activeTab.set('matrix');
    }
    if (this.canManageRbac()) {
      this.loadMatrix();
    }
  }

  switchTab(tab: ActiveRbacTab): void {
    this.activeTab.set(tab);
    if (tab === 'memberships') {
      this.loadSummary();
    } else if ((tab === 'matrix' || tab === 'overrides') && !this.matrixPayload()) {
      this.loadMatrix();
    }
    if (tab === 'overrides' && this.quickOverrideUsers().length === 0) {
      this.loadQuickOverrideUsers();
    }
  }

  private filterPermissionGroups<TRow extends { catalog: PermissionCatalogItem }>(
    groups: ReadonlyArray<{ groupKey: string; rows: TRow[] }>,
    rawQuery: string,
    filter: 'ALL' | 'CUSTOM' | 'SENSITIVE',
    isCustom: (row: TRow) => boolean,
  ): Array<{ groupKey: string; rows: TRow[] }> {
    const q = rawQuery.trim().toLowerCase();
    const out: Array<{ groupKey: string; rows: TRow[] }> = [];
    for (const group of groups) {
      const groupTitle = this.groupLabel(group.groupKey).toLowerCase();
      const rows = group.rows.filter((row) => {
        if (filter === 'CUSTOM' && !isCustom(row)) {
          return false;
        }
        if (filter === 'SENSITIVE' && !row.catalog.isSensitive) {
          return false;
        }
        if (!q) {
          return true;
        }
        return (
          this.humanPermName(row.catalog).toLowerCase().includes(q) ||
          this.humanPermDescription(row.catalog).toLowerCase().includes(q) ||
          row.catalog.name.toLowerCase().includes(q) ||
          row.catalog.description.toLowerCase().includes(q) ||
          groupTitle.includes(q)
        );
      });
      if (rows.length > 0) {
        out.push({ groupKey: group.groupKey, rows });
      }
    }
    return out;
  }

  humanPermName(item: PermissionCatalogItem): string {
    return resolveHumanPermissionName(item.code, item.name);
  }

  humanPermDescription(item: PermissionCatalogItem): string {
    return resolveHumanPermissionDescription(item.code, item.description);
  }

  matrixRowStatus(row: MatrixRowView): {
    label: string;
    cssClass: string;
    tooltip: string;
  } {
    if (row.entry.blockedByDisabledModule) {
      return {
        label: 'Módulo inactivo',
        cssClass: 'is-blocked',
        tooltip: 'El módulo al que pertenece este permiso está desactivado',
      };
    }
    if (row.currentSelection === 'DENY') {
      return {
        label: 'Bloqueado',
        cssClass: 'is-blocked',
        tooltip: 'Restringido manualmente para este cargo en el colegio',
      };
    }
    if (row.currentSelection === 'ALLOW') {
      return {
        label: 'Con acceso',
        cssClass: 'is-allowed',
        tooltip: 'Permitido manualmente para este cargo en el colegio',
      };
    }
    return row.entry.defaultGranted
      ? {
          label: 'Con acceso',
          cssClass: 'is-allowed',
          tooltip: 'Incluido por defecto en la configuración base MEN',
        }
      : {
          label: 'Sin acceso',
          cssClass: 'is-denied',
          tooltip: 'No incluido por defecto en este rol según base MEN',
        };
  }

  overrideRowStatus(row: OverrideRowView): {
    label: string;
    cssClass: string;
    tooltip: string;
  } {
    if (row.entry.blockedByDisabledModule) {
      return {
        label: 'Módulo inactivo',
        cssClass: 'is-blocked',
        tooltip: 'El módulo al que pertenece este permiso está desactivado',
      };
    }
    if (row.currentSelection === 'DENY') {
      return {
        label: 'Bloqueado',
        cssClass: 'is-blocked',
        tooltip: 'Restringido puntualmente para este usuario',
      };
    }
    if (row.currentSelection === 'ALLOW') {
      return {
        label: 'Con acceso',
        cssClass: 'is-allowed',
        tooltip: 'Autorizado puntualmente para este usuario',
      };
    }
    return row.entry.roleEffectiveGranted
      ? {
          label: 'Con acceso',
          cssClass: 'is-allowed',
          tooltip: 'Heredado automáticamente porque su rol lo tiene permitido',
        }
      : {
          label: 'Sin acceso',
          cssClass: 'is-denied',
          tooltip: 'Heredado del rol actual (no habilitado para su cargo)',
        };
  }

  private buildModuleSummaries<TRow>(
    groups: ReadonlyArray<{ groupKey: string; rows: TRow[] }>,
    isActive: (row: TRow) => boolean,
    isCustom: (row: TRow) => boolean,
    isPending: (row: TRow) => boolean,
  ): ModuleNavSummary[] {
    return groups.map((g) => ({
      groupKey: g.groupKey,
      label: this.groupLabel(g.groupKey),
      icon: this.moduleIcon(g.groupKey),
      total: g.rows.length,
      activeCount: g.rows.filter(isActive).length,
      customizedCount: g.rows.filter(isCustom).length,
      pendingCount: g.rows.filter(isPending).length,
    }));
  }

  private resolveActiveModuleKey<TRow>(
    groups: ReadonlyArray<{ groupKey: string; rows: TRow[] }>,
    chosenKey: string,
  ): string {
    if (groups.length === 0) {
      return '';
    }
    return groups.some((g) => g.groupKey === chosenKey)
      ? chosenKey
      : groups[0].groupKey;
  }

  roleLabel(role: CommunityRole): string {
    return COMMUNITY_ROLE_LABELS[role] ?? role;
  }

  roleHint(role: CommunityRole): string {
    return ROLE_DESCRIPTIONS[role] ?? '';
  }

  groupLabel(groupKey: string): string {
    return MODULE_GROUP_LABELS[groupKey] ?? groupKey;
  }

  moduleIcon(groupKey: string): string {
    return MODULE_GROUP_ICONS[groupKey] ?? 'extension';
  }

  roleBadgeClass(role: CommunityRole, isActive: boolean): string {
    if (!isActive) {
      return 'is-suspended';
    }
    switch (role) {
      case 'RECTOR':
        return 'is-rector';
      case 'SECRETARY':
        return 'is-secretary';
      case 'COORDINATOR':
        return 'is-coordinator';
      case 'SCHOOL_ADMIN':
      case 'SUPER_ADMIN':
        return 'is-admin';
      case 'TEACHER':
        return 'is-teacher';
      default:
        return 'is-neutral';
    }
  }

  formatUserIdentityLine(user: SchoolUserMembershipItem): string {
    const email = user.email?.trim() ?? '';
    if (!email || email.toLowerCase() === user.username.trim().toLowerCase()) {
      return user.username;
    }
    return `${user.username} · ${email}`;
  }

  loadSummary(): void {
    this.rbacService.getMembershipsSummary().subscribe({
      next: (data) => this.summary.set(data),
    });
  }

  selectAudience(audience: RbacMembershipAudience): void {
    this.activeAudience.set(audience);
    this.activeRoleFilter.set('');
    this.reloadMembershipsGrid();
  }

  selectDirectiveRole(role: CommunityRole): void {
    if (this.activeRoleFilter() === role) {
      this.activeRoleFilter.set('');
      this.activeAudience.set('DIRECTIVES');
    } else {
      this.activeAudience.set('DIRECTIVES');
      this.activeRoleFilter.set(role);
    }
    this.reloadMembershipsGrid();
  }

  clearGridFilters(): void {
    this.activeAudience.set('DIRECTIVES');
    this.activeRoleFilter.set('');
    if (this._membershipsGrid) {
      this._membershipsGrid.onLoad(this.buildGridBaseParams(), false);
      this._membershipsGrid.clearFilters();
    }
  }

  exportCurrentPage(): void {
    exportGridRowsToExcel(
      this.membershipRows,
      this.exportColumns,
      'usuarios-roles-rbac',
    );
  }

  onGridLoadError(): void {
    this.messages.showError(
      'No fue posible cargar el listado de usuarios y roles.',
    );
  }

  private buildGridBaseParams(): Record<string, string> {
    const params: Record<string, string> = {
      paginated: '1',
      audience: this.activeAudience(),
    };
    const role = this.activeRoleFilter();
    if (role) {
      params['role'] = role;
    }
    return params;
  }

  private scheduleGridLoad(force: boolean): void {
    if (!this._membershipsGrid) {
      return;
    }
    if (this.gridLoadTimer !== null) {
      clearTimeout(this.gridLoadTimer);
      this.gridLoadTimer = null;
    }
    // Fija parámetros base antes de que el ciclo inicial del grid dispare peticiones sin filtro
    this._membershipsGrid.onLoad(this.buildGridBaseParams(), false);
    this.gridLoadTimer = setTimeout(() => {
      this.gridLoadTimer = null;
      this._membershipsGrid?.onLoad(this.buildGridBaseParams(), force);
    });
  }

  private reloadMembershipsGrid(): void {
    this._membershipsGrid?.onLoad(this.buildGridBaseParams(), true);
  }

  // Modal de asignación de rol
  openAssignRoleModal(presetUser?: SchoolUserMembershipItem): void {
    if (presetUser) {
      this.assignTargetUser.set(presetUser);
      this.assignRole.set(this.pickSuggestedNextRole(presetUser));
    } else {
      this.assignTargetUser.set(null);
      const activeRole = this.activeRoleFilter();
      this.assignRole.set(
        activeRole && this.assignableRoles().includes(activeRole)
          ? activeRole
          : 'COORDINATOR',
      );
      this.assignSearchTerm.set('');
      this.assignSearch$.next('');
    }
    this.assignModalOpen.set(true);
  }

  private pickSuggestedNextRole(user: SchoolUserMembershipItem): CommunityRole {
    const owned = new Set(user.memberships.map((m) => m.role));
    const priority: CommunityRole[] = [
      'COORDINATOR',
      'SECRETARY',
      'RECTOR',
      'SCHOOL_ADMIN',
      'TEACHER',
    ];
    return priority.find((r) => !owned.has(r)) ?? 'COORDINATOR';
  }

  onAssignSearchInput(value: string): void {
    this.assignSearchTerm.set(value);
    this.assignSearch$.next(value);
  }

  selectAssignCandidate(candidate: SchoolUserMembershipItem): void {
    this.assignTargetUser.set(candidate);
    this.assignRole.set(this.pickSuggestedNextRole(candidate));
  }

  resetAssignTargetUser(): void {
    this.assignTargetUser.set(null);
    this.assignSearchTerm.set('');
    this.assignSearch$.next('');
  }

  submitAssignMembership(): void {
    const target = this.assignTargetUser();
    const role = this.assignRole();
    const identifier = this.assignSearchTerm().trim();
    if (!role || (!target && identifier.length < 3)) {
      return;
    }

    this.assigningMembership.set(true);
    this.rbacService
      .assignMembership(
        target ? { userId: target.userId, role } : { identifier, role },
      )
      .pipe(finalize(() => this.assigningMembership.set(false)))
      .subscribe({
        next: () => {
          this.messages.showSuccess(
            `Rol ${this.roleLabel(role)} asignado correctamente.`,
          );
          this.assignModalOpen.set(false);
          this.loadSummary();
          this.reloadMembershipsGrid();
        },
      });
  }

  toggleMembership(membershipId: number, nextActive: boolean): void {
    this.rbacService.toggleMembership(membershipId, nextActive).subscribe({
      next: (res) => {
        this.messages.showSuccess(
          nextActive
            ? 'Rol reactivado en la institución.'
            : `Rol suspendido (${res.sessionsRevoked} sesión(es) revocadas).`,
        );
        this.loadSummary();
        this.reloadMembershipsGrid();
      },
    });
  }

  removeMembership(
    membershipId: number,
    fullName: string,
    role: CommunityRole,
  ): void {
    void this.messages
      .showConfirm({
        title: 'Retirar rol institucional',
        message: `¿Seguro que deseas retirar el rol ${this.roleLabel(role)} a ${fullName}? Sus sesiones activas serán cerradas.`,
      })
      .then((res) => {
        if (!res.isConfirmed) {
          return;
        }
        this.rbacService.removeMembership(membershipId).subscribe({
          next: () => {
            this.messages.showSuccess('Rol retirado correctamente.');
            this.loadSummary();
            this.reloadMembershipsGrid();
          },
        });
      });
  }

  getEditableRoleForUser(user: SchoolUserMembershipItem): CommunityRole | null {
    const found = user.memberships.find((m) => m.role !== 'SUPER_ADMIN');
    return found?.role ?? null;
  }

  openUserOverrides(user: SchoolUserMembershipItem): void {
    const role = this.getEditableRoleForUser(user);
    if (!role) {
      return;
    }
    this.activeTab.set('overrides');
    if (!this.matrixPayload()) {
      this.loadMatrix();
    }
    this.selectedOverrideUser.set(user);
    this.selectedOverrideRole.set(role);
    this.pendingOverrideChanges.set({});
    this.overrideSearch.set('');
    this.overrideFilter.set('ALL');
    this.loadUserOverrides(user.userId, role);
  }

  loadMatrix(): void {
    this.loadingMatrix.set(true);
    this.rbacService
      .getRolesMatrix()
      .pipe(finalize(() => this.loadingMatrix.set(false)))
      .subscribe({
        next: (data) => {
          this.matrixPayload.set(data);
          this.pendingRoleChanges.set({});
        },
      });
  }

  selectMatrixRole(role: CommunityRole): void {
    this.selectedMatrixRole.set(role);
    this.pendingRoleChanges.set({});
  }

  clearMatrixFilters(): void {
    this.matrixSearch.set('');
    this.matrixFilter.set('ALL');
  }

  setRoleEffect(code: string, effect: 'ALLOW' | 'DENY' | 'DEFAULT'): void {
    const payload = this.matrixPayload();
    const role = this.selectedMatrixRole();
    const original = payload?.matrixByRole[role]?.find(
      (e) => e.permissionCode === code,
    );
    const baseline = original?.schoolEffect ?? 'DEFAULT';

    this.pendingRoleChanges.update((current) => {
      const next = { ...current };
      if (effect === baseline) {
        delete next[code];
      } else {
        next[code] = effect;
      }
      return next;
    });
  }

  saveMatrixChanges(): void {
    const pending = this.pendingRoleChanges();
    const changes = Object.entries(pending).map(([permissionCode, effect]) => ({
      permissionCode,
      effect,
    }));
    if (changes.length === 0) {
      return;
    }
    this.savingMatrix.set(true);
    this.rbacService
      .updateRoleMatrix(this.selectedMatrixRole(), changes)
      .pipe(finalize(() => this.savingMatrix.set(false)))
      .subscribe({
        next: () => {
          this.messages.showSuccess(
            `Matriz de permisos actualizada para ${this.roleLabel(this.selectedMatrixRole())}.`,
          );
          this.loadMatrix();
          this.v3Auth.fetchAuthenticatedProfile().subscribe();
        },
      });
  }

  resetSelectedRoleToDefaults(): void {
    const role = this.selectedMatrixRole();
    void this.messages
      .showConfirm({
        title: 'Restablecer configuración MEN',
        message: `¿Restablecer todos los permisos del rol ${this.roleLabel(role)} a los valores por defecto del MEN?`,
      })
      .then((res) => {
        if (!res.isConfirmed) {
          return;
        }
        this.savingMatrix.set(true);
        this.rbacService
          .resetRoleMatrix(role)
          .pipe(finalize(() => this.savingMatrix.set(false)))
          .subscribe({
            next: () => {
              this.messages.showSuccess(
                `Rol ${this.roleLabel(role)} restablecido a la configuración MEN.`,
              );
              this.loadMatrix();
              this.v3Auth.fetchAuthenticatedProfile().subscribe();
            },
          });
      });
  }

  // Tab 3: Búsqueda y manejo de excepciones por usuario
  private loadQuickOverrideUsers(): void {
    this.rbacService
      .searchMemberships({ audience: 'EXCEPTIONS', limit: 6 })
      .pipe(
        switchMap((excUsers) =>
          excUsers.length >= 6
            ? of(excUsers)
            : this.rbacService
                .searchMemberships({ audience: 'DIRECTIVES', limit: 6 })
                .pipe(
                  switchMap((dirUsers) => {
                    const seen = new Set(excUsers.map((u) => u.userId));
                    const merged = [
                      ...excUsers,
                      ...dirUsers.filter((u) => !seen.has(u.userId)),
                    ].slice(0, 6);
                    return of(merged);
                  }),
                ),
        ),
        catchError(() => of([])),
      )
      .subscribe((users) => this.quickOverrideUsers.set(users));
  }

  onOverrideUserQueryInput(query: string): void {
    this.overrideUserQuery.set(query);
    if (query.trim().length < 2) {
      this.overrideUserSuggestions.set([]);
    }
    this.overrideSearch$.next(query);
  }

  selectOverrideUser(user: SchoolUserMembershipItem): void {
    this.selectedOverrideUser.set(user);
    this.overrideUserQuery.set('');
    this.overrideUserSuggestions.set([]);
    this.pendingOverrideChanges.set({});
    const roles = this.selectedOverrideUserRoles();
    if (roles.length > 0) {
      this.selectedOverrideRole.set(roles[0]);
      this.loadUserOverrides(user.userId, roles[0]);
    } else {
      this.selectedOverrideRole.set(null);
      this.userOverrides.set([]);
    }
  }

  clearOverrideUserSelection(): void {
    this.selectedOverrideUser.set(null);
    this.selectedOverrideRole.set(null);
    this.userOverrides.set([]);
    this.pendingOverrideChanges.set({});
    this.overrideSearch.set('');
    this.overrideFilter.set('ALL');
    if (this.quickOverrideUsers().length === 0) {
      this.loadQuickOverrideUsers();
    }
  }

  clearOverrideFilters(): void {
    this.overrideSearch.set('');
    this.overrideFilter.set('ALL');
  }

  onOverrideRoleSelected(role: CommunityRole): void {
    this.selectedOverrideRole.set(role);
    this.pendingOverrideChanges.set({});
    const user = this.selectedOverrideUser();
    if (user && role) {
      this.loadUserOverrides(user.userId, role);
    }
  }

  loadUserOverrides(userId: number, role: CommunityRole): void {
    this.loadingOverrides.set(true);
    this.rbacService
      .getUserOverrides(userId, role)
      .pipe(finalize(() => this.loadingOverrides.set(false)))
      .subscribe({
        next: (res) => {
          this.userOverrides.set(res.overrides);
          this.pendingOverrideChanges.set({});
        },
      });
  }

  setUserOverrideEffect(
    code: string,
    effect: 'ALLOW' | 'DENY' | 'INHERIT',
  ): void {
    const original = this.userOverrides().find((o) => o.permissionCode === code);
    const baseline = original?.userEffect ?? 'INHERIT';
    this.pendingOverrideChanges.update((current) => {
      const next = { ...current };
      if (effect === baseline) {
        delete next[code];
      } else {
        next[code] = effect;
      }
      return next;
    });
  }

  saveUserOverrides(): void {
    const user = this.selectedOverrideUser();
    const role = this.selectedOverrideRole();
    const pending = this.pendingOverrideChanges();
    const changes = Object.entries(pending).map(([permissionCode, effect]) => ({
      permissionCode,
      effect,
    }));
    if (!user || !role || changes.length === 0) {
      return;
    }
    this.savingOverrides.set(true);
    this.rbacService
      .updateUserOverrides(user.userId, role, changes)
      .pipe(finalize(() => this.savingOverrides.set(false)))
      .subscribe({
        next: () => {
          this.messages.showSuccess(
            'Excepciones individuales guardadas correctamente.',
          );
          this.loadUserOverrides(user.userId, role);
          this.loadSummary();
          this.loadQuickOverrideUsers();
          this.v3Auth.fetchAuthenticatedProfile().subscribe();
        },
      });
  }
}
