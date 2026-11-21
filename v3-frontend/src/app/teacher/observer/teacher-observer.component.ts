import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { LoadMaskService } from '../../services/common/load-mask.service';
import { MessagesService } from '../../services/messages.service';
import {
  EnrollmentRecord,
  V3AcademicService,
} from '../../services/v3-academic.service';
import {
  StudentObserverView,
  V3PortalService,
} from '../../services/v3-portal.service';
import {
  ObserverTemplateRecord,
  V3SettingsService,
} from '../../services/v3-settings.service';
import { V3UnifiedAuthService } from '../../services/v3-unified-auth.service';
import { CustomTooltipDirective } from '../../shared/directives/custom-tooltip.directive';

/**
 * Observador del Estudiante (soporta Modelos 1..5 incluyendo CrudObserverView,
 * ObserverForm5 y CrudAnnotationsM5View de asaie-teachers).
 */
@Component({
  selector: 'app-teacher-observer',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CustomTooltipDirective],
  template: `
    <div class="container-fluid py-3">
      <div class="breadcrumb-card mb-25 d-md-flex align-items-center justify-content-between">
        <div>
          <h5 class="mb-0 fw-bold">Observador del Estudiante (Modelos 1–5)</h5>
          <small class="text-muted">Año lectivo {{ academicYear() }} · Seguimiento formativo y convivencial</small>
        </div>
        <ol class="breadcrumb list-unstyled mt-0 mb-0 p-0">
          <li class="breadcrumb-item d-inline-block position-relative">
            <a routerLink="/teacher" class="d-inline-block position-relative">Portal Docente</a>
          </li>
          <li class="breadcrumb-item d-inline-block position-relative">Observador</li>
        </ol>
      </div>

      <div class="trezo-card bg-white border-radius p-4 shadow-sm mb-4">
        <div class="row g-2 align-items-end">
          <div class="col-md-6">
            <label class="form-label small fw-semibold">Seleccionar Estudiante Matriculado *</label>
            <select class="form-select form-select-sm" [(ngModel)]="selectedEnrollmentId" (ngModelChange)="loadObserver()">
              <option [ngValue]="0">Seleccione estudiante...</option>
              @for (e of enrollments(); track e.id) {
                <option [ngValue]="e.id">{{ e.gradeName }}-{{ e.groupCode }} · {{ e.studentFullName }} ({{ e.studentDocumentNumber }})</option>
              }
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label small fw-semibold">Plantilla / Modelo del Observador</label>
            <select class="form-select form-select-sm" [(ngModel)]="observerForm.templateId">
              <option [ngValue]="null">Modelo estándar / Modelo 5</option>
              @for (tpl of templates(); track tpl.id) {
                <option [ngValue]="tpl.id">{{ tpl.name }}</option>
              }
            </select>
          </div>
          <div class="col-md-2 d-grid">
            <button type="button" class="btn btn-sm btn-primary" [disabled]="!selectedEnrollmentId" (click)="saveObserverProfile()">
              Guardar Ficha
            </button>
          </div>
        </div>
      </div>

      @if (observer(); as obs) {
        <div class="row g-4">
          <div class="col-lg-5">
            <div class="trezo-card bg-white border-radius p-4 shadow-sm h-100">
              <h6 class="fw-bold mb-1">{{ obs.studentFullName }}</h6>
              <p class="small text-muted mb-3">Grado {{ obs.gradeName }}-{{ obs.groupCode }} · Año {{ obs.academicYear }}</p>

              <div class="mb-3">
                <label class="form-label small fw-semibold">Fortalezas y Aspectos Positivos</label>
                <textarea rows="3" class="form-control form-control-sm" [(ngModel)]="observerForm.strengths" placeholder="Fortalezas académicas, liderazgo y convivencia..."></textarea>
              </div>
              <div class="mb-3">
                <label class="form-label small fw-semibold">Dificultades / Aspectos por Mejorar</label>
                <textarea rows="3" class="form-control form-control-sm" [(ngModel)]="observerForm.difficulties" placeholder="Oportunidades de mejora..."></textarea>
              </div>
              <div class="mb-3">
                <label class="form-label small fw-semibold">Compromisos Generales (Estudiante / Acudiente)</label>
                <textarea rows="3" class="form-control form-control-sm" [(ngModel)]="observerForm.commitments" placeholder="Acuerdos pedagógicos y convivenciales..."></textarea>
              </div>
              <div class="d-grid">
                <button type="button" class="btn btn-sm btn-primary" (click)="saveObserverProfile()">
                  Actualizar Ficha del Observador
                </button>
              </div>
            </div>
          </div>

          <div class="col-lg-7">
            <div class="trezo-card bg-white border-radius p-4 shadow-sm h-100">
              <h6 class="fw-bold mb-3">Anotaciones y Seguimiento Convivencial (Modelo 5)</h6>

              @if (!obs.id) {
                <div class="alert alert-info small">
                  Guarde primero la ficha del observador para habilitar el registro de anotaciones convivenciales.
                </div>
              } @else {
                <div class="row g-2 mb-4 p-3 rounded bg-light border">
                  <div class="col-md-2">
                    <label class="form-label small fw-semibold">Periodo</label>
                    <select class="form-select form-select-sm" [(ngModel)]="annForm.periodNumber">
                      @for (p of [1, 2, 3, 4]; track p) {
                        <option [ngValue]="p">P{{ p }}</option>
                      }
                    </select>
                  </div>
                  <div class="col-md-3">
                    <label class="form-label small fw-semibold">Clasificación</label>
                    <select class="form-select form-select-sm" [(ngModel)]="annForm.severityLevel">
                      <option value="PRAISE">Felicitación / Mérito</option>
                      <option value="MILD">Situación Tipo I (Leve)</option>
                      <option value="SERIOUS">Situación Tipo II (Grave)</option>
                      <option value="VERY_SERIOUS">Situación Tipo III (Muy Grave)</option>
                    </select>
                  </div>
                  <div class="col-md-3">
                    <label class="form-label small fw-semibold">Fecha</label>
                    <input type="date" class="form-control form-control-sm" [(ngModel)]="annForm.annotationDate" />
                  </div>
                  <div class="col-md-4 d-flex align-items-end">
                    <div class="form-check form-switch">
                      <input class="form-check-input" type="checkbox" id="guardNotif" [(ngModel)]="annForm.guardianNotified" />
                      <label class="form-check-label small" for="guardNotif">Acudiente notificado</label>
                    </div>
                  </div>
                  <div class="col-12">
                    <label class="form-label small fw-semibold">Descripción de los hechos *</label>
                    <textarea rows="2" class="form-control form-control-sm" [(ngModel)]="annForm.situationDescription" placeholder="Relato objetivo de la situación..."></textarea>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label small fw-semibold">Descargos / Versión del Estudiante</label>
                    <input type="text" class="form-control form-control-sm" [(ngModel)]="annForm.studentVersion" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label small fw-semibold">Compromiso Pedagógico</label>
                    <input type="text" class="form-control form-control-sm" [(ngModel)]="annForm.pedagogicalCommitment" />
                  </div>
                  <div class="col-12 text-end">
                    <button
                      type="button"
                      class="btn btn-sm btn-primary"
                      [disabled]="!annForm.situationDescription.trim()"
                      (click)="addAnnotation(obs.id)"
                    >
                      Registrar Anotación
                    </button>
                  </div>
                </div>
              }

              <div class="d-flex flex-column gap-2">
                @for (ann of obs.annotations; track ann.id) {
                  <div class="border rounded p-3">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                      <div>
                        <span
                          class="badge me-1"
                          [ngClass]="{
                            'text-bg-success': ann.severityLevel === 'PRAISE',
                            'text-bg-info': ann.severityLevel === 'MILD',
                            'text-bg-warning': ann.severityLevel === 'SERIOUS',
                            'text-bg-danger': ann.severityLevel === 'VERY_SERIOUS'
                          }"
                        >
                          {{ severityLabel(ann.severityLevel) }}
                        </span>
                        <span class="badge text-bg-light border text-dark me-1">P{{ ann.periodNumber }}</span>
                        <small class="text-muted">{{ ann.annotationDate }}</small>
                      </div>
                      <button type="button" class="btn btn-sm btn-outline-danger" (click)="deleteAnnotation(ann.id)" [appCustomTooltip]="'Eliminar anotación'">
                        <i class="material-symbols-outlined fs-6">delete</i>
                      </button>
                    </div>
                    <p class="small mb-1">{{ ann.situationDescription }}</p>
                    @if (ann.studentVersion) {
                      <div class="small text-muted"><strong>Versión estudiante:</strong> {{ ann.studentVersion }}</div>
                    }
                    @if (ann.pedagogicalCommitment) {
                      <div class="small text-muted"><strong>Compromiso:</strong> {{ ann.pedagogicalCommitment }}</div>
                    }
                    <div class="small text-muted mt-1">
                      Acudiente notificado: <strong>{{ ann.guardianNotified ? 'Sí' : 'No' }}</strong>
                    </div>
                  </div>
                } @empty {
                  <p class="text-center text-muted small py-3 mb-0">Sin anotaciones registradas.</p>
                }
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class TeacherObserverComponent implements OnInit {
  private readonly portalService = inject(V3PortalService);
  private readonly academicService = inject(V3AcademicService);
  private readonly settingsService = inject(V3SettingsService);
  private readonly auth = inject(V3UnifiedAuthService);
  private readonly messages = inject(MessagesService);
  private readonly loadMask = inject(LoadMaskService);

  readonly academicYear = computed(() => this.auth.academicYear());
  readonly enrollments = signal<EnrollmentRecord[]>([]);
  readonly templates = signal<ObserverTemplateRecord[]>([]);
  readonly observer = signal<StudentObserverView | null>(null);

  selectedEnrollmentId = 0;
  observerForm = {
    templateId: null as number | null,
    strengths: '',
    difficulties: '',
    commitments: '',
  };
  annForm = {
    periodNumber: 1,
    severityLevel: 'MILD' as 'PRAISE' | 'MILD' | 'SERIOUS' | 'VERY_SERIOUS',
    annotationDate: new Date().toISOString().slice(0, 10),
    situationDescription: '',
    studentVersion: '',
    pedagogicalCommitment: '',
    guardianNotified: false,
  };

  ngOnInit(): void {
    this.loadMask.show('Cargando estudiantes...');
    forkJoin({
      enrollments: this.academicService.listEnrollments(this.academicYear()),
      templates: this.settingsService.listObserverTemplates(),
    })
      .pipe(finalize(() => this.loadMask.hide()))
      .subscribe({
        next: (res) => {
          this.enrollments.set(res.enrollments);
          this.templates.set(res.templates);
        },
      });
  }

  loadObserver(): void {
    if (!this.selectedEnrollmentId) {
      this.observer.set(null);
      return;
    }
    this.portalService
      .getStudentObserver(Number(this.selectedEnrollmentId), this.academicYear())
      .subscribe((obs) => {
        this.observer.set(obs);
        this.observerForm = {
          templateId: obs.templateId,
          strengths: obs.strengths ?? '',
          difficulties: obs.difficulties ?? '',
          commitments: obs.commitments ?? '',
        };
      });
  }

  saveObserverProfile(): void {
    this.portalService
      .upsertStudentObserver({
        enrollmentId: Number(this.selectedEnrollmentId),
        academicYear: this.academicYear(),
        templateId: this.observerForm.templateId || null,
        strengths: this.observerForm.strengths.trim() || null,
        difficulties: this.observerForm.difficulties.trim() || null,
        commitments: this.observerForm.commitments.trim() || null,
      })
      .subscribe((obs) => {
        this.observer.set(obs);
        this.messages.showSuccess('Ficha del observador guardada.');
      });
  }

  addAnnotation(observerId: number): void {
    this.portalService
      .addObserverAnnotation(observerId, {
        periodNumber: Number(this.annForm.periodNumber),
        severityLevel: this.annForm.severityLevel,
        annotationDate: this.annForm.annotationDate,
        situationDescription: this.annForm.situationDescription.trim(),
        studentVersion: this.annForm.studentVersion.trim() || null,
        pedagogicalCommitment: this.annForm.pedagogicalCommitment.trim() || null,
        guardianNotified: this.annForm.guardianNotified,
      })
      .subscribe(() => {
        this.messages.showSuccess('Anotación registrada en el observador.');
        this.annForm.situationDescription = '';
        this.annForm.studentVersion = '';
        this.annForm.pedagogicalCommitment = '';
        this.loadObserver();
      });
  }

  deleteAnnotation(id: number): void {
    this.portalService.deleteObserverAnnotation(id).subscribe(() => {
      this.messages.showSuccess('Anotación eliminada.');
      this.loadObserver();
    });
  }

  severityLabel(level: string): string {
    switch (level) {
      case 'PRAISE':
        return 'Felicitación';
      case 'MILD':
        return 'Tipo I (Leve)';
      case 'SERIOUS':
        return 'Tipo II (Grave)';
      case 'VERY_SERIOUS':
        return 'Tipo III (Muy Grave)';
      default:
        return level;
    }
  }
}
