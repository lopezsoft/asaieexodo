import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import {
    ProfileComponent, TeachersProfileComponent, UsersEditComponent,
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
    },
    {
        path: 'teachers/profile',
        component: TeachersProfileComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class UsersRoutingModule {}
