import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { LoadMaskService } from '../../services/common/load-mask.service';
import {
  StudentPortalGradesView,
  V3PortalService,
} from '../../services/v3-portal.service';
import { V3UnifiedAuthService } from '../../services/v3-unified-auth.service';
import {
  SearchableSelectOption,
  V3SearchableSelectComponent,
} from '../../shared/components/v3-searchable-select/v3-searchable-select.component';
import { CustomTooltipDirective } from '../../shared/directives/custom-tooltip.directive';

/**
 * Portal Estudiantil y Familiar: Consulta de Calificaciones, Preinformes y Observador
 * (reemplaza stub academic-notes y el módulo Socket.IO de estudiantes de ExtJS).
 */
@Component({
  selector: 'app-academic-notes',
  standalone: true,
  imports: [CommonModule, FormsModule, V3SearchableSelectComponent, CustomTooltipDirective],
  template: `
    <div class="container-fluid py-3">
      <div class="breadcrumb-card mb-25 d-md-flex align-items-center justify-content-between">
        <div>
          <h5 class="mb-0 fw-bold">Mis Calificaciones y Seguimiento</h5>
          <small class="text-muted">
            {{ auth.activeSchoolName() }} · Año lectivo {{ academicYear() }}
          </small>
        </div>
        <div class="d-flex align-items-center gap-2">
          <app-v3-searchable-select
            size="sm"
            style="min-width: 190px;"
            [(ngModel)]="selectedPeriod"
            [options]="periodOptions"
            placeholder="Filtrar periodo..."
            searchPlaceholder="Buscar periodo..."
            (ngModelChange)="loadGrades()"
          />
          <button
            type="button"
            class="btn btn-sm btn-outline-primary"
            (click)="loadGrades()"
            [appCustomTooltip]="'Actualizar calificaciones'"
          >
            <i class="material-symbols-outlined fs-6 align-middle">refresh</i>
          </button>
        </div>
      </div>

      @if (data(); as d) {
        @if (!d.enrollmentId) {
          <div class="trezo-card bg-white border-radius p-5 shadow-sm text-center">
            <i class="material-symbols-outlined fs-1 text-muted">school</i>
            <h6 class="fw-semibold mt-2">Sin matrícula estudiantil vinculada para {{ academicYear() }}</h6>
            <p class="small text-muted mb-0">
              No se encontró una matrícula activa asociada a esta cuenta en el año lectivo seleccionado.
            </p>
          </div>
        } @else {
          <div class="trezo-card bg-white border-radius p-4 shadow-sm mb-4">
            <h6 class="fw-semibold mb-3">Boletín de Notas en Línea</h6>
            <div class="table-responsive">
              <table class="table table-hover v3-grid-table mb-0">
                <thead>
                  <tr>
                    <th>Per.</th>
                    <th>Área / Asignatura</th>
                    <th>Docente</th>
                    <th class="text-center">Definitiva</th>
                    <th class="text-center">Recup.</th>
                    <th class="text-center">Efectiva</th>
                    <th class="text-center">Faltas</th>
                  </tr>
                </thead>
                <tbody>
                  @for (g of d.grades; track g.id) {
                    <tr>
                      <td><span class="badge text-bg-light border text-dark">P{{ g.periodNumber }}</span></td>
                      <td>
                        <div class="fw-semibold">{{ g.subjectName }}</div>
                        <small class="text-muted">{{ g.academicAreaName }}</small>
                      </td>
                      <td class="small">{{ g.teacherName }}</td>
                      <td class="text-center">{{ g.finalScore }}</td>
                      <td class="text-center">{{ g.recoveryScore }}</td>
                      <td class="text-center fw-bold text-primary">{{ g.effectiveScore }}</td>
                      <td class="text-center small">{{ g.unjustifiedAbsences }}</td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="7" class="text-center text-muted py-4">Aún no hay calificaciones publicadas.</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

          <div class="row g-4">
            <div class="col-lg-6">
              <div class="trezo-card bg-white border-radius p-4 shadow-sm h-100">
                <h6 class="fw-semibold mb-3">Preinformes Preventivos ({{ d.preReports.length }})</h6>
                @for (pr of d.preReports; track $index) {
                  <div class="border rounded p-2 mb-2">
                    <div class="d-flex justify-content-between small">
                      <strong>P{{ pr.periodNumber }} · {{ pr.subjectName }}</strong>
                      <span class="badge text-bg-warning">Parcial: {{ pr.partialScore }}</span>
                    </div>
                    <div class="small text-muted mt-1">{{ pr.observations || 'Sin observaciones.' }}</div>
                  </div>
                } @empty {
                  <p class="text-muted small mb-0">Sin preinformes registrados.</p>
                }
              </div>
            </div>

            <div class="col-lg-6">
              <div class="trezo-card bg-white border-radius p-4 shadow-sm h-100">
                <h6 class="fw-semibold mb-3">Observador del Estudiante ({{ d.observerAnnotations.length }})</h6>
                @for (ann of d.observerAnnotations; track ann.id) {
                  <div class="border rounded p-2 mb-2">
                    <div class="d-flex justify-content-between small">
                      <span class="badge text-bg-info">P{{ ann.periodNumber }} · {{ ann.severityLevel }}</span>
                      <span class="text-muted">{{ ann.annotationDate }}</span>
                    </div>
                    <div class="small mt-1">{{ ann.situationDescription }}</div>
                  </div>
                } @empty {
                  <p class="text-muted small mb-0">Sin anotaciones en el observador.</p>
                }
              </div>
            </div>
          </div>
        }
      }
    </div>
  `,
})
export class AcademicNotesComponent implements OnInit {
  private readonly portalService = inject(V3PortalService);
  protected readonly auth = inject(V3UnifiedAuthService);
  private readonly loadMask = inject(LoadMaskService);

  readonly academicYear = computed(() => this.auth.academicYear());
  readonly data = signal<StudentPortalGradesView | null>(null);
  readonly periodOptions: SearchableSelectOption<number>[] = [
    { value: 0, label: 'Todos los periodos' },
    ...[1, 2, 3, 4].map((p) => ({ value: p, label: `Periodo ${p}` })),
  ];
  selectedPeriod = 0;

  ngOnInit(): void {
    this.loadGrades();
  }

  loadGrades(): void {
    this.loadMask.show('Consultando calificaciones...');
    this.portalService
      .getStudentGrades(this.academicYear(), this.selectedPeriod || undefined)
      .pipe(finalize(() => this.loadMask.hide()))
      .subscribe((res) => this.data.set(res));
  }
}
