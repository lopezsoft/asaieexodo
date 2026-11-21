import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { CustomizerSettingsService } from '../../customizer-settings/customizer-settings.service';
import { LoadMaskService } from '../../services/common/load-mask.service';
import { UiStateService } from '../../services/common/ui-state.service';
import { MessagesService } from '../../services/messages.service';
import { V3UnifiedAuthService } from '../../services/v3-unified-auth.service';
import { SHARED_IMPORTS } from '../../shared/shared-imports';
import { markAllAsTouched } from '../../utils/form-validators';

@Component({
  selector: 'app-sign-in',
  imports: [...SHARED_IMPORTS],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss',
})
export class SignInComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly v3Auth = inject(V3UnifiedAuthService);
  private readonly uiState = inject(UiStateService);
  private readonly router = inject(Router);
  private readonly maskService = inject(LoadMaskService);
  private readonly messagesService = inject(MessagesService);

  loginForm: FormGroup;
  isPasswordVisible = false;

  constructor(public themeService: CustomizerSettingsService) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(5)]],
    });
  }

  ngOnInit(): void {
    if (this.v3Auth.isAuthenticated()) {
      void this.router.navigate([this.v3Auth.resolvePostLoginRoute()]);
    }
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      markAllAsTouched(this.loginForm);
      return;
    }

    const { username, password } = this.loginForm.value as {
      username: string;
      password: string;
    };

    this.maskService.show('messages.authenticating');
    this.uiState.showLoader();

    this.v3Auth
      .login(username, password)
      .pipe(
        finalize(() => {
          this.uiState.hideLoader();
          this.maskService.hide();
        }),
      )
      .subscribe({
        next: (response) => {
          this.messagesService.showSuccess(
            `Bienvenido(a), ${response.data.user.fullName}`,
          );
          void this.router.navigate([
            this.v3Auth.resolvePostLoginRoute(response.data),
          ]);
        },
      });
  }

  togglePasswordVisibility(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
  }
}
