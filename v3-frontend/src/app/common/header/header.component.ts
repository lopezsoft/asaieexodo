import { isPlatformBrowser, NgClass, NgIf, NgOptimizedImage } from '@angular/common';
import {
  Component,
  computed,
  DestroyRef,
  effect,
  HostListener,
  Inject,
  inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { filter } from 'rxjs/operators';
import { CustomizerSettingsService } from '../../customizer-settings/customizer-settings.service';
import { LanguageService } from '../../services/common/language.service';
import { V3CatalogsService } from '../../services/v3-catalogs.service';
import { V3UnifiedAuthService } from '../../services/v3-unified-auth.service';
import {
  SearchableSelectOption,
  V3SearchableSelectComponent,
} from '../../shared/components/v3-searchable-select/v3-searchable-select.component';
import { CustomTooltipDirective } from '../../shared/directives/custom-tooltip.directive';
import { fallbackAvatarUrl } from '../../utils/utils';
import { ToggleService } from './toggle.service';

@Component({
  selector: 'app-header',
  imports: [
    RouterLink,
    NgClass,
    NgIf,
    FormsModule,
    TranslocoPipe,
    NgOptimizedImage,
    CustomTooltipDirective,
    V3SearchableSelectComponent,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  public readonly langService = inject(LanguageService);
  public readonly v3Auth = inject(V3UnifiedAuthService);
  private readonly catalogsService = inject(V3CatalogsService);
  private readonly destroyRef = inject(DestroyRef);

  readonly isAccessPanelView = signal(false);
  private readonly schoolAcademicYears = signal<
    ReadonlyArray<{ readonly year: number; readonly isClosed: boolean }>
  >([]);

  isSidebarToggled = false;
  isToggled = false;
  isSticky = false;
  isLanguageDropdownOpen = false;
  isProfileDropdownOpen = false;
  isFullscreen = false;

  protected readonly fallbackAvatarUrl = fallbackAvatarUrl();
  protected readonly academicYearOptions = computed<
    SearchableSelectOption<number>[]
  >(() => {
    const dbYears = this.schoolAcademicYears();
    const activeYear = this.v3Auth.academicYear();

    if (dbYears.length > 0) {
      const yearMap = new Map<number, { year: number; isClosed: boolean }>();
      for (const item of dbYears) {
        yearMap.set(item.year, item);
      }
      if (!yearMap.has(activeYear)) {
        yearMap.set(activeYear, { year: activeYear, isClosed: false });
      }
      return Array.from(yearMap.values())
        .sort((a, b) => b.year - a.year)
        .map((item) => ({
          value: item.year,
          label: String(item.year),
          subtitle: item.isClosed ? 'Año cerrado' : 'Año activo',
          keywords: item.isClosed
            ? `${item.year} cerrado historico`
            : `${item.year} activo vigente actual`,
        }));
    }

    const current = new Date().getFullYear();
    const maxYear = Math.max(current, activeYear);
    const minYear = Math.min(2011, activeYear);
    const options: SearchableSelectOption<number>[] = [];
    for (let y = maxYear; y >= minYear; y--) {
      options.push({
        value: y,
        label: String(y),
        subtitle: y === activeYear ? 'Año seleccionado' : 'Histórico',
        keywords: `${y}`,
      });
    }
    return options;
  });

  constructor(
    private readonly toggleService: ToggleService,
    public readonly themeService: CustomizerSettingsService,
    @Inject(PLATFORM_ID) private readonly platformId: object,
    private readonly router: Router,
  ) {
    this.isAccessPanelView.set(this.router.url.startsWith('/access-panel'));
    this.toggleService.isSidebarToggled$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((toggled) => {
        this.isSidebarToggled = toggled;
      });
    this.themeService.isToggled$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((toggled) => {
        this.isToggled = toggled;
      });
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => {
        this.isAccessPanelView.set(
          event.urlAfterRedirects.startsWith('/access-panel'),
        );
        if (
          isPlatformBrowser(this.platformId) &&
          window.innerWidth < 1200 &&
          this.isSidebarToggled
        ) {
          this.toggleService.toggle();
        }
      });

    effect((onCleanup) => {
      const authenticated = this.v3Auth.isAuthenticated();
      const schoolId = this.v3Auth.activeSchoolId();
      const inAccessPanel = this.isAccessPanelView();
      this.catalogsService.schoolContextVersion();

      if (!authenticated || !schoolId) {
        this.schoolAcademicYears.set([]);
        return;
      }

      if (!isPlatformBrowser(this.platformId) || inAccessPanel) {
        return;
      }

      const subscription = this.catalogsService.getSchoolContext().subscribe({
        next: (context) => {
          this.schoolAcademicYears.set(context.academicYears ?? []);
        },
        error: () => {
          // Conserva el rango historico de respaldo si la consulta falla temporalmente.
        },
      });

      onCleanup(() => subscription.unsubscribe());
    });
  }

  toggle(): void {
    this.toggleService.toggle();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  @HostListener('window:scroll')
  checkScroll(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const scrollPosition =
      window.scrollY ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;
    this.isSticky = scrollPosition >= 24;
  }

  toggleLanguageDropdown(): void {
    this.isLanguageDropdownOpen = !this.isLanguageDropdownOpen;
  }

  toggleProfileDropdown(): void {
    this.isProfileDropdownOpen = !this.isProfileDropdownOpen;
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event): void {
    const target = event.target as HTMLElement | null;
    if (!target) {
      return;
    }
    if (!target.closest('.language-menu')) {
      this.isLanguageDropdownOpen = false;
    }
    if (!target.closest('.profile-menu')) {
      this.isProfileDropdownOpen = false;
    }
  }

  toggleFullscreen(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    if (this.isFullscreen) {
      void document.exitFullscreen?.();
      this.isFullscreen = false;
    } else {
      void document.documentElement.requestFullscreen?.();
      this.isFullscreen = true;
    }
  }

  changeLanguage(lang: string): void {
    this.langService.changeLanguage(lang);
    this.isLanguageDropdownOpen = false;
  }

  onAcademicYearChange(yearValue: string | number | null): void {
    if (yearValue === null || yearValue === '') {
      return;
    }
    const parsedYear = Number(yearValue);
    if (!Number.isNaN(parsedYear)) {
      this.v3Auth.setWorkingAcademicYear(parsedYear);
    }
  }

  getCurrentUserAvatar(): string {
    const avatarUrl = this.v3Auth.user()?.avatarUrl;
    return avatarUrl && avatarUrl.trim().length > 0
      ? avatarUrl
      : 'assets/images/avatars/unknown.png';
  }

  logout(): void {
    this.isProfileDropdownOpen = false;
    this.v3Auth.logout(true);
  }
}
