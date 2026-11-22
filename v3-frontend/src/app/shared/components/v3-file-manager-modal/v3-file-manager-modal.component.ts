import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  Output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { MessagesService } from '../../../services/messages.service';
import {
  CloudFileRecord,
  V3AdministrationService,
} from '../../../services/v3-administration.service';
import { CustomTooltipDirective } from '../../directives/custom-tooltip.directive';
import { V3ModalDialogComponent } from '../v3-modal-dialog/v3-modal-dialog.component';

/**
 * Gestor documental conectado a AWS S3 / cloud_files (reemplaza FilesView.js de ExtJS).
 */
@Component({
  selector: 'app-v3-file-manager-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    V3ModalDialogComponent,
    CustomTooltipDirective,
  ],
  template: `
    <app-v3-modal-dialog
      [open]="open"
      [heading]="heading"
      [subtitle]="'Almacenamiento seguro en la nube con aislamiento por institución'"
      icon="cloud_upload"
      size="lg"
      (closed)="closed.emit()"
    >
      @if (canUpload) {
        <div class="v3-form-panel">
          <div class="row g-3">
            <div class="col-12 col-md-6">
              <label class="form-label">Seleccionar archivo (PDF, imagen, Office)</label>
              <input
                type="file"
                class="form-control"
                (change)="onFileSelected($event)"
              />
            </div>
            <div class="col-12 col-md-6">
              <label class="form-label">Descripción del documento</label>
              <input
                type="text"
                class="form-control"
                [(ngModel)]="description"
                placeholder="Ej. Hoja de vida, acta o firma institucional"
              />
            </div>
            <div class="col-12 d-flex justify-content-end">
              <button
                type="button"
                class="btn btn-sm btn-primary"
                [disabled]="!selectedFile || uploading()"
                (click)="uploadFile()"
              >
                {{ uploading() ? 'Subiendo...' : 'Subir archivo' }}
              </button>
            </div>
          </div>
        </div>
      }

      @if (loading()) {
        <div class="text-center py-4">
          <div class="spinner-border spinner-border-sm text-primary"></div>
          <span class="ms-2 text-muted">Cargando documentos...</span>
        </div>
      } @else if (files().length === 0) {
        <div class="text-center py-4 text-muted border rounded">
          <i class="material-symbols-outlined fs-2">folder_open</i>
          <p class="mb-0 mt-1">No hay documentos cargados en esta categoría.</p>
        </div>
      } @else {
        <div class="table-responsive">
          <table class="table table-sm table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Archivo</th>
                <th>Descripción</th>
                <th class="text-end">Tamaño</th>
                <th class="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (file of files(); track file.id) {
                <tr>
                  <td class="fw-medium">{{ file.fileName }}</td>
                  <td class="text-muted small">{{ file.description || '—' }}</td>
                  <td class="text-end small">
                    {{ (file.sizeBytes / 1024).toFixed(1) }} KB
                  </td>
                  <td class="text-end text-nowrap">
                    <button
                      type="button"
                      class="btn btn-sm btn-outline-primary me-1"
                      (click)="downloadFile(file)"
                      [appCustomTooltip]="'Descargar archivo'"
                    >
                      <i class="material-symbols-outlined fs-6">download</i>
                    </button>
                    @if (canDelete) {
                      <button
                        type="button"
                        class="btn btn-sm btn-outline-danger"
                        (click)="deleteFile(file)"
                        [appCustomTooltip]="'Eliminar archivo'"
                      >
                        <i class="material-symbols-outlined fs-6">delete</i>
                      </button>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <div modal-footer>
        <button
          type="button"
          class="btn btn-sm btn-secondary"
          (click)="closed.emit()"
        >
          Cerrar
        </button>
      </div>
    </app-v3-modal-dialog>
  `,
})
export class V3FileManagerModalComponent implements OnChanges {
  private readonly adminService = inject(V3AdministrationService);
  private readonly messages = inject(MessagesService);

  @Input() open = false;
  @Input() heading = 'Documentos Digitales';
  @Input() category = 'GENERAL';
  @Input() canUpload = true;
  @Input() canDelete = true;
  @Output() readonly closed = new EventEmitter<void>();
  @Output() readonly fileUploaded = new EventEmitter<CloudFileRecord>();

  readonly files = signal<CloudFileRecord[]>([]);
  readonly loading = signal(false);
  readonly uploading = signal(false);

  selectedFile: File | null = null;
  description = '';

  ngOnChanges(): void {
    if (this.open) {
      this.loadFiles();
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    this.selectedFile = input?.files?.[0] ?? null;
  }

  loadFiles(): void {
    this.loading.set(true);
    this.adminService
      .listSchoolFiles(this.category)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (list) => this.files.set(list),
      });
  }

  uploadFile(): void {
    if (!this.selectedFile) {
      return;
    }
    this.uploading.set(true);
    this.adminService
      .uploadSchoolFileMultipart(
        this.selectedFile,
        this.category,
        this.description,
      )
      .pipe(finalize(() => this.uploading.set(false)))
      .subscribe({
        next: (created) => {
          this.messages.showSuccess('Documento cargado correctamente en AWS S3.');
          this.selectedFile = null;
          this.description = '';
          this.fileUploaded.emit(created);
          this.loadFiles();
        },
      });
  }

  downloadFile(file: CloudFileRecord): void {
    this.adminService.getFileDownloadUrl(file.id).subscribe({
      next: ({ downloadUrl }) => {
        window.open(downloadUrl, '_blank', 'noopener,noreferrer');
      },
    });
  }

  deleteFile(file: CloudFileRecord): void {
    this.adminService.deleteSchoolFile(file.id).subscribe({
      next: () => {
        this.messages.showSuccess('Documento eliminado.');
        this.loadFiles();
      },
    });
  }
}
