import { NgClass } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
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
import { MenuService } from '../../services/menu.service';
import { V3UnifiedAuthService } from '../../services/v3-unified-auth.service';
import { ToggleService } from '../header/toggle.service';

@Component({
  selector: 'app-sidebar',
  imports: [
    NgScrollbarModule,
    RouterLinkActive,
    RouterLink,
    NgClass,
    TranslocoPipe,
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
  public readonly expandedMenus = signal<Record<number, boolean>>({ 10: true });
  public readonly isAccessPanelView = signal(
    this.router.url.startsWith('/access-panel'),
  );
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
        this.isAccessPanelView.set(
          event.urlAfterRedirects.startsWith('/access-panel'),
        );
      });
  }

  toggle(): void {
    this.toggleService.toggle();
  }

  toggleSubmenu(menuId: number): void {
    this.expandedMenus.update((state) => ({
      ...state,
      [menuId]: !state[menuId],
    }));
  }

  isSubmenuExpanded(menuId: number): boolean {
    return Boolean(this.expandedMenus()[menuId]);
  }

  logout(): void {
    this.v3Auth.logout(true);
  }
}
