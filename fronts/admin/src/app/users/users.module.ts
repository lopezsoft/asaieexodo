import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import CoreAppModule from '../core/core-app.module';

import { UsersComponent } from './users.component';
import { UsersListComponent, UsersEditComponent} from './index';
import { UsersRoutingModule } from './users-routing.module';
import { ProfileComponent } from './profile/profile.component';
import { UsersContainerComponent } from './users-container.component';


@NgModule({
  declarations: [
    UsersComponent,
    UsersListComponent,
    UsersEditComponent,
    ProfileComponent,
    UsersContainerComponent,
  ],
  imports: [
    CommonModule,
    CoreAppModule,
    UsersRoutingModule,
  ]
})
export class UsersModule { }
