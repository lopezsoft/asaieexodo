import { Component, EventEmitter, Output, Input } from '@angular/core';

@Component({
  selector: 'app-custom-cards-footer',
  templateUrl: './custom-cards-footer.component.html',
  styleUrls: ['./custom-cards-footer.component.scss']
})
export class CustomCardsFooterComponent {

	@Output() onPageChange = new EventEmitter<number>();

	@Input() pageNum			: number  	= 1;
  @Input() total				: number   	= 0;
  @Input() maskSpinner	: string		= 'Procesando petición...';

  constructor() { }

	onPageChangeMessage(pageNumber: number): void {
		this.onPageChange.emit(pageNumber);
	}
}
