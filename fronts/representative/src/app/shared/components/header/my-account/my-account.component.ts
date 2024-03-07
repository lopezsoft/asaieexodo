import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {GlobalSettingsService} from "../../../../Services/global-settings.service";

@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.scss']
})

export class MyAccountComponent {
  
  constructor(
    public router: Router,
    public _globalSettings: GlobalSettingsService,
  ) { }
  
 protected getSchoolName(): string {
   return this._globalSettings?.schoolData?.nameschool || '';
 }
}
