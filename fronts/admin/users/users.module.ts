import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CoreModule } from './../core/core.module';

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
    CoreModule,
    UsersRoutingModule,
  ]
})
export class UsersModule { }
