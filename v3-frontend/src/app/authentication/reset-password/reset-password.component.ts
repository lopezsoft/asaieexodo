import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { UiStateService } from '../../services/common/ui-state.service';
import { MessagesService } from '../../services/messages.service';
import { V3UnifiedAuthService } from '../../services/v3-unified-auth.service';
import { SHARED_IMPORTS } from '../../shared/shared-imports';
import { markAllAsTouched, mustMatch } from '../../utils/form-validators';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [...SHARED_IMPORTS],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
})
export class ResetPasswordComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly v3Auth = inject(V3UnifiedAuthService);
  private readonly uiState = inject(UiStateService);
  private readonly messagesService = inject(MessagesService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly isPasswordVisible = signal(false);
  protected readonly isConfirmVisible = signal(false);
  protected readonly isSubmitting = signal(false);
  protected token = '';

  protected readonly resetPasswordForm: FormGroup = this.fb.group(
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

  ngOnInit(): void {
    const queryToken = this.route.snapshot.queryParamMap.get('token');
    const pathToken = this.route.snapshot.paramMap.get('token');
    this.token = (queryToken ?? pathToken ?? '').trim();
  }

  protected get f() {
    return this.resetPasswordForm.controls;
  }

  protected get passwordStrength() {
    const raw = String(this.f['newPassword'].value ?? '');
    const hasMinLength = raw.length >= 8;
    const hasUpper = /[A-Z]/.test(raw);
    const hasLower = /[a-z]/.test(raw);
    const hasNumber = /\d/.test(raw);
    const score = [hasMinLength, hasUpper, hasLower, hasNumber].filter(
      Boolean,
    ).length as 0 | 1 | 2 | 3 | 4;

    let labelKey = 'registerSchool.strength.weak';
    if (score === 2) {
      labelKey = 'registerSchool.strength.fair';
    } else if (score === 3) {
      labelKey = 'registerSchool.strength.good';
    } else if (score === 4) {
      labelKey = 'registerSchool.strength.strong';
    }

    return {
      score,
      labelKey,
      hasMinLength,
      hasUpper,
      hasLower,
      hasNumber,
    };
  }

  protected onSubmit(): void {
    if (this.isSubmitting()) {
      return;
    }

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

    this.isSubmitting.set(true);
    this.uiState.showLoader();

    const newPassword = String(
      this.resetPasswordForm.get('newPassword')?.value ?? '',
    );

    this.v3Auth
      .resetPassword(this.token, newPassword)
      .pipe(
        finalize(() => {
          this.isSubmitting.set(false);
          this.uiState.hideLoader();
        }),
      )
      .subscribe({
        next: () => {
          this.messagesService.showSuccess(
            'Tu contraseña ha sido restablecida exitosamente. Ahora puedes iniciar sesión.',
          );
          void this.router.navigate(['/auth']);
        },
      });
  }

  protected togglePasswordVisibility(): void {
    this.isPasswordVisible.update((visible) => !visible);
  }

  protected toggleConfirmVisibility(): void {
    this.isConfirmVisible.update((visible) => !visible);
  }
}
