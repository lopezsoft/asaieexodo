
import { Validators, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';

import { Component, OnInit, ElementRef } from '@angular/core';

import { CoreConfigService } from '@core/services/config.service';

// Services
import {HttpServerService, MessagesService} from '../../utils';

import { TranslateService } from '@ngx-translate/core';

// Interfaces
import { ViewChild } from '@angular/core';
import {AuthMasterComponent} from '../auth-master/auth-master.component';
import {GlobalService} from "../../core/common/global.service";

@Component({
  selector: 'app-forgot-password-page',
  templateUrl: './forgot-password-page.component.html',
  styleUrls : ['./forgot-password-page.scss']
})

export class ForgotPasswordPageComponent extends AuthMasterComponent implements OnInit {
  @ViewChild('focusElement') focusElement: ElementRef;

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
   * @param _globalSettings
   */

  constructor(public fb: FormBuilder,
    public coreConfigService: CoreConfigService,
    public api: HttpServerService,
    public msg: MessagesService,
    public router: Router,
    public translate: TranslateService,
    public aRouter: ActivatedRoute,
    public spinner: NgxSpinnerService,
    public _globalSettings: GlobalService,
  ) {
	  super(coreConfigService, translate, api, router);
    this.customForm = this.fb.group({
      email: ['', Validators.required]
    });
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
    const lang = ts.translate;
    if (ts.customForm.invalid) {
      ts.msg.toastMessage(lang.instant('titleMessages.emptyFields'), lang.instant('bodyMessages.emptyFields'), 4);
      return;
    }

    ts._globalSettings.mask.showBlockUI();
    ts.api.post('/forgot-password', { email: ts.customForm.get('email').value }).
      subscribe({
				next: (resp) => {
					ts._globalSettings.mask.hideBlockUI();
					if (!resp.success) {
						ts.msg.errorMessage('', resp.message);
						return;
					}
					ts.msg.onMessage('', resp.message);
				},
				error: (err: string) => {
					ts._globalSettings.mask.hideBlockUI();
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
