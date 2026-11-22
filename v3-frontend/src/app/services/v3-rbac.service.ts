import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiEnvelope, CommunityRole } from './v3-unified-auth.service';

export interface PermissionCatalogItem {
  readonly id: number;
  readonly code: string;
  readonly moduleGroup: string;
  readonly name: string;
  readonly description: string;
  readonly systemModuleId: number | null;
  readonly systemModuleTag: string | null;
  readonly isSensitive: boolean;
  readonly isSuperAdminOnly: boolean;
}

export interface RolePermissionMatrixItem {
  readonly permissionCode: string;
  readonly defaultGranted: boolean;
  readonly schoolEffect: 'ALLOW' | 'DENY' | null;
  readonly effectiveGranted: boolean;
  readonly blockedByDisabledModule: boolean;
}

export interface RolesMatrixPayload {
  readonly roles: CommunityRole[];
  readonly catalog: PermissionCatalogItem[];
  readonly enabledModules: string[];
  readonly matrixByRole: Record<string, RolePermissionMatrixItem[]>;
}

export interface UserPermissionOverrideItem {
  readonly permissionCode: string;
  readonly roleEffectiveGranted: boolean;
  readonly userEffect: 'ALLOW' | 'DENY' | null;
  readonly finalEffectiveGranted: boolean;
  readonly blockedByDisabledModule: boolean;
}

export type RbacMembershipAudience =
  | 'DIRECTIVES'
  | 'TEACHERS'
  | 'STUDENTS'
  | 'FAMILIES'
  | 'EXCEPTIONS'
  | 'ALL';

export interface RbacMembershipsSummary {
  readonly totalUsers: number;
  readonly directivesTotal: number;
  readonly byRole: {
    readonly RECTOR: number;
    readonly SECRETARY: number;
    readonly COORDINATOR: number;
    readonly SCHOOL_ADMIN: number;
    readonly TEACHER: number;
    readonly MONITOR: number;
    readonly STUDENT: number;
    readonly FAMILY: number;
  };
  readonly teachersTotal: number;
  readonly studentsTotal: number;
  readonly familiesTotal: number;
  readonly withOverridesTotal: number;
}

export interface SchoolUserMembershipItem {
  readonly userId: number;
  readonly documentNumber: string;
  readonly username: string;
  readonly fullName: string;
  readonly email: string | null;
  readonly userIsActive: boolean;
  readonly overridesCount: number;
  readonly memberships: Array<{
    readonly membershipId: number;
    readonly role: CommunityRole;
    readonly isActive: boolean;
    readonly status: string;
    readonly createdAt: string;
  }>;
}

@Injectable({ providedIn: 'root' })
export class V3RbacService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.APIURL}/rbac`;

  getRolesMatrix(): Observable<RolesMatrixPayload> {
    return this.http
      .get<ApiEnvelope<RolesMatrixPayload>>(`${this.baseUrl}/roles-matrix`)
      .pipe(map((r) => r.data));
  }

  updateRoleMatrix(
    role: CommunityRole,
    changes: Array<{
      permissionCode: string;
      effect: 'ALLOW' | 'DENY' | 'DEFAULT';
    }>,
  ): Observable<{ updatedCount: number }> {
    return this.http
      .patch<ApiEnvelope<{ updatedCount: number }>>(
        `${this.baseUrl}/roles-matrix`,
        { role, changes },
      )
      .pipe(map((r) => r.data));
  }

  resetRoleMatrix(role: CommunityRole): Observable<{ deletedCount: number }> {
    return this.http
      .post<ApiEnvelope<{ deletedCount: number }>>(
        `${this.baseUrl}/roles-matrix/${role}/reset`,
        {},
      )
      .pipe(map((r) => r.data));
  }

  getUserOverrides(
    userId: number,
    role: CommunityRole,
  ): Observable<{
    userId: number;
    role: CommunityRole;
    overrides: UserPermissionOverrideItem[];
  }> {
    const params = new HttpParams().set('role', role);
    return this.http
      .get<
        ApiEnvelope<{
          userId: number;
          role: CommunityRole;
          overrides: UserPermissionOverrideItem[];
        }>
      >(`${this.baseUrl}/users/${userId}/overrides`, { params })
      .pipe(map((r) => r.data));
  }

  updateUserOverrides(
    userId: number,
    role: CommunityRole,
    changes: Array<{
      permissionCode: string;
      effect: 'ALLOW' | 'DENY' | 'INHERIT';
    }>,
  ): Observable<{ updatedCount: number }> {
    return this.http
      .patch<ApiEnvelope<{ updatedCount: number }>>(
        `${this.baseUrl}/users/${userId}/overrides`,
        { role, changes },
      )
      .pipe(map((r) => r.data));
  }

  getMembershipsSummary(): Observable<RbacMembershipsSummary> {
    return this.http
      .get<ApiEnvelope<RbacMembershipsSummary>>(
        `${this.baseUrl}/memberships/summary`,
      )
      .pipe(map((r) => r.data));
  }

  searchMemberships(params: {
    search?: string;
    audience?: RbacMembershipAudience;
    role?: CommunityRole | '';
    limit?: number;
  }): Observable<SchoolUserMembershipItem[]> {
    let httpParams = new HttpParams();
    if (params.search?.trim()) {
      httpParams = httpParams.set('search', params.search.trim());
    }
    if (params.audience) {
      httpParams = httpParams.set('audience', params.audience);
    }
    if (params.role) {
      httpParams = httpParams.set('role', params.role);
    }
    if (params.limit && params.limit > 0) {
      httpParams = httpParams.set('limit', String(params.limit));
    }
    return this.http
      .get<ApiEnvelope<SchoolUserMembershipItem[]>>(
        `${this.baseUrl}/memberships`,
        { params: httpParams },
      )
      .pipe(map((r) => r.data));
  }

  listMemberships(
    search?: string,
    role?: CommunityRole | '',
  ): Observable<SchoolUserMembershipItem[]> {
    return this.searchMemberships({ search, role, audience: 'ALL' });
  }

  assignMembership(payload: {
    userId?: number;
    identifier?: string;
    role: CommunityRole;
  }): Observable<{
    membershipId: number;
    userId: number;
    role: CommunityRole;
    isActive: boolean;
  }> {
    return this.http
      .post<
        ApiEnvelope<{
          membershipId: number;
          userId: number;
          role: CommunityRole;
          isActive: boolean;
        }>
      >(`${this.baseUrl}/memberships`, payload)
      .pipe(map((r) => r.data));
  }

  toggleMembership(
    membershipId: number,
    isActive: boolean,
  ): Observable<{
    membershipId: number;
    isActive: boolean;
    sessionsRevoked: number;
  }> {
    return this.http
      .patch<
        ApiEnvelope<{
          membershipId: number;
          isActive: boolean;
          sessionsRevoked: number;
        }>
      >(`${this.baseUrl}/memberships/${membershipId}`, { isActive })
      .pipe(map((r) => r.data));
  }

  removeMembership(
    membershipId: number,
  ): Observable<{ deleted: boolean; sessionsRevoked: number }> {
    return this.http
      .delete<ApiEnvelope<{ deleted: boolean; sessionsRevoked: number }>>(
        `${this.baseUrl}/memberships/${membershipId}`,
      )
      .pipe(map((r) => r.data));
  }
}
