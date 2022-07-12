import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PromotionContainerComponent } from './promotion-container.component';

const routes: Routes = [
  {
    path: '',
    component: PromotionContainerComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PromotionRoutingModule { }
