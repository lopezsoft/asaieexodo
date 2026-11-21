import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { LoadMaskService } from '../../services/common/load-mask.service';
import { MessagesService } from '../../services/messages.service';
import {
  AcademicPeriodRecord,
  EvaluationDimensionRecord,
  GradeGroupRecord,
  GradingRuleRecord,
  GradingScaleRecord,
  NationalGradingScaleItem,
  V3SettingsService,
} from '../../services/v3-settings.service';
import { V3UnifiedAuthService } from '../../services/v3-unified-auth.service';
import { CustomTooltipDirective } from '../../shared/directives/custom-tooltip.directive';

type EvaluationTab = 'rules' | 'periods' | 'scales' | 'dimensions';

/**
 * Evaluación y SIEE (reemplaza ConfiguraGeneralView, PeriodosView, EscalaView,
 * CompetenciasView, ColumnasNotasCompetenciasView y Eliminar Notas en Cero de ExtJS).
 */
@Component({
  selector: 'app-evaluation-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CustomTooltipDirective],
  template: `
    <div class="container-fluid py-3">
      <div class="breadcrumb-card mb-25 d-md-flex align-items-center justify-content-between">
        <div>
          <h5 class="mb-0 fw-bold">Evaluación y SIEE ({{ v3Auth.academicYear() }})</h5>
          <small class="text-muted">Reglas de promoción, periodos académicos, escala y competencias</small>
        </div>
        <div class="d-flex align-items-center gap-2">
          @if (canAdmin()) {
            <button
              type="button"
              class="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1"
              (click)="cleanupZeroGrades()"
              [appCustomTooltip]="'Eliminar calificaciones en cero no bloqueadas del año actual'"
            >
              <i class="material-symbols-outlined fs-6">cleaning_services</i>
              <span>Eliminar notas en cero</span>
            </button>
          }
          <a routerLink="/settings" class="btn btn-sm btn-outline-secondary">Volver</a>
        </div>
      </div>

      <ul class="nav nav-pills mb-3 gap-2">
        <li class="nav-item">
          <button type="button" class="nav-link" [class.active]="activeTab() === 'rules'" (click)="activeTab.set('rules')">
            Reglas de Promoción ({{ rules().length }})
          </button>
        </li>
        <li class="nav-item">
          <button type="button" class="nav-link" [class.active]="activeTab() === 'periods'" (click)="activeTab.set('periods')">
            Periodos Académicos ({{ periods().length }})
          </button>
        </li>
        <li class="nav-item">
          <button type="button" class="nav-link" [class.active]="activeTab() === 'scales'" (click)="activeTab.set('scales')">
            Escala de Desempeños ({{ scales().length }})
          </button>
        </li>
        <li class="nav-item">
          <button type="button" class="nav-link" [class.active]="activeTab() === 'dimensions'" (click)="activeTab.set('dimensions')">
            Competencias y Columnas ({{ dimensions().length }})
          </button>
        </li>
      </ul>

      <div class="trezo-card bg-white border-radius p-4 shadow-sm">
        @switch (activeTab()) {
          @case ('rules') {
            @if (canAdmin()) {
              <div class="row g-2 align-items-end mb-4 p-3 rounded bg-light border">
                <div class="col-md-3">
                  <label class="form-label small fw-semibold">Grupo de grados *</label>
                  <select class="form-select form-select-sm" [(ngModel)]="newRule.gradeGroupId">
                    <option [ngValue]="null">Seleccione...</option>
                    @for (gg of gradeGroups(); track gg.id) {
                      <option [ngValue]="gg.id">{{ gg.name }}</option>
                    }
                  </select>
                </div>
                <div class="col-md-2">
                  <label class="form-label small fw-semibold">Nota aprob.</label>
                  <input type="number" step="0.1" class="form-control form-control-sm" [(ngModel)]="newRule.minPassingScore" />
                </div>
                <div class="col-md-2">
                  <label class="form-label small fw-semibold">Máx. nivelación</label>
                  <input type="number" step="0.1" class="form-control form-control-sm" [(ngModel)]="newRule.maxRecoveryScore" />
                </div>
                <div class="col-md-1">
                  <label class="form-label small fw-semibold">Decimales</label>
                  <input type="number" min="0" max="4" class="form-control form-control-sm" [(ngModel)]="newRule.decimalsCount" />
                </div>
                <div class="col-md-2">
                  <label class="form-label small fw-semibold">Áreas reprueba</label>
                  <input type="number" min="1" class="form-control form-control-sm" [(ngModel)]="newRule.failedAreasLimit" />
                </div>
                <div class="col-md-2 d-grid">
                  <button type="button" class="btn btn-sm btn-primary" [disabled]="!newRule.gradeGroupId" (click)="saveRule()">
                    Guardar regla
                  </button>
                </div>
              </div>
            }
            <div class="table-responsive">
              <table class="table table-hover v3-grid-table mb-0">
                <thead>
                  <tr>
                    <th>Grupo de Grados</th>
                    <th class="text-center">Nota Mín.</th>
                    <th class="text-center">Máx. Recup.</th>
                    <th class="text-center">Decimales</th>
                    <th class="text-center">Áreas Pierde</th>
                    <th class="text-center">% Inasist.</th>
                    <th class="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  @for (rule of rules(); track rule.id) {
                    <tr>
                      <td class="fw-medium">{{ rule.gradeGroupName }}</td>
                      <td class="text-center">{{ rule.minPassingScore }}</td>
                      <td class="text-center">{{ rule.maxRecoveryScore }}</td>
                      <td class="text-center">{{ rule.decimalsCount }}</td>
                      <td class="text-center">{{ rule.failedAreasLimit }}</td>
                      <td class="text-center">{{ rule.absenceFailPercentage }}%</td>
                      <td class="text-end">
                        @if (canAdmin()) {
                          <button type="button" class="btn btn-sm btn-outline-danger" (click)="deleteRule(rule)" [appCustomTooltip]="'Eliminar regla'">
                            <i class="material-symbols-outlined fs-6">delete</i>
                          </button>
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }

          @case ('periods') {
            @if (canWrite()) {
              <div class="row g-2 align-items-end mb-4 p-3 rounded bg-light border">
                <div class="col-md-1">
                  <label class="form-label small fw-semibold">N° *</label>
                  <input type="number" min="1" max="6" class="form-control form-control-sm" [(ngModel)]="newPeriod.periodNumber" />
                </div>
                <div class="col-md-3">
                  <label class="form-label small fw-semibold">Nombre *</label>
                  <input type="text" class="form-control form-control-sm" [(ngModel)]="newPeriod.name" placeholder="Primer Periodo" />
                </div>
                <div class="col-md-2">
                  <label class="form-label small fw-semibold">Peso % *</label>
                  <input type="number" class="form-control form-control-sm" [(ngModel)]="newPeriod.weightPercentage" />
                </div>
                <div class="col-md-2">
                  <label class="form-label small fw-semibold">Inicio *</label>
                  <input type="date" class="form-control form-control-sm" [(ngModel)]="newPeriod.startDate" />
                </div>
                <div class="col-md-2">
                  <label class="form-label small fw-semibold">Fin *</label>
                  <input type="date" class="form-control form-control-sm" [(ngModel)]="newPeriod.endDate" />
                </div>
                <div class="col-md-2 d-grid">
                  <button
                    type="button"
                    class="btn btn-sm btn-primary"
                    [disabled]="!newPeriod.name.trim() || !newPeriod.startDate || !newPeriod.endDate"
                    (click)="savePeriod()"
                  >
                    Agregar periodo
                  </button>
                </div>
              </div>
            }
            <div class="table-responsive">
              <table class="table table-hover v3-grid-table mb-0">
                <thead>
                  <tr>
                    <th class="text-center">#</th>
                    <th>Periodo</th>
                    <th class="text-center">Peso %</th>
                    <th>Vigencia</th>
                    <th class="text-center">Estado</th>
                    <th class="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  @for (p of periods(); track p.id) {
                    <tr>
                      <td class="text-center fw-bold">{{ p.periodNumber }}</td>
                      <td class="fw-medium">{{ p.name }}</td>
                      <td class="text-center">{{ p.weightPercentage }}%</td>
                      <td class="small">{{ p.startDate }} → {{ p.endDate }}</td>
                      <td class="text-center">
                        <span class="badge" [ngClass]="p.isClosed ? 'text-bg-danger' : 'text-bg-success'">
                          {{ p.isClosed ? 'Bloqueado' : 'Abierto' }}
                        </span>
                      </td>
                      <td class="text-end text-nowrap">
                        @if (canWrite()) {
                          <button
                            type="button"
                            class="btn btn-sm btn-outline-warning me-1"
                            (click)="togglePeriodLock(p)"
                            [appCustomTooltip]="p.isClosed ? 'Reabrir periodo' : 'Bloquear periodo'"
                          >
                            <i class="material-symbols-outlined fs-6">{{ p.isClosed ? 'lock_open' : 'lock' }}</i>
                          </button>
                        }
                        @if (canAdmin()) {
                          <button type="button" class="btn btn-sm btn-outline-danger" (click)="deletePeriod(p)" [appCustomTooltip]="'Eliminar periodo'">
                            <i class="material-symbols-outlined fs-6">delete</i>
                          </button>
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }

          @case ('scales') {
            @if (canAdmin()) {
              <div class="row g-2 align-items-end mb-4 p-3 rounded bg-light border">
                <div class="col-md-3">
                  <label class="form-label small fw-semibold">Desempeño Nacional *</label>
                  <select class="form-select form-select-sm" [(ngModel)]="newScale.nationalScaleId">
                    <option [ngValue]="null">Seleccione...</option>
                    @for (ns of nationalScales(); track ns.id) {
                      <option [ngValue]="ns.id">{{ ns.name }} ({{ ns.abbreviation }})</option>
                    }
                  </select>
                </div>
                <div class="col-md-3">
                  <label class="form-label small fw-semibold">Grupo de grados</label>
                  <select class="form-select form-select-sm" [(ngModel)]="newScale.gradeGroupId">
                    <option [ngValue]="null">Todos los grados</option>
                    @for (gg of gradeGroups(); track gg.id) {
                      <option [ngValue]="gg.id">{{ gg.name }}</option>
                    }
                  </select>
                </div>
                <div class="col-md-2">
                  <label class="form-label small fw-semibold">Desde *</label>
                  <input type="number" step="0.01" class="form-control form-control-sm" [(ngModel)]="newScale.minScore" />
                </div>
                <div class="col-md-2">
                  <label class="form-label small fw-semibold">Hasta *</label>
                  <input type="number" step="0.01" class="form-control form-control-sm" [(ngModel)]="newScale.maxScore" />
                </div>
                <div class="col-md-2 d-grid">
                  <button type="button" class="btn btn-sm btn-primary" [disabled]="!newScale.nationalScaleId" (click)="saveScale()">
                    Guardar rango
                  </button>
                </div>
              </div>
            }
            <div class="table-responsive">
              <table class="table table-hover v3-grid-table mb-0">
                <thead>
                  <tr>
                    <th>Desempeño MEN</th>
                    <th>Grupo de Grados</th>
                    <th class="text-center">Desde</th>
                    <th class="text-center">Hasta</th>
                    <th class="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  @for (s of scales(); track s.id) {
                    <tr>
                      <td class="fw-medium">{{ s.nationalScaleName }} ({{ s.nationalScaleAbbreviation }})</td>
                      <td>{{ s.gradeGroupName || 'General' }}</td>
                      <td class="text-center">{{ s.minScore }}</td>
                      <td class="text-center">{{ s.maxScore }}</td>
                      <td class="text-end">
                        @if (canAdmin()) {
                          <button type="button" class="btn btn-sm btn-outline-danger" (click)="deleteScale(s)" [appCustomTooltip]="'Eliminar rango de escala'">
                            <i class="material-symbols-outlined fs-6">delete</i>
                          </button>
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }

          @case ('dimensions') {
            @if (canWrite()) {
              <div class="row g-2 align-items-end mb-4 p-3 rounded bg-light border">
                <div class="col-md-1">
                  <label class="form-label small fw-semibold">Cód. *</label>
                  <input type="number" min="1" max="20" class="form-control form-control-sm" [(ngModel)]="newDim.dimensionCode" />
                </div>
                <div class="col-md-4">
                  <label class="form-label small fw-semibold">Competencia / Dimensión *</label>
                  <input type="text" class="form-control form-control-sm" [(ngModel)]="newDim.name" placeholder="Ej. Saber Cognitivo" />
                </div>
                <div class="col-md-2">
                  <label class="form-label small fw-semibold">Abrev.</label>
                  <input type="text" class="form-control form-control-sm" [(ngModel)]="newDim.abbreviation" />
                </div>
                <div class="col-md-2">
                  <label class="form-label small fw-semibold">Porcentaje % *</label>
                  <input type="number" class="form-control form-control-sm" [(ngModel)]="newDim.weightPercentage" />
                </div>
                <div class="col-md-3 d-grid">
                  <button type="button" class="btn btn-sm btn-primary" [disabled]="!newDim.name.trim()" (click)="saveDimension()">
                    Agregar competencia
                  </button>
                </div>
              </div>
            }

            <div class="row g-3">
              @for (dim of dimensions(); track dim.id) {
                <div class="col-lg-6">
                  <div class="border rounded p-3 h-100">
                    <div class="d-flex align-items-center justify-content-between mb-2">
                      <div>
                        <strong>#{{ dim.dimensionCode }} {{ dim.name }}</strong>
                        <span class="badge text-bg-primary ms-2">{{ dim.weightPercentage }}%</span>
                      </div>
                      @if (canAdmin()) {
                        <button type="button" class="btn btn-sm btn-outline-danger" (click)="deleteDimension(dim)" [appCustomTooltip]="'Eliminar competencia'">
                          <i class="material-symbols-outlined fs-6">delete</i>
                        </button>
                      }
                    </div>

                    <ul class="list-group list-group-flush mb-2">
                      @for (col of dim.columns; track col.id) {
                        <li class="list-group-item px-0 py-1 d-flex justify-content-between align-items-center small">
                          <span>Columna #{{ col.columnNumber }}: {{ col.label }} ({{ col.weightPercentage }}%)</span>
                          @if (canWrite()) {
                            <button type="button" class="btn btn-sm btn-link text-danger p-0" (click)="deleteColumn(dim.id, col.id)" [appCustomTooltip]="'Eliminar columna'">
                              <i class="material-symbols-outlined fs-6">close</i>
                            </button>
                          }
                        </li>
                      } @empty {
                        <li class="list-group-item px-0 py-1 small text-muted">Sin columnas configuradas.</li>
                      }
                    </ul>

                    @if (canWrite()) {
                      <div class="input-group input-group-sm mt-2">
                        <input type="number" min="1" max="30" class="form-control" style="max-width: 72px;" placeholder="#" [(ngModel)]="columnDraft(dim.id).columnNumber" />
                        <input type="text" class="form-control" placeholder="Etiqueta columna" [(ngModel)]="columnDraft(dim.id).label" />
                        <input type="number" class="form-control" style="max-width: 76px;" placeholder="%" [(ngModel)]="columnDraft(dim.id).weightPercentage" />
                        <button type="button" class="btn btn-outline-primary" (click)="addColumn(dim.id)">+</button>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
          }
        }
      </div>
    </div>
  `,
})
export class EvaluationSettingsComponent implements OnInit {
  protected readonly v3Auth = inject(V3UnifiedAuthService);
  private readonly settingsService = inject(V3SettingsService);
  private readonly maskService = inject(LoadMaskService);
  private readonly messages = inject(MessagesService);

