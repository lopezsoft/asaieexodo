# Searchable Select Component Pattern (`V3SearchableSelectComponent`)

Prefer `app-v3-searchable-select` over standard HTML `<select>` controls for any selectable catalog or multi-option form control so users can filter quickly without hunting through long unsearchable lists.

---

## 1. Existing Implementation in ASAIE ÉXODO V3

- **Component:** `v3-frontend/src/app/shared/components/v3-searchable-select/v3-searchable-select.component.ts`
- **Re-exported in:** `SHARED_IMPORTS` (`v3-frontend/src/app/shared/shared-imports.ts`)
- **Stylesheet:** `v3-frontend/src/assets/scss/components/_searchable-select.scss`

### Selector & Data Model

```ts
export interface SearchableSelectOption<TValue = string | number> {
  readonly value: TValue;
  readonly label: string;
  readonly badge?: string;
  readonly subtitle?: string;
  readonly keywords?: string;
  readonly disabled?: boolean;
}
```

### Inputs & Form Integration

- Implements `ControlValueAccessor` (`NG_VALUE_ACCESSOR`) — works seamlessly with `formControlName`, `[formControl]`, and `[(ngModel)]`.
- Supported inputs:
  - `[options]`: `readonly SearchableSelectOption<TValue>[]`
  - `[placeholder]` (default `'Seleccionar...'`)
  - `[searchPlaceholder]` (default `'Buscar...'`)
  - `[emptyMessage]` (default `'Sin resultados'`)
  - `[leadingIcon]`: Material Symbols icon name shown inside trigger
  - `[inputId]`: Associates external `<label [for]="...">`
  - `[clearable]`: Shows clear button (`[appCustomTooltip]="'Limpiar selección'"`)
  - `[invalid]` / `[valid]`: Applies validation border states

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
