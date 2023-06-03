import { NgForm, Validators, FormBuilder } from '@angular/forms';
import { Component, OnInit, ElementRef } from '@angular/core';
// Base component
import { FormComponent } from '../../core/components/forms';

// Interfaces
import { ViewChild } from '@angular/core';
import {GlobalService} from "../../core/common/global.service";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-forgot-password-page',
  templateUrl: './forgot-password-page.component.html',
  styleUrls : ['./forgot-password-page.scss']
})

export class ForgotPasswordPageComponent extends FormComponent implements OnInit {
  @ViewChild('focusElement') focusElement: ElementRef;
  @ViewChild('f') forogtPasswordForm: NgForm;
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
        return this.gService.translate.instant('placeholder.email');
    }

  // On submit click, reset form fields
  onSubmit() {
    const lang= this.gService.translate;
    if(this.customForm.invalid) {
      this.gService.msg.toastMessage(lang.instant('titleMessages.emptyFields'), lang.instant('bodyMessages.emptyFields'), 4);
      return;
    }

  this.activeLoading();
  this.showSpinner(lang.instant('recoverPassword.button.recovering'));
    this.gService.http.post('/auth/forgot-password', { email: this.customForm.get('email').value }).
      subscribe({
        next: (resp) => {
            this.disableMsg()
            if (!resp.success) {
                this.gService.msg.errorMessage('', resp.message);
                return;
            }
            this.gService.msg.onMessage('', resp.message);
        },
        error: (err: string) => {
           this.disableMsg();
            this.gService.msg.errorMessage('Error', err);
        }
    });
  }
  disableMsg(): void {
      this.hideSpinner();
      this.disabledLoading();
  }
}
