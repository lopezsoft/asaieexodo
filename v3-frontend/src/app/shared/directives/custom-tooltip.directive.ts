import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  Renderer2,
} from '@angular/core';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

/**
 * Directiva institucional obligatoria [appCustomTooltip] en reemplazo del atributo nativo title.
 */
@Directive({
  selector: '[appCustomTooltip]',
  standalone: true,
})
export class CustomTooltipDirective implements OnDestroy {
  @Input('appCustomTooltip') tooltipText = '';
  @Input() tooltipPosition: TooltipPosition = 'top';

  private tooltipElement: HTMLElement | null = null;

  constructor(
    private readonly elementRef: ElementRef<HTMLElement>,
    private readonly renderer: Renderer2,
  ) {}

  @HostListener('mouseenter')
  @HostListener('focus')
  onShowTooltip(): void {
    if (!this.tooltipText || this.tooltipElement) {
      return;
    }
    this.createTooltipElement();
  }

  @HostListener('mouseleave')
  @HostListener('blur')
  @HostListener('click')
  onHideTooltip(): void {
    this.destroyTooltipElement();
  }

  ngOnDestroy(): void {
    this.destroyTooltipElement();
  }

  private createTooltipElement(): void {
    const tooltip = this.renderer.createElement('div') as HTMLElement;
    const textNode = this.renderer.createText(this.tooltipText);
    this.renderer.appendChild(tooltip, textNode);

    this.renderer.setAttribute(tooltip, 'role', 'tooltip');
    this.renderer.addClass(tooltip, 'asaie-custom-tooltip');
    this.renderer.addClass(
      tooltip,
      `asaie-custom-tooltip--${this.tooltipPosition}`,
    );

    this.renderer.appendChild(document.body, tooltip);
    this.tooltipElement = tooltip;
    this.positionTooltip(tooltip);
  }

  private positionTooltip(tooltip: HTMLElement): void {
    const hostRect = this.elementRef.nativeElement.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const offset = 8;

    let top = hostRect.top - tooltipRect.height - offset;
    let left = hostRect.left + (hostRect.width - tooltipRect.width) / 2;

    if (this.tooltipPosition === 'bottom') {
      top = hostRect.bottom + offset;
    } else if (this.tooltipPosition === 'left') {
      top = hostRect.top + (hostRect.height - tooltipRect.height) / 2;
      left = hostRect.left - tooltipRect.width - offset;
    } else if (this.tooltipPosition === 'right') {
      top = hostRect.top + (hostRect.height - tooltipRect.height) / 2;
      left = hostRect.right + offset;
    }

    this.renderer.setStyle(tooltip, 'position', 'fixed');
    this.renderer.setStyle(tooltip, 'top', `${Math.max(4, top)}px`);
    this.renderer.setStyle(tooltip, 'left', `${Math.max(4, left)}px`);
    this.renderer.setStyle(tooltip, 'zIndex', '9999');
  }

  private destroyTooltipElement(): void {
    if (this.tooltipElement) {
      this.renderer.removeChild(document.body, this.tooltipElement);
      this.tooltipElement = null;
    }
  }
}
