import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  DestroyRef,
  inject,
  OnInit,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { UiStateService } from '../../services/common/ui-state.service';
import { MessagesService } from '../../services/messages.service';
import { StorageService } from '../../services/storage.service';
import { V3UnifiedAuthService } from '../../services/v3-unified-auth.service';
import { SHARED_IMPORTS } from '../../shared/shared-imports';
import { markAllAsTouched } from '../../utils/form-validators';

const REMEMBERED_USERNAME_STORAGE_KEY = 'asaie-remembered-username';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [...SHARED_IMPORTS],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss',
})
export class SignInComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly v3Auth = inject(V3UnifiedAuthService);
  private readonly uiState = inject(UiStateService);
  private readonly storage = inject(StorageService);
  private readonly router = inject(Router);
  private readonly messagesService = inject(MessagesService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private shakeTimerId: number | null = null;

  protected readonly isPasswordVisible = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly isCapsLockOn = signal(false);
  protected readonly hasErrorShake = signal(false);

  protected readonly loginForm: FormGroup = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(5)]],
    rememberUsername: [false],
  });

  constructor() {
    this.destroyRef.onDestroy(() => {
      if (this.isBrowser && this.shakeTimerId !== null) {
        window.clearTimeout(this.shakeTimerId);
      }
    });
  }

  ngOnInit(): void {
    if (this.v3Auth.isAuthenticated()) {
      void this.router.navigate([this.v3Auth.resolvePostLoginRoute()]);
      return;
    }

    if (this.isBrowser) {
      const savedUsername = this.storage.getItem<string>(
        REMEMBERED_USERNAME_STORAGE_KEY,
      );
      if (savedUsername && savedUsername.trim().length > 0) {
        this.loginForm.patchValue({
          username: savedUsername.trim(),
          rememberUsername: true,
        });
      }
    }
  }

  protected get f() {
    return this.loginForm.controls;
  }

  protected onSubmit(): void {
    if (this.isSubmitting()) {
      return;
    }

    if (this.loginForm.invalid) {
      markAllAsTouched(this.loginForm);
      this.triggerShake();
      return;
    }

    const { username, password, rememberUsername } = this.loginForm.value as {
      username: string;
      password: string;
      rememberUsername: boolean;
    };

    const trimmedUsername = username.trim();
    if (rememberUsername) {
      this.storage.setItem(REMEMBERED_USERNAME_STORAGE_KEY, trimmedUsername);
    } else {
      this.storage.removeItem(REMEMBERED_USERNAME_STORAGE_KEY);
    }

    this.isSubmitting.set(true);
    this.uiState.showLoader();

    this.v3Auth
      .login(trimmedUsername, password)
      .pipe(
        finalize(() => {
          this.isSubmitting.set(false);
          this.uiState.hideLoader();
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
        error: () => {
          this.triggerShake();
        },
      });
  }

  protected togglePasswordVisibility(): void {
    this.isPasswordVisible.update((visible) => !visible);
  }

  protected onPasswordKeyEvent(event: KeyboardEvent): void {
    if (typeof event.getModifierState === 'function') {
      this.isCapsLockOn.set(event.getModifierState('CapsLock'));
    }
  }

  protected onPasswordBlur(): void {
    this.isCapsLockOn.set(false);
  }

  private triggerShake(): void {
    if (!this.isBrowser) {
      return;
    }
    this.hasErrorShake.set(false);
    if (this.shakeTimerId !== null) {
      window.clearTimeout(this.shakeTimerId);
    }
    this.shakeTimerId = window.setTimeout(() => {
      this.hasErrorShake.set(true);
      this.shakeTimerId = window.setTimeout(() => {
        this.hasErrorShake.set(false);
      }, 450);
    }, 10);
  }
}
