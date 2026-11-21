import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthenticationComponent } from './authentication/authentication.component';
import { SignInComponent } from './authentication/sign-in/sign-in.component';
import { SignUpComponent } from './authentication/sign-up/sign-up.component';
import { ForgotPasswordComponent } from './authentication/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './authentication/reset-password/reset-password.component';
import { ConfirmEmailComponent } from './authentication/confirm-email/confirm-email.component';
import { LockScreenComponent } from './authentication/lock-screen/lock-screen.component';
import { LogoutComponent } from './authentication/logout/logout.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { ComingSoonComponent } from './coming-soon/coming-soon.component';
import {HomeDashboardComponent} from "./dashboard/home/home-dashboard.component";
import {authGuard} from "./guards/auth.guard";
import {ProfileComponent} from "./users/profile/profile.component";
import {UserContainerComponent} from "./users/user-container.component";
import {ProfileChangeComponent} from "./users/profile-change/profile-change.component";

export const routes: Routes = [
    {
        path: '',
        redirectTo: '/dashboard',
        pathMatch: 'full',
    },
    {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [authGuard],
        children: [
            {path: '', component: HomeDashboardComponent}
        ]
    },
    {
      path: 'profile',
      component: DashboardComponent,
      canActivate: [authGuard],
      loadChildren: () => import('./users/profile.routes').then(m => m.profileRoutes.children),
    },
    {
      path: 'student',
      component: DashboardComponent,
      canActivate: [authGuard],
      loadChildren: () => import('./students/student.routes').then(m => m.studentRoutes.children),
    },
    {
        path: 'auth',
        component: AuthenticationComponent,
        children: [
            {path: '', component: SignInComponent},
            {path: 'sign-up', component: SignUpComponent},
            {path: 'forgot-password', component: ForgotPasswordComponent},
            {path: 'reset-password/:token', component: ResetPasswordComponent},
            {path: 'confirm-email', component: ConfirmEmailComponent},
            {path: 'lock-screen', component: LockScreenComponent},
            {path: 'logout', component: LogoutComponent}
        ]
    },
    {path: 'coming-soon', component: ComingSoonComponent},
    // Here add new pages component

    {path: '**', component: NotFoundComponent} // This line will remain down from the whole pages component list
];
