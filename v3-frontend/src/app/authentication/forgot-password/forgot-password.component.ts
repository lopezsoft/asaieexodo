import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { CustomizerSettingsService } from '../../customizer-settings/customizer-settings.service';
import { LoadMaskService } from '../../services/common/load-mask.service';
import { MessagesService } from '../../services/messages.service';
import { V3UnifiedAuthService } from '../../services/v3-unified-auth.service';
import { SHARED_IMPORTS } from '../../shared/shared-imports';
import { markAllAsTouched } from '../../utils/form-validators';

@Component({
  selector: 'app-forgot-password-page',
  imports: [...SHARED_IMPORTS],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly v3Auth = inject(V3UnifiedAuthService);
  private readonly maskService = inject(LoadMaskService);
  private readonly messagesService = inject(MessagesService);

  forgotPasswordForm: FormGroup;
  requestSubmitted = false;

  constructor(public themeService: CustomizerSettingsService) {
    this.forgotPasswordForm = this.fb.group({
      identifier: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  get f() {
    return this.forgotPasswordForm.controls as Record<string, any>;
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      markAllAsTouched(this.forgotPasswordForm);
      return;
    }

    this.maskService.show('messages.sending');
    const identifier = String(
      this.forgotPasswordForm.get('identifier')?.value ?? '',
    );

    this.v3Auth
      .forgotPassword(identifier)
      .pipe(finalize(() => this.maskService.hide()))
      .subscribe({
        next: (response) => {
          this.requestSubmitted = true;
          this.messagesService.showSuccess(
            response.data.message ||
              'Si la cuenta existe, enviamos las instrucciones de recuperación al correo registrado.',
          );
        },
      });
  }
}
