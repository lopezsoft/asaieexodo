import { Component, OnInit } from '@angular/core';
// Services
import {GlobalService} from "../../core/common/global.service";
import {TranslateService} from "@ngx-translate/core";
import {UsersService} from "../../services/users/users.service";
import {BaseComponent} from "../../core/components/base/base.component";

@Component({
  	selector: 'app-teachers-profile',
  	templateUrl: './teachers-profile.component.html',
	styleUrls: ['./teachers-profile.component.scss'],
})
export class TeachersProfileComponent extends BaseComponent implements OnInit {
  title = 'Crear perfiles de usuario docente';
	school_id = 0;
  constructor(
	  public gService: GlobalService,
	  public translate: TranslateService,
	  public user: UsersService,
  ) {
    super(gService);
  }
	ngOnInit(): void {
		const	ts    = this;
		ts.gService.changeLanguage(ts.gService.activeLang);
		super.ngOnInit();
		this.user.getUserSchools();
	}
	createData(): void {
		this.user.createTeacherProfile({
			schoolId: this.school_id
		});
	}
	onChangeSchool(e) {
		this.school_id  = e;
	}
}
