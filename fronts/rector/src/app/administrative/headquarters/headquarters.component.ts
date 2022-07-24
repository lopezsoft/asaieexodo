import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CoreSidebarService } from '@core/components/core-sidebar/core-sidebar.service';
import { TranslateService } from '@ngx-translate/core';
import { CustomCardsComponent } from 'app/core/data/cards/custom-cards.component';
import { HttpServerService } from 'app/utils';
import { MessagesService } from 'app/utils/Messages.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-headquarters',
  templateUrl: './headquarters.component.html',
  styleUrls: ['./headquarters.component.scss'],
  // encapsulation: ViewEncapsulation.None,
  host: { class: 'ecommerce-application'}
})
export class HeadquartersComponent extends CustomCardsComponent implements OnInit {

  constructor(
    public msg: MessagesService,
    public _http: HttpServerService,
    public router: Router,
    public translate: TranslateService,
    public aRouter: ActivatedRoute,
    public _coreSidebarService: CoreSidebarService,
    public spinner?: NgxSpinnerService
  ) {
    super(msg, _http, router, translate, aRouter, _coreSidebarService, spinner);
  }


  ngOnInit(): void {
    super.ngOnInit();
    this.crudApi  = {
      create  : '',
      read    : '/admin/headquarters/index',
      update  : '',
      delete  : '/admin/headquarters/destroy/'
    };

    this.refreshCarsd();
  }

  

}
