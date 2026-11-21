import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { V3UnifiedAuthService } from '../../services/v3-unified-auth.service';
import { CustomTooltipDirective } from '../../shared/directives/custom-tooltip.directive';

/**
 * Hub de Configuraciones Institucionales (reemplaza ConfigPanel.js de ExtJS).
 */
@Component({
  selector: 'app-settings-hub',
  standalone: true,
  imports: [CommonModule, RouterLink, CustomTooltipDirective],
  template: `
    <div class="container-fluid py-3">
      <div class="breadcrumb-card mb-25 d-md-flex align-items-center justify-content-between">
        <div>
          <h5 class="mb-0 fw-bold">Configuraciones Institucionales</h5>
          <small class="text-muted">
            {{ v3Auth.activeSchoolName() }} · Año lectivo {{ v3Auth.academicYear() }}
          </small>
        </div>
        <ol class="breadcrumb list-unstyled mt-0 mb-0 p-0">
          <li class="breadcrumb-item d-inline-block position-relative">
            <a routerLink="/dashboard" class="d-inline-block position-relative">Inicio</a>
          </li>
          <li class="breadcrumb-item d-inline-block position-relative">Configuraciones</li>
        </ol>
      </div>

      <div class="row g-4">
        @for (card of cards; track card.route) {
          <div class="col-md-6 col-xl-3">
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
                  <span>Configurar</span>
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
export class SettingsHubComponent {
  protected readonly v3Auth = inject(V3UnifiedAuthService);

  readonly cards = [
    {
      title: 'Estructura Académica',
      description:
        'Años lectivos, jornadas escolares, niveles educativos, grupos de grados y grados académicos.',
      icon: 'account_tree',
      route: '/settings/structure',
      accent: 'kpi-primary',
    },
    {
      title: 'Evaluación y SIEE',
      description:
        'Reglas generales de promoción, periodos académicos con bloqueo, escala de desempeños, competencias/columnas y limpieza de notas en cero.',
      icon: 'rule',
      route: '/settings/evaluation',
      accent: 'kpi-secondary',
    },
    {
      title: 'Observador del Estudiante',
      description:
        'Plantillas institucionales del observador, secciones o aspectos de convivencia y criterios evaluativos.',
      icon: 'assignment_ind',
      route: '/settings/observer',
      accent: 'kpi-success',
    },
    {
      title: 'Firmas, Boletines y Módulos',
      description:
        'Firmas de rectoría y secretaría, encabezados de informes, configuración de boletines, carnés, marcas de agua S3 y módulos extras.',
      icon: 'draw',
      route: '/settings/branding',
      accent: 'kpi-purple',
    },
  ];
}
