// src/app/services/load-mask.service.ts

import { Injectable, inject } from '@angular/core';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { TranslocoService } from '@jsverse/transloco';

@Injectable({
  providedIn: 'root'
})
export class LoadMaskService {
  // Obtiene la instancia principal de BlockUI
  @BlockUI() blockUI: NgBlockUI;

  // Inyecta el servicio de traducción
  private transloco = inject(TranslocoService);

  /**
   * Muestra el bloqueo de pantalla con un mensaje.
   * @param messageKey La clave de traducción para el mensaje.
   * Usa 'messages.loading' por defecto.
   */
  public show(messageKey: string = 'messages.loading'): void {
    const message = this.transloco.translate(messageKey);
    this.blockUI.start(message);
  }

  /**
   * Oculta el bloqueo de pantalla.
   */
  public hide(): void {
    this.blockUI.stop();
  }
}
