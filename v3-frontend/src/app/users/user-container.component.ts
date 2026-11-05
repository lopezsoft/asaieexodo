import {Component, inject} from '@angular/core';
import {UserActionsService} from "../services/common/user-actions.service";
import {UsersService} from "../services/users/users.service";

@Component({
  selector: 'app-user-container',
  imports: [],
  templateUrl: './user-container.component.html'
})
export class UserContainerComponent {
  protected uActionsService = inject(UserActionsService);
  protected user = inject(UsersService);
}
