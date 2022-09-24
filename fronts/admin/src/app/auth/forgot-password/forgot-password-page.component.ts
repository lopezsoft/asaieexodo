
import { NgForm, Validators, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";

import { Component, OnInit, ElementRef } from '@angular/core';

import { CoreConfigService } from '@core/services/config.service';

// Services
import { HttpServerService, MessagesService } from '../../utils';

import { TranslateService } from '@ngx-translate/core';

// Base component
import { FormComponent } from '../../core/components/forms';

// Interfaces
import { ViewChild } from '@angular/core';

@Component({
  selector: 'app-forgot-password-page',
  templateUrl: './forgot-password-page.component.html',
  styleUrls : ['./forgot-password-page.scss']
})

export class ForgotPasswordPageComponent extends FormComponent implements OnInit {
  @ViewChild('focusElement') focusElement: ElementRef;
  @ViewChild('f') forogtPasswordForm: NgForm;

  /**
   * Constructor
   *
   * @param fb
   * @param coreConfigService
   * @param api
   * @param msg
   * @param router
   * @param translate
   * @param aRouter
   * @param spinner
   */

  constructor(public fb: FormBuilder,
    public coreConfigService: CoreConfigService,
    public api: HttpServerService,
    public msg: MessagesService,
    public router: Router,
    public translate: TranslateService,
    public aRouter: ActivatedRoute,
    public spinner: NgxSpinnerService) {
    super(fb, msg, api, router, translate, aRouter, spinner, coreConfigService);

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

    this.customForm = this.fb.group({
      email: ['', [Validators.required, Validators.pattern('^[a-z0-9._%+-ñ]+@[a-z0-9._%+-ñ]+\.[a-z]{2,4}$')]]
    })
  }

  /**
* On init
*/
  ngOnInit(): void {
    super.ngOnInit();
  }

    get invalidEmail(): boolean {
        return this.isInvalid('email');
    }

    get placeholderEmail(): string {
        return this.translate.instant('placeholder.email');
    }

  // On submit click, reset form fields
  onSubmit() {
    const lang= this.translate;
    if(this.customForm.invalid) {
      this.msg.toastMessage(lang.instant('titleMessages.emptyFields'), lang.instant('bodyMessages.emptyFields'), 4);
      return;
    }

  this.activeLoading();
  this.showSpinner(lang.instant('recoverPassword.button.recovering'));
    this.api.post('/auth/forgot-password', { email: this.customForm.get('email').value }).
      subscribe({
        next: (resp) => {
            this.disableMsg()
            if (!resp.success) {
                this.msg.errorMessage('', resp.message);
                return;
            }
            this.msg.onMessage('', resp.message);
        },
        error: (err: string) => {
           this.disableMsg();
            this.msg.errorMessage('Error', err);
        }
    });
  }

    disableMsg(): void {
        this.hideSpinner();
        this.disabledLoading();
    }


}
