import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { V3UnifiedAuthService } from '../services/v3-unified-auth.service';
import { CustomTooltipDirective } from '../shared/directives/custom-tooltip.directive';

@Component({
  selector: 'app-user-container',
  standalone: true,
  imports: [CommonModule, RouterLink, CustomTooltipDirective],
  templateUrl: './user-container.component.html',
})
export class UserContainerComponent {
  protected readonly v3Auth = inject(V3UnifiedAuthService);
}
