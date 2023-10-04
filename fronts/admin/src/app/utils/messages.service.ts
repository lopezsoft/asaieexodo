import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})

export class MessagesService {

  constructor(private toastr: ToastrService) {

  }

  toastMessage(title: string, msg: string, type: number = 0){
    switch (type) {
      case 2:
        this.toastr.info(msg, title, {positionClass: 'toast-bottom-right'});
        break;
      case 3:
        this.toastr.warning(msg, title, {positionClass: 'toast-bottom-right'});
        break;
      case 4:
        this.toastr.error(msg, title, {positionClass: 'toast-bottom-right'});
        break;
      default:
        this.toastr.success(msg, title, {positionClass: 'toast-bottom-right'});
        break;
    }
  }

  onMessageBuy() {
    Swal.fire({
        title: '<strong>Su cuenta se ha vencido</strong>',
        icon: 'info',
        html:
          '<b>Renovar cuenta</b>, ' +
          '<a href="https://matias.com.co/site/panes/">Comprar</a> ',
        focusConfirm: false,
        showConfirmButton: false,
    });
  }

  onMessage(title: string, msg: string) {
    Swal.fire((title.length > 1) ? title :  "ASAIE ÉXODO", msg, "info");
  }
  errorMessage(title: string, msg: string) {
    Swal.fire((title.length > 1) ? title :  "Error ASAIE ÉXODO", msg, "error");
  }

}
