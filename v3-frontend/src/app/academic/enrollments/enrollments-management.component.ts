import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { LoadMaskService } from '../../services/common/load-mask.service';
import { MessagesService } from '../../services/messages.service';
import {
  EnrollmentNoveltyRecord,
  EnrollmentRecord,
  FamilyProfileRecord,
  StudentFamilyLinkRecord,
  StudentProfileRecord,
  V3AcademicService,
} from '../../services/v3-academic.service';
import {
  GroupManagerRecord,
  V3AdministrationService,
} from '../../services/v3-administration.service';
import {
  GlobalCatalogsBundle,
  V3CatalogsService,
} from '../../services/v3-catalogs.service';
import { V3UnifiedAuthService } from '../../services/v3-unified-auth.service';
import { V3FileManagerModalComponent } from '../../shared/components/v3-file-manager-modal/v3-file-manager-modal.component';
import { V3ModalDialogComponent } from '../../shared/components/v3-modal-dialog/v3-modal-dialog.component';
import { CustomTooltipDirective } from '../../shared/directives/custom-tooltip.directive';

type EnrollmentTab = 'students' | 'enrollments' | 'families' | 'move';

/**
 * Inscripciones, Matrículas, Familias, Novedades, Documentos S3 y Traslado de Estudiantes
 * (reemplaza InscripcionesView, MatriculasView, FamiliesView, NovedadesView, MoverEstudiantesView).
 */
