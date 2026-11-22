import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  DashboardStatisticsResponse,
  V3AdministrationService,
} from '../../services/v3-administration.service';
import { V3UnifiedAuthService } from '../../services/v3-unified-auth.service';
import { RBAC_PERMISSIONS } from '../../shared/constants/rbac-permissions.constants';
import { CustomTooltipDirective } from '../../shared/directives/custom-tooltip.directive';

type AdminKpiKey =
  | 'totalCampuses'
  | 'activeTeachers'
  | 'activeStaff'
  | 'totalGroups';

interface AdminModuleCard {
  readonly title: string;
  readonly description: string;
  readonly icon: string;
  readonly route: string;
  readonly accentClass: string;
  readonly kpiKey?: AdminKpiKey;
  readonly kpiUnit?: string;
  readonly anyPermissions: readonly string[];
}

interface AdminExecutiveKpiCard {
  readonly label: string;
  readonly kpiKey: AdminKpiKey;
  readonly icon: string;
  readonly route: string;
  readonly accentClass: string;
  readonly hint: string;
  readonly anyPermissions: readonly string[];
}

/**
 * Panel principal del Módulo Administrativo (reemplaza AdminContainer.js de ExtJS).
 */
@Component({
  selector: 'app-admin-hub',
  standalone: true,
  imports: [CommonModule, RouterLink, CustomTooltipDirective],
  template: `
    <div class="container-fluid py-3">
      <div class="breadcrumb-card mb-25 d-md-flex align-items-center justify-content-between">
        <div>
          <h5 class="mb-0 fw-bold">Módulo Administrativo</h5>
          <small class="text-muted">
            {{ v3Auth.activeSchoolName() }} · Año lectivo {{ v3Auth.academicYear() }}
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
            Administrativo
          </li>
        </ol>
      </div>

      @if (showExecutiveKpis()) {
        <div class="row g-3 mb-4">
          @for (kpi of visibleKpiCards(); track kpi.kpiKey) {
            <div class="col-6 col-xl-3">
              <a
                [routerLink]="kpi.route"
                class="text-decoration-none d-block h-100"
                [appCustomTooltip]="'Ir a ' + kpi.label"
              >
                <div class="v3-kpi-card p-3 h-100 d-flex align-items-center gap-3">
                  <span class="v3-kpi-icon" [ngClass]="kpi.accentClass">
                    <i class="material-symbols-outlined">{{ kpi.icon }}</i>
                  </span>
                  <div class="min-w-0">
                    <span class="text-muted small d-block text-truncate">{{ kpi.label }}</span>
                    <div class="fs-4 fw-bold lh-sm">
                      @if (loadingStats()) {
                        <span class="placeholder col-4 rounded"></span>
                      } @else {
                        {{ kpiValue(kpi.kpiKey) ?? '—' }}
                      }
                    </div>
                    <small class="text-muted">{{ kpi.hint }}</small>
                  </div>
                </div>
              </a>
            </div>
          }
        </div>
      }

      <div class="row g-4">
        @for (card of visibleModuleCards(); track card.route) {
          <div class="col-md-6 col-xl-4">
            <a
              [routerLink]="card.route"
              class="text-decoration-none d-block h-100"
              [appCustomTooltip]="'Abrir ' + card.title"
            >
              <div class="v3-hub-card p-4 h-100 d-flex flex-column justify-content-between">
                <div>
                  <div class="d-flex align-items-center justify-content-between gap-2 mb-3">
                    <div class="d-flex align-items-center gap-3 min-w-0">
                      <span class="v3-kpi-icon" [ngClass]="card.accentClass">
                        <i class="material-symbols-outlined">{{ card.icon }}</i>
                      </span>
                      <h5 class="mb-0 fw-semibold">{{ card.title }}</h5>
                    </div>
                    @if (card.kpiKey && kpiValue(card.kpiKey) !== null) {
                      <span class="badge bg-primary-transparent text-primary rounded-pill flex-shrink-0">
                        {{ kpiValue(card.kpiKey) }} {{ card.kpiUnit }}
                      </span>
                    }
                  </div>
                  <p class="text-muted small mb-0">{{ card.description }}</p>
                </div>
                <div class="mt-3 pt-2 border-top d-flex align-items-center justify-content-between text-primary small fw-semibold">
                  <span>Ingresar al módulo</span>
                  <i class="material-symbols-outlined fs-6">arrow_forward</i>
                </div>
              </div>
            </a>
          </div>
        }
      </div>
    </div>
  `,
})
export class AdminHubComponent {
  protected readonly v3Auth = inject(V3UnifiedAuthService);
  private readonly adminService = inject(V3AdministrationService);

  readonly loadingStats = signal(false);
  readonly stats = signal<DashboardStatisticsResponse | null>(null);

