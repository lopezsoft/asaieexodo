import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import {
    UsersListComponent,
    UsersEditComponent,
    ProfileComponent,
} from "./index";
import { UsersContainerComponent } from "./users-container.component";
const routes: Routes = [
    {
        path: "",
        component: UsersContainerComponent,
    },
    {
        path: "list",
        component: UsersListComponent,
    },
    {
        path: "create",
        component: UsersEditComponent,
    },
    {
        path: "edit/:id",
        component: UsersEditComponent,
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
