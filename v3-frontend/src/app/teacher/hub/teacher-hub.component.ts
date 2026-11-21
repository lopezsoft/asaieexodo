import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { LoadMaskService } from '../../services/common/load-mask.service';
import {
  TeacherCourseSummary,
  TeacherPeriodSummary,
  V3PortalService,
} from '../../services/v3-portal.service';
import { V3UnifiedAuthService } from '../../services/v3-unified-auth.service';
import { CustomTooltipDirective } from '../../shared/directives/custom-tooltip.directive';

/**
 * Portal Docente Hub (paridad 100% con TeachersDashboard, PeriodosDocentesView
 * y AsignacionDocentes de asaie-teachers).
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
            {{ v3Auth.activeSchoolName() }} · Año lectivo {{ academicYear() }} ·
            {{ courses().length }} cursos asignados · {{ activePeriodsCount() }} periodo(s) habilitado(s)
          </small>
        </div>
        <ol class="breadcrumb list-unstyled mt-0 mb-0 p-0">
          <li class="breadcrumb-item d-inline-block position-relative">
            <a routerLink="/dashboard" class="d-inline-block position-relative">Inicio</a>
          </li>
          <li class="breadcrumb-item d-inline-block position-relative">Portal Docente</li>
        </ol>
      </div>

      <div class="row g-3 mb-4">
        @for (card of cards; track card.route) {
          <div class="col-md-6 col-xl-3">
            <a
              [routerLink]="card.route"
              class="text-decoration-none d-block h-100"
              [appCustomTooltip]="'Abrir ' + card.title"
            >
              <div class="v3-hub-card p-3 h-100 d-flex flex-column justify-content-between">
                <div>
                  <span class="v3-kpi-icon mb-2" [ngClass]="card.accent">
                    <i class="material-symbols-outlined">{{ card.icon }}</i>
                  </span>
                  <h6 class="fw-semibold mb-1">{{ card.title }}</h6>
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

      <!-- Periodos Académicos Habilitados (PeriodosDocentesView.js) -->
      <div class="trezo-card bg-white border-radius p-4 shadow-sm mb-4">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h6 class="fw-semibold mb-0">Periodos Académicos y Fechas de Corte ({{ academicYear() }})</h6>
            <small class="text-muted">Calendario oficial para digitación de calificaciones y nivelaciones</small>
          </div>
          <span class="badge text-bg-light border text-dark">{{ periods().length }} periodo(s)</span>
        </div>

        <div class="table-responsive">
          <table class="table table-sm table-hover v3-grid-table mb-0">
            <thead>
              <tr>
                <th>Periodo</th>
                <th>Grupo de Grados</th>
                <th class="text-center">Peso</th>
                <th>Vigencia Periodo</th>
                <th>Ventana Notas</th>
                <th>Ventana Nivelaciones</th>
                <th class="text-center">Estado</th>
              </tr>
            </thead>
            <tbody>
              @for (p of periods(); track p.id) {
                <tr>
                  <td class="fw-semibold">
                    <span class="badge text-bg-primary me-1">P{{ p.periodNumber }}</span>
                    {{ p.name }}
                  </td>
                  <td class="small">{{ p.gradeGroupName || 'Todos los grados' }}</td>
                  <td class="text-center small fw-semibold">{{ p.weightPercentage }}%</td>
                  <td class="small text-nowrap">{{ p.startDate }} → {{ p.endDate }}</td>
                  <td class="small text-nowrap">
                    @if (p.gradingOpenDate || p.gradingCloseDate) {
                      {{ p.gradingOpenDate || '—' }} → {{ p.gradingCloseDate || '—' }}
                    } @else {
                      <span class="text-muted">Según vigencia</span>
                    }
                  </td>
                  <td class="small text-nowrap">
                    @if (p.recoveryOpenDate || p.recoveryCloseDate) {
                      {{ p.recoveryOpenDate || '—' }} → {{ p.recoveryCloseDate || '—' }}
                    } @else {
                      <span class="text-muted">No programada</span>
                    }
                  </td>
                  <td class="text-center">
                    @if (p.isClosed) {
                      <span class="badge text-bg-secondary">Bloqueado</span>
                    } @else if (p.isActive) {
                      <span class="badge text-bg-success">Habilitado</span>
                    } @else {
                      <span class="badge text-bg-warning">Inactivo</span>
                    }
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="text-center text-muted py-3">
                    No hay periodos académicos configurados para {{ academicYear() }}.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Mi Asignación Académica (AsignacionDocentes.js) -->
      <div class="trezo-card bg-white border-radius p-4 shadow-sm">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h6 class="fw-semibold mb-0">Mi Carga Académica ({{ academicYear() }})</h6>
            <small class="text-muted">Acceso directo a planillas, nivelaciones y formato de seguimiento por curso</small>
          </div>
          <span class="badge text-bg-primary">{{ totalHours() }} h semanales</span>
        </div>

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
                <th class="text-end">Accesos Rápidos</th>
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
                  <td class="text-end text-nowrap">
                    <a
                      [routerLink]="['/teacher/gradebook']"
                      [queryParams]="{ courseId: c.id }"
                      class="btn btn-sm btn-outline-primary me-1"
                      [appCustomTooltip]="'Abrir planilla de calificaciones de este curso'"
                    >
                      Notas
                    </a>
                    <a
                      [routerLink]="['/teacher/levelings']"
                      [queryParams]="{ courseId: c.id }"
                      class="btn btn-sm btn-outline-warning me-1"
                      [appCustomTooltip]="'Gestionar nivelaciones de este curso'"
                    >
                      Nivelar
                    </a>
                    <a
                      [routerLink]="['/teacher/tracking']"
                      [queryParams]="{ groupId: c.academicGroupId }"
                      class="btn btn-sm btn-outline-info"
                      [appCustomTooltip]="'Formato de seguimiento del grupo ' + c.gradeName + '-' + c.groupCode"
                    >
                      Seguim.
                    </a>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="text-center text-muted py-4">No hay cursos asignados en {{ academicYear() }}.</td>
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
  readonly periods = signal<TeacherPeriodSummary[]>([]);

  readonly activePeriodsCount = computed(
    () => this.periods().filter((p) => p.isActive && !p.isClosed).length,
  );

  readonly totalHours = computed(() =>
    this.courses().reduce((acc, c) => acc + Number(c.weeklyHours || 0), 0),
  );

  readonly cards = [
    {
      title: 'Notas Académicas y Columnas',
      description:
        'Planilla con columnas dinámicas n1..n30, filtro por sexo, autoguardado, sincronización de logros, Excel, preinformes y ausencias.',
      icon: 'edit_note',
      route: '/teacher/gradebook',
      accent: 'kpi-primary',
    },
    {
      title: 'Descriptores, Sugerencias y Parcelador',
      description:
        'Descriptores multi-escala, banco de sugerencias, importación interanual, parcelador por unidades y plan semanal PDF.',
      icon: 'fact_check',
      route: '/teacher/planning',
      accent: 'kpi-success',
    },
    {
      title: 'Nivelaciones Periódicas y Finales',
      description:
        'Plan de mejoramiento con detección automática de reprobados, validación contra tope institucional y actas PDF.',
      icon: 'published_with_changes',
      route: '/teacher/levelings',
      accent: 'kpi-warning',
    },
    {
      title: 'Observador del Estudiante (M3 y M5)',
      description:
        'Ficha integral Modelo 5 (salud, familia, inclusión/PIAR), matriz de criterios Modelo 3 (N/AV/CS/S), anotaciones y acudientes.',
      icon: 'assignment_ind',
      route: '/teacher/observer',
      accent: 'kpi-secondary',
    },
    {
      title: 'Formato de Seguimiento',
      description:
        'Control grupal de medios de acceso (PV, TV, GW, GF, OT), servicios disponibles (EE, IN, TV, DC) y observaciones.',
      icon: 'checklist',
      route: '/teacher/tracking',
      accent: 'kpi-info',
    },
    {
      title: 'Informes y Boletines Docentes',
      description:
        'Boletines en 6 formatos (grupo o estudiante individual) y los 10 reportes oficiales del docente vía JasperReports + S3.',
      icon: 'print',
      route: '/teacher/reports',
      accent: 'kpi-danger',
    },
    {
      title: 'Aula Virtual (LMS y Material S3)',
      description:
        'Actividades con adjuntos y calificación de entregas, evaluaciones autocalificables, clases en vivo y material educativo S3.',
      icon: 'cast_for_education',
      route: '/teacher/virtual-classroom',
      accent: 'kpi-purple',
    },
    {
      title: 'Mi Perfil y Firma Digital',
      description:
        'Actualización de datos de contacto del docente y gestión de firma digital en AWS S3 para boletines y actas.',
      icon: 'badge',
      route: '/teacher/profile',
      accent: 'kpi-primary',
    },
  ];

  ngOnInit(): void {
    this.loadMask.show('Cargando panel docente...');
    const year = this.academicYear();
    forkJoin({
      courses: this.portalService.listTeacherCourses(year),
      periods: this.portalService.listTeacherPeriods(year),
    })
      .pipe(finalize(() => this.loadMask.hide()))
      .subscribe({
        next: (res) => {
          this.courses.set(res.courses);
          this.periods.set(res.periods);
        },
      });
  }
}
