import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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

/**
 * Panel de Accesos Multi-Colegio y Multi-Rol.
 * Permite a usuarios con múltiples perfiles (Rector, Coordinador, Secretaría,
 * Docente, Estudiante, Acudiente) o vinculados a varios colegios seleccionar
 * con cuál institución y módulo desean trabajar, firmando el nuevo contexto JWT + RLS.
 */
@Component({
  selector: 'app-access-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomTooltipDirective],
  template: `
    <div class="container-fluid py-3">
      <div class="trezo-card bg-white border-radius p-4 shadow-sm mb-4">
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
          <div>
            <p class="text-uppercase small fw-semibold text-muted mb-1">
              Estimado usuario, usted tiene acceso a:
            </p>
            <h5 class="mb-0 fw-bold">
              Panel de Accesos Multi-Institución
            </h5>
          </div>
          <div class="d-flex flex-wrap gap-2">
            <span class="badge text-bg-light border text-dark">
              {{ uniqueSchoolsCount() }} institución(es)
            </span>
            <span class="badge text-bg-primary">
              {{ v3Auth.memberships().length }} acceso(s) habilitado(s)
            </span>
          </div>
        </div>

        <!-- Búsqueda instantánea por institución, DANE o módulo -->
        <div class="row g-2 align-items-center">
          <div class="col-lg-6">
            <div class="input-group">
              <span class="input-group-text bg-light border-end-0">
                <i class="material-symbols-outlined fs-5 text-muted">search</i>
              </span>
              <input
                type="search"
                class="form-control border-start-0"
                [ngModel]="searchTerm()"
                (ngModelChange)="searchTerm.set($event)"
                placeholder="Búsqueda por colegio, código DANE o módulo..."
              />
              @if (searchTerm()) {
                <button
                  type="button"
                  class="btn btn-outline-secondary"
                  (click)="searchTerm.set('')"
                  [appCustomTooltip]="'Limpiar búsqueda'"
                >
                  <i class="material-symbols-outlined fs-6 align-middle">close</i>
                </button>
              }
            </div>
          </div>

          @if (availableRoles().length > 1) {
            <div class="col-lg-6 d-flex flex-wrap gap-1 justify-content-lg-end">
              <button
                type="button"
                class="btn btn-sm"
                [ngClass]="selectedRoleFilter() === 'ALL' ? 'btn-primary' : 'btn-outline-secondary'"
                (click)="selectedRoleFilter.set('ALL')"
              >
                Todos ({{ v3Auth.memberships().length }})
              </button>
              @for (role of availableRoles(); track role) {
                <button
                  type="button"
                  class="btn btn-sm"
                  [ngClass]="selectedRoleFilter() === role ? 'btn-primary' : 'btn-outline-secondary'"
                  (click)="selectedRoleFilter.set(role)"
                >
                  {{ getRoleLabel(role) }}
                </button>
              }
            </div>
          }
        </div>
      </div>

      <!-- Grilla de 3 columnas con las tarjetas de acceso (colegio + módulo) -->
      <div class="row g-3">
        @for (membership of filteredMemberships(); track membership.schoolId + '-' + membership.role) {
          <div class="col-md-6 col-xl-4">
            <button
              type="button"
              class="v3-hub-card w-100 text-start p-3 h-100 border bg-white d-flex align-items-center gap-3 position-relative"
              [class.border-primary]="isActiveContext(membership)"
              (click)="enterMembership(membership)"
              [appCustomTooltip]="'Ingresar a ' + membership.schoolName + ' como ' + getRoleLabel(membership.role)"
            >
              <span class="v3-kpi-icon flex-shrink-0" [ngClass]="getRoleAccent(membership.role)">
                <i class="material-symbols-outlined">{{ getRoleIcon(membership.role) }}</i>
              </span>

              <div class="flex-grow-1 overflow-hidden">
                <div class="d-flex align-items-center justify-content-between gap-2 mb-1">
                  <span class="fw-bold text-uppercase small text-truncate text-dark">
                    {{ membership.schoolName }}
                  </span>
                  @if (isActiveContext(membership)) {
                    <span class="badge text-bg-success flex-shrink-0">Actual</span>
                  }
                </div>
                <div class="small text-muted">
                  MÓDULO:
                  <strong class="text-primary text-uppercase">
                    {{ getRoleLabel(membership.role) }}
                  </strong>
                </div>
                @if (membership.schoolDaneCode) {
                  <div class="small text-muted font-monospace mt-1">
                    DANE {{ membership.schoolDaneCode }}
                  </div>
                }
              </div>

              <i class="material-symbols-outlined text-muted flex-shrink-0">chevron_right</i>
            </button>
          </div>
        } @empty {
          <div class="col-12">
            <div class="trezo-card bg-white border-radius p-5 text-center shadow-sm">
              <i class="material-symbols-outlined fs-1 text-muted">search_off</i>
              <p class="mt-2 mb-0 text-muted">
                No se encontraron instituciones o módulos que coincidan con "{{ searchTerm() }}".
              </p>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class AccessPanelComponent implements OnInit {
  protected readonly v3Auth = inject(V3UnifiedAuthService);
  private readonly catalogsService = inject(V3CatalogsService);
  private readonly loadMask = inject(LoadMaskService);
  private readonly messages = inject(MessagesService);
  private readonly router = inject(Router);

  readonly searchTerm = signal('');
  readonly selectedRoleFilter = signal<'ALL' | CommunityRole>('ALL');

  readonly uniqueSchoolsCount = computed(
    () => new Set(this.v3Auth.memberships().map((m) => m.schoolId)).size,
  );

  readonly availableRoles = computed<CommunityRole[]>(() => {
    const roles = new Set<CommunityRole>();
    for (const m of this.v3Auth.memberships()) {
      roles.add(m.role);
    }
    return Array.from(roles);
  });

  readonly filteredMemberships = computed(() => {
    const query = this.searchTerm().trim().toLowerCase();
    const roleFilter = this.selectedRoleFilter();

    return this.v3Auth.memberships().filter((m) => {
      if (roleFilter !== 'ALL' && m.role !== roleFilter) {
        return false;
      }
      if (!query) {
        return true;
      }
      const roleLabel = this.getRoleLabel(m.role).toLowerCase();
      return (
        m.schoolName.toLowerCase().includes(query) ||
        (m.schoolDaneCode ?? '').toLowerCase().includes(query) ||
        roleLabel.includes(query) ||
        m.role.toLowerCase().includes(query)
      );
    });
  });

  ngOnInit(): void {
    if (this.v3Auth.isAuthenticated()) {
      this.v3Auth.fetchAuthenticatedProfile().subscribe();
    }
  }

  getRoleLabel(role: CommunityRole): string {
    return COMMUNITY_ROLE_LABELS[role] ?? role;
  }

  getRoleIcon(role: CommunityRole): string {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'admin_panel_settings';
      case 'SCHOOL_ADMIN':
      case 'RECTOR':
        return 'account_balance';
      case 'SECRETARY':
        return 'badge';
      case 'COORDINATOR':
        return 'laptop_mac';
      case 'TEACHER':
        return 'cast_for_education';
      case 'STUDENT':
        return 'school';
      case 'FAMILY':
        return 'family_restroom';
      case 'MONITOR':
        return 'support_agent';
      default:
        return 'domain';
    }
  }

  getRoleAccent(role: CommunityRole): string {
    switch (role) {
      case 'RECTOR':
      case 'SCHOOL_ADMIN':
      case 'SUPER_ADMIN':
        return 'kpi-primary';
      case 'SECRETARY':
        return 'kpi-info';
      case 'COORDINATOR':
        return 'kpi-secondary';
      case 'TEACHER':
        return 'kpi-purple';
      case 'STUDENT':
        return 'kpi-success';
      case 'FAMILY':
        return 'kpi-warning';
      default:
        return 'kpi-primary';
    }
  }

  isActiveContext(membership: UnifiedSchoolMembership): boolean {
    return (
      this.v3Auth.activeSchoolId() === membership.schoolId &&
      this.v3Auth.activeRole() === membership.role
    );
  }

  enterMembership(membership: UnifiedSchoolMembership): void {
    const targetRoute = resolveLandingRouteByRole(membership.role);

    if (this.isActiveContext(membership)) {
      void this.router.navigate([targetRoute]);
      return;
    }

    this.loadMask.show('messages.loadingModule');
    this.v3Auth
      .switchSchoolAndRole(
        membership.schoolId,
        membership.role,
        this.v3Auth.academicYear(),
      )
      .pipe(finalize(() => this.loadMask.hide()))
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
