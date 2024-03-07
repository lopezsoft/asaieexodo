import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import {VotingComponent} from "./voting.component";

const routes: Routes = [
  {
    path: ":id/:schoolId/:uuid",
    component: VotingComponent,
    data: {
      title: "Elecciones",
      breadcrumb: "Elecciones",
    },
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VotingRoutingModule {}
