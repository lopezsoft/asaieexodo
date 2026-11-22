---
name: asaie-ui-ux-standards
description: >-
  Enforces mandatory Mobile-First UI/UX, branding, accessibility, and engineering
  standards for ASAIE ÉXODO V3 (Angular 20 + NestJS + PostgreSQL 17): always use
  the custom [appCustomTooltip] directive with zero native title attributes
  (namespaced $asaie-tooltip-* tokens to avoid Bootstrap collisions), enforce
  zero native HTML <select> elements across the entire app (100% replaced by
  V3SearchableSelectComponent + static guardrail check-native-select), build dynamic
  animated mobile-first interfaces with modern non-Bootstrap forms/inputs/file
  dropzones/buttons, soft non-prominent borders and airy balanced spacing,
  preserve original ASAIE institutional visual identity (Canva-style compact
  vertical navigation rail with 1-word desktop labels, hidden scrollbar track,
  airy celeste active squircle, full-label slide-over mobile drawer, and slide-out
  flyout drawer, clean header utility pills, versioned footer pill, executive hero
  banners, 4-card KPI rows, soft tinted section containers, and multi-school Access
  Panel), strictly use SCSS tokens/CSS variables for light/dark themes with zero
  hardcoded hex colors, enforce English identifiers with Spanish UI/i18n, and
  validate every change with typecheck, check:native-title, check:native-select,
  and production build.
  Activate this skill whenever creating or modifying any Angular component,
  template, SCSS stylesheet, form, input, button, select dropdown, tooltip, or UI
  layout in ASAIE ÉXODO.
---

# ASAIE ÉXODO V3 — UI/UX & Institutional Frontend Standards

Apply these mandatory rules across **every UI/UX, form, layout, tooltip, select, or styling task** in `v3-frontend` without waiting to be reminded.

---

## 1. Custom Tooltip Directive (`[appCustomTooltip]`) — Zero Native `title`

1. **Absolute Prohibition of Native `title`:**
   - **NEVER** write HTML `title="..."`, `[title]="..."`, `[attr.title]="..."`, or `bind-title="..."` in `.html` templates or inline `template: \`...\`` blocks.
   - The **only** permitted exception is `<iframe title="...">` for WCAG compliance.
2. **Always Use `[appCustomTooltip]`:**
   - Import `CustomTooltipDirective` (`src/app/shared/directives/custom-tooltip.directive.ts`, also re-exported by `SHARED_IMPORTS`) and bind `[appCustomTooltip]="'Texto descriptivo'"` (plus optional `tooltipPosition="top" | "bottom" | "left" | "right"`, using `"bottom"` for top-header controls and `"right"` for left-sidebar controls).
