import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { LoadMaskService } from '../../services/common/load-mask.service';
import { MessagesService } from '../../services/messages.service';
import {
  StudentProfileRecord,
  V3AcademicService,
} from '../../services/v3-academic.service';
import {
  StudentAcademicHistoryYear,
  V3PromotionService,
} from '../../services/v3-promotion.service';
import { V3UnifiedAuthService } from '../../services/v3-unified-auth.service';
import {
  SearchableSelectOption,
  V3SearchableSelectComponent,
} from '../../shared/components/v3-searchable-select/v3-searchable-select.component';

/**
 * Historial Académico Multianual y Encabezados de Certificados/Actas
 * (reemplaza HistorialAcademicoView, CertificadosView y EncabezadoCertificadoView).
 */
@Component({
  selector: 'app-academic-history',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, V3SearchableSelectComponent],
  template: `
    <div class="container-fluid py-3">
      <div class="breadcrumb-card mb-25 d-md-flex align-items-center justify-content-between">
        <div>
          <h5 class="mb-0 fw-bold">Historial Académico y Encabezados de Certificados</h5>
          <small class="text-muted">Año lectivo {{ academicYear() }}</small>
        </div>
        <ol class="breadcrumb list-unstyled mt-0 mb-0 p-0">
          <li class="breadcrumb-item d-inline-block position-relative">
            <a routerLink="/promotion" class="d-inline-block position-relative">Promoción</a>
          </li>
          <li class="breadcrumb-item d-inline-block position-relative">Historial y Certificados</li>
        </ol>
      </div>

      <div class="row g-4">
        <div class="col-lg-8">
          <div class="trezo-card bg-white border-radius p-4 shadow-sm">
            <h6 class="fw-semibold mb-3">Consulta Histórica por Estudiante</h6>
            <div class="row g-3 align-items-end mb-4">
              <div class="col-12 col-md-6">
                <label class="form-label">Estudiante</label>
                <app-v3-searchable-select
                  [(ngModel)]="selectedStudentId"
                  [options]="studentOptions()"
                  [clearable]="true"
                  placeholder="Seleccione un estudiante..."
                  searchPlaceholder="Buscar por documento o nombre..."
                  (ngModelChange)="loadHistory()"
                />
              </div>
              <div class="col-12 col-md-6 d-flex justify-content-md-end">
                <button
                  type="button"
                  class="btn btn-sm btn-outline-primary"
                  [disabled]="!selectedStudentId"
                  (click)="enqueueCertificate()"
                >
                  Generar Certificado PDF
                </button>
              </div>
            </div>

            @for (yr of history(); track yr.enrollmentId) {
              <div class="border rounded p-3 mb-3">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <div>
                    <span class="badge text-bg-primary me-2">{{ yr.academicYear }}</span>
                    <strong>{{ yr.gradeName }}-{{ yr.groupCode }}</strong>
                    <small class="text-muted ms-2">{{ yr.campusName }} · {{ yr.shiftName }}</small>
                  </div>
                  <div class="text-end">
                    @if (yr.finalAverage !== null) {
                      <span class="badge text-bg-success me-1">Promedio: {{ yr.finalAverage }}</span>
                    }
                    <span class="badge text-bg-light border text-dark">
                      {{ yr.promotionStatusDescription || yr.enrollmentStatusName }}
                    </span>
                  </div>
                </div>
                <div class="table-responsive">
                  <table class="table table-sm mb-0">
                    <thead>
                      <tr>
                        <th>Área</th>
                        <th>Asignatura</th>
                        <th class="text-center">Periodos</th>
                        <th class="text-end">Promedio</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (sub of yr.subjects; track sub.subjectName) {
                        <tr>
                          <td class="small text-muted">{{ sub.academicAreaName }}</td>
                          <td class="fw-medium">{{ sub.subjectName }}</td>
                          <td class="text-center small">{{ sub.periodsCount }}</td>
                          <td class="text-end fw-bold">{{ sub.averageScore }}</td>
                        </tr>
                      } @empty {
                        <tr>
                          <td colspan="4" class="text-center text-muted small">Sin calificaciones consolidadas.</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            } @empty {
              <p class="text-muted text-center py-4 mb-0">Seleccione un estudiante para inspeccionar su trayectoria académica.</p>
            }
          </div>
        </div>

        <div class="col-lg-4">
          <div class="trezo-card bg-white border-radius p-4 shadow-sm">
            <h6 class="fw-semibold mb-3">Encabezados de Certificados y Actas ({{ academicYear() }})</h6>
            <div class="mb-3">
              <label class="form-label small fw-semibold">Título de Certificado</label>
              <input type="text" class="form-control form-control-sm" [(ngModel)]="headerTitle" placeholder="CERTIFICADO DE ESTUDIOS" />
            </div>
            <div class="mb-3">
              <label class="form-label small fw-semibold">Resolución / Texto Legal</label>
              <textarea rows="3" class="form-control form-control-sm" [(ngModel)]="resolutionText" placeholder="Resolución de aprobación oficial..."></textarea>
            </div>
            <div class="mb-3">
              <label class="form-label small fw-semibold">Prefijo de Actas de Graduación / Promoción</label>
              <input type="text" class="form-control form-control-sm" [(ngModel)]="actPrefix" placeholder="ACTA-PROM-2026" />
            </div>
            @if (canEditHeaders()) {
              <div class="d-grid">
                <button type="button" class="btn btn-sm btn-primary" (click)="saveHeaders()">
                  Guardar Encabezados
                </button>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AcademicHistoryComponent implements OnInit {
  private readonly promotionService = inject(V3PromotionService);
  private readonly academicService = inject(V3AcademicService);
  private readonly auth = inject(V3UnifiedAuthService);
  private readonly messages = inject(MessagesService);
  private readonly loadMask = inject(LoadMaskService);

  readonly academicYear = computed(() => this.auth.academicYear());
  readonly canEditHeaders = computed(() =>
    this.auth.hasPermission('promotion.certificate_headers.write'),
  );
  readonly canGenerateCertificate = computed(() =>
    this.auth.hasPermission('reports.certificates.generate'),
  );
  readonly students = signal<StudentProfileRecord[]>([]);
  readonly history = signal<StudentAcademicHistoryYear[]>([]);

  readonly studentOptions = computed<SearchableSelectOption<number>[]>(() =>
    this.students().map((s) => ({ value: s.id, label: `${s.documentNumber} · ${s.fullName}` }))
  );

  selectedStudentId = 0;
  headerTitle = '';
  resolutionText = '';
  actPrefix = '';

  ngOnInit(): void {
    this.loadMask.show('Cargando historial y configuración...');
    forkJoin({
      students: this.academicService.listStudents(undefined, 200),
      headers: this.promotionService.getCertificateHeaders(this.academicYear()),
    })
      .pipe(finalize(() => this.loadMask.hide()))
      .subscribe({
        next: (res) => {
          this.students.set(res.students);
          this.headerTitle = String(res.headers.certificateSettings['headerTitle'] ?? '');
          this.resolutionText = String(res.headers.certificateSettings['resolutionText'] ?? '');
          this.actPrefix = String(res.headers.graduationActSettings['actPrefix'] ?? '');
        },
      });
  }

  loadHistory(): void {
    if (!this.selectedStudentId) {
      this.history.set([]);
      return;
    }
    this.promotionService
      .getAcademicHistory(Number(this.selectedStudentId))
      .subscribe((rows) => this.history.set(rows));
  }

  saveHeaders(): void {
    this.promotionService
      .updateCertificateHeaders({
        academicYear: this.academicYear(),
        certificateSettings: {
          headerTitle: this.headerTitle.trim(),
          resolutionText: this.resolutionText.trim(),
        },
        graduationActSettings: {
          actPrefix: this.actPrefix.trim(),
        },
      })
      .subscribe({
        next: () => this.messages.showSuccess('Encabezados de certificados y actas guardados.'),
      });
  }

  enqueueCertificate(): void {
    this.academicService
      .enqueueJasperReport({
        templateName: 'certificado_calificaciones',
        outputFormat: 'pdf',
        parameters: {
          P_YEAR: this.academicYear(),
          P_STUDENT_ID: this.selectedStudentId,
        },
      })
      .subscribe({
        next: (res) =>
          this.messages.showSuccess(`Certificado PDF encolado (Job #${res.jobId}).`),
      });
  }
}
