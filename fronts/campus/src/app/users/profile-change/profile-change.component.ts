import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

// Servicios y utilidades
import { AuthService } from '../../services/auth.service';
import { markAllAsTouched } from '../../utils/form-validators';

// Módulos para Standalone
import { SHARED_IMPORTS } from '../../shared/shared-imports';
import {LoadMaskService} from "../../services/common/load-mask.service";
import { UpperCasePipe} from "@angular/common";
import {FooterFormComponent} from "../../common/components/footer-form/footer-form.component";
import {UserActionsService} from "../../services/common/user-actions.service";

@Component({
  selector: 'app-profile-change',
  standalone: true,
  imports: [
    UpperCasePipe,
    FooterFormComponent,
    ...SHARED_IMPORTS
  ],
  templateUrl: './profile-change.component.html',
  styleUrls: ['./profile-change.component.scss']
})
export class ProfileChangeComponent implements OnInit {
  // Inyección de dependencias
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private maskService = inject(LoadMaskService);
  private userActionsService = inject(UserActionsService);

  changeForm: FormGroup;
  currentUser = this.authService.currentUser; // La señal del usuario actual

  constructor() {
    this.changeForm = this.fb.group({
      // El campo 'user_name' solo es para mostrar, lo deshabilitamos.
      user_name: [{ value: '', disabled: true }],
      // El campo 'email' es para el nuevo valor.
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    // Rellena el campo del nombre de usuario actual desde la señal
    const user = this.currentUser();
    if (user) {
      this.changeForm.patchValue({ user_name: user.email });
    }
  }

  onSubmit(): void {
    if (this.changeForm.invalid || !this.currentUser()) {
      markAllAsTouched(this.changeForm);
      return;
    }

    this.maskService.show('messages.processing');

    const payload = {
      uuid: this.currentUser()!.id,
      email: this.changeForm.get('email')?.value
    };

    this.authService.changeUsername(payload).pipe(
      // El spinner se oculta incluso si hay un error (manejado por el interceptor)
      finalize(() => this.maskService.hide())
    ).subscribe();
  }

  onCancel() {
    this.userActionsService.goRoute('profile');
  }
}
