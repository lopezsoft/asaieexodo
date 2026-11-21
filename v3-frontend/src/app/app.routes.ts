import { inject } from '@angular/core';
import { CanActivateFn, Router, Routes } from '@angular/router';
import { AuthenticationComponent } from './authentication/authentication.component';
import { ConfirmEmailComponent } from './authentication/confirm-email/confirm-email.component';
import { ForgotPasswordComponent } from './authentication/forgot-password/forgot-password.component';
import { LockScreenComponent } from './authentication/lock-screen/lock-screen.component';
import { LogoutComponent } from './authentication/logout/logout.component';
import { NotAuthorizedComponent } from './authentication/not-authorized/not-authorized.component';
import { ResetPasswordComponent } from './authentication/reset-password/reset-password.component';
import { SignInComponent } from './authentication/sign-in/sign-in.component';
import { SignUpComponent } from './authentication/sign-up/sign-up.component';
import { ComingSoonComponent } from './coming-soon/coming-soon.component';
import { AccessPanelComponent } from './dashboard/access-panel/access-panel.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HomeDashboardComponent } from './dashboard/home/home-dashboard.component';
import { authGuard } from './guards/auth.guard';
import { NotFoundComponent } from './not-found/not-found.component';
import { V3UnifiedAuthService } from './services/v3-unified-auth.service';

const rootLandingGuard: CanActivateFn = () => {
  const v3Auth = inject(V3UnifiedAuthService);
  const router = inject(Router);
  if (!v3Auth.isAuthenticated()) {
    return router.createUrlTree(['/auth']);
  }
  return router.createUrlTree([v3Auth.resolvePostLoginRoute()]);
};

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [rootLandingGuard],
    component: AccessPanelComponent,
  },
  {
    path: 'access-panel',
    component: DashboardComponent,
    canActivate: [authGuard],
    children: [{ path: '', component: AccessPanelComponent }],
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
    children: [{ path: '', component: HomeDashboardComponent }],
  },
  {
    path: 'admin',
    component: DashboardComponent,
    canActivate: [authGuard],
    loadChildren: () =>
      import('./admin/admin.routes').then((m) => m.adminRoutes),
  },
  {
    path: 'settings',
    component: DashboardComponent,
    canActivate: [authGuard],
    loadChildren: () =>
      import('./settings/settings.routes').then((m) => m.settingsRoutes),
  },
  {
    path: 'academic',
    component: DashboardComponent,
    canActivate: [authGuard],
    loadChildren: () =>
      import('./academic/academic.routes').then((m) => m.academicRoutes),
  },
  {
    path: 'promotion',
    component: DashboardComponent,
    canActivate: [authGuard],
    loadChildren: () =>
      import('./promotion/promotion.routes').then((m) => m.promotionRoutes),
  },
  {
    path: 'elections',
    component: DashboardComponent,
    canActivate: [authGuard],
    loadChildren: () =>
      import('./elections/elections.routes').then((m) => m.electionsRoutes),
  },
  {
    path: 'teacher',
    component: DashboardComponent,
    canActivate: [authGuard],
    loadChildren: () =>
      import('./teacher/teacher.routes').then((m) => m.teacherRoutes),
  },
  {
    path: 'profile',
    component: DashboardComponent,
    canActivate: [authGuard],
    loadChildren: () =>
      import('./users/profile.routes').then((m) => m.profileRoutes.children),
  },
  {
    path: 'student',
    component: DashboardComponent,
    canActivate: [authGuard],
    loadChildren: () =>
      import('./students/student.routes').then((m) => m.studentRoutes.children),
  },
  {
    path: 'auth',
    component: AuthenticationComponent,
    children: [
      { path: '', component: SignInComponent },
      { path: 'sign-up', component: SignUpComponent },
      { path: 'forgot-password', component: ForgotPasswordComponent },
      { path: 'reset-password', component: ResetPasswordComponent },
      { path: 'reset-password/:token', component: ResetPasswordComponent },
      { path: 'confirm-email', component: ConfirmEmailComponent },
      { path: 'not-authorized', component: NotAuthorizedComponent },
      { path: 'lock-screen', component: LockScreenComponent },
      { path: 'logout', component: LogoutComponent },
    ],
  },
  { path: 'coming-soon', component: ComingSoonComponent },
  { path: '**', component: NotFoundComponent },
];
