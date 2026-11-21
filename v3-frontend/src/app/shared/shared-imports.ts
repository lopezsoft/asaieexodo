import { RouterLink } from '@angular/router';
import { AsyncPipe, NgClass, NgIf } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';
import { ReactiveFormsModule } from '@angular/forms';
import { V3SearchableSelectComponent } from './components/v3-searchable-select/v3-searchable-select.component';
import { CustomTooltipDirective } from './directives/custom-tooltip.directive';

export const SHARED_IMPORTS = [
  RouterLink,
  NgClass,
  NgIf,
  AsyncPipe,
  TranslocoModule,
  ReactiveFormsModule,
  CustomTooltipDirective,
  V3SearchableSelectComponent,
];
