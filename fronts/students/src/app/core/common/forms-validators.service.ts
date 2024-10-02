import { Injectable } from '@angular/core';
import {FormGroup} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';
import {MessagesService} from '../../utils';

@Injectable({
  providedIn: 'root'
})
export class FormsValidatorsService {
  constructor(
      public translate: TranslateService,
      private msg: MessagesService,
  ) { }

  public validateForm(frm: FormGroup): boolean {
    const lang = this.translate;
    if (frm.invalid) {
      this.onValidateForm(frm);
      this.msg.toastMessage(lang.instant('titleMessages.emptyFields'), lang.instant('bodyMessages.emptyFields'), 4);
    }
    return !frm.invalid;
  }

  /**
   * Válida los controles de un formulario
   */
  private onValidateForm(form: FormGroup): void {
    Object.values(form.controls).forEach(ele => {
      ele.markAllAsTouched();
    });
  }

  /**
   * Válida si el contenido del campo de un objeto del formulario es inválido o incorrecto
   * @param controlName Nombre del campo o control del formulario
   * @returns Boolean
   */
  isInvalid(controlName: string, frm: FormGroup): boolean {
    if (!frm) {
      return false;
    }
    return frm.get(controlName).invalid && frm.get(controlName).touched;
  }

  isInvalidNumber(controlName: string, frm: FormGroup): boolean {
    if (!frm) {
      return false;
    }
    return (frm.get(controlName).value <= 0) ? true : false;
  }
}
