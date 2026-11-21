import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { LoadMaskService } from '../../services/common/load-mask.service';
import { MessagesService } from '../../services/messages.service';
import { CloudFileRecord } from '../../services/v3-administration.service';
import {
  TeacherSelfProfile,
  V3PortalService,
} from '../../services/v3-portal.service';
import { V3FileManagerModalComponent } from '../../shared/components/v3-file-manager-modal/v3-file-manager-modal.component';
import { CustomTooltipDirective } from '../../shared/directives/custom-tooltip.directive';

/**
 * Perfil y Firma Digital del Docente (reemplaza PerfilDocenteView.js de asaie-teachers).
 */
@Component({
  selector: 'app-teacher-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    CustomTooltipDirective,
    V3FileManagerModalComponent,
  ],
  template: `
    <div class="container-fluid py-3">
      <div class="breadcrumb-card mb-25 d-md-flex align-items-center justify-content-between">
        <div>
          <h5 class="mb-0 fw-bold">Mi Perfil Docente y Firma Digital</h5>
          <small class="text-muted">Actualice sus datos de contacto y cargue su firma oficial para boletines y actas</small>
        </div>
        <ol class="breadcrumb list-unstyled mt-0 mb-0 p-0">
          <li class="breadcrumb-item d-inline-block position-relative">
            <a routerLink="/teacher" class="d-inline-block position-relative">Portal Docente</a>
          </li>
          <li class="breadcrumb-item d-inline-block position-relative">Mi Perfil</li>
        </ol>
      </div>

      @if (!profile()) {
        <div class="trezo-card bg-white border-radius p-4 shadow-sm">
          <div class="alert alert-warning mb-0 small">
            Su cuenta de usuario actual no está vinculada a una ficha docente en <code>teacher_profiles</code>.
            Puede gestionar su contraseña de acceso en <a routerLink="/profile" class="fw-semibold">Mi Cuenta</a>.
          </div>
        </div>
      } @else {
        <div class="row g-4">
          <div class="col-lg-8">
            <div class="trezo-card bg-white border-radius p-4 shadow-sm">
              <h6 class="fw-bold mb-3">Datos Personales del Docente</h6>
              <div class="row g-3">
                <div class="col-md-4">
                  <label class="form-label small fw-semibold">Número de Documento</label>
                  <input type="text" class="form-control form-control-sm" [value]="profile()!.documentNumber" disabled />
                </div>
                <div class="col-md-4">
                  <label class="form-label small fw-semibold">Primer Nombre *</label>
                  <input type="text" class="form-control form-control-sm" [(ngModel)]="form.firstName" />
                </div>
                <div class="col-md-4">
                  <label class="form-label small fw-semibold">Segundo Nombre</label>
                  <input type="text" class="form-control form-control-sm" [(ngModel)]="form.middleName" />
                </div>
                <div class="col-md-4">
                  <label class="form-label small fw-semibold">Primer Apellido *</label>
                  <input type="text" class="form-control form-control-sm" [(ngModel)]="form.lastName" />
                </div>
                <div class="col-md-4">
                  <label class="form-label small fw-semibold">Segundo Apellido</label>
                  <input type="text" class="form-control form-control-sm" [(ngModel)]="form.secondLastName" />
                </div>
                <div class="col-md-4">
                  <label class="form-label small fw-semibold">Teléfono / Celular</label>
                  <input type="text" class="form-control form-control-sm" [(ngModel)]="form.phone" />
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-semibold">Correo Electrónico</label>
                  <input type="email" class="form-control form-control-sm" [(ngModel)]="form.email" />
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-semibold">Dirección de Residencia</label>
                  <input type="text" class="form-control form-control-sm" [(ngModel)]="form.address" />
                </div>
              </div>

              <div class="mt-4 d-flex justify-content-between align-items-center">
                <a routerLink="/profile" class="btn btn-sm btn-outline-secondary">
                  Cambiar Contraseña de Acceso
                </a>
                <button
                  type="button"
                  class="btn btn-sm btn-primary"
                  [disabled]="!form.firstName.trim() || !form.lastName.trim()"
                  (click)="saveProfile()"
                >
                  <i class="material-symbols-outlined fs-6 align-middle me-1">save</i>
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>

          <div class="col-lg-4">
            <div class="trezo-card bg-white border-radius p-4 shadow-sm h-100 d-flex flex-column justify-content-between">
              <div>
                <h6 class="fw-bold mb-2">Firma Digital Institucional (AWS S3)</h6>
                <p class="small text-muted">
                  Esta firma se incrusta automáticamente en boletines, observadores y actas oficiales de dirección de grupo.
                </p>
                <div class="border rounded p-3 bg-light text-center mb-3">
                  @if (form.signatureUrl) {
                    <div class="small text-success fw-semibold mb-1">Firma vinculada correctamente</div>
                    <code class="small text-break">{{ form.signatureUrl }}</code>
                  } @else {
                    <i class="material-symbols-outlined fs-2 text-muted">draw</i>
                    <div class="small text-muted mt-1">Sin firma digital cargada</div>
                  }
                </div>
              </div>
              <button
                type="button"
                class="btn btn-sm btn-outline-primary w-100"
                (click)="signatureModalOpen.set(true)"
                [appCustomTooltip]="'Subir imagen PNG/JPG de firma digital a AWS S3'"
              >
                <i class="material-symbols-outlined fs-6 align-middle me-1">cloud_upload</i>
                Cargar / Cambiar Firma S3
              </button>
            </div>
          </div>
        </div>
      }

      <app-v3-file-manager-modal
        [open]="signatureModalOpen()"
        heading="Firma Digital del Docente (AWS S3)"
        category="INSTITUTIONAL_SIGNATURES"
        (closed)="signatureModalOpen.set(false)"
        (fileUploaded)="onSignatureUploaded($event)"
      />
    </div>
  `,
})
export class TeacherProfileComponent implements OnInit {
  private readonly portalService = inject(V3PortalService);
  private readonly messages = inject(MessagesService);
  private readonly loadMask = inject(LoadMaskService);

