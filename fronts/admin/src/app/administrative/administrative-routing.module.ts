import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { AdministrativeContainerComponent } from './administrative-container.component';
import { GroupDirectorsComponent } from './group-directors/group-directors.component';
import { HeadquartersComponent } from './headquarters/headquarters.component';
import { SchoolComponent } from './school/school.component';
import { TeachersComponent } from './teachers/teachers.component';

const routes: Routes = [
  {
    path: '',
    component: AdministrativeContainerComponent
  },
  {
    path: 'school',
    component: SchoolComponent
  },
  {
    path: 'headquarters',
    component: HeadquartersComponent
  },
  {
    path: 'managers',
    component: AdminComponent
  },
  {
    path: 'teachers',
    component: TeachersComponent
  },
  {
    path: 'directors',
    component: GroupDirectorsComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdministrativeRoutingModule { }
