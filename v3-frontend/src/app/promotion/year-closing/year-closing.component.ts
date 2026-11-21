import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { LoadMaskService } from '../../services/common/load-mask.service';
import { MessagesService } from '../../services/messages.service';
import {
  V3PromotionService,
  YearCertificateHeadersRecord,
} from '../../services/v3-promotion.service';
import { V3UnifiedAuthService } from '../../services/v3-unified-auth.service';

/**
 * Cierre y Reapertura Controlada del Año Lectivo (reemplaza CerrarAnioLectivoView de ExtJS).
 */
@Component({
  selector: 'app-year-closing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container-fluid py-3">
      <div class="breadcrumb-card mb-25 d-md-flex align-items-center justify-content-between">
        <div>
          <h5 class="mb-0 fw-bold">Cierre del Año Lectivo {{ academicYear() }}</h5>
          <small class="text-muted">Bloqueo de periodos académicos y consolidación institucional</small>
        </div>
        <ol class="breadcrumb list-unstyled mt-0 mb-0 p-0">
          <li class="breadcrumb-item d-inline-block position-relative">
            <a routerLink="/promotion" class="d-inline-block position-relative">Promoción</a>
          </li>
          <li class="breadcrumb-item d-inline-block position-relative">Cierre de Año</li>
        </ol>
      </div>

      <div class="trezo-card bg-white border-radius p-4 shadow-sm">
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
            <p class="text-muted small mb-0">
              Al cerrar el año lectivo se bloquean todos los periodos académicos del año para impedir
              modificaciones posteriores de calificaciones por parte de docentes.
            </p>
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
      ? `¿Confirma el CIERRE DEFINITIVO del año lectivo ${this.academicYear()} y sus periodos académicos?`
      : `¿Confirma la REAPERTURA del año lectivo ${this.academicYear()}?`;
    void this.messages.confirmDelete(prompt).then((r) => {
      if (!r.isConfirmed) return;
      this.loadMask.show('Actualizando estado del año lectivo...');
      this.promotionService
        .setYearClosedState(this.academicYear(), close)
        .pipe(finalize(() => this.loadMask.hide()))
        .subscribe({
          next: (res) => {
            this.messages.showSuccess(
              `Año ${res.academicYear} ${res.isClosed ? 'cerrado' : 'reabierto'} (${res.periodsUpdated} periodos actualizados).`,
            );
            this.loadState();
          },
        });
    });
  }
}
