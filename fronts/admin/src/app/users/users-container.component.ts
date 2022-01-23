import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BaseComponent } from 'app/core/components/base/base.component';
import { HttpServerService } from 'app/utils';

@Component({
  selector: 'app-users-container',
  templateUrl: './users-container.component.html',
  styleUrls: ['./users-container.component.scss']
})
export class UsersContainerComponent extends BaseComponent implements OnInit {

  constructor(
    public api: HttpServerService,
    public router: Router,
    public translate: TranslateService,
  ) {
      super(api, router, translate);
  }

  ngOnInit(): void {
  }

}
