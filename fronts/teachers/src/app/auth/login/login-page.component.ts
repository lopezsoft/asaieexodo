import { Validators, FormBuilder } from '@angular/forms';

import { Component, OnInit, ElementRef } from '@angular/core';

// Base component
import { FormComponent } from '../../core/components/forms';

// Interfaces
import { ViewChild } from '@angular/core';

// Singletons
import {GlobalService} from "../../core/common/global.service";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})

export class LoginPageComponent extends FormComponent implements OnInit {
  @ViewChild('focusElement') focusElement: ElementRef;
    public forgotPassword: string = '';
  constructor(public fb: FormBuilder,
    public gService: GlobalService,
    public translate: TranslateService,
  ) {
    super(fb, gService, translate);
    this.customForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(5)]],
      email: ['', [Validators.required, Validators.minLength(5)]],
      remember_me: [false]
    });
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
  }

  get lf() {
    return this.customForm.controls;
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.goHome();
    this.forgotPassword =  `${this.gService.http.getAppUrl()}/forgot-password`;
  }

  get placeholderUserName(): string {
    return this.gService.translate.instant('placeholder.userName');
  }

  get placeholderPassw(): string {
    return this.gService.translate.instant('placeholder.password');
  }

  // On submit button click
  onSubmit() {
    this.loginFormSubmitted = true;
    const lang = this.gService.translate;
    const me = this.customForm;
    if (this.customForm.invalid) {
      this.onValidateForm(me);
      this.gService.msg.toastMessage(lang.instant('titleMessages.emptyFields'), lang.instant('bodyMessages.emptyFields'), 4);
      this.disabledLoading();
      return;
    }

    this.activeLoading();
    this.showSpinner(lang.instant('login.button.loggingIn'));
    const values = me.value;
    values.withOutEmail = true;
    this.gService.http.post('/auth/login', values)
      .subscribe({
        next: (resp) => {
            this.disabledLoading();
            this.hideSpinner();
            this.gService.msg.toastMessage(lang.instant('login.button.loggingIn'), resp.message, 0);
            localStorage.setItem(this.gService.http.getApiJwt(), JSON.stringify(resp));
            this.onResetForm(me);
            this.gService.router.navigate(['/dashboard']);
            window.location.reload();
        },
        error: (err: string) => {
            this.hideSpinner();
            this.gService.msg.toastMessage(lang.instant('general.error'), err, 4);
                this.disabledLoading();
                this.onValidateForm(me);
                this.gService.router.navigate(['/auth/login']);
        }
    });
  }
}
