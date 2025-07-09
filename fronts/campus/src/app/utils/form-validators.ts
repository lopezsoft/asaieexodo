// src/app/utils/form-validators.ts

import {AbstractControl, FormGroup, ValidationErrors, ValidatorFn} from '@angular/forms';


/**
 * Validador que comprueba si dos campos en un formulario coinciden.
 * @param controlName El nombre del control principal.
 * @param matchingControlName El nombre del control que debe coincidir.
 */
export function mustMatch(controlName: string, matchingControlName: string): ValidatorFn {
  return (formGroup: FormGroup): ValidationErrors | null => {
    const control = formGroup.controls[controlName];
    const matchingControl = formGroup.controls[matchingControlName];

    if (matchingControl.errors && !matchingControl.errors['mustMatch']) {
      // Si hay otros errores en el campo de confirmación, no hagas nada aquí.
      return null;
    }

    // Establece el error en el campo de confirmación si la validación falla.
    if (control.value !== matchingControl.value) {
      matchingControl.setErrors({ mustMatch: true });
      return { mustMatch: true };
    } else {
      matchingControl.setErrors(null);
      return null;
    }
  };
}

/**
 * Marca todos los controles de un formulario como "touched" para mostrar los errores.
 * @param form El FormGroup a marcar.
 */
export function markAllAsTouched(form: FormGroup): void {
  Object.values(form.controls).forEach(control => {
    control.markAsTouched();
    control.updateValueAndValidity(); // Asegura que se re-evalúe el estado
  });
}

/**
 * Verifica si un control específico es inválido y ha sido tocado.
 * @param controlName El nombre del control.
 * @param form El FormGroup al que pertenece.
 * @returns boolean
 */
export function isControlInvalid(form: FormGroup, controlName: string): boolean {
  const control = form.get(controlName);
  return !!control && control.invalid && control.touched;
}

/**
 * Validador que comprueba si un número es mayor que cero.
 * @param control El control del formulario a validar.
 * @returns Un objeto de error si el valor es <= 0, de lo contrario null.
 */
export function mustBeGreaterThanZero(control: AbstractControl): ValidationErrors | null {
  const value = control.value;

  // Si no hay valor o no es un número, no aplicamos esta validación
  if (value === null || value === '' || isNaN(value)) {
    return null;
  }

  // Retorna un objeto de error si la condición no se cumple
  return value > 0 ? null : { mustBeGreaterThanZero: true };
}
