import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { FooterFormComponent } from '../../common/components/footer-form/footer-form.component';
import { LoadMaskService } from '../../services/common/load-mask.service';
import { MessagesService } from '../../services/messages.service';
import { V3UnifiedAuthService } from '../../services/v3-unified-auth.service';
import { SHARED_IMPORTS } from '../../shared/shared-imports';
import { markAllAsTouched } from '../../utils/form-validators';

@Component({
  selector: 'app-profile-change',
  standalone: true,
  imports: [FooterFormComponent, ...SHARED_IMPORTS],
  templateUrl: './profile-change.component.html',
  styleUrls: ['./profile-change.component.scss'],
})
export class ProfileChangeComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  protected readonly v3Auth = inject(V3UnifiedAuthService);
  private readonly maskService = inject(LoadMaskService);
  private readonly messages = inject(MessagesService);

  readonly changeForm: FormGroup;
  readonly showCurrentPassword = signal(false);

  constructor() {
    this.changeForm = this.fb.group({
      currentUsername: [{ value: '', disabled: true }],
      newUsername: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
          Validators.pattern(/^[a-zA-Z0-9._@-]+$/),
        ],
      ],
      currentPassword: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    const user = this.v3Auth.user();
    if (user) {
      this.changeForm.patchValue({ currentUsername: user.username });
    }
  }

  onSubmit(): void {
    if (this.changeForm.invalid) {
      markAllAsTouched(this.changeForm);
      return;
    }

    const { currentPassword, newUsername } = this.changeForm.getRawValue();
    this.maskService.show('messages.processing');

    this.v3Auth
      .changeUsername(currentPassword, newUsername)
      .pipe(finalize(() => this.maskService.hide()))
      .subscribe({
        next: (res) => {
          this.messages.showSuccess('Nombre de usuario actualizado correctamente.');
          this.changeForm.patchValue({
            currentUsername: res.data.username,
            newUsername: '',
            currentPassword: '',
          });
        },
      });
  }

  onCancel(): void {
    void this.router.navigate(['/profile']);
  }
}