  readonly activeTab = signal<EvaluationTab>('rules');
  readonly gradeGroups = signal<GradeGroupRecord[]>([]);
  readonly rules = signal<GradingRuleRecord[]>([]);
  readonly periods = signal<AcademicPeriodRecord[]>([]);
  readonly nationalScales = signal<NationalGradingScaleItem[]>([]);
  readonly scales = signal<GradingScaleRecord[]>([]);
  readonly dimensions = signal<EvaluationDimensionRecord[]>([]);

  readonly canAdmin = computed(() => {
    const r = this.v3Auth.activeRole();
    return r === 'SUPER_ADMIN' || r === 'SCHOOL_ADMIN' || r === 'RECTOR';
  });
  readonly canWrite = computed(
    () => this.canAdmin() || this.v3Auth.activeRole() === 'COORDINATOR',
  );

  newRule: { gradeGroupId: number | null; minPassingScore: number; maxRecoveryScore: number; decimalsCount: number; failedAreasLimit: number } = {
    gradeGroupId: null,
    minPassingScore: 3.0,
    maxRecoveryScore: 3.0,
    decimalsCount: 2,
    failedAreasLimit: 3,
  };
  newPeriod = { periodNumber: 1, name: '', weightPercentage: 25, startDate: '', endDate: '' };
  newScale: { nationalScaleId: number | null; gradeGroupId: number | null; minScore: number; maxScore: number } = {
    nationalScaleId: null,
    gradeGroupId: null,
    minScore: 1.0,
    maxScore: 2.99,
  };
  newDim = { dimensionCode: 1, name: '', abbreviation: '', weightPercentage: 30 };

