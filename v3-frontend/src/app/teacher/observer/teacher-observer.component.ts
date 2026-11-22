import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { LoadMaskService } from '../../services/common/load-mask.service';
import { MessagesService } from '../../services/messages.service';
import {
  EnrollmentRecord,
  StudentFamilyLinkRecord,
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
import {
  V3FormWizardComponent,
  V3WizardStep,
} from '../../shared/components/v3-form-wizard/v3-form-wizard.component';
import {
  SearchableSelectOption,
  V3SearchableSelectComponent,
} from '../../shared/components/v3-searchable-select/v3-searchable-select.component';
import { CustomTooltipDirective } from '../../shared/directives/custom-tooltip.directive';

type ObserverTab = 'model5' | 'model3' | 'annotations' | 'families';

interface Model5FormState {
  talla: string;
  peso: string;
  religion: string;
  deporte: string;
  trabaja: boolean;
  profOficio: string;
  numHermanos: number;
  lugarHermanos: number;
  numHermanosHombres: number;
  numHermanosMujeres: number;
  madreCabezaHogar: boolean;
  padreCabezaHogar: boolean;
  desplazados: boolean;
  barrerasAprendizaje: boolean;
  limVisual: boolean;
  limVisualDetalle: string;
  limVisualDx: string;
  limAuditiva: boolean;
  limAuditivaDetalle: string;
  limAuditivaDx: string;
  limLenguaje: boolean;
  limLenguajeDetalle: string;
  limLenguajeDx: string;
  limMotricidad: boolean;
  limMotricidadDetalle: string;
  limMotricidadDx: string;
  limOtras: boolean;
  limOtrasDetalle: string;
  limOtrasDx: string;
  dificultadAprendizaje: boolean;
  dislexia: boolean;
  disgrafia: boolean;
  discalculia: boolean;
  discapacidadIntelectual: boolean;
  discapacidadMemoriaAuditivo: boolean;
  tea: boolean;
  tdha: boolean;
  otraDificultadAprendizaje: string;
}

const DEFAULT_MODEL5: Model5FormState = {
  talla: '',
  peso: '',
  religion: '',
  deporte: '',
  trabaja: false,
  profOficio: '',
  numHermanos: 0,
  lugarHermanos: 1,
  numHermanosHombres: 0,
  numHermanosMujeres: 0,
  madreCabezaHogar: false,
  padreCabezaHogar: false,
  desplazados: false,
  barrerasAprendizaje: false,
  limVisual: false,
  limVisualDetalle: '',
  limVisualDx: '',
  limAuditiva: false,
  limAuditivaDetalle: '',
  limAuditivaDx: '',
  limLenguaje: false,
  limLenguajeDetalle: '',
  limLenguajeDx: '',
  limMotricidad: false,
  limMotricidadDetalle: '',
  limMotricidadDx: '',
  limOtras: false,
  limOtrasDetalle: '',
  limOtrasDx: '',
  dificultadAprendizaje: false,
  dislexia: false,
  disgrafia: false,
  discalculia: false,
  discapacidadIntelectual: false,
  discapacidadMemoriaAuditivo: false,
  tea: false,
  tdha: false,
  otraDificultadAprendizaje: '',
};

/**
 * Observador Integral del Estudiante (paridad 100% con FichaSeguimientoForm,
 * ObserverForm5, ItemsModelo3View, CrudAnnotationsM5View y vista de Acudientes
 * de asaie-teachers).
 */
@Component({
  selector: 'app-teacher-observer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    V3FormWizardComponent,
    V3SearchableSelectComponent,
    CustomTooltipDirective,
  ],
  template: `
    <div class="container-fluid py-3">
      <div class="breadcrumb-card mb-25 d-md-flex align-items-center justify-content-between">
        <div>
          <h5 class="mb-0 fw-bold">Observador Integral del Estudiante (Modelos 1–5)</h5>
          <small class="text-muted">Año lectivo {{ academicYear() }} · Ficha Modelo 5, Criterios Modelo 3, Anotaciones y Acudientes</small>
        </div>
        <ol class="breadcrumb list-unstyled mt-0 mb-0 p-0">
          <li class="breadcrumb-item d-inline-block position-relative">
            <a routerLink="/teacher" class="d-inline-block position-relative">Portal Docente</a>
          </li>
          <li class="breadcrumb-item d-inline-block position-relative">Observador</li>
        </ol>
      </div>

      <div class="trezo-card bg-white border-radius p-4 shadow-sm mb-4">
        <div class="row g-3">
          <div class="col-12 col-md-6">
            <label class="form-label">Seleccionar Estudiante Matriculado *</label>
            <app-v3-searchable-select
              [(ngModel)]="selectedEnrollmentId"
              [options]="enrollmentOptions()"
              [clearable]="true"
              placeholder="Seleccione estudiante..."
              searchPlaceholder="Buscar por nombre, grado o documento..."
              (ngModelChange)="loadObserver()"
            />
          </div>
          <div class="col-12 col-md-6">
            <label class="form-label">Plantilla / Modelo del Observador</label>
            <app-v3-searchable-select
              [(ngModel)]="observerForm.templateId"
              [options]="templateOptions()"
              [clearable]="true"
              placeholder="Modelo estándar / Modelo 5"
              searchPlaceholder="Buscar plantilla..."
            />
          </div>
          <div class="col-12 d-flex flex-wrap justify-content-end gap-2">
            <button
              type="button"
              class="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
              [disabled]="!selectedEnrollmentId"
              (click)="printObserverPdf()"
              [appCustomTooltip]="'Generar Observador del Estudiante en PDF'"
            >
              <i class="material-symbols-outlined fs-6">print</i>
              <span>PDF</span>
            </button>
            <button
              type="button"
              class="btn btn-sm btn-primary"
              [disabled]="!selectedEnrollmentId"
              (click)="saveObserverProfile()"
            >
              Guardar Ficha
            </button>
          </div>
        </div>
      </div>

      @if (observer(); as obs) {
        <div class="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
          <ul class="nav nav-pills gap-2">
            <li class="nav-item">
              <button type="button" class="nav-link" [class.active]="activeTab() === 'model5'" (click)="activeTab.set('model5')">
                Ficha y Modelo 5
              </button>
            </li>
            <li class="nav-item">
              <button type="button" class="nav-link" [class.active]="activeTab() === 'model3'" (click)="activeTab.set('model3')">
                Criterios Modelo 3 (N/AV/CS/S)
              </button>
            </li>
            <li class="nav-item">
              <button type="button" class="nav-link" [class.active]="activeTab() === 'annotations'" (click)="activeTab.set('annotations')">
                Anotaciones ({{ obs.annotations.length }})
              </button>
            </li>
            <li class="nav-item">
              <button type="button" class="nav-link" [class.active]="activeTab() === 'families'" (click)="activeTab.set('families')">
                Acudientes ({{ families().length }})
              </button>
            </li>
          </ul>
          <span class="badge text-bg-light border text-dark">
            {{ obs.studentFullName }} · {{ obs.gradeName }}-{{ obs.groupCode }}
          </span>
        </div>

        <div class="trezo-card bg-white border-radius p-4 shadow-sm">
          @switch (activeTab()) {
            @case ('model5') {
              <app-v3-form-wizard
                [steps]="model5WizardSteps"
                [(activeIndex)]="model5WizardStep"
                [allowFreeNavigation]="true"
                [allowSaveAnyStep]="true"
                [showFooter]="true"
                submitLabel="Guardar Ficha General y Modelo 5"
                submitIcon="save"
                (submitted)="saveObserverProfile()"
              >
                @if (model5WizardStep() === 0) {
                  <div class="row g-3">
                    <div class="col-12 col-md-6">
                      <label class="form-label">Fortalezas y Aspectos Positivos</label>
                      <textarea rows="4" class="form-control" [(ngModel)]="observerForm.strengths"></textarea>
                    </div>
                    <div class="col-12 col-md-6">
                      <label class="form-label">Dificultades / Aspectos por Mejorar</label>
                      <textarea rows="4" class="form-control" [(ngModel)]="observerForm.difficulties"></textarea>
                    </div>
                    <div class="col-12">
                      <label class="form-label">Compromisos Generales (Estudiante / Familia)</label>
                      <textarea rows="3" class="form-control" [(ngModel)]="observerForm.commitments"></textarea>
                    </div>
                  </div>
                } @else if (model5WizardStep() === 1) {
                  <div class="row g-3">
                    <div class="col-12 col-md-6">
                      <label class="form-label">Talla (cm)</label>
                      <input type="text" class="form-control" [(ngModel)]="model5.talla" placeholder="165" />
                    </div>
                    <div class="col-12 col-md-6">
                      <label class="form-label">Peso (kg)</label>
                      <input type="text" class="form-control" [(ngModel)]="model5.peso" placeholder="54" />
                    </div>
                    <div class="col-12 col-md-6">
                      <label class="form-label">Religión</label>
                      <input type="text" class="form-control" [(ngModel)]="model5.religion" />
                    </div>
                    <div class="col-12 col-md-6">
                      <label class="form-label">Deporte / Hobby</label>
                      <input type="text" class="form-control" [(ngModel)]="model5.deporte" />
                    </div>
                    <div class="col-12 col-md-6 d-flex align-items-end">
                      <div class="v3-form-switch-box">
                        <div class="form-check form-switch">
                          <input class="form-check-input" type="checkbox" id="trabajaSw" [(ngModel)]="model5.trabaja" />
                          <label class="form-check-label" for="trabajaSw">¿El estudiante trabaja actualmente?</label>
                        </div>
                      </div>
                    </div>
                    @if (model5.trabaja) {
                      <div class="col-12 col-md-6">
                        <label class="form-label">Profesión u Oficio que desempeña</label>
                        <input type="text" class="form-control" [(ngModel)]="model5.profOficio" />
                      </div>
                    }
                  </div>
                } @else if (model5WizardStep() === 2) {
                  <div class="row g-3">
                    <div class="col-12 col-md-6">
                      <label class="form-label">N° Hermanos</label>
                      <input type="number" min="0" class="form-control" [(ngModel)]="model5.numHermanos" />
                    </div>
                    <div class="col-12 col-md-6">
                      <label class="form-label">Lugar que ocupa</label>
                      <input type="number" min="1" class="form-control" [(ngModel)]="model5.lugarHermanos" />
                    </div>
                    <div class="col-12 col-md-6">
                      <label class="form-label">Hermanos Hombres</label>
                      <input type="number" min="0" class="form-control" [(ngModel)]="model5.numHermanosHombres" />
                    </div>
                    <div class="col-12 col-md-6">
                      <label class="form-label">Hermanas Mujeres</label>
                      <input type="number" min="0" class="form-control" [(ngModel)]="model5.numHermanosMujeres" />
                    </div>
                    <div class="col-12 col-md-6">
                      <div class="v3-form-switch-box">
                        <div class="form-check form-switch">
                          <input class="form-check-input" type="checkbox" id="mch" [(ngModel)]="model5.madreCabezaHogar" />
                          <label class="form-check-label" for="mch">Madre cabeza de hogar</label>
                        </div>
                      </div>
                    </div>
                    <div class="col-12 col-md-6">
                      <div class="v3-form-switch-box">
                        <div class="form-check form-switch">
                          <input class="form-check-input" type="checkbox" id="pch" [(ngModel)]="model5.padreCabezaHogar" />
                          <label class="form-check-label" for="pch">Padre cabeza de hogar</label>
                        </div>
                      </div>
                    </div>
                    <div class="col-12 col-md-6">
                      <div class="v3-form-switch-box">
                        <div class="form-check form-switch">
                          <input class="form-check-input" type="checkbox" id="desp" [(ngModel)]="model5.desplazados" />
                          <label class="form-check-label" for="desp">Situación de desplazamiento</label>
                        </div>
                      </div>
                    </div>
                  </div>
                } @else {
                  <div class="row g-3">
                    <div class="col-12">
                      <div class="v3-form-switch-box">
                        <div class="form-check form-switch">
                          <input class="form-check-input" type="checkbox" id="barrerasSw" [(ngModel)]="model5.barrerasAprendizaje" />
                          <label class="form-check-label fw-semibold" for="barrerasSw">Presenta barreras o limitaciones para el aprendizaje (PIAR)</label>
                        </div>
                      </div>
                    </div>
                    <div class="col-12 col-md-6">
                      <div class="v3-form-panel mb-0">
                        <div class="form-check mb-2">
                          <input class="form-check-input" type="checkbox" id="limV" [(ngModel)]="model5.limVisual" />
                          <label class="form-check-label fw-semibold" for="limV">Limitación Visual</label>
                        </div>
                        <div class="row g-2">
                          <div class="col-12 col-md-6">
                            <input type="text" class="form-control form-control-sm" [(ngModel)]="model5.limVisualDetalle" placeholder="Detalle..." />
                          </div>
                          <div class="col-12 col-md-6">
                            <input type="text" class="form-control form-control-sm" [(ngModel)]="model5.limVisualDx" placeholder="EPS / Dx Médico..." />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="col-12 col-md-6">
                      <div class="v3-form-panel mb-0">
                        <div class="form-check mb-2">
                          <input class="form-check-input" type="checkbox" id="limA" [(ngModel)]="model5.limAuditiva" />
                          <label class="form-check-label fw-semibold" for="limA">Limitación Auditiva</label>
                        </div>
                        <div class="row g-2">
                          <div class="col-12 col-md-6">
                            <input type="text" class="form-control form-control-sm" [(ngModel)]="model5.limAuditivaDetalle" placeholder="Detalle..." />
                          </div>
                          <div class="col-12 col-md-6">
                            <input type="text" class="form-control form-control-sm" [(ngModel)]="model5.limAuditivaDx" placeholder="EPS / Dx Médico..." />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="col-12 col-md-6">
                      <div class="v3-form-panel mb-0">
                        <div class="form-check mb-2">
                          <input class="form-check-input" type="checkbox" id="limL" [(ngModel)]="model5.limLenguaje" />
                          <label class="form-check-label fw-semibold" for="limL">Trastornos del Lenguaje</label>
                        </div>
                        <div class="row g-2">
                          <div class="col-12 col-md-6">
                            <input type="text" class="form-control form-control-sm" [(ngModel)]="model5.limLenguajeDetalle" placeholder="Detalle..." />
                          </div>
                          <div class="col-12 col-md-6">
                            <input type="text" class="form-control form-control-sm" [(ngModel)]="model5.limLenguajeDx" placeholder="EPS / Dx Médico..." />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="col-12 col-md-6">
                      <div class="v3-form-panel mb-0">
                        <div class="form-check mb-2">
                          <input class="form-check-input" type="checkbox" id="limM" [(ngModel)]="model5.limMotricidad" />
                          <label class="form-check-label fw-semibold" for="limM">Limitación Motriz</label>
                        </div>
                        <div class="row g-2">
                          <div class="col-12 col-md-6">
                            <input type="text" class="form-control form-control-sm" [(ngModel)]="model5.limMotricidadDetalle" placeholder="Detalle..." />
                          </div>
                          <div class="col-12 col-md-6">
                            <input type="text" class="form-control form-control-sm" [(ngModel)]="model5.limMotricidadDx" placeholder="EPS / Dx Médico..." />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="col-12">
                      <div class="v3-form-panel mb-0">
                        <div class="form-check mb-2">
                          <input class="form-check-input" type="checkbox" id="limO" [(ngModel)]="model5.limOtras" />
                          <label class="form-check-label fw-semibold" for="limO">Otras Limitaciones</label>
                        </div>
                        <div class="row g-2">
                          <div class="col-12 col-md-6">
                            <input type="text" class="form-control form-control-sm" [(ngModel)]="model5.limOtrasDetalle" placeholder="Detalle..." />
                          </div>
                          <div class="col-12 col-md-6">
                            <input type="text" class="form-control form-control-sm" [(ngModel)]="model5.limOtrasDx" placeholder="EPS / Dx Médico..." />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="col-12 pt-1">
                      <h6 class="fw-semibold mb-2">Dificultades Específicas del Aprendizaje</h6>
                      <div class="row g-2">
                        <div class="col-12 col-md-6">
                          <div class="v3-form-switch-box">
                            <div class="form-check"><input class="form-check-input" type="checkbox" id="daGen" [(ngModel)]="model5.dificultadAprendizaje" /><label class="form-check-label" for="daGen">Dificultad de Aprendizaje</label></div>
                          </div>
                        </div>
                        <div class="col-12 col-md-6">
                          <div class="v3-form-switch-box">
                            <div class="form-check"><input class="form-check-input" type="checkbox" id="daDisl" [(ngModel)]="model5.dislexia" /><label class="form-check-label" for="daDisl">Dislexia</label></div>
                          </div>
                        </div>
                        <div class="col-12 col-md-6">
                          <div class="v3-form-switch-box">
                            <div class="form-check"><input class="form-check-input" type="checkbox" id="daDisg" [(ngModel)]="model5.disgrafia" /><label class="form-check-label" for="daDisg">Disgrafía</label></div>
                          </div>
                        </div>
                        <div class="col-12 col-md-6">
                          <div class="v3-form-switch-box">
                            <div class="form-check"><input class="form-check-input" type="checkbox" id="daDisc" [(ngModel)]="model5.discalculia" /><label class="form-check-label" for="daDisc">Discalculia</label></div>
                          </div>
                        </div>
                        <div class="col-12 col-md-6">
                          <div class="v3-form-switch-box">
                            <div class="form-check"><input class="form-check-input" type="checkbox" id="daInt" [(ngModel)]="model5.discapacidadIntelectual" /><label class="form-check-label" for="daInt">Discapacidad Intelectual</label></div>
                          </div>
                        </div>
                        <div class="col-12 col-md-6">
                          <div class="v3-form-switch-box">
                            <div class="form-check"><input class="form-check-input" type="checkbox" id="daMem" [(ngModel)]="model5.discapacidadMemoriaAuditivo" /><label class="form-check-label" for="daMem">Memoria / Proc. Auditivo</label></div>
                          </div>
                        </div>
                        <div class="col-12 col-md-6">
                          <div class="v3-form-switch-box">
                            <div class="form-check"><input class="form-check-input" type="checkbox" id="daTea" [(ngModel)]="model5.tea" /><label class="form-check-label" for="daTea">TEA</label></div>
                          </div>
                        </div>
                        <div class="col-12 col-md-6">
                          <div class="v3-form-switch-box">
                            <div class="form-check"><input class="form-check-input" type="checkbox" id="daTdha" [(ngModel)]="model5.tdha" /><label class="form-check-label" for="daTdha">TDAH</label></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="col-12">
                      <label class="form-label">Otra dificultad o recomendación PIAR</label>
                      <input type="text" class="form-control" [(ngModel)]="model5.otraDificultadAprendizaje" placeholder="Especifique ajustes razonables..." />
                    </div>
                  </div>
                }
              </app-v3-form-wizard>
            }

            @case ('model3') {
              <div class="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
                <div class="small text-muted">
                  <strong>Escala Modelo 3:</strong> N = Nunca · AV = Algunas veces · CS = Casi siempre · S = Siempre
                </div>
                <button type="button" class="btn btn-sm btn-primary" (click)="saveModel3Matrix()">
                  <i class="material-symbols-outlined fs-6 align-middle me-1">save</i>
                  Guardar Matriz Modelo 3
                </button>
              </div>

              @if (activeTemplate(); as tpl) {
                @for (sec of tpl.sections; track sec.id) {
                  <h6 class="fw-semibold mt-3 mb-2">{{ sec.title }}</h6>
                  <div class="table-responsive mb-3">
                    <table class="table table-sm table-hover align-middle mb-0">
                      <thead>
                        <tr>
                          <th>Criterio de Seguimiento</th>
                          <th style="width: 110px;">P1</th>
                          <th style="width: 110px;">P2</th>
                          <th style="width: 110px;">P3</th>
                          <th style="width: 110px;">P4</th>
                        </tr>
                      </thead>
                      <tbody>
                        @for (cr of sec.criteria; track cr.id) {
                          <tr>
                            <td class="small">{{ cr.description }}</td>
                            @for (pk of ['p1', 'p2', 'p3', 'p4']; track pk) {
                              <td>
                                <app-v3-searchable-select
                                  size="sm"
                                  [ngModel]="getModel3Value(cr.id, pk)"
                                  (ngModelChange)="setModel3Value(cr.id, pk, $event ?? '')"
                                  [options]="model3ScaleOptions"
                                  placeholder="—"
                                  searchPlaceholder="Escala..."
                                />
                              </td>
                            }
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                } @empty {
                  <p class="text-muted small py-3 text-center mb-0">
                    La plantilla seleccionada no tiene secciones de criterios configuradas en Configuración → Observador.
                  </p>
                }
              } @else {
                <div class="alert alert-info small mb-0">
                  No hay plantillas de criterios configuradas aún. Puede crearlas en <strong>Configuración → Observador</strong>.
                </div>
              }
            }

            @case ('annotations') {
              @if (!obs.id) {
                <div class="alert alert-info small">
                  Guarde primero la ficha del observador (botón "Guardar Ficha") para habilitar el registro de anotaciones convivenciales.
                </div>
              } @else {
                <div class="v3-form-panel">
                  <div class="row g-3">
                    <div class="col-12 col-md-6">
                      <label class="form-label">Periodo</label>
                      <app-v3-searchable-select
                        [(ngModel)]="annForm.periodNumber"
                        [options]="periodOptions"
                        placeholder="Periodo..."
                        searchPlaceholder="Buscar..."
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <label class="form-label">Clasificación</label>
                      <app-v3-searchable-select
                        [(ngModel)]="annForm.severityLevel"
                        [options]="severityLevelOptions"
                        placeholder="Clasificación..."
                        searchPlaceholder="Buscar clasificación..."
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <label class="form-label">Fecha</label>
                      <input type="date" class="form-control" [(ngModel)]="annForm.annotationDate" />
                    </div>
                    <div class="col-12 col-md-6 d-flex align-items-end">
                      <div class="v3-form-switch-box">
                        <div class="form-check form-switch">
                          <input class="form-check-input" type="checkbox" id="guardNotif" [(ngModel)]="annForm.guardianNotified" />
                          <label class="form-check-label" for="guardNotif">Acudiente notificado</label>
                        </div>
                      </div>
                    </div>
                    <div class="col-12">
                      <label class="form-label">Anotación / Descripción de hechos *</label>
                      <textarea rows="3" class="form-control" [(ngModel)]="annForm.situationDescription" placeholder="Relato objetivo del comportamiento o situación..."></textarea>
                    </div>
                    <div class="col-12 col-md-6">
                      <label class="form-label">Descargos / Versión del Estudiante</label>
                      <input type="text" class="form-control" [(ngModel)]="annForm.studentVersion" />
                    </div>
                    <div class="col-12 col-md-6">
                      <label class="form-label">Tratamiento / Compromiso Pedagógico</label>
                      <input type="text" class="form-control" [(ngModel)]="annForm.pedagogicalCommitment" />
                    </div>
                    <div class="col-12 d-flex justify-content-end">
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
                      <div class="small text-muted"><strong>Tratamiento / Compromiso:</strong> {{ ann.pedagogicalCommitment }}</div>
                    }
                    <div class="small text-muted mt-1">
                      Acudiente notificado: <strong>{{ ann.guardianNotified ? 'Sí' : 'No' }}</strong>
                    </div>
                  </div>
                } @empty {
                  <p class="text-center text-muted small py-3 mb-0">Sin anotaciones registradas.</p>
                }
              </div>
            }

            @case ('families') {
              <div class="table-responsive">
                <table class="table table-sm table-hover v3-grid-table mb-0">
                    <thead>
                      <tr>
                        <th>Parentesco / Rol</th>
                        <th>Nombre Completo</th>
                        <th>Documento</th>
                        <th>Teléfono</th>
                        <th>Responsable Financiero</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (f of families(); track f.id) {
                        <tr>
                          <td>
                            <span class="badge text-bg-primary">{{ f.relationshipName }}</span>
                            @if (f.isPrimaryGuardian) {
                              <span class="badge text-bg-success ms-1">Acudiente Principal</span>
                            }
                          </td>
                          <td class="fw-semibold small">{{ f.familyFullName }}</td>
                          <td class="small font-monospace">{{ f.familyDocumentNumber }}</td>
                          <td class="small">{{ f.familyPhone || '—' }}</td>
                          <td class="small">{{ f.isFinancialResponsible ? 'Sí' : 'No' }}</td>
                        </tr>
                      } @empty {
                      <tr>
                        <td colspan="5" class="text-center text-muted py-4">No hay familiares o acudientes vinculados a este estudiante.</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          }
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
  readonly activeTab = signal<ObserverTab>('model5');
  readonly model5WizardStep = signal(0);
  readonly model5WizardSteps: readonly V3WizardStep[] = [
    {
      id: 'assessment',
      title: 'Valoración General',
      subtitle: 'Fortalezas, dificultades y compromisos del periodo',
      icon: 'psychology',
    },
    {
      id: 'physical',
      title: 'Perfil Físico y Personal',
      subtitle: 'Talla, peso, aficiones y situación laboral',
      icon: 'accessibility_new',
    },
    {
      id: 'family',
      title: 'Entorno Sociofamiliar',
      subtitle: 'Composición familiar y condiciones del hogar',
      icon: 'family_restroom',
    },
    {
      id: 'inclusion',
      title: 'Inclusión y PIAR',
      subtitle: 'Barreras para el aprendizaje y ajustes razonables',
      icon: 'diversity_3',
    },
  ];
  readonly enrollments = signal<EnrollmentRecord[]>([]);
  readonly templates = signal<ObserverTemplateRecord[]>([]);
  readonly observer = signal<StudentObserverView | null>(null);
  readonly families = signal<StudentFamilyLinkRecord[]>([]);

  readonly periodOptions: SearchableSelectOption<number>[] = [1, 2, 3, 4].map((p) => ({
    value: p,
    label: `P${p}`,
  }));
  readonly model3ScaleOptions: SearchableSelectOption<string>[] = [
    { value: '', label: '—' },
    { value: 'N', label: 'N' },
    { value: 'AV', label: 'AV' },
    { value: 'CS', label: 'CS' },
    { value: 'S', label: 'S' },
  ];
  readonly severityLevelOptions: SearchableSelectOption<
    'PRAISE' | 'MILD' | 'SERIOUS' | 'VERY_SERIOUS'
  >[] = [
    { value: 'PRAISE', label: 'Felicitación / Mérito' },
    { value: 'MILD', label: 'Situación Tipo I (Leve)' },
    { value: 'SERIOUS', label: 'Situación Tipo II (Grave)' },
    { value: 'VERY_SERIOUS', label: 'Situación Tipo III (Muy Grave)' },
  ];
  readonly enrollmentOptions = computed<SearchableSelectOption<number>[]>(() =>
    this.enrollments().map((e) => ({
      value: e.id,
      label: `${e.gradeName}-${e.groupCode} · ${e.studentFullName} (${e.studentDocumentNumber})`,
    }))
  );
  readonly templateOptions = computed<SearchableSelectOption<number>[]>(() =>
    this.templates().map((tpl) => ({ value: tpl.id, label: tpl.name }))
  );

  selectedEnrollmentId = 0;
  observerForm = {
    templateId: null as number | null,
    strengths: '',
    difficulties: '',
    commitments: '',
  };
  model5: Model5FormState = { ...DEFAULT_MODEL5 };
  model3: Record<string, { p1?: string; p2?: string; p3?: string; p4?: string }> = {};

  annForm = {
    periodNumber: 1,
    severityLevel: 'MILD' as 'PRAISE' | 'MILD' | 'SERIOUS' | 'VERY_SERIOUS',
    annotationDate: new Date().toISOString().slice(0, 10),
    situationDescription: '',
    studentVersion: '',
    pedagogicalCommitment: '',
    guardianNotified: false,
  };

  activeTemplate(): ObserverTemplateRecord | null {
    const list = this.templates();
    if (list.length === 0) return null;
    if (this.observerForm.templateId) {
      return list.find((t) => t.id === Number(this.observerForm.templateId)) ?? list[0];
    }
    return list[0];
  }

  ngOnInit(): void {
    this.loadMask.show('Cargando estudiantes...');
    const year = this.academicYear();
    forkJoin({
      enrollments: this.academicService.listEnrollments(year),
      courses: this.portalService.listTeacherCourses(year),
      templates: this.settingsService.listObserverTemplates(),
    })
      .pipe(finalize(() => this.loadMask.hide()))
      .subscribe({
        next: (res) => {
          const isStrictTeacher = this.auth.activeRole() === 'TEACHER';
          const allowedGroupIds = new Set(res.courses.map((c) => c.academicGroupId));
          const scopedEnrollments =
            isStrictTeacher && allowedGroupIds.size > 0
              ? res.enrollments.filter((e) => allowedGroupIds.has(e.academicGroupId))
              : res.enrollments;
          this.enrollments.set(scopedEnrollments);
          this.templates.set(res.templates);
        },
      });
  }

  loadObserver(): void {
    this.model5WizardStep.set(0);
    if (!this.selectedEnrollmentId) {
      this.observer.set(null);
      this.families.set([]);
      return;
    }
    const enrollment = this.enrollments().find(
      (e) => e.id === Number(this.selectedEnrollmentId),
    );
    this.loadMask.show('Cargando observador completo...');
    forkJoin({
      obs: this.portalService.getStudentObserver(
        Number(this.selectedEnrollmentId),
        this.academicYear(),
      ),
      extended: this.portalService.getObserverExtendedData(
        Number(this.selectedEnrollmentId),
      ),
      families: enrollment
        ? this.academicService.listStudentFamilies(enrollment.studentProfileId)
        : this.academicService.listStudentFamilies(0),
    })
      .pipe(finalize(() => this.loadMask.hide()))
      .subscribe({
        next: ({ obs, extended, families }) => {
          this.observer.set(obs);
          this.families.set(families);
          this.observerForm = {
            templateId: obs.templateId,
            strengths: obs.strengths ?? '',
            difficulties: obs.difficulties ?? '',
            commitments: obs.commitments ?? '',
          };
          this.model5 = {
            ...DEFAULT_MODEL5,
            ...(extended.observerModel5 as Partial<Model5FormState>),
          };
          this.model3 = { ...extended.observerModel3 };
        },
      });
  }

  saveObserverProfile(): void {
    this.loadMask.show('Guardando observador y ficha Modelo 5...');
    forkJoin({
      obs: this.portalService.upsertStudentObserver({
        enrollmentId: Number(this.selectedEnrollmentId),
        academicYear: this.academicYear(),
        templateId: this.observerForm.templateId || null,
        strengths: this.observerForm.strengths.trim() || null,
        difficulties: this.observerForm.difficulties.trim() || null,
        commitments: this.observerForm.commitments.trim() || null,
      }),
      extended: this.portalService.saveObserverExtendedData(
        Number(this.selectedEnrollmentId),
        { observerModel5: { ...this.model5 } },
      ),
    })
      .pipe(finalize(() => this.loadMask.hide()))
      .subscribe(({ obs }) => {
        this.observer.set(obs);
        this.messages.showSuccess('Ficha del observador y datos Modelo 5 guardados.');
      });
  }

  getModel3Value(criteriaId: number, periodKey: string): string {
    const entry = this.model3[String(criteriaId)];
    if (!entry) return '';
    return (entry as Record<string, string | undefined>)[periodKey] ?? '';
  }

  setModel3Value(criteriaId: number, periodKey: string, value: string): void {
    const key = String(criteriaId);
    const current = this.model3[key] ?? {};
    this.model3[key] = { ...current, [periodKey]: value };
  }

  saveModel3Matrix(): void {
    this.loadMask.show('Guardando matriz Modelo 3...');
    this.portalService
      .saveObserverExtendedData(Number(this.selectedEnrollmentId), {
        observerModel3: this.model3,
      })
      .pipe(finalize(() => this.loadMask.hide()))
      .subscribe(() => {
        this.messages.showSuccess('Criterios Modelo 3 guardados correctamente.');
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

  printObserverPdf(): void {
    this.academicService
      .enqueueJasperReport({
        templateName: 'observador_estudiante',
        outputFormat: 'pdf',
        parameters: {
          P_YEAR: this.academicYear(),
          P_ENROLLMENT_ID: Number(this.selectedEnrollmentId),
        },
      })
      .subscribe((res) => {
        this.messages.showSuccess(
          `Observador del estudiante encolado en PDF (Job #${res.jobId}).`,
        );
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
