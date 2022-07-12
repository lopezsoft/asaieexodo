import { ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { jqxGridComponent } from 'jqwidgets-ng/jqxgrid';
import { jqxMenuComponent } from 'jqwidgets-ng/jqxmenu';

import Swal from 'sweetalert2';

// Services
import { NgxSpinnerService } from 'ngx-spinner';
import { HttpServerService, MessagesService } from '../../../utils/index';

// Base component
import { BaseComponent } from '../../components/base/base.component';

export class JqxCustomGridComponent extends BaseComponent {

  public customGrid: jqxGridComponent;
  public searchField: ElementRef;
  public myMenu: jqxMenuComponent;

  public datafields: any[];
  public pagenum            =  0;
  public pagesize           = 10;
  public minChar            = 4;
  public queryUrl: string;
  public sourceId           = 'id';
  public sourceColumns      = [];
  public sourceColumnGroups = [];
  public showActions        = false;
  public showRowNumber      = false;
  private searchString      = '';
  public title              = 'Encabezado del grid';
  public useImport          = false;
  public useOtherButton     = false;
  public textOtherButton    = 'Texto del botón';
  public faOtherButton      = 'fa fa-upload mr-1 fas-fa-22';
  public active             = 1;
  public crudApi: {
    create: string,
    read: string,
    update: string,
    delete: string
  };

  source: any = {};
  dataAdapter: any;

  columngroups: any[] = [];

  columns: any[]      = [];
  localizationobj: any = {};
  editable = false;
  public showfilterrow  = false;

  constructor(public msg: MessagesService,
              public api: HttpServerService,
              public router: Router,
              public translate: TranslateService,
              public aRouter: ActivatedRoute,
              public spinner?: NgxSpinnerService) {
    super(api, router, translate);
    const ts  = this;
  }

  showSpinner(mask: string = ''): void {
    const ts = this;
		const lang	= ts.translate;
    if(ts.spinner) {
			if(mask.length > 0) {
				ts.maskSpinner  = mask;
			}else {
				ts.maskSpinner	= lang.instant('messages.loading');
			}
      ts.spinner.show(undefined,
        {
          type: 'ball-triangle-path',
          size: 'medium',
          bdColor: 'rgba(0, 0, 0, 0.8)',
          color: '#fff',
          fullScreen: true
        });
    }
  }

  hideSpinner(): void {
    if(this.spinner){
      this.spinner.hide();
    }
  }

  activeLoading() {
    super.activeLoading();
    this.showSpinner();
  }

  disabledLoading() {
    super.disabledLoading();
    this.hideSpinner();
  }

  onLocalization(): void {
    const ts  = this;

    ts.localizationobj.percentsymbol = '%';
    ts.localizationobj.currencysymbol = '$';
    ts.localizationobj.currencysymbolposition = 'anterior';
    ts.localizationobj.decimalseparator = '.';
    ts.localizationobj.thousandsseparator = ',';
    ts.localizationobj.pagergotopagestring = 'Ir a la pag';
    ts.localizationobj.pagershowrowsstring = 'Mostrar filas';
    ts.localizationobj.pagerrangestring = ' de ';
    ts.localizationobj.pagerpreviousbuttonstring = 'previo';
    ts.localizationobj.pagernextbuttonstring = 'siguiente';
    ts.localizationobj.groupsheaderstring = 'Arrastre una columna para que se agrupe por ella';
    ts.localizationobj.sortascendingstring = 'Ordenar Acs';
    ts.localizationobj.sortdescendingstring = 'Ordenar Des';
    ts.localizationobj.sortremovestring = 'Quitar orden';
    ts.localizationobj.groupbystring = 'Agrupar por esta columna';
    ts.localizationobj.groupremovestring = 'Quitar de grupos';
    ts.localizationobj.filterclearstring = 'Limpiar';
    ts.localizationobj.filterstring = 'Filtro';
    ts.localizationobj.filtershowrowstring = 'Mostrar filas donde';
    ts.localizationobj.filtershowrowdatestring = 'Mostrar filas donde fecha';
    ts.localizationobj.filterorconditionstring = 'O';
    ts.localizationobj.filterandconditionstring = 'Y';
    ts.localizationobj.filterselectallstring = '(Seleccionar Todo)';
    ts.localizationobj.filterchoosestring = 'Por favor seleccione:';
    ts.localizationobj.filterstringcomparisonoperators = ['vacio', 'no vacio', 'contenga', 'contenga(coicidir Mayusculas/Minusculas)',
'no contenga', 'no contenga(coincidir Mayusculas/Minusculas)', 'inicia con', 'inicia con(coicidir Mayusculas/Minusculas)',
'termina con', 'termina con(coicidir Mayusculas/Minusculas)', 'igual', 'igual(coicidir Mayusculas/Minusculas)', 'null', 'no null'
];
    ts.localizationobj.filternumericcomparisonoperators = ['=', '!=', '<', '<=', '>', '>=', 'null', 'no null'];
    ts.localizationobj.filterdatecomparisonoperators = ['=', '!=', '<', '<=', '>', '>=', 'null', 'no null'];
    ts.localizationobj.filterbooleancomparisonoperators = ['=', '!='];
    ts.localizationobj.validationstring = 'Valor no valido';
    ts.localizationobj.emptydatastring = 'No hay registros que mostrar';
    ts.localizationobj.filterselectstring = 'Seleccione un Filtro';
    ts.localizationobj.loadtext = 'Cargando...';
    ts.localizationobj.clearstring = 'Limpiar';
    ts.localizationobj.todaystring = 'hoy';

    const days = {
        // full day names
        names: ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'],
        // abbreviated day names
        namesAbbr: ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'],
        // shortest day names
        namesShort: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa']
    };
    ts.localizationobj.days = days;
    const months = {
        // full month names (13 months for lunar calendards -- 13th month should be "" if not lunar)
        names: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Augosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre', ''],
        // abbreviated month names
        namesAbbr: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic', '']
    };
    ts.localizationobj.months = months;
  }

  prepareMenu(): void {
    this.myMenu.setItemOpenDirection('Exports', 'right', 'down');
  }

  prepareGrid(): void {
			const ts  = this;
			setTimeout(() => {
				ts.source = {
					localdata : null,
					datatype: 'json',
					datafields: ts.datafields,
					pagenum: ts.pagenum,
					pagesize: ts.pagesize,
					root: 'records',
					cache: false,
					url: `${ts.api.getUrl()}${ts.crudApi.read}`,
					processdata: (data: any) => {
						data.limit    = data.recordendindex;
						data.start    = data.recordstartindex;
						data.page     = data.pagenum + 1;
						data.query    = ts.searchString;
					},
					beforeprocessing: (data: any) => {
						ts.source.totalrecords = data.total;
						if (ts.loading){
							ts.disabledLoading();
						}
					},
					id: `${ts.sourceId}`,
				};
	
				let aColumns = [];
	
				if (ts.showRowNumber){
					aColumns  = [
						{
							text: '#', sortable: false, filterable: false, editable: false, align: 'center',
							groupable: false, draggable: false, resizable: false,
							datafield: '', columntype: 'number', width: 50,
							cellsrenderer: (row: number, column: any, value: number): string => {
									return '<div style="margin: 4px; text-align: right">' + (value + 1) + '</div>';
							}
						},
					];
				}
	
				if (ts.showActions){
					ts.sourceColumnGroups.push({ text: 'Actions', align: 'center', name: 'Actions' });
					aColumns.push({
						columngroup: 'Actions',
						text: '', sortable: false, filterable: false, editable: false, align: 'center',
						groupable: false, draggable: false, resizable: false,
						datafield: '#edit_#', columntype: 'text', width: 32,
						cellsrenderer: (row: number, column: any, value: number): string => {
								return '<span><i class="fas fa-pen fas-fa-edit fa-cursor"></i></span>';
						},
					},
					{
						columngroup: 'Actions',
						text: '', sortable: false, filterable: false, editable: false, align: 'center',
						groupable: false, draggable: false, resizable: false,
						datafield: '#delete_#', columntype: 'text', width: 32,
						cellsrenderer: (row: number, column: any, value: number): string => {
								return '<span><i class="fas fa-trash-alt fas-fa-delete fa-cursor"></i></span>';
						},
					});
				}
	
				if (ts.sourceColumnGroups.length > 0){
	
					if (!ts.columngroups){
						ts.columngroups = [];
					}
	
					ts.sourceColumnGroups.map((data) => {
						ts.columngroups.push(data);
					});
				}
	
				if (ts.sourceColumns.length > 0){
					ts.sourceColumns.map((data) => {
						aColumns.push(data);
					});
				}
	
				ts.dataAdapter = new jqx.dataAdapter(ts.source, {
					beforeSend: (jqXHR: any): void => {
						const token = ts.api.getToken();
						const stringToken = `${token.token_type} ${token.access_token}`;
						jqXHR.setRequestHeader('Authorization', stringToken);
						ts.showSpinner();
					}
				});
	
				ts.columns  = aColumns;
				const settings = {
					// width: 850,
					source:  ts.dataAdapter,
					columnsresize: true,
					autoheight: true,
					sortable: true,
					filterable: true,
					showfilterrow: ts.showfilterrow,
					editable: ts.editable,
					enabletooltips: true,
					altrows: true,
					virtualmode: true,
					autoshowloadelement: true,
					pageable: true,
					// showfilterbar: true,
					pagesizeoptions: ['5', '10', '15', '20', '30', '50', '100'],
					selectionmode: 'multiplecellsadvanced',
					theme: 'bootstrap',
					rendergridrows: ts.rendergridrows,
					columns:  aColumns
				};
				ts.customGrid.createComponent(settings);
			}, 50);
  }

  clearFilter(): void {
    const ts  = this;
    if (ts.searchString.length > 0) {
      ts.searchField.nativeElement.value  = '';
      ts.searchField.nativeElement.focus();
      ts.searchString                     = '';
      ts.searchQuery();
    }
  }

  searchQuery(): void {
    this.customGrid.updatebounddata('cells');
    this.activeLoading();
  }

  inputKey(event: any): void {
    const ts  = this;
    if (!ts.loading) {
      ts.searchString  = ts.searchField.nativeElement.value;
      // if (ts.searchString.length >= ts.minChar ){
      if (event.keyCode === 13 ){
        ts.searchQuery();
      }else if (ts.searchString.length === 0){
        ts.searchQuery();
      }
    }
  }

  Bindingcomplete(event: any): void
  {
    const ts  = this;
    // ts.onLocalization();
    // ts.customGrid.localizestrings(ts.localizationobj);
    ts.disabledLoading();
  }

  rendergridrows = (params: any): any => {
    return params.data;
  }

  cellClick(event: any): void
  {
    const data = event.args;
    const row  = this.customGrid.getrowdata(data.rowindex);
    if (data.datafield === '#edit_#'){
      this.editData(row);

    }else if (data.datafield === '#delete_#'){
      this.deleteData(row);
    }
  }

  editData(data: any): void {
    // Implements
    this.saveRoute();
  }

  deleteData(data: any): void {
    const ts    = this;
    const lang  = ts.translate;
    // Implements
    Swal.fire({
      title : lang.instant('titleMessages.delete'),
      text  : lang.instant('bodyMessages.delete'),
      icon  : 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: lang.instant('buttons.yes'),
      cancelButtonText: lang.instant('buttons.not')
    }).then((result) => {
      if (result.value) {
        ts.customGrid.showloadelement();
        ts.api.delete(`${ts.crudApi.delete}${data.uid}`)
        .subscribe({
					next: () => {
						const selectedrowindex  = this.customGrid.getselectedrowindex();
						const rowscount         = this.customGrid.getdatainformation().rowscount;
						if (selectedrowindex >= 0 && selectedrowindex < parseFloat(rowscount)) {
								const id = this.customGrid.getrowid(selectedrowindex);
								this.customGrid.deleterow(id);
						}
						ts.customGrid.hideloadelement();
						ts.searchQuery();
					},
					error:  (err: string) => {
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
    this.customGrid.exportdata(fmt, this.title);
  }

  itemclick(event: any): void {
    const format  = event.args.innerText;
    const ts      = this;
    switch (format) {
      case this.translate.instant('export.excel'):
        ts.exportData('xls');
        break;
      case this.translate.instant('export.csv'):
        ts.exportData('csv');
        break;
      case this.translate.instant('export.xml'):
        ts.exportData('xml');
        break;
      case this.translate.instant('export.pdf'):
        ts.exportData('pdf');
        break;
      case this.translate.instant('export.json'):
        ts.exportData('json');
        break;
      case this.translate.instant('export.tsv'):
        ts.exportData('tsv');
        break;
      case this.translate.instant('export.html'):
        ts.exportData('html');
        break;
      case this.translate.instant('export.print'):
        ts.printData();
        break;
    }
  }

  printData(): void {
      const gridContent = this.customGrid.exportdata('html');
      const newWindow = window.open('', '', 'width=800, height=500');
      const document = newWindow.document.open();
      const pageContent =
              '<!DOCTYPE html>\n' +
              '<html>\n' +
              '<head>\n' +
              '<meta charset="utf-8" />\n' +
              '<title>' + this.title + '</title>\n' +
              '</head>\n' +
              '<body>\n' + gridContent + '\n</body>\n</html>';
      document.write(pageContent);
      document.close();
      newWindow.print();
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
    ts.api.get(endPoint)
      .subscribe({
				next: (resp: any) => {
					ts.hideSpinner();
					ts.api.openDocument(`${ts.api.getAppUrl()}/${resp.pathFile}`);
				},
				error: (err: string) => {
					ts.hideSpinner();
					ts.msg.errorMessage('Error al descargar el archivo.', err);
				}
			});
  }

  filter(event: any): void
  {
      // Do Something
      console.log(event.args);
      console.log(event);
  }

}
