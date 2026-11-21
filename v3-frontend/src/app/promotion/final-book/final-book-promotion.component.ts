import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { LoadMaskService } from '../../services/common/load-mask.service';
import { MessagesService } from '../../services/messages.service';
import { V3AcademicService } from '../../services/v3-academic.service';
import {
  GroupManagerRecord,
  V3AdministrationService,
} from '../../services/v3-administration.service';
import {
  PromotionRecordView,
  PromotionStatusOption,
  V3PromotionService,
} from '../../services/v3-promotion.service';
import { V3UnifiedAuthService } from '../../services/v3-unified-auth.service';
import { CustomTooltipDirective } from '../../shared/directives/custom-tooltip.directive';

/**
 * Libro Final de Calificaciones, Actas de Promoción, Sábanas Finales y Diplomas
 * (reemplaza InformeFinalView, ObservacionesFinalesView, SabanasFinalesView, ActasPromocionView).
 */
@Component({
  selector: 'app-final-book-promotion',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CustomTooltipDirective],
  template: `
    <div class="container-fluid py-3">
      <div class="breadcrumb-card mb-25 d-md-flex align-items-center justify-content-between">
        <div>
          <h5 class="mb-0 fw-bold">Libro Final, Actas de Promoción y Sábanas</h5>
          <small class="text-muted">Año lectivo {{ academicYear() }}</small>
        </div>
        <ol class="breadcrumb list-unstyled mt-0 mb-0 p-0">
          <li class="breadcrumb-item d-inline-block position-relative">
            <a routerLink="/promotion" class="d-inline-block position-relative">Promoción</a>
          </li>
          <li class="breadcrumb-item d-inline-block position-relative">Libro Final</li>
        </ol>
      </div>

      <div class="trezo-card bg-white border-radius p-4 shadow-sm mb-4">
        <div class="row g-2 align-items-end">
          <div class="col-md-3">
            <label class="form-label small fw-semibold">Grupo (opcional)</label>
            <select class="form-select form-select-sm" [(ngModel)]="filterGroupId" (ngModelChange)="loadRecords()">
              <option [ngValue]="0">Todos los grupos</option>
              @for (g of groups(); track g.id) {
                <option [ngValue]="g.id">{{ g.gradeName }}-{{ g.groupCode }} ({{ g.campusName }})</option>
              }
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label small fw-semibold">Número de Acta de Promoción</label>
            <input type="text" class="form-control form-control-sm" [(ngModel)]="actNumber" placeholder="Ej. ACTA-2026-01" />
          </div>
          <div class="col-md-6 d-flex flex-wrap gap-2 justify-content-md-end">
            @if (canGenerate()) {
              <button type="button" class="btn btn-sm btn-primary" (click)="generateFinalBook()">
                <i class="material-symbols-outlined fs-6 align-middle me-1">calculate</i>
                Generar / Recalcular Libro Final
              </button>
            }
            <button
              type="button"
              class="btn btn-sm btn-outline-secondary"
              (click)="enqueueReport('libro_final_calificaciones')"
              [appCustomTooltip]="'Encolar Libro Final PDF en JasperReports'"
            >
              Libro Final PDF
            </button>
            <button
              type="button"
              class="btn btn-sm btn-outline-secondary"
              (click)="enqueueReport('sabanas_finales')"
              [appCustomTooltip]="'Encolar Sábanas Finales Excel/PDF'"
            >
              Sábanas Finales
            </button>
            <button
              type="button"
              class="btn btn-sm btn-outline-secondary"
              (click)="enqueueReport('acta_promocion')"
              [appCustomTooltip]="'Encolar Acta Oficial de Promoción'"
            >
              Actas PDF
            </button>
          </div>
        </div>
      </div>

      <div class="trezo-card bg-white border-radius p-4 shadow-sm">
        <div class="table-responsive">
          <table class="table table-hover v3-grid-table mb-0">
            <thead>
              <tr>
                <th class="text-center">#</th>
                <th>Estudiante</th>
                <th>Grado - Grupo</th>
                <th class="text-center">Promedio</th>
                <th class="text-center">Áreas Repr.</th>
                <th>Estado de Promoción</th>
                <th>Acta / Diploma</th>
                <th>Observación Final</th>
                <th class="text-end">Guardar</th>
              </tr>
            </thead>
            <tbody>
              @for (rec of records(); track rec.id) {
                <tr>
                  <td class="text-center fw-bold">{{ rec.groupRank ?? '—' }}</td>
                  <td>
                    <div class="fw-semibold">{{ rec.studentFullName }}</div>
                    <small class="text-muted font-monospace">{{ rec.studentDocumentNumber }}</small>
                  </td>
                  <td><span class="badge text-bg-light border text-dark">{{ rec.gradeName }}-{{ rec.groupCode }}</span></td>
                  <td class="text-center fw-bold text-primary">{{ rec.finalAverage }}</td>
                  <td class="text-center">
                    <span class="badge" [ngClass]="rec.failedAreasCount > 0 ? 'text-bg-danger' : 'text-bg-success'">
                      {{ rec.failedAreasCount }}
                    </span>
                  </td>
                  <td style="min-width: 220px;">
                    <select class="form-select form-select-sm" [value]="rec.promotionStatusId" #statusSel>
                      @for (st of statuses(); track st.id) {
                        <option [value]="st.id" [selected]="st.id === rec.promotionStatusId">{{ st.description }}</option>
                      }
                    </select>
                  </td>
                  <td style="min-width: 150px;">
                    <input type="text" class="form-control form-control-sm mb-1" [value]="rec.actNumber || ''" placeholder="Acta" #actIn />
                    <input type="text" class="form-control form-control-sm" [value]="rec.diplomaNumber || ''" placeholder="Diploma" #dipIn />
                  </td>
                  <td style="min-width: 200px;">
                    <input type="text" class="form-control form-control-sm" [value]="rec.observations || ''" placeholder="Observación final..." #obsIn />
                  </td>
                  <td class="text-end">
                    <button
                      type="button"
                      class="btn btn-sm btn-outline-primary"
                      (click)="saveRecord(rec, statusSel.value, actIn.value, dipIn.value, obsIn.value)"
                      [appCustomTooltip]="'Guardar cambios de promoción'"
                    >
                      <i class="material-symbols-outlined fs-6">save</i>
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="9" class="text-center text-muted py-4">
                    No hay registros de libro final para {{ academicYear() }}. Presione "Generar / Recalcular Libro Final".
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class FinalBookPromotionComponent implements OnInit {
  private readonly promotionService = inject(V3PromotionService);
  private readonly adminService = inject(V3AdministrationService);
  private readonly academicService = inject(V3AcademicService);
  private readonly auth = inject(V3UnifiedAuthService);
  private readonly messages = inject(MessagesService);
  private readonly loadMask = inject(LoadMaskService);

  readonly academicYear = computed(() => this.auth.academicYear());
  readonly canGenerate = computed(() =>
    this.auth.hasAnyRole(['SUPER_ADMIN', 'SCHOOL_ADMIN', 'RECTOR', 'COORDINATOR']),
  );

  readonly statuses = signal<PromotionStatusOption[]>([]);
  readonly groups = signal<GroupManagerRecord[]>([]);
  readonly records = signal<PromotionRecordView[]>([]);

  filterGroupId = 0;
  actNumber = '';

  ngOnInit(): void {
    this.loadMask.show('Cargando libro final...');
    const year = this.academicYear();
    forkJoin({
      statuses: this.promotionService.listStatuses(),
      groups: this.adminService.listGroupManagers(year),
      records: this.promotionService.listRecords(year),
    })
      .pipe(finalize(() => this.loadMask.hide()))
      .subscribe({
        next: (res) => {
          this.statuses.set(res.statuses);
          this.groups.set(res.groups);
          this.records.set(res.records);
        },
      });
  }

  loadRecords(): void {
    this.promotionService
      .listRecords(this.academicYear(), this.filterGroupId || undefined)
      .subscribe((rows) => this.records.set(rows));
  }

  generateFinalBook(): void {
    this.loadMask.show('Calculando libro final y puestos...');
    this.promotionService
      .generateFinalBook({
        academicYear: this.academicYear(),
        academicGroupId: this.filterGroupId || undefined,
        actNumber: this.actNumber.trim() || null,
      })
      .pipe(finalize(() => this.loadMask.hide()))
      .subscribe({
        next: ({ processedCount, records }) => {
          this.records.set(records);
          this.messages.showSuccess(`Libro final generado para ${processedCount} matrícula(s).`);
        },
      });
  }

  saveRecord(
    rec: PromotionRecordView,
    statusIdRaw: string,
    actVal: string,
    dipVal: string,
    obsVal: string,
  ): void {
    this.promotionService
      .updateRecord(rec.id, {
        promotionStatusId: Number(statusIdRaw),
        actNumber: actVal.trim() || null,
        diplomaNumber: dipVal.trim() || null,
        observations: obsVal.trim() || null,
      })
      .subscribe({
        next: () => {
          this.messages.showSuccess(`Registro actualizado para ${rec.studentFullName}.`);
          this.loadRecords();
        },
      });
  }

  enqueueReport(templateName: string): void {
    this.academicService
      .enqueueJasperReport({
        templateName,
        outputFormat: 'pdf',
        parameters: {
          P_YEAR: this.academicYear(),
          P_GROUP_ID: this.filterGroupId,
        },
      })
      .subscribe({
        next: (res) => {
          this.messages.showSuccess(`Reporte "${templateName}" encolado (Job #${res.jobId}).`);
        },
      });
  }
}