  readonly profile = signal<TeacherSelfProfile | null>(null);
  readonly signatureModalOpen = signal(false);

  form = {
    firstName: '',
    middleName: '',
    lastName: '',
    secondLastName: '',
    address: '',
    phone: '',
    email: '',
    signatureUrl: '',
  };

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loadMask.show('Cargando perfil docente...');
    this.portalService
      .getTeacherSelfProfile()
      .pipe(finalize(() => this.loadMask.hide()))
      .subscribe((p) => {
        this.profile.set(p);
        if (p) {
          this.form = {
            firstName: p.firstName,
            middleName: p.middleName ?? '',
            lastName: p.lastName,
            secondLastName: p.secondLastName ?? '',
            address: p.address ?? '',
            phone: p.phone ?? '',
            email: p.email ?? '',
            signatureUrl: p.signatureUrl ?? '',
          };
        }
      });
  }

  saveProfile(): void {
    this.loadMask.show('Actualizando perfil...');
    this.portalService
      .updateTeacherSelfProfile({
        firstName: this.form.firstName.trim(),
        middleName: this.form.middleName.trim() || null,
        lastName: this.form.lastName.trim(),
        secondLastName: this.form.secondLastName.trim() || null,
        address: this.form.address.trim() || null,
        phone: this.form.phone.trim() || null,
        email: this.form.email.trim() || null,
        signatureUrl: this.form.signatureUrl.trim() || null,
      })
      .pipe(finalize(() => this.loadMask.hide()))
      .subscribe((updated) => {
        this.profile.set(updated);
        this.messages.showSuccess('Perfil docente actualizado.');
      });
  }

  onSignatureUploaded(file: CloudFileRecord): void {
    this.form.signatureUrl = file.publicUrl || file.storageKey;
    this.signatureModalOpen.set(false);
    this.saveProfile();
  }
}
