import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  ContentChild,
  EventEmitter,
  Input,
  Output,
  signal,
  TemplateRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import { CustomTooltipDirective } from '../../directives/custom-tooltip.directive';

export interface V3GridColumn<TItem = Record<string, unknown>> {
  readonly key: string;
  readonly label: string;
  readonly align?: 'start' | 'center' | 'end';
  readonly badge?: boolean;
  readonly formatter?: (row: TItem) => string;
}

function normalizeGridText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Grilla de datos empresarial V3 (reemplaza ExtJS CustomGrid + Search + Pagination + Export).
 */
@Component({
  selector: 'app-v3-data-grid',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomTooltipDirective],
  template: `
    <div class="trezo-card bg-white border-radius p-4 shadow-sm">
      <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
        <div>
          <h5 class="mb-0 fw-semibold">{{ heading }}</h5>
          @if (subtitle) {
            <small class="text-muted">{{ subtitle }}</small>
          }
        </div>
        <div class="d-flex flex-wrap align-items-center gap-2">
          @if (searchable) {
            <div class="v3-grid-search">
              <i class="material-symbols-outlined v3-grid-search-icon" aria-hidden="true">search</i>
              <input
                type="search"
                class="v3-grid-search-input"
                [placeholder]="searchPlaceholder"
                [attr.aria-label]="searchPlaceholder"
                [ngModel]="searchTerm()"
                (ngModelChange)="onSearchChange($event)"
                (keydown.escape)="onSearchEscape($event)"
              />
              @if (searchTerm()) {
                <button
                  type="button"
                  class="v3-grid-search-clear"
                  (click)="onSearchChange('')"
                  [appCustomTooltip]="'Limpiar búsqueda'"
                >
                  <i class="material-symbols-outlined">close</i>
                </button>
              }
            </div>
          }

          @if (exportable && filteredRows().length > 0) {
            <button
              type="button"
              class="btn btn-sm btn-outline-success d-inline-flex align-items-center gap-1"
              (click)="exportToExcel()"
              [appCustomTooltip]="'Exportar listado a Excel (.xlsx)'"
            >
              <i class="material-symbols-outlined fs-6">download</i>
              <span>Excel</span>
            </button>
          }

          <button
            type="button"
            class="btn btn-sm btn-outline-secondary d-inline-flex align-items-center"
            (click)="refreshRequested.emit()"
            [appCustomTooltip]="'Recargar registros'"
          >
            <i class="material-symbols-outlined fs-6">refresh</i>
          </button>

          <ng-content select="[grid-toolbar]" />
        </div>
      </div>

      @if (loading) {
        <div class="v3-grid-empty">
          <div class="spinner-border text-primary" role="status"></div>
          <p class="mt-2 mb-0 text-muted">Cargando información...</p>
        </div>
      } @else if (pagedRows().length === 0) {
        <div class="v3-grid-empty">
          <i class="material-symbols-outlined fs-1 text-muted">inbox</i>
          <p class="mt-2 mb-0 text-muted">{{ emptyMessage }}</p>
        </div>
      } @else {
        <div class="table-responsive">
          <table class="table table-hover align-middle v3-grid-table mb-0">
            <thead>
              <tr>
                <th style="width: 48px;">#</th>
                @for (col of columns; track col.key) {
                  <th [class]="'text-' + (col.align || 'start')">
                    {{ col.label }}
                  </th>
                }
                @if (actionsTemplate) {
                  <th class="text-end">Acciones</th>
                }
              </tr>
            </thead>
            <tbody>
              @for (row of pagedRows(); track trackRow($index, row)) {
                <tr>
                  <td class="text-muted small">
                    {{ (currentPage() - 1) * pageSize() + $index + 1 }}
                  </td>
                  @for (col of columns; track col.key) {
                    <td [class]="'text-' + (col.align || 'start')">
                      @if (col.badge) {
                        <span
                          class="badge rounded-pill"
                          [ngClass]="resolveBadgeClass(row, col)"
                        >
                          {{ formatCell(row, col) }}
                        </span>
                      } @else {
                        {{ formatCell(row, col) }}
                      }
                    </td>
                  }
                  @if (actionsTemplate) {
                    <td class="text-end text-nowrap">
                      <ng-container
                        *ngTemplateOutlet="actionsTemplate; context: { $implicit: row }"
                      />
                    </td>
                  }
                </tr>
              }
            </tbody>
          </table>
        </div>

        <div class="v3-grid-pagination d-flex flex-wrap align-items-center justify-content-between gap-2 mt-3 pt-2">
          <small class="text-muted">
            Mostrando {{ pagedRows().length }} de {{ filteredRows().length }} registro(s)
          </small>
          <div class="d-flex align-items-center gap-2">
            <select
              class="form-select form-select-sm v3-grid-page-size"
              [ngModel]="pageSize()"
              (ngModelChange)="onPageSizeChange($event)"
              [appCustomTooltip]="'Registros por página'"
            >
              <option [ngValue]="10">10</option>
              <option [ngValue]="25">25</option>
              <option [ngValue]="50">50</option>
              <option [ngValue]="100">100</option>
            </select>

            <div class="btn-group btn-group-sm">
              <button
                type="button"
                class="btn btn-outline-secondary"
                [disabled]="currentPage() <= 1"
                (click)="goToPage(currentPage() - 1)"
                [appCustomTooltip]="'Página anterior'"
              >
                <i class="material-symbols-outlined fs-6">chevron_left</i>
              </button>
              <span class="btn btn-outline-secondary disabled">
                {{ currentPage() }} / {{ totalPages() }}
              </span>
              <button
                type="button"
                class="btn btn-outline-secondary"
                [disabled]="currentPage() >= totalPages()"
                (click)="goToPage(currentPage() + 1)"
                [appCustomTooltip]="'Página siguiente'"
              >
                <i class="material-symbols-outlined fs-6">chevron_right</i>
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class V3DataGridComponent<TItem extends object = Record<string, unknown>> {
  @Input() heading = '';
  @Input() subtitle = '';
  @Input() columns: V3GridColumn<TItem>[] = [];
  @Input() loading = false;
  @Input() searchable = true;
  @Input() exportable = true;
  @Input() exportFileName = 'asaie-export';
  @Input() searchPlaceholder = 'Buscar...';
  @Input() emptyMessage = 'No se encontraron registros.';
  @Input()
  set rows(value: TItem[]) {
    this.rowsSignal.set(Array.isArray(value) ? value : []);
    this.currentPage.set(1);
  }

  @Output() readonly refreshRequested = new EventEmitter<void>();

  @ContentChild('rowActions', { read: TemplateRef })
  actionsTemplate?: TemplateRef<{ $implicit: TItem }>;

  private readonly rowsSignal = signal<TItem[]>([]);
  readonly searchTerm = signal('');
  readonly pageSize = signal(10);
  readonly currentPage = signal(1);

  readonly filteredRows = computed(() => {
    const query = normalizeGridText(this.searchTerm());
    const list = this.rowsSignal();
    if (!query) {
      return list;
    }
    return list.filter((row) =>
      this.columns.some((col) =>
        normalizeGridText(this.formatCell(row, col)).includes(query),
      ),
    );
  });

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredRows().length / this.pageSize())),
  );

  readonly pagedRows = computed(() => {
    const page = Math.min(this.currentPage(), this.totalPages());
    const start = (page - 1) * this.pageSize();
    return this.filteredRows().slice(start, start + this.pageSize());
  });

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
    this.currentPage.set(1);
  }

  onSearchEscape(event: Event): void {
    if (this.searchTerm()) {
      event.preventDefault();
      this.onSearchChange('');
    }
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(Number(size) || 10);
    this.currentPage.set(1);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  trackRow(index: number, row: TItem): string | number {
    const record = row as Record<string, unknown>;
    const id = record['id'];
    return typeof id === 'string' || typeof id === 'number' ? id : index;
  }

  formatCell(row: TItem, col: V3GridColumn<TItem>): string {
    if (col.formatter) {
      return col.formatter(row);
    }
    const record = row as Record<string, unknown>;
    const raw = record[col.key];
    if (raw === null || raw === undefined || raw === '') {
      return '—';
    }
    if (typeof raw === 'boolean') {
      return raw ? 'Activo' : 'Inactivo';
    }
    return String(raw);
  }

  resolveBadgeClass(row: TItem, col: V3GridColumn<TItem>): string {
    const record = row as Record<string, unknown>;
    const raw = record[col.key];
    if (typeof raw === 'boolean') {
      return raw ? 'text-bg-success' : 'text-bg-secondary';
    }
    return 'text-bg-primary';
  }

  exportToExcel(): void {
    const data = this.filteredRows().map((row) => {
      const flat: Record<string, string> = {};
      for (const col of this.columns) {
        flat[col.label] = this.formatCell(row, col);
      }
      return flat;
    });
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos');
    XLSX.writeFile(workbook, `${this.exportFileName}.xlsx`);
  }
}
