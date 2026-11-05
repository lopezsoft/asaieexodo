import {Component, inject} from '@angular/core';
import { CustomizerSettingsService } from '../../customizer-settings/customizer-settings.service';
import {SHARED_IMPORTS} from "../../shared/shared-imports";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AuthService} from "../../services/auth.service";
import {UiStateService} from "../../services/common/ui-state.service";
import {Router} from "@angular/router";
import {markAllAsTouched} from "../../utils/form-validators";
import {finalize} from "rxjs";
import {LoadMaskService} from "../../services/common/load-mask.service";

@Component({
    selector: 'app-sign-in',
    imports: [
      ...SHARED_IMPORTS
    ],
    templateUrl: './sign-in.component.html',
    styleUrl: './sign-in.component.scss'
})
export class SignInComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private uiState = inject(UiStateService);
  private router = inject(Router);
  private maskService = inject(LoadMaskService);

  loginForm: FormGroup;
  // Password Show/Hide
  password: string = '';
  isPasswordVisible: boolean = false;
  constructor(
      public themeService: CustomizerSettingsService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(5)]],
      remember_me: [false]
    });
  }

  ngOnInit(): void {
    // Si el usuario ya está autenticado, lo redirige
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  // Getter simple para acceder a los controles en la plantilla
  get f() {
    return this.loginForm.controls;
  }

  // 2. onSubmit es ahora simple y declarativo
  onSubmit(): void {
    if (this.loginForm.invalid) {
      markAllAsTouched(this.loginForm); // Usa la función de utilidad
      return;
    }
    this.maskService.show('messages.authenticating');

    this.uiState.showLoader(); // Muestra el loader desde el servicio de UI

    this.authService.login(this.loginForm.value).pipe(
      // finalize se asegura que el loader se oculte siempre, en éxito o error
      finalize(() => {
        this.uiState.hideLoader();
        this.maskService.hide(); // Oculta el loader de la máscara
      })
    ).subscribe(); // La suscripción está casi vacía, toda la lógica está en el servicio
  }

  togglePasswordVisibility(): void {
      this.isPasswordVisible = !this.isPasswordVisible;
  }
  onPasswordInput(event: Event): void {
      const inputElement = event.target as HTMLInputElement;
      this.password = inputElement.value;
  }

}
