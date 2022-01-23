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
    path: 'administrative',
    loadChildren: () => import('./Administrative/Administrative.module').then(m => m.AdministrativeModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'academic',
    loadChildren: () => import('./Academic/Academic.module').then(m => m.AcademicModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'promotion',
    loadChildren: () => import('./Promotion/Promotion.module').then(m => m.PromotionModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'reports',
    loadChildren: () => import('./Reports/Reports.module').then(m => m.ReportsModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'elections',
    loadChildren: () => import('./Vote/Vote.module').then(m => m.VoteModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'settings',
    loadChildren: () => import('./Settings/Settings.module').then(m => m.SettingsModule),
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
