import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';

import { CoreConfigService } from '@core/services/config.service';
import {ActivatedRoute, Router} from '@angular/router';
import {HttpServerService, MessagesService} from '../../utils';
import {AuthMasterComponent} from '../auth-master/auth-master.component';
import {NgxSpinnerService} from 'ngx-spinner';
import {TranslateService} from '@ngx-translate/core';
import {GlobalService} from "../../core/common/global.service";

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ResetPasswordComponent extends AuthMasterComponent implements OnInit {
  // Public
  public passwordTextType: boolean;
  public confPasswordTextType: boolean;
  public submitted = false;
  public token: string;
  public email: string;

  /**
   * Constructor
   *
   * @param api
   * @param fb
   * @param msg
   * @param router
   * @param spinner
   * @param {CoreConfigService} _coreConfigService
   * @param route
   * @param translate
   * @param _globalSettings
   */
  constructor(
      public api: HttpServerService,
      private route: ActivatedRoute,
      public fb: FormBuilder,
      public msg: MessagesService,
      public router: Router,
      public spinner: NgxSpinnerService,
      public _coreConfigService: CoreConfigService,
      public translate: TranslateService,
      public _globalSettings: GlobalService,
  ) {
    super(_coreConfigService, translate, api, router);
  }

  /**
   * Toggle password
   */
  togglePasswordTextType() {
    this.passwordTextType = !this.passwordTextType;
  }

  /**
   * Toggle confirm password
   */
  toggleConfPasswordTextType() {
    this.confPasswordTextType = !this.confPasswordTextType;
  }

  /**
   * On Submit
   */
  onSubmit() {
    const ts  = this;
    const lang = ts.translate;
    if (ts.customForm.invalid) {
      ts.msg.toastMessage(lang.instant('titleMessages.emptyFields'), lang.instant('bodyMessages.emptyFields'), 4);
      return;
    }
    const values = ts.customForm.getRawValue();
    values.token = ts.token;
    values.email = ts.email;
    ts._globalSettings.mask.showBlockUI();
    ts.api.post('/reset-password', values).
    subscribe({
      next: (resp) => {
        ts._globalSettings.mask.hideBlockUI();
        if (!resp.success) {
          ts.msg.errorMessage('', resp.message);
          return;
        }
        ts.msg.onMessage('', resp.message);
        setTimeout(() => {
          ts.router.navigate(['/auth/login']);
        }, 2000);
      },
      error: (err: any) => {
        ts._globalSettings.mask.hideBlockUI();
        ts.msg.errorMessage('Error', err || err.message || err.error.message);
      }
    });
  }

  // Lifecycle Hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    super.ngOnInit();
    this.customForm = this.fb.group({
      password: ['', [Validators.required]],
      password_confirmation: ['', [Validators.required]]
    });

    this.email = this.route.snapshot.queryParams['email'];
    this.token = this.route.snapshot.params['token'];
  }
}
