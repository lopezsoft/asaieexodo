import { Component, ViewChild, AfterViewInit, ElementRef, OnInit, ViewEncapsulation } from '@angular/core';

// Services
import { HttpServerService, MessagesService } from './../../utils';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CustomCardsComponent } from 'app/core/data/cards/custom-cards.component';
import { CoreSidebarService } from '@core/components/core-sidebar/core-sidebar.service';
import { NgxSpinnerService } from 'ngx-spinner';


@Component({
  selector: "app-users-list",
  templateUrl: './users-list.component.html',
	encapsulation: ViewEncapsulation.None,
  host: { class: 'ecommerce-application' }
})
export class UsersListComponent extends CustomCardsComponent implements OnInit, AfterViewInit {

  @ViewChild('searchField') searchField: ElementRef;

  title = 'Lista de usuarios';

  constructor(public msg: MessagesService,
              public api: HttpServerService,
              public router: Router,
              public translate: TranslateService,
              public aRouter: ActivatedRoute,
							public _coreSidebarService: CoreSidebarService, 
							public _spinner: NgxSpinnerService,
		) {
    super(msg, api, router, translate, aRouter, _coreSidebarService, _spinner);
  }

  ngOnInit(): void {
		super.ngOnInit();
		const	ts    = this;
    ts.changeLanguage(this.activeLang);
		ts.crudApi        = {
			create  : '/users/create',
			read    : '/users/read',
			update  : '/users/update/',
			delete  : '/users/delete/'
		};
		ts.refreshCarsd();
  }

  ngAfterViewInit(): void {
    super.ngAfterViewInit();
  }

  createData(): void {
    const ts    = this;
    super.createData();
    ts.goRoute('users/create');
  }

  editData(data: any): void {
    super.editData(data);
    this.goRoute(`users/edit/${data.id}`);
  }
}
