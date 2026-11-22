import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadMaskService } from '../../services/common/load-mask.service';
import {
  StudentPortalOverview,
  V3PortalService,
} from '../../services/v3-portal.service';
import { V3UnifiedAuthService } from '../../services/v3-unified-auth.service';
import { V3FileManagerModalComponent } from '../../shared/components/v3-file-manager-modal/v3-file-manager-modal.component';
import { CustomTooltipDirective } from '../../shared/directives/custom-tooltip.directive';

/**
 * Portal Estudiantil y Familiar: Resumen Académico, Docentes del Curso e Informes Digitales
 * (reemplaza stub academic-reports y vistas de informes/docentes estudiantiles de ExtJS).
 */
@Component({
  selector: 'app-academic-reports',
  standalone: true,
  imports: [CommonModule, V3FileManagerModalComponent, CustomTooltipDirective],
  template: `
    <div class="container-fluid py-3">
      <div class="breadcrumb-card mb-25 d-md-flex align-items-center justify-content-between">
        <div>
          <h5 class="mb-0 fw-bold">Informes Académicos y Mis Docentes</h5>
          <small class="text-muted">
            {{ auth.activeSchoolName() }} · Año lectivo {{ academicYear() }}
          </small>
        </div>
        <button
          type="button"
          class="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
          [disabled]="!overview()?.studentProfileId"
          (click)="docsModalOpen.set(true)"
          [appCustomTooltip]="
            overview()?.studentProfileId
              ? 'Consultar expediente y documentos digitales del estudiante'
              : 'Disponible cuando exista una ficha estudiantil vinculada'
          "
        >
          <i class="material-symbols-outlined fs-6">folder_shared</i>
          <span>Mis Documentos Digitales</span>
        </button>
      </div>

      @if (overview(); as ov) {
        @if (!ov.enrollmentId) {
          <div class="trezo-card bg-white border-radius p-5 shadow-sm text-center">
            <i class="material-symbols-outlined fs-1 text-muted">assignment</i>
            <h6 class="fw-semibold mt-2">Sin matrícula estudiantil activa para {{ academicYear() }}</h6>
            <p class="small text-muted mb-0">
              Cuando exista una matrícula vinculada a su cuenta podrá consultar sus docentes y boletines.
            </p>
          </div>
        } @else {
          <div class="row g-3 mb-4">
            <div class="col-md-4">
              <div class="trezo-card bg-white border-radius p-4 shadow-sm h-100">
                <small class="text-muted">Estudiante</small>
                <h6 class="fw-bold mb-1 mt-1">{{ ov.studentFullName }}</h6>
                <div class="small text-muted font-monospace">Doc: {{ ov.documentNumber }}</div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="trezo-card bg-white border-radius p-4 shadow-sm h-100">
                <small class="text-muted">Ubicación Académica</small>
                <h6 class="fw-bold mb-1 mt-1">{{ ov.gradeName }} - {{ ov.groupCode }}</h6>
                <div class="small text-muted">{{ ov.campusName }} · {{ ov.shiftName }}</div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="trezo-card bg-white border-radius p-4 shadow-sm h-100">
                <small class="text-muted">Director de Grupo</small>
                <h6 class="fw-bold mb-1 mt-1">{{ ov.homeroomTeacherName || 'Por asignar' }}</h6>
                <div class="small text-muted">{{ ov.courses.length }} asignaturas activas</div>
              </div>
            </div>
          </div>

          <div class="trezo-card bg-white border-radius p-4 shadow-sm">
            <h6 class="fw-semibold mb-3">Asignaturas y Docentes del Curso ({{ academicYear() }})</h6>
            <div class="table-responsive">
              <table class="table table-hover v3-grid-table mb-0">
                <thead>
                  <tr>
                    <th>Área</th>
                    <th>Asignatura</th>
                    <th>Docente</th>
                    <th class="text-center">Intensidad Horaria</th>
                  </tr>
                </thead>
                <tbody>
                  @for (c of ov.courses; track c.courseAssignmentId) {
                    <tr>
                      <td class="small text-muted">{{ c.academicAreaName }}</td>
                      <td class="fw-semibold">{{ c.subjectName }}</td>
                      <td>{{ c.teacherName }}</td>
                      <td class="text-center">{{ c.weeklyHours }} h/sem</td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="4" class="text-center text-muted py-4">No hay carga académica asignada al grupo.</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }
      }

      <app-v3-file-manager-modal
        [open]="docsModalOpen()"
        [heading]="'Documentos Digitales · ' + (overview()?.studentFullName || 'Estudiante')"
        subtitle="Expediente digital enlazado a tu ficha estudiantil"
        category="STUDENT_DOCUMENTS"
        ownerEntityType="STUDENT"
        [ownerEntityId]="overview()?.studentProfileId ?? null"
        [ownerDisplayName]="overview()?.studentFullName ?? null"
        [ownerDocumentNumber]="overview()?.documentNumber ?? null"
        [canUpload]="false"
        [canDelete]="false"
        (closed)="docsModalOpen.set(false)"
      ></app-v3-file-manager-modal>
    </div>
  `,
})
export class AcademicReportsComponent implements OnInit {
  private readonly portalService = inject(V3PortalService);
  protected readonly auth = inject(V3UnifiedAuthService);
  private readonly loadMask = inject(LoadMaskService);

  readonly academicYear = computed(() => this.auth.academicYear());
  readonly overview = signal<StudentPortalOverview | null>(null);
  readonly docsModalOpen = signal(false);

  ngOnInit(): void {
    this.loadMask.show('Cargando información académica...');
    this.portalService
      .getStudentOverview(this.academicYear())
      .pipe(finalize(() => this.loadMask.hide()))
      .subscribe((ov) => this.overview.set(ov));
  }
}