  private readonly columnDrafts = new Map<
    number,
    { columnNumber: number; label: string; weightPercentage: number }
  >();

  constructor() {
    effect(() => {
      const year = this.v3Auth.academicYear();
      if (this.v3Auth.isAuthenticated() && year) {
        this.reloadYearScoped(year);
      }
    });
  }

  ngOnInit(): void {
    this.settingsService.listGradeGroups().subscribe((r) => this.gradeGroups.set(r));
    this.settingsService.listNationalScales().subscribe((r) => this.nationalScales.set(r));
  }

  reloadYearScoped(year = this.v3Auth.academicYear()): void {
    this.settingsService.listGradingRules(year).subscribe((r) => this.rules.set(r));
    this.settingsService.listPeriods(year).subscribe((r) => this.periods.set(r));
    this.settingsService.listGradingScales(year).subscribe((r) => this.scales.set(r));
    this.settingsService.listDimensions(year).subscribe((r) => this.dimensions.set(r));
  }

  columnDraft(dimensionId: number) {
    let draft = this.columnDrafts.get(dimensionId);
    if (!draft) {
      draft = { columnNumber: 1, label: '', weightPercentage: 20 };
      this.columnDrafts.set(dimensionId, draft);
    }
    return draft;
  }

  saveRule(): void {
    if (!this.newRule.gradeGroupId) {
      return;
    }
    this.maskService.show('messages.saving');
    this.settingsService
      .upsertGradingRule({
        academicYear: this.v3Auth.academicYear(),
        gradeGroupId: Number(this.newRule.gradeGroupId),
        minPassingScore: Number(this.newRule.minPassingScore),
        maxRecoveryScore: Number(this.newRule.maxRecoveryScore),
        decimalsCount: Number(this.newRule.decimalsCount),
        failedAreasLimit: Number(this.newRule.failedAreasLimit),
      })
      .pipe(finalize(() => this.maskService.hide()))
      .subscribe(() => {
        this.messages.showSuccess('Regla de promoción guardada.');
        this.reloadYearScoped();
      });
  }

