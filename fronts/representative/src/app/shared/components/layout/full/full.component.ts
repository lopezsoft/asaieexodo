import { Component } from '@angular/core';
import { LayoutService } from '../../../../shared/services/layout/layout.service';

@Component({
  selector: 'app-full',
  templateUrl: './full.component.html',
  styleUrls: ['./full.component.scss']
})

export class FullComponent {
  constructor ( public layoutService: LayoutService ) {
    
  }
}
