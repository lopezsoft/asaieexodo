import { Component, OnInit } from '@angular/core';
import { BaseComponent } from 'app/core/components/base/base.component';
import {GlobalService} from "../core/common/global.service";
import {UsersService} from "../services/users/users.service";

@Component({
  selector: 'app-users-container',
  templateUrl: './users-container.component.html',
  styleUrls: ['./users-container.component.scss']
})
export class UsersContainerComponent extends BaseComponent implements OnInit {
  constructor(
    public gService: GlobalService,
    public user: UsersService
  ) {
      super(gService);
  }
  ngOnInit(): void {
    this.user.getUserSchools();
  }
}

