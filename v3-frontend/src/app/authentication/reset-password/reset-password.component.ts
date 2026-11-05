import {Component, inject} from '@angular/core';
import { CustomizerSettingsService } from '../../customizer-settings/customizer-settings.service';
import {SHARED_IMPORTS} from "../../shared/shared-imports";
import { mustMatch, markAllAsTouched} from '../../utils/form-validators';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AuthService} from "../../services/auth.service";
import {ActivatedRoute} from "@angular/router";
import {LoadMaskService} from "../../services/common/load-mask.service";
import {finalize} from "rxjs";
@Component({
    selector: 'app-reset-password',
    imports: [
      ...SHARED_IMPORTS,
    ],
    templateUrl: './reset-password.component.html',
    styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent {
 // Inyección de dependencias
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private maskService = inject(LoadMaskService);
  private route = inject(ActivatedRoute);

  resetPasswordForm: FormGroup;
  // Password Show/Hide
  isPassword1Visible: boolean = false;
  isPassword2Visible: boolean = false;
  isPassword3Visible: boolean = false;
  private token: string;
  private email: string;
    constructor(
        public themeService: CustomizerSettingsService
    ) {
      this.resetPasswordForm = this.fb.group({
        password: ['', [Validators.required, Validators.minLength(6)]],
        password_confirmation: ['', [Validators.required]],
        old_password: ['', [Validators.required]]
      }, {
        validators: mustMatch('password', 'password_confirmation')
      });
    }

  ngOnInit(): void {
    // Captura los parámetros de la URL de forma segura
    this.token = this.route.snapshot.params['token'];
    this.email = this.route.snapshot.queryParams['email'];
  }

  get f() {
      return this.resetPasswordForm.controls as any;
    }

  onSubmit(): void {
    if (this.resetPasswordForm.invalid) {
      markAllAsTouched(this.resetPasswordForm);
      return;
    }

    this.maskService.show('messages.updatingPassword');

    const formValue = this.resetPasswordForm.value;
    const payload = {
      token: this.token,
      email: this.email,
      old_password: formValue.old_password,
      password: formValue.password,
      password_confirmation: formValue.password_confirmation
    };

    this.authService.resetPassword(payload).pipe(
      finalize(() => this.maskService.hide())
    ).subscribe();
  }
    togglePassword1Visibility(): void {
        this.isPassword1Visible = !this.isPassword1Visible;
    }
    togglePassword2Visibility(): void {
        this.isPassword2Visible = !this.isPassword2Visible;
    }
    togglePassword3Visibility(): void {
        this.isPassword3Visible = !this.isPassword3Visible;
    }

}
