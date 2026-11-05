import { HttpClient } from '@angular/common/http';
import { computed, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { DebugService } from './common/debug.service';

export type CommunityRole =
  | 'SUPER_ADMIN'
  | 'RECTOR'
  | 'COORDINATOR'
  | 'SECRETARY'
  | 'SCHOOL_ADMIN'
  | 'TEACHER'
  | 'STUDENT'
  | 'FAMILY';

export interface UnifiedSchoolMembership {
  readonly schoolId: number;
  readonly schoolName: string;
  readonly schoolDaneCode: string | null;
  readonly role: CommunityRole;
}

export interface UnifiedAuthenticatedSession {
  readonly accessToken: string;
  readonly activeSchoolId: number;
  readonly activeSchoolName: string;
  readonly activeRole: CommunityRole;
  readonly academicYear: number;
  readonly user: {
    readonly id: number;
    readonly username: string;
    readonly fullName: string;
    readonly email: string | null;
    readonly memberships: UnifiedSchoolMembership[];
  };
}

interface ApiEnvelope<TData> {
  readonly success: boolean;
  readonly data: TData;
}

/**
 * Servicio reactivo basado en Angular 20 Signals para autenticacion y cambio de contexto
 * Multi-Tenant verificado por servidor en v3-backend (NestJS + Fastify + PostgreSQL RLS).
 */
@Injectable({
  providedIn: 'root',
})
export class V3UnifiedAuthService {
  private readonly sessionSignal = signal<UnifiedAuthenticatedSession | null>(
    null,
  );

  readonly session = this.sessionSignal.asReadonly();
  readonly isAuthenticated = computed(() => Boolean(this.sessionSignal()));
  readonly activeSchoolId = computed(
    () => this.sessionSignal()?.activeSchoolId ?? null,
  );
  readonly activeRole = computed(
    () => this.sessionSignal()?.activeRole ?? null,
  );

  constructor(
    private readonly http: HttpClient,
    private readonly debugService: DebugService,
  ) {}

  login(
    username: string,
    password: string,
    preferredSchoolId?: number,
    preferredRole?: CommunityRole,
  ): Observable<ApiEnvelope<UnifiedAuthenticatedSession>> {
    return this.http
      .post<ApiEnvelope<UnifiedAuthenticatedSession>>(
        `${environment.APIURL}/auth/login`,
        {
          username,
          password,
          preferredSchoolId,
          preferredRole,
        },
      )
      .pipe(
        tap((response) => {
          this.sessionSignal.set(response.data);
          this.debugService.info(
            'V3UnifiedAuthService.login',
            'Sesion autenticada en base de datos unica PostgreSQL 17',
            {
              activeSchoolId: response.data.activeSchoolId,
              activeRole: response.data.activeRole,
            },
          );
        }),
      );
  }

  switchSchoolAndRole(
    schoolId: number,
    role: CommunityRole,
    academicYear?: number,
  ): Observable<ApiEnvelope<UnifiedAuthenticatedSession>> {
    const currentUser = this.sessionSignal()?.user;
    if (!currentUser) {
      throw new Error('No existe una sesión activa para cambiar de contexto.');
    }

    return this.http
      .post<ApiEnvelope<UnifiedAuthenticatedSession>>(
        `${environment.APIURL}/auth/switch-context`,
        {
          userId: currentUser.id,
          schoolId,
          role,
          academicYear,
        },
      )
      .pipe(
        tap((response) => {
          this.sessionSignal.set(response.data);
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

  logout(): void {
    this.sessionSignal.set(null);
  }
}
