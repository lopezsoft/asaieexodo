// path: src/app/services/auth.service.ts
import { Injectable, signal, computed, inject, WritableSignal, Signal } from '@angular/core';
import {AccessToken} from '../interfaces';
import { StorageService } from './storage.service';
import {RolContract, User} from "../models/users-model";
import {Router} from "@angular/router";
import {ApiService} from "./api.service";
import {MessagesService} from "./messages.service";
import {delay, Observable, of, tap} from "rxjs";
import {SchoolContract} from "../models/school-contract";
import {map} from "rxjs/operators";
import {getApiJwt, getAppUrl} from "../utils/environments-data";
import {Role} from "../enums/profiel-enum";

const API_JWT_KEY = getApiJwt();
const CURRENT_USER_KEY = 'currentUser';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private storageService = inject(StorageService);
  private router = inject(Router);
  private apiService = inject(ApiService);
  private messagesService = inject(MessagesService);

  // Señal (Signal) para el usuario actual. Inicia con el valor de localStorage.
  currentUser: WritableSignal<User | null> = signal(this.storageService.getItem<User>(CURRENT_USER_KEY));

  // Señal (Signal) para el rol del usuario actual. Inicia con null.
  currentUserRole: WritableSignal<Role | null> = signal(this.storageService.getItem<AccessToken>(API_JWT_KEY)?.currentRole || null);

  // Señal (Signal) para el token de acceso actual. Inicia con el valor de localStorage.
  currentToken: WritableSignal<AccessToken | null> = signal(this.storageService.getItem<AccessToken>(API_JWT_KEY));

  // Señal computada que deriva si el usuario está autenticado.
  isAuthenticated: Signal<boolean> = computed(() => !!this.currentUser());

  // Señal computada que deriva el rol del usuario actual.
  hasCurrentProfile: Signal<boolean> = computed(() => {
    const token = this.currentToken();
    return !!(token && token.currentRole);
  });


  // Señal computada para verificar el rol del usuario actual.
  isAdmin: Signal<boolean> = computed(() => {
    const user = this.currentUser();
    return user ? user.role === Role.Admin : false;
  });

  isTeacher: Signal<boolean> = computed(() => {
    const user = this.currentUser();
    return user ? user.role === Role.Teacher : false;
  });

  isStudent: Signal<boolean> = computed(() => {
    const user = this.currentUser();
    return user ? user.role === Role.Student : false;
  });

  isFamily: Signal<boolean> = computed(() => {
    const user = this.currentUser();
    return user ? user.role === Role.Family : false;
  });

  isRector: Signal<boolean> = computed(() => {
    const user = this.currentUser();
    return user ? user.role === Role.Rector : false;
  });

  isCoordinator: Signal<boolean> = computed(() => {
    const user = this.currentUser();
    return user ? user.role === Role.Coordinator : false;
  });

  constructor() {
    // Si no hay usuario al iniciar, intenta crearlo desde el token
    if (!this.currentUser()) {
      this.initUserFromToken();
    }
  }

  private initUserFromToken(): void {
    const token = this.getToken();
    if (token && token.user) {
      const user: User = {
        id: token.user.id, // Asume que el token tiene el id del usuario
        avatar: `${getAppUrl()}${token.user.avatar}`,
        email: token.user.email,
        firstName: token.user.first_name,
        lastName: token.user.last_name,
        companyName: token.user.fullname,
        role: token.currentRole
      };
      this.setCurrentUser(user);
    }
  }


  getCurrentUserRole(): Role | null {
    const token = this.currentToken();
    return token ? token.currentRole : null;
  }


  getToken(): AccessToken | null {
    return this.storageService.getItem<AccessToken>(API_JWT_KEY);
  }

  setCurrentUser(user: User): void {
    this.storageService.setItem(CURRENT_USER_KEY, user);

    this.currentUser.set(user);
  }

  /**
   * Actualiza el estado del usuario actual y lo guarda en el storage.
   */
  updateCurrentUserState(userData: Partial<User>): void {
    const currentUser = this.currentUser();
    if (currentUser) {
      // Fusiona los datos nuevos con los existentes
      const updatedUser = { ...currentUser, ...userData };
      this.setCurrentUser(updatedUser);
    }
  }

  /**
   * Actualiza la sesión del usuario con una nueva escuela y perfil.
   * Devuelve la URL a la que se debe redirigir.
   */
  setActiveSchool(school: SchoolContract, role: RolContract): Observable<string> {
    // Simulamos una llamada a la API que podría validar este cambio
    // y devolver la URL o cualquier otro dato necesario.
    // Usamos 'of' y 'delay' de RxJS para simular la asincronía.
    return of(null).pipe(
      delay(250), // Simula una espera de 250 ms
      map(() => {
        const token = this.getToken(); // Obtiene el token actual
        if (!token) {
          throw new Error('No hay sesión activa.');
        }

        // Actualiza el objeto del token con la nueva información
        const newSessionState = {
          ...token,
          school: {
            id: school.id,
            active: school.active,
            country_id: school.country_id,
            nameschool: school.nameschool,
            statecode: school.statecode,
            lockdate: school.lockdate,
            state: school.state,
            year: new Date().getFullYear(),
            database_name: school.database_name,
            folder_name: school.folder_name,
          },
          profile: role.profile,
          currentRole: role.profile.profile_type,
        };

        // Guarda el nuevo estado en localStorage a través del StorageService
        this.storageService.setItem(getApiJwt(), newSessionState);

        // Actualiza la señal del token
        this.currentToken.set(newSessionState);
        // Actualiza la señal del usuario actual
        this.currentUserRole.set(role.profile.profile_type);

        // Devuelve la URL a la que se debe redirigir
        return `${getAppUrl()}`;
      })
    );
  }

  login(credentials: {email: string, password: string}): Observable<any> {
    const loginData = { ...credentials, withOutEmail: true, accessModule: 3 };

    return this.apiService.post('/auth/login', loginData).pipe(
      tap((response) => {
        // Guarda el token y el usuario
        this.storageService.setItem(API_JWT_KEY, response);
        this.initUserFromToken(); // Este método actualiza la señal currentUser

        // Muestra mensaje de éxito
        this.messagesService.showSuccess(response.message);

        // Navega al dashboard
        this.router.navigate(['/dashboard']);
      })
    );
  }

  forgotPassword(email: string): Observable<any> {
    const payload = { email, accessModule: 3 };

    return this.apiService.post('/forgot-password', payload).pipe(
      tap((response: any) => {
        this.messagesService.showInfo(response.message);
      })
    );
  }

  resetPassword(payload: { token: string, email: string, password: string, password_confirmation: string }): Observable<any> {
    const finalPayload = { ...payload, accessModule: 3 };

    return this.apiService.post('/reset-password', finalPayload).pipe(
      tap((response: any) => {
        if (response.success) {
          this.messagesService.showInfo(response.message);
          setTimeout(() => {
            this.router.navigate(['/auth/sign-in']);
          }, 2000);
        } else {
          this.messagesService.showAlertError('Error', response.message);
        }
      })
    );
  }

  /**
   * Envía la solicitud para cambiar el email/usuario y cierra la sesión al tener éxito.
   */
  changeUsername(payload: { uuid: number; email: string }): Observable<any> {
    const finalPayload = { ...payload, accessModule: 3 };

    return this.apiService.post('/change-user-name', finalPayload).pipe(
      tap(() => {
        this.messagesService.showSuccess('Nombre de usuario cambiado. Por favor, inicie sesión de nuevo.');
        // Llama al método de logout existente para limpiar la sesión y redirigir.
        this.logout();
      })
    );
  }

  logout(): void {
    this.storageService.removeItem(API_JWT_KEY);
    this.storageService.removeItem(CURRENT_USER_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/auth']).then(() => {
      window.location.reload(); // Recarga la página para limpiar el estado
    });
  }

  confirmLogout(): void {
    this.messagesService.showConfirm({
      title: 'Confirmación',
      message: '¿Estás seguro de que quieres cerrar sesión?',
    }).then((result) => {
      if (result.isConfirmed) {
        this.logout();
      }
    });
  }

  clearCurrentProfile() {
    const token = this.getToken();
    if (token) {
      // Elimina el perfil actual del token
      const updatedToken = { ...token, currentRole: null, profile: null };
      this.storageService.setItem(API_JWT_KEY, updatedToken);
      this.currentToken.set(updatedToken);
      this.currentUserRole.set(null);
    }
  }
}
