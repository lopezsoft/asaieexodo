import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CustomizerSettingsService } from '../../customizer-settings/customizer-settings.service';
import { V3UnifiedAuthService } from '../../services/v3-unified-auth.service';

@Component({
  selector: 'app-logout',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './logout.component.html',
  styleUrl: './logout.component.scss',
})
export class LogoutComponent implements OnInit {
  private readonly v3Auth = inject(V3UnifiedAuthService);

  constructor(public themeService: CustomizerSettingsService) {}

  ngOnInit(): void {
    this.v3Auth.logout(false);
  }
}
