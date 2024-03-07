import { Injectable } from '@angular/core';
import {HttpServerService} from "./http-server.service";
import {MessagesService} from "./messages.service";
import {map, Observable} from "rxjs";
import {JsonResponse} from "../interfaces/json-response.interface";
import {IPollingStation, IValidate, IVotingData} from "../interfaces/school-params.interface";

@Injectable({
  providedIn: 'root'
})
export class VotingService {
  public hasError = false;
  public errorMessage: string;
  public validateData: IValidate;
  public votingData: IVotingData[] = [];
  public votingStation: IPollingStation;
  constructor(
    public http: HttpServerService,
    public msg: MessagesService,
  ) { }
  closeVoting() {
    return this.http.get('/representative/vote/close-voting')
      .pipe((map((response: JsonResponse) => {
        return response;
      })));
  }
  saveVoting(candidates: IVotingData[], enrollmentId: number): Observable<JsonResponse> {
    return this.http.post(`/representative/vote/save-voting`, {candidates: JSON.stringify(candidates), enrollmentId})
      .pipe((map((response: JsonResponse) => {
        return response;
      })));
  }
  validateVotingCode(code: string): Observable<JsonResponse> {
    return this.http.post(`/representative/vote/validate-voting-code/${code}`)
      .pipe((map((response: JsonResponse) => {
        return response;
      })));
  }
  getVotingData() {
    this.http.get('/representative/vote/voting-data')
      .subscribe({
        next: (response: any) => {
          this.validateData     = response.validate;
          this.votingStation    = response.station;
          this.votingData       = response.votingData;
        },
        error: (error) => {
          this.hasError = true;
          this.errorMessage = error;
          this.msg.errorMessage('Error', error);
        }
      })
  }
}
