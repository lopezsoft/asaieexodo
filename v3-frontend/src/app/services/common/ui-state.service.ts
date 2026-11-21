import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UiStateService {
  // 1. Define una señal privada que se puede modificar.
  private _isLoading = signal(false);

  // 2. Expone una versión pública de solo lectura de la señal.
  public readonly isLoading = this._isLoading.asReadonly();

  // 3. Crea métodos públicos para controlar los cambios de estado.
  showLoader(): void {
    this._isLoading.set(true);
  }

  hideLoader(): void {
    this._isLoading.set(false);
  }
}
