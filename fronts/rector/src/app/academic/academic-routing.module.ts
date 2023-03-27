import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ACademicContainerComponent } from './academic-container.component';

const routes: Routes = [
  {
    path: '',
    component: ACademicContainerComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AcademicRoutingModule { }