@Component({
  selector: 'app-enrollments-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    CustomTooltipDirective,
    V3ModalDialogComponent,
    V3FileManagerModalComponent,
  ],
  template: `
    <div class="container-fluid py-3">
      <div class="breadcrumb-card mb-25 d-md-flex align-items-center justify-content-between">
        <div>
          <h5 class="mb-0 fw-bold">Inscripciones y Matrículas</h5>
          <small class="text-muted">
            Año lectivo {{ academicYear() }} · Estudiantes, matrículas, acudientes, novedades y traslados
          </small>
        </div>
        <ol class="breadcrumb list-unstyled mt-0 mb-0 p-0">
          <li class="breadcrumb-item d-inline-block position-relative">
            <a routerLink="/academic" class="d-inline-block position-relative">Académico</a>
          </li>
          <li class="breadcrumb-item d-inline-block position-relative">Matrículas</li>
        </ol>
      </div>

      <ul class="nav nav-pills mb-3 gap-2">
        <li class="nav-item">
          <button type="button" class="nav-link" [class.active]="activeTab() === 'students'" (click)="activeTab.set('students')">
            Estudiantes ({{ students().length }})
          </button>
        </li>
        <li class="nav-item">
          <button type="button" class="nav-link" [class.active]="activeTab() === 'enrollments'" (click)="activeTab.set('enrollments')">
            Matrículas {{ academicYear() }} ({{ enrollments().length }})
          </button>
        </li>
        <li class="nav-item">
          <button type="button" class="nav-link" [class.active]="activeTab() === 'families'" (click)="activeTab.set('families')">
            Familias y Acudientes ({{ families().length }})
          </button>
        </li>
        <li class="nav-item">
          <button type="button" class="nav-link" [class.active]="activeTab() === 'move'" (click)="activeTab.set('move')">
            Mover Estudiantes
          </button>
        </li>
      </ul>

      <div class="trezo-card bg-white border-radius p-4 shadow-sm">
        @switch (activeTab()) {
          @case ('students') {
            <div class="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-3">
              <div class="input-group input-group-sm" style="max-width: 340px;">
                <input
                  type="text"
                  class="form-control"
                  [(ngModel)]="studentSearch"
                  placeholder="Buscar por documento o nombre..."
                  (keyup.enter)="searchStudents()"
                />
                <button type="button" class="btn btn-outline-primary" (click)="searchStudents()">Buscar</button>
              </div>
              <button
                type="button"
                class="btn btn-sm btn-outline-secondary"
                (click)="openDocsModal('Documentos Digitales de Estudiantes')"
              >
                <i class="material-symbols-outlined fs-6 align-middle me-1">cloud_upload</i>
                Repositorio S3 Estudiantes
              </button>
            </div>

            @if (canWrite()) {
              <div class="row g-2 align-items-end mb-4 p-3 rounded bg-light border">
                <div class="col-md-2">
                  <label class="form-label small fw-semibold">Tipo Doc.</label>
                  <select class="form-select form-select-sm" [(ngModel)]="studentForm.documentTypeId">
                    <option [ngValue]="null">Seleccione...</option>
                    @for (dt of catalogs()?.documentTypes ?? []; track dt.id) {
                      <option [ngValue]="dt.id">{{ dt.code || dt.name }}</option>
                    }
                  </select>
                </div>
                <div class="col-md-2">
                  <label class="form-label small fw-semibold">Número Doc. *</label>
                  <input type="text" class="form-control form-control-sm" [(ngModel)]="studentForm.documentNumber" />
                </div>
                <div class="col-md-2">
                  <label class="form-label small fw-semibold">Primer Nombre *</label>
                  <input type="text" class="form-control form-control-sm" [(ngModel)]="studentForm.firstName" />
                </div>
                <div class="col-md-2">
                  <label class="form-label small fw-semibold">Segundo Nombre</label>
                  <input type="text" class="form-control form-control-sm" [(ngModel)]="studentForm.middleName" />
                </div>
                <div class="col-md-2">
                  <label class="form-label small fw-semibold">Primer Apellido *</label>
                  <input type="text" class="form-control form-control-sm" [(ngModel)]="studentForm.lastName" />
                </div>
                <div class="col-md-2">
                  <label class="form-label small fw-semibold">Segundo Apellido</label>
                  <input type="text" class="form-control form-control-sm" [(ngModel)]="studentForm.secondLastName" />
                </div>
                <div class="col-md-2">
                  <label class="form-label small fw-semibold">F. Nacimiento</label>
                  <input type="date" class="form-control form-control-sm" [(ngModel)]="studentForm.birthDate" />
                </div>
                <div class="col-md-2">
                  <label class="form-label small fw-semibold">RH</label>
                  <input type="text" class="form-control form-control-sm" [(ngModel)]="studentForm.bloodType" placeholder="O+" />
                </div>
                <div class="col-md-2">
                  <label class="form-label small fw-semibold">Teléfono</label>
                  <input type="text" class="form-control form-control-sm" [(ngModel)]="studentForm.phone" />
                </div>
                <div class="col-md-3">
                  <label class="form-label small fw-semibold">Correo electrónico</label>
                  <input type="email" class="form-control form-control-sm" [(ngModel)]="studentForm.email" />
                </div>
                <div class="col-md-3 d-flex gap-1">
                  <button
                    type="button"
                    class="btn btn-sm btn-primary flex-grow-1"
                    [disabled]="!studentForm.documentNumber.trim() || !studentForm.firstName.trim() || !studentForm.lastName.trim()"
                    (click)="saveStudent()"
                  >
                    {{ editingStudentId() ? 'Actualizar' : 'Inscribir Estudiante' }}
                  </button>
                  @if (editingStudentId()) {
                    <button type="button" class="btn btn-sm btn-outline-secondary" (click)="resetStudentForm()" [appCustomTooltip]="'Cancelar'">
                      <i class="material-symbols-outlined fs-6">close</i>
                    </button>
                  }
                </div>
              </div>
            }

            <div class="table-responsive">
              <table class="table table-hover v3-grid-table mb-0">
                <thead>
                  <tr>
                    <th>Documento</th>
                    <th>Estudiante</th>
                    <th>F. Nacimiento</th>
                    <th>Teléfono / Correo</th>
                    <th class="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  @for (st of students(); track st.id) {
                    <tr>
                      <td class="font-monospace small">{{ st.documentTypeCode || '' }} {{ st.documentNumber }}</td>
                      <td class="fw-semibold">{{ st.fullName }}</td>
                      <td class="small">{{ st.birthDate || '—' }}</td>
                      <td class="small">{{ st.phone || '—' }} · {{ st.email || '—' }}</td>
                      <td class="text-end text-nowrap">
                        <button
                          type="button"
                          class="btn btn-sm btn-outline-info me-1"
                          (click)="openStudentFamiliesModal(st)"
                          [appCustomTooltip]="'Acudientes y familiares'"
                        >
                          <i class="material-symbols-outlined fs-6">family_restroom</i>
                        </button>
                        @if (canWrite()) {
                          <button
                            type="button"
                            class="btn btn-sm btn-outline-primary me-1"
                            (click)="editStudent(st)"
                            [appCustomTooltip]="'Editar estudiante'"
                          >
                            <i class="material-symbols-outlined fs-6">edit</i>
                          </button>
                        }
                        @if (canDelete()) {
                          <button
                            type="button"
                            class="btn btn-sm btn-outline-danger"
                            (click)="deleteStudent(st)"
                            [appCustomTooltip]="'Eliminar estudiante'"
                          >
                            <i class="material-symbols-outlined fs-6">delete</i>
                          </button>
                        }
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="5" class="text-center text-muted py-4">No se encontraron estudiantes.</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }

          @case ('enrollments') {
            <div class="row g-2 align-items-end mb-3">
              <div class="col-md-4">
                <label class="form-label small fw-semibold">Filtrar por grupo</label>
                <select class="form-select form-select-sm" [(ngModel)]="filterGroupId" (ngModelChange)="loadEnrollments()">
                  <option [ngValue]="0">Todos los grupos ({{ academicYear() }})</option>
                  @for (g of groups(); track g.id) {
                    <option [ngValue]="g.id">{{ g.gradeName }}-{{ g.groupCode }} ({{ g.campusName }})</option>
                  }
                </select>
              </div>
              <div class="col-md-4">
                <label class="form-label small fw-semibold">Buscar matriculado</label>
                <input
                  type="text"
                  class="form-control form-control-sm"
                  [(ngModel)]="enrollmentSearch"
                  placeholder="Nombre o documento..."
                  (keyup.enter)="loadEnrollments()"
                />
              </div>
              <div class="col-md-2 d-grid">
                <button type="button" class="btn btn-sm btn-outline-primary" (click)="loadEnrollments()">Filtrar</button>
              </div>
              @if (canWrite()) {
                <div class="col-md-2 d-grid">
                  <button
                    type="button"
                    class="btn btn-sm btn-outline-secondary"
                    (click)="renumberFolios()"
                    [appCustomTooltip]="'Renumerar secuencialmente No. Registro, Libro y Folio según configuración SIEE (students_per_book)'"
                  >
                    <i class="material-symbols-outlined fs-6 align-middle me-1">format_list_numbered</i>
                    Renumerar Folios
                  </button>
                </div>
              }
            </div>

            @if (canWrite()) {
              <div class="row g-2 align-items-end mb-4 p-3 rounded bg-light border">
                <div class="col-md-4">
                  <label class="form-label small fw-semibold">Estudiante *</label>
                  <select class="form-select form-select-sm" [(ngModel)]="enrollmentForm.studentProfileId">
                    <option [ngValue]="0">Seleccione estudiante...</option>
                    @for (st of students(); track st.id) {
                      <option [ngValue]="st.id">{{ st.documentNumber }} · {{ st.fullName }}</option>
                    }
                  </select>
                </div>
                <div class="col-md-3">
                  <label class="form-label small fw-semibold">Grupo destino *</label>
                  <select class="form-select form-select-sm" [(ngModel)]="enrollmentForm.academicGroupId" (ngModelChange)="onEnrollGroupChange($event)">
                    <option [ngValue]="0">Seleccione grupo...</option>
                    @for (g of groups(); track g.id) {
                      <option [ngValue]="g.id">{{ g.gradeName }}-{{ g.groupCode }} ({{ g.campusName }} · {{ g.shiftName }})</option>
                    }
                  </select>
                </div>
                <div class="col-md-2">
                  <label class="form-label small fw-semibold">Folio / Matrícula</label>
                  <input type="text" class="form-control form-control-sm" [(ngModel)]="enrollmentForm.registrationNumber" placeholder="MAT-2026-001" />
                </div>
                <div class="col-md-1">
                  <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" id="isRepeating" [(ngModel)]="enrollmentForm.isRepeatingGrade" />
                    <label class="form-check-label small" for="isRepeating">Repite</label>
                  </div>
                </div>
                <div class="col-md-2 d-grid">
                  <button
                    type="button"
                    class="btn btn-sm btn-primary"
                    [disabled]="!enrollmentForm.studentProfileId || !enrollmentForm.academicGroupId"
                    (click)="saveEnrollment()"
                  >
                    Matricular
                  </button>
                </div>
              </div>
            }

            <div class="table-responsive">
              <table class="table table-hover v3-grid-table mb-0">
                <thead>
                  <tr>
                    <th>Documento</th>
                    <th>Estudiante</th>
                    <th>Sede / Jornada</th>
                    <th>Grado - Grupo</th>
                    <th>Folio</th>
                    <th class="text-center">Estado</th>
                    <th class="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  @for (enr of enrollments(); track enr.id) {
                    <tr>
                      <td class="font-monospace small">{{ enr.studentDocumentNumber }}</td>
                      <td class="fw-semibold">{{ enr.studentFullName }}</td>
                      <td class="small">{{ enr.campusName }} · {{ enr.shiftName }}</td>
                      <td>
                        <span class="badge text-bg-light border text-dark">{{ enr.gradeName }} - {{ enr.groupCode }}</span>
                      </td>
                      <td class="small">
                        <div>{{ enr.registrationNumber || '—' }}</div>
                        @if (enr.bookNumber || enr.folioNumber) {
                          <small class="text-muted">L:{{ enr.bookNumber || '1' }} · F:{{ enr.folioNumber || '—' }}</small>
                        }
                      </td>
                      <td class="text-center">
                        <span class="badge text-bg-success">{{ enr.enrollmentStatusName }}</span>
                      </td>
                      <td class="text-end text-nowrap">
                        <button
                          type="button"
                          class="btn btn-sm btn-outline-warning me-1"
                          (click)="openNoveltiesModal(enr)"
                          [appCustomTooltip]="'Registrar / ver novedades de matrícula'"
                        >
                          <i class="material-symbols-outlined fs-6">history_edu</i>
                        </button>
                        <button
                          type="button"
                          class="btn btn-sm btn-outline-secondary"
                          (click)="openDocsModal('Documentos de ' + enr.studentFullName)"
                          [appCustomTooltip]="'Documentos digitales S3'"
                        >
                          <i class="material-symbols-outlined fs-6">folder</i>
                        </button>
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="7" class="text-center text-muted py-4">No hay matrículas registradas en {{ academicYear() }}.</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }

          @case ('families') {
            @if (canWrite()) {
              <div class="row g-2 align-items-end mb-4 p-3 rounded bg-light border">
                <div class="col-md-2">
                  <label class="form-label small fw-semibold">Documento *</label>
                  <input type="text" class="form-control form-control-sm" [(ngModel)]="familyForm.documentNumber" />
                </div>
                <div class="col-md-3">
                  <label class="form-label small fw-semibold">Nombre completo *</label>
                  <input type="text" class="form-control form-control-sm" [(ngModel)]="familyForm.fullName" />
                </div>
                <div class="col-md-2">
                  <label class="form-label small fw-semibold">Celular</label>
                  <input type="text" class="form-control form-control-sm" [(ngModel)]="familyForm.mobilePhone" />
                </div>
                <div class="col-md-2">
                  <label class="form-label small fw-semibold">Correo</label>
                  <input type="email" class="form-control form-control-sm" [(ngModel)]="familyForm.email" />
                </div>
                <div class="col-md-2">
                  <label class="form-label small fw-semibold">Ocupación</label>
                  <input type="text" class="form-control form-control-sm" [(ngModel)]="familyForm.occupation" />
                </div>
                <div class="col-md-1 d-grid">
                  <button
                    type="button"
                    class="btn btn-sm btn-primary"
                    [disabled]="!familyForm.documentNumber.trim() || !familyForm.fullName.trim()"
                    (click)="saveFamily()"
                  >
                    Crear
                  </button>
                </div>
              </div>
            }
            <div class="table-responsive">
              <table class="table table-hover v3-grid-table mb-0">
                <thead>
                  <tr>
                    <th>Documento</th>
                    <th>Nombre completo</th>
                    <th>Teléfono / Celular</th>
                    <th>Correo</th>
                    <th>Ocupación</th>
                  </tr>
                </thead>
                <tbody>
                  @for (fam of families(); track fam.id) {
                    <tr>
                      <td class="font-monospace small">{{ fam.documentNumber }}</td>
                      <td class="fw-semibold">{{ fam.fullName }}</td>
                      <td class="small">{{ fam.mobilePhone || fam.phone || '—' }}</td>
                      <td class="small">{{ fam.email || '—' }}</td>
                      <td class="small">{{ fam.occupation || '—' }}</td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="5" class="text-center text-muted py-4">No hay acudientes registrados.</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }

          @case ('move') {
            <div class="row g-3 mb-4 p-3 rounded bg-light border align-items-end">
              <div class="col-md-6">
                <label class="form-label small fw-semibold">Grupo destino para los estudiantes seleccionados *</label>
                <select class="form-select form-select-sm" [(ngModel)]="moveTargetGroupId">
                  <option [ngValue]="0">Seleccione grupo destino...</option>
                  @for (g of groups(); track g.id) {
                    <option [ngValue]="g.id">{{ g.gradeName }}-{{ g.groupCode }} ({{ g.campusName }} · {{ g.shiftName }})</option>
                  }
                </select>
              </div>
              <div class="col-md-3">
                <span class="badge text-bg-primary">{{ selectedEnrollmentIds().length }} seleccionado(s)</span>
              </div>
              <div class="col-md-3 d-grid">
                <button
                  type="button"
                  class="btn btn-sm btn-primary"
                  [disabled]="!moveTargetGroupId || selectedEnrollmentIds().length === 0"
                  (click)="executeMoveEnrollments()"
                >
                  Mover Seleccionados
                </button>
              </div>
            </div>

            <div class="table-responsive">
              <table class="table table-hover v3-grid-table mb-0">
                <thead>
                  <tr>
                    <th style="width: 40px;"></th>
                    <th>Documento</th>
                    <th>Estudiante</th>
                    <th>Ubicación Actual</th>
                  </tr>
                </thead>
                <tbody>
                  @for (enr of enrollments(); track enr.id) {
                    <tr>
                      <td>
                        <input
                          type="checkbox"
                          class="form-check-input"
                          [checked]="selectedEnrollmentIds().includes(enr.id)"
                          (change)="toggleMoveSelection(enr.id)"
                        />
                      </td>
                      <td class="font-monospace small">{{ enr.studentDocumentNumber }}</td>
                      <td class="fw-semibold">{{ enr.studentFullName }}</td>
                      <td class="small">{{ enr.campusName }} · {{ enr.shiftName }} · {{ enr.gradeName }}-{{ enr.groupCode }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        }
      </div>

      <!-- Modal de novedades de matrícula -->
      <app-v3-modal-dialog
        [open]="noveltiesModalOpen()"
        [heading]="'Novedades de Matrícula · ' + (selectedEnrollmentForNovelties()?.studentFullName || '')"
        icon="history_edu"
        size="lg"
        (closed)="noveltiesModalOpen.set(false)"
      >
        @if (canWrite()) {
          <div class="row g-2 align-items-end mb-3 p-3 rounded bg-light border">
            <div class="col-md-4">
              <label class="form-label small fw-semibold">Nuevo estado *</label>
              <select class="form-select form-select-sm" [(ngModel)]="noveltyForm.enrollmentStatusId">
                <option [ngValue]="0">Seleccione estado...</option>
                @for (es of catalogs()?.enrollmentStatuses ?? []; track es.id) {
                  <option [ngValue]="es.id">{{ es.name }}</option>
                }
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label small fw-semibold">Fecha</label>
              <input type="date" class="form-control form-control-sm" [(ngModel)]="noveltyForm.noveltyDate" />
            </div>
            <div class="col-md-5">
              <label class="form-label small fw-semibold">Motivo / Observación *</label>
              <input type="text" class="form-control form-control-sm" [(ngModel)]="noveltyForm.reason" placeholder="Ej. Retiro voluntario por traslado" />
            </div>
            <div class="col-12 text-end">
              <button
                type="button"
                class="btn btn-sm btn-primary"
                [disabled]="!noveltyForm.enrollmentStatusId || !noveltyForm.reason.trim()"
                (click)="saveNovelty()"
              >
                Registrar Novedad
              </button>
            </div>
          </div>
        }
        <ul class="list-group list-group-flush">
          @for (nov of novelties(); track nov.id) {
            <li class="list-group-item">
              <div class="d-flex justify-content-between">
                <span class="badge text-bg-info">{{ nov.enrollmentStatusName }}</span>
                <small class="text-muted">{{ nov.noveltyDate }}</small>
              </div>
              <p class="mb-0 mt-1 small">{{ nov.reason }}</p>
            </li>
          } @empty {
            <li class="list-group-item text-muted text-center">Sin novedades registradas.</li>
          }
        </ul>
      </app-v3-modal-dialog>

      <!-- Modal de vínculos familiares del estudiante -->
      <app-v3-modal-dialog
        [open]="familiesModalOpen()"
        [heading]="'Acudientes de ' + (selectedStudentForFamilies()?.fullName || '')"
        icon="family_restroom"
        size="lg"
        (closed)="familiesModalOpen.set(false)"
      >
        @if (canWrite()) {
          <div class="row g-2 align-items-end mb-3 p-3 rounded bg-light border">
            <div class="col-md-6">
              <label class="form-label small fw-semibold">Acudiente / Familiar *</label>
              <select class="form-select form-select-sm" [(ngModel)]="linkFamilyForm.familyProfileId">
                <option [ngValue]="0">Seleccione acudiente...</option>
                @for (f of families(); track f.id) {
                  <option [ngValue]="f.id">{{ f.documentNumber }} · {{ f.fullName }}</option>
                }
              </select>
            </div>
            <div class="col-md-3">
              <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" id="isPrimary" [(ngModel)]="linkFamilyForm.isPrimaryGuardian" />
                <label class="form-check-label small" for="isPrimary">Acudiente principal</label>
              </div>
            </div>
            <div class="col-md-3 d-grid">
              <button
                type="button"
                class="btn btn-sm btn-primary"
                [disabled]="!linkFamilyForm.familyProfileId"
                (click)="linkFamily()"
              >
                Vincular
              </button>
            </div>
          </div>
        }
        <ul class="list-group list-group-flush">
          @for (lnk of studentFamilies(); track lnk.id) {
            <li class="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <div class="fw-semibold">
                  {{ lnk.familyFullName }}
                  @if (lnk.isPrimaryGuardian) {
                    <span class="badge text-bg-primary ms-1">Principal</span>
                  }
                </div>
                <small class="text-muted">Doc: {{ lnk.familyDocumentNumber }} · Tel: {{ lnk.familyPhone || '—' }} · {{ lnk.relationshipName }}</small>
              </div>
              @if (canWrite()) {
                <button type="button" class="btn btn-sm btn-outline-danger" (click)="unlinkFamily(lnk)" [appCustomTooltip]="'Desvincular acudiente'">
                  <i class="material-symbols-outlined fs-6">link_off</i>
                </button>
              }
            </li>
          } @empty {
            <li class="list-group-item text-muted text-center">No hay acudientes vinculados.</li>
          }
        </ul>
      </app-v3-modal-dialog>

      <!-- Modal gestor documental S3 -->
      <app-v3-file-manager-modal
        [open]="docsModalOpen()"
        [heading]="docsModalHeading()"
        category="STUDENT_DOCUMENTS"
        (closed)="docsModalOpen.set(false)"
      ></app-v3-file-manager-modal>
    </div>
  `,
})
export class EnrollmentsManagementComponent implements OnInit {
  private readonly academicService = inject(V3AcademicService);
  private readonly adminService = inject(V3AdministrationService);
  private readonly catalogsService = inject(V3CatalogsService);
  private readonly auth = inject(V3UnifiedAuthService);
  private readonly messages = inject(MessagesService);
  private readonly loadMask = inject(LoadMaskService);

  readonly academicYear = computed(() => this.auth.academicYear());
  readonly canWrite = computed(() =>
    this.auth.hasAnyRole(['SUPER_ADMIN', 'SCHOOL_ADMIN', 'RECTOR', 'COORDINATOR', 'SECRETARY']),
  );
  readonly canDelete = computed(() =>
    this.auth.hasAnyRole(['SUPER_ADMIN', 'SCHOOL_ADMIN', 'RECTOR']),
  );

  readonly activeTab = signal<EnrollmentTab>('students');
  readonly students = signal<StudentProfileRecord[]>([]);
  readonly enrollments = signal<EnrollmentRecord[]>([]);
  readonly families = signal<FamilyProfileRecord[]>([]);
  readonly groups = signal<GroupManagerRecord[]>([]);
  readonly catalogs = signal<GlobalCatalogsBundle | null>(null);

  readonly editingStudentId = signal<number | null>(null);
  readonly selectedEnrollmentIds = signal<number[]>([]);
  readonly noveltiesModalOpen = signal(false);
  readonly selectedEnrollmentForNovelties = signal<EnrollmentRecord | null>(null);
  readonly novelties = signal<EnrollmentNoveltyRecord[]>([]);
  readonly familiesModalOpen = signal(false);
  readonly selectedStudentForFamilies = signal<StudentProfileRecord | null>(null);
  readonly studentFamilies = signal<StudentFamilyLinkRecord[]>([]);
  readonly docsModalOpen = signal(false);
  readonly docsModalHeading = signal('Documentos Digitales');

