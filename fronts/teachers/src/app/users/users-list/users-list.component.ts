import { Component, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import {ExodoGridComponent} from 'exodolibs';

import {JqxCustomGridComponent} from "../../core";
// Services
import {GlobalService} from "../../core/common/global.service";
import {TranslateService} from "@ngx-translate/core";
import {UsersService} from "../../services/users/users.service";
import {Users} from "../../models/users-model";

@Component({
  	selector: 'app-users-list',
  	templateUrl: './users-list.component.html',
	styleUrls: ['./users-list.component.scss'],
})
export class UsersListComponent extends JqxCustomGridComponent implements OnInit, AfterViewInit {
	@ViewChild('exodoGrid', { static: false }) exodoGrid: ExodoGridComponent;
  title = 'Lista de usuarios';
	school_id = 0;
  constructor(
	  public gService: GlobalService,
	  public translate: TranslateService,
	  public user: UsersService,
  ) {
    super(gService, translate);
  }
  ngOnInit(): void {
		const	ts    = this;
    	ts.gService.changeLanguage(ts.gService.activeLang);
		this.columns  = [
			{
				text: '...',
				dataIndex: 'email_verified_at',
				cellRender: (row: Users): string => {
					if(row.email_verified_at) {
						return `<span title="Cuenta verificada"><i class="fas fa-check-double fas-fa-ok"></i></span>`;
					}
					return `<span title="Cuenta sin verificar, reenviar email"><i class="fas fa-paper-plane fas-fa-warning cursor"></i></span>`;
				},
				cellClick: (row: Users) => {
					if(!row.email_verified_at){
						this.user.resendEmail(row.id);
					}
				}
			},
			{
				text: 'Usuario',
				dataIndex: 'name',
				width: '50%',
			},
			{
				text: 'Correo',
				dataIndex: 'email',
				width: '50%',
			},
			{
				text: 'Avatar',
				dataIndex: 'avatar',
				width: '50%',
				cellRender: (row: Users): string => {
					const name  = row.first_name;
					const email = row.email || '@';
					const abre  = row.first_name;
					let avatar = `${row.avatar}`;
					if('false' === avatar || 'null' === avatar || 'undefined' === avatar || '' === avatar) {
						avatar = `assets/avatars/unknown.png`;
					}
					const html  = `<div class="d-flex align-items-center">
                <div class="avatar mr-1 ml-0 ${row.active ? 'bg-light-success' : 'bg-light-danger'}">
                    <div class="avatar-content"> <img
								      src=${avatar}
								      alt=${name}
								      width="32"
								      height="32"
								    /></div>
                </div>
                 <div class="cell-line-height">
                  <span class="font-weight-bold d-block text-nowrap font-small">${email}</span>
                  <span class="text-muted font-small-2"><b>${abre}</b></span>
                </div>
            </div>`;
					return html;
				}
			}
		];
		super.ngOnInit();
		ts.crudApi        = {
			create  : '/users/create',
			read    : '/school/users',
			update  : '/users/update/',
			delete  : '/users/delete/'
		};

		this.user.getUserSchools();
  }

  ngAfterViewInit(): void {
	  //
  }

  createData(): void {
    const ts    = this;
    super.createData();
    ts.goRoute('user/create');
  }

  editData(data: any): void {
    super.editData(data);
    this.goRoute(`user/edit/${data.id}/${this.school_id}`);
  }

	onChangeSchool(e) {
		this.school_id  = e;
	  this.loadDataGrid({
		  schoolId: e
	  })
	}
}
