import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SettingsRoutingModule } from './settings-routing.module';
import { SettingsComponent } from '../settings/settings.component';
import { SettingsContainerComponent } from './settings-container.component';


@NgModule({
  declarations: [
    SettingsComponent,
    SettingsContainerComponent
  ],
  imports: [
    CommonModule,
    SettingsRoutingModule
  ]
})
export class SettingsModule { }
