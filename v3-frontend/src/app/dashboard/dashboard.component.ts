import { NgClass } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from '../common/footer/footer.component';
import { HeaderComponent } from '../common/header/header.component';
import { ToggleService } from '../common/header/toggle.service';
import { SidebarComponent } from '../common/sidebar/sidebar.component';
import { CustomizerSettingsService } from '../customizer-settings/customizer-settings.service';

@Component({
  selector: 'app-dashboard',
  imports: [
    RouterOutlet,
    NgClass,
    HeaderComponent,
    SidebarComponent,
    FooterComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private readonly destroyRef = inject(DestroyRef);

  isSidebarToggled = false;
  isToggled = false;

  constructor(
    private readonly toggleService: ToggleService,
    public readonly themeService: CustomizerSettingsService,
  ) {
    this.toggleService.isSidebarToggled$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((isSidebarToggled) => {
        this.isSidebarToggled = isSidebarToggled;
      });
    this.themeService.isToggled$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((isToggled) => {
        this.isToggled = isToggled;
      });
  }

  closeSidebarOnBackdrop(): void {
    if (this.isSidebarToggled) {
      this.toggleService.toggle();
    }
  }
}
