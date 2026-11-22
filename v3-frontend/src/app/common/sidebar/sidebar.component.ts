import { NgClass } from '@angular/common';
import {
  Component,
  computed,
  DestroyRef,
  HostListener,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { filter } from 'rxjs/operators';
import { CustomizerSettingsService } from '../../customizer-settings/customizer-settings.service';
import { Menu } from '../../interfaces/menu';
import { MenuService } from '../../services/menu.service';
import { V3UnifiedAuthService } from '../../services/v3-unified-auth.service';
import { CustomTooltipDirective } from '../../shared/directives/custom-tooltip.directive';
import { ToggleService } from '../header/toggle.service';

@Component({
  selector: 'app-sidebar',
  imports: [
    NgScrollbarModule,
    RouterLinkActive,
    RouterLink,
    NgClass,
    TranslocoPipe,
    CustomTooltipDirective,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  protected readonly v3Auth = inject(V3UnifiedAuthService);
  protected readonly menuService = inject(MenuService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  public menuItems = this.menuService.filteredMenu;
  public readonly currentUrl = signal(this.router.url);
  public readonly activeFlyoutMenuId = signal<number | null>(null);
  public readonly isAccessPanelView = signal(
    this.router.url.startsWith('/access-panel'),
  );
  public readonly activeFlyoutMenu = computed<Menu | null>(() => {
    const targetId = this.activeFlyoutMenuId();
    if (targetId === null) {
      return null;
    }
    return (
      this.menuService
        .filteredMenu()
        .find((item) => item.id === targetId && Boolean(item.subItems?.length)) ??
      null
    );
  });

  isSidebarToggled = false;
  isToggled = false;

  constructor(
    private readonly toggleService: ToggleService,
    public readonly themeService: CustomizerSettingsService,
  ) {
    this.toggleService.isSidebarToggled$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((isSidebarToggled) => {
        this.isSidebarToggled = isSidebarToggled;
      });
    this.themeService.isToggled$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((isToggled) => {
        this.isToggled = isToggled;
      });
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => {
        this.currentUrl.set(event.urlAfterRedirects);
        this.isAccessPanelView.set(
          event.urlAfterRedirects.startsWith('/access-panel'),
        );
        this.activeFlyoutMenuId.set(null);
      });
  }

  toggle(): void {
    this.toggleService.toggle();
  }

  toggleFlyout(menuId: number): void {
    this.activeFlyoutMenuId.update((current) =>
      current === menuId ? null : menuId,
    );
  }

  closeFlyout(): void {
    this.activeFlyoutMenuId.set(null);
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.activeFlyoutMenuId() !== null) {
      this.closeFlyout();
    }
  }

  isMenuGroupActive(item: Menu): boolean {
    if (this.activeFlyoutMenuId() === item.id) {
      return true;
    }
    const url = this.currentUrl();
    const matchesLink = (link: string | undefined): boolean =>
      Boolean(
        link &&
          (url === link ||
            url.startsWith(`${link}/`) ||
            url.startsWith(`${link}?`)),
      );
    if (matchesLink(item.link)) {
      return true;
    }
    return Boolean(item.subItems?.some((sub) => matchesLink(sub.link)));
  }

  logout(): void {
    this.closeFlyout();
    this.v3Auth.logout(true);
  }
}
