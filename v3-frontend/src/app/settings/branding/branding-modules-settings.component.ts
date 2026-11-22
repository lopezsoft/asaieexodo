import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { LoadMaskService } from '../../services/common/load-mask.service';
import { MessagesService } from '../../services/messages.service';
import {
  SchoolModuleRecord,
  V3SettingsService,
} from '../../services/v3-settings.service';
import { V3UnifiedAuthService } from '../../services/v3-unified-auth.service';
import { V3FileManagerModalComponent } from '../../shared/components/v3-file-manager-modal/v3-file-manager-modal.component';
import { CustomTooltipDirective } from '../../shared/directives/custom-tooltip.directive';

/**
 * Firmas, Encabezados, Configuración de Boletines, Carnés, Marcas de Agua y Módulos Extra
 * (reemplaza FirmasView, EncabezadoReportesView, ConfiguraBoletinView, Carnets, WatermarkView y ExtraModulesView).
 */
@Component({
  selector: 'app-branding-modules-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    V3FileManagerModalComponent,
    CustomTooltipDirective,
  ],
  template: `
    <div class="container-fluid py-3">
      <div class="breadcrumb-card mb-25 d-md-flex align-items-center justify-content-between">
        <div>
          <h5 class="mb-0 fw-bold">Firmas, Boletines, Marcas de Agua y Módulos</h5>
          <small class="text-muted">Personalización documental y módulos habilitados para la institución</small>
        </div>
        <div class="d-flex gap-2">
          <button
            type="button"
            class="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
            (click)="watermarksOpen.set(true)"
            [appCustomTooltip]="'Administrar marcas de agua y firmas escaneadas en AWS S3'"
          >
            <i class="material-symbols-outlined fs-6">branding_watermark</i>
            <span>Marcas de Agua / Firmas S3</span>
          </button>
          <a routerLink="/settings" class="btn btn-sm btn-outline-secondary">Volver</a>
        </div>
      </div>

      <div class="row g-4">
        <div class="col-lg-7">
          <div class="trezo-card bg-white border-radius p-4 shadow-sm">
            <h6 class="fw-semibold mb-3 text-primary">Firmas y Encabezados de Reportes</h6>
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label small fw-semibold">Nombre Rector(a)</label>
                <input type="text" class="form-control form-control-sm" [(ngModel)]="branding.directorName" />
              </div>
              <div class="col-md-6">
                <label class="form-label small fw-semibold">Documento Rector(a)</label>
                <input type="text" class="form-control form-control-sm" [(ngModel)]="branding.directorDocument" />
              </div>
              <div class="col-md-6">
                <label class="form-label small fw-semibold">Nombre Secretario(a)</label>
                <input type="text" class="form-control form-control-sm" [(ngModel)]="branding.secretaryName" />
              </div>
              <div class="col-md-6">
                <label class="form-label small fw-semibold">Documento Secretario(a)</label>
                <input type="text" class="form-control form-control-sm" [(ngModel)]="branding.secretaryDocument" />
              </div>
              <div class="col-md-6">
                <label class="form-label small fw-semibold">Encabezado línea 1</label>
                <input type="text" class="form-control form-control-sm" [(ngModel)]="branding.headerLine1" />
              </div>
              <div class="col-md-6">
                <label class="form-label small fw-semibold">Encabezado línea 2</label>
                <input type="text" class="form-control form-control-sm" [(ngModel)]="branding.headerLine2" />
              </div>
              <div class="col-12">
                <label class="form-label small fw-semibold">Pie de página</label>
                <textarea rows="2" class="form-control form-control-sm" [(ngModel)]="branding.footerText"></textarea>
              </div>
            </div>

            <hr class="my-4" />
            <h6 class="fw-semibold mb-3 text-primary">Configuración de Boletines ({{ v3Auth.academicYear() }})</h6>
            <div class="row g-3">
              <div class="col-12 col-md-6">
                <div class="v3-form-switch-box">
                  <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" id="signRector" [(ngModel)]="bulletinConfig.showRectorSignature" />
                    <label class="form-check-label" for="signRector">Firma Rector</label>
                  </div>
                </div>
              </div>
              <div class="col-12 col-md-6">
                <div class="v3-form-switch-box">
                  <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" id="signSec" [(ngModel)]="bulletinConfig.showSecretarySignature" />
                    <label class="form-check-label" for="signSec">Firma Secretaría</label>
                  </div>
                </div>
              </div>
              <div class="col-12 col-md-6">
                <div class="v3-form-switch-box">
                  <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" id="signHomeroom" [(ngModel)]="bulletinConfig.showHomeroomSignature" />
                    <label class="form-check-label" for="signHomeroom">Firma Dir. Grupo</label>
                  </div>
                </div>
              </div>
              <div class="col-12 col-md-6">
                <div class="v3-form-switch-box">
                  <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" id="showAvg" [(ngModel)]="bulletinConfig.showStudentAverage" />
                    <label class="form-check-label" for="showAvg">Mostrar promedio</label>
                  </div>
                </div>
              </div>
              <div class="col-12 col-md-6">
                <div class="v3-form-switch-box">
                  <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" id="showScale" [(ngModel)]="bulletinConfig.showNationalScale" />
                    <label class="form-check-label" for="showScale">Mostrar desempeño</label>
                  </div>
                </div>
              </div>
              <div class="col-12 col-md-6">
                <div class="v3-form-switch-box">
                  <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" id="showQr" [(ngModel)]="carnetConfig.enableQr" />
                    <label class="form-check-label" for="showQr">QR en Carnés</label>
                  </div>
                </div>
              </div>
            </div>

            @if (canAdmin()) {
              <div class="d-flex justify-content-end mt-4">
                <button type="button" class="btn btn-sm btn-primary" (click)="saveBrandingAndBulletin()">
                  Guardar configuración documental
                </button>
              </div>
            }
          </div>
        </div>

        <div class="col-lg-5">
          <div class="trezo-card bg-white border-radius p-4 shadow-sm h-100">
            <h6 class="fw-semibold mb-3 text-primary">Módulos Extra del Colegio</h6>
            <div class="list-group list-group-flush">
              @for (mod of modules(); track mod.systemModuleId) {
                <div class="list-group-item px-0 d-flex align-items-center justify-content-between">
                  <div>
                    <div class="fw-medium">{{ mod.moduleName }}</div>
                    <small class="text-muted"><code>{{ mod.tag }}</code></small>
                  </div>
                  <div class="form-check form-switch">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      [checked]="mod.isActive"
                      [disabled]="!canManageModules()"
                      (change)="toggleModule(mod, $event)"
                    />
                  </div>
                </div>
              } @empty {
                <p class="text-muted small mb-0">No hay módulos registrados.</p>
              }
            </div>
          </div>
        </div>
      </div>
    </div>

    <app-v3-file-manager-modal
      [open]="watermarksOpen()"
      heading="Marcas de Agua y Firmas Escaneadas (AWS S3)"
      category="INSTITUTIONAL_LOGOS"
      [canUpload]="canManageBrandFiles()"
      [canDelete]="canManageBrandFiles()"
      (closed)="watermarksOpen.set(false)"
    />
  `,
})
export class BrandingModulesSettingsComponent implements OnInit {
  protected readonly v3Auth = inject(V3UnifiedAuthService);
  private readonly settingsService = inject(V3SettingsService);
  private readonly maskService = inject(LoadMaskService);
  private readonly messages = inject(MessagesService);

