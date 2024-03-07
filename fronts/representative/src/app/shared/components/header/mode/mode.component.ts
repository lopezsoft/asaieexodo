import { Component } from '@angular/core';
import { LayoutService } from '../../../../shared/services/layout/layout.service';

@Component({
  selector: 'app-mode',
  templateUrl: './mode.component.html',
  styleUrls: ['./mode.component.scss']
})

export class ModeComponent {
  public dark: boolean = this.layoutService.config.settings.layout_version === "dark-only" ? true : false;
  constructor(
    public layoutService: LayoutService) { }

  layoutToggle() {
    this.dark = !this.dark;
    if ((this.layoutService.config.settings.layout_version = "dark-only")) {
      document.body.classList.toggle("dark-only");
    }
    document.body.remove;
  }
}
