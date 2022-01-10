import { ViewChild, AfterViewInit, ElementRef, OnInit, Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { NgxSpinnerService } from 'ngx-spinner';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';


import { jqxGridComponent } from 'jqwidgets-ng/jqxgrid';
import{ jqxDataTableComponent } from 'jqwidgets-ng/jqxdatatable';
import { jqxTabsComponent } from 'jqwidgets-ng/jqxtabs';

import { AccountingDocuments, CorrectionNotes } from './../../../models/accounting-model';
import { CurrencySys, Persons, TimeLimits, PaymentMethods, MeansPayment, OperationTypes, Resolutions } from './../../../models/general-model';
import { Sales } from './../../../models/reports-model';
import { Items, OtherTaxes } from './../../../models/products-model';
import { ErrorResponse, JsonResponse} from './../../../interfaces';

import { FormComponent } from './../../../core/components/forms/form.component';

// Services
import { ReportsService } from './../../../services/global/reports.service';
import { CurrencySysService } from './../../../services/general/index';
import { ApiServerService, MessagesService, SocketioService } from './../../../utils';
import { ItemsService } from './../../../services/products/index';

@Injectable()
export class CheckInPosBillComponent extends FormComponent implements OnInit, AfterViewInit {
  @ViewChild('customGrid', {static: false}) customGrid: jqxGridComponent;
  @ViewChild('referenceGrid', {static: false}) referenceGrid: jqxGridComponent;
  @ViewChild('myDataTable', { static: false } ) myDataTable: jqxDataTableComponent;
  @ViewChild('searchField') searchField: ElementRef;
  @ViewChild('searchsku') searchsku: ElementRef;
  @ViewChild('searchbarcode') searchbarcode: ElementRef;
  @ViewChild('cashele') cashele: ElementRef;
  @ViewChild('searchbar') searchbar: ElementRef;
  @ViewChild('myTabs', { static: false }) myTabs: jqxTabsComponent;
  @ViewChild('detailtTabs', { static: false }) detailtTabs: jqxTabsComponent; 

  title = 'Productos/Servicios';
  aDocuments: AccountingDocuments[]= [];
  correctionNotes: CorrectionNotes[]= [];
  customers: Persons[]= [];
  currency: CurrencySys[] = [];
	resolutions: Resolutions[] = [];
  items: Items[] = [];
  itemsResult: Items[] = [];
  itemsSelect: Items[] = [];
  itemSelect: Items;
  lines: Items[] = [];
  timeLimits: TimeLimits[] = [];
  paymentMethods: PaymentMethods[] = [];
  meansPayment: MeansPayment[] = [];
  operationTypes: OperationTypes[] = [];
  selectedRow = false;
  isCounted   = true;
  isNationalCurrency  = true;
  isAccountingNote    = false;
  isCreditNote        = false;
  isDocumentSupport   = false;
  cardsMode           = true;
  useCardsMode        = true;
  initLoad            = true;
  salesList           : Sales[] = [];
  saleSelect          : Sales;
  listOtherTaxes      : OtherTaxes[] = [];
  rowIndex              = -1;
  pathfile              = "";
  modal                 : NgbModalRef;
  editProdForm          : FormGroup;
  appUrl                : string    = '';

  source								: any = {};		
  source2								: any = {};		
  dataAdapter						: any;
  columns								: any[];

  theme 								= 'bootstrap';

  constructor(
    public fb: FormBuilder,
    public msg: MessagesService,
    public api: ApiServerService,
    public router: Router,
    public translate: TranslateService,
    public aRouter: ActivatedRoute,
    public spinner: NgxSpinnerService,
    public currSer: CurrencySysService,
    public reporstSer: ReportsService,
    public itemsSer: ItemsService,
    public modalService: NgbModal,
    public socket: SocketioService,
  ) {
    super(fb, msg, api, router, translate, aRouter, spinner);
  }

  ngOnInit(): void {
    super.ngOnInit();
    const ts    = this;
    ts.appUrl   = ts.api.getAppUrl();
    ts.initLoad = true;
  }
	
  ngAfterViewInit(): void {
		super.ngAfterViewInit();
		const ts  = this;
		if(ts.searchbar) {
			ts.searchbar.nativeElement.focus();
		}
		setTimeout(() => {
			ts.onRefresh();
		}, 500);
  }

  onChanegCustomer(e: number) {
    this.onSaveLocalStorage();
  }

  onClickItem(i: Items){
    const ts  = this;
    let line  = i;
    let grid  = ts.myDataTable;
		if(!grid){
			return false;
		}
    const stock = (line.stock) ? parseFloat(line.stock.toString()) : 0;
    const rows: Items[] = grid.getRows();
		ts.selectedRow	= true;
	
    /**
     * El producto no se puede vender sin inventario
     */
    if(line.class_id !== 2 && !line.selling_out_of_inventory && (line.stock)) {
      if(stock <= 0) {
        ts.msg.toastMessage('',`El producto ${line.product_name} no tiene STOCK`, 4);
        return false;
      }
    }

    if(rows.length > 0) {
      let index     = -1;
      const filter  =  rows.find((item, i) => {
        index = i;
        return (item.id === line.id);
      });
      if( filter) {
        let quantity = parseFloat(filter.quantity.toString()) + 1;
        /**
         * Control de inventario del producto.
         */
        if(line.class_id !== 2 && !line.selling_out_of_inventory) {
          if(quantity > stock) {
            ts.msg.toastMessage('',`La cantidad a vender supera el STOCK disponible del producto ${line.product_name}.`, 4);
            return false;
          }
        }
        grid.setCellValue(index, 'quantity', quantity);
        grid.clearSelection();
        grid.selectRow(index);
        ts.onLineTotal(filter, index);
				ts.rowIndex			= index;
      }else{
        line.discount = 0;
        line.total    = 0;
        line.quantity = 1;
        grid.addRow(null, line, 'last');
        grid.clearSelection();
        grid.selectRow(rows.length - 1);
        ts.onLineTotal(line, rows.length -1);
				ts.rowIndex			= rows.length - 1;
      }
    }else{
      line.discount = 0;
      line.total    = 0;
      line.quantity = 1;
      grid.addRow(null, line, 'last');
      grid.clearSelection();
      grid.selectRow(rows.length - 1);
			ts.rowIndex			= rows.length - 1;
      ts.onLineTotal(line, 0);
    }
		setTimeout(() => {
			// grid.autoresizecolumns();
		})
  }

  onRowSelect(event: any): void {
    this.selectedRow = true;
    this.rowIndex = event.args.index;
  };
  onRowUnselect(event: any): void {
    this.selectedRow = false;
    this.rowIndex = -1;
  };

  onCellEndEdit(e: any){
    if(e.args.dataField != "reason"){
      if(e.args.displayValue == ""){
        this.myDataTable.setCellValue(e.args.index, e.args.dataField, 0);
      }
      const row: Items = e.args.row;
      this.onLineTotal(row, e.args.index);
    }
  }

  onClearFilter(){
    const ts = this;
    ts.searchbar.nativeElement.value = '';

		if (ts.searchbarcode){
			ts.searchbarcode.nativeElement.value = '';
		}
		if (ts.searchsku){
			ts.searchsku.nativeElement.value = '';
		}

    ts.itemsResult = ts.items;
		if(ts.cardsMode) {
			ts.itemsResult	= [];
			ts.items				= [];
		}
    ts.searchbar.nativeElement.focus();
  }

  onRefresh(query: string = ''){
    const ts  = this;
		if(ts.initLoad) {
			if(localStorage.getItem('cardsMode')) {
				let cards       = JSON.parse(localStorage.getItem('cardsMode'));
				ts.cardsMode    = cards.cardsMode;
			}
			ts.onSearchProducts(query);
		}else{
			if(ts.searchbar) {
				if(ts.searchbar.nativeElement.value.length > 0) {
					ts.onSearchProducts(ts.searchbar.nativeElement.value, 1);
				}else{
					ts.onSearchProducts(query);
				}
			}else if(ts.searchsku) {
				if(ts.searchsku.nativeElement.value.length > 0) {
					ts.onSearchProducts(ts.searchsku.nativeElement.value, 2);
				}else{
					ts.onSearchProducts(query);
				}
			} else if (ts.searchbarcode){
				if(ts.searchbarcode.nativeElement.value.length > 0) {
					ts.onSearchProducts(ts.searchbarcode.nativeElement.value, 3);
				}else{
					ts.onSearchProducts(query);
				}
			}else {
				ts.onSearchProducts(query);
			}
		}
  }

  onSearchProducts(query: string = '', searchType: number = 1) {
    const ts  	= this;
		let params 	: any = {
			limit			: 60,
			start			: 0,
			search			: query,
			searchType	: searchType,
		};
		
		if(ts.useCardsMode){
			if(ts.cardsMode) {
				params.isDocumentSupport	= ts.isDocumentSupport;
				ts.onExecSearch(params);
			}else {
				ts.onExecSearch({});
			}
		}else{
			ts.onExecSearch(params);
		}
  }

	private onExecSearch(params: any = {}) {
		const ts  			= this;
		ts.itemsResult  = [];
		ts.itemsSelect  = [];
		ts.items  			= [];
		const lang    	= ts.translate;
		ts.showSpinner(lang.instant('messages.loading'));
		ts.itemsSer.getCheckin(params)
			.subscribe({
				next : (resp) => {
					// ts.items        = resp;
					if(ts.cardsMode) {
						ts.itemsResult  = resp;
					}else {
						ts.itemsSelect  = resp;
					}
					if(ts.initLoad){
						ts.initLoad = false;
						ts.onLoadLocalStorage();
					}
					if(resp.length === 1) {
						ts.onClickItem(resp[0]);
					}
					setTimeout(() => {
						if(ts.searchbar){
							ts.searchbar.nativeElement.focus();
						}
					}, 50);
					ts.hideSpinner();
					ts.msg.toastMessage('Resultados',`Se hallaron ${resp.length} resultados`);
				}, 
			error: (err: string) => {
				ts.hideSpinner();
				ts.msg.errorMessage('', err); 
			}});
	}

  onAdd() {
    const ts        = this;
    let grid        = ts.myDataTable;
    let row: Items  = grid.getSelection()[0];
    if( ts.rowIndex >= 0 && row){
      const quantity  = parseFloat(row.quantity.toString()) + 1;
      grid.setCellValue(ts.rowIndex, 'quantity', quantity);
      ts.onLineTotal(row, ts.rowIndex);
    }else{
      ts.msg.toastMessage('Seleccionar', 'Debe seleccionar una línea.', 4);
    }
  }

  onDelete() {
    const ts      = this;
    let grid      = ts.myDataTable;
    if( ts.rowIndex >= 0){
      if(ts.listOtherTaxes.length > 0) {
        const row         = grid.getSelection()[0] as Items;
        const otherTax    = ts.listOtherTaxes;
        ts.listOtherTaxes = [];
        otherTax.map((ele) => {
          if(ele.product_id !== row.id) {
            ts.listOtherTaxes.push(ele);
          }
        });
      }
      grid.deleteRow(ts.rowIndex);
      ts.msg.toastMessage('Quitar línea', 'Se ha quitado una línea de la venta.');
      ts.onSum();
    }
  }

  onMinus() {
    const ts        = this;
    let grid        = ts.myDataTable;
    let row: Items  = grid.getSelection()[0];
    if( ts.rowIndex < 0 && !row){
      ts.msg.toastMessage('Seleccionar', 'Debe seleccionar una línea.', 4);
      return
    }
    const quantity  = parseFloat(row.quantity.toString()) - 1;
    if(quantity <= 0){
      ts.msg.toastMessage('Quitar cantidad', 'No se puede dejar la cantidad en cero.', 3);
      return
    }
    grid.setCellValue(ts.rowIndex, 'quantity', quantity);
    ts.onLineTotal(row, ts.rowIndex);
  }

  onCancel(){
    this.onClearForm();
    this.onSum();
  }

  /**
   * Realiza la suma de una línea de la factura
   */
  onLineTotal(ele: Items, i: number) {
    const ts        = this;
    let grid        = ts.myDataTable;
    const tax       = parseFloat(ele.tax_sale_rate.toString());
    const discount  = parseFloat(ele.discount.toString());
    const unitCost  = parseFloat(ele.sale_price.toString());
    const quantity  = parseFloat(ele.quantity.toString());
    let total       = ( unitCost * quantity ) - discount;
    let tax_value   = total - (total / tax);
    /**
     * Cuando sea un servicio y el iva no está incluido en el precio de venta, se cambió a
		 * Cuendo el IVA no está includio en el precio de venta, se servicio o estarndar.
     */
    // if(!ele.vat_included && ele.class_id === 2) {
    if(!ele.vat_included) {
      if(tax > 1) {
        tax_value   = ( total * tax ) - total;
      }else if (tax < 1){
        tax_value   = total * tax ;
      }
      total       += tax_value;
    }

    tax_value = parseFloat(tax_value.toFixed(2));
    total     = parseFloat(total.toFixed(2));

    grid.setCellValue(i, 'total', total);
    grid.setCellValue(i, 'tax_amount', tax_value);

    let   io    = ts.socket.getSocket();
    // const token = ts.api.getToken();
    io.on('connect', () => {
      io.emit('sqlQuery', {
        sql : `CALL sp_product_other_taxes(${ele.id})` // Additional taxes
      },(err: any, result: any) => {
        if(!err) {
          const oTaxes = result[0] as OtherTaxes[];
          // Cuando el producto tienen impuestos adicionales
          if(oTaxes.length > 0) {
            oTaxes.map((tax) => {
              let listTax  = tax;
              // Aplica cuando el impuesto es un valor adicional, como el impuesto al consumo de bolsas plasticas
              if( parseFloat(listTax.additional_tax.toString()) > 0) {
                listTax.tax_value = quantity * parseFloat(listTax.additional_tax.toString());
              }else {
                const rate        = parseFloat(listTax.decimal_rate.toString());
                const lTotal      = total - tax_value;
                if(rate > 1) {
                  listTax.tax_value = (lTotal  * rate) - (lTotal);
                }else if(rate < 1){
                  listTax.tax_value = lTotal  * rate;
                }
              }

              listTax.tax_value     = parseFloat(listTax.tax_value.toFixed(2));

              if(ts.listOtherTaxes.length === 0) {
                ts.listOtherTaxes.push(listTax);
              }else{
                let itemTax = ts.listOtherTaxes.find(otherTax => otherTax.id === tax.id);
                if(itemTax) {
                  itemTax.tax_value = listTax.tax_value;
                }else{
                  ts.listOtherTaxes.push(listTax);
                }
              }
              ts.onSum();
            });
          }else{
            ts.onSum();
          }
        }
      });
    });

    io.on('connect_error', () => {
      ts.onSum();
		});

  }

  onSum(){
    const ts      = this;
    let grid      = ts.myDataTable;
    let subtotal  = 0;
    let total     = 0;
    let taxTotal  = 0;
    let otherTax  = 0;
    let taxValue  = 0;
    let discount  = 0;
    let frm       = ts.customForm;
    const rows: Items[] = grid.getRows();
    if(rows.length > 0){
      rows.map((ele, i) => {
        const subt= (ele.quantity * ele.sale_price);
        discount  += ele.discount;
        total     += ele.total;
        /**
         * Cuando el iva no está incluido en el precio de venta
         */
        taxValue  = ele.tax_amount;
        // if(!ele.vat_included && ele.class_id === 2) {
        if(!ele.vat_included) {
          subtotal  += subt;
        }else{
          subtotal  +=  (subt - taxValue);
        }
        taxTotal  += ele.tax_amount;
      });
    }

    ts.listOtherTaxes.map((ele) => {
      otherTax  += parseFloat(ele.tax_value.toString());
    });

    otherTax    = parseFloat(otherTax.toFixed(2));
    total       = parseFloat(total.toFixed(2));

    frm.get('discount').setValue(parseFloat(discount.toFixed(2)));
    frm.get('subtotal').setValue(parseFloat(subtotal.toFixed(2)));
    frm.get('vat').setValue(parseFloat(taxTotal.toFixed(2)));
    frm.get('other_tax').setValue(otherTax);
    frm.get('total').setValue(total + otherTax);
    frm.get('cash').setValue(total + otherTax);
    frm.get('payment_change').setValue(0);
    frm.get('payment_value').setValue(0);
    // console.log(ts.listOtherTaxes);
    ts.onSaveLocalStorage();
  }

  /**
   * Limpia la información local
   */
  onClearForm() {
    
  }

  onDate(e: any){
    this.AddDays();
  }

  onChaneCash(e:any){
    const ts  = this;
    let frm   = ts.customForm;
    let cashValue = parseFloat(frm.get('cash').value);
    let totlValue = parseFloat(frm.get('total').value);
    frm.get('payment_change').setValue(cashValue - totlValue);
  }

  onExpirationDate(e: any){
    console.log(e);
  }

  onPaymenMethods(e: number){
    const ts  = this;
    ts.isCounted = (e === 1);
    if(ts.isCounted) {
      ts.customForm.get('time_limit_id').setValue( ts.timeLimits[0].id );
      ts.AddDays();
    }
  }

  onTimeLimits(e: number) {
    const ts = this;
    ts.AddDays();
  }

  AddDays(){
    const ts  = this;
    let frm   = ts.customForm;
    let sDate = frm.get('invoice_date').value;
    let adate   = new Date(sDate);
    let select  = ts.timeLimits.find(ele => ele.id === frm.get('time_limit_id').value);
    if(select){
      let days  = select.months * select.term_value;
      adate.setDate(adate.getDate() + days);
      let dateStr = adate.toISOString().split('T')[0];
      frm.get('expiration_date').setValue(dateStr);
    }
    ts.onSaveLocalStorage();
  }
  /**
   * Busqueda documentos generados
   */
  onSearch() {
    // Implements
		const ts    = this;
    const frm   = ts.modalForm;
    const values= frm.getRawValue();
    ts.showSpinner();
    ts.customGrid.clear();
    ts.salesList  = [];
    if(values.invoice_type_id == 4 || values.invoice_type_id == 5) {
      ts.reporstSer.getNotes({
        initDate  : values.date_from,
        finalDate : values.date_up,
        typeId    : values.invoice_type_id,
      }).subscribe({
				next: (resp) => {
					ts.hideSpinner();
					ts.salesList  = resp;
					ts.source2.localdata = resp;
					ts.customGrid.updatebounddata('cells');
				},
				error: (err: string) => {
					ts.hideSpinner();
					ts.msg.errorMessage('',err);
				}
			});

    }else {
      ts.reporstSer.getSales({
        initDate  : values.date_from,
        finalDate : values.date_up,
        typeId    : values.invoice_type_id,
      }).subscribe({
				next: (resp) => {
					ts.hideSpinner();
					ts.salesList  = resp;
					ts.source2.localdata = resp;
					ts.customGrid.updatebounddata('cells');
				},
				error: (err: string) => {
					ts.hideSpinner();
					ts.msg.errorMessage('',err);
				}
			});
    }
  }
  /**
   * Genera informe de ventas
   */
  onReport(content: any, type: number = 1) {
    const ts    = this;
    const frm   = ts.modalForm;
    const values= frm.getRawValue();
    ts.showSpinner('Generando informe de ventas');
    ts.reporstSer.getSalesReport({
      initDate  : values.date_from,
      finalDate : values.date_up,
      typeId    : values.invoice_type_id,
      typeReport: type ?? 1, // Tamaño Carta = 1, Tamaños pos 80 mm 2
    }).subscribe({
			next: (resp) => {
				ts.hideSpinner();
				let path    = `${ts.api.getAppUrl()}${resp.pathFile}`;
				ts.pathfile = path;
				ts.onViewDocs(content);
			},
			error: (err) => {
				ts.hideSpinner();
				console.log(err);
			}
		});
  }

  getWidth() : any {
		return '100%';
  }

  cellClick(event: any, content: any): void
  {
    const ts    = this;
    const data  = event.args;
    const row: Sales  = this.customGrid.getrowdata(data.rowindex);
    if (data.datafield === '#pdf_#'){
      if( ( row.path_report  && row.status == 1 ) || ( row.path_report && !row.electronic ) ) {
        let path    = `${ts.api.getAppUrl()}${row.path_report}`;
        ts.pathfile = path;
        ts.onViewDocs(content);
      }else{
        ts.onGeneratePDF(row, content);
      }
    }else if (data.datafield === '#send_#'){
      ts.sendDocument(row, content);
    }else if (data.datafield === '#mail_#'){
      ts.showSpinner('Enviando correo al cliente...');
      if(row.invoice_type_id == 4 || row.invoice_type_id == 5) {
        ts.reporstSer.onSendMailNotes(row)
          .subscribe({
						next: ()=> {
							ts.hideSpinner();
							ts.onSearch();
						},
						error: (err: string) => {
							ts.hideSpinner();
							ts.msg.errorMessage('', err);
						}
					});
      }else{
        ts.reporstSer.onSendMail(row)
          .subscribe({
						next: ()=> {
							ts.hideSpinner();
							ts.onSearch();
						},
						error: (err: string) => {
							ts.hideSpinner();
							ts.msg.errorMessage('', err);
						}
					});
      }
    }else if(data.datafield === '#cancel_#') {
      ts.onCancelInvoice(row);
    }
  }

  onCellEdit(e: any, content: any, contentNotes: any) {
    // Implements
  }

  onSaveNotes(content: any) {
    // Implements
  }

  onSaveEditProd(content: any) {
    const ts      = this;
    const pname   = ts.editProdForm.get('product_name').value as string;
    if(ts.rowIndex >= 0 && pname.length > 0) {
      const oldName = ts.myDataTable.getCellValue(ts.rowIndex, 'product_name');
      if(pname !== oldName) {
        ts.myDataTable.setCellValue(ts.rowIndex, 'product_name', ts.editProdForm.get('product_name').value);
        ts.myDataTable.setCellValue(ts.rowIndex, 'edit_name', 1);
      }
    }
    this.modal.close();
  }

  onGeneratePDF(ele: Sales, content: any) {
		const ts  = this;
    ts.showSpinner('Generando archivo...');
    if(ele.invoice_type_id == 4 || ele.invoice_type_id == 5) {
      ts.reporstSer.onNote(ele)
        .subscribe({
					next: ( resp ) => {
						let path    = `${ts.api.getAppUrl()}${resp.pathFile}`;
						ts.pathfile = path;
						ts.hideSpinner();
						ts.onSearch();
						ts.onViewDocs(content);
					},
					error: (err: string) => {
						ts.hideSpinner();
						ts.msg.errorMessage('',err);
					}
				});
    }else {
      ts.reporstSer.onInvoice(ele)
        .subscribe({
					next: ( resp ) => {
						let path    = `${ts.api.getAppUrl()}${resp.pathFile}`;
						ts.pathfile = path;
						ts.hideSpinner();
						ts.onSearch();
						ts.onViewDocs(content);
					}, 
					error: (err: string) => {
						ts.hideSpinner();
						ts.msg.errorMessage('',err);
					}
			});
    }
  }

  onViewDocs(content: any){
    this.modal = this.modalService.open(content, {windowClass: 'fullscreen-modal', backdrop: false});
  }
  /** Envía el documento a la DIAN */
  sendDocument(ele: Sales, content : any){
    // Implements
  }

  /** Anula o activa una factura */
  onCancelInvoice(ele: Sales){
    const ts = this;
    const lang  = ts.translate;
		if(ts.useCardsMode){
			if(ele.invoice_type_id == 4 || ele.invoice_type_id == 5) {
				ts.msg.toastMessage('', 'No se puede anular una nota contable.',2);
				return false;
			}

			if(ele.electronic && ele.status != 1) {
				ts.msg.toastMessage('', 'No se puede anular un documento sin validación por la DIAN.',2);
				return false;
			}
		}

    if(ele.active == 1){
      Swal.fire({
        title : 'Anular factura',
        text  : '¿Seguro que desea anular el documento?',
        icon  : 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: lang.instant('buttons.yes'),
        cancelButtonText: lang.instant('buttons.not')
      }).then((result) => {
        if (result.value) {
          ts.showSpinner(lang.instant('messages.loading'));
          ts.api.post(`/sales/cancel/${ele.id}`)
          .subscribe({
						next: (resp: JsonResponse) => {
							ts.hideSpinner();
							ts.onSearch();
							ts.msg.toastMessage('', 'El documento se ha anulado.');
						}, 
						error: (err: string) => {
							ts.msg.errorMessage('', err);
						}
					});
        }
      });
    }else{
      Swal.fire({
        title : 'Activar factura anulada.',
        text  : '¿Seguro que desea activar el documento anulado?',
        icon  : 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: lang.instant('buttons.yes'),
        cancelButtonText: lang.instant('buttons.not')
      }).then((result) => {
        if (result.value) {
          ts.showSpinner(lang.instant('messages.loading'));
          ts.api.post(`/sales/activate/${ele.id}`)
          .subscribe({
						next: (resp: JsonResponse) => {
							ts.hideSpinner();
							ts.onSearch();
							ts.msg.toastMessage('', 'El documento se ha activado.');
						}, 
						error: (err: string) => {
							ts.msg.errorMessage('', err);
						}
					});
        }
      });
    }
  }

  onCreateProduct() {
    localStorage.setItem('oldRoute', this.router.url);
    this.goRoute('products/items/create');
  }

  onEditProduct() {
    localStorage.setItem('oldRoute', this.router.url);
    this.goRoute('products/items');
  }

  onCreateCustomer() {
    localStorage.setItem('oldRoute', this.router.url);
    this.goRoute('sales/customers/create');
  }

  onClose() {
    localStorage.setItem('oldRoute', this.router.url);
    this.goRoute('/dashboard');
  }

  onCurrencyChange(id: any): void{
    const ts  = this;
    const frm = ts.customForm;
    if(id){
      const curr  = ts.currency.find( currency => currency.id === id);
      const local = (curr.national_currency == 0) ? false : true;
      ts.isNationalCurrency = local;
      frm.get('exchange_rate').setValue(0);
      if (!local){
        ts.showSpinner('Cargando tasa de cambio');
        ts.currSer.getChangeLocal({ source: curr.CurrencyISO}).
            subscribe({
							next: (resp) => {
								ts.hideSpinner();
								frm.get('exchange_rate').setValue(resp[0].value);
							},
							error: ( Err: ErrorResponse) => {
								ts.hideSpinner();
								// ts.msg.errorMessage('', Err.error.message);
							}
						});
      }
      ts.onSaveLocalStorage();
    }
  }

	/**
	 * Se ejecuta cuando cambia el modo tarjetas
	 * @param e 
	 */
  onCardsModeChange(e: boolean) {
    const ts      = this;
    ts.cardsMode  = e;

    let param     = {
      cardsMode : e
    };
    localStorage.setItem('cardsMode', JSON.stringify(param));
		ts.onSearchProducts();
  }

  onChangeProducts(e: number) {
    const ts  = this;
    const it  = ts.itemsSelect.find(item => item.id == e);
    ts.itemSelect = it;
    ts.onAddSales();
  }

  onChangeInvoice(e: number) {
    const ts  = this;
    const ss  = ts.salesList.find(item => item.id == e);
    ts.saleSelect = ss;
  }

  onChageDocument(e: number) {
    const ts  = this;
    ts.onSaveLocalStorage();
  }

  onAddSales() {
    const ts  = this;
    if(ts.itemSelect) {
      ts.onClickItem(ts.itemSelect);
    }else{
      ts.msg.toastMessage('','Debe seleccionar un item.',3);
    }
  }

  onAddInvoice() {
   // Implements
  }

  /**
   * Guarda la información local del documento que se está generando
  */
  onSaveLocalStorage() {
    // Implements
  }

  /**
   * Carga la información guardada en el localStorage
   */
  onLoadLocalStorage() {
    // Implements
  }
}


