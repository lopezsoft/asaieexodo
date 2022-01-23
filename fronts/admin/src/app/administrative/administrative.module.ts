import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdministrativeRoutingModule } from './administrative-routing.module';
import { AdministrativeComponent } from '../administrative/administrative.component';
import { AdministrativeContainerComponent } from './administrative-container.component';
import { SchoolComponent } from './school/school.component';
import { HeadquartersComponent } from './headquarters/headquarters.component';
import { TeachersComponent } from './teachers/teachers.component';
import { AdminComponent } from './admin/admin.component';
import { GroupDirectorsComponent } from './group-directors/group-directors.component';
import CoreAppModule from 'app/core/core-app.module';


@NgModule({
  declarations: [
    AdministrativeComponent,
    AdministrativeContainerComponent,
    SchoolComponent,
    HeadquartersComponent,
    TeachersComponent,
    AdminComponent,
    GroupDirectorsComponent
  ],
  imports: [
    CommonModule,
    CoreAppModule,
    AdministrativeRoutingModule
  ]
})
export class AdministrativeModule { }
