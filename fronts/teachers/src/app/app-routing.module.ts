import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './services/auth-guard.service';

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/content-auth.module').then(m => m.ContentAuthModule)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'user',
    loadChildren: () => import('./users/users.module').then(m => m.UsersModule),
    canActivate: [AuthGuard]
  },
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/auth/error' //Error 404 - Page not found
  }
];


@NgModule({
  imports: [RouterModule.forRoot(routes, {
    useHash: true,           // Boolean:
    scrollPositionRestoration: 'enabled', // Add options right here
    relativeLinkResolution: 'legacy',
  })],
  exports: [RouterModule],
})
export default class AppRoutingModule { }
