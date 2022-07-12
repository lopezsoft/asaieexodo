import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { AccessToken } from '../interfaces/access-token.interface';
import { environment } from '../../environments/environment';

import { JsonResponse } from '../interfaces';
import { Role, User } from 'app/auth/models';

@Injectable({
  providedIn: 'root'
})
export class HttpServerService {
  public currentUser: User;
  private url: string;
  private appUrl: string;
  private apiJwt: string;
  constructor(private http: HttpClient) {
    this.url    = environment.APIURL;
    this.appUrl = environment.APPURL;
    this.apiJwt = environment.APIJWT;
  }

  private getHeaders(): HttpHeaders{
    const
      headers = new HttpHeaders({timeout: `${36000}`})
        .set('Accept', 'application/json')
        .set('Access-Control-Allow-Origin', '*')
        .set('Access-Control-Allow-Credentials', 'true')
        .set('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT');
    return  headers;
  }

  openDocument(url: string) {
    window.open(url, '_blank');
  }

  getCookie(query: string){
    const me = this;
    return me.http.get<JsonResponse>(`${ me.appUrl }${ query }`, { headers : me.getHeaders() });
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
    let
      token: AccessToken;
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
					user.avatar     = `${ts.getAppUrl()}${token.user.avatar}`;
					user.email      = token.user.email;
					user.firstName  = token.user.first_name;
					user.lastName   = token.user.last_name;
					user.companyName= token.school.nameschool;
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

