import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import CoreAppModule from '../core/core-app.module';
import { UiSwitchModule } from 'ngx-ui-switch';

import { UsersComponent } from './users.component';
import { UsersRoutingModule } from './users-routing.module';
import { UsersContainerComponent } from './users-container.component';
import {BlockUIModule} from "ng-block-ui";
import {
  UsersEditComponent,
  ProfileComponent,
  UsersListComponent,
    TeachersProfileComponent
} from "./index";


@NgModule({
  declarations: [
    UsersComponent,
    ProfileComponent,
    UsersContainerComponent,
    UsersListComponent,
    UsersEditComponent,
    TeachersProfileComponent
  ],
  imports: [
    CommonModule,
    UsersRoutingModule,
    CoreAppModule,
    BlockUIModule.forRoot(),
    UiSwitchModule
  ]
})
export class UsersModule { }
