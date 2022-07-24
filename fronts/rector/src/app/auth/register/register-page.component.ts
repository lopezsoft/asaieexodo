
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
import { TranslateService } from '@ngx-translate/core';

import { CoreConfigService } from '@core/services/config.service';

// Services
import { HttpServerService, MessagesService } from './../../utils/index';


// Base component
import { FormComponent } from './../../core/components/forms/form.component';

@Component({
  selector: 'app-register-page',
  templateUrl: './register-page.component.html',
  styleUrls : ['./register-page.scss']
})

export class RegisterPageComponent extends FormComponent implements OnInit {
  @ViewChild('focusElement') focusElement: ElementRef;
  registerFormSubmitted = false;
  customForm: FormGroup;

  constructor(
    public fb: FormBuilder,
    public api: HttpServerService,
    public msg: MessagesService,
    public router: Router,
    public translate: TranslateService,
    public aRouter: ActivatedRoute,
    public spinner: NgxSpinnerService,
    public coreConfigService: CoreConfigService,
  ) {
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
      first_name						: ['', [Validators.required, Validators.minLength(3)]],
      last_name							: ['', [Validators.required, Validators.minLength(3)]],
      company_name					: ['', [Validators.required, Validators.minLength(5)]],
      // identity_document_id	: [3, Validators.required],
      dni										: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(12)]],
      type_organization_id	: [1, Validators.required],
      mobile								: ['', [Validators.required, Validators.minLength(7)]],
      address								: ['', [Validators.required, Validators.minLength(10)]],
      city_id								: [149, Validators.required],
      email									: ['', [Validators.required, Validators.pattern('^[a-z0-9._%+-ñ]+@[a-z0-9._%+-ñ]+\.[a-z]{2,4}$')]]
    });
  }

  ngOnInit() {
    super.ngOnInit();
    const ts = this;
    ts.showSpinner();

  }

  get rf() {
    return this.customForm.controls;
  }

	get invalidFirstName() {
    return this.isInvalid('first_name');
  }
  get invalidLastName() {
    return this.isInvalid('last_name');
  }

  get invalidName() {
    return this.isInvalid('company_name');
  }
  get invalidDni() {
		return this.isInvalid('dni');
  }
  get invalidMobile() {
    return this.isInvalid('mobile');
  }
  get invalidAdress() {
    return this.isInvalid('address');
  }
  get invalidEmail() {
    return this.isInvalid('email');
  }


  // placeholder

  get placeholderEmail(): string {
    return this.translate.instant('placeholder.email');
  }
  get placeholderPassw(): string {
    return this.translate.instant('placeholder.password');
  }

  get placeholderConfirmPassw(): string {
    return this.translate.instant('placeholder.confirmPassword');
  }
  get placeholderNameAndSurname(): string {
    return this.translate.instant('register.placeholder.nameAndSurname');
  }



  onSave(): void {
    const me = this.customForm;
    const ts = this;
    const lang = this.translate;
    ts.activeLoading();
    ts.showSpinner(lang.instant('register.button.creatingAccount'));
    if (me.invalid) {
      ts.onValidateForm(me);
      ts.msg.toastMessage(lang.instant('titleMessages.emptyFields'), lang.instant('bodyMessages.emptyFields'), 4);
      ts.disabledLoading();
      ts.hideSpinner();
      return;
    };

    ts.api.post('/signup', me.value)
      .subscribe({
				next: (resp) => {
					ts.onResetForm(me);
					ts.hideSpinner();
					ts.disabledLoading();
					ts.msg.onMessage(lang.instant('register.messages.successfulRegistration'), resp.message);
				}, 
				error: (err: string) => {
					ts.hideSpinner();
					ts.disabledLoading();
					ts.msg.errorMessage(lang.instant('general.error'), err);
				}
			});
  }

}
