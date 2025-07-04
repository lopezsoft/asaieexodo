import { Component, OnInit } from '@angular/core';
import {UsersService} from "../../../services/users/users.service";

@Component({
  selector: 'app-restricted-access',
  templateUrl: './restricted-access.component.html',
  styleUrls: ['./restricted-access.component.scss']
})
export class RestrictedAccessComponent implements OnInit {

  constructor(
    public user: UsersService,
  ) { }

  ngOnInit(): void {
  }

}
