import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AcademicRoutingModule } from './academic-routing.module';
import { AcademicComponent } from '../academic/academic.component';
import { ACademicContainerComponent } from './academic-container.component';


@NgModule({
  declarations: [
    AcademicComponent,
    ACademicContainerComponent
  ],
  imports: [
    CommonModule,
    AcademicRoutingModule
  ]
})
export class AcademicModule { }
