import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { UiStateService } from '../../services/common/ui-state.service';
import { MessagesService } from '../../services/messages.service';
import { V3UnifiedAuthService } from '../../services/v3-unified-auth.service';
import { SHARED_IMPORTS } from '../../shared/shared-imports';
import { markAllAsTouched } from '../../utils/form-validators';

@Component({
  selector: 'app-forgot-password-page',
  standalone: true,
  imports: [...SHARED_IMPORTS],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly v3Auth = inject(V3UnifiedAuthService);
  private readonly uiState = inject(UiStateService);
  private readonly messagesService = inject(MessagesService);

  protected readonly isSubmitting = signal(false);
  protected readonly requestSubmitted = signal(false);

  protected readonly forgotPasswordForm: FormGroup = this.fb.group({
    identifier: ['', [Validators.required, Validators.minLength(3)]],
  });

  protected get f() {
    return this.forgotPasswordForm.controls;
  }

  protected onSubmit(): void {
    if (this.isSubmitting()) {
      return;
    }

    if (this.forgotPasswordForm.invalid) {
      markAllAsTouched(this.forgotPasswordForm);
      return;
    }

    this.isSubmitting.set(true);
    this.uiState.showLoader();

    const identifier = String(
      this.forgotPasswordForm.get('identifier')?.value ?? '',
    );

    this.v3Auth
      .forgotPassword(identifier)
      .pipe(
        finalize(() => {
          this.isSubmitting.set(false);
          this.uiState.hideLoader();
        }),
      )
      .subscribe({
        next: (response) => {
          this.requestSubmitted.set(true);
          this.messagesService.showSuccess(
            response.data.message ||
              'Si la cuenta existe, enviamos las instrucciones de recuperación al correo registrado.',
          );
        },
      });
  }
}
