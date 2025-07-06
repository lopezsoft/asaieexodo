// path: src/app/services/auth.service.ts
import { Injectable, signal, computed, inject, WritableSignal, Signal } from '@angular/core';
import {AccessToken} from '../interfaces';
import { StorageService } from './storage.service';
import { environment } from '../../environments/environment';
import {Role, User} from "../models/users-model";

const API_JWT_KEY = environment.APIJWT;
const CURRENT_USER_KEY = 'currentUser';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private storageService = inject(StorageService);

  // Señal (Signal) para el usuario actual. Inicia con el valor de localStorage.
  currentUser: WritableSignal<User | null> = signal(this.storageService.getItem<User>(CURRENT_USER_KEY));

  // Señal computada que deriva si el usuario está autenticado.
  isAuthenticated: Signal<boolean> = computed(() => !!this.currentUser());

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
        avatar: `${environment.APPURL}${token.user.avatar}`,
        email: token.user.email,
        firstName: token.user.first_name,
        lastName: token.user.last_name,
        companyName: token.user.fullname,
        role: Role.Admin // O el rol que venga en el token
      };
      this.setCurrentUser(user);
    }
  }

  getToken(): AccessToken | null {
    return this.storageService.getItem<AccessToken>(API_JWT_KEY);
  }

  setCurrentUser(user: User): void {
    this.storageService.setItem(CURRENT_USER_KEY, user);

    this.currentUser.set(user);
  }

  logout(): void {
    this.storageService.removeItem(API_JWT_KEY);
    this.storageService.removeItem(CURRENT_USER_KEY);
    this.currentUser.set(null);
  }
}
