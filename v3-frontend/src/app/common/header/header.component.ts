import { isPlatformBrowser, NgClass, NgIf, NgOptimizedImage } from '@angular/common';
import {
  Component,
  computed,
  HostListener,
  Inject,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { filter } from 'rxjs/operators';
import { CustomizerSettingsService } from '../../customizer-settings/customizer-settings.service';
import { LanguageService } from '../../services/common/language.service';
import { V3UnifiedAuthService } from '../../services/v3-unified-auth.service';
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
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  public readonly langService = inject(LanguageService);
  public readonly v3Auth = inject(V3UnifiedAuthService);

  isSidebarToggled = false;
  isToggled = false;
  isSticky = false;
  isLanguageDropdownOpen = false;
  isProfileDropdownOpen = false;
  isFullscreen = false;

  protected readonly fallbackAvatarUrl = fallbackAvatarUrl();
  protected readonly availableAcademicYears = computed(() => {
    const current = new Date().getFullYear();
    const active = this.v3Auth.academicYear();
    const minYear = Math.min(current - 5, active);
    const maxYear = Math.max(current + 1, active);
    const years: number[] = [];
    for (let y = maxYear; y >= minYear; y--) {
      years.push(y);
    }
    return years;
  });

  constructor(
    private readonly toggleService: ToggleService,
    public readonly themeService: CustomizerSettingsService,
    @Inject(PLATFORM_ID) private readonly platformId: object,
    private readonly router: Router,
  ) {
    this.toggleService.isSidebarToggled$.subscribe((toggled) => {
      this.isSidebarToggled = toggled;
    });
    this.themeService.isToggled$.subscribe((toggled) => {
      this.isToggled = toggled;
    });
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        if (this.isSidebarToggled) {
          this.toggleService.toggle();
        }
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
    this.isSticky = scrollPosition >= 50;
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

  onAcademicYearChange(yearValue: string | number): void {
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
