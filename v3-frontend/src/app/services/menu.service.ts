import { computed, inject, Injectable } from '@angular/core';
import { fullMenu } from '../common/sidebar/full-menu';
import { Menu } from '../interfaces/menu';
import { CommunityRole, V3UnifiedAuthService } from './v3-unified-auth.service';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  private readonly v3Auth = inject(V3UnifiedAuthService);

  public readonly filteredMenu = computed(() => {
    const activeRole = this.v3Auth.activeRole();
    return this.filterItems(fullMenu, activeRole);
  });

  private filterItems(items: Menu[], activeRole: CommunityRole | null): Menu[] {
    const result: Menu[] = [];

    for (const item of items) {
      if (!item.active) {
        continue;
      }

      const isAllowed =
        !item.roles ||
        item.roles.length === 0 ||
        (activeRole !== null && item.roles.includes(activeRole));

      if (!isAllowed) {
        continue;
      }

      if (item.subItems && item.subItems.length > 0) {
        const visibleChildren = this.filterItems(item.subItems, activeRole);
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
