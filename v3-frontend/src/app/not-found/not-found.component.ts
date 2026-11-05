import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CustomizerSettingsService } from '../customizer-settings/customizer-settings.service';
import {TranslocoPipe} from "@jsverse/transloco";

@Component({
    selector: 'app-not-found',
  imports: [RouterLink, TranslocoPipe],
    templateUrl: './not-found.component.html',
    styleUrl: './not-found.component.scss'
})
export class NotFoundComponent {

    constructor(
        public themeService: CustomizerSettingsService
    ) {}

}
