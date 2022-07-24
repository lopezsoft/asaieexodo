import { Component, OnInit } from '@angular/core';
import {HttpServerService} from "../utils";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
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

  clickOnModule(item: any): void {
      console.log(item);
  }
}
