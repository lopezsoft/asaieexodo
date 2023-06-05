import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { UserTypes } from '../../models/users-model';
import { FormComponent } from '../../core/components/forms';
import { UsersService } from '../../services/users/users.service';
import {GlobalService} from "../../core/common/global.service";
import {ActivatedRoute} from "@angular/router";
@Component({
  selector: 'app-users-edit',
  templateUrl: './users-edit.component.html',
  styleUrls: ['./users-edit.component.scss'],
})
export class UsersEditComponent extends FormComponent implements OnInit, AfterViewInit {
    @ViewChild('uploadFile') uploadFile: ElementRef;
    @ViewChild('imgUp') imgUp: ElementRef;
    @ViewChild('focusElement') focusElement: ElementRef;
    userTypes: UserTypes[] = [];
    title = 'Editar usuario';
		school_id: any = 0;
    constructor(
      public fb: FormBuilder,
      public gService: GlobalService,
      public translate: TranslateService,
      public usersSer: UsersService,
      public aRouter: ActivatedRoute,
    ) {
      super(fb, gService, translate);
      this.customForm = this.fb.group({
        school_id      : ['', [Validators.required]],
        profile_id     : [[], [Validators.required]],
        first_name     : ['',[Validators.required, Validators.minLength(3)]],
        last_name      : ['',[Validators.required, Validators.minLength(3)]],
        active         : [true, [Validators.required]],
        email          : ['', [Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$'), Validators.required]]
      });
			this.gService.aRouter = this.aRouter;
			this.school_id        = this.aRouter.snapshot.paramMap.get('schoolId');
    }
    get invalidFirstName(): boolean {
      return this.isInvalid('first_name');
    }
    get invalidLastName(): boolean{
      return this.isInvalid('last_name');
    }
    get invalidEmail() {
        return this.isInvalid('email');
    }
    // placeholder
    get placeholderEmail(): string {
        return this.translate.instant('placeholder.email');
    }
    ngOnInit(): void {
      const ts    = this;
      super.ngOnInit();
      ts.PutURL   = '/user';
      ts.PostURL  = '/user/register';
      ts.showSpinner();
      ts.usersSer.getUserTypes()
	      .subscribe((resp) => {
          ts.userTypes  = resp;
      });
      this.usersSer.getUserSchools();
    }
    ngAfterViewInit(): void {
      super.ngAfterViewInit();
      this.hideSpinner();
    }
    loadData(id: any = 0): void {
      super.loadData(id);
      const ts    = this;
      const frm   = ts.customForm;
      ts.editing  = true;
      ts.usersSer.getUserById(id, this.school_id)
			.subscribe({
				next: (resp) => {
                    const data = resp[0];
					ts.hideSpinner();
					frm.setValue({
						first_name  : data.first_name,
						last_name   : data.last_name,
						active      : data.active,
						email       : data.email,
                        school_id   : this.school_id,
						profile_id  : [],
					});
					ts.imgData    = data.avatar ? `${resp[0].avatar}` : '';
					const school  = data.schools.find(s => s.school_id == this.school_id);
					let profile   = [];
					if(school) {
						school.roles.forEach((rol) => {
							profile = [...profile, rol.profile_id];
						});
					}
					frm.get('profile_id').setValue(profile);
				},
				error: () => {
					ts.hideSpinner();
				}
			});
    }
    onResetForm() {
      const ts  = this;
      const frm   = ts.customForm;
      super.onResetForm(frm);
      frm.setValue({
          profile_id  : [],
          school_id   : this.school_id,
          first_name  : '',
          last_name   : '',
          active      : true,
          email       : '',
      });
      ts.imgData = null;
    }
}
