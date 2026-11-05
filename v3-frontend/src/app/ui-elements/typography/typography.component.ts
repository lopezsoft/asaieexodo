import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CustomTooltipDirective } from '../../shared/directives/custom-tooltip.directive';

@Component({
    selector: 'app-typography',
    imports: [RouterLink, CustomTooltipDirective],
    templateUrl: './typography.component.html',
    styleUrl: './typography.component.scss'
})
export class TypographyComponent {}
