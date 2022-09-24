import { Validators, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";

import { Component, OnInit, ElementRef } from '@angular/core';

// Services
import { HttpServerService, MessagesService } from '../../utils';

import { TranslateService } from '@ngx-translate/core';

// Base component
import { FormComponent } from '../../core/components/forms';

// Interfaces
import { ViewChild } from '@angular/core';

// Singletons
import { CoreConfigService } from '@core/services/config.service';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})

export class LoginPageComponent extends FormComponent implements OnInit {
  @ViewChild('focusElement') focusElement: ElementRef;
    public forgotPassword: string = '';
  constructor(public fb: FormBuilder,
    public coreConfigService: CoreConfigService,
    public api: HttpServerService,
    public msg: MessagesService,
    public router: Router,
    public translate: TranslateService,
    public aRouter: ActivatedRoute,
    public spinner: NgxSpinnerService,
  ) {
    super(fb, msg, api, router, translate, aRouter, spinner, coreConfigService);
    this.customForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(5)]],
      email: ['', [Validators.required, Validators.minLength(5)]],
      remember_me: [false]
    });
    // Configure the layout
    this.coreConfigService.config = {
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
    this.forgotPassword =  `${this.api.getAppUrl()}/forgot-password`;
  }

  get placeholderUserName(): string {
    return this.translate.instant('placeholder.userName');
  }

  get placeholderPassw(): string {
    return this.translate.instant('placeholder.password');
  }

  // On submit button click
  onSubmit() {
    this.loginFormSubmitted = true;
    const lang = this.translate;
    const me = this.customForm;
    if (this.customForm.invalid) {
      this.onValidateForm(me);
      this.msg.toastMessage(lang.instant('titleMessages.emptyFields'), lang.instant('bodyMessages.emptyFields'), 4);
      this.disabledLoading();
      return;
    }

    this.activeLoading();
    this.showSpinner(lang.instant('login.button.loggingIn'));
    this.api.post('/auth/login', me.value)
      .subscribe({
        next: (resp) => {
            this.disabledLoading();
            this.hideSpinner();
            this.msg.toastMessage(lang.instant('login.button.loggingIn'), resp.message, 0);
            localStorage.setItem(this.api.getApiJwt(), JSON.stringify(resp));
            this.onResetForm(me);
            this.router.navigate(['/dashboard']);
            window.location.reload();
        },
        error: (err: string) => {
            this.hideSpinner();
            this.msg.toastMessage(lang.instant('general.error'), err, 4);
                this.disabledLoading();
                this.onValidateForm(me);
                this.router.navigate(['/auth/login']);
        }
    });
  }
}
