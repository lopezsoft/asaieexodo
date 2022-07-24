import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PromotionRoutingModule } from './promotion-routing.module';
import { PromotionComponent } from '../promotion/promotion.component';
import { PromotionContainerComponent } from './promotion-container.component';


@NgModule({
  declarations: [
    PromotionComponent,
    PromotionContainerComponent
  ],
  imports: [
    CommonModule,
    PromotionRoutingModule
  ]
})
export class PromotionModule { }
