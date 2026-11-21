import {AfterViewInit, Injectable, OnInit, ViewChild} from '@angular/core';
import Swal from 'sweetalert2';
// Services
// Base component
import { BaseComponent } from '../../components/base/base.component';
import {ColumnContract} from 'exodolibs/lib/components/grid/contracts';
import {ExodoGridComponent} from 'exodolibs';
import {GlobalService} from "../../common/global.service";
import {TranslateService} from "@ngx-translate/core";
@Injectable()
export class JqxCustomGridComponent extends BaseComponent implements OnInit, AfterViewInit {
	@ViewChild('exodoGrid', { static: false }) exodoGrid: ExodoGridComponent;
	public eColumns: ColumnContract[] = [
		{
			text: '#',
			dataIndex: '#',
			width: '16px',
			align: 'right',
			cellRender: (row, rowIndex, value, columnIndex): string => {
				return '<b>' + (rowIndex + 1).toString() + '</b>';
			}
		},
		{
			text: '',
			dataIndex: '#edit#',
			width: '16px',
			cellRender: (row: any, rowIndex, value, columnIndex): string => {
				return `<span class="span-button" title="Editar">
            <i class="fas fa-edit fa-cursor fas-fa-edit"></i>
          </span>`;
			},
			cellClick: (row: any, rowIndex, columnIndex): void => {
				this.editData(row);
			}
		},
		{
			text: '',
			dataIndex: '#delete#',
			width: '16px',
			cellRender: (row: any, rowIndex, value, columnIndex): string => {
				return `<span class="span-button" title="Eliminar">
            <i class="fas fa-trash-alt fa-cursor fas-fa-delete"></i>
          </span>`;
			},
			cellClick: (row: any, rowIndex, columnIndex): void => {
				this.deleteData(row);
			}
		}
	];

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
  columns: ColumnContract[]      = [];
  constructor(
	  public gService: GlobalService,
	  public translate: TranslateService,
  ) {
    super(gService);
	  this.translate.setDefaultLang(this.gService.activeLang);
	  this.translate.use(this.gService.activeLang);
  }

	public changeLanguage(lang: string): void {
		this.translate.use(lang);
		this.gService.changeLanguage(lang);
	}
	ngOnInit(): void {
		this.combineColumns();
	}
	combineColumns() {
		this.eColumns = [...this.eColumns, ...this.columns];
	}
	ngAfterViewInit(): void {
	  this.loadDataGrid();
	}

	loadDataGrid(params?: any): void {
		this.exodoGrid.gridService.proxy.api = {
			read: `${this.gService.http.getUrl()}${this.crudApi.read}`,
		};
		this.exodoGrid.gridService.onLoad(params);
	}
  editData(data: any): void {
    // Implements
    this.saveRoute();
  }
  deleteData(data: any): void {
    const ts    = this;
    const lang  = ts.gService.translate;
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
        ts.exodoGrid.gridService.isLoading = true;
        ts.gService.http.delete(`${ts.crudApi.delete}${data.uid || data.id}`)
        .subscribe({
					next: () => {
						ts.exodoGrid.gridService.isLoading = false;
						ts.exodoGrid.gridService.searchQuery();
					},
					error:  (err: string) => {
						ts.exodoGrid.gridService.isLoading = false;
						ts.gService.msg.errorMessage(lang.instant('general.error'), err);
					}
				});
      }
    });
  }

  createData(): void {
    // Implements
    this.saveRoute();
  }
  importData(): void {
    // Implements
    localStorage.setItem('oldRoute', this.gService.router.url);
  }

  onOtherButton(): void {
    // Implements
    localStorage.setItem('oldRoute', this.gService.router.url);
  }

  saveRoute(): void {
    localStorage.setItem('oldRoute', this.gService.router.url);
  }
  downloadFile(endPoint: string) {
    const ts = this;
    ts.gService.mask.showBlockUI('Descargando archivo.');
    ts.gService.http.get(endPoint)
      .subscribe({
				next: (resp: any) => {
			 	ts.gService.mask.hideBlockUI();
					ts.gService.http.openDocument(`${ts.gService.http.getAppUrl()}${resp.pathFile}`);
				},
				error: (err: string) => {
					ts.gService.mask.hideBlockUI();
					ts.gService.msg.errorMessage('Error al descargar el archivo.', err);
				}
			});
  }
}
