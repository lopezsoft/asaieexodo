import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { V3UnifiedAuthService } from '../../services/v3-unified-auth.service';
import { CustomTooltipDirective } from '../../shared/directives/custom-tooltip.directive';

/**
 * Hub del Módulo Académico (reemplaza el submenú Académico/Inscripciones/Reportes de ExtJS).
 */
@Component({
  selector: 'app-academic-hub',
  standalone: true,
  imports: [CommonModule, RouterLink, CustomTooltipDirective],
  template: `
    <div class="container-fluid py-3">
      <div class="breadcrumb-card mb-25 d-md-flex align-items-center justify-content-between">
        <div>
          <h5 class="mb-0 fw-bold">Gestión Académica</h5>
          <small class="text-muted">
            {{ v3Auth.activeSchoolName() }} · Año lectivo {{ v3Auth.academicYear() }}
          </small>
        </div>
        <ol class="breadcrumb list-unstyled mt-0 mb-0 p-0">
          <li class="breadcrumb-item d-inline-block position-relative">
            <a routerLink="/dashboard" class="d-inline-block position-relative">Inicio</a>
          </li>
          <li class="breadcrumb-item d-inline-block position-relative">Académico</li>
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
export class AcademicHubComponent {
  protected readonly v3Auth = inject(V3UnifiedAuthService);

  readonly cards = [
    {
      title: 'Currículo y Carga Académica',
      description:
        'Áreas académicas, asignaturas, plan de estudios con intensidad horaria y asignación o traslado masivo de carga docente.',
      icon: 'menu_book',
      route: '/academic/curriculum',
      accent: 'kpi-primary',
    },
    {
      title: 'Inscripciones y Matrículas',
      description:
        'Registro de estudiantes, acudientes/familias, matrículas anuales, novedades de retiro o traslado, documentos S3 y traslado de grupo.',
      icon: 'how_to_reg',
      route: '/academic/enrollments',
      accent: 'kpi-success',
    },
    {
      title: 'Control de Notas y Honor',
      description:
        'Seguimiento de notas reportadas por docente, edición rectoral auditada, transferencia de notas, nivelaciones, cuadro de honor y logros.',
      icon: 'grading',
      route: '/academic/grades-control',
      accent: 'kpi-secondary',
    },
    {
      title: 'Centro de Reportes Oficiales',
      description:
        'Generación asíncrona en PDF/Excel de boletines, consolidados, estadísticas, fichas de matrícula, carnés, listas y constancias.',
      icon: 'description',
      route: '/academic/reports',
      accent: 'kpi-purple',
    },
  ];
}
