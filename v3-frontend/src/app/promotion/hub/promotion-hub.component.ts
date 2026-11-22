import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { V3UnifiedAuthService } from '../../services/v3-unified-auth.service';
import {
  RBAC_MODULES,
  RBAC_PERMISSIONS,
} from '../../shared/constants/rbac-permissions.constants';
import { CustomTooltipDirective } from '../../shared/directives/custom-tooltip.directive';

/**
 * Hub del Módulo Promoción (reemplaza PromocionPanel de ExtJS).
 */
@Component({
  selector: 'app-promotion-hub',
  standalone: true,
  imports: [CommonModule, RouterLink, CustomTooltipDirective],
  template: `
    <div class="container-fluid py-3">
      <div class="breadcrumb-card mb-25 d-md-flex align-items-center justify-content-between">
        <div>
          <h5 class="mb-0 fw-bold">Promoción, Libro Final y Cierre de Año</h5>
          <small class="text-muted">
            {{ v3Auth.activeSchoolName() }} · Año lectivo {{ v3Auth.academicYear() }}
          </small>
        </div>
        <ol class="breadcrumb list-unstyled mt-0 mb-0 p-0">
          <li class="breadcrumb-item d-inline-block position-relative">
            <a routerLink="/dashboard" class="d-inline-block position-relative">Inicio</a>
          </li>
          <li class="breadcrumb-item d-inline-block position-relative">Promoción</li>
        </ol>
      </div>

      <div class="row g-4">
        @for (card of visibleCards(); track card.route) {
          <div class="col-md-6 col-xl-4">
            <a
              [routerLink]="card.route"
              class="text-decoration-none d-block h-100"
              [appCustomTooltip]="'Abrir ' + card.title"
            >
              <div class="v3-hub-card p-4 h-100 d-flex flex-column justify-content-between">
                <div>
                  <span class="v3-kpi-icon mb-3" [ngClass]="card.accent">
                    <i class="material-symbols-outlined">{{ card.icon }}</i>
                  </span>
                  <h5 class="fw-semibold mb-2">{{ card.title }}</h5>
                  <p class="small text-muted mb-0">{{ card.description }}</p>
                </div>
                <div class="mt-3 pt-2 border-top d-flex align-items-center justify-content-between text-primary small fw-semibold">
                  <span>Ingresar</span>
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
export class PromotionHubComponent {
  protected readonly v3Auth = inject(V3UnifiedAuthService);

  private readonly allCards = [
    {
      title: 'Libro Final, Actas y Sábanas',
      description:
        'Cálculo automático del libro final por áreas/asignaturas, edición de estado de promoción, actas, folios de graduación y reportes oficiales.',
      icon: 'auto_stories',
      route: '/promotion/final-book',
      accent: 'kpi-primary',
      anyPermissions: [RBAC_PERMISSIONS.PROMOTION_FINAL_BOOK_VIEW],
      moduleTag: RBAC_MODULES.ACADEMIC_GRADES as string | null,
    },
    {
      title: 'Promoción Anticipada',
      description:
        'Registro de actas de promoción anticipada con traslado opcional de grado/grupo dentro del mismo año lectivo.',
      icon: 'fast_forward',
      route: '/promotion/advance',
      accent: 'kpi-success',
      anyPermissions: [RBAC_PERMISSIONS.PROMOTION_ADVANCE_EXECUTE],
      moduleTag: RBAC_MODULES.ACADEMIC_GRADES as string | null,
    },
    {
      title: 'Matricular Estudiantes Antiguos',
      description:
        'Renovación masiva de matrículas desde el año lectivo anterior hacia el siguiente respetando promoción o repitencia.',
      icon: 'group_add',
      route: '/promotion/enroll-returning',
      accent: 'kpi-secondary',
      anyPermissions: [RBAC_PERMISSIONS.PROMOTION_RETURNING_ENROLL],
      moduleTag: RBAC_MODULES.ENROLLMENTS as string | null,
    },
    {
      title: 'Historial Académico y Certificados',
      description:
        'Consulta histórica multianual de calificaciones y promoción por estudiante, más configuración de encabezados de certificados y actas.',
      icon: 'workspace_premium',
      route: '/promotion/history',
      accent: 'kpi-purple',
      anyPermissions: [
        RBAC_PERMISSIONS.PROMOTION_FINAL_BOOK_VIEW,
        RBAC_PERMISSIONS.PROMOTION_CERTIFICATE_HEADERS_WRITE,
        RBAC_PERMISSIONS.REPORTS_CERTIFICATES_GENERATE,
      ],
      moduleTag: null as string | null,
    },
    {
      title: 'Cierre y Apertura de Año Lectivo',
      description:
        'Cierre formal del año escolar y bloqueo definitivo de todos sus periodos académicos con respaldo RLS.',
      icon: 'lock_clock',
      route: '/promotion/year-closing',
      accent: 'kpi-warning',
      anyPermissions: [RBAC_PERMISSIONS.PROMOTION_YEAR_CLOSE],
      moduleTag: RBAC_MODULES.ACADEMIC_GRADES as string | null,
    },
  ];

  readonly visibleCards = computed(() =>
    this.allCards.filter(
      (c) =>
        (!c.moduleTag || this.v3Auth.hasModule(c.moduleTag)) &&
        this.v3Auth.hasAnyPermission(c.anyPermissions),
    ),
  );
}
