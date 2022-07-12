import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

import { HttpServerService, MessagesService } from './../utils/index';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(public api: HttpServerService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const token       = this.api.getToken();
    if (!token) {
      return next.handle(req);
    }

    const stringToken = `${token.token_type} ${token.access_token}`;
    const req1 = req.clone({
      headers: req.headers.set('Authorization', stringToken),
    });

    return next.handle(req1);
  }

}
