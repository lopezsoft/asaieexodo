
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';

// Base component
import { FormComponent } from '../../core/components/forms';
import {GlobalService} from "../../core/common/global.service";
import {TranslateService} from "@ngx-translate/core";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-email-resend',
  templateUrl: './email-resend.component.html',
  styleUrls : ['./email-resend.scss']
})

export class EmailResendComponent extends FormComponent implements OnInit {
  @ViewChild('focusElement') focusElement: ElementRef;
  customForm: FormGroup;
  sendEmail: boolean = false;
  constructor(
    public fb: FormBuilder,
    public gService: GlobalService,
    public translate: TranslateService,
    public router: ActivatedRoute
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
    return this.gService.translate.instant('placeholder.email');
  }
  onSave(): void {
    const me = this.customForm;
    const lang = this.gService.translate;
    this.activeLoading();
    this.showSpinner(lang.instant('resend.button.resending'));
    if (me.invalid) {
      this.onValidateForm(me);
      this.gService.msg.toastMessage(lang.instant('titleMessages.emptyFields'), lang.instant('bodyMessages.emptyFields'), 4);
      this.disableMsg();
      return;
    }
    this.gService.http.get(`/email/resend/${this.router.snapshot.params.id}`, me.value)
      .subscribe({
        next: (resp) => {
            this.onResetForm(me);
            this.disableMsg();
            this.sendEmail = true;
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
