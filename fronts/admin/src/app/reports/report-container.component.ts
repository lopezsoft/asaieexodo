import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { TranslateService } from '@ngx-translate/core';
import { HttpServerService } from 'app/utils/http-server.service';

import { BaseComponent } from 'app/core/components/base/base.component';

@Component({
  selector: 'app-report-container',
  templateUrl: './report-container.component.html',
  styleUrls: ['./report-container.component.scss']
})
export class ReportContainerComponent extends BaseComponent implements OnInit {

  constructor(
    public _http: HttpServerService,
		public router: Router,
		public translate: TranslateService,
  ) {
    super(_http, router, translate);
  }

  ngOnInit(): void {
  }

}