  deleteRule(rule: GradingRuleRecord): void {
    void this.messages.confirmDelete(`¿Eliminar la regla de "${rule.gradeGroupName}"?`).then((r) => {
      if (r.isConfirmed) {
        this.settingsService.deleteGradingRule(rule.id).subscribe(() => {
          this.messages.showSuccess('Regla eliminada.');
          this.reloadYearScoped();
        });
      }
    });
  }

  savePeriod(): void {
    this.maskService.show('messages.saving');
    this.settingsService
      .savePeriod({
        academicYear: this.v3Auth.academicYear(),
        periodNumber: Number(this.newPeriod.periodNumber),
        name: this.newPeriod.name,
        weightPercentage: Number(this.newPeriod.weightPercentage),
        startDate: this.newPeriod.startDate,
        endDate: this.newPeriod.endDate,
      })
      .pipe(finalize(() => this.maskService.hide()))
      .subscribe(() => {
        this.newPeriod = { periodNumber: this.periods().length + 2, name: '', weightPercentage: 25, startDate: '', endDate: '' };
        this.messages.showSuccess('Periodo académico guardado.');
        this.reloadYearScoped();
      });
  }

  togglePeriodLock(period: AcademicPeriodRecord): void {
    this.settingsService
      .savePeriod(
        {
          gradeGroupId: period.gradeGroupId,
          academicYear: period.academicYear,
          periodNumber: period.periodNumber,
          name: period.name,
          weightPercentage: period.weightPercentage,
          startDate: period.startDate,
          endDate: period.endDate,
          isClosed: !period.isClosed,
          isActive: period.isActive,
        },
        period.id,
      )
      .subscribe(() => {
        this.messages.showSuccess(
          period.isClosed ? 'Periodo reabierto.' : 'Periodo bloqueado.',
        );
        this.reloadYearScoped();
      });
  }

