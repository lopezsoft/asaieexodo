import { computed, inject, Injectable } from '@angular/core';
import { fullMenu } from '../common/sidebar/full-menu';
import { Menu } from '../interfaces/menu';
import { V3UnifiedAuthService } from './v3-unified-auth.service';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  private readonly v3Auth = inject(V3UnifiedAuthService);

  public readonly filteredMenu = computed(() => {
    // Dependencia reactiva explícita de rol, permisos y módulos activos
    this.v3Auth.activeRole();
    this.v3Auth.permissions();
    this.v3Auth.enabledModules();
    return this.filterItems(fullMenu);
  });

  private filterItems(items: Menu[]): Menu[] {
    const activeRole = this.v3Auth.activeRole();
    const result: Menu[] = [];

    for (const item of items) {
      if (!item.active) {
        continue;
      }

      if (item.moduleTag && !this.v3Auth.hasModule(item.moduleTag)) {
        continue;
      }

      const roleAllowed =
        !item.roles ||
        item.roles.length === 0 ||
        (activeRole !== null && item.roles.includes(activeRole));

      const singlePermissionAllowed =
        !item.permission || this.v3Auth.hasPermission(item.permission);

      const anyPermissionAllowed =
        !item.anyPermissions ||
        item.anyPermissions.length === 0 ||
        this.v3Auth.hasAnyPermission(item.anyPermissions);

      if (!roleAllowed || !singlePermissionAllowed || !anyPermissionAllowed) {
        continue;
      }

      if (item.subItems && item.subItems.length > 0) {
        const visibleChildren = this.filterItems(item.subItems);
        if (visibleChildren.length > 0) {
          result.push({ ...item, subItems: visibleChildren });
        }
      } else {
        result.push(item);
      }
    }

    return result;
  }
}
