import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
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
  imports: [CommonModule, RouterLink, ...SHARED_IMPORTS, FooterFormComponent],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  protected readonly fallbackAvatarUrl = fallbackAvatarUrl;
  protected readonly isControlInvalid = isControlInvalid;
  protected readonly v3Auth = inject(V3UnifiedAuthService);

  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly adminService = inject(V3AdministrationService);
  private readonly maskService = inject(LoadMaskService);
  private readonly msgService = inject(MessagesService);

  readonly profileForm: FormGroup;
  readonly passwordForm: FormGroup;
  readonly avatarPreview = signal<string>(fallbackAvatarUrl());
  readonly uploadingAvatar = signal(false);
  readonly isDragOver = signal(false);
  readonly selectedFileName = signal<string | null>(null);
  readonly showCurrentPassword = signal(false);
  readonly showNewPassword = signal(false);
  readonly showConfirmPassword = signal(false);
  readonly newPasswordValue = signal('');
  readonly confirmPasswordValue = signal('');

  readonly passwordStrength = computed(() => {
    const value = this.newPasswordValue();
    const confirm = this.confirmPasswordValue();
    const hasLength = value.length >= 8;
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasNumber = /\d/.test(value);
    const score =
      (hasLength ? 1 : 0) +
      (hasUpper ? 1 : 0) +
      (hasLower ? 1 : 0) +
      (hasNumber ? 1 : 0);

    let label = 'Débil';
    let level: 'is-weak' | 'is-fair' | 'is-good' | 'is-strong' = 'is-weak';
    if (score === 4) {
      label = 'Fuerte';
      level = 'is-strong';
    } else if (score === 3) {
      label = 'Buena';
      level = 'is-good';
    } else if (score === 2) {
      label = 'Media';
      level = 'is-fair';
    }

    return {
      score,
      label,
      level,
      hasLength,
      hasUpper,
      hasLower,
      hasNumber,
      passwordsMatch: Boolean(confirm) && value === confirm,
    };
  });

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

    this.passwordForm
      .get('newPassword')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((val: string | null) => this.newPasswordValue.set(val ?? ''));

    this.passwordForm
      .get('confirmPassword')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((val: string | null) =>
        this.confirmPasswordValue.set(val ?? ''),
      );
  }

  ngOnInit(): void {
    this.patchFromCurrentUser();
    this.v3Auth.fetchAuthenticatedProfile().subscribe({
      next: () => this.patchFromCurrentUser(),
    });
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
  }

  onAvatarDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.handleAvatarFile(file);
    }
  }

  onAvatarFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0];
    if (!file) {
      return;
    }
    this.handleAvatarFile(file);
    input.value = '';
  }

  private handleAvatarFile(file: File): void {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      this.msgService.showError(
        'Formato no compatible. Usa una imagen PNG, JPG o WEBP.',
      );
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.msgService.showError(
        'La imagen supera el tamaño máximo permitido (5 MB).',
      );
      return;
    }

    this.selectedFileName.set(file.name);
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
            'Foto de perfil cargada. Guarda los cambios para aplicarla.',
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
          this.newPasswordValue.set('');
          this.confirmPasswordValue.set('');
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
