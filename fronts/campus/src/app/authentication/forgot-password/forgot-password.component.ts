import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

// Tus servicios refactorizados
import { AuthService } from '../../services/auth.service';
import { markAllAsTouched } from '../../utils/form-validators';

// Módulos para Standalone
import { SHARED_IMPORTS } from '../../shared/shared-imports';
import { LoadMaskService } from '../../services/common/load-mask.service';
import {CustomizerSettingsService} from "../../customizer-settings/customizer-settings.service";

@Component({
  selector: 'app-forgot-password-page',
  imports: [
    ...SHARED_IMPORTS
  ],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  // Inyección de dependencias limpia y directa
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private maskService = inject(LoadMaskService);

  forgotPasswordForm: FormGroup;

  constructor(
    public themeService: CustomizerSettingsService
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  // Getter simple para acceder a los controles en la plantilla
  get f() {
    return this.forgotPasswordForm.controls as any;
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      markAllAsTouched(this.forgotPasswordForm);
      return;
    }

    this.maskService.show('messages.sending'); // Muestra el bloqueo

    const email = this.forgotPasswordForm.get('email')?.value;

    this.authService.forgotPassword(email).pipe(
      // Oculta el bloqueo al finalizar, sin importar el resultado
      finalize(() => this.maskService.hide())
    ).subscribe();
  }
}
