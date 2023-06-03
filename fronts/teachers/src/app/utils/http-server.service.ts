import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';

import {AccessToken} from '../interfaces';
import {environment} from '../../environments/environment';

import {JsonResponse} from '../interfaces';
import {Role, User} from 'app/auth/models';

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

  protected getHeaders(): HttpHeaders{
    return  new HttpHeaders({timeout: `${36000}`})
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .set('Access-Control-Allow-Origin', '*')
        .set('Access-Control-Allow-Credentials', 'true')
        .set('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT');
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
    return !!(token);
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
        const token     = this.getToken();
          if(token) {
              user.avatar     = `${this.getAppUrl()}${token.user.avatar}`;
              user.email      = token.user.email;
              user.firstName  = token.user.first_name;
              user.lastName   = token.user.last_name;
              user.companyName= token.user.fullname;
              user.role       = Role.Admin;
              user.token      = token.access_token;
              user.id         = 1;
              localStorage.setItem('currentUser', JSON.stringify(user));
          }
    }

    this.currentUser  = JSON.parse(localStorage.getItem('currentUser'));
    return this.currentUser;
  }

  upCurrentUser(data: User) {
    let   user: any = {};
    user.avatar     = `${this.getAppUrl()}${data.avatar}`;
    user.email      = data.email;
    user.firstName  = data.firstName;
    user.lastName   = data.lastName;
    user.role       = this.currentUser.role;
    user.token      = this.currentUser.token;
    user.companyName= this.currentUser.companyName;
    user.id         = data.id;
    localStorage.removeItem('currentUser');
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUser  = JSON.parse(localStorage.getItem('currentUser'));
    return this.currentUser;
  }

	onClearCurrentUser(){
		localStorage.removeItem('currentUser');
	}
}

