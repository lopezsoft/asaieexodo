import { isPlatformBrowser } from '@angular/common';
import {
  DestroyRef,
  DOCUMENT,
  inject,
  Injectable,
  NgZone,
  PLATFORM_ID,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import {
  focusFirstFormInput,
  isActiveElementEditable,
  isElementVisible,
} from '../../shared/utils/form-autofocus.util';

const IGNORED_MUTATION_ANCESTOR_SELECTOR =
  '.v3-select-panel, .asaie-tooltip, exodo-grid, exodo-pagination, table, tbody, ul.list-group';

/**
 * Servicio global encargado de establecer el foco automático en el primer campo
 * editable al navegar entre formularios, cambiar de pestaña o montar vistas dinámicas.
 */
@Injectable({ providedIn: 'root' })
export class FormAutoFocusService {
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly ngZone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private initialized = false;
  private pageFocusTimer: ReturnType<typeof setTimeout> | null = null;
  private retryFocusTimer: ReturnType<typeof setTimeout> | null = null;
  private mutationFocusTimer: ReturnType<typeof setTimeout> | null = null;
  private pendingContainer: Element | null = null;
  private mutationObserver: MutationObserver | null = null;

  /**
   * Inicializa los escuchadores globales de navegación, pestañas y montaje de formularios.
   */
  init(): void {
    if (this.initialized || !this.isBrowser) {
      return;
    }
    this.initialized = true;

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.schedulePageFocus(65, true);
      });

    this.ngZone.runOutsideAngular(() => {
      const handleTabClick = (event: MouseEvent): void => {
        const target = event.target;
        if (!(target instanceof Element)) {
          return;
        }
        const tabTrigger = target.closest('.nav-link, [role="tab"]');
        if (
          tabTrigger &&
          (tabTrigger.closest('.main-content-body') || tabTrigger.closest('.auth-main'))
        ) {
          this.schedulePageFocus(70, false);
        }
      };

      this.document.addEventListener('click', handleTabClick, { passive: true });
      this.startMutationObserver();

      this.destroyRef.onDestroy(() => {
        this.document.removeEventListener('click', handleTabClick);
        this.stopMutationObserver();
        this.clearTimers();
      });
    });

    // Enfoque inicial para carga directa o recarga completa de la página
    this.schedulePageFocus(80, true);
  }

  private startMutationObserver(): void {
    if (typeof MutationObserver === 'undefined' || !this.document.body) {
      return;
    }

    this.mutationObserver = new MutationObserver((mutations) => {
      if (this.hasOpenV3Modal()) {
        return;
      }

      let candidate: Element | null = null;

      for (const mutation of mutations) {
        if (mutation.type !== 'childList' || mutation.addedNodes.length === 0) {
          continue;
        }

        if (
          mutation.target instanceof Element &&
          mutation.target.closest(IGNORED_MUTATION_ANCESTOR_SELECTOR)
        ) {
          continue;
        }

        for (const node of Array.from(mutation.addedNodes)) {
          if (!(node instanceof Element)) {
            continue;
          }

          if (
            node.matches(
              '.v3-select-panel, .asaie-tooltip, .v3-modal-backdrop, .v3-modal-dialog'
            ) ||
            node.closest('.v3-select-panel, .asaie-tooltip, .v3-modal-backdrop')
          ) {
            continue;
          }

          candidate = this.extractFormContainerFromNode(node);
          if (candidate) {
            break;
          }
        }

        if (candidate) {
          break;
        }
      }

      if (candidate) {
        this.scheduleMutationContainerFocus(candidate);
      }
    });

    this.mutationObserver.observe(this.document.body, {
      childList: true,
      subtree: true,
    });
  }

  private extractFormContainerFromNode(node: Element): Element | null {
    if (node.closest('exodo-grid, exodo-pagination, .access-search-card')) {
      return null;
    }

    if (node.matches('form, .auth-step-panel, .v3-wizard-body, .tab-pane, .modal.show')) {
      return node;
    }

    const nestedForm = node.querySelector(
      'form:not(.v3-modal-dialog form), .auth-step-panel, .v3-wizard-body, .tab-pane.active, .modal.show'
    );
    if (nestedForm && !nestedForm.closest('exodo-grid, .v3-modal-dialog')) {
      return nestedForm;
    }

    if (
      node.closest('.main-content-body, .auth-main') &&
      (node.matches('input:not([type="hidden"]), textarea') ||
        node.querySelector('input:not([type="hidden"]), textarea'))
    ) {
      return node.closest('form, .v3-wizard-body, .tab-pane, .trezo-card') ?? node;
    }

    return null;
  }

  private scheduleMutationContainerFocus(container: Element): void {
    this.pendingContainer = container;
    if (this.mutationFocusTimer !== null) {
      clearTimeout(this.mutationFocusTimer);
    }

    this.mutationFocusTimer = setTimeout(() => {
      this.mutationFocusTimer = null;
      const targetContainer = this.pendingContainer;
      this.pendingContainer = null;

      if (!targetContainer?.isConnected || this.hasOpenV3Modal()) {
        return;
      }

      const isExplicitForm = targetContainer.matches(
        'form, .auth-step-panel, .v3-wizard-body, .tab-pane, .modal.show'
      );
      focusFirstFormInput(targetContainer, {
        force: false,
        allowSelectFallback: isExplicitForm,
      });
    }, 55);
  }

  private schedulePageFocus(delayMs: number, withDelayedRetry: boolean): void {
    this.clearPageTimers();

    this.ngZone.runOutsideAngular(() => {
      this.pageFocusTimer = setTimeout(() => {
        this.pageFocusTimer = null;
        if (this.focusPageForm()) {
          return;
        }

        if (withDelayedRetry) {
          this.retryFocusTimer = setTimeout(() => {
            this.retryFocusTimer = null;
            this.focusPageForm();
          }, 240);
        }
      }, delayMs);
    });
  }

  private focusPageForm(): boolean {
    if (this.hasOpenV3Modal() || isActiveElementEditable(this.document)) {
      return true;
    }

    // 1. Formularios de autenticación (sign-in, sign-up por pasos, recuperación y restablecimiento)
    const authForms = this.document.querySelectorAll<HTMLElement>('.auth-main form');
    for (const authForm of Array.from(authForms)) {
      if (
        isElementVisible(authForm) &&
        focusFirstFormInput(authForm, { force: false, allowSelectFallback: true })
      ) {
        return true;
      }
    }

    // 2. Formularios declarativos dentro de pestañas activas o vistas principales
    const mainForms = this.document.querySelectorAll<HTMLElement>(
      '.main-content-body .tab-pane.active form, .main-content-body form'
    );
    for (const formElement of Array.from(mainForms)) {
      if (
        !formElement.closest('exodo-grid, .v3-modal-dialog') &&
        isElementVisible(formElement) &&
        focusFirstFormInput(formElement, { force: false, allowSelectFallback: true })
      ) {
        return true;
      }
    }

    // 3. Secciones de formulario basadas en [(ngModel)] sin etiqueta <form>
    const fallbackContainers = this.document.querySelectorAll<HTMLElement>(
      '.main-content-body .tab-pane.active, .main-content-body .trezo-card'
    );
    for (const container of Array.from(fallbackContainers)) {
      if (
        !container.closest('exodo-grid') &&
        isElementVisible(container) &&
        focusFirstFormInput(container, { force: false, allowSelectFallback: false })
      ) {
        return true;
      }
    }

    return false;
  }

  private hasOpenV3Modal(): boolean {
    return this.document.querySelector('.v3-modal-backdrop') !== null;
  }

  private stopMutationObserver(): void {
    this.mutationObserver?.disconnect();
    this.mutationObserver = null;
  }

  private clearPageTimers(): void {
    if (this.pageFocusTimer !== null) {
      clearTimeout(this.pageFocusTimer);
      this.pageFocusTimer = null;
    }
    if (this.retryFocusTimer !== null) {
      clearTimeout(this.retryFocusTimer);
      this.retryFocusTimer = null;
    }
  }

  private clearTimers(): void {
    this.clearPageTimers();
    if (this.mutationFocusTimer !== null) {
      clearTimeout(this.mutationFocusTimer);
      this.mutationFocusTimer = null;
    }
    this.pendingContainer = null;
  }
}
