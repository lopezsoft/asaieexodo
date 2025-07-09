// src/app/services/messages.service.ts

import {inject, Inject, Injectable} from '@angular/core';
import Swal, { SweetAlertOptions } from 'sweetalert2';
import {TranslocoService} from "@jsverse/transloco";

@Injectable({
  providedIn: 'root'
})
export class MessagesService {
  private translocoService = inject(TranslocoService);
  // Define la configuración base para todos los toasts
  private readonly toastConfig: SweetAlertOptions = {
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3500,
    timerProgressBar: true,
    didOpen: (toast) => {
      // Pausa el timer si el mouse está sobre el toast
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
  };

  // El título del toast se pasa directamente en la configuración
  showSuccess(message: string): void {
    Swal.fire({ ...this.toastConfig, icon: 'success', title: message });
  }

  showInfo(message: string): void {
    Swal.fire({ ...this.toastConfig, icon: 'info', title: message });
  }

  showWarning(message: string): void {
    Swal.fire({ ...this.toastConfig, icon: 'warning', title: message });
  }

  showError(message: string): void {
    Swal.fire({ ...this.toastConfig, icon: 'error', title: message });
  }

  // Los métodos para los modales grandes se mantienen igual
  showAlertInfo(title: string, message: string): void {
    const finalTitle = title && title.length > 1 ? title : "ASAIE ÉXODO";
    Swal.fire(finalTitle, message, "info");
  }

  showAlertError(title: string, message: string): void {
    const finalTitle = title && title.length > 1 ? title : "Error ASAIE ÉXODO";
    Swal.fire(finalTitle, message, "error");
  }

  showConfirm(param: { title?: string, message?: string } = {}) {
    return Swal.fire({
      title: param.title || "Confirmación",
      text: param. message || "¿Estás seguro?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: this.translocoService.translate('buttons.yes') ,
      cancelButtonText: this.translocoService.translate('buttons.no'),
    });
  }
}