  studentSearch = '';
  enrollmentSearch = '';
  filterGroupId = 0;
  moveTargetGroupId = 0;

  studentForm = {
    documentTypeId: null as number | null,
    documentNumber: '',
    firstName: '',
    middleName: '',
    lastName: '',
    secondLastName: '',
    birthDate: '',
    bloodType: '',
    phone: '',
    email: '',
  };

  enrollmentForm = {
    studentProfileId: 0,
    campusId: 0,
    shiftId: 0,
    gradeId: 0,
    academicGroupId: 0,
    registrationNumber: '',
    isRepeatingGrade: false,
  };

  familyForm = {
    documentNumber: '',
    fullName: '',
    mobilePhone: '',
    email: '',
    occupation: '',
  };

  noveltyForm = {
    enrollmentStatusId: 0,
    noveltyDate: '',
    reason: '',
  };

  linkFamilyForm = {
    familyProfileId: 0,
    isPrimaryGuardian: true,
  };

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.loadMask.show('Cargando estudiantes y matrículas...');
    const year = this.academicYear();
    forkJoin({
      students: this.academicService.listStudents(),
      enrollments: this.academicService.listEnrollments(year),
      families: this.academicService.listFamilies(),
      groups: this.adminService.listGroupManagers(year),
      catalogs: this.catalogsService.getGlobalBundle(),
    })
      .pipe(finalize(() => this.loadMask.hide()))
      .subscribe({
        next: (res) => {
          this.students.set(res.students);
          this.enrollments.set(res.enrollments);
          this.families.set(res.families);
          this.groups.set(res.groups);
          this.catalogs.set(res.catalogs);
        },
      });
  }

  searchStudents(): void {
    this.academicService.listStudents(this.studentSearch).subscribe({
      next: (rows) => this.students.set(rows),
    });
  }

  loadEnrollments(): void {
    this.academicService
      .listEnrollments(
        this.academicYear(),
        this.filterGroupId || undefined,
        this.enrollmentSearch || undefined,
      )
      .subscribe({
        next: (rows) => this.enrollments.set(rows),
      });
  }

  editStudent(st: StudentProfileRecord): void {
    this.editingStudentId.set(st.id);
    this.studentForm = {
      documentTypeId: st.documentTypeId,
      documentNumber: st.documentNumber,
      firstName: st.firstName,
      middleName: st.middleName ?? '',
      lastName: st.lastName,
      secondLastName: st.secondLastName ?? '',
      birthDate: st.birthDate ?? '',
      bloodType: st.bloodType ?? '',
      phone: st.phone ?? '',
      email: st.email ?? '',
    };
  }

  resetStudentForm(): void {
    this.editingStudentId.set(null);
    this.studentForm = {
      documentTypeId: null,
      documentNumber: '',
      firstName: '',
      middleName: '',
      lastName: '',
      secondLastName: '',
      birthDate: '',
      bloodType: '',
      phone: '',
      email: '',
    };
  }

  saveStudent(): void {
    this.academicService
      .saveStudent(
        {
          documentTypeId: this.studentForm.documentTypeId || null,
          documentNumber: this.studentForm.documentNumber.trim(),
          firstName: this.studentForm.firstName.trim(),
          middleName: this.studentForm.middleName.trim() || null,
          lastName: this.studentForm.lastName.trim(),
          secondLastName: this.studentForm.secondLastName.trim() || null,
          birthDate: this.studentForm.birthDate || null,
          bloodType: this.studentForm.bloodType.trim() || null,
          phone: this.studentForm.phone.trim() || null,
          email: this.studentForm.email.trim() || null,
        },
        this.editingStudentId() ?? undefined,
      )
      .subscribe({
        next: () => {
          this.messages.showSuccess('Estudiante guardado correctamente.');
          this.resetStudentForm();
          this.searchStudents();
        },
      });
  }

  deleteStudent(st: StudentProfileRecord): void {
    void this.messages.confirmDelete(`¿Eliminar el perfil de ${st.fullName}?`).then((r) => {
      if (!r.isConfirmed) return;
      this.academicService.deleteStudent(st.id).subscribe({
        next: () => {
          this.messages.showSuccess('Estudiante eliminado.');
          this.searchStudents();
        },
      });
    });
  }

  onEnrollGroupChange(groupId: number): void {
    const grp = this.groups().find((g) => g.id === Number(groupId));
    if (grp) {
      this.enrollmentForm.campusId = grp.campusId;
      this.enrollmentForm.shiftId = grp.shiftId;
      this.enrollmentForm.gradeId = grp.gradeId;
    }
  }

  saveEnrollment(): void {
    this.academicService
      .saveEnrollment({
        studentProfileId: Number(this.enrollmentForm.studentProfileId),
        campusId: this.enrollmentForm.campusId,
        shiftId: this.enrollmentForm.shiftId,
        gradeId: this.enrollmentForm.gradeId,
        academicGroupId: Number(this.enrollmentForm.academicGroupId),
        academicYear: this.academicYear(),
        registrationNumber: this.enrollmentForm.registrationNumber.trim() || null,
        isRepeatingGrade: this.enrollmentForm.isRepeatingGrade,
      })
      .subscribe({
        next: () => {
          this.messages.showSuccess('Matrícula registrada exitosamente.');
          this.loadEnrollments();
        },
      });
  }

  saveFamily(): void {
    this.academicService
      .saveFamily({
        documentNumber: this.familyForm.documentNumber.trim(),
        fullName: this.familyForm.fullName.trim(),
        mobilePhone: this.familyForm.mobilePhone.trim() || null,
        email: this.familyForm.email.trim() || null,
        occupation: this.familyForm.occupation.trim() || null,
      })
      .subscribe({
        next: () => {
          this.messages.showSuccess('Acudiente registrado correctamente.');
          this.familyForm = { documentNumber: '', fullName: '', mobilePhone: '', email: '', occupation: '' };
          this.academicService.listFamilies().subscribe((rows) => this.families.set(rows));
        },
      });
  }

  openStudentFamiliesModal(st: StudentProfileRecord): void {
    this.selectedStudentForFamilies.set(st);
    this.familiesModalOpen.set(true);
    this.academicService
      .listStudentFamilies(st.id)
      .subscribe((rows) => this.studentFamilies.set(rows));
  }

  linkFamily(): void {
    const st = this.selectedStudentForFamilies();
    if (!st) return;
    this.academicService
      .linkStudentFamily(st.id, {
        familyProfileId: Number(this.linkFamilyForm.familyProfileId),
        isPrimaryGuardian: this.linkFamilyForm.isPrimaryGuardian,
      })
      .subscribe({
        next: () => {
          this.messages.showSuccess('Acudiente vinculado al estudiante.');
          this.openStudentFamiliesModal(st);
        },
      });
  }

  unlinkFamily(link: StudentFamilyLinkRecord): void {
    const st = this.selectedStudentForFamilies();
    if (!st) return;
    this.academicService.unlinkStudentFamily(st.id, link.id).subscribe({
      next: () => {
        this.messages.showSuccess('Vínculo familiar eliminado.');
        this.openStudentFamiliesModal(st);
      },
    });
  }

  openNoveltiesModal(enr: EnrollmentRecord): void {
    this.selectedEnrollmentForNovelties.set(enr);
    this.noveltiesModalOpen.set(true);
    this.academicService
      .listEnrollmentNovelties(enr.id)
      .subscribe((rows) => this.novelties.set(rows));
  }

  saveNovelty(): void {
    const enr = this.selectedEnrollmentForNovelties();
    if (!enr) return;
    this.academicService
      .recordEnrollmentNovelty(enr.id, {
        enrollmentStatusId: Number(this.noveltyForm.enrollmentStatusId),
        noveltyDate: this.noveltyForm.noveltyDate || undefined,
        reason: this.noveltyForm.reason.trim(),
      })
      .subscribe({
        next: () => {
          this.messages.showSuccess('Novedad registrada y estado actualizado.');
          this.noveltyForm = { enrollmentStatusId: 0, noveltyDate: '', reason: '' };
          this.openNoveltiesModal(enr);
          this.loadEnrollments();
        },
      });
  }

  toggleMoveSelection(enrollmentId: number): void {
    const current = this.selectedEnrollmentIds();
    this.selectedEnrollmentIds.set(
      current.includes(enrollmentId)
        ? current.filter((id) => id !== enrollmentId)
        : [...current, enrollmentId],
    );
  }

  executeMoveEnrollments(): void {
    const grp = this.groups().find((g) => g.id === Number(this.moveTargetGroupId));
    if (!grp) return;
    this.academicService
      .moveEnrollments({
        enrollmentIds: this.selectedEnrollmentIds(),
        targetCampusId: grp.campusId,
        targetShiftId: grp.shiftId,
        targetGradeId: grp.gradeId,
        targetGroupId: grp.id,
      })
      .subscribe({
        next: ({ movedCount }) => {
          this.messages.showSuccess(`Se trasladaron ${movedCount} estudiantes al grupo ${grp.gradeName}-${grp.groupCode}.`);
          this.selectedEnrollmentIds.set([]);
          this.loadEnrollments();
        },
      });
  }

  openDocsModal(heading: string): void {
    this.docsModalHeading.set(heading);
    this.docsModalOpen.set(true);
  }

  renumberFolios(): void {
    void this.messages
      .showConfirm({
        title: 'Renumerar Libros y Folios',
        message: `¿Desea renumerar secuencialmente No. Registro, Libro y Folio de todas las matrículas activas del año ${this.academicYear()}?`,
      })
      .then((res) => {
        if (!res.isConfirmed) return;
        this.loadMask.show('Renumerando libros y folios de matrícula...');
        this.academicService
          .renumberEnrollmentFolios(this.academicYear(), true)
          .pipe(finalize(() => this.loadMask.hide()))
          .subscribe({
            next: (result) => {
              this.messages.showSuccess(
                `Foliación actualizada: ${result.updatedCount} matrícula(s) en ${result.totalBooks} libro(s) (${result.studentsPerBook} por libro).`,
              );
              this.loadEnrollments();
            },
          });
      });
  }
}
