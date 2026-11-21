import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { MessagesService } from '../../services/messages.service';
import { V3UnifiedAuthService } from '../../services/v3-unified-auth.service';
import { SHARED_IMPORTS } from '../../shared/shared-imports';
import { markAllAsTouched } from '../../utils/form-validators';

@Component({
  selector: 'app-lock-screen',
  standalone: true,
  imports: [...SHARED_IMPORTS],
  templateUrl: './lock-screen.component.html',
  styleUrl: './lock-screen.component.scss',
})
export class LockScreenComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly messagesService = inject(MessagesService);
  protected readonly v3Auth = inject(V3UnifiedAuthService);

  protected readonly isPasswordVisible = signal(false);
  protected readonly isSubmitting = signal(false);

  protected readonly activeUser = computed(() => this.v3Auth.user());

  protected readonly unlockForm: FormGroup = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(5)]],
  });

  protected get f() {
    return this.unlockForm.controls;
  }

  protected togglePasswordVisibility(): void {
    this.isPasswordVisible.update((visible) => !visible);
  }

  protected onUnlock(): void {
    const currentUser = this.activeUser();
    if (!currentUser) {
      void this.router.navigate(['/auth']);
      return;
    }

    if (this.unlockForm.invalid) {
      markAllAsTouched(this.unlockForm);
      return;
    }

    this.isSubmitting.set(true);
    const password = String(this.unlockForm.get('password')?.value ?? '');

    this.v3Auth
      .login(
        currentUser.username,
        password,
        this.v3Auth.activeSchoolId() ?? undefined,
        this.v3Auth.activeRole() ?? undefined,
      )
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (response) => {
          this.messagesService.showSuccess('Acceso desbloqueado correctamente.');
          void this.router.navigate([
            this.v3Auth.resolvePostLoginRoute(response.data),
          ]);
        },
      });
  }
}
