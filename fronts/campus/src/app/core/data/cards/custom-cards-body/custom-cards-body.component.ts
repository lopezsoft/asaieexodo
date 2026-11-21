import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-custom-cards-body',
  templateUrl: './custom-cards-body.component.html',
  styleUrls: ['./custom-cards-body.component.scss']
})
export class CustomCardsBodyComponent {
	
	@Output()	editData 		= new EventEmitter<any>();
	@Output()	deleteData 	= new EventEmitter<any>();

	@Input() gridViewRef: boolean = false;
	@Input() records		: any			= [];
	public dataRecord		: any;

  constructor() { }


	editDataMessage(data: any): void {
		this.editData.emit(data);
	}

	deleteDataMessage(data: any): void {
		this.deleteData.emit(data);
	}

}
