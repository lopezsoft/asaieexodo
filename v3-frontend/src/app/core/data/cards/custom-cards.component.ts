import { AfterViewInit, ElementRef, Injectable, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { JsonResponse } from '../../../interfaces/index';

import Swal from 'sweetalert2';

// Services
import { NgxSpinnerService } from 'ngx-spinner';
import { HttpServerService, MessagesService } from '../../../utils/index';
import { CoreSidebarService } from '@core/components/core-sidebar/core-sidebar.service';

// Base component
import { BaseComponent } from '../../components/base/base.component';

import NgxSpinner from './../../../core/NgxSpinner';

@Injectable()
export class CustomCardsComponent extends BaseComponent implements OnInit, AfterViewInit {


    @ViewChild('searchField') searchField: ElementRef;
    // public
    public contentHeader: object;
    public shopSidebarToggle = false;
    public shopSidebarReset = false;
    public gridViewRef = false;

    public pageNum = 1;
    public pageNumber = 1;
    public pageSize = 30;
    public total = 0;
    public totalPages = 1;
    public start = 0;
    public limit = 30;

    public minChar = 2;
    public queryUrl: string;
    private searchString = '';
    public appUrl: string
    public title = 'Titulo de la ventana';
    public useImport = false;
    public useOtherButton = false;
    public textOtherButton = 'Texto del botón';
    public faOtherButton = 'fa fa-upload mr-1 fas-fa-18';
    public active = 1;

    public crudApi: {
        create: string,
        read: string,
        update: string,
        delete: string
    };

    public records = [];

    editable = false;


    constructor(
        public msg: MessagesService,
        public _http: HttpServerService,
        public router: Router,
        public translate: TranslateService,
        public aRouter: ActivatedRoute,
        public _coreSidebarService: CoreSidebarService,
        public spinner?: NgxSpinnerService
    ) {
        super(_http, router, translate);
    }
    ngAfterViewInit(): void {
        const ts = this;
        if (ts.searchField) {
            ts.searchField.nativeElement.focus();
        }
    }

    ngOnInit(): void {
        super.ngOnInit();
        const ts = this;
        ts.appUrl = ts._http.getAppUrl();
    }

    showSpinner(mask: string = ''): void {
        const ts = this;
        const lang = ts.translate;
        if (mask.length > 0) {
            ts.maskSpinner = mask;
        } else {
            ts.maskSpinner = lang.instant('messages.loading');
        }
        NgxSpinner.show(ts.spinner);
    }

    hideSpinner(): void {
        NgxSpinner.hide(this.spinner);
    }

    activeLoading() {
        super.activeLoading();
        this.showSpinner();
    }

    disabledLoading() {
        super.disabledLoading();
        this.hideSpinner();
    }

    // Public Methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Toggle Sidebar
     *
     * @param name
     */
    toggleSidebar(name: string): void {
        this._coreSidebarService.getSidebarRegistry(name).toggleOpen();
    }

    /**
     * Update to List View
     */
    listView() {
        this.gridViewRef = false;
        this.setViewRef();
    }

    /**
       * Update to Grid View
     */
    gridView() {
        this.gridViewRef = true;
        this.setViewRef();
    }

    private setViewRef() {
        localStorage.setItem('gridViewRef', this.gridViewRef.toString());
    }

    clearFilter(): void {
        const ts = this;
        if (ts.searchString.length > 0) {
            ts.searchField.nativeElement.value = '';
            ts.searchField.nativeElement.focus();
            ts.searchString = '';
            ts.searchQuery('');
        }
    }

    searchQuery(query: string): void {
        const ts = this;
        if (!ts.loading) {
            if (query.length > 0 && query.length >= ts.minChar) {
                ts.records = [];
                ts.pageNum = 1;
                ts.totalPages = 1;
                ts.total = 1;
                ts.searchString = query;
                ts.activeLoading();
                ts.updateCards(query);
            } else if (query.length == 0) {
                ts.records = [];
                ts.pageNum = 1;
                ts.totalPages = 1;
                ts.total = 0;
                ts.searchString = '';
                ts.disabledLoading();
            }
        }
    }


    /**
     * Se ejecuta cuando el usuario cambia de página
     * @param pageNumber Número de la página
     */
    onPageChange(pageNumber: number): void {
        const ts = this;
        ts.pageNumber = pageNumber;
        ts.records = [];
        ts.updateCards(ts.searchString);
    }

    /**
     * Actualiza la vista de las tarjetas
     */
    private updateCards(query: string = ''): void {
        const ts = this;
        const lang = ts.translate;
        ts.showSpinner();
        ts._http.get(`${ts.crudApi.read}`, { start: ts.limit * (ts.pageNumber - 1), limit: ts.limit, query })
            .subscribe({
                next: (resp) => {
                    ts.hideSpinner();
                    ts.disabledLoading();
                    ts.total = resp.total;
                    ts.records = resp.records;
                    ts.totalPages = Math.ceil(resp.total / resp.records.length);
                    ts.onAfterUpdateCards();
                },
                error: (err: string) => {
                    ts.hideSpinner();
                    ts.disabledLoading();
                    ts.msg.errorMessage(lang.instant('general.error'), err);
                }
            });
    }

    refreshCarsd(reload = false): void {
        const ts    = this;
        if(ts.records.length > 0) {
            if(!reload) return;
        }
        ts.updateCards(this.searchString);
    }

    onAfterUpdateCards() {
        // implements
    }

    editData(data: any): void {
        // Implements
        this.saveRoute();
    }

    deleteData(data: any): void {
        const ts = this;
        const lang = ts.translate;
        // Implements
        Swal.fire({
            title: lang.instant('titleMessages.delete'),
            text: lang.instant('bodyMessages.delete'),
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: lang.instant('buttons.yes'),
            cancelButtonText: lang.instant('buttons.not')
        }).then((result) => {
            if (result.value) {
                ts.showSpinner();
                ts._http.delete(`${ts.crudApi.delete}${data.id}`)
                    .subscribe({
                        next: (resp: JsonResponse) => {
                            ts.refreshCarsd(true);
                        },
                        error: (err: string) => {
                            ts.hideSpinner();
                            ts.msg.errorMessage(lang.instant('general.error'), err);
                        }
                    });
            }
        });
    }

    get placeholderSearch(): string {
        return this.translate.instant('placeholder.search');
    }

    exportData(fmt: string): void {
        // Implements
    }

    createData(): void {
        // Implements
        this.saveRoute();
    }

    importData(): void {
        // Implements
        localStorage.setItem('oldRoute', this.router.url);
    }

    onOtherButton(): void {
        // Implements
        localStorage.setItem('oldRoute', this.router.url);
    }

    saveRoute(): void {
        localStorage.setItem('oldRoute', this.router.url);
    }

    downloadFile(endPoint: string) {
        const ts = this;
        ts.showSpinner('Descargando archivo.');
        ts._http.get(endPoint)
            .subscribe({
                next: (resp: any) => {
                    ts.hideSpinner();
                    ts._http.openDocument(`${ts._http.getAppUrl()}/${resp.pathFile}`);
                },
                error: (err: string) => {
                    ts.hideSpinner();
                    ts.msg.errorMessage('Error al descargar el archivo.', err);
                }
            });
    }

    filter(event: any): void {
        // Do Something
        console.log(event.args);
        console.log(event);
    }

}
