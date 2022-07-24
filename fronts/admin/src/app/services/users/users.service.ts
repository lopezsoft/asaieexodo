import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { JsonResponse } from '../../interfaces';
import { HttpServerService } from '../../utils';

import { Users, UserTypes } from '../../models/users-model';
@Injectable({
  providedIn: 'root'
})
export class UsersService {
  constructor(
    private api: HttpServerService
  ){}

  getUserTpes(): Observable<UserTypes[]> {
    const ts  = this;
    return ts.api.get(`/users/types`)
      .pipe( map ( (resp: JsonResponse ) => {
        return resp.records;
      }));
  }

  getProfile(): Observable<Users[]> {
    const ts  = this;
    return ts.api.get(`/user`)
      .pipe( map ( (resp: JsonResponse ) => {
        return resp.records;
      }));
  }

  getData(params: any): Observable<Users[]> {
    const ts  = this;
    return ts.api.get(`/users/read`, params)
      .pipe( map ( (resp: JsonResponse ) => {
        return resp.records;
      }));
  }
}
