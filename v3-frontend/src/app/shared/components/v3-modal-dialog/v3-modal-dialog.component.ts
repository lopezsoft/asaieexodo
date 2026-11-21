import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import { CustomTooltipDirective } from '../../directives/custom-tooltip.directive';

/**
 * Modal empresarial reutilizable V3 (reemplaza ExtJS WindowCrud / SaveWindow).
 */
@Component({
  selector: 'app-v3-modal-dialog',
  standalone: true,
  imports: [CommonModule, CustomTooltipDirective],
  template: `
    @if (open) {
      <div
        class="v3-modal-backdrop"
        role="dialog"
        aria-modal="true"
        (click)="onBackdropClick($event)"
      >
        <div
          class="v3-modal-dialog"
          [ngClass]="{
            'v3-modal-lg': size === 'lg',
            'v3-modal-xl': size === 'xl'
          }"
        >
          <div class="v3-modal-header">
            <div class="d-flex align-items-center gap-2">
              @if (icon) {
                <i class="material-symbols-outlined text-primary">{{ icon }}</i>
              }
              <div>
                <h5>{{ heading }}</h5>
                @if (subtitle) {
                  <small class="text-muted">{{ subtitle }}</small>
                }
              </div>
            </div>
            <button
              type="button"
              class="btn btn-sm btn-outline-secondary rounded-circle d-inline-flex align-items-center justify-content-center"
              style="width: 32px; height: 32px;"
              (click)="closed.emit()"
              [appCustomTooltip]="'Cerrar ventana'"
            >
              <i class="material-symbols-outlined fs-6">close</i>
            </button>
          </div>
          <div class="v3-modal-body">
            <ng-content />
          </div>
          <div class="v3-modal-footer">
            <ng-content select="[modal-footer]" />
          </div>
        </div>
      </div>
    }
  `,
})
export class V3ModalDialogComponent {
  @Input() open = false;
  @Input() heading = '';
  @Input() subtitle = '';
  @Input() icon = '';
  @Input() size: 'md' | 'lg' | 'xl' = 'lg';
  @Input() closeOnBackdrop = true;
  @Output() readonly closed = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open) {
      this.closed.emit();
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if (
      this.closeOnBackdrop &&
      event.target === event.currentTarget
    ) {
      this.closed.emit();
    }
  }
}
