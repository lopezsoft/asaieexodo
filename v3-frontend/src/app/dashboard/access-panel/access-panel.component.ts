import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { finalize } from 'rxjs';
import { LoadMaskService } from '../../services/common/load-mask.service';
import { MessagesService } from '../../services/messages.service';
import { V3CatalogsService } from '../../services/v3-catalogs.service';
import {
  COMMUNITY_ROLE_LABELS,
  CommunityRole,
  resolveLandingRouteByRole,
  UnifiedSchoolMembership,
  V3UnifiedAuthService,
} from '../../services/v3-unified-auth.service';
import { CustomTooltipDirective } from '../../shared/directives/custom-tooltip.directive';

interface SchoolMembershipGroup {
  readonly schoolId: number;
  readonly schoolName: string;
  readonly memberships: UnifiedSchoolMembership[];
}

const ROLE_DISPLAY_ORDER: Readonly<Record<CommunityRole, number>> = {
  RECTOR: 1,
  SCHOOL_ADMIN: 2,
  SECRETARY: 3,
  COORDINATOR: 4,
  TEACHER: 5,
  MONITOR: 6,
  STUDENT: 7,
  FAMILY: 8,
  SUPER_ADMIN: 9,
};

/**
 * Normaliza cadenas para realizar búsquedas rápidas sin sensibilidad a tildes o mayúsculas.
 */
function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Panel de Accesos Multi-Colegio y Multi-Rol.
 * Permite a usuarios con múltiples perfiles o vinculados a varios colegios seleccionar
 * con cuál institución y módulo desean trabajar, firmando el nuevo contexto JWT + RLS.
 */
@Component({
  selector: 'app-access-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslocoPipe, CustomTooltipDirective],
  templateUrl: './access-panel.component.html',
})
export class AccessPanelComponent implements OnInit {
  protected readonly v3Auth = inject(V3UnifiedAuthService);
  private readonly catalogsService = inject(V3CatalogsService);
  private readonly loadMask = inject(LoadMaskService);
  private readonly messages = inject(MessagesService);
  private readonly router = inject(Router);

