import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import {
    ProfileComponent,
} from "./index";
import { UsersContainerComponent } from "./users-container.component";
const routes: Routes = [
    {
        path: "",
        component: UsersContainerComponent,
    },
    {
        path: "profile",
        component: ProfileComponent,
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class UsersRoutingModule {}
