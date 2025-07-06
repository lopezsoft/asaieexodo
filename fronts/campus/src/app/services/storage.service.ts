// path: src/app/services/storage.service.ts

import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common'; // 👈 Importa la función

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  // 👇 Inyecta el token PLATFORM_ID para identificar el entorno
  private platformId = inject(PLATFORM_ID);

  // Una propiedad privada para saber si estamos en el navegador
  private readonly isBrowser: boolean;

  constructor() {
    // 👇 Determina si el código se está ejecutando en el navegador
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  setItem<T>(key: string, value: T): void {
    // Solo ejecuta si estamos en el navegador
    if (this.isBrowser) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        console.error('Error saving to localStorage', e);
      }
    }
  }

  getItem<T>(key: string): T | null {
    // Solo ejecuta si estamos en el navegador
    if (this.isBrowser) {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      } catch (e) {
        console.error('Error reading from localStorage', e);
        return null;
      }
    }
    // Si estamos en el servidor, retorna null inmediatamente
    return null;
  }

  removeItem(key: string): void {
    // Solo ejecuta si estamos en el navegador
    if (this.isBrowser) {
      localStorage.removeItem(key);
    }
  }
}