  readonly searchTerm = signal('');
  readonly selectedRoleFilter = signal<'ALL' | CommunityRole>('ALL');
  readonly isLoadingProfile = signal(false);
  readonly enteringMembershipKey = signal<string | null>(null);
  readonly skeletonPlaceholders = [0, 1, 2, 3, 4, 5];
  readonly todayLabel: string = new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date());

  readonly totalMembershipsCount = computed(() => this.v3Auth.memberships().length);

  readonly uniqueSchoolsCount = computed(
    () => new Set(this.v3Auth.memberships().map((m) => m.schoolId)).size,
  );

  readonly hasActiveFilters = computed(
    () =>
      this.searchTerm().trim().length > 0 || this.selectedRoleFilter() !== 'ALL',
  );

  readonly roleCounts = computed<Partial<Record<CommunityRole, number>>>(() => {
    const counts: Partial<Record<CommunityRole, number>> = {};
    for (const membership of this.v3Auth.memberships()) {
      counts[membership.role] = (counts[membership.role] ?? 0) + 1;
    }
    return counts;
  });

  readonly availableRoles = computed<CommunityRole[]>(() => {
    const roles = new Set<CommunityRole>();
    for (const membership of this.v3Auth.memberships()) {
      roles.add(membership.role);
    }
    return Array.from(roles).sort(
      (a, b) => (ROLE_DISPLAY_ORDER[a] ?? 99) - (ROLE_DISPLAY_ORDER[b] ?? 99),
    );
  });

  readonly filteredMemberships = computed(() => {
    const query = normalizeText(this.searchTerm());
    const roleFilter = this.selectedRoleFilter();

    return this.v3Auth.memberships().filter((membership) => {
      if (roleFilter !== 'ALL' && membership.role !== roleFilter) {
        return false;
      }
      if (!query) {
        return true;
      }
      const roleLabel = normalizeText(this.getRoleLabel(membership.role));
      const schoolName = normalizeText(membership.schoolName);
      const daneCode = normalizeText(membership.schoolDaneCode ?? '');
      const rawRole = normalizeText(membership.role);

      return (
        schoolName.includes(query) ||
        daneCode.includes(query) ||
        roleLabel.includes(query) ||
        rawRole.includes(query)
      );
    });
  });

  readonly schoolGroups = computed<SchoolMembershipGroup[]>(() => {
    const grouped = new Map<number, SchoolMembershipGroup>();

    for (const membership of this.filteredMemberships()) {
      let group = grouped.get(membership.schoolId);
      if (!group) {
        group = {
          schoolId: membership.schoolId,
          schoolName: membership.schoolName,
          memberships: [],
        };
        grouped.set(membership.schoolId, group);
      }
      group.memberships.push(membership);
    }

    const groups = Array.from(grouped.values());
    for (const group of groups) {
      group.memberships.sort(
        (a, b) =>
          (ROLE_DISPLAY_ORDER[a.role] ?? 99) - (ROLE_DISPLAY_ORDER[b.role] ?? 99),
      );
    }
    return groups;
  });

  readonly useSchoolRowGrouping = computed(
    () =>
      this.selectedRoleFilter() === 'ALL' &&
      this.schoolGroups().some((group) => group.memberships.length > 1),
  );

  ngOnInit(): void {
    if (this.v3Auth.isAuthenticated()) {
      this.isLoadingProfile.set(true);
      this.v3Auth
        .fetchAuthenticatedProfile()
        .pipe(finalize(() => this.isLoadingProfile.set(false)))
        .subscribe({
          error: () => {
            // El interceptor global gestiona notificaciones HTTP si falla la recarga silenciosa.
          },
        });
    }
  }

  membershipKey(membership: UnifiedSchoolMembership): string {
    return `${membership.schoolId}-${membership.role}`;
  }

  isEntering(membership: UnifiedSchoolMembership): boolean {
    return this.enteringMembershipKey() === this.membershipKey(membership);
  }

  getRoleCount(role: CommunityRole): number {
    return this.roleCounts()[role] ?? 0;
  }

  getSelectedRoleLabel(): string {
    const filter = this.selectedRoleFilter();
    return filter === 'ALL' ? '' : this.getRoleLabel(filter);
  }

  getRoleLabel(role: CommunityRole): string {
    return COMMUNITY_ROLE_LABELS[role] ?? role;
  }

  getRoleIconClass(role: CommunityRole): string {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'fas fa-user-shield';
      case 'SCHOOL_ADMIN':
      case 'RECTOR':
      case 'SECRETARY':
        return 'fas fa-school';
      case 'COORDINATOR':
        return 'fas fa-laptop';
      case 'TEACHER':
        return 'fas fa-chalkboard-teacher';
      case 'STUDENT':
        return 'fas fa-user-graduate';
      case 'FAMILY':
        return 'fas fa-users';
      case 'MONITOR':
        return 'fas fa-headset';
      default:
        return 'fas fa-building';
    }
  }

  getRoleVariantClass(role: CommunityRole): string {
    switch (role) {
      case 'TEACHER':
        return 'role-teacher';
      case 'STUDENT':
        return 'role-student';
      case 'FAMILY':
        return 'role-family';
      default:
        return 'role-academic';
    }
  }

  isActiveContext(membership: UnifiedSchoolMembership): boolean {
    return (
      this.v3Auth.activeSchoolId() === membership.schoolId &&
      this.v3Auth.activeRole() === membership.role
    );
  }

  onSearchKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.searchTerm()) {
      event.preventDefault();
      this.searchTerm.set('');
    }
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedRoleFilter.set('ALL');
  }

  enterMembership(membership: UnifiedSchoolMembership): void {
    if (this.enteringMembershipKey()) {
      return;
    }

    const key = this.membershipKey(membership);
    this.enteringMembershipKey.set(key);

    const targetRoute = resolveLandingRouteByRole(membership.role);
    if (this.isActiveContext(membership)) {
      void this.router
        .navigate([targetRoute])
        .finally(() => this.enteringMembershipKey.set(null));
      return;
    }

    this.loadMask.show('messages.loadingModule');
    this.v3Auth
      .switchSchoolAndRole(
        membership.schoolId,
        membership.role,
        this.v3Auth.academicYear(),
      )
      .pipe(
        finalize(() => {
          this.loadMask.hide();
          this.enteringMembershipKey.set(null);
        }),
      )
      .subscribe({
        next: (response) => {
          this.catalogsService.invalidateCache();
          this.messages.showSuccess(
            `${response.data.activeSchoolName} · ${this.getRoleLabel(response.data.activeRole)}`,
          );
          void this.router.navigate([
            resolveLandingRouteByRole(response.data.activeRole),
          ]);
        },
      });
  }
}
