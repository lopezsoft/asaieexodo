import { Validators, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";

import { Component, OnInit, ElementRef } from '@angular/core';

// Services
import { ApiServerService, MessagesService } from './../../utils/index';

import { TranslateService } from '@ngx-translate/core';

// Base component
import { FormComponent } from './../../core/components/forms/form.component';

// Interfaces
import { ErrorResponse } from './../../interfaces/index';
import { ViewChild } from '@angular/core';

// Singletons
import { AccessTokenService } from './../../services/singletons/access-token.service';
import { CoreConfigService } from '@core/services/config.service';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})

export class LoginPageComponent extends FormComponent implements OnInit {
  @ViewChild('focusElement') focusElement: ElementRef;

  constructor(public fb: FormBuilder,
    public coreConfigService: CoreConfigService,
    public api: ApiServerService,
    public msg: MessagesService,
    public router: Router,
    public translate: TranslateService,
    public aRouter: ActivatedRoute,
    public spinner: NgxSpinnerService,
    public token: AccessTokenService,
  ) {
    super(fb, msg, api, router, translate, aRouter, spinner, coreConfigService);
    const ts = this;
    ts.customForm = ts.fb.group({
      password: ['', [Validators.required, Validators.minLength(5)]],
      email: ['', [Validators.required, Validators.pattern('^[a-z0-9._%+-ñ]+@[a-z0-9._%+-ñ]+\.[a-z]{2,4}$')]],
      remember_me: [false]
    });
    // Configure the layout
    ts.coreConfigService.config = {
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
  }

  get invalidPassword(): boolean {
    return this.isInvalid('password');
  }

  get invalidEmail(): boolean {
    return this.isInvalid('email');
  }

  get placeholderEmail(): string {
    return this.translate.instant('placeholder.email');
  }

  get placeholderPassw(): string {
    return this.translate.instant('placeholder.password');
  }

  // On submit button click
  onSubmit() {
    const ts = this;
    ts.loginFormSubmitted = true;
    const lang = ts.translate;
    const me = this.customForm;
    if (ts.customForm.invalid) {
      ts.onValidateForm(me);
      ts.msg.toastMessage(lang.instant('titleMessages.emptyFields'), lang.instant('bodyMessages.emptyFields'), 4);
      ts.disabledLoading();
      return;
    }

    ts.activeLoading();
    ts.showSpinner(lang.instant('login.button.loggingIn'));
    ts.api.post('/auth/login', me.value)
      .subscribe({
				next: (resp) => {
					ts.disabledLoading();
					ts.hideSpinner();
					ts.msg.toastMessage(lang.instant('login.button.loggingIn'), resp.message, 0);
					localStorage.setItem(ts.api.getApiJwt(), JSON.stringify(resp));
					ts.token.setJwt(JSON.stringify(resp));
					ts.onResetForm(me);
					ts.router.navigate(['/dashboard']);
					window.location.reload();
				}, 
				error: (err: string) => {
					ts.hideSpinner();
					ts.msg.toastMessage(lang.instant('general.error'), err, 4);
						ts.disabledLoading();
						ts.onValidateForm(me);
						ts.router.navigate(['/auth/login']);
				}
			});
  }
}
