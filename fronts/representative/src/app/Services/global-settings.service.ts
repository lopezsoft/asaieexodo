import { Injectable } from '@angular/core';
import {ISchool, ISchoolParams} from "../interfaces/school-params.interface";
import {BlockUI, NgBlockUI} from "ng-block-ui";

@Injectable({
  providedIn: 'root'
})
export class GlobalSettingsService {
  @BlockUI() blockUI: NgBlockUI;
  public loading        = false;
  public loadingText    = 'Cargando...';
  public blockUIMessage = 'Procesando petición...';
  public schoolParams: ISchoolParams;
  public schoolData: ISchool;
  constructor() { }
  
  public showBlockUI(customMessage?: string ) {
    this.blockUI.start(customMessage || this.blockUIMessage);
  }
  public hideBlockUI() {
    this.blockUI.stop();
  }
}
