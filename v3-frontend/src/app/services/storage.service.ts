import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { DebugService } from './common/debug.service';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly debugService = inject(DebugService);
  private readonly isBrowser: boolean;

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  setItem<T>(key: string, value: T): void {
    if (!this.isBrowser) {
      return;
    }
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      this.debugService.error(
        'StorageService.setItem',
        'No fue posible persistir el valor en almacenamiento local',
        error,
      );
    }
  }

  getItem<T>(key: string): T | null {
    if (!this.isBrowser) {
      return null;
    }
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : null;
    } catch (error) {
      this.debugService.error(
        'StorageService.getItem',
        'No fue posible leer el valor del almacenamiento local',
        error,
      );
      return null;
    }
  }

  removeItem(key: string): void {
    if (!this.isBrowser) {
      return;
    }
    try {
      localStorage.removeItem(key);
    } catch (error) {
      this.debugService.error(
        'StorageService.removeItem',
        'No fue posible eliminar la clave del almacenamiento local',
        error,
      );
    }
  }
}
