import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { LoadMaskService } from '../../services/common/load-mask.service';
import { MessagesService } from '../../services/messages.service';
import {
  CloseAcademicYearResult,
  V3PromotionService,
  YearCertificateHeadersRecord,
} from '../../services/v3-promotion.service';
import { V3UnifiedAuthService } from '../../services/v3-unified-auth.service';

/**
 * Cierre, Clonación de 7 Tablas Maestras al Año Siguiente y Reapertura Controlada del Año Lectivo
 * (reemplaza CerrarAnioLectivoView + sp_close_year de ExtJS).
 */
@Component({
  selector: 'app-year-closing',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container-fluid py-3">
      <div class="breadcrumb-card mb-25 d-md-flex align-items-center justify-content-between">
        <div>
          <h5 class="mb-0 fw-bold">Cierre del Año Lectivo {{ academicYear() }}</h5>
          <small class="text-muted">Bloqueo de periodos académicos y clonación automática para {{ academicYear() + 1 }}</small>
        </div>
        <ol class="breadcrumb list-unstyled mt-0 mb-0 p-0">
          <li class="breadcrumb-item d-inline-block position-relative">
            <a routerLink="/promotion" class="d-inline-block position-relative">Promoción</a>
          </li>
          <li class="breadcrumb-item d-inline-block position-relative">Cierre de Año</li>
        </ol>
      </div>

      <div class="trezo-card bg-white border-radius p-4 shadow-sm mb-4">
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div>
            <h5 class="fw-bold mb-1">
              Estado actual del año {{ academicYear() }}:
              <span
                class="badge ms-2"
                [ngClass]="yearState()?.isClosed ? 'text-bg-danger' : 'text-bg-success'"
              >
                {{ yearState()?.isClosed ? 'CERRADO' : 'ABIERTO / ACTIVO' }}
              </span>
            </h5>
            <p class="text-muted small mb-2">
              Al cerrar el año lectivo se bloquean todos los periodos académicos del año para impedir
              modificaciones posteriores de calificaciones por parte de docentes.
            </p>
            @if (!yearState()?.isClosed) {
              <div class="form-check form-switch">
                <input
                  class="form-check-input"
                  type="checkbox"
                  id="cloneNextYearSw"
                  [(ngModel)]="cloneToNextYear"
                />
                <label class="form-check-label small fw-semibold" for="cloneNextYearSw">
                  Crear año lectivo {{ academicYear() + 1 }} y clonar 7 tablas maestras (escalas, dimensiones, reglas SIEE, plan de estudios, áreas/asignaturas, planta docente y periodos)
                </label>
              </div>
            }
          </div>
          <div class="d-flex gap-2">
            @if (!yearState()?.isClosed) {
              <button type="button" class="btn btn-danger" (click)="toggleClose(true)">
                <i class="material-symbols-outlined fs-6 align-middle me-1">lock</i>
                Cerrar Año Lectivo {{ academicYear() }}
              </button>
            } @else {
              <button type="button" class="btn btn-outline-warning" (click)="toggleClose(false)">
                <i class="material-symbols-outlined fs-6 align-middle me-1">lock_open</i>
                Reabrir Año Lectivo {{ academicYear() }}
              </button>
            }
          </div>
        </div>
      </div>

      @if (lastCloseResult(); as res) {
        @if (res.nextYearCloned && res.clonedCounts) {
          <div class="trezo-card bg-white border-radius p-4 shadow-sm">
            <h6 class="fw-bold mb-3 text-success">
              Clonación Automática Completada para el Año {{ res.nextYearCloned }}
            </h6>
            <div class="row g-2 small">
              <div class="col-md-3"><div class="p-2 border rounded bg-light">Escalas SIEE: <strong>{{ res.clonedCounts.gradingScales }}</strong></div></div>
              <div class="col-md-3"><div class="p-2 border rounded bg-light">Dimensiones: <strong>{{ res.clonedCounts.evaluationDimensions }}</strong></div></div>
              <div class="col-md-3"><div class="p-2 border rounded bg-light">Columnas dim.: <strong>{{ res.clonedCounts.evaluationDimensionColumns }}</strong></div></div>
              <div class="col-md-3"><div class="p-2 border rounded bg-light">Reglas SIEE: <strong>{{ res.clonedCounts.gradingRules }}</strong></div></div>
              <div class="col-md-3"><div class="p-2 border rounded bg-light">Plan estudios: <strong>{{ res.clonedCounts.curriculumStudyPlans }}</strong></div></div>
              <div class="col-md-3"><div class="p-2 border rounded bg-light">Áreas/Asig.: <strong>{{ res.clonedCounts.subjectAreaAssignments }}</strong></div></div>
              <div class="col-md-3"><div class="p-2 border rounded bg-light">Planta docente: <strong>{{ res.clonedCounts.teacherAcademicYears }}</strong></div></div>
              <div class="col-md-3"><div class="p-2 border rounded bg-light">Periodos: <strong>{{ res.clonedCounts.academicPeriods }}</strong></div></div>
            </div>
          </div>
        }
      }
    </div>
  `,
})
export class YearClosingComponent implements OnInit {
  private readonly promotionService = inject(V3PromotionService);
  private readonly auth = inject(V3UnifiedAuthService);
  private readonly messages = inject(MessagesService);
  private readonly loadMask = inject(LoadMaskService);

  readonly academicYear = computed(() => this.auth.academicYear());
  readonly yearState = signal<YearCertificateHeadersRecord | null>(null);
  readonly lastCloseResult = signal<CloseAcademicYearResult | null>(null);
  cloneToNextYear = true;

  ngOnInit(): void {
    this.loadState();
  }

  loadState(): void {
    this.promotionService
      .getCertificateHeaders(this.academicYear())
      .subscribe((state) => this.yearState.set(state));
  }

  toggleClose(close: boolean): void {
    const prompt = close
      ? `¿Confirma el CIERRE DEFINITIVO del año lectivo ${this.academicYear()}${this.cloneToNextYear ? ` y la clonación automática de la configuración hacia ${this.academicYear() + 1}` : ''}?`
      : `¿Confirma la REAPERTURA del año lectivo ${this.academicYear()}?`;
    void this.messages.confirmDelete(prompt).then((r) => {
      if (!r.isConfirmed) return;
      this.loadMask.show('Procesando cierre y clonación del año lectivo...');
      this.promotionService
        .setYearClosedState(this.academicYear(), close, this.cloneToNextYear)
        .pipe(finalize(() => this.loadMask.hide()))
        .subscribe({
          next: (res) => {
            this.lastCloseResult.set(res);
            const cloneMsg = res.nextYearCloned
              ? ` · Año ${res.nextYearCloned} inicializado y clonado.`
              : '';
            this.messages.showSuccess(
              `Año ${res.academicYear} ${res.isClosed ? 'cerrado' : 'reabierto'} (${res.periodsUpdated} periodos actualizados)${cloneMsg}`,
            );
            this.loadState();
          },
        });
    });
  }
}
