import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {HttpServerService} from "../utils";
import {BlockUI, NgBlockUI} from 'ng-block-ui';
import {UsersService} from "../services/users/users.service";
import {SchoolContract, Schools} from "../models/school-contract";
import {RolContract} from "../models/users-model";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
    @ViewChild('searchField') searchField: ElementRef;
    @BlockUI() blockUI: NgBlockUI;
    public currentSchools: Schools[] = [];
  constructor(
      private _http: HttpServerService,
      public user: UsersService
  ) { }
  ngOnInit(): void {
    this.user.getUserSchools();
  }
  
  schools(): Schools[] {
    return this.user.schools;
  }
  clickOnModule(school: SchoolContract, role: RolContract): void {
      this.blockUI.start('Cargando módulo...'); // Start blocking
      const params  = <any>this._http.getToken();
      const dt      = new Date();
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
      window.location.href = `${this._http.getAppUrl()}/admin`;
      setTimeout(() => {
        window.location.reload();
      }, 1000);
  }
  
  searchQuery(value: string) {
    if (this.currentSchools.length === 0) {
      this.currentSchools = this.user.schools;
    }
    if (value.length > 0) {
      this.user.schools = this.currentSchools.filter((school: Schools) => {
        return school.school.nameschool.toLowerCase().includes(value.toLowerCase());
      });
    } else {
      this.user.schools = this.currentSchools;
    }
  }
  
  inputSearch($event: Event) {
    const value = ($event.target as HTMLInputElement).value;
    this.searchQuery(value);
  }
}
