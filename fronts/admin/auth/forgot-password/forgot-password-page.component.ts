
import { NgForm, Validators, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";

import { Component, OnInit, ElementRef } from '@angular/core';

import { CoreConfigService } from '@core/services/config.service';

// Services
import { ApiServerService, MessagesService } from './../../utils/index';

import { TranslateService } from '@ngx-translate/core';

// Base component
import { FormComponent } from './../../core/components/forms/form.component';

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
 * @param {CoreConfigService} _coreConfigService
 */

  constructor(public fb: FormBuilder,
    public coreConfigService: CoreConfigService,
    public api: ApiServerService,
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
      email: ['', Validators.required]
    })
  }

  /**
* On init
*/
  ngOnInit(): void {
    super.ngOnInit();
  }

  // On submit click, reset form fields
  onSubmit() {
    const ts  = this;
    const lang= ts.translate;
    if(ts.customForm.invalid) {
      ts.msg.toastMessage(lang.instant('titleMessages.emptyFields'), lang.instant('bodyMessages.emptyFields'), 4);
      return;
    };

    ts.showSpinner('Realizando petición, espere por favor...');
    ts.loading = true;
    ts.api.post('/auth/recover', { email: ts.customForm.get('email').value }).
      subscribe({
				next: (resp) => {
					ts.loading = false;
					ts.hideSpinner();
					if (!resp.success) {
						ts.msg.errorMessage('', resp.message);
						return;
					}
					ts.msg.onMessage('', resp.message);
				}, 
				error: (err: string) => {
					ts.hideSpinner();
					ts.loading = false;
					ts.msg.errorMessage('Error', err);
				}
			});
  }

  get invalidEmail(): boolean {
    return this.isInvalid('email');
  }

  get placeholderEmail(): string {
    return this.translate.instant('placeholder.email');
  }
}
