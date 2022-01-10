import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { AccessToken } from './../interfaces/access-token.interface';
import { environment } from './../../environments/environment';

import { AccessTokenService } from './../services/singletons/access-token.service';
import { JsonResponse } from '../interfaces';
import { Role, User } from 'app/auth/models';

@Injectable({
  providedIn: 'root'
})
export class ApiServerService {
  public currentUser: User;
  private url: string;
  private appUrl: string;
  private apiJwt: string;
  constructor(private http: HttpClient, private tokenService: AccessTokenService) {
    this.url    = environment.APIURL;
    this.appUrl = environment.APPURL;
    this.apiJwt = environment.APIJWT;
  }

  private getHeaders(): HttpHeaders{
    const
      headers = new HttpHeaders({timeout: `${36000}`})
        .set('Accept', 'application/json')
        .set('Access-Control-Allow-Origin', '*')
        .set('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT');
    return  headers;
  }

  openDocument(url: string) {
    window.open(url, '_blank');
  }

  delete(query: string, params: any = {}) {
    const me = this;
    return me.http.delete<JsonResponse>(`${ me.url }${ query }`, { headers : me.getHeaders(), params });
  }

  post(query: string, body: any = {}, token: boolean = false) {
    const me = this;
    return me.http.post<JsonResponse>(`${ me.url }${ query }`, body, { headers : me.getHeaders()});
  }

  put(query: string, body: any, token: boolean = false) {
    const me = this;
    return me.http.put<JsonResponse>(`${ me.url }${ query }`, body, { headers : me.getHeaders()});
  }

  get(query: string, exParams: any = {}) {
    const me = this;
    return me.http.get<JsonResponse>(`${me.url}${ query }`, { headers : me.getHeaders(), params: exParams });
  }

  getUrl(): string{
    return this.url;
  }

  getAppUrl(): string{
    return this.appUrl;
  }

  getApiJwt(): string{
    return this.apiJwt;
  }

  isAuthenticated(): boolean {
    const
      token = this.getToken();
    return (token) ? true : false;
  }

  getToken(): AccessToken{
    const ts  = this;
    // const
      // jwt = ts.tokenService.getJwt();
    let
      token: AccessToken;
    // if(jwt.length > 10) {
    //   token = JSON.parse(jwt);
    // }else {
    // }
    token = JSON.parse(localStorage.getItem(this.getApiJwt()));
    return token;
  }

  getCurrentUser() {
    const ts    = this;
    let   user: any = {};
    /**
     * Set user value
     */
    if(!localStorage.getItem('currentUser')) {
        const token     = ts.getToken();
				if(token) {
					user.avatar     = `${ts.getAppUrl()}${token.avatar ?? token.logo}`;
					user.email      = token.mail;
					user.firstName  = token.first_name ?? token.name;
					user.lastName   = token.last_name;
					user.companyName= token.company[0].company_name;
					user.role       = Role.Admin;
					user.token      = token.access_token;
					user.id         = 1;
					localStorage.setItem('currentUser', JSON.stringify(user));
				}
			}

    ts.currentUser  = JSON.parse(localStorage.getItem('currentUser'));
    return ts.currentUser;
  }

  upCurrentUser(data: User) {
    const   ts  = this;
    let   user: any = {};
    user.avatar     = `${ts.getAppUrl()}${data.avatar}`;
    user.email      = data.email;
    user.firstName  = data.firstName;
    user.lastName   = data.lastName;
    user.role       = ts.currentUser.role;
    user.token      = ts.currentUser.token;
		user.companyName= ts.currentUser.companyName;
    user.id         = data.id;
    localStorage.removeItem('currentUser');
    localStorage.setItem('currentUser', JSON.stringify(user));
    ts.currentUser  = JSON.parse(localStorage.getItem('currentUser'));
    return ts.currentUser;
  }

	onClearCurrentUser(){
		localStorage.removeItem('currentUser');
	}
}

