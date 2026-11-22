import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  ApplicationRef,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  EmbeddedViewRef,
  EventEmitter,
  forwardRef,
  HostListener,
  inject,
  Input,
  Output,
  PLATFORM_ID,
  signal,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CustomTooltipDirective } from '../../directives/custom-tooltip.directive';

export interface SearchableSelectOption<
  TValue = string | number | boolean | null,
> {
  readonly value: TValue;
  readonly label: string;
  readonly badge?: string;
  readonly subtitle?: string;
  readonly keywords?: string;
  readonly disabled?: boolean;
}

@Component({
  selector: 'app-v3-searchable-select',
  standalone: true,
  imports: [CommonModule, CustomTooltipDirective],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => V3SearchableSelectComponent),
      multi: true,
    },
  ],
  template: `
    <div
      class="v3-select"
      [class.is-open]="isOpen()"
      [class.open-upward]="openUpward()"
      [class.is-sm]="size === 'sm'"
      [class.is-disabled]="isDisabled()"
      [class.is-invalid]="invalid"
      [class.is-valid]="valid && !invalid"
    >
      <button
        #triggerBtn
        type="button"
        class="v3-select-trigger"
        [id]="inputId || null"
        [disabled]="isDisabled()"
        [attr.aria-expanded]="isOpen()"
        aria-haspopup="listbox"
        (click)="toggleDropdown()"
        (keydown)="onTriggerKeydown($event)"
      >
        @if (leadingIcon) {
          <span class="material-symbols-outlined v3-select-leading" aria-hidden="true">
            {{ leadingIcon }}
          </span>
        }

        <span class="v3-select-value" [class.is-placeholder]="!selectedOption()">
          @if (selectedOption(); as active) {
            @if (active.badge) {
              <span class="v3-select-badge">{{ active.badge }}</span>
            }
            <span class="v3-select-label">{{ active.label }}</span>
          } @else {
            <span class="v3-select-label">{{ placeholder }}</span>
          }
        </span>

        @if (clearable && selectedOption() && !isDisabled()) {
          <span
            role="button"
            tabindex="-1"
            class="v3-select-clear"
            [appCustomTooltip]="'Limpiar selección'"
            (click)="clearSelection($event)"
          >
            <span class="material-symbols-outlined">close</span>
          </span>
        }

        <span class="material-symbols-outlined v3-select-chevron" aria-hidden="true">
          expand_more
        </span>
      </button>

      <ng-template #panelTemplate>
        <div
          class="v3-select-panel"
          [class.open-upward]="openUpward()"
          [class.is-sm]="size === 'sm'"
          [class.is-dark]="isDarkContext()"
          [ngStyle]="panelStyle()"
          role="presentation"
        >
          <div class="v3-select-search">
            <span class="material-symbols-outlined v3-select-search-icon" aria-hidden="true">
              search
            </span>
            <input
              type="text"
              class="v3-select-search-input"
              [value]="searchQuery()"
              [placeholder]="searchPlaceholder"
              autocomplete="off"
              (input)="onSearchInput($event)"
              (keydown)="onSearchKeydown($event)"
            />
            @if (searchQuery()) {
              <button
                type="button"
                class="v3-select-search-clear"
                [appCustomTooltip]="'Limpiar búsqueda'"
                (click)="clearSearch($event)"
              >
                <span class="material-symbols-outlined">close</span>
              </button>
            }
          </div>

          <ul class="v3-select-options" role="listbox">
            @for (opt of filteredOptions(); track $index; let idx = $index) {
              <li
                role="option"
                class="v3-select-option"
                [attr.data-index]="idx"
                [attr.aria-selected]="isSelected(opt.value)"
                [attr.aria-disabled]="opt.disabled ? 'true' : null"
                [class.is-selected]="isSelected(opt.value)"
                [class.is-highlighted]="idx === highlightedIndex()"
                [class.is-disabled]="!!opt.disabled"
                (mouseenter)="highlightedIndex.set(idx)"
                (click)="selectOption(opt)"
              >
                <div class="v3-select-option-main">
                  @if (opt.badge) {
                    <span class="v3-select-option-badge">{{ opt.badge }}</span>
                  }
                  <div class="v3-select-option-copy">
                    <span class="v3-select-option-label">{{ opt.label }}</span>
                    @if (opt.subtitle) {
                      <small class="v3-select-option-subtitle">{{ opt.subtitle }}</small>
                    }
                  </div>
                </div>
                @if (isSelected(opt.value)) {
                  <span class="material-symbols-outlined v3-select-check" aria-hidden="true">
                    check
                  </span>
                }
              </li>
            } @empty {
              <li class="v3-select-empty">
                <span class="material-symbols-outlined" aria-hidden="true">search_off</span>
                <span>{{ emptyMessage }}</span>
              </li>
            }
          </ul>
        </div>
      </ng-template>
    </div>
  `,
})
export class V3SearchableSelectComponent<
  TValue = string | number | boolean | null,
