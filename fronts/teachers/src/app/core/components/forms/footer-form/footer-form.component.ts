import { Component, EventEmitter, Output, Input } from '@angular/core';

@Component({
  selector: 'app-footer-form',
  templateUrl: './footer-form.component.html'
})
export class FooterFormComponent {

  @Output() saveAndCreateEvent = new EventEmitter<string>();
  @Output() saveAndCloseEvent = new EventEmitter<string>();
  @Output() closeEvent = new EventEmitter<string>();
  @Input() loading: false;
  @Input() saveAClose: false;
  @Input() saveACreate: false;
  @Input() showAaveACreate: true;
  @Input() maskSpinner: string = 'Procesando petición...';

  constructor(){
    this.showAaveACreate  = true;
  }

  cancelMessage() {
    this.closeEvent.emit()
  }

  saveAndCreateMessage() {
    this.saveAndCreateEvent.emit()
  }

  saveAndCloseMessage() {
    this.saveAndCloseEvent.emit()
  }

}
