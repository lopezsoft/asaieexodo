import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  DestroyRef,
  ElementRef,
  EventEmitter,
  HostListener,
  inject,
  Input,
  NgZone,
  OnChanges,
  Output,
  PLATFORM_ID,
  SimpleChanges,
} from '@angular/core';
import { CustomTooltipDirective } from '../../directives/custom-tooltip.directive';
import {
  focusFirstFormInput,
  isActiveElementEditable,
} from '../../utils/form-autofocus.util';

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
                <span class="v3-modal-icon">
                  <i class="material-symbols-outlined">{{ icon }}</i>
                </span>
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
              class="v3-modal-close-btn"
              (click)="closed.emit()"
              [appCustomTooltip]="'Cerrar ventana'"
              tooltipPosition="left"
            >
              <i class="material-symbols-outlined">close</i>
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
export class V3ModalDialogComponent implements OnChanges {
  @Input() open = false;
  @Input() heading = '';
  @Input() subtitle = '';
  @Input() icon = '';
  @Input() size: 'md' | 'lg' | 'xl' = 'lg';
  @Input() closeOnBackdrop = true;
  @Output() readonly closed = new EventEmitter<void>();

  private readonly hostRef = inject(ElementRef<HTMLElement>);
  private readonly ngZone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private primaryFocusTimer: ReturnType<typeof setTimeout> | null = null;
  private retryFocusTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.destroyRef.onDestroy(() => this.clearFocusTimers());
  }

  ngOnChanges(changes: SimpleChanges): void {
    const openChange = changes['open'];
    if (!openChange || !this.isBrowser) {
      return;
    }

    if (openChange.currentValue && !openChange.previousValue) {
      this.scheduleAutofocus();
    } else if (!openChange.currentValue) {
      this.clearFocusTimers();
    }
  }

  private scheduleAutofocus(): void {
    this.clearFocusTimers();

    this.ngZone.runOutsideAngular(() => {
      this.primaryFocusTimer = setTimeout(() => {
        if (!this.open) {
          return;
        }

        const modalBody = this.hostRef.nativeElement.querySelector('.v3-modal-body');
        if (
          modalBody &&
          focusFirstFormInput(modalBody, {
            force: true,
            allowSelectFallback: true,
          })
        ) {
          return;
        }

        // Reintento único por si el formulario interno se monta tras una carga asíncrona
        this.retryFocusTimer = setTimeout(() => {
          if (!this.open) {
            return;
          }

          const delayedBody =
            this.hostRef.nativeElement.querySelector('.v3-modal-body');
          if (!delayedBody) {
            return;
          }

          const doc = delayedBody.ownerDocument;
          const active = doc?.activeElement;
          if (
            active instanceof HTMLElement &&
            delayedBody.contains(active) &&
            isActiveElementEditable(doc)
          ) {
            return;
          }

          focusFirstFormInput(delayedBody, {
            force: true,
            allowSelectFallback: true,
          });
        }, 180);
      }, 45);
    });
  }

  private clearFocusTimers(): void {
    if (this.primaryFocusTimer !== null) {
      clearTimeout(this.primaryFocusTimer);
      this.primaryFocusTimer = null;
    }
    if (this.retryFocusTimer !== null) {
      clearTimeout(this.retryFocusTimer);
      this.retryFocusTimer = null;
    }
  }

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
