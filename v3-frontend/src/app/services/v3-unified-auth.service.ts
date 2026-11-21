import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, of, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { DebugService } from './common/debug.service';
import { StorageService } from './storage.service';

export type CommunityRole =
  | 'SUPER_ADMIN'
  | 'SCHOOL_ADMIN'
  | 'RECTOR'
  | 'COORDINATOR'
  | 'SECRETARY'
  | 'TEACHER'
  | 'STUDENT'
  | 'FAMILY'
  | 'MONITOR';

export const COMMUNITY_ROLE_LABELS: Readonly<Record<CommunityRole, string>> = {
  SUPER_ADMIN: 'Super Administrador',
  SCHOOL_ADMIN: 'Administrador Institucional',
  RECTOR: 'Rector(a) / Director(a)',
  COORDINATOR: 'Coordinación',
  SECRETARY: 'Secretaría Académica',
  TEACHER: 'Docente',
  STUDENT: 'Estudiante',
  FAMILY: 'Padre de Familia / Acudiente',
  MONITOR: 'Monitor Académico',
};

/**
 * Resuelve la ruta de entrada principal para cada rol educativo tras iniciar sesión
 * o cambiar de contexto en el Panel de Accesos.
 */
export function resolveLandingRouteByRole(
  role: CommunityRole | null | undefined,
): string {
  switch (role) {
    case 'TEACHER':
      return '/teacher';
    case 'STUDENT':
    case 'FAMILY':
      return '/student/academic-notes';
    default:
      return '/dashboard';
  }
}

export interface UnifiedSchoolMembership {
  readonly schoolId: number;
  readonly schoolName: string;
  readonly schoolDaneCode: string | null;
  readonly role: CommunityRole;
}

export interface UnifiedCommunityUserProfile {
  readonly id: number;
  readonly documentTypeId: number;
  readonly documentNumber: string;
  readonly email: string | null;
  readonly username: string;
  readonly firstName: string;
  readonly middleName: string | null;
  readonly lastName: string;
  readonly secondLastName: string | null;
  readonly fullName: string;
  readonly avatarUrl: string | null;
  readonly isActive: boolean;
  readonly memberships: UnifiedSchoolMembership[];
}

export interface UnifiedAuthenticatedSession {
  readonly accessToken: string;
  readonly sessionId: string;
  readonly activeSchoolId: number;
  readonly activeSchoolName: string;
  readonly activeRole: CommunityRole;
  readonly academicYear: number;
  readonly user: UnifiedCommunityUserProfile;
}

export interface ApiEnvelope<TData> {
  readonly success: boolean;
  readonly data: TData;
}

const STORAGE_SESSION_KEY = environment.APIJWT;

/**
 * Servicio reactivo basado en Angular 20 Signals para autenticacion, persistencia segura
 * de sesion (con validacion de expiracion JWT) y cambio de contexto Multi-Tenant
 * verificado por servidor contra v3-backend (NestJS 11 + Fastify 5 + PostgreSQL 17 RLS).
 */
@Injectable({
  providedIn: 'root',
})
export class V3UnifiedAuthService {
  private readonly http = inject(HttpClient);
  private readonly storage = inject(StorageService);
  private readonly router = inject(Router);
  private readonly debugService = inject(DebugService);

  private readonly sessionSignal = signal<UnifiedAuthenticatedSession | null>(
    null,
  );

  readonly session = this.sessionSignal.asReadonly();
  readonly isAuthenticated = computed(() => Boolean(this.sessionSignal()));
  readonly accessToken = computed(
    () => this.sessionSignal()?.accessToken ?? null,
  );
  readonly activeSchoolId = computed(
    () => this.sessionSignal()?.activeSchoolId ?? null,
  );
  readonly activeSchoolName = computed(
    () => this.sessionSignal()?.activeSchoolName ?? '',
  );
  readonly activeRole = computed(
    () => this.sessionSignal()?.activeRole ?? null,
  );
  readonly activeRoleLabel = computed(() => {
    const role = this.sessionSignal()?.activeRole;
    return role ? COMMUNITY_ROLE_LABELS[role] ?? role : '';
  });
  readonly academicYear = computed(
    () => this.sessionSignal()?.academicYear ?? new Date().getFullYear(),
  );
  readonly user = computed(() => this.sessionSignal()?.user ?? null);
  readonly memberships = computed(
    () => this.sessionSignal()?.user?.memberships ?? [],
  );
  readonly hasMultipleMemberships = computed(
    () => this.memberships().length > 1,
  );
  readonly defaultHomeRoute = computed(() =>
    resolveLandingRouteByRole(this.activeRole()),
  );

