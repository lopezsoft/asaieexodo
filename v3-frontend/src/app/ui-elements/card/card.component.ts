import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CustomTooltipDirective } from '../../shared/directives/custom-tooltip.directive';

@Component({
    selector: 'app-card',
    imports: [RouterLink, CustomTooltipDirective],
    templateUrl: './card.component.html',
    styleUrl: './card.component.scss'
})
export class CardComponent {}
