/**
 * Utilidades reutilizables y seguras para SSR destinadas a enfocar automáticamente
 * el primer control editable de cualquier formulario, pestaña o diálogo modal.
 */

const EDITABLE_INPUT_SELECTOR =
  'input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]):not([type="file"]):not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="range"]):not([type="color"]):not([type="image"]):not(:disabled):not([readonly]), textarea:not(:disabled):not([readonly])';

const EXCLUDED_ANCESTOR_SELECTOR =
  'exodo-grid, exodo-pagination, .grid-search, .filter-container, .v3-grid-search, .v3-select-panel, .v3-select-search, .header-area, app-header, .sidebar-area, app-sidebar, .access-search-card, [data-no-autofocus]';

const NON_TEXT_INPUT_TYPES = new Set([
  'hidden',
  'checkbox',
  'radio',
  'file',
  'button',
  'submit',
  'reset',
  'range',
  'color',
  'image',
]);

export interface FormAutoFocusOptions {
  /** Fuerza el enfoque incluso si otro campo editable ya tiene el foco. */
  force?: boolean;
  /** Permite enfocar el primer `<app-v3-searchable-select>` si no existen inputs de texto. */
  allowSelectFallback?: boolean;
}

/**
 * Verifica que un elemento del DOM sea visible e interactuable para recibir foco.
 */
export function isElementVisible(element: HTMLElement): boolean {
  if (!element.isConnected || element.tabIndex === -1) {
    return false;
  }

  if (element.getAttribute('aria-hidden') === 'true' || element.closest('[aria-hidden="true"], [hidden], .d-none')) {
    return false;
  }

  if (element.getClientRects().length === 0) {
    return false;
  }

  if (typeof getComputedStyle === 'function') {
    const style = getComputedStyle(element);
    if (style.visibility === 'hidden' || style.display === 'none') {
      return false;
    }
  }

  return true;
}

/**
 * Determina si el elemento actualmente enfocado corresponde a un control de entrada editable.
 */
export function isActiveElementEditable(doc: Document | null | undefined): boolean {
  const active = doc?.activeElement;
  if (!(active instanceof HTMLElement) || !active.isConnected) {
    return false;
  }

  if (active.isContentEditable) {
    return true;
  }

  if (active instanceof HTMLTextAreaElement || active instanceof HTMLSelectElement) {
    return !active.disabled;
  }

  if (active instanceof HTMLInputElement) {
    const inputType = (active.type || 'text').toLowerCase();
    return !NON_TEXT_INPUT_TYPES.has(inputType) && !active.disabled;
  }

  return false;
}

function isExcludedControl(element: HTMLElement, root: ParentNode): boolean {
  if (element.hasAttribute('data-no-autofocus')) {
    return true;
  }

  const excludedAncestor = element.closest(EXCLUDED_ANCESTOR_SELECTOR);
  if (excludedAncestor && excludedAncestor !== root) {
    const allowModalAncestor =
      root instanceof Element &&
      root.classList.contains('v3-modal-body') &&
      excludedAncestor.contains(root);
    if (!allowModalAncestor) {
      return true;
    }
  }

  if (
    element instanceof HTMLInputElement &&
    (element.type || '').toLowerCase() === 'search' &&
    !element.closest('form')
  ) {
    return true;
  }

  return false;
}

/**
 * Localiza el primer control editable válido dentro de un contenedor de formulario o modal.
 */
export function findFirstFocusableFormControl(
  root: ParentNode,
  allowSelectFallback = true
): HTMLElement | null {
  const explicitTargets = root.querySelectorAll<HTMLElement>(
    '[data-autofocus]:not(:disabled):not([readonly])'
  );
  for (const target of Array.from(explicitTargets)) {
    if (!isExcludedControl(target, root) && isElementVisible(target)) {
      return target;
    }
  }

  const editableControls = root.querySelectorAll<HTMLElement>(EDITABLE_INPUT_SELECTOR);
  for (const control of Array.from(editableControls)) {
    if (!isExcludedControl(control, root) && isElementVisible(control)) {
      return control;
    }
  }

  if (allowSelectFallback) {
    const selectTriggers = root.querySelectorAll<HTMLElement>(
      'button.v3-select-trigger:not(:disabled)'
    );
    for (const trigger of Array.from(selectTriggers)) {
      if (!isExcludedControl(trigger, root) && isElementVisible(trigger)) {
        return trigger;
      }
    }
  }

  return null;
}

/**
 * Enfoca el primer control editable visible dentro de `root`, protegiendo la escritura activa del usuario.
 */
export function focusFirstFormInput(
  root: ParentNode | null | undefined,
  options?: FormAutoFocusOptions
): boolean {
  if (!root) {
    return false;
  }

  const doc = root instanceof Document ? root : root.ownerDocument;
  if (!doc) {
    return false;
  }

  if (!options?.force && isActiveElementEditable(doc)) {
    return false;
  }

  const target = findFirstFocusableFormControl(
    root,
    options?.allowSelectFallback ?? true
  );
  if (!target) {
    return false;
  }

  try {
    target.focus({ preventScroll: true });
    return true;
  } catch {
    return false;
  }
}
