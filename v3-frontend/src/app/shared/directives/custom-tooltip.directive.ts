import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  Directive,
  ElementRef,
  HostListener,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  PLATFORM_ID,
  Renderer2,
} from '@angular/core';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

let nextTooltipId = 0;

/**
 * Directiva institucional obligatoria [appCustomTooltip] en reemplazo del atributo nativo title.
 * SSR-safe, con calculo preciso de limites del viewport, flip automatico, cierre por scroll/Escape y aria-describedby.
 */
@Directive({
  selector: '[appCustomTooltip]',
  standalone: true,
})
export class CustomTooltipDirective implements OnChanges, OnDestroy {
  @Input('appCustomTooltip') tooltipText = '';
  @Input() tooltipPosition: TooltipPosition = 'top';

  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly tooltipDomId = `asaie-tooltip-${++nextTooltipId}`;

  private tooltipElement: HTMLElement | null = null;
  private textNode: Text | null = null;

  ngOnChanges(): void {
    if (this.tooltipElement && this.textNode) {
      if (!this.tooltipText) {
        this.destroyTooltipElement();
      } else {
        this.textNode.textContent = this.tooltipText;
        this.positionTooltip(this.tooltipElement);
      }
    }
  }

  @HostListener('mouseenter')
  @HostListener('focus')
  onShowTooltip(): void {
    if (!this.isBrowser || !this.tooltipText || this.tooltipElement) {
      return;
    }
    this.createTooltipElement();
  }

  @HostListener('mouseleave')
  @HostListener('blur')
  @HostListener('click')
  @HostListener('window:scroll')
  @HostListener('window:resize')
  @HostListener('document:keydown.escape')
  onHideTooltip(): void {
    this.destroyTooltipElement();
  }

  ngOnDestroy(): void {
    this.destroyTooltipElement();
  }

  private createTooltipElement(): void {
    const tooltip = this.renderer.createElement('div') as HTMLElement;
    const text = this.renderer.createText(this.tooltipText) as Text;
    this.renderer.appendChild(tooltip, text);

    this.renderer.setAttribute(tooltip, 'id', this.tooltipDomId);
    this.renderer.setAttribute(tooltip, 'role', 'tooltip');
    this.renderer.addClass(tooltip, 'asaie-custom-tooltip');

    // Aplicar posicion fija antes de medir para obtener el ancho intrinseco real
    this.renderer.setStyle(tooltip, 'position', 'fixed');
    this.renderer.setStyle(tooltip, 'top', '0px');
    this.renderer.setStyle(tooltip, 'left', '0px');
    this.renderer.setStyle(tooltip, 'visibility', 'hidden');

    this.renderer.appendChild(this.document.body, tooltip);
    this.renderer.setAttribute(
      this.elementRef.nativeElement,
      'aria-describedby',
      this.tooltipDomId,
    );

    this.tooltipElement = tooltip;
    this.textNode = text;
    this.positionTooltip(tooltip);
    this.renderer.setStyle(tooltip, 'visibility', 'visible');
  }

  private positionTooltip(tooltip: HTMLElement): void {
    const hostRect = this.elementRef.nativeElement.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const viewportWidth = this.document.defaultView?.innerWidth ?? 1280;
    const viewportHeight = this.document.defaultView?.innerHeight ?? 720;
    const offset = 8;
    const margin = 8;

    let resolvedPosition = this.tooltipPosition;

    if (
      resolvedPosition === 'top' &&
      hostRect.top - tooltipRect.height - offset < margin
    ) {
      resolvedPosition = 'bottom';
    } else if (
      resolvedPosition === 'bottom' &&
      hostRect.bottom + tooltipRect.height + offset > viewportHeight - margin
    ) {
      resolvedPosition = 'top';
    } else if (
      resolvedPosition === 'left' &&
      hostRect.left - tooltipRect.width - offset < margin
    ) {
      resolvedPosition = 'right';
    } else if (
      resolvedPosition === 'right' &&
      hostRect.right + tooltipRect.width + offset > viewportWidth - margin
    ) {
      resolvedPosition = 'left';
    }

    let top = hostRect.top - tooltipRect.height - offset;
    let left = hostRect.left + (hostRect.width - tooltipRect.width) / 2;

    if (resolvedPosition === 'bottom') {
      top = hostRect.bottom + offset;
    } else if (resolvedPosition === 'left') {
      top = hostRect.top + (hostRect.height - tooltipRect.height) / 2;
      left = hostRect.left - tooltipRect.width - offset;
    } else if (resolvedPosition === 'right') {
      top = hostRect.top + (hostRect.height - tooltipRect.height) / 2;
      left = hostRect.right + offset;
    }

    const clampedTop = Math.min(
      Math.max(margin, top),
      Math.max(margin, viewportHeight - tooltipRect.height - margin),
    );
    const clampedLeft = Math.min(
      Math.max(margin, left),
      Math.max(margin, viewportWidth - tooltipRect.width - margin),
    );

    this.renderer.addClass(tooltip, `asaie-custom-tooltip--${resolvedPosition}`);
    this.renderer.setStyle(tooltip, 'top', `${clampedTop}px`);
    this.renderer.setStyle(tooltip, 'left', `${clampedLeft}px`);
  }

  private destroyTooltipElement(): void {
    if (this.tooltipElement && this.isBrowser) {
      this.renderer.removeAttribute(
        this.elementRef.nativeElement,
        'aria-describedby',
      );
      this.renderer.removeChild(this.document.body, this.tooltipElement);
      this.tooltipElement = null;
      this.textNode = null;
    }
  }
}
