import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  computed,
  DestroyRef,
  ElementRef,
  forwardRef,
  HostListener,
  inject,
  Input,
  PLATFORM_ID,
  signal,
  ViewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CustomTooltipDirective } from '../../directives/custom-tooltip.directive';

export interface SearchableSelectOption<TValue = string | number> {
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

      @if (isOpen()) {
        <div class="v3-select-panel" role="presentation">
          <div class="v3-select-search">
            <span class="material-symbols-outlined v3-select-search-icon" aria-hidden="true">
              search
            </span>
            <input
              #searchInput
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

          <ul #optionsList class="v3-select-options" role="listbox">
            @for (opt of filteredOptions(); track opt.value; let idx = $index) {
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
      }
    </div>
  `,
})
export class V3SearchableSelectComponent<TValue = string | number>
  implements ControlValueAccessor
{
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  @ViewChild('triggerBtn') private triggerBtn?: ElementRef<HTMLButtonElement>;
  @ViewChild('searchInput') private searchInput?: ElementRef<HTMLInputElement>;
  @ViewChild('optionsList') private optionsList?: ElementRef<HTMLUListElement>;

  private readonly optionsSignal = signal<
    readonly SearchableSelectOption<TValue>[]
  >([]);
  private focusTimerId: number | null = null;

  @Input()
  set options(value: readonly SearchableSelectOption<TValue>[]) {
    this.optionsSignal.set(value ?? []);
  }

  @Input() placeholder = 'Seleccionar...';
  @Input() searchPlaceholder = 'Buscar...';
  @Input() emptyMessage = 'Sin resultados';
  @Input() leadingIcon = '';
  @Input() inputId = '';
  @Input() clearable = false;
  @Input() invalid = false;
  @Input() valid = false;

  protected readonly selectedValue = signal<TValue | null>(null);
  protected readonly isOpen = signal(false);
  protected readonly openUpward = signal(false);
  protected readonly isDisabled = signal(false);
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

  constructor() {
    this.destroyRef.onDestroy(() => {
      if (this.isBrowser && this.focusTimerId !== null) {
        window.clearTimeout(this.focusTimerId);
      }
    });
  }

  writeValue(value: TValue | null): void {
    this.selectedValue.set(value ?? null);
  }

  registerOnChange(fn: (value: TValue | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
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
    if (target && !this.elementRef.nativeElement.contains(target)) {
      this.closeDropdown(false);
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
      const rect = this.elementRef.nativeElement.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      this.openUpward.set(spaceBelow < 250 && rect.top > 250);
    }

    this.searchQuery.set('');
    const current = this.selectedValue();
    const initialIndex = this.optionsSignal().findIndex(
      (opt) => opt.value === current && !opt.disabled,
    );
    this.highlightedIndex.set(initialIndex >= 0 ? initialIndex : 0);
    this.isOpen.set(true);

    if (this.isBrowser) {
      if (this.focusTimerId !== null) {
        window.clearTimeout(this.focusTimerId);
      }
      this.focusTimerId = window.setTimeout(() => {
        this.searchInput?.nativeElement.focus();
        this.scrollHighlightedIntoView();
      }, 0);
    }
  }

  protected closeDropdown(restoreFocus: boolean): void {
    if (!this.isOpen()) {
      return;
    }
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
    this.closeDropdown(true);
  }

  protected clearSelection(event: MouseEvent): void {
    event.stopPropagation();
    if (this.isDisabled()) {
      return;
    }
    this.selectedValue.set(null);
    this.onChange(null);
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
      this.searchInput?.nativeElement.focus();
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
    if (!this.isBrowser || !this.optionsList) {
      return;
    }
    const target = this.optionsList.nativeElement.querySelector<HTMLElement>(
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
