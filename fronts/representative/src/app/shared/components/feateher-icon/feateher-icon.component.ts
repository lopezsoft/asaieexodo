import { Component, Input } from '@angular/core';
import * as feather from 'feather-icons';

@Component({
  selector: 'app-feateher-icon',
  templateUrl: './feateher-icon.component.html',
  styleUrls: ['./feateher-icon.component.scss']
})
export class FeateherIconComponent {

  @Input() icon: string | undefined;
  @Input() class: string;

  ngOnInit() {
  }

  ngAfterViewInit() {
    feather.replace();
  }
}
