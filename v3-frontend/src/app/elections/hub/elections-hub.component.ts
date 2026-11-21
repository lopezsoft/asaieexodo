import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { V3UnifiedAuthService } from '../../services/v3-unified-auth.service';
import { CustomTooltipDirective } from '../../shared/directives/custom-tooltip.directive';

/**
 * Hub del Módulo de Elecciones Escolares y Gobierno Estudiantil (reemplaza PanelVotaciones de ExtJS).
 */
@Component({
  selector: 'app-elections-hub',
  standalone: true,
  imports: [CommonModule, RouterLink, CustomTooltipDirective],
  template: `
    <div class="container-fluid py-3">
      <div class="breadcrumb-card mb-25 d-md-flex align-items-center justify-content-between">
        <div>
          <h5 class="mb-0 fw-bold">Gobierno Escolar y Elecciones Electrónicas</h5>
          <small class="text-muted">
            {{ v3Auth.activeSchoolName() }} · Año lectivo {{ v3Auth.academicYear() }}
          </small>
        </div>
        <ol class="breadcrumb list-unstyled mt-0 mb-0 p-0">
          <li class="breadcrumb-item d-inline-block position-relative">
            <a routerLink="/dashboard" class="d-inline-block position-relative">Inicio</a>
          </li>
          <li class="breadcrumb-item d-inline-block position-relative">Elecciones</li>
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
                  <span>Administrar</span>
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
export class ElectionsHubComponent {
  protected readonly v3Auth = inject(V3UnifiedAuthService);

  readonly cards = [
    {
      title: 'Jornadas, Mesas y Jurados',
      description:
        'Apertura y cierre de jornada electoral, creación de mesas de votación por sede/grado y registro de jurados.',
      icon: 'ballot',
      route: '/elections/control',
      accent: 'kpi-primary',
    },
    {
      title: 'Tarjetón y Candidatos',
      description:
        'Inscripción de candidatos a Personería, Consejo y Contraloría, propuestas, opción de Voto en Blanco y fotografía S3.',
      icon: 'person_add',
      route: '/elections/candidates',
      accent: 'kpi-success',
    },
    {
      title: 'Escrutinio en Tiempo Real',
      description:
        'Resultados en vivo por candidatura, porcentajes de votación, participación electoral y conteo detallado por mesa.',
      icon: 'analytics',
      route: '/elections/results',
      accent: 'kpi-purple',
    },
    {
      title: 'Cabina de Votación',
      description:
        'Vista de tarjetón digital estudiantil con verificación de voto único por candidatura y comprobante inmediato.',
      icon: 'how_to_vote',
      route: '/student/school-elections',
      accent: 'kpi-secondary',
    },
  ];
}
