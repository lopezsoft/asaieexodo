import { ApplicationConfig, provideZoneChangeDetection, isDevMode, InjectionToken, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { provideTransloco } from '@jsverse/transloco';
import { BlockUIModule } from "ng-block-ui";

// Interceptors y Loaders
import { authInterceptor } from "./interceptors/auth-interceptor";
import { errorInterceptor } from "./interceptors/error.interceptor";
import { TranslocoHttpLoader } from './transloco-loader';

// Injection Token
export const DEFAULT_LANGUAGE = new InjectionToken<string>('Default Language');

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(),

    // 1. Usa solo una vez la configuración de animaciones (la asíncrona es preferible)
    provideAnimationsAsync(),

    // 2. Provee HttpClient una sola vez con sus interceptores
    provideHttpClient(
      withInterceptors([authInterceptor, errorInterceptor])
    ),

    // 3. Configuración de librerías de terceros
    importProvidersFrom(BlockUIModule.forRoot()),

    // 4. Configuración de Transloco
    provideTransloco({
      config: {
        availableLangs: ['en', 'es'],
        defaultLang: 'es',
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
      },
      loader: TranslocoHttpLoader
    }),

    // 5. Providers personalizados
    { provide: DEFAULT_LANGUAGE, useValue: 'es' },
  ]
};
