import {
  Directive,
  effect,
  inject,
  Input,
  signal,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { V3UnifiedAuthService } from '../../services/v3-unified-auth.service';

/**
 * Directiva estructural reactiva para mostrar/ocultar elementos de interfaz
 * según permisos atómicos RBAC efectivos del usuario autenticado.
 *
 * Uso:
 *   *appHasPermission="'admin.teachers.write'"
 *   *appHasPermission="['promotion.records.commission_edit', 'promotion.records.folios_edit']"
 */
@Directive({
  selector: '[appHasPermission]',
  standalone: true,
})
export class HasPermissionDirective {
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly auth = inject(V3UnifiedAuthService);

  private readonly requiredCodes = signal<readonly string[]>([]);
  private hasView = false;

  @Input()
  set appHasPermission(value: string | readonly string[]) {
    const normalized = Array.isArray(value) ? value : value ? [value] : [];
    this.requiredCodes.set(normalized);
  }

  constructor() {
    effect(() => {
      const codes = this.requiredCodes();
      const allowed = this.auth.hasAnyPermission(codes);
      if (allowed && !this.hasView) {
        this.viewContainer.createEmbeddedView(this.templateRef);
        this.hasView = true;
      } else if (!allowed && this.hasView) {
        this.viewContainer.clear();
        this.hasView = false;
      }
    });
  }
}
