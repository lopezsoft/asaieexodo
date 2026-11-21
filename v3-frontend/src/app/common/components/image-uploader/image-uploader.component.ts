import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MessagesService} from "../../../services/messages.service";

@Component({
  selector: 'app-image-uploader',
  imports: [CommonModule],
  template: `
    <input type="file" class="form-control" (change)="onFileSelected($event)" accept="image/png, image/jpeg">
  `
})
export class ImageUploaderComponent {
  @Output() imageUploaded = new EventEmitter<{ base64: string, name: string }>();
  private msgService = inject(MessagesService);

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 512000) { // 512 KB
      this.msgService.showError('El archivo es muy grande (máx 512 KB).');
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.imageUploaded.emit({ base64: reader.result as string, name: file.name });
    };
    reader.onerror = () => {
      this.msgService.showError('No se pudo leer el archivo.');
    };
  }
}
