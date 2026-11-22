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
  FinalSabanaReport,
  PromotionRecordView,
  PromotionStatusOption,
  V3PromotionService,
} from '../../services/v3-promotion.service';
import { V3UnifiedAuthService } from '../../services/v3-unified-auth.service';
import { V3ModalDialogComponent } from '../../shared/components/v3-modal-dialog/v3-modal-dialog.component';
import {
  SearchableSelectOption,
  V3SearchableSelectComponent,
} from '../../shared/components/v3-searchable-select/v3-searchable-select.component';
import { CustomTooltipDirective } from '../../shared/directives/custom-tooltip.directive';

/**
 * Libro Final de Calificaciones, Actas de Promoción, Habilitaciones Finales SIEE y Sábanas
 * (reemplaza InformeFinalView, ObservacionesFinalesView, SabanasFinalesView, ActasPromocionView).
 */
@Component({
  selector: 'app-final-book-promotion',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    CustomTooltipDirective,
    V3ModalDialogComponent,
    V3SearchableSelectComponent,
  ],
  template: `
    <div class="container-fluid py-3">
      <div class="breadcrumb-card mb-25 d-md-flex align-items-center justify-content-between">
        <div>
          <h5 class="mb-0 fw-bold">Libro Final, Actas de Promoción y Sábanas SIEE</h5>
          <small class="text-muted">Año lectivo {{ academicYear() }} · Motor Decreto 1290</small>
        </div>
        <ol class="breadcrumb list-unstyled mt-0 mb-0 p-0">
          <li class="breadcrumb-item d-inline-block position-relative">
            <a routerLink="/promotion" class="d-inline-block position-relative">Promoción</a>
          </li>
          <li class="breadcrumb-item d-inline-block position-relative">Libro Final</li>
        </ol>
      </div>

      <div class="trezo-card bg-white border-radius p-4 shadow-sm mb-4">
        <div class="row g-3">
          <div class="col-12 col-md-6">
            <label class="form-label">Grupo (opcional)</label>
            <app-v3-searchable-select
              [(ngModel)]="filterGroupId"
              [options]="groupFilterOptions()"
              [clearable]="true"
              placeholder="Todos los grupos"
              searchPlaceholder="Buscar grupo o sede..."
              (ngModelChange)="loadRecords()"
            />
          </div>
          <div class="col-12 col-md-6">
            <label class="form-label">Acta de Promoción</label>
            <input type="text" class="form-control" [(ngModel)]="actNumber" placeholder="Ej. ACTA-2026-01" />
          </div>
          <div class="col-12 d-flex flex-wrap justify-content-end gap-2 pt-2 border-top">
            @if (canGenerate()) {
              <button
                type="button"
                class="btn btn-sm btn-primary"
                (click)="generateFinalBook()"
                [appCustomTooltip]="'Evaluar áreas, nivelaciones y puestos bajo reglas SIEE Decreto 1290'"
              >
                <i class="material-symbols-outlined fs-6 align-middle me-1">calculate</i>
                Calcular Libro Final
              </button>
              <button
                type="button"
                class="btn btn-sm btn-outline-warning"
                (click)="generateFinalRecoveries()"
                [appCustomTooltip]="'Generar actas de habilitación final únicamente para estudiantes elegibles SIEE'"
              >
                <i class="material-symbols-outlined fs-6 align-middle me-1">assignment_turned_in</i>
                Habilitaciones SIEE
              </button>
            }
            <button
              type="button"
              class="btn btn-sm btn-outline-info"
              (click)="openFinalSabana()"
              [appCustomTooltip]="'Visualizar sábana final anual interactiva en pantalla'"
            >
              <i class="material-symbols-outlined fs-6 align-middle me-1">table_view</i>
              Sábana Final
            </button>
            <button
              type="button"
              class="btn btn-sm btn-outline-secondary"
              (click)="downloadReport('libro_final', 'pdf')"
              [appCustomTooltip]="'Descargar Libro Final en PDF (Gotenberg 8)'"
            >
              Libro PDF
            </button>
            <button
              type="button"
              class="btn btn-sm btn-outline-success"
              (click)="downloadReport('informe_final_grado', 'xlsx')"
              [appCustomTooltip]="'Descargar Sábana Final en Excel (.xlsx)'"
            >
              Sábana XLSX
            </button>
            <button
              type="button"
              class="btn btn-sm btn-outline-secondary"
              (click)="downloadReport('acta_grado', 'pdf')"
              [appCustomTooltip]="'Descargar Acta Oficial de Promoción/Grado en PDF'"
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
                <th class="text-center">Prom. / Rec.</th>
                <th class="text-center">Áreas (Apr / Rep)</th>
                <th>Estado de Promoción</th>
                <th class="text-center">Comisión</th>
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
                  <td class="text-center">
                    <div class="fw-bold text-primary">{{ rec.finalAverage }}</div>
                    @if (rec.recoveryAverage > 0) {
                      <small class="text-success">Rec: {{ rec.recoveryAverage }}</small>
                    }
                  </td>
                  <td class="text-center text-nowrap">
                    <span class="badge text-bg-success me-1">{{ rec.passedAreasCount ?? 0 }}</span>
                    <span class="badge" [ngClass]="rec.failedAreasCount > 0 ? 'text-bg-danger' : 'text-bg-secondary'">
                      {{ rec.failedAreasCount }}
                    </span>
                  </td>
                  <td style="min-width: 210px;">
                    @if (canEditCommission()) {
                      <app-v3-searchable-select
                        size="sm"
                        [ngModel]="getRowStatusId(rec)"
                        (ngModelChange)="setRowStatusId(rec.id, $event, rec.promotionStatusId)"
                        [options]="promotionStatusOptions()"
                        placeholder="Estado..."
                        searchPlaceholder="Buscar estado..."
                      />
                    } @else {
                      <span class="small fw-medium">{{ rec.promotionStatusDescription }}</span>
                    }
                  </td>
                  <td class="text-center">
                    <div class="form-check form-switch d-inline-block">
                      <input
                        class="form-check-input"
                        type="checkbox"
                        [checked]="rec.isCommissionPromoted"
                        [disabled]="!canEditCommission()"
                        #commChk
                        [appCustomTooltip]="'Promovido por Comisión de Evaluación y Promoción'"
                      />
                    </div>
                  </td>
                  <td style="min-width: 145px;">
                    <input type="text" class="form-control form-control-sm mb-1" [value]="rec.actNumber || ''" [disabled]="!canSaveRecord()" placeholder="Acta" #actIn />
                    <input type="text" class="form-control form-control-sm" [value]="rec.diplomaNumber || ''" [disabled]="!canEditFolios()" placeholder="Diploma" #dipIn />
                  </td>
                  <td style="min-width: 190px;">
                    <input type="text" class="form-control form-control-sm" [value]="rec.observations || ''" [disabled]="!canSaveRecord()" placeholder="Observación final..." #obsIn />
                  </td>
                  <td class="text-end">
                    @if (canSaveRecord()) {
                      <button
                        type="button"
                        class="btn btn-sm btn-outline-primary"
                        (click)="saveRecord(rec, getRowStatusId(rec), commChk.checked, actIn.value, dipIn.value, obsIn.value)"
                        [appCustomTooltip]="'Guardar cambios de promoción'"
                      >
                        <i class="material-symbols-outlined fs-6">save</i>
                      </button>
                    }
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="10" class="text-center text-muted py-4">
                    No hay registros de libro final para {{ academicYear() }}. Presione "Calcular Libro Final".
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal Sábana Final Anual Interactiva -->
      <app-v3-modal-dialog
        [open]="sabanaModalOpen()"
        [heading]="'Sábana Final Anual · ' + academicYear()"
        icon="table_view"
        size="xl"
        (closed)="sabanaModalOpen.set(false)"
      >
        @if (finalSabana(); as sabana) {
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="small text-muted">
              {{ sabana.students.length }} estudiante(s) · {{ sabana.subjects.length }} asignatura(s) evaluadas
            </span>
            <button
              type="button"
              class="btn btn-sm btn-outline-success"
              (click)="downloadReport('informe_final_grado', 'xlsx')"
            >
              Exportar Excel (.xlsx)
            </button>
          </div>
          <div class="table-responsive" style="max-height: 62vh;">
            <table class="table table-sm table-bordered align-middle mb-0 small">
              <thead class="table-dark sticky-top">
                <tr>
                  <th class="text-center">#</th>
                  <th>Estudiante</th>
                  <th class="text-center">Grupo</th>
                  @for (sub of sabana.subjects; track sub.subjectId) {
                    <th class="text-center" [appCustomTooltip]="sub.subjectName + ' (' + sub.academicAreaName + ')'">
                      {{ sub.abbreviation || sub.subjectName.slice(0, 6) }}
                    </th>
                  }
                  <th class="text-center">Prom.</th>
                  <th class="text-center">Áreas Rep.</th>
                  <th>Estado Final</th>
                </tr>
              </thead>
              <tbody>
                @for (st of sabana.students; track st.enrollmentId) {
                  <tr>
                    <td class="text-center fw-bold">{{ st.groupRank ?? '—' }}</td>
                    <td class="fw-semibold text-nowrap">{{ st.studentFullName }}</td>
                    <td class="text-center">{{ st.gradeName }}-{{ st.groupCode }}</td>
                    @for (sub of sabana.subjects; track sub.subjectId) {
                      @let cell = st.scoresBySubject[sub.subjectId];
                      <td
                        class="text-center"
                        [ngClass]="cell?.isFailed ? 'table-danger fw-bold text-danger' : ''"
                      >
                        @if (cell) {
                          <div>{{ cell.finalEffectiveScore }}</div>
                          @if (cell.finalRecoveryScore !== null) {
                            <small class="text-success d-block">R:{{ cell.finalRecoveryScore }}</small>
                          }
                        } @else {
                          <span class="text-muted">—</span>
                        }
                      </td>
                    }
                    <td class="text-center fw-bold text-primary">{{ st.finalAverage }}</td>
                    <td class="text-center">
                      <span class="badge" [ngClass]="st.failedAreasCount > 0 ? 'text-bg-danger' : 'text-bg-success'">
                        {{ st.failedAreasCount }}
                      </span>
                    </td>
                    <td class="text-nowrap">
                      {{ st.promotionStatusDescription || 'Pendiente' }}
                      @if (st.isCommissionPromoted) {
                        <span class="badge text-bg-info ms-1">Comisión</span>
                      }
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td [attr.colspan]="sabana.subjects.length + 6" class="text-center text-muted py-4">
                      Sin datos de sábana final para los filtros seleccionados.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </app-v3-modal-dialog>
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
    this.auth.hasPermission('promotion.final_book.generate'),
  );
  readonly canEditCommission = computed(() =>
    this.auth.hasPermission('promotion.records.commission_edit'),
  );
  readonly canEditFolios = computed(() =>
    this.auth.hasPermission('promotion.records.folios_edit'),
  );
  readonly canSaveRecord = computed(
    () => this.canEditCommission() || this.canEditFolios(),
  );

  readonly statuses = signal<PromotionStatusOption[]>([]);
  readonly groups = signal<GroupManagerRecord[]>([]);
  readonly records = signal<PromotionRecordView[]>([]);
  readonly sabanaModalOpen = signal(false);
  readonly finalSabana = signal<FinalSabanaReport | null>(null);

  readonly groupFilterOptions = computed<SearchableSelectOption<number>[]>(() =>
    this.groups().map((g) => ({
      value: g.id,
      label: `${g.gradeName}-${g.groupCode} (${g.campusName})`,
    }))
  );
  readonly promotionStatusOptions = computed<SearchableSelectOption<number>[]>(() =>
    this.statuses().map((st) => ({ value: st.id, label: st.description }))
  );

  private rowStatusIds: Record<number, number> = {};
  filterGroupId = 0;
  actNumber = '';

  getRowStatusId(rec: PromotionRecordView): number {
    return this.rowStatusIds[rec.id] ?? rec.promotionStatusId;
  }

  setRowStatusId(recordId: number, statusId: number | null, fallbackId: number): void {
    this.rowStatusIds[recordId] = statusId ?? fallbackId;
  }

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
    this.rowStatusIds = {};
    this.promotionService
      .listRecords(this.academicYear(), this.filterGroupId || undefined)
      .subscribe((rows) => this.records.set(rows));
  }

  generateFinalBook(): void {
    this.loadMask.show('Calculando libro final SIEE y puestos...');
    this.promotionService
      .generateFinalBook({
        academicYear: this.academicYear(),
        academicGroupId: this.filterGroupId || undefined,
        actNumber: this.actNumber.trim() || null,
      })
      .pipe(finalize(() => this.loadMask.hide()))
      .subscribe({
        next: ({ processedCount, records }) => {
          this.rowStatusIds = {};
          this.records.set(records);
          this.messages.showSuccess(`Libro final generado para ${processedCount} matrícula(s).`);
        },
      });
  }

  generateFinalRecoveries(): void {
    this.loadMask.show('Generando actas de habilitación final SIEE...');
    this.promotionService
      .generateFinalRecoveries({
        academicYear: this.academicYear(),
        academicGroupId: this.filterGroupId || undefined,
      })
      .pipe(finalize(() => this.loadMask.hide()))
      .subscribe({
        next: (res) => {
          this.messages.showSuccess(
            `Habilitaciones SIEE: ${res.eligibleStudentsCount} estudiante(s) elegible(s), ${res.generatedRecordsCount} acta(s) creada(s) (${res.skippedExistingCount} ya existentes).`,
          );
        },
      });
  }

  openFinalSabana(): void {
    this.loadMask.show('Consultando sábana final anual...');
    this.promotionService
      .getFinalSabana(this.academicYear(), this.filterGroupId || undefined)
      .pipe(finalize(() => this.loadMask.hide()))
      .subscribe({
        next: (sabana) => {
          this.finalSabana.set(sabana);
          this.sabanaModalOpen.set(true);
        },
      });
  }

  saveRecord(
    rec: PromotionRecordView,
    statusId: number,
    isCommissionPromoted: boolean,
    actVal: string,
    dipVal: string,
    obsVal: string,
  ): void {
    const payload: Record<string, unknown> = {
      actNumber: actVal.trim() || null,
      observations: obsVal.trim() || null,
    };
    if (this.canEditCommission()) {
      payload['promotionStatusId'] = Number(statusId);
      payload['isCommissionPromoted'] = isCommissionPromoted;
    }
    if (this.canEditFolios()) {
      payload['diplomaNumber'] = dipVal.trim() || null;
    }

    this.promotionService
      .updateRecord(rec.id, payload)
      .subscribe({
        next: () => {
          delete this.rowStatusIds[rec.id];
          this.messages.showSuccess(`Registro actualizado para ${rec.studentFullName}.`);
          this.loadRecords();
        },
      });
  }

  downloadReport(templateName: string, outputFormat: 'pdf' | 'xlsx'): void {
    this.loadMask.show('Generando documento oficial...');
    this.academicService
      .downloadDirectReport({
        templateName,
        outputFormat,
        parameters: {
          P_YEAR: this.academicYear(),
          ...(this.filterGroupId ? { P_GROUP_ID: this.filterGroupId } : {}),
        },
      })
      .pipe(finalize(() => this.loadMask.hide()))
      .subscribe({
        next: (response) => {
          this.academicService.triggerBrowserBlobDownload(
            response,
            `${templateName}_${this.academicYear()}.${outputFormat}`,
          );
          this.messages.showSuccess(`Documento "${templateName}" descargado correctamente.`);
        },
      });
  }
}
