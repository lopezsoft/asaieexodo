import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { V3UnifiedAuthService } from '../../services/v3-unified-auth.service';

@Component({
  selector: 'app-confirm-email',
  standalone: true,
  imports: [RouterLink, TranslocoModule],
  templateUrl: './confirm-email.component.html',
  styleUrl: './confirm-email.component.scss',
})
export class ConfirmEmailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly v3Auth = inject(V3UnifiedAuthService);

  readonly status = signal<'loading' | 'success' | 'error'>('loading');
  readonly statusMessage = signal<string>(
    'Verificando tu enlace de confirmación de correo electrónico...',
  );

  ngOnInit(): void {
    const token = (this.route.snapshot.queryParamMap.get('token') ?? '').trim();
    if (!token) {
      this.status.set('error');
      this.statusMessage.set(
        'El enlace de confirmación no contiene un token válido.',
      );
      return;
    }

    this.v3Auth.confirmEmail(token).subscribe({
      next: () => {
        this.status.set('success');
        this.statusMessage.set(
          'Tu correo electrónico ha sido confirmado exitosamente en ASAIE ÉXODO.',
        );
      },
      error: () => {
        this.status.set('error');
        this.statusMessage.set(
          'El token de confirmación es inválido, ya fue utilizado o ha expirado.',
        );
      },
    });
  }
}
