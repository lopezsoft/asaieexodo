// src/app/services/language.service.ts
import { Injectable, inject, signal } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private translocoService = inject(TranslocoService);

  // Usa una señal para el idioma activo, inicializando con el default
  activeLang = signal<string>(this.translocoService.getActiveLang());

  constructor() {
    // Escucha cambios en el idioma y actualiza la señal
    this.translocoService.langChanges$.subscribe(lang => {
      this.activeLang.set(lang);
    });
  }

  changeLanguage(lang: string): void {
    this.translocoService.setActiveLang(lang);
  }
}