  private readonly allKpiCards: readonly AdminExecutiveKpiCard[] = [
    {
      label: 'Sedes Educativas',
      kpiKey: 'totalCampuses',
      icon: 'location_city',
      route: '/admin/campuses',
      accentClass: 'kpi-secondary',
      hint: 'Registradas en el plantel',
      anyPermissions: [RBAC_PERMISSIONS.ADMIN_CAMPUSES_VIEW],
    },
    {
      label: 'Docentes Activos',
      kpiKey: 'activeTeachers',
      icon: 'school',
      route: '/admin/teachers',
      accentClass: 'kpi-success',
      hint: 'Vinculados vigentes',
      anyPermissions: [RBAC_PERMISSIONS.ADMIN_TEACHERS_VIEW],
    },
    {
      label: 'Directivos y Admin.',
      kpiKey: 'activeStaff',
      icon: 'badge',
      route: '/admin/staff',
      accentClass: 'kpi-purple',
      hint: 'Equipo directivo y apoyo',
      anyPermissions: [RBAC_PERMISSIONS.ADMIN_STAFF_VIEW],
    },
    {
      label: 'Grupos Activos',
      kpiKey: 'totalGroups',
      icon: 'groups',
      route: '/admin/group-managers',
      accentClass: 'kpi-warning',
      hint: 'Con y sin director asignado',
      anyPermissions: [RBAC_PERMISSIONS.ADMIN_GROUP_MANAGERS_VIEW],
    },
  ];

  private readonly allModuleCards: readonly AdminModuleCard[] = [
    {
      title: 'Datos del Plantel',
      description:
        'Información oficial de la institución, código DANE, NIT, rector, secretaría, encabezados de reportes y logo institucional.',
      icon: 'domain',
      route: '/admin/school',
      accentClass: 'kpi-primary',
      anyPermissions: [RBAC_PERMISSIONS.ADMIN_SCHOOL_VIEW],
    },
    {
      title: 'Sedes Educativas',
      description:
        'Gestión de sedes, ubicación DANE, zona geográfica y vinculación de jornadas y niveles educativos por sede.',
      icon: 'location_city',
      route: '/admin/campuses',
      accentClass: 'kpi-secondary',
      kpiKey: 'totalCampuses',
      kpiUnit: 'sedes',
      anyPermissions: [RBAC_PERMISSIONS.ADMIN_CAMPUSES_VIEW],
    },
    {
      title: 'Personal Docente',
      description:
        'Directorio completo de docentes, escalafón, formación académica, área de enseñanza y documentos digitales de vinculación.',
      icon: 'school',
      route: '/admin/teachers',
      accentClass: 'kpi-success',
      kpiKey: 'activeTeachers',
      kpiUnit: 'activos',
      anyPermissions: [RBAC_PERMISSIONS.ADMIN_TEACHERS_VIEW],
    },
    {
      title: 'Personal Administrativo',
      description:
        'Registro de directivos y administrativos, nivel jerárquico, carrera administrativa, vinculación y documentos digitales.',
      icon: 'badge',
      route: '/admin/staff',
      accentClass: 'kpi-purple',
      kpiKey: 'activeStaff',
      kpiUnit: 'activos',
      anyPermissions: [RBAC_PERMISSIONS.ADMIN_STAFF_VIEW],
    },
    {
      title: 'Directores de Grupo',
      description:
        'Asignación anual de directores de grupo por sede, jornada, grado y grupo, con generación de informe oficial.',
      icon: 'groups',
      route: '/admin/group-managers',
      accentClass: 'kpi-warning',
      kpiKey: 'totalGroups',
      kpiUnit: 'grupos',
      anyPermissions: [RBAC_PERMISSIONS.ADMIN_GROUP_MANAGERS_VIEW],
    },
    {
      title: 'Usuarios, Roles y Permisos',
      description:
        'Administración granular de accesos por rol (Rector, Coordinador, Secretaría, Docente), accesos por cargo y permisos especiales.',
      icon: 'admin_panel_settings',
      route: '/admin/roles-permissions',
      accentClass: 'kpi-primary',
      anyPermissions: [
        RBAC_PERMISSIONS.IAM_MEMBERSHIPS_VIEW,
        RBAC_PERMISSIONS.IAM_RBAC_MANAGE,
      ],
    },
  ];

  readonly showExecutiveKpis = computed(
    () =>
      this.v3Auth.hasPermission(RBAC_PERMISSIONS.DASHBOARD_EXECUTIVE_VIEW) &&
      this.visibleKpiCards().length > 0,
  );

  readonly visibleKpiCards = computed(() =>
    this.allKpiCards.filter((card) =>
      this.v3Auth.hasAnyPermission(card.anyPermissions),
    ),
  );

  readonly visibleModuleCards = computed(() =>
    this.allModuleCards.filter((card) =>
      this.v3Auth.hasAnyPermission(card.anyPermissions),
    ),
  );

  constructor() {
    effect((onCleanup) => {
      const canView = this.v3Auth.hasPermission(
        RBAC_PERMISSIONS.DASHBOARD_EXECUTIVE_VIEW,
      );
      const academicYear = this.v3Auth.academicYear();
      if (!canView || !academicYear) {
        this.stats.set(null);
        return;
      }

      this.loadingStats.set(true);
      const sub = this.adminService
        .getDashboardStatistics(academicYear)
        .subscribe({
          next: (res) => {
            this.stats.set(res);
            this.loadingStats.set(false);
          },
          error: () => {
            this.loadingStats.set(false);
          },
        });
      onCleanup(() => sub.unsubscribe());
    });
  }

  kpiValue(key: AdminKpiKey): number | null {
    const kpis = this.stats()?.kpis;
    return kpis ? kpis[key] : null;
  }
}
