import { Component, OnInit } from '@angular/core';
import {HttpServerService} from "../utils";
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import {UsersService} from "../services/users/users.service";
import {SchoolContract} from "../models/school-contract";
import {RolContract} from "../models/users-model";
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
    @BlockUI() blockUI: NgBlockUI;
  constructor(
      private _http: HttpServerService,
      public user: UsersService
  ) { }
  ngOnInit(): void {
    this.user.getUserSchools();
  }

  clickOnModule(school: SchoolContract, role: RolContract): void {
      this.blockUI.start('Cargando módulo...'); // Start blocking
      const params  = <any>this._http.getToken();
      const dt      = new Date();
      this.user.getSchoolModules(school.id);
      setTimeout(() => {
          if (params) {
              params.school = {
                  id: school.id,
                  active: school.active,
                  country_id: school.country_id,
                  nameschool: school.nameschool,
                  statecode: school.statecode,
                  lockdate: school.lockdate,
                  state: school.state,
                  year: dt.getFullYear()
              };
              params.profile    = role.profile;
              localStorage.setItem(this._http.getApiJwt(), JSON.stringify(params));
          }
          this.blockUI.stop(); // Stop blocking
          const url = `${this._http.getAppUrl()}/academic-notes`;
          window.open(url,'_blank');
      }, 2000);
  }
}
