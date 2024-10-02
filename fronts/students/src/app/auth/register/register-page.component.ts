
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';

// Base component
import { FormComponent } from '../../core/components/forms';
import {GlobalService} from "../../core/common/global.service";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-register-page',
  templateUrl: './register-page.component.html',
  styleUrls : ['./register-page.scss']
})

export class RegisterPageComponent extends FormComponent implements OnInit {
  @ViewChild('focusElement') focusElement: ElementRef;
  customForm: FormGroup;
  constructor(
    public fb: FormBuilder,
    public gService: GlobalService,
    public translate: TranslateService,
  ) {
    super(fb, gService, translate);
    // Configure the layout
    this.gService.coreConfigService.config = {
      layout: {
        navbar: {
          hidden: true
        },
        menu: {
          hidden: true
        },
        footer: {
          hidden: true
        },
        customizer: false,
        enableLocalStorage: false
      }
    };
    this.customForm = this.fb.group({
      first_name            : ['', [Validators.required, Validators.minLength(3)]],
      last_name		        : ['', [Validators.required, Validators.minLength(3)]],
      password	            : ['', [Validators.required, Validators.minLength(6)]],
      password_confirmation : ['', [Validators.required, Validators.minLength(6)]],
      email			        : ['', [Validators.required, Validators.pattern('^[a-z0-9._%+-ñ]+@[a-z0-9._%+-ñ]+\.[a-z]{2,4}$')]]
    });
  }

  ngOnInit() {
    super.ngOnInit();
  }

  get rf() {
    return this.customForm.controls;
  }

  get invalidFirstName() {
      return this.isInvalid('first_name');
  }
  get invalidLastName() {
    return this.isInvalid('last_name');
  }

  get invalidEmail() {
    return this.isInvalid('email');
  }

  // placeholder

  get placeholderEmail(): string {
    return this.gService.translate.instant('placeholder.email');
  }
  get placeholderPassword(): string {
    return this.gService.translate.instant('placeholder.password');
  }

  get placeholderConfirmPassword(): string {
    return this.gService.translate.instant('placeholder.confirmPassword');
  }
  onSave(): void {
    const me = this.customForm;
    const lang = this.gService.translate;
    this.activeLoading();
    this.showSpinner(lang.instant('register.button.creatingAccount'));
    if (me.invalid) {
      this.onValidateForm(me);
      this.gService.msg.toastMessage(lang.instant('titleMessages.emptyFields'), lang.instant('bodyMessages.emptyFields'), 4);
      this.disableMsg();
      return;
    }
    const values  = this.customForm.getRawValue();
    if(values.password !== values.password_confirmation) {
      this.disableMsg();
      this.gService.msg.errorMessage('Registro de usuarios', 'Las contraseñas no coinciden.');
      return;
    }
    const valuesToSend = me.value;
    valuesToSend.accessModule = 2; // Access module 2 is for the teacher
    this.gService.http.post('/auth/register', valuesToSend)
      .subscribe({
        next: (resp) => {
            this.onResetForm(me);
            this.disableMsg();
            this.gService.msg.onMessage(lang.instant('register.messages.successfulRegistration'), resp.message);
        },
        error: (err: string) => {
            this.disableMsg();
            this.gService.msg.errorMessage(lang.instant('general.error'), err);
        }
    });

  }
  disableMsg(): void {
    this.hideSpinner();
    this.disabledLoading();
  }

}
