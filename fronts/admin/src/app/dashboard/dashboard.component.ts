import { Component, OnInit } from '@angular/core';
import {HttpServerService} from "../utils";
import { BlockUI, NgBlockUI } from 'ng-block-ui';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
    @BlockUI() blockUI: NgBlockUI;
    public schools : Array<any> = [];

  constructor(
      private _http: HttpServerService
  ) { }

  ngOnInit(): void {
    this._http.get('/user')
        .subscribe({
          next: (resp: any) => {
            this.schools  = resp.records.schools;
          },
          error: (err: any) => {
            console.log(err);
          }
        });
  }

  clickOnModule(school: any, role: any): void {
      this.blockUI.start('Cargando módulo...'); // Start blocking
      const params  = <any>this._http.getToken();
      const dt      = new Date();
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
          console.log(school);
          console.log(role);
          this.blockUI.stop(); // Stop blocking
          const url = `${this._http.getAppUrl()}/admin`;
          window.open(url,'_blank');
      }, 2000);
  }
}
