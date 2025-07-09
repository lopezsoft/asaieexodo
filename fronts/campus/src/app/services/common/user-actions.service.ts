// path: src/app/services/common/user-actions.service.ts
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import {AuthService} from "../auth.service";
import {User} from "../../models/users-model";

@Injectable({
  providedIn: 'root'
})
export class UserActionsService {
  private router = inject(Router);
  private authService = inject(AuthService);

  /**
   * Redirige a la ruta de inicio si el usuario está autenticado.
   */
  goHome(): void {
    if (this.authService.isAuthenticated()) { // Llama al método del servicio de auth
      this.router.navigate(['/dashboard']);
    }
  }

  /**
   * Redirige a la ruta indicada si el usuario está autenticado.
   * @param name - Nombre de la ruta
   */
  goRoute(name: string): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate([`/${name}`]);
    }
  }

  getCurrentUser(): User | null {
    // La lógica de usuario vive en el AuthService
    return this.authService.currentUser(); // Asumiendo que currentUser es una señal
  }

  upCurrentUser(data: User): void {
    // La lógica de actualización vive en el AuthService
    this.authService.setCurrentUser(data);
  }
}
