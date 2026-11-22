# Searchable Select Component Pattern (`V3SearchableSelectComponent`)

> **MANDATORY RULE (ZERO NATIVE `<select>`):** NEVER use native HTML `<select>` elements anywhere in the application templates or new components. **100%** of selectable controls (forms, table cell editors, filter toolbars, modal dialogs, pagination size selectors) MUST use `<app-v3-searchable-select>`. Static validation (`node scripts/check-native-select.js`, wired into `npm run check:native-select` and `prebuild`) blocks builds if even a single native `<select>` exists.

---

## 1. Existing Implementation in ASAIE ÉXODO V3

- **Component:** `v3-frontend/src/app/shared/components/v3-searchable-select/v3-searchable-select.component.ts`
- **Re-exported in:** `SHARED_IMPORTS` (`v3-frontend/src/app/shared/shared-imports.ts`)
- **Stylesheet:** `v3-frontend/src/assets/scss/components/_searchable-select.scss`
- **Static Guardrail:** `v3-frontend/scripts/check-native-select.js` (`npm run check:native-select` & `prebuild`)

### Selector & Data Model

```ts
export interface SearchableSelectOption<TValue = string | number | boolean | null> {
  readonly value: TValue;
  readonly label: string;
  readonly badge?: string;
  readonly subtitle?: string;
  readonly keywords?: string;
  readonly disabled?: boolean;
}
```

### Inputs, Outputs & Form Integration

- Implements `ControlValueAccessor` (`NG_VALUE_ACCESSOR`) — works seamlessly with `formControlName`, `[formControl]`, `[ngModel]`, and `[(ngModel)]`.
- Supported inputs:
  - `[options]`: `readonly SearchableSelectOption<TValue>[]` (always memoize on the class via `computed(...)` or `readonly` arrays — NEVER call `.map(...)` inline inside templates)
  - `[size]`: `'md' | 'sm'` (default `'md'`; use `size="sm"` inside toolbars, compact filter bars, and data-grid cells/pagination)
  - `[disabled]`: `boolean` (combined cleanly with `ControlValueAccessor.setDisabledState`)
  - `[placeholder]` (default `'Seleccionar...'`)
  - `[searchPlaceholder]` (default `'Buscar...'`)
  - `[emptyMessage]` (default `'Sin resultados'`)
  - `[leadingIcon]`: Material Symbols icon name shown inside trigger
  - `[inputId]`: Associates external `<label [for]="...">`
  - `[clearable]`: Shows clear button (`[appCustomTooltip]="'Limpiar selección'"`) emitting `null`
  - `[invalid]` / `[valid]`: Applies validation border states
- Supported outputs:
  - `(selectionChange)`: `EventEmitter<TValue | null>` fired strictly **after** `onChange` updates the bound control/model (use for cascading reloads such as `(selectionChange)="onCountryChanged()"`).

### Layout & Anti-Clipping Rules

1. **No Bootstrap `.input-group` wrappers:** Never wrap `<app-v3-searchable-select>` in `.input-group`; instead lay out adjacent action buttons with `<div class="d-flex align-items-center gap-2">`, applying `class="flex-grow-1"` to the select and `flex-shrink-0` to the button.
2. **Table / Grid / Modal Anti-Clipping (Body Portal Obligatorio):** Portal `.v3-select-panel` directly onto `document.body` via `<ng-template #panelTemplate>` + `ApplicationRef.attachView` / `EmbeddedViewRef` (propagating `[class.is-dark]` from `.closest('.dark-theme')`, checking both host and `panelEl` in `document:click` and capture-phase `scroll`, and calling `focus({ preventScroll: true })`) instead of rendering inline inside `.v3-select`. CSS `position: fixed` inside ancestors using `animation: ... both`/`forwards` on `transform` (or `backdrop-filter`) shifts `getBoundingClientRect()` coordinates to the ancestor box rather than the viewport. Additionally, declare tokens on `.v3-select, .v3-select-panel`, and ensure card/modal entrance animations (`v3SurfaceEnter`, `v3ModalEnter`) end in `transform: none;` with `backwards` fill-mode.

---

## 2. Mandatory UX Behaviors (When Replicating in New Modules/Apps)

1. **Accent-Insensitive Filtering (`normalizeSearchText`):**
   - Normalize query and concatenated option fields (`badge + label + subtitle + keywords`) using `.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()`.
2. **Full Keyboard & Focus Flow:**
   - Trigger opens on `ArrowDown`, `ArrowUp`, `Space`, and closes on `Escape`.
   - Inside search input: `ArrowDown` / `ArrowUp` move highlight skipping `disabled` options (`scrollIntoView({ block: 'nearest' })`), `Enter` selects the highlighted option and restores focus to trigger, `Escape` closes and restores focus, `Tab` closes cleanly.
   - Inside-component close/clear icons use `[appCustomTooltip]` (never native `title`).
3. **Viewport-Aware Opening & SSR Safety:**
   - Guard all DOM/window access (`getBoundingClientRect()`, `window.innerHeight`, `setTimeout`) with `isPlatformBrowser(platformId)` and clean up timers via `DestroyRef`.
   - Set `[class.open-upward]` when `window.innerHeight - rect.bottom < 250 && rect.top > 250`.
   - Close when clicking outside via `@HostListener('document:click', ['$event'])`.
4. **Token-Driven Theming & Soft Reveal Animation:**
   - Style panel elevation, inputs, highlights, badges, and dark mode via SCSS variables in `_variables.scss` and CSS custom properties (`--v3-select-*`) — zero hardcoded hex colors in component SCSS.
   - Animate dropdown panel reveal (`v3SelectReveal`) with `@media (prefers-reduced-motion: reduce)` override.
