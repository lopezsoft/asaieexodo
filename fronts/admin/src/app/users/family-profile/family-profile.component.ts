import { Component, OnInit } from '@angular/core';
import {BaseComponent} from "../../core/components/base/base.component";
import {GlobalService} from "../../core/common/global.service";
import {TranslateService} from "@ngx-translate/core";
import {UsersService} from "../../services/users/users.service";

@Component({
  selector: 'app-family-profile',
  templateUrl: './family-profile.component.html',
  styleUrls: ['./family-profile.component.scss']
})
export class FamilyProfileComponent extends BaseComponent implements OnInit {
  title = 'Crear perfiles de usuario familiar';
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
    this.user.createCampusProfile({
      schoolId: this.school_id,
      profile: 'family'
    });
  }
  onChangeSchool(e) {
    this.school_id  = e;
  }

}
