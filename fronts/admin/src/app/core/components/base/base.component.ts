import { Injectable, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil, first } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { HttpServerService } from '../../../utils/http-server.service';
import { CoreConfigService } from '@core/services/config.service';
import { User } from 'app/auth/models';

@Injectable()
export class BaseComponent implements OnInit {
	public loading: boolean;
	public activeLang = 'es';
	maskSpinner = 'Realizando petición...';
	theme = 'bootstrap';
	public coreConfig: any;
	public currentUser: User;

	// Private
	private _unsubscribeAll: Subject<any>;

	constructor(
		public _http: HttpServerService,
		public router: Router,
		public translate: TranslateService,
		public coreConfigService?: CoreConfigService
	) {
		const ts = this;
		ts.translate.setDefaultLang(ts.activeLang);
		ts.translate.use(ts.activeLang);
		ts._unsubscribeAll = new Subject();
	}
	// tslint:disable-next-line: contextual-lifecycle
	ngOnInit(): void {
		const ts = this;
		// Subscribe to config changes
		if (ts.coreConfigService) {
			ts.coreConfigService.config.pipe(takeUntil(ts._unsubscribeAll)).subscribe(config => {
				ts.coreConfig = config;
			});
		}
		ts.changeLanguage(ts.activeLang);
	}

	public changeLanguage(lang: string): void {
		this.activeLang = lang;
		this.translate.use(lang);
	}

	removeLoading(): void {
		const
			ele = document.getElementById('nb-global-spinner');
		// Ocultando la animación
		if (ele) {
			ele.classList.remove('spinner');
		}
	}

	/**
	 * Redirigir a la ruta de inicio de la aplicación.
	 */

	goHome(): void {
		if (this._http.isAuthenticated()) {
			this.router.navigate(['/dashboard']);
		}
	}

	/**
	 * Redirigir a la ruta indicada.
	 * @name : Nombre de la ruta
	 */
	goRoute(name: string): void {
		if (this._http.isAuthenticated()) {
			this.router.navigate([`/${name}`]);
		}
	}

	activeLoading(): void {
		this.loading = true;
	}

	disabledLoading(): void {
		this.loading = false;
	}

	/**
		* On destroy
		*/
	ngOnDestroy(): void {
		// Unsubscribe from all subscriptions
		this._unsubscribeAll.next({});
		this._unsubscribeAll.complete();
	}

	getCurrentUser() {
		const ts = this;
		ts.currentUser = ts._http.getCurrentUser();
		return ts.currentUser;
	}

	upCurrentUser(data: User) {
		this._http.upCurrentUser(data);
	}

}