  constructor() {
    this.hydrateSessionFromStorage();
  }

  login(
    username: string,
    password: string,
    preferredSchoolId?: number,
    preferredRole?: CommunityRole,
  ): Observable<ApiEnvelope<UnifiedAuthenticatedSession>> {
    const payload: Record<string, unknown> = {
      username: username.trim(),
      password,
    };
    if (preferredSchoolId) {
      payload['preferredSchoolId'] = preferredSchoolId;
    }
    if (preferredRole) {
      payload['preferredRole'] = preferredRole;
    }

    return this.http
      .post<ApiEnvelope<UnifiedAuthenticatedSession>>(
        `${environment.APIURL}/auth/login`,
        payload,
      )
      .pipe(
        tap((response) => {
          this.persistSession(response.data);
          this.debugService.info(
            'V3UnifiedAuthService.login',
            'Sesión autenticada en base de datos única PostgreSQL 17',
            {
              activeSchoolId: response.data.activeSchoolId,
              activeRole: response.data.activeRole,
            },
          );
        }),
      );
  }

  fetchAuthenticatedProfile(): Observable<
    ApiEnvelope<Omit<UnifiedAuthenticatedSession, 'accessToken'>>
  > {
    return this.http
      .get<ApiEnvelope<Omit<UnifiedAuthenticatedSession, 'accessToken'>>>(
        `${environment.APIURL}/auth/me`,
      )
      .pipe(
        tap((response) => {
          const current = this.sessionSignal();
          if (current) {
            this.persistSession({
              ...response.data,
              accessToken: current.accessToken,
            });
          }
        }),
      );
  }

  switchSchoolAndRole(
    schoolId: number,
    role: CommunityRole,
    academicYear?: number,
  ): Observable<ApiEnvelope<UnifiedAuthenticatedSession>> {
    if (!this.sessionSignal()) {
      return throwError(
        () => new Error('No existe una sesión activa para cambiar de contexto.'),
      );
    }

    const body: Record<string, unknown> = { schoolId, role };
    if (academicYear) {
      body['academicYear'] = academicYear;
    }

    return this.http
      .post<ApiEnvelope<UnifiedAuthenticatedSession>>(
        `${environment.APIURL}/auth/switch-context`,
        body,
      )
      .pipe(
        tap((response) => {
          this.persistSession(response.data);
          this.debugService.info(
            'V3UnifiedAuthService.switchSchoolAndRole',
            'Contexto de colegio y rol actualizado con firma JWT del servidor',
            {
              activeSchoolId: response.data.activeSchoolId,
              activeRole: response.data.activeRole,
            },
          );
        }),
      );
  }

  forgotPassword(
    identifier: string,
  ): Observable<
    ApiEnvelope<{ accepted: boolean; expiresInMinutes: number; message: string }>
  > {
    return this.http.post<
      ApiEnvelope<{
        accepted: boolean;
        expiresInMinutes: number;
        message: string;
      }>
    >(`${environment.APIURL}/auth/forgot-password`, {
      identifier: identifier.trim(),
    });
  }

  resetPassword(
    resetToken: string,
    newPassword: string,
  ): Observable<ApiEnvelope<{ updated: boolean; userId: number }>> {
    return this.http.post<ApiEnvelope<{ updated: boolean; userId: number }>>(
      `${environment.APIURL}/auth/reset-password`,
      {
        resetToken: resetToken.trim(),
        newPassword,
      },
    );
  }

  confirmEmail(
    token: string,
  ): Observable<ApiEnvelope<{ verified: boolean; userId: number }>> {
    return this.http.post<ApiEnvelope<{ verified: boolean; userId: number }>>(
      `${environment.APIURL}/auth/confirm-email`,
      {
        token: token.trim(),
      },
    );
  }

  requestEmailConfirmation(): Observable<
    ApiEnvelope<{ delivered: boolean; templateType: string }>
  > {
    return this.http.post<
      ApiEnvelope<{ delivered: boolean; templateType: string }>
    >(`${environment.APIURL}/auth/request-email-confirmation`, {});
  }

