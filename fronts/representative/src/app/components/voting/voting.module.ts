import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {VotingComponent} from "./voting.component";
import {BrowserModule} from "@angular/platform-browser";
import {CountdownComponent} from "./count-down/count-down.component";
import {FormsModule} from "@angular/forms";

@NgModule({
  declarations: [
      VotingComponent,
    CountdownComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    FormsModule
  ]
})
export class VotingModule { }
