import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { HttpServerService } from '../utils/http-server.service';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private authService: HttpServerService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    let isAuth = this.authService.isAuthenticated();
    if (!isAuth) {
      this.router.navigate(['/auth/login']);
    }else {
      return true;
    }
  }
}