3. **Auto-Create When Missing:**
   - Check whether `CustomTooltipDirective`, `_tooltip.scss`, `$asaie-tooltip-*` variables in `_variables.scss` (always namespaced so they never collide with Bootstrap 5's `$tooltip-*` `!default` tokens), and `scripts/check-native-title.js` exist.
   - **If any piece is missing**, create all artifacts immediately using [references/custom-tooltip-directive.md](./references/custom-tooltip-directive.md) before proceeding.
4. **Always Verify:**
   - Run `npm run check:native-title` and require **`0` violations** before completing any task.

---

## 2. Searchable Select Combos (`V3SearchableSelectComponent`) — Zero Native `<select>`

1. **Absolute Prohibition of Native `<select>`:**
   - **NEVER** write native HTML `<select>` or `<option>` elements anywhere in `.html` templates or inline `template: \`...\`` blocks (forms, table cells, toolbar filters, modal dialogs, or pagination selectors).
   - **100%** of selectable controls MUST use `V3SearchableSelectComponent` (`<app-v3-searchable-select>` from `src/app/shared/components/v3-searchable-select/v3-searchable-select.component.ts` or `SHARED_IMPORTS`).
2. **Required Usage & Layout Patterns:**
   - **Inputs/Outputs:** Supports `[options]` (always memoized via `computed(...)` or `readonly` arrays on the class — **NEVER** build `.map(...)` arrays inline inside Angular templates), `[size]="'md' | 'sm'"` (`size="sm"` for toolbars, filters, and data-grid controls), `[disabled]` (combined with `ControlValueAccessor.setDisabledState`), `[clearable]`, `[leadingIcon]`, and `(selectionChange)` (fired strictly after `onChange` updates `formControlName`/`[(ngModel)]` for cascading dropdowns).
   - **Anti-Clipping Body Portal & Entrance Keyframes:** Portal `.v3-select-panel` directly onto `document.body` (`<ng-template>` + `ApplicationRef.attachView`/`EmbeddedViewRef`, propagating `.is-dark`, `position: fixed; z-index: 2050;` via `getBoundingClientRect()`, checking both trigger and portaled panel in `document:click` and capture-phase `scroll`) so ancestor `transform`, `animation-fill-mode: both/forwards`, `backdrop-filter`, or `overflow` can NEVER offset or clip the dropdown. Card/modal entrance keyframes (`v3SurfaceEnter`, `v3ModalEnter`) MUST also end with `transform: none;` and use `backwards` fill-mode.
   - **No Bootstrap `.input-group` Wrappers:** Never place `<app-v3-searchable-select>` inside `.input-group`; pair with action buttons via `<div class="d-flex align-items-center gap-2">` (`class="flex-grow-1"` on the select and `flex-shrink-0` on buttons).
3. **Static Guardrail & Auto-Create When Missing:**
   - Keep `scripts/check-native-select.js` wired into `npm run check:native-select` and `prebuild` (`0` violations required).
   - If bootstrapping a standalone module/app lacking `app-v3-searchable-select`, create the `ControlValueAccessor` component + SCSS partial + `check-native-select.js` following [references/searchable-select-pattern.md](./references/searchable-select-pattern.md) (accent-insensitive NFD filtering, keyboard navigation `ArrowDown`/`ArrowUp`/`Enter`/`Escape`/`Tab`, viewport-fixed anti-clipping, light/dark SCSS tokens).

---

## 3. Modern, Dynamic & Animated Interfaces (Never Static)

- Deliver living, responsive UIs with purposeful motion:
  - Entrance/reveal `@keyframes` on cards/panels, staggered list reveals (`--card-delay` capped to prevent long waits), subtle orb/grid motion on hero canvases, smooth state transitions (`transform`, `box-shadow`, `border-color`, `background-color`).
  - Always include `@media (prefers-reduced-motion: reduce)` so animations/transitions gracefully disable for sensitive users.
  - Provide crisp interactive feedback: inline spinners + double-click locks during async transitions, skeleton shimmers while loading empty initial states, clear-search buttons + `Escape` key clearing.

---

## 4. Balanced Airy Spacing & Grid Proportions

- **Never ship cramped layouts or bloated padding/margins** that squeeze inputs, labels, or cards:
  - Keep balanced split grids (e.g., auth hero vs. form panels), comfortable gaps between form controls (`0.65rem`–`1rem`), and generous breathable canvas gutters (`DashboardComponent` `.main-content-body`).
  - Allow long institution names to wrap cleanly up to 2 lines (`-webkit-line-clamp: 2`) instead of single-line ellipsis that cuts names mid-word.
  - Keep sticky headers compact on a single horizontal row (`var(--asaie-header-height)`).

---

## 5. Soft Surfaces & Non-Prominent Borders

- **Avoid harsh, thick, high-contrast card borders:**
  - Prefer layered soft shadows (`0 2px 14px -4px ...`) with subtle `1px` low-opacity hairlines or `border: 0` on elevated cards and glassmorphism overlays.
  - On hero glass cards (auth carousel, showcase overlays), keep translucent soft fills with `backdrop-filter: blur(...)` and ultra-subtle edges—never thick bright borders that clash with the background gradient.
  - Highlight active or hovered cards using a delicate left accent bar (`3px`) and elevated shadow rather than loud full-perimeter borders.

---

## 6. ASAIE ÉXODO Institutional Visual Identity & Layout Fidelity

Preserve the authentic ASAIE ÉXODO identity when modernizing screens:

- **Color & Brand Tokens (`src/assets/scss/variables/_variables.scss`):**
  - Hero & Navy Brand: `$auth-hero-bg-start` (`#032344`) → `$auth-hero-bg-mid` (`#053f74`) → `$auth-hero-bg-end` (`#0277bd`), plus `$v3-hero-light-*` / `$v3-hero-dark-*` executive banners and `$v3-section-tint-light` / `$v3-section-tint-dark` zone containers.
  - Institutional Action & Shell Tokens: `$access-brand-blue` (`#2254a1`), `$access-brand-blue-hover` / `--secondaryColor` (`#0399de`), `$shell-rail-bg-*`, `$shell-rail-active-*`, and `$v3-input-bg-*` / `$v3-input-border-*`.
  - SVG Brand Mark: authentic ASAIE wing/wave crest paired with `ASAIE ÉXODO` typography (rendered without hardcoded hex attributes when inlined in HTML templates; styled via theme CSS vars).
- **Dashboard Shell (`_asaie-shell.scss`, `SidebarComponent`, `HeaderComponent`, `FooterComponent`):**
  - **Canva-Style Compact Navigation Rail (Desktop) & Mobile-First Drawer (`SidebarComponent`):**
    - Desktop (`>= 1200px`): Fixed vertical rail (`var(--asaie-sidebar-width)`, `94px`) **styled with the host ASAIE V3 surface palette** (`#ffffff -> #f9fbfe` light; `#0c1427 -> #0a1020` `.dark-theme`). Uses native hidden-track scrolling (`.rail-scroll`, no overlapping gray scrollbar), **concise 1-word desktop labels** (`railTranslatedName`: e.g. `Admin`, `Ajustes`, `Elecciones`, `Docente`, `Accesos`, `Módulos`, `Salir`) preventing clipping/overlap while showing the complete title in `[appCustomTooltip]` (`tooltipPosition="right"`), rounded logo crest (`.rail-brand-btn`), airy soft-tinted ice-blue squircle active tile with crisp `3px` left bar, and secondary slide-out flyout drawer (`.rail-flyout-panel`, sibling outside `<aside>`). Never duplicate top-level routes already reachable inside a module submenu.
    - Mobile-First (`< 1200px`): Transforms cleanly into a spacious `min(286px, 85vw)` slide-over drawer with brand title + close button, horizontal full-label rows (`>= 46px` touch targets), chevron indicators for submenus, and `arrow_back` inside `.rail-flyout-panel`.
  - **Header & Footer:** Edge-to-edge sticky header (`var(--asaie-header-height)`, `66px`), `.v3-header-utility-pill` grouped actions (`tooltipPosition="bottom"`), user stack with `.user-role-chip` + animated `expand_more`, and versioned footer with `.footer-version-pill`.
  - **Shell & Overlay `z-index` Hierarchy:** Keep `<exodo-grid>` stacking isolated (`--exodo-z-sticky: 2`, `--exodo-z-loading: 4`, `.card-table { isolation: isolate; z-index: 0; }`) strictly below sticky header (`100`) and sidebar backdrops/flyout/rail (`190–215`), while preserving portals above them (`toasts: 1030`, `modals: 1050`, `.v3-select-panel: 2050`, `[appCustomTooltip]: 9999`).
- **Modern Mobile-First Forms, Inputs, File Uploaders & Buttons (`_v3-enterprise.scss`, NEVER Raw Bootstrap):**
  - **Touch & Mobile-First Controls & Strict 2-Column Forms:** Organize **every** form (pages, modals, embedded tab forms, parameter bars) in a **maximum of 2 columns** (`col-12 col-md-6`, or `col-12` for wide fields/textareas and right-aligned action rows — **NEVER** use 3, 4, or 6 columns such as `col-md-1`, `col-md-2`, `col-md-3`, `col-md-4` inside forms). Wrap inline form panels in `.v3-form-panel` and checkboxes/toggles in `.v3-form-switch-box`. Inputs, selects, and action buttons maintain comfortable touch height (`min-height: 44px` on inputs/mobile controls, `>= 42px` on desktop buttons) and `1rem` (`16px`) input font size on `< 576px` screens to prevent iOS Safari auto-zoom. Action footers (`.v3-form-actions`, `FooterFormComponent`, `.v3-wizard-footer`) stack full-width on `< 576px` (`flex-direction: column-reverse`) and align in rows on `>= 576px`.
  - **Step-by-Step Wizards (`V3FormWizardComponent`):** Use `<app-v3-form-wizard>` (`src/app/shared/components/v3-form-wizard/v3-form-wizard.component.ts` with `V3WizardStep`) for multi-section or lengthy forms (e.g., school profile, campuses, teachers, staff, students, SIEE rules, Model 5 observer) to improve clarity and usability: enable `[allowFreeNavigation]="editingRecord !== null"` (and `[allowSaveAnyStep]="true"` on editable forms), validate required fields of the active step before advancing in creation mode (`nextRequested`), reset `wizardStep` to `0` on modal open, pass `[showFooter]="false"` inside `<app-v3-modal-dialog>` using `.v3-modal-footer-split` with `.v3-modal-footer-actions` in `<div modal-footer>`, and preserve automatic first-input focus on each step transition.
  - **Icon-Prefixed Inputs, Toggles & Strength Gauges:** Wrap standard inputs inside `.v3-input-wrap` with `.v3-input-icon`, `1.5px` custom focus rings, inline `.v3-field-error` messages, `.v3-input-action` password visibility toggles (`[appCustomTooltip]`), `.v3-password-meter` 4-bar strength indicator on password creation/change flows, and `.v3-card-header-bar` headers inside cards.
  - **Custom File Dropzones & Modern File Inputs:** Use interactive `.v3-upload-dropzone` drag-and-drop cards (with live validation and spinner feedback) on profile/document uploads, alongside custom dashed `input[type='file'].form-control` styles globally. NEVER expose raw cloud/infrastructure vendor names (like `"AWS S3"`) in user-facing labels or toasts.
  - **Modern Non-Bootstrap Buttons, Spacing & Neutral Cancel Actions:** Use clean, sober solid institutional buttons (`.btn-primary`, `.btn-success`, `.btn-danger`) without loud multi-stop gradients or heavy neon glows, keeping softer executive hero banners (`.v3-hero-banner`). Always maintain crisp spacing (`gap: 0.65rem` / `margin-inline-start: 0.5rem`) between adjacent buttons everywhere (including `.v3-modal-footer > [modal-footer]`, `.v3-exodo-toolbar`, `.v3-form-actions`, and table row `td` actions), and use neutral `.btn-v3-ghost` for Cancel buttons in `FooterFormComponent` (reserve `.btn-danger` strictly for genuinely destructive actions like delete).
  - **Mandatory First-Input Form Autofocus (Pages & Modals):** Every form, tab panel, and modal dialog (`V3ModalDialogComponent`) MUST automatically focus its first visible, enabled, editable control upon navigation, open, or dynamic mount via `FormAutoFocusService` (`src/app/services/common/form-autofocus.service.ts`, initialized in `AppComponent`), `V3ModalDialogComponent` (`ngOnChanges` on `open`), and `focusFirstFormInput` (`src/app/shared/utils/form-autofocus.util.ts`) — strictly protecting active user typing (`!isActiveElementEditable`) and excluding header/rail/grid search & filter inputs.
  - **Shared Enterprise UI (`_v3-enterprise.scss`, `<exodo-grid>` via `exodolibs`, `V3ModalDialogComponent`):** Use `<exodo-grid>` (`ExodolibsModule`) as the official enterprise DataGrid (`mode="remote"`, `[customBody]="true"`, `[allowSorting]="true"`, `[allowFiltering]="true"`, `[theme]="gridTheme"` switching `'glacial' | 'dark'`, global Spanish `EXODO_I18N`, harmonized in [`_exodo-grid.scss`](../../v3-frontend/src/assets/scss/components/_exodo-grid.scss) with `display: table; width: 100%`, scrollable `.card-body`, high-contrast flat `.grid-search .btn`, and no yellow click gradients, plus `exportGridRowsToExcel`) paired with `ExodoGridQueryDto` + `buildLaravelPaginatorResponse` (Laravel `dataRecords` contract) in `v3-backend`. Combine with sober `.v3-hero-banner` headers (`--compact`, translucent glass pills/CTAs, `currentColor` SVG wave accent), 4-card `.v3-kpi-metric-card` rows (`tabular-nums`), `.v3-section-tint` soft ice-blue containers, modal backdrop blur, and soft pill `.badge` styling.
  - **High-Scale Directivo-First Governance & Master-Detail Consoles (RBAC & Mass Directories):** Administrative consoles governing high-volume school populations (e.g., 3,000+ students, teachers, families) MUST NEVER dump flat unpaginated tables or 80-row checkbox walls: default initial views to core governing roles (`DIRECTIVES`: `RECTOR`, `SECRETARY`, `COORDINATOR`, `SCHOOL_ADMIN`) backed by live SQL summary KPI cards (`GET /rbac/memberships/summary`), segmented audience pills feeding `<exodo-grid mode="remote">`, debounced remote user pickers inside 2-column modals (`assignRole`), and Master-Detail module navigation (`.v3-rbac-module-list` desktop / `<app-v3-searchable-select>` mobile) for granular permission matrices.
  - **End-User Human Copy & Modern Segmented Controls (Zero Tech Jargon):** NEVER display developer permission keys (`<code>promotion.year.close</code>`), acronyms (`RBAC`, `IAM`, `PII`, `SaaS`, `S3`), or internal database mechanics (`clonar las 7 tablas maestras`, `búsqueda en servidor`) in end-user views — map technical catalog keys to clear Spanish school copy (`rbac-human-copy.constants.ts`), pair a calm status indicator (`.v3-perm-status`: `Con acceso` / `Sin acceso` / `Bloqueado`) with a modern segmented pill control (`.v3-perm-segment` + `.v3-perm-segment-btn` instead of raw Bootstrap `.btn-group`).
- **Multi-School Access Panel (`/access-panel`):**
  - Compact `.v3-hero-banner.v3-hero-banner--compact` welcoming the user with dynamic institution/access counters and formatted date glass pill, followed by a clean pill-rounded search toolbar (`border-radius: 999px`) and role filter pills.
  - 3-column desktop grid (`2` tablet, `1` mobile) framed inside a `.v3-section-tint` container and grouped by school row when an institution has multiple roles (canonical order: `RECTOR`, `SCHOOL_ADMIN`, `SECRETARY`, `COORDINATOR`, `TEACHER`, `MONITOR`, `STUDENT`, `FAMILY`, `SUPER_ADMIN`), featuring prominent institutional FontAwesome icons (`fa-school`, `fa-laptop`, `fa-chalkboard-teacher`, `fa-user-graduate`, `fa-users`).
- **Self-Service School Onboarding (`/auth/sign-up`):**
  - Immediate cloud activation with configurable `SCHOOL_TRIAL_DAYS` (defined in `.env` and `.env.example`), 2-step wizard (`V3SearchableSelectComponent` for all catalogs), non-blocking verification email, and instant auto-login.

---

## 7. SCSS Tokens, Light/Dark Mode & Engineering Guardrails

- **Zero Hardcoded Hex Colors in Components/Partials:** Declare every color token in `src/assets/scss/variables/_variables.scss` and expose CSS custom properties supporting both light (`:root`) and dark (`body.dark-theme` / `.dark-theme`) modes. Component `.scss` files and partials under `src/assets/scss/components/` MUST NOT introduce raw `#...` hex literals.
- **Language & i18n:** 100% English technical identifiers (classes, signals, methods, interfaces, CSS classes, file names); Spanish UI copy and code comments; keep `src/assets/i18n/es.json` and `en.json` synchronized and valid JSON.
- **Clean Logging:** Never use `console.log`/`warn`/`error`; use `DebugService` in Angular and `SmartLoggerService` in NestJS.
- **Safe Delivery Rules:** Never run `npm install/update`, DB migrations, `docker-compose.yml` edits, dev servers (`ng serve`), or `git push` without explicit user instruction. On commits, always bump SemVer (`feat` → minor, `fix` → patch), sync `package.json`, `package-lock.json`, `environment*.ts`, `CHANGELOG.md` (Keep a Changelog in Spanish), and create annotated tags.

---

## 8. Mandatory Verification Before Reporting Done

Run all five checks in `d:\wamp64\www\asaieexodo\v3-frontend` after the final edit:

1. `npm run typecheck` → exit code `0`.
2. `npm run check:native-title` → `0 atributos nativos 'title'`.
3. `npm run check:native-select` → `0 elementos nativos '<select>'`.
4. `npm run build` (triggers `prebuild` + `ng build --configuration production`) → exit code `0`.
5. Regex scan confirming zero hardcoded `#...` hex literals in newly created/edited SCSS/HTML/TS files, zero `console.` calls, and valid `es.json` / `en.json` JSON syntax.
