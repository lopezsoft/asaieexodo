import { NgxSpinnerService } from 'ngx-spinner';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { TranslateService } from '@ngx-translate/core';
import { HttpServerService, MessagesService } from './../../utils';

import { UserTypes } from './../../models/users-model';
import { UsersService } from '../../services/users/users.service';
import { UsersEditComponent } from '../users-edit/users-edit.component';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent extends UsersEditComponent implements OnInit, AfterViewInit {
  @ViewChild('uploadFile') uploadFile: ElementRef;
  @ViewChild('imgUp') imgUp: ElementRef;
  @ViewChild('focusElement') focusElement: ElementRef;

  userTypes: UserTypes[] = [];
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
    super(fb, api, msg, router, translate, aRouter, spinner, usersSer);
  }

  ngOnInit(): void {
    super.ngOnInit();
		this.loadData();
  }

	loadData(id: any = 0): void {
    const ts    = this;
    const frm   = ts.customForm;
    ts.getCurrentUser();
    ts.usersSer.getProfile()
		.subscribe({
			next:(resp) => {
				localStorage.setItem('oldRoute', '/');
				ts.editing  = true;
				ts.hideSpinner();
				ts.uid  = resp[0].id;
				frm.setValue({
					type_id     : resp[0].type_id,
					first_name  : resp[0].first_name,
					last_name   : resp[0].last_name,
					active      : resp[0].active,
					email       : resp[0].email,
				});
				ts.upCurrentUser({
						firstName : resp[0].first_name,
						avatar    : resp[0].avatar,
						id        : resp[0].id,
						email     : resp[0].email,
						lastName  : ts.currentUser.lastName,
						role      : ts.currentUser.role
				});
				ts.imgData              = resp[0].avatar ? `${ts.api.getAppUrl()}${resp[0].avatar}` : '';
			},
			error: ()=> { 
				ts.hideSpinner();
			}
		});
  }

  onAfterSave(resp: any){
    super.onAfterSave(resp);
    const ts    = this;
    ts.upCurrentUser({
        avatar    : resp.records.avatar,
        id        : resp.records.id,
        email     : resp.records.email,
        lastName  : ts.currentUser.lastName,
        firstName : ts.currentUser.firstName,
        role      : ts.currentUser.role
    });
    setTimeout(() => {
        window.location.reload();
    }, 250);
  }
}
