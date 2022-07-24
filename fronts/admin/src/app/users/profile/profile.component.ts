import { NgxSpinnerService } from 'ngx-spinner';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { TranslateService } from '@ngx-translate/core';
import { HttpServerService, MessagesService } from '../../utils';

import { UsersService } from '../../services/users/users.service';
import {FormComponent} from "../../core/components/forms";
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent extends FormComponent implements OnInit, AfterViewInit {
  @ViewChild('uploadFile') uploadFile: ElementRef;
  @ViewChild('imgUp') imgUp: ElementRef;
  @ViewChild('focusElement') focusElement: ElementRef;

  title = 'Perfil de usuario';
  constructor(
    public fb: FormBuilder,
    public api: HttpServerService,
    public msg: MessagesService,
    public router: Router,
    public translate: TranslateService,
    public aRouter: ActivatedRoute,
    public spinner: NgxSpinnerService,
    public usersSer: UsersService,
  ) {
      super(fb, msg, api, router, translate, aRouter, spinner);
      this.customForm = this.fb.group({
          first_name     : ['',[Validators.required, Validators.minLength(3)]],
          last_name      : ['',[Validators.required, Validators.minLength(3)]],
          active         : [true, [Validators.required]],
          email          : ['', [Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$'), Validators.required]]
      });
  }

    // VALIDATION
    get rf() {
        return this.customForm.controls;
    }

    get invalidFirstName(): boolean{
        return this.isInvalid('first_name');
    }

    get invalidLastName(): boolean{
        return this.isInvalid('last_name');
    }

    get invalidEmail() {
        return this.isInvalid('email');
    }

    get placeholderEmail(): string {
        return this.translate.instant('placeholder.email');
    }


    ngOnInit(): void {
        super.ngOnInit();
        this.PutURL   = '/auth/user/update/';
        this.PostURL  = '/auth/user/create';
		this.loadData();
  }

    ngAfterViewInit(): void {
        super.ngAfterViewInit();
        this.hideSpinner();
    }


    loadData(id: any = 0): void {
    const frm   = this.customForm;
    this.getCurrentUser();
    this.usersSer.getProfile()
		.subscribe({
			next:(resp: any) => {
				localStorage.setItem('oldRoute', '/');
				this.editing  = true;
				this.hideSpinner();
				this.uid  = resp.id;
				frm.setValue({
					first_name  : resp.first_name,
					last_name   : resp.last_name,
					active      : resp.active,
					email       : resp.email,
				});
                this.imgData    = `${this.api.getAppUrl()}${resp.avatar}`;
			},
			error: ()=> { 
				this.hideSpinner();
			}
		});
  }

    onResetForm() {
        let frm   = this.customForm;
        super.onResetForm(frm);
        frm.setValue({
            first_name  : '',
            last_name   : '',
            active      : true,
            email       : '',
        });
        this.imgData = null;
    }
  onAfterSave(resp: any){
    super.onAfterSave(resp);
    this.upCurrentUser({
        avatar    : resp.user.avatar,
        id        : resp.user.id,
        email     : resp.user.email,
        lastName  : this.currentUser.lastName,
        firstName : this.currentUser.firstName,
        role      : this.currentUser.role
    });
    setTimeout(() => {
        window.location.reload();
    }, 250);
  }
}
