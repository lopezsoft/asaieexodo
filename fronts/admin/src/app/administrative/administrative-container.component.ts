import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { TranslateService } from '@ngx-translate/core';
import { HttpServerService } from 'app/utils';

import { BaseComponent } from 'app/core/components/base/base.component';

@Component({
  selector: 'app-administrative-container',
  templateUrl: './administrative-container.component.html',
  styleUrls: ['./administrative-container.component.scss']
})
export class AdministrativeContainerComponent extends BaseComponent implements OnInit {

  constructor(
    public _http: HttpServerService,
		public router: Router,
		public translate: TranslateService,
  ) {
    super(_http, router, translate);
  }

  ngOnInit(): void {
    super.ngOnInit();
  }
}
