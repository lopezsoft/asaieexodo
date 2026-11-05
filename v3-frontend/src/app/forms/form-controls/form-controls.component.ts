import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CustomTooltipDirective } from '../../shared/directives/custom-tooltip.directive';

@Component({
    selector: 'app-form-controls',
    imports: [RouterLink, CustomTooltipDirective],
    templateUrl: './form-controls.component.html',
    styleUrl: './form-controls.component.scss'
})
export class FormControlsComponent {}
