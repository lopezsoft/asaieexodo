import {RouterLink} from "@angular/router";
import {AsyncPipe, NgClass, NgIf} from "@angular/common";
import {TranslocoModule} from "@jsverse/transloco";
import {ReactiveFormsModule} from "@angular/forms";

export const SHARED_IMPORTS = [
  RouterLink,
  NgClass,
  NgIf,
  AsyncPipe,
  TranslocoModule,
  ReactiveFormsModule
];
