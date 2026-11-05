import {computed, inject, Injectable} from '@angular/core';
import {fullMenu} from "../common/sidebar/full-menu";
import {AuthService} from "./auth.service"; // Asegúrate que la ruta a tu enum sea correcta

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  protected authService = inject(AuthService);
  public filteredMenu = computed(() => {
    const userRole = this.authService.currentUserRole();
    // La nueva lógica de filtrado va aquí
    return fullMenu.filter(menuItem => {
      // Regla #1: El ítem debe estar activo para ser considerado.
      if (!menuItem.active) {
        return false;
      }

      // Regla #2: Si un ítem no tiene roles, es "público"
      // y debe mostrarse siempre (con o sin rol seleccionado).
      const esPublico = !menuItem.roles || menuItem.roles.length === 0;
      if (esPublico) {
        return true;
      }

      // Regla #3: Si el ítem SÍ requiere un rol, pero el usuario
      // aún no ha seleccionado uno, entonces no se muestra.
      if (!userRole) {
        return false;
      }

      // Regla #4: Si llegamos aquí, el ítem requiere rol y el usuario tiene uno.
      // Comprobamos si el rol del usuario está en la lista de roles permitidos.
      return menuItem.roles.includes(userRole);
    });
  });
}
