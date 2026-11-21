import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { V3UnifiedAuthService } from '../../services/v3-unified-auth.service';

@Component({
  selector: 'app-logout',
  standalone: true,
  imports: [RouterLink, TranslocoModule],
  templateUrl: './logout.component.html',
  styleUrl: './logout.component.scss',
})
export class LogoutComponent implements OnInit {
  private readonly v3Auth = inject(V3UnifiedAuthService);

  ngOnInit(): void {
    this.v3Auth.logout(false);
  }
}
