import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NavService } from '../../../services/nav/nav.service';

interface languageList {
  language: string;
  code: string;
  type?: string;
  icon: string;
}

@Component({
  selector: 'app-language',
  templateUrl: './language.component.html',
  styleUrls: ['./language.component.scss']
})

export class LanguageComponent {
  public language: boolean = false;
  public languages: languageList[] = [{
    language: 'English',
    code: 'en',
    type: 'US',
    icon: 'us'
  },
  {
    language: 'Español',
    code: 'es',
    icon: 'es'
  },
  {
    language: 'Français',
    code: 'fr',
    icon: 'fr'
  },
  {
    language: 'Português',
    code: 'pt',
    type: 'BR',
    icon: 'pt'
  }]

  public selectedLanguage: languageList = {
    language: 'Español',
    code: 'es',
    type: 'ES',
    icon: 'es'
  }

  constructor(public navServices: NavService, public translateService: TranslateService) {
    this.changeLanguage(this.selectedLanguage);
  }

  changeLanguage(lang: languageList) {
    this.translateService.use(lang.code);
    this.selectedLanguage = lang;
  }

}
