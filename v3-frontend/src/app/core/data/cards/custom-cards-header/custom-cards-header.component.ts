import { Component, EventEmitter, Output, Input, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-custom-cards-header',
    templateUrl: './custom-cards-header.component.html',
    styleUrls: ['./custom-cards-header.component.scss']
})
export class CustomCardsHeaderComponent implements AfterViewInit {

    @ViewChild('searchField') searchField: ElementRef;

    @Output() toggleSidebar = new EventEmitter<string>();
    @Output() createData = new EventEmitter<string>();
    @Output() onOtherButton = new EventEmitter<string>();
    @Output() importData = new EventEmitter<string>();
    @Output() searchQuery = new EventEmitter<string>();
    @Output() refreshCarsd = new EventEmitter<string>();

    @Output() gridView = new EventEmitter();
    @Output() listView = new EventEmitter();

    @Input() records = [];
    @Input() loading: boolean = false;
    @Input() total: number = 0;
    @Input() useImport: boolean = false;
    @Input() useOtherButton: boolean = false;
    @Input() gridViewRef: boolean = false;
    @Input() textOtherButton: string = 'Texto del botón';
    @Input() faOtherButton: string = 'fa fa-upload mr-1 fas-fa-18';

    /**
     *
     * @param translate : TranslateService
     */
    constructor(
        private translate: TranslateService,
    ) { }
    ngAfterViewInit(): void {
        const ts = this;
        if (ts.searchField) {
            ts.searchField.nativeElement.focus();
        }
    }

    toggleSidebarMessage(name: string): void {
        this.toggleSidebar.emit(name);
    }

    createDataMessage(): void {
        this.createData.emit();
    }

    onOtherButtonMessage(): void {
        this.onOtherButton.emit();
    }

    importDataMessage(): void {
        this.importData.emit();
    }

    gridViewMessage(): void {
        this.gridView.emit();
    }

    listViewMessage(): void {
        this.listView.emit();
    }

    searchQueryMessage(query: string): void {
        const ts = this;
        ts.searchQuery.emit(query);
        if (ts.searchField) {
            ts.searchField.nativeElement.focus();
        }
    }

    refreshCarsdMessage() {
        this.refreshCarsd.emit();
    }

    onFocusMessage(): void {
        console.log('onFocusMessage');
    }

    get placeholderSearch(): string {
        return this.translate.instant('placeholder.search');
    }

}
