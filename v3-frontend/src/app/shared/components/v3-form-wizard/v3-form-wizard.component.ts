import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  DestroyRef,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  NgZone,
  OnChanges,
  Output,
  PLATFORM_ID,
  SimpleChanges,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { CustomTooltipDirective } from '../../directives/custom-tooltip.directive';
import { focusFirstFormInput } from '../../utils/form-autofocus.util';

export interface V3WizardStep {
  id: string;
  title: string;
  subtitle?: string;
  icon?: string;
  invalid?: boolean;
}

/**
 * Asistente reutilizable por pasos (Wizard) mobile-first con barra de progreso,
 * validación por paso, navegación libre en modo edición y autofocus automático.
 */
@Component({
  selector: 'app-v3-form-wizard',
  standalone: true,
  imports: [CommonModule, RouterLink, CustomTooltipDirective],
  template: `
    <div class="v3-wizard">
      <div class="v3-wizard-header">
        <div
          class="v3-wizard-progress"
          role="progressbar"
          [attr.aria-valuenow]="activeIndex + 1"
          aria-valuemin="1"
          [attr.aria-valuemax]="steps.length || 1"
        >
          <div class="v3-wizard-progress-bar" [style.width.%]="progressPercent"></div>
        </div>

        <div class="v3-wizard-steps" role="tablist" aria-label="Pasos del formulario">
          @for (step of steps; track step.id; let idx = $index) {
            <button
              type="button"
              role="tab"
              class="v3-wizard-step-btn"
              [class.is-active]="idx === activeIndex"
              [class.is-completed]="idx < activeIndex && !step.invalid"
              [class.is-invalid]="!!step.invalid"
              [class.is-locked]="!isStepReachable(idx)"
              [attr.aria-selected]="idx === activeIndex"
              [disabled]="!isStepReachable(idx)"
              [appCustomTooltip]="step.subtitle || step.title"
              (click)="selectStep(idx)"
            >
              <span class="v3-wizard-step-badge">
                @if (idx < activeIndex && !step.invalid) {
                  <i class="material-symbols-outlined">check</i>
                } @else if (step.icon) {
                  <i class="material-symbols-outlined">{{ step.icon }}</i>
                } @else {
                  <span>{{ idx + 1 }}</span>
                }
              </span>
              <span class="v3-wizard-step-label">{{ step.title }}</span>
            </button>
          }
        </div>

        @if (currentStep; as active) {
          <div class="v3-wizard-step-meta">
            <span class="v3-wizard-counter">Paso {{ activeIndex + 1 }} de {{ steps.length }}</span>
            <div class="v3-wizard-meta-copy">
              <strong>{{ active.title }}</strong>
              @if (active.subtitle) {
                <span>{{ active.subtitle }}</span>
              }
            </div>
          </div>
        }
      </div>

      <div class="v3-wizard-body">
        <ng-content />
      </div>

      @if (showFooter) {
        <div class="v3-wizard-footer">
          <div class="v3-wizard-footer-start">
            @if (activeIndex > 0) {
              <button
                type="button"
                class="btn btn-v3-ghost"
                (click)="goPrevious()"
              >
                <i class="material-symbols-outlined fs-6" aria-hidden="true">arrow_back</i>
                <span>{{ prevLabel }}</span>
              </button>
            } @else if (cancelRoute) {
              <a [routerLink]="cancelRoute" class="btn btn-v3-ghost">
                <i class="material-symbols-outlined fs-6" aria-hidden="true">arrow_back</i>
                <span>{{ cancelLabel }}</span>
              </a>
            } @else if (showCancelButton) {
              <button
                type="button"
                class="btn btn-v3-ghost"
                (click)="cancelled.emit()"
              >
                <span>{{ cancelLabel }}</span>
              </button>
            }
          </div>

          <div class="v3-wizard-footer-end">
            @if (activeIndex < steps.length - 1) {
              <button
                type="button"
                class="btn"
                [ngClass]="allowSaveAnyStep ? 'btn-outline-primary' : 'btn-primary'"
                [disabled]="nextDisabled"
                (click)="onNextClick()"
              >
                <span>{{ nextLabel }}</span>
                <i class="material-symbols-outlined fs-6" aria-hidden="true">arrow_forward</i>
              </button>
            }

            @if (activeIndex === steps.length - 1 || allowSaveAnyStep) {
              <button
                type="button"
                class="btn btn-primary"
                [disabled]="submitDisabled"
                (click)="submitted.emit()"
              >
                @if (submitIcon) {
                  <i class="material-symbols-outlined fs-6" aria-hidden="true">{{ submitIcon }}</i>
                }
                <span>{{ submitLabel }}</span>
              </button>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class V3FormWizardComponent implements OnChanges {
  @Input({ required: true }) steps: readonly V3WizardStep[] = [];
  @Input() activeIndex = 0;
  @Output() readonly activeIndexChange = new EventEmitter<number>();

  @Input() allowFreeNavigation = false;
  @Input() showFooter = true;
  @Input() allowSaveAnyStep = false;
  @Input() submitDisabled = false;
  @Input() nextDisabled = false;
  @Input() submitLabel = 'Guardar cambios';
  @Input() submitIcon = 'save';
  @Input() prevLabel = 'Anterior';
  @Input() nextLabel = 'Siguiente';
  @Input() cancelRoute: string | null = null;
  @Input() cancelLabel = 'Volver';
  @Input() showCancelButton = false;

  @Output() readonly nextRequested = new EventEmitter<number>();
  @Output() readonly submitted = new EventEmitter<void>();
  @Output() readonly cancelled = new EventEmitter<void>();

  private readonly hostRef = inject(ElementRef<HTMLElement>);
  private readonly ngZone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private stepFocusTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.destroyRef.onDestroy(() => this.clearFocusTimer());
  }

  get currentStep(): V3WizardStep | undefined {
    return this.steps[this.activeIndex];
  }

  get progressPercent(): number {
    if (!this.steps.length) {
      return 100;
    }
    return Math.round(((this.activeIndex + 1) / this.steps.length) * 100);
  }

  ngOnChanges(changes: SimpleChanges): void {
    const indexChange = changes['activeIndex'];
    if (indexChange && !indexChange.firstChange && this.isBrowser) {
      this.scheduleStepFocus();
    }
  }

  isStepReachable(index: number): boolean {
    if (index === this.activeIndex) {
      return true;
    }
    if (this.allowFreeNavigation) {
      return true;
    }
    return index < this.activeIndex || index === this.activeIndex + 1;
  }

  selectStep(index: number): void {
    if (index === this.activeIndex || !this.isStepReachable(index)) {
      return;
    }

    if (this.allowFreeNavigation || index < this.activeIndex) {
      this.setActiveIndex(index);
      return;
    }

    if (index === this.activeIndex + 1) {
      this.onNextClick();
    }
  }

  goPrevious(): void {
    if (this.activeIndex > 0) {
      this.setActiveIndex(this.activeIndex - 1);
    }
  }

  onNextClick(): void {
    if (this.activeIndex >= this.steps.length - 1) {
      return;
    }
    if (this.nextRequested.observed) {
      this.nextRequested.emit(this.activeIndex);
      return;
    }
    this.setActiveIndex(this.activeIndex + 1);
  }

  private setActiveIndex(index: number): void {
    this.activeIndex = index;
    this.activeIndexChange.emit(index);
    if (this.isBrowser) {
      this.scheduleStepFocus();
    }
  }

  private scheduleStepFocus(): void {
    this.clearFocusTimer();
    this.ngZone.runOutsideAngular(() => {
      this.stepFocusTimer = setTimeout(() => {
        this.stepFocusTimer = null;
        const bodyElement = this.hostRef.nativeElement.querySelector('.v3-wizard-body');
        if (bodyElement) {
          focusFirstFormInput(bodyElement, {
            force: true,
            allowSelectFallback: true,
          });
        }
      }, 45);
    });
  }

  private clearFocusTimer(): void {
    if (this.stepFocusTimer !== null) {
      clearTimeout(this.stepFocusTimer);
      this.stepFocusTimer = null;
    }
  }
}
