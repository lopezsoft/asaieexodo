import { Injectable } from '@angular/core';
import {ToastrService} from 'ngx-toastr';
@Injectable({
  providedIn: 'root'
})
export class ErrorService {

  constructor(
    public toastr: ToastrService,
  ) { }

  showError(message: string, status: number): void {
    console.log('Error:', message, status);
    this.toastr.error(message, 'ASAIE ÉXODO', {positionClass: 'toast-bottom-full-width'});
  }
}
