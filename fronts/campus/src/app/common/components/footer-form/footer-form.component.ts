import { Component, EventEmitter, Output, Input } from '@angular/core';
import {TranslocoPipe} from "@jsverse/transloco";

@Component({
  selector: 'app-footer-form',
  imports: [
    TranslocoPipe
  ],
  templateUrl: './footer-form.component.html'
})
export class FooterFormComponent {
  // --- INPUTS ---
  @Input() disabled = false;           // Para deshabilitar si el formulario es inválido
  @Input() loading = false;            // Para mostrar el spinner
  @Input() showSaveAndCreate = true; // Para mostrar/ocultar el botón

  // --- OUTPUTS ---
  @Output() saveAndCreateEvent = new EventEmitter<void>();
  @Output() saveAndCloseEvent = new EventEmitter<void>();
  @Output() cancelEvent = new EventEmitter<void>();

  constructor(){
    this.showSaveAndCreate  = true;
  }

}
