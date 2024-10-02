import { Injectable } from '@angular/core';

import { User, Role } from 'app/auth/models';

import { HttpServerService } from '../../utils/http-server.service';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {

  /**
   *
   * @param {HttpServerService} _api
   */
  constructor(
    private _api: HttpServerService,
  ) {}

  // getter: currentUserValue
  public get currentUserValue(): User {
    return this._api.getCurrentUser();
  }

  /**
   *  Confirms if user is admin
   */
  get isAdmin() {
    const _api  = this._api;
    return _api.isAuthenticated() && _api.getCurrentUser() && _api.getCurrentUser().role === Role.Admin;
  }

  /**
   *  Confirms if user is client
   */
  get isClient() {
    const _api  = this._api;
    return _api.isAuthenticated() && _api.getCurrentUser() && _api.getCurrentUser().role === Role.Client;
  }
}