  changePassword(
    currentPassword: string,
    newPassword: string,
  ): Observable<ApiEnvelope<{ updated: boolean; alertDelivered: boolean }>> {
    return this.http.post<
      ApiEnvelope<{ updated: boolean; alertDelivered: boolean }>
    >(`${environment.APIURL}/auth/change-password`, {
      currentPassword,
      newPassword,
    });
  }

  updateOwnProfile(payload: {
    firstName: string;
    middleName?: string | null;
    lastName: string;
    secondLastName?: string | null;
    email?: string | null;
    phone?: string | null;
    avatarUrl?: string | null;
  }): Observable<ApiEnvelope<UnifiedCommunityUserProfile>> {
    return this.http
      .patch<ApiEnvelope<UnifiedCommunityUserProfile>>(
        `${environment.APIURL}/auth/me`,
        payload,
      )
      .pipe(
        tap((response) => {
          const current = this.sessionSignal();
          if (current) {
            this.persistSession({
              ...current,
              user: response.data,
            });
          }
        }),
      );
  }

  changeUsername(
    currentPassword: string,
    newUsername: string,
  ): Observable<ApiEnvelope<UnifiedCommunityUserProfile>> {
    return this.http
      .patch<ApiEnvelope<UnifiedCommunityUserProfile>>(
        `${environment.APIURL}/auth/username`,
        {
          currentPassword,
          newUsername: newUsername.trim(),
        },
      )
      .pipe(
        tap((response) => {
          const current = this.sessionSignal();
          if (current) {
            this.persistSession({
              ...current,
              user: response.data,
            });
          }
        }),
      );
  }

  setWorkingAcademicYear(year: number): void {
    const current = this.sessionSignal();
    if (!current || year < 1990 || year > 2100 || current.academicYear === year) {
      return;
    }
    this.persistSession({
      ...current,
      academicYear: year,
    });
    this.debugService.info(
      'V3UnifiedAuthService.setWorkingAcademicYear',
      'Año lectivo de trabajo actualizado en sesión',
      { academicYear: year },
    );
  }

  logout(redirectToLogin = true): void {
    const hasActiveSession = Boolean(this.sessionSignal());
    if (hasActiveSession) {
      this.http
        .post(`${environment.APIURL}/auth/logout`, {})
        .pipe(catchError(() => of(null)))
        .subscribe();
    }

    this.clearLocalSession();
    if (redirectToLogin) {
      void this.router.navigate(['/auth']);
    }
  }

  clearLocalSession(): void {
    this.sessionSignal.set(null);
    this.storage.removeItem(STORAGE_SESSION_KEY);
  }

  hasAnyRole(roles: readonly CommunityRole[]): boolean {
    const active = this.activeRole();
    return Boolean(active && roles.includes(active));
  }

  /**
   * Si el usuario tiene múltiples colegios o perfiles, lo lleva al Panel de Accesos;
   * si tiene un único perfil, lo dirige directamente a su módulo correspondiente.
   */
  resolvePostLoginRoute(session?: UnifiedAuthenticatedSession | null): string {
    const current = session ?? this.sessionSignal();
    if (!current) {
      return '/auth';
    }
    if ((current.user?.memberships?.length ?? 0) > 1) {
      return '/access-panel';
    }
    return resolveLandingRouteByRole(current.activeRole);
  }

  private persistSession(session: UnifiedAuthenticatedSession): void {
    this.sessionSignal.set(session);
    this.storage.setItem(STORAGE_SESSION_KEY, session);
  }

  private hydrateSessionFromStorage(): void {
    const saved =
      this.storage.getItem<UnifiedAuthenticatedSession>(STORAGE_SESSION_KEY);
    if (!saved?.accessToken || !saved.user?.id) {
      return;
    }
    if (this.isJwtExpired(saved.accessToken)) {
      this.debugService.warn(
        'V3UnifiedAuthService.hydrateSessionFromStorage',
        'Sesión local expirada descartada al inicializar',
      );
      this.storage.removeItem(STORAGE_SESSION_KEY);
      return;
    }
    this.sessionSignal.set(saved);
  }

  private isJwtExpired(token: string): boolean {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return true;
      }
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = atob(base64);
      const parsed = JSON.parse(jsonPayload) as { exp?: number };
      if (!parsed.exp) {
        return false;
      }
      return Date.now() >= parsed.exp * 1000;
    } catch {
      return true;
    }
  }
}
