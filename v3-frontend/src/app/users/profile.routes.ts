import {UserContainerComponent} from "./user-container.component";
import {ProfileComponent} from "./profile/profile.component";
import {ProfileChangeComponent} from "./profile-change/profile-change.component";
import {Routes} from "@angular/router";

export const profileRoutes = {
  path: '',
  children: [
    {
      path: '',
      component: UserContainerComponent
    },
    {
      path: 'user',
      component: ProfileComponent
    },
    {
      path: 'profile-change',
      component: ProfileChangeComponent
    }
  ]
};