  readonly modules = signal<SchoolModuleRecord[]>([]);
  readonly watermarksOpen = signal(false);

  readonly canAdmin = computed(() =>
    this.v3Auth.hasPermission('settings.branding.write'),
  );
  readonly canManageModules = computed(() =>
    this.v3Auth.hasPermission('settings.modules.manage'),
  );
  readonly canManageBrandFiles = computed(() =>
    this.v3Auth.hasPermission('storage.institutional_branding.write'),
  );

  branding = {
    directorName: '',
    directorDocument: '',
    secretaryName: '',
    secretaryDocument: '',
    headerLine1: '',
    headerLine2: '',
    footerText: '',
  };

  bulletinConfig = {
    showRectorSignature: true,
    showSecretarySignature: true,
    showHomeroomSignature: true,
    showStudentAverage: true,
    showNationalScale: true,
  };

  carnetConfig = {
    enableQr: true,
  };

  ngOnInit(): void {
    this.settingsService.getBrandingSettings().subscribe((b) => {
      this.branding = {
        directorName: b.directorName ?? '',
        directorDocument: b.directorDocument ?? '',
        secretaryName: b.secretaryName ?? '',
        secretaryDocument: b.secretaryDocument ?? '',
        headerLine1: b.headerLine1 ?? '',
        headerLine2: b.headerLine2 ?? '',
        footerText: b.footerText ?? '',
      };
      const carnet = b.settings['carnets'] as { enableQr?: boolean } | undefined;
      if (carnet && typeof carnet.enableQr === 'boolean') {
        this.carnetConfig.enableQr = carnet.enableQr;
      }
    });

    this.settingsService.listAcademicYears().subscribe((years) => {
      const current = years.find((y) => y.year === this.v3Auth.academicYear());
      if (current?.reportCardSettings) {
        this.bulletinConfig = {
          ...this.bulletinConfig,
          ...(current.reportCardSettings as Partial<typeof this.bulletinConfig>),
        };
      }
    });

    this.settingsService.listSchoolModules().subscribe((m) => this.modules.set(m));
  }

  saveBrandingAndBulletin(): void {
    this.maskService.show('messages.saving');
    this.settingsService
      .updateBrandingSettings({
        ...this.branding,
        settings: { carnets: this.carnetConfig },
      })
      .subscribe(() => {
        this.settingsService
          .upsertAcademicYear({
            year: this.v3Auth.academicYear(),
            reportCardSettings: this.bulletinConfig,
          })
          .pipe(finalize(() => this.maskService.hide()))
          .subscribe(() => {
            this.messages.showSuccess('Configuración documental y de boletines guardada.');
          });
      });
  }

  toggleModule(mod: SchoolModuleRecord, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.settingsService
      .toggleSchoolModule(mod.systemModuleId, checked)
      .subscribe(() => {
        this.messages.showSuccess(
          `Módulo "${mod.moduleName}" ${checked ? 'activado' : 'desactivado'}.`,
        );
        this.settingsService.listSchoolModules().subscribe((m) => this.modules.set(m));
      });
  }
}