  deletePeriod(period: AcademicPeriodRecord): void {
    void this.messages.confirmDelete(`¿Eliminar el periodo "${period.name}"?`).then((r) => {
      if (r.isConfirmed) {
        this.settingsService.deletePeriod(period.id).subscribe(() => {
          this.messages.showSuccess('Periodo eliminado.');
          this.reloadYearScoped();
        });
      }
    });
  }

  saveScale(): void {
    if (!this.newScale.nationalScaleId) {
      return;
    }
    this.maskService.show('messages.saving');
    this.settingsService
      .saveGradingScale({
        academicYear: this.v3Auth.academicYear(),
        nationalScaleId: Number(this.newScale.nationalScaleId),
        gradeGroupId: this.newScale.gradeGroupId ? Number(this.newScale.gradeGroupId) : null,
        minScore: Number(this.newScale.minScore),
        maxScore: Number(this.newScale.maxScore),
      })
      .pipe(finalize(() => this.maskService.hide()))
      .subscribe(() => {
        this.messages.showSuccess('Rango de escala guardado.');
        this.reloadYearScoped();
      });
  }

  deleteScale(scale: GradingScaleRecord): void {
    void this.messages.confirmDelete(`¿Eliminar el rango "${scale.nationalScaleName}"?`).then((r) => {
      if (r.isConfirmed) {
        this.settingsService.deleteGradingScale(scale.id).subscribe(() => {
          this.messages.showSuccess('Rango eliminado.');
          this.reloadYearScoped();
        });
      }
    });
  }

