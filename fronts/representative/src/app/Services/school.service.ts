import {Injectable} from '@angular/core';
import {HttpServerService} from "./http-server.service";
import {GlobalSettingsService} from "./global-settings.service";

@Injectable({
  providedIn: 'root'
})
export class SchoolService {
  constructor(
      public http: HttpServerService,
      public _settings: GlobalSettingsService,
  ) {
  }
  getSchool() {
    this.http.get('/school')
      .subscribe({
        next: (response: any) => {
          this._settings.schoolData = response.dataRecords.data;
        },
        error: (err) => {
          console.log(err);
        }
      });
  }
}
