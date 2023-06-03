import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import {
    ProfileComponent, UsersEditComponent,
    UsersListComponent,
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
    {
        path: "list",
        component: UsersListComponent,
    },
    {
        path: 'create',
        component: UsersEditComponent
    },
    {
        path: 'edit/:id/:schoolId',
        component: UsersEditComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class UsersRoutingModule {}
