import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { V3UnifiedAuthService } from '../../services/v3-unified-auth.service';
import { CustomTooltipDirective } from '../../shared/directives/custom-tooltip.directive';

interface AdminModuleCard {
  readonly title: string;
  readonly description: string;
  readonly icon: string;
  readonly route: string;
  readonly accentClass: string;
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

      <div class="row g-4">
        @for (card of moduleCards; track card.route) {
          <div class="col-md-6 col-xl-4">
            <a
              [routerLink]="card.route"
              class="text-decoration-none d-block h-100"
              [appCustomTooltip]="'Abrir ' + card.title"
            >
              <div class="v3-hub-card p-4 h-100 d-flex flex-column justify-content-between">
                <div>
                  <div class="d-flex align-items-center gap-3 mb-3">
                    <span class="v3-kpi-icon" [ngClass]="card.accentClass">
                      <i class="material-symbols-outlined">{{ card.icon }}</i>
                    </span>
                    <h5 class="mb-0 fw-semibold">{{ card.title }}</h5>
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

  readonly moduleCards: readonly AdminModuleCard[] = [
    {
      title: 'Datos del Plantel',
      description:
        'Información oficial de la institución, código DANE, NIT, rector, secretaría, encabezados de reportes y logo institucional.',
      icon: 'domain',
      route: '/admin/school',
      accentClass: 'kpi-primary',
    },
    {
      title: 'Sedes Educativas',
      description:
        'Gestión de sedes, ubicación DANE, zona geográfica y vinculación de jornadas y niveles educativos por sede.',
      icon: 'location_city',
      route: '/admin/campuses',
      accentClass: 'kpi-secondary',
    },
    {
      title: 'Personal Docente',
      description:
        'Directorio completo de docentes, escalafón, formación académica, área de enseñanza y expediente documental en AWS S3.',
      icon: 'school',
      route: '/admin/teachers',
      accentClass: 'kpi-success',
    },
    {
      title: 'Personal Administrativo',
      description:
        'Registro de directivos y administrativos, nivel jerárquico, carrera administrativa, vinculación y documentos digitales.',
      icon: 'badge',
      route: '/admin/staff',
      accentClass: 'kpi-purple',
    },
    {
      title: 'Directores de Grupo',
      description:
        'Asignación anual de directores de grupo por sede, jornada, grado y grupo, con generación de informe oficial.',
      icon: 'groups',
      route: '/admin/group-managers',
      accentClass: 'kpi-warning',
    },
  ];
}
