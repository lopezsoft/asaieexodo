// src/app/core/tokens/fallback-image.token.ts
import { InjectionToken } from '@angular/core';

export const DEFAULT_FALLBACK_IMAGE_URL = new InjectionToken<string>('DEFAULT_FALLBACK_IMAGE_URL', {
	providedIn: 'root',
	factory: () => '/assets/img/add-image.png'
});
