import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CustomizerSettingsService } from '../../customizer-settings/customizer-settings.service';

@Component({
  selector: 'app-not-authorized',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div
      class="auth-wrapper auth-v2"
      [class.dark-theme]="themeService.isDark()"
    >
      <div class="auth-inner row m-0">
        <div class="d-flex col-12 align-items-center justify-content-center p-5 min-vh-100">
          <div class="text-center" style="max-width: 480px;">
            <img
              src="assets/images/pages/not-authorized.svg"
              alt="Acceso no autorizado"
              class="img-fluid mb-4"
              style="max-height: 220px;"
            />
            <h2 class="fw-semibold mb-2">Acceso no autorizado</h2>
            <p class="mb-4">
              Tu rol o institución educativa activa no tiene permisos suficientes
              para acceder al recurso solicitado.
            </p>
            <div class="d-flex justify-content-center gap-2">
              <a routerLink="/dashboard" class="btn btn-primary">
                Volver al panel principal
              </a>
              <a routerLink="/auth" class="btn btn-outline-secondary">
                Iniciar sesión
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class NotAuthorizedComponent {
  constructor(public themeService: CustomizerSettingsService) {}
}
