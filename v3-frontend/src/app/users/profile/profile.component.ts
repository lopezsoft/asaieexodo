import { CommonModule, UpperCasePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { FooterFormComponent } from '../../common/components/footer-form/footer-form.component';
import { LoadMaskService } from '../../services/common/load-mask.service';
import { MessagesService } from '../../services/messages.service';
import { V3AdministrationService } from '../../services/v3-administration.service';
import { V3UnifiedAuthService } from '../../services/v3-unified-auth.service';
import { SHARED_IMPORTS } from '../../shared/shared-imports';
import { isControlInvalid, markAllAsTouched } from '../../utils/form-validators';
import { fallbackAvatarUrl } from '../../utils/utils';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ...SHARED_IMPORTS, UpperCasePipe, FooterFormComponent],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  protected readonly fallbackAvatarUrl = fallbackAvatarUrl;
  protected readonly isControlInvalid = isControlInvalid;

  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly v3Auth = inject(V3UnifiedAuthService);
  private readonly adminService = inject(V3AdministrationService);
  private readonly maskService = inject(LoadMaskService);
  private readonly msgService = inject(MessagesService);

  readonly profileForm: FormGroup;
  readonly passwordForm: FormGroup;
  readonly avatarPreview = signal<string>(fallbackAvatarUrl());
  readonly uploadingAvatar = signal(false);

  constructor() {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      middleName: [''],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      secondLastName: [''],
      email: ['', [Validators.email]],
      phone: [''],
      avatarUrl: [''],
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.patchFromCurrentUser();
    this.v3Auth.fetchAuthenticatedProfile().subscribe({
      next: () => this.patchFromCurrentUser(),
    });
  }

  onAvatarFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0];
    if (!file) {
      return;
    }

    this.uploadingAvatar.set(true);
    this.adminService
      .uploadSchoolFileMultipart(file, 'USER_AVATARS', 'Foto de perfil de usuario')
      .pipe(finalize(() => this.uploadingAvatar.set(false)))
      .subscribe({
        next: (uploaded) => {
          const avatarUrl = uploaded.publicUrl || uploaded.storageKey;
          this.profileForm.patchValue({ avatarUrl });
          this.avatarPreview.set(uploaded.publicUrl || fallbackAvatarUrl());
          this.profileForm.markAsDirty();
          this.msgService.showSuccess(
            'Foto subida a AWS S3. Guarda el perfil para confirmar el cambio.',
          );
        },
      });
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      markAllAsTouched(this.profileForm);
      return;
    }

    this.maskService.show('messages.saving');
    const raw = this.profileForm.getRawValue();
    this.v3Auth
      .updateOwnProfile({
        firstName: raw.firstName,
        middleName: raw.middleName || null,
        lastName: raw.lastName,
        secondLastName: raw.secondLastName || null,
        email: raw.email || null,
        phone: raw.phone || null,
        avatarUrl: raw.avatarUrl || undefined,
      })
      .pipe(finalize(() => this.maskService.hide()))
      .subscribe({
        next: () => {
          this.msgService.showSuccess('Perfil actualizado correctamente.');
          this.profileForm.markAsPristine();
        },
      });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      markAllAsTouched(this.passwordForm);
      return;
    }

    const { currentPassword, newPassword, confirmPassword } =
      this.passwordForm.getRawValue();
    if (newPassword !== confirmPassword) {
      this.msgService.showError('La confirmación de la nueva contraseña no coincide.');
      return;
    }

    this.maskService.show('messages.updatingPassword');
    this.v3Auth
      .changePassword(currentPassword, newPassword)
      .pipe(finalize(() => this.maskService.hide()))
      .subscribe({
        next: () => {
          this.msgService.showSuccess('Contraseña actualizada correctamente.');
          this.passwordForm.reset();
        },
      });
  }

  protected onCancel(): void {
    this.patchFromCurrentUser();
    void this.router.navigate(['/dashboard']);
  }

  private patchFromCurrentUser(): void {
    const user = this.v3Auth.user();
    if (!user) {
      return;
    }
    this.profileForm.patchValue({
      firstName: user.firstName,
      middleName: user.middleName ?? '',
      lastName: user.lastName,
      secondLastName: user.secondLastName ?? '',
      email: user.email ?? '',
      phone: '',
      avatarUrl: user.avatarUrl ?? '',
    });
    this.avatarPreview.set(user.avatarUrl || fallbackAvatarUrl());
  }
}
