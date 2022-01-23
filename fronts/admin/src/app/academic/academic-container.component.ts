import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BaseComponent } from 'app/core/components/base/base.component';
import { HttpServerService } from 'app/utils';

@Component({
  selector: 'app-academic-container',
  templateUrl: './academic-container.component.html',
  styleUrls: ['./academic-container.component.scss']
})
export class ACademicContainerComponent extends BaseComponent implements OnInit {

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
