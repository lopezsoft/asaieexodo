import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  importProvidersFrom,
  InjectionToken,
  isDevMode,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { provideTransloco } from '@jsverse/transloco';
import { BlockUIModule } from 'ng-block-ui';
import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth-interceptor';
import { errorInterceptor } from './interceptors/error.interceptor';
import { TranslocoHttpLoader } from './transloco-loader';

export const DEFAULT_LANGUAGE = new InjectionToken<string>('Default Language');

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    // HTML5 PathLocationStrategy para compatibilidad exacta con enlaces de correo (/auth/reset-password?token=... y /auth/confirm-email?token=...)
    provideRouter(routes),
    provideClientHydration(),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    importProvidersFrom(BlockUIModule.forRoot()),
    provideTransloco({
      config: {
        availableLangs: ['en', 'es'],
        defaultLang: 'es',
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
      },
      loader: TranslocoHttpLoader,
    }),
    { provide: DEFAULT_LANGUAGE, useValue: 'es' },
  ],
};
