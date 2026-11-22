import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  Output,
  signal,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { MessagesService } from '../../../services/messages.service';
import {
  CloudFileOwnerEntityType,
  CloudFileRecord,
  V3AdministrationService,
} from '../../../services/v3-administration.service';
import { CustomTooltipDirective } from '../../directives/custom-tooltip.directive';
import { V3ModalDialogComponent } from '../v3-modal-dialog/v3-modal-dialog.component';

const RECORD_SCOPED_OWNER_TYPES = new Set<CloudFileOwnerEntityType>([
  'TEACHER',
  'STUDENT',
  'FAMILY',
  'ADMINISTRATIVE_STAFF',
  'USER',
]);

const OWNER_ENTITY_LABELS: Readonly<Record<CloudFileOwnerEntityType, string>> = {
  TEACHER: 'Docente',
  STUDENT: 'Estudiante',
  FAMILY: 'Padre de Familia / Acudiente',
  ADMINISTRATIVE_STAFF: 'Administrativo',
  SCHOOL: 'Institución Educativa',
  USER: 'Cuenta de Usuario',
  VIRTUAL_ACTIVITY: 'Aula Virtual',
  OBSERVER: 'Observador',
  CRM: 'Comunicaciones',
};

/**
 * Gestor documental conectado a AWS S3 / cloud_files enlazado por registro propietario
 * (reemplaza FilesView.js de ExtJS con aislamiento estricto por registro e institución).
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
      [subtitle]="subtitle"
      icon="folder_shared"
      size="lg"
      (closed)="closed.emit()"
    >
      @if (ownerDisplayName || ownerEntityTypeLabel) {
        <div class="v3-form-panel v3-form-panel--info d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
          <div class="d-flex align-items-center gap-2">
            <i class="material-symbols-outlined text-primary fs-5">badge</i>
            <div>
              <div class="fw-semibold small">
                {{ ownerDisplayName || 'Expediente vinculado' }}
              </div>
              @if (ownerDocumentNumber) {
                <small class="text-muted font-monospace">Doc: {{ ownerDocumentNumber }}</small>
              }
            </div>
          </div>
          @if (ownerEntityTypeLabel) {
            <span class="badge rounded-pill text-bg-primary">{{ ownerEntityTypeLabel }}</span>
          }
        </div>
      }

      @if (requiresMissingOwnerId) {
        <div class="text-center py-4 text-muted border rounded">
          <i class="material-symbols-outlined fs-2">person_search</i>
          <p class="mb-0 mt-1">
            Selecciona un registro específico para consultar o cargar sus documentos digitales.
          </p>
        </div>
      } @else {
        @if (canUpload) {
          <div class="v3-form-panel">
            <div class="row g-3">
              <div class="col-12 col-md-6">
                <label class="form-label">Seleccionar archivo (PDF, imagen, Office)</label>
                <input
                  #fileInput
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
                  placeholder="Ej. Registro civil, hoja de vida, cédula o soporte"
                />
              </div>
              <div class="col-12 d-flex justify-content-end">
                <button
                  type="button"
                  class="btn btn-sm btn-primary d-inline-flex align-items-center gap-1"
                  [disabled]="!selectedFile || uploading()"
                  (click)="uploadFile()"
                >
                  <i class="material-symbols-outlined fs-6">cloud_upload</i>
                  <span>{{ uploading() ? 'Subiendo...' : 'Subir archivo' }}</span>
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
            <p class="mb-0 mt-1">
              {{
                ownerDisplayName
                  ? 'Este registro aún no tiene documentos digitales cargados.'
                  : 'No hay documentos cargados en esta categoría.'
              }}
            </p>
          </div>
        } @else {
          <div class="table-responsive">
            <table class="table table-sm table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>Archivo</th>
                  <th>Descripción</th>
                  <th class="text-nowrap">Fecha</th>
                  <th class="text-end">Tamaño</th>
                  <th class="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                @for (file of files(); track file.id) {
                  <tr>
                    <td class="fw-medium">
                      <div class="d-flex align-items-center gap-1">
                        <span>{{ file.fileName }}</span>
                        @if (file.extension) {
                          <span class="badge text-bg-light border text-uppercase">{{ file.extension }}</span>
                        }
                      </div>
                    </td>
                    <td class="text-muted small">{{ file.description || '—' }}</td>
                    <td class="text-muted small text-nowrap">
                      {{ file.createdAt | date: 'dd/MM/yyyy HH:mm' }}
                    </td>
                    <td class="text-end small text-nowrap">
                      {{ formatFileSize(file.sizeBytes) }}
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
  @ViewChild('fileInput') private fileInput?: ElementRef<HTMLInputElement>;

  private readonly adminService = inject(V3AdministrationService);
  private readonly messages = inject(MessagesService);

  @Input() open = false;
  @Input() heading = 'Documentos Digitales';
  @Input() subtitle =
    'Expediente digital almacenado en AWS S3 con aislamiento por registro e institución';
  @Input() category = 'GENERAL';
  @Input() ownerEntityType: CloudFileOwnerEntityType | null = null;
  @Input() ownerEntityId: number | string | null = null;
  @Input() ownerDisplayName: string | null = null;
  @Input() ownerDocumentNumber: string | null = null;
  @Input() canUpload = true;
  @Input() canDelete = true;
  @Output() readonly closed = new EventEmitter<void>();
  @Output() readonly fileUploaded = new EventEmitter<CloudFileRecord>();

  readonly files = signal<CloudFileRecord[]>([]);
  readonly loading = signal(false);
  readonly uploading = signal(false);

  selectedFile: File | null = null;
  description = '';

  get ownerEntityTypeLabel(): string | null {
    return this.ownerEntityType ? OWNER_ENTITY_LABELS[this.ownerEntityType] : null;
  }

  get requiresMissingOwnerId(): boolean {
    if (!this.ownerEntityType) {
      return false;
    }
    const requiresId = RECORD_SCOPED_OWNER_TYPES.has(this.ownerEntityType);
    const hasId =
      this.ownerEntityId !== null &&
      this.ownerEntityId !== undefined &&
      String(this.ownerEntityId).trim() !== '';
    return requiresId && !hasId;
  }

  ngOnChanges(changes: SimpleChanges): void {
    const contextChanged =
      Boolean(changes['open']) ||
      Boolean(changes['ownerEntityType']) ||
      Boolean(changes['ownerEntityId']) ||
      Boolean(changes['category']);

    if (!contextChanged) {
      return;
    }

    if (!this.open) {
      this.files.set([]);
      this.resetUploadForm();
      return;
    }

    // Limpiar listado previo para evitar mostrar archivos de otro registro mientras carga
    this.files.set([]);
    this.resetUploadForm();

    if (this.requiresMissingOwnerId) {
      return;
    }

    this.loadFiles();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    this.selectedFile = input?.files?.[0] ?? null;
  }

  loadFiles(): void {
    if (this.requiresMissingOwnerId) {
      this.files.set([]);
      return;
    }

    this.loading.set(true);
    const isPersonRecordScoped =
      this.ownerEntityType !== null &&
      RECORD_SCOPED_OWNER_TYPES.has(this.ownerEntityType);

    this.adminService
      .listSchoolFiles({
        // Para expedientes personales filtramos por (ownerEntityType, ownerEntityId) para unificar todo su expediente
        category: isPersonRecordScoped ? undefined : this.category,
        ownerEntityType: this.ownerEntityType,
        ownerEntityId: this.ownerEntityId,
      })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (list) => this.files.set(list),
      });
  }

  uploadFile(): void {
    if (!this.selectedFile || this.requiresMissingOwnerId) {
      return;
    }
    this.uploading.set(true);
    this.adminService
      .uploadSchoolFileMultipart(
        this.selectedFile,
        this.category,
        this.description,
        {
          ownerEntityType: this.ownerEntityType,
          ownerEntityId: this.ownerEntityId,
        },
      )
      .pipe(finalize(() => this.uploading.set(false)))
      .subscribe({
        next: (created) => {
          this.messages.showSuccess('Documento cargado correctamente en AWS S3.');
          this.resetUploadForm();
          this.fileUploaded.emit(created);
          this.loadFiles();
        },
      });
  }

  downloadFile(file: CloudFileRecord): void {
    this.adminService.getFileDownloadUrl(file.id).subscribe({
      next: ({ downloadUrl }) => {
        if (!downloadUrl) {
          this.messages.showError(
            'No fue posible generar el enlace seguro de descarga para este archivo.',
          );
          return;
        }
        window.open(downloadUrl, '_blank', 'noopener,noreferrer');
      },
    });
  }

  deleteFile(file: CloudFileRecord): void {
    void this.messages
      .confirmDelete(`¿Deseas eliminar el documento "${file.fileName}"?`)
      .then((res) => {
        if (!res.isConfirmed) {
          return;
        }
        this.adminService.deleteSchoolFile(file.id).subscribe({
          next: () => {
            this.messages.showSuccess('Documento eliminado.');
            this.loadFiles();
          },
        });
      });
  }

  formatFileSize(sizeBytes: number): string {
    if (sizeBytes >= 1024 * 1024) {
      return `${(sizeBytes / (1024 * 1024)).toFixed(2)} MB`;
    }
    return `${Math.max(0.1, sizeBytes / 1024).toFixed(1)} KB`;
  }

  private resetUploadForm(): void {
    this.selectedFile = null;
    this.description = '';
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }
}
