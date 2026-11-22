import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { V3UnifiedAuthService } from '../../services/v3-unified-auth.service';

@Component({
  selector: 'app-not-authorized',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="auth-card text-center">
      <div class="auth-status-icon status-danger">
        <span class="material-symbols-outlined">gpp_maybe</span>
      </div>
      <div class="auth-card-header">
        <h1>Acceso no autorizado</h1>
        <p>
          Tu rol o institución educativa activa no tiene permisos suficientes
          para acceder al recurso solicitado.
        </p>
      </div>
      <div class="d-flex flex-column flex-sm-row gap-2">
        <a
          [routerLink]="v3Auth.defaultHomeRoute()"
          class="auth-submit-btn text-decoration-none"
        >
          <span class="material-symbols-outlined">dashboard</span>
          <span>Volver a mi panel</span>
        </a>
        <a routerLink="/auth" class="auth-secondary-btn text-decoration-none">
          <span class="material-symbols-outlined">login</span>
          <span>Iniciar sesión</span>
        </a>
      </div>
    </section>
  `,
})
export class NotAuthorizedComponent {
  protected readonly v3Auth = inject(V3UnifiedAuthService);
}