> implements ControlValueAccessor
{
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly appRef = inject(ApplicationRef);
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  @ViewChild('triggerBtn') private triggerBtn?: ElementRef<HTMLButtonElement>;
  @ViewChild('panelTemplate', { static: true })
  private panelTemplate?: TemplateRef<unknown>;

  private readonly optionsSignal = signal<
    readonly SearchableSelectOption<TValue>[]
  >([]);
  private readonly inputDisabled = signal(false);
  private readonly cvaDisabled = signal(false);
  private panelViewRef: EmbeddedViewRef<unknown> | null = null;
  private panelEl: HTMLDivElement | null = null;
  private focusTimerId: number | null = null;
  private scrollListenerAttached = false;

  @Input()
  set options(value: readonly SearchableSelectOption<TValue>[]) {
    this.optionsSignal.set(value ?? []);
  }

  @Input()
  set disabled(value: boolean) {
    this.inputDisabled.set(Boolean(value));
    if (Boolean(value) && this.isOpen()) {
      this.closeDropdown(false);
    }
  }

  @Input() size: 'md' | 'sm' = 'md';
  @Input() placeholder = 'Seleccionar...';
  @Input() searchPlaceholder = 'Buscar...';
  @Input() emptyMessage = 'Sin resultados';
  @Input() leadingIcon = '';
  @Input() inputId = '';
  @Input() clearable = false;
  @Input() invalid = false;
  @Input() valid = false;

  @Output() readonly selectionChange = new EventEmitter<TValue | null>();

  protected readonly selectedValue = signal<TValue | null>(null);
  protected readonly isOpen = signal(false);
  protected readonly openUpward = signal(false);
  protected readonly isDarkContext = signal(false);
  protected readonly panelStyle = signal<Record<string, string>>({});
  protected readonly isDisabled = computed(
    () => this.inputDisabled() || this.cvaDisabled(),
  );
  protected readonly searchQuery = signal('');
  protected readonly highlightedIndex = signal(0);

  protected readonly selectedOption = computed(() => {
    const current = this.selectedValue();
    return (
      this.optionsSignal().find((option) => option.value === current) ?? null
    );
  });

  protected readonly filteredOptions = computed(() => {
    const query = this.normalizeSearchText(this.searchQuery());
    const allOptions = this.optionsSignal();
    if (!query) {
      return allOptions;
    }
    return allOptions.filter((option) => {
      const searchable = this.normalizeSearchText(
        `${option.badge ?? ''} ${option.label} ${option.subtitle ?? ''} ${option.keywords ?? ''}`,
      );
      return searchable.includes(query);
    });
  });

  private onChange: (value: TValue | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  private readonly handleScroll = (event: Event): void => {
    if (!this.isOpen() || !this.isBrowser) {
      return;
    }
    const target = event.target as Node | null;
    if (target && this.panelEl?.contains(target)) {
      return;
    }
    const rect = this.triggerBtn?.nativeElement.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    if (!rect || rect.bottom < 0 || rect.top > viewportHeight) {
      this.closeDropdown(false);
      return;
    }
    this.updatePanelPosition();
  };

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.detachScrollListener();
      this.unmountPanelPortal();
      if (this.isBrowser && this.focusTimerId !== null) {
        window.clearTimeout(this.focusTimerId);
      }
    });
  }

  writeValue(value: TValue | null): void {
    this.selectedValue.set(value === undefined ? null : value);
  }

  registerOnChange(fn: (value: TValue | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
    if (isDisabled && this.isOpen()) {
      this.closeDropdown(false);
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isOpen()) {
      return;
    }
    const target = event.target as Node | null;
    const clickedTrigger = Boolean(
      target && this.elementRef.nativeElement.contains(target),
    );
    const clickedPanel = Boolean(target && this.panelEl?.contains(target));
    if (!clickedTrigger && !clickedPanel) {
      this.closeDropdown(false);
    }
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    if (this.isOpen()) {
      this.updatePanelPosition();
    }
  }

  protected toggleDropdown(): void {
    if (this.isDisabled()) {
      return;
    }
    if (this.isOpen()) {
      this.closeDropdown(false);
    } else {
      this.openDropdown();
    }
  }

  protected openDropdown(): void {
    if (this.isDisabled()) {
      return;
    }

    if (this.isBrowser) {
      this.isDarkContext.set(
        Boolean(this.elementRef.nativeElement.closest('.dark-theme')),
      );
    }
    this.updatePanelPosition();
    this.searchQuery.set('');
    const current = this.selectedValue();
    const initialIndex = this.optionsSignal().findIndex(
      (opt) => opt.value === current && !opt.disabled,
    );
    this.highlightedIndex.set(initialIndex >= 0 ? initialIndex : 0);
    this.isOpen.set(true);
    this.mountPanelPortal();
    this.attachScrollListener();

    if (this.isBrowser) {
      if (this.focusTimerId !== null) {
        window.clearTimeout(this.focusTimerId);
      }
      this.focusTimerId = window.setTimeout(() => {
        this.panelEl
          ?.querySelector<HTMLInputElement>('.v3-select-search-input')
          ?.focus({ preventScroll: true });
        this.scrollHighlightedIntoView();
      }, 0);
    }
  }

  protected closeDropdown(restoreFocus: boolean): void {
    if (!this.isOpen() && !this.panelViewRef) {
      return;
    }
    this.detachScrollListener();
    this.unmountPanelPortal();
    this.isOpen.set(false);
    this.onTouched();
    if (restoreFocus && this.isBrowser) {
      this.triggerBtn?.nativeElement.focus();
    }
  }

  protected selectOption(option: SearchableSelectOption<TValue>): void {
    if (option.disabled || this.isDisabled()) {
      return;
    }
    this.selectedValue.set(option.value);
    this.onChange(option.value);
    this.selectionChange.emit(option.value);
    this.closeDropdown(true);
  }

  protected clearSelection(event: MouseEvent): void {
    event.stopPropagation();
    if (this.isDisabled()) {
      return;
    }
    this.selectedValue.set(null);
    this.onChange(null);
    this.selectionChange.emit(null);
    this.onTouched();
  }

  protected onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
    const firstEnabled = this.filteredOptions().findIndex((opt) => !opt.disabled);
    this.highlightedIndex.set(firstEnabled >= 0 ? firstEnabled : 0);
  }

  protected clearSearch(event: MouseEvent): void {
    event.stopPropagation();
    this.searchQuery.set('');
    this.highlightedIndex.set(0);
    if (this.isBrowser) {
      this.panelEl
        ?.querySelector<HTMLInputElement>('.v3-select-search-input')
        ?.focus({ preventScroll: true });
    }
  }

  protected onTriggerKeydown(event: KeyboardEvent): void {
    if (this.isDisabled()) {
      return;
    }
    if (
      event.key === 'ArrowDown' ||
      event.key === 'ArrowUp' ||
      event.key === ' '
    ) {
      event.preventDefault();
      if (!this.isOpen()) {
        this.openDropdown();
      }
    } else if (event.key === 'Escape' && this.isOpen()) {
      event.preventDefault();
      this.closeDropdown(true);
    }
  }

  protected onSearchKeydown(event: KeyboardEvent): void {
    const list = this.filteredOptions();
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.moveHighlight(1, list);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.moveHighlight(-1, list);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const target = list[this.highlightedIndex()];
      if (target && !target.disabled) {
        this.selectOption(target);
      }
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.closeDropdown(true);
    } else if (event.key === 'Tab') {
      this.closeDropdown(false);
    }
  }

  protected isSelected(value: TValue): boolean {
    return this.selectedValue() === value;
  }

  private updatePanelPosition(): void {
    if (!this.isBrowser) {
      return;
    }
    const triggerEl =
      this.triggerBtn?.nativeElement ?? this.elementRef.nativeElement;
    const rect = triggerEl.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const panelWidth = Math.min(
      Math.max(rect.width, 220),
      Math.max(200, viewportWidth - 16),
    );
    const left = Math.min(
      Math.max(8, rect.left),
      Math.max(8, viewportWidth - panelWidth - 8),
    );

    const spaceBelow = viewportHeight - rect.bottom - 12;
    const spaceAbove = rect.top - 12;
    const shouldFlipUp = spaceBelow < 250 && spaceAbove > spaceBelow;
    this.openUpward.set(shouldFlipUp);

    if (shouldFlipUp) {
      const bottom = Math.max(8, viewportHeight - rect.top + 6);
      this.panelStyle.set({
        left: `${left}px`,
        width: `${panelWidth}px`,
        bottom: `${bottom}px`,
        top: 'auto',
      });
    } else {
      const top = Math.max(8, rect.bottom + 6);
      this.panelStyle.set({
        left: `${left}px`,
        width: `${panelWidth}px`,
        top: `${top}px`,
        bottom: 'auto',
      });
    }
    this.panelViewRef?.detectChanges();
  }

  private mountPanelPortal(): void {
    if (!this.isBrowser || !this.panelTemplate || this.panelViewRef) {
      return;
    }
    const viewRef = this.panelTemplate.createEmbeddedView(null);
    this.appRef.attachView(viewRef);
    viewRef.detectChanges();

    const rootEl =
      viewRef.rootNodes.find(
        (node): node is HTMLDivElement => node instanceof HTMLDivElement,
      ) ?? null;
    if (rootEl) {
      this.document.body.appendChild(rootEl);
    }

    this.panelViewRef = viewRef;
    this.panelEl = rootEl;
  }

  private unmountPanelPortal(): void {
    const viewRef = this.panelViewRef;
    this.panelViewRef = null;
    this.panelEl = null;
    if (!viewRef) {
      return;
    }
    for (const node of viewRef.rootNodes) {
      if (node instanceof Node && node.parentNode) {
        node.parentNode.removeChild(node);
      }
    }
    if (!viewRef.destroyed) {
      this.appRef.detachView(viewRef);
      viewRef.destroy();
    }
  }

  private attachScrollListener(): void {
    if (!this.isBrowser || this.scrollListenerAttached) {
      return;
    }
    this.document.addEventListener('scroll', this.handleScroll, true);
    this.scrollListenerAttached = true;
  }

  private detachScrollListener(): void {
    if (!this.isBrowser || !this.scrollListenerAttached) {
      return;
    }
    this.document.removeEventListener('scroll', this.handleScroll, true);
    this.scrollListenerAttached = false;
  }

  private moveHighlight(
    direction: 1 | -1,
    list: readonly SearchableSelectOption<TValue>[],
  ): void {
    if (list.length === 0) {
      return;
    }
    let idx = this.highlightedIndex();
    for (let step = 0; step < list.length; step++) {
      idx = (idx + direction + list.length) % list.length;
      if (!list[idx].disabled) {
        this.highlightedIndex.set(idx);
        this.scrollHighlightedIntoView();
        return;
      }
    }
  }

  private scrollHighlightedIntoView(): void {
    if (!this.isBrowser || !this.panelEl) {
      return;
    }
    const target = this.panelEl.querySelector<HTMLElement>(
      `[data-index="${this.highlightedIndex()}"]`,
    );
    target?.scrollIntoView({ block: 'nearest' });
  }

  private normalizeSearchText(text: string): string {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }
}
