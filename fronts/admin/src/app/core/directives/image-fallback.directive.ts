// src/app/shared/directives/image-fallback.directive.ts
import {
	Directive,
	ElementRef,
	HostListener,
	Renderer2,
	inject,
} from '@angular/core';
import {DEFAULT_FALLBACK_IMAGE_URL} from '../tokens/fallback-image.token';
// Ajusta la ruta según tu estructura si el token está en un lugar diferente

@Directive({
	selector: 'img[appImageFallback]',
})
export class ImageFallbackDirective {
	// @ts-ignore
	private hostElement = inject(ElementRef<HTMLImageElement>().nativeElement()) as any
	private renderer = inject(Renderer2);
	private fallbackUrl = inject(DEFAULT_FALLBACK_IMAGE_URL);

	@HostListener('error')
	onError(): void {
		const currentSrc = this.hostElement.src;

		// Solo aplicar el fallback si existe una URL de fallback
		// y si el src actual no es ya la URL de fallback (para evitar bucles).
		if (this.fallbackUrl && currentSrc !== this.fallbackUrl) {
			this.renderer.setAttribute(this.hostElement, 'src', this.fallbackUrl);
		}
	}
}
