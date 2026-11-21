import { NgClass } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { NgScrollbarModule } from 'ngx-scrollbar';
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

  public menuItems = this.menuService.filteredMenu;
  public readonly expandedMenus = signal<Record<number, boolean>>({ 10: true });
  isSidebarToggled = false;
  isToggled = false;

  constructor(
    private readonly toggleService: ToggleService,
    public readonly themeService: CustomizerSettingsService,
  ) {
    this.toggleService.isSidebarToggled$.subscribe((isSidebarToggled) => {
      this.isSidebarToggled = isSidebarToggled;
    });
    this.themeService.isToggled$.subscribe((isToggled) => {
      this.isToggled = isToggled;
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
