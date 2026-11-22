# Custom Tooltip Directive (`[appCustomTooltip]`) Reference

Always inspect whether these four pieces exist in the Angular frontend before writing any template tooltip. If any is missing, create/wire it immediately.

---

## 1. Directive (`src/app/shared/directives/custom-tooltip.directive.ts`)

Features required:
- Standalone directive with selector `[appCustomTooltip]`.
- Inputs: `@Input('appCustomTooltip') tooltipText = '';` and `@Input() tooltipPosition: TooltipPosition = 'top';` (`'top' | 'bottom' | 'left' | 'right'`).
- SSR-safe via `isPlatformBrowser(inject(PLATFORM_ID))`.
- Auto-closes on `mouseleave`, `blur`, `click`, `window:scroll`, `window:resize`, `document:keydown.escape`, and `ngOnDestroy`.
- Removes prior position modifier classes (`asaie-custom-tooltip--top|bottom|left|right`) before applying the resolved/flipped position, measures intrinsic bounds offscreen (`visibility: hidden`), flips if outside viewport margin (`8px`), clamps to viewport edges, and attaches `role="tooltip"` + `aria-describedby`.

```ts
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
    const offset = 10;
    const margin = 8;

    let resolvedPosition = this.tooltipPosition;

    if (resolvedPosition === 'top' && hostRect.top - tooltipRect.height - offset < margin) {
      resolvedPosition = 'bottom';
    } else if (resolvedPosition === 'bottom' && hostRect.bottom + tooltipRect.height + offset > viewportHeight - margin) {
      resolvedPosition = 'top';
    } else if (resolvedPosition === 'left' && hostRect.left - tooltipRect.width - offset < margin) {
      resolvedPosition = 'right';
    } else if (resolvedPosition === 'right' && hostRect.right + tooltipRect.width + offset > viewportWidth - margin) {
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

    const clampedTop = Math.min(Math.max(margin, top), Math.max(margin, viewportHeight - tooltipRect.height - margin));
    const clampedLeft = Math.min(Math.max(margin, left), Math.max(margin, viewportWidth - tooltipRect.width - margin));

    for (const pos of ['top', 'bottom', 'left', 'right'] as const) {
      this.renderer.removeClass(tooltip, `asaie-custom-tooltip--${pos}`);
    }
    this.renderer.addClass(tooltip, `asaie-custom-tooltip--${resolvedPosition}`);
    this.renderer.setStyle(tooltip, 'top', `${clampedTop}px`);
    this.renderer.setStyle(tooltip, 'left', `${clampedLeft}px`);

    if (resolvedPosition === 'top' || resolvedPosition === 'bottom') {
      const hostCenterX = hostRect.left + hostRect.width / 2;
      const minArrowX = Math.min(14, tooltipRect.width / 2);
      const arrowX = Math.min(
        Math.max(minArrowX, hostCenterX - clampedLeft),
        Math.max(minArrowX, tooltipRect.width - minArrowX),
      );
      tooltip.style.setProperty('--asaie-tooltip-arrow-pos', `${arrowX}px`);
    } else {
      const hostCenterY = hostRect.top + hostRect.height / 2;
      const minArrowY = Math.min(12, tooltipRect.height / 2);
      const arrowY = Math.min(
        Math.max(minArrowY, hostCenterY - clampedTop),
        Math.max(minArrowY, tooltipRect.height - minArrowY),
      );
      tooltip.style.setProperty('--asaie-tooltip-arrow-pos', `${arrowY}px`);
    }
  }

  private destroyTooltipElement(): void {
    if (this.tooltipElement && this.isBrowser) {
      this.renderer.removeAttribute(this.elementRef.nativeElement, 'aria-describedby');
      this.renderer.removeChild(this.document.body, this.tooltipElement);
      this.tooltipElement = null;
      this.textNode = null;
    }
  }
}
```

---

## 2. SCSS Variables & Styles (Zero Hardcoded Colors & No Bootstrap `$tooltip-*` Collision)

> **CRITICAL WARNING for Bootstrap 5 Projects:** NEVER name custom tooltip Sass variables `$tooltip-*` (`$tooltip-bg`, `$tooltip-color`, `$tooltip-font-size`, `$tooltip-max-width`, `$tooltip-padding-y`, `$tooltip-padding-x`) when using `!default` after `@import 'bootstrap/scss/variables'`. Bootstrap already defines `$tooltip-*` first, so Sass silently ignores any subsequent `!default` overrides and compiles Bootstrap's pitch-black `var(--bs-emphasis-color)` defaults. Always namespace them (`$asaie-tooltip-*`).

Define in `src/assets/scss/variables/_variables.scss`:

