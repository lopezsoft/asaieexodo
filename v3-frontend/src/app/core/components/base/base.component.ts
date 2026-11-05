import { Injectable, OnInit } from '@angular/core';
import { User } from 'app/auth/models';
import {GlobalService} from "../../common/global.service";
@Injectable()
export class BaseComponent implements OnInit {
	public currentUser: User;
	constructor(
		public gService: GlobalService
	) {
	}
	// tslint:disable-next-line: contextual-lifecycle
	ngOnInit(): void {
	}
	/**
	 * Redirigir a la ruta de inicio de la aplicación.
	 */
	goHome(): void {
		if (this.gService.http.isAuthenticated()) {
			this.gService.router.navigate(['/dashboard']);
		}
	}
	/**
	 * Redirigir a la ruta indicada.
	 * @name : Nombre de la ruta
	 */
	goRoute(name: string): void {
		if (this.gService.http.isAuthenticated()) {
			this.gService.router.navigate([`/${name}`]);
		}
	}
	getCurrentUser() {
		return this.gService.http.getCurrentUser();
	}
	upCurrentUser(data: User) {
		this.gService.http.upCurrentUser(data);
	}

}
