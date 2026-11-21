import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { CustomizerSettingsService } from '../../customizer-settings/customizer-settings.service';
import { LoadMaskService } from '../../services/common/load-mask.service';
import { MessagesService } from '../../services/messages.service';
import { V3UnifiedAuthService } from '../../services/v3-unified-auth.service';
import { SHARED_IMPORTS } from '../../shared/shared-imports';
import { markAllAsTouched, mustMatch } from '../../utils/form-validators';

@Component({
  selector: 'app-reset-password',
  imports: [...SHARED_IMPORTS],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
})
export class ResetPasswordComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly v3Auth = inject(V3UnifiedAuthService);
  private readonly maskService = inject(LoadMaskService);
  private readonly messagesService = inject(MessagesService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  resetPasswordForm: FormGroup;
  isPasswordVisible = false;
  isConfirmVisible = false;
  token = '';

  constructor(public themeService: CustomizerSettingsService) {
    this.resetPasswordForm = this.fb.group(
      {
        newPassword: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.maxLength(128),
          ],
        ],
        confirmPassword: ['', [Validators.required]],
      },
      {
        validators: mustMatch('newPassword', 'confirmPassword'),
      },
    );
  }

  ngOnInit(): void {
    // Soporta ?token=... (enlaces oficiales V3) y /:token (compatibilidad)
    const queryToken = this.route.snapshot.queryParamMap.get('token');
    const pathToken = this.route.snapshot.paramMap.get('token');
    this.token = (queryToken ?? pathToken ?? '').trim();
  }

  get f() {
    return this.resetPasswordForm.controls as Record<string, any>;
  }

  onSubmit(): void {
    if (!this.token) {
      this.messagesService.showError(
        'El enlace de recuperación no contiene un token válido.',
      );
      return;
    }

    if (this.resetPasswordForm.invalid) {
      markAllAsTouched(this.resetPasswordForm);
      return;
    }

    this.maskService.show('messages.updatingPassword');
    const newPassword = String(
      this.resetPasswordForm.get('newPassword')?.value ?? '',
    );

    this.v3Auth
      .resetPassword(this.token, newPassword)
      .pipe(finalize(() => this.maskService.hide()))
      .subscribe({
        next: () => {
          this.messagesService.showSuccess(
            'Tu contraseña ha sido restablecida exitosamente. Ahora puedes iniciar sesión.',
          );
          void this.router.navigate(['/auth']);
        },
      });
  }

  togglePasswordVisibility(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  toggleConfirmVisibility(): void {
    this.isConfirmVisible = !this.isConfirmVisible;
  }
}
