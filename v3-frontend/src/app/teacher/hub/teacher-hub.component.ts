import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { LoadMaskService } from '../../services/common/load-mask.service';
import {
  TeacherCourseSummary,
  V3PortalService,
} from '../../services/v3-portal.service';
import { V3UnifiedAuthService } from '../../services/v3-unified-auth.service';
import { CustomTooltipDirective } from '../../shared/directives/custom-tooltip.directive';

/**
 * Portal Docente Hub (reemplaza PanelDocentes de ExtJS y asaie-teachers).
 */
@Component({
  selector: 'app-teacher-hub',
  standalone: true,
  imports: [CommonModule, RouterLink, CustomTooltipDirective],
  template: `
    <div class="container-fluid py-3">
      <div class="breadcrumb-card mb-25 d-md-flex align-items-center justify-content-between">
        <div>
          <h5 class="mb-0 fw-bold">Portal Docente</h5>
          <small class="text-muted">
            {{ v3Auth.activeSchoolName() }} · Año lectivo {{ academicYear() }} · {{ courses().length }} cursos asignados
          </small>
        </div>
        <ol class="breadcrumb list-unstyled mt-0 mb-0 p-0">
          <li class="breadcrumb-item d-inline-block position-relative">
            <a routerLink="/dashboard" class="d-inline-block position-relative">Inicio</a>
          </li>
          <li class="breadcrumb-item d-inline-block position-relative">Portal Docente</li>
        </ol>
      </div>

      <div class="row g-4 mb-4">
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
                  <span>Ingresar</span>
                  <i class="material-symbols-outlined fs-6">arrow_forward</i>
                </div>
              </div>
            </a>
          </div>
        }
      </div>

      <div class="trezo-card bg-white border-radius p-4 shadow-sm">
        <h6 class="fw-semibold mb-3">Mi Carga Académica ({{ academicYear() }})</h6>
        <div class="table-responsive">
          <table class="table table-hover v3-grid-table mb-0">
            <thead>
              <tr>
                <th>Grado / Grupo</th>
                <th>Asignatura</th>
                <th>Sede / Jornada</th>
                <th>Docente</th>
                <th class="text-center">IHS</th>
                <th class="text-center">Estudiantes</th>
              </tr>
            </thead>
            <tbody>
              @for (c of courses(); track c.id) {
                <tr>
                  <td><span class="badge text-bg-primary">{{ c.gradeName }}-{{ c.groupCode }}</span></td>
                  <td class="fw-semibold">{{ c.subjectName }} <small class="text-muted">({{ c.academicAreaName }})</small></td>
                  <td class="small">{{ c.campusName }} · {{ c.shiftName }}</td>
                  <td class="small">{{ c.teacherName }}</td>
                  <td class="text-center">{{ c.weeklyHours }} h</td>
                  <td class="text-center fw-bold">{{ c.enrolledStudentsCount }}</td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="text-center text-muted py-4">No hay cursos asignados en {{ academicYear() }}.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class TeacherHubComponent implements OnInit {
  private readonly portalService = inject(V3PortalService);
  protected readonly v3Auth = inject(V3UnifiedAuthService);
  private readonly loadMask = inject(LoadMaskService);

  readonly academicYear = computed(() => this.v3Auth.academicYear());
  readonly courses = signal<TeacherCourseSummary[]>([]);

  readonly cards = [
    {
      title: 'Planilla de Notas y Preinformes',
      description:
        'Calificación interactiva por dimensiones, guardado masivo auditado, exportación Excel, preinformes y control de inasistencias.',
      icon: 'edit_note',
      route: '/teacher/gradebook',
      accent: 'kpi-primary',
    },
    {
      title: 'Logros y Planes de Clase',
      description:
        'Banco de logros, indicadores y sugerencias con importación interanual, además de planes de clase y parcelador por unidades.',
      icon: 'fact_check',
      route: '/teacher/planning',
      accent: 'kpi-success',
    },
    {
      title: 'Observador del Estudiante (M1–M5)',
      description:
        'Seguimiento formativo y convivencial completo (fortalezas, dificultades, compromisos y anotaciones Modelo 5).',
      icon: 'assignment_ind',
      route: '/teacher/observer',
      accent: 'kpi-secondary',
    },
    {
      title: 'Aula Virtual (LMS y Clases)',
      description:
        'Actividades con calificación de entregas, evaluaciones en línea con autocalificación en servidor y clases en vivo.',
      icon: 'cast_for_education',
      route: '/teacher/virtual-classroom',
      accent: 'kpi-purple',
    },
  ];

  ngOnInit(): void {
    this.loadMask.show('Cargando cursos docentes...');
    this.portalService
      .listTeacherCourses(this.academicYear())
      .pipe(finalize(() => this.loadMask.hide()))
      .subscribe((rows) => this.courses.set(rows));
  }
}
