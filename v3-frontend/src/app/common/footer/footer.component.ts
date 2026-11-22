import { Component } from '@angular/core';
import { environment } from '../../../environments/environment';
import { CustomizerSettingsService } from '../../customizer-settings/customizer-settings.service';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  readonly currentYear = new Date().getFullYear();
  readonly appVersion = environment.VERSION;

  constructor(public readonly themeService: CustomizerSettingsService) {}
}
