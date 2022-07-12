import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportContainerComponent } from './report-container.component';

const routes: Routes = [
{
  path: '',
  component: ReportContainerComponent
}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsRoutingModule { }
