import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';

import { UsersService } from '../../services/users/users.service';
import {FormComponent} from "../../core/components/forms";
import {GlobalService} from "../../core/common/global.service";
import {TranslateService} from "@ngx-translate/core";
@Component({
  selector: 'app-profile-change',
  templateUrl: './profile-change.component.html',
  styleUrls: ['./profile-change.component.scss']
})
export class ProfileChangeComponent extends FormComponent implements OnInit, AfterViewInit {
  @ViewChild('focusElement') focusElement: ElementRef;

  title = 'Cambiar nombre de usuario';
  constructor(
    public fb: FormBuilder,
    public gService: GlobalService,
    public usersSer: UsersService,
    public translate: TranslateService,
  ) {
      super(fb, gService, translate);
      this.customForm = this.fb.group({
          first_name     : ['',[Validators.required, Validators.minLength(3)]],
          last_name      : ['',[Validators.required, Validators.minLength(3)]],
          active         : [true, [Validators.required]],
          user_name      : [''],
          email          : ['', [Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$'), Validators.required]]
      });
  }

    // VALIDATION
    get rf() {
        return this.customForm.controls;
    }


    get invalidEmail() {
        return this.isInvalid('email');
    }

    get placeholderEmail(): string {
        return this.gService.translate.instant('placeholder.email');
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.PutURL   = '/user/update/';
        this.PostURL  = '/user/create';
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
                    user_name   : resp.email,
                    email       : '',
				});
			},
			error: ()=> { 
				this.hideSpinner();
			}
		});
  }

    saveData(): void {
        const ts    = this;
        const frm   = ts.customForm;
        const lang  = ts.gService.translate;
        const gs    = ts.gService;
        let values: any = {};
        if (frm.invalid) {
            this.disabledLoading();
            return;
        }
        gs.mask.showBlockUI(lang.instant('messages.loading'));
        values      = frm.value;
        ts.gService.http.post(`/change-user-name`, {
            email: values.email,
            uuid: ts.uid,
            accessModule: 2, // Access module 2 is for the teacher
        })
        .subscribe({
            next: (resp) => {
                ts.disabledLoading();
                gs.mask.hideBlockUI();
                localStorage.removeItem(gs.http.getApiJwt());
                gs.http.onClearCurrentUser();
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            },
            error: (err: string) => {
                ts.disabledLoading();
                gs.mask.hideBlockUI();
                ts.gService.msg.errorMessage(lang.instant('general.error'), err);
            }
        });
    }
}