  saveDimension(): void {
    this.maskService.show('messages.saving');
    this.settingsService
      .saveDimension({
        academicYear: this.v3Auth.academicYear(),
        dimensionCode: Number(this.newDim.dimensionCode),
        name: this.newDim.name,
        abbreviation: this.newDim.abbreviation || null,
        weightPercentage: Number(this.newDim.weightPercentage),
      })
      .pipe(finalize(() => this.maskService.hide()))
      .subscribe(() => {
        this.newDim = { dimensionCode: this.dimensions().length + 2, name: '', abbreviation: '', weightPercentage: 30 };
        this.messages.showSuccess('Competencia guardada.');
        this.reloadYearScoped();
      });
  }

  deleteDimension(dim: EvaluationDimensionRecord): void {
    void this.messages.confirmDelete(`¿Eliminar la competencia "${dim.name}"?`).then((r) => {
      if (r.isConfirmed) {
        this.settingsService.deleteDimension(dim.id).subscribe(() => {
          this.messages.showSuccess('Competencia eliminada.');
          this.reloadYearScoped();
        });
      }
    });
  }

  addColumn(dimensionId: number): void {
    const draft = this.columnDraft(dimensionId);
    if (!draft.label.trim()) {
      return;
    }
    this.settingsService
      .saveDimensionColumn(dimensionId, {
        columnNumber: Number(draft.columnNumber),
        label: draft.label,
        weightPercentage: Number(draft.weightPercentage),
      })
      .subscribe(() => {
        draft.columnNumber += 1;
        draft.label = '';
        this.messages.showSuccess('Columna guardada.');
        this.reloadYearScoped();
      });
  }

  deleteColumn(dimensionId: number, columnId: number): void {
    this.settingsService.deleteDimensionColumn(dimensionId, columnId).subscribe(() => {
      this.messages.showSuccess('Columna eliminada.');
      this.reloadYearScoped();
    });
  }

  cleanupZeroGrades(): void {
    void this.messages
      .showConfirm({
        title: 'Eliminar notas en cero',
        message: `¿Confirmas eliminar las calificaciones con puntaje 0 (no bloqueadas) del año ${this.v3Auth.academicYear()}?`,
      })
      .then((res) => {
        if (res.isConfirmed) {
          this.maskService.show('messages.processing');
          this.settingsService
            .cleanupZeroGrades(this.v3Auth.academicYear())
            .pipe(finalize(() => this.maskService.hide()))
            .subscribe((result) => {
              this.messages.showSuccess(
                `Limpieza finalizada: ${result.deletedCount} registro(s) en cero eliminados.`,
              );
            });
        }
      });
  }
}