```scss
// Institutional Custom Tooltip ([appCustomTooltip]) — namespaced to avoid Bootstrap $tooltip-* collision
$asaie-tooltip-bg: rgba(255, 255, 255, 0.97) !default;
$asaie-tooltip-arrow-bg: #ffffff !default;
$asaie-tooltip-color: #0f2544 !default;
$asaie-tooltip-border-color: rgba(5, 63, 116, 0.14) !default;
$asaie-tooltip-shadow: 0 10px 28px -6px rgba(15, 23, 42, 0.16),
  0 2px 8px -2px rgba(5, 63, 116, 0.1) !default;
$asaie-tooltip-dark-bg: rgba(15, 28, 52, 0.97) !default;
$asaie-tooltip-dark-arrow-bg: #0f1c34 !default;
$asaie-tooltip-dark-color: #f1f5f9 !default;
$asaie-tooltip-dark-border-color: rgba(56, 189, 248, 0.24) !default;
$asaie-tooltip-dark-shadow: 0 12px 30px -6px rgba(0, 0, 0, 0.55),
  0 2px 8px -2px rgba(3, 153, 222, 0.18) !default;
$asaie-tooltip-radius: 9px !default;
$asaie-tooltip-padding-y: 0.38rem !default;
$asaie-tooltip-padding-x: 0.72rem !default;
$asaie-tooltip-font-size: 0.74rem !default;
$asaie-tooltip-max-width: 280px !default;
$asaie-tooltip-z-index: 9999 !default;
```

Define in `src/assets/scss/components/_tooltip.scss` (imported via `components/index.scss`):

```scss
:root {
  --asaie-tooltip-bg: #{$asaie-tooltip-bg};
  --asaie-tooltip-arrow-bg: #{$asaie-tooltip-arrow-bg};
  --asaie-tooltip-color: #{$asaie-tooltip-color};
  --asaie-tooltip-border: #{$asaie-tooltip-border-color};
  --asaie-tooltip-shadow: #{$asaie-tooltip-shadow};
}

.dark-theme,
body.dark-theme {
  --asaie-tooltip-bg: #{$asaie-tooltip-dark-bg};
  --asaie-tooltip-arrow-bg: #{$asaie-tooltip-dark-arrow-bg};
  --asaie-tooltip-color: #{$asaie-tooltip-dark-color};
  --asaie-tooltip-border: #{$asaie-tooltip-dark-border-color};
  --asaie-tooltip-shadow: #{$asaie-tooltip-dark-shadow};
}

@keyframes asaieTooltipEnter {
  from {
    opacity: 0;
    transform: scale(0.96);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.asaie-custom-tooltip {
  position: fixed;
  z-index: $asaie-tooltip-z-index;
  max-width: $asaie-tooltip-max-width;
  padding: $asaie-tooltip-padding-y $asaie-tooltip-padding-x;
  border-radius: $asaie-tooltip-radius;
  border: 1px solid var(--asaie-tooltip-border);
  background-color: var(--asaie-tooltip-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: var(--asaie-tooltip-color);
  font-size: $asaie-tooltip-font-size;
  font-weight: 600;
  letter-spacing: 0.01em;
  line-height: 1.35;
  text-align: center;
  box-shadow: var(--asaie-tooltip-shadow);
  pointer-events: none;
  word-wrap: break-word;
  animation: asaieTooltipEnter 140ms cubic-bezier(0.22, 1, 0.36, 1) both;
  transition: opacity 0.12s ease-in-out;

  &::after {
    content: '';
    position: absolute;
    width: 8px;
    height: 8px;
    background-color: var(--asaie-tooltip-arrow-bg);
    pointer-events: none;
  }

  &.asaie-custom-tooltip--top::after {
    left: var(--asaie-tooltip-arrow-pos, 50%);
    bottom: -4.5px;
    margin-left: -4px;
    transform: rotate(45deg);
    border-right: 1px solid var(--asaie-tooltip-border);
    border-bottom: 1px solid var(--asaie-tooltip-border);
  }

  &.asaie-custom-tooltip--bottom::after {
    left: var(--asaie-tooltip-arrow-pos, 50%);
    top: -4.5px;
    margin-left: -4px;
    transform: rotate(45deg);
    border-left: 1px solid var(--asaie-tooltip-border);
    border-top: 1px solid var(--asaie-tooltip-border);
  }

  &.asaie-custom-tooltip--left::after {
    top: var(--asaie-tooltip-arrow-pos, 50%);
    right: -4.5px;
    margin-top: -4px;
    transform: rotate(45deg);
    border-top: 1px solid var(--asaie-tooltip-border);
    border-right: 1px solid var(--asaie-tooltip-border);
  }

  &.asaie-custom-tooltip--right::after {
    top: var(--asaie-tooltip-arrow-pos, 50%);
    left: -4.5px;
    margin-top: -4px;
    transform: rotate(45deg);
    border-bottom: 1px solid var(--asaie-tooltip-border);
    border-left: 1px solid var(--asaie-tooltip-border);
  }
}

@media (prefers-reduced-motion: reduce) {
  .asaie-custom-tooltip {
    animation: none;
    transition: none;
  }
}
```

---

## 3. Static Guardrail Script (`scripts/check-native-title.js`)

Wire into `package.json`:

```json
{
  "scripts": {
    "prebuild": "npm run check:native-title",
    "check:native-title": "node scripts/check-native-title.js"
  }
}
```

Script logic scans every `.html` and `.ts` (excluding `.spec.ts`) under `src/app`, flagging any element tag (except `<iframe ...>`) containing `title=`, `[title]=`, `[attr.title]=`, `attr.title=`, or `bind-title=` and exiting with code `1` on any match.
