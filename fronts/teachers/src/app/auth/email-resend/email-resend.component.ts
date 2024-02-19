
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';

// Base component
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {AuthMasterComponent} from '../auth-master/auth-master.component';
import {HttpServerService, MessagesService} from '../../utils';
import {NgxSpinnerService} from 'ngx-spinner';
import {CoreConfigService} from '../../../@core/services/config.service';
import {GlobalService} from "../../core/common/global.service";

@Component({
  selector: 'app-email-resend',
  templateUrl: './email-resend.component.html',
  styleUrls : ['./email-resend.scss']
})

export class EmailResendComponent extends AuthMasterComponent implements OnInit {
  @ViewChild('focusElement') focusElement: ElementRef;
  customForm: FormGroup;
  sendEmail = false;
  constructor(
    public fb: FormBuilder,
    public translate: TranslateService,
    public router: Router,
    public api: HttpServerService,
    public msg: MessagesService,
    public spinner: NgxSpinnerService,
    public coreConfigService: CoreConfigService,
    public _globalSettings: GlobalService,
  ) {
    super(coreConfigService, translate, api, router);
    this.customForm = this.fb.group({
      email			        : ['', [Validators.required, Validators.pattern('^[a-z0-9._%+-ñ]+@[a-z0-9._%+-ñ]+\.[a-z]{2,4}$')]]
    });
  }
  ngOnInit() {
    super.ngOnInit();
  }

  get invalidEmail() {
    return this.isInvalid('email');
  }

  // placeholder

  get placeholderEmail(): string {
    return this.translate.instant('placeholder.email');
  }
  onSave(): void {
    const me    = this.customForm;
    const lang  = this.translate;
    const gs    = this._globalSettings;
    gs.mask.showBlockUI(lang.instant('resend.button.resending'));
    if (me.invalid) {
      this.onValidateForm(me);
      this.msg.toastMessage(lang.instant('titleMessages.emptyFields'), lang.instant('bodyMessages.emptyFields'), 4);
      this.disableMsg();
      return;
    }
    this.loading = true;
    this.api.post(`/email/verification-notification`, {
      email: me.value,
      accessModule: 2, // Access module 2 is for the teacher
      })
      .subscribe({
        next: (resp) => {
            me.reset();
            this.disableMsg();
            this.sendEmail = true;
            this.msg.onMessage(lang.instant('register.messages.successfulRegistration'), resp.message);
        },
        error: (err: string) => {
            this.disableMsg();
            this.msg.errorMessage(lang.instant('general.error'), err);
        }
    });

  }
  disableMsg(): void {
    this._globalSettings.mask.hideBlockUI();
    this.loading = false;
  }

}
