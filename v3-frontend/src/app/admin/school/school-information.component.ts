import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { LoadMaskService } from '../../services/common/load-mask.service';
import { MessagesService } from '../../services/messages.service';
import {
  SchoolProfileRecord,
  V3AdministrationService,
} from '../../services/v3-administration.service';
import {
  CityCatalogItem,
  CountryCatalogItem,
  DepartmentCatalogItem,
  GlobalCatalogsBundle,
  V3CatalogsService,
} from '../../services/v3-catalogs.service';
import { V3UnifiedAuthService } from '../../services/v3-unified-auth.service';
import { V3FileManagerModalComponent } from '../../shared/components/v3-file-manager-modal/v3-file-manager-modal.component';
import {
  V3FormWizardComponent,
  V3WizardStep,
} from '../../shared/components/v3-form-wizard/v3-form-wizard.component';
import {
  SearchableSelectOption,
  V3SearchableSelectComponent,
} from '../../shared/components/v3-searchable-select/v3-searchable-select.component';
import { CustomTooltipDirective } from '../../shared/directives/custom-tooltip.directive';
import { isControlInvalid, markAllAsTouched } from '../../utils/form-validators';

/**
 * Datos del Plantel (reemplaza admin/forms/SchoolInformation.js de ExtJS).
 */
@Component({
  selector: 'app-school-information',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    CustomTooltipDirective,
    V3FileManagerModalComponent,
    V3FormWizardComponent,
    V3SearchableSelectComponent,
  ],
  template: `
    <div class="container-fluid py-3">
      <div class="breadcrumb-card mb-25 d-md-flex align-items-center justify-content-between">
        <div>
          <h5 class="mb-0 fw-bold">Datos del Plantel</h5>
          <small class="text-muted">Información institucional y oficial DANE / MEN</small>
        </div>
        <ol class="breadcrumb list-unstyled mt-0 mb-0 p-0">
          <li class="breadcrumb-item d-inline-block position-relative">
            <a routerLink="/admin" class="d-inline-block position-relative">Administrativo</a>
          </li>
          <li class="breadcrumb-item d-inline-block position-relative">Datos del Plantel</li>
        </ol>
      </div>

      <div class="trezo-card bg-white border-radius p-4 shadow-sm">
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-4 pb-3 border-bottom">
          <div>
            <h5 class="mb-0 fw-semibold">{{ schoolProfile()?.name || 'Institución Educativa' }}</h5>
            @if (schoolProfile(); as profile) {
              <small class="text-muted">
                Vigencia cuenta: <strong>{{ profile.subscriptionLockDate }}</strong>
              </small>
            }
          </div>
          <div class="d-flex gap-2">
            <button
              type="button"
              class="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
              (click)="openDocumentsModal.set(true)"
              [appCustomTooltip]="'Gestionar escudos, logos y documentos institucionales'"
            >
              <i class="material-symbols-outlined fs-6">cloud_upload</i>
              <span>Logos y Documentos</span>
            </button>
          </div>
        </div>

        <form [formGroup]="schoolForm" (ngSubmit)="saveSchool()">
          <app-v3-form-wizard
            [steps]="wizardSteps()"
            [(activeIndex)]="wizardStep"
            [allowFreeNavigation]="true"
            [allowSaveAnyStep]="canEditSchool()"
            [showFooter]="true"
            cancelRoute="/admin"
            cancelLabel="Volver"
            submitLabel="Guardar cambios"
            submitIcon="save"
            [submitDisabled]="schoolForm.invalid || !canEditSchool()"
            (submitted)="saveSchool()"
          >
            @if (wizardStep() === 0) {
              <div class="row g-3">
                <div class="col-12">
                  <label class="form-label">Nombre oficial del plantel *</label>
                  <input type="text" class="form-control" formControlName="name" />
                  @if (isControlInvalid(schoolForm, 'name')) {
                    <small class="v3-field-error">El nombre institucional es obligatorio.</small>
                  }
                </div>
                <div class="col-12 col-md-6">
                  <label class="form-label">Nombre corto</label>
                  <input type="text" class="form-control" formControlName="shortName" />
                </div>
                <div class="col-12 col-md-6">
                  <label class="form-label">Código DANE</label>
                  <input type="text" class="form-control" formControlName="daneCode" />
                </div>
                <div class="col-12 col-md-6">
                  <label class="form-label">NIT / Identificación Tributaria</label>
                  <input type="text" class="form-control" formControlName="taxId" />
                </div>
                <div class="col-12 col-md-6">
                  <label class="form-label">Calendario académico</label>
                  <app-v3-searchable-select
                    formControlName="calendarId"
                    [options]="academicCalendarOptions()"
                    [clearable]="true"
                    placeholder="Seleccione..."
                    searchPlaceholder="Buscar calendario..."
                  />
                </div>
                <div class="col-12 col-md-6">
                  <label class="form-label">Sector</label>
                  <app-v3-searchable-select
                    formControlName="sectorId"
                    [options]="schoolSectorOptions()"
                    [clearable]="true"
                    placeholder="Seleccione..."
                    searchPlaceholder="Buscar sector..."
                  />
                </div>
                <div class="col-12 col-md-6">
                  <label class="form-label">Tipo de establecimiento</label>
                  <app-v3-searchable-select
                    formControlName="institutionTypeId"
                    [options]="institutionTypeOptions()"
                    [clearable]="true"
                    placeholder="Seleccione..."
                    searchPlaceholder="Buscar tipo..."
                  />
                </div>
              </div>
            } @else if (wizardStep() === 1) {
              <div class="row g-3">
                <div class="col-12 col-md-6">
                  <label class="form-label">País</label>
                  <app-v3-searchable-select
                    formControlName="countryId"
                    [options]="countryOptions()"
                    placeholder="Seleccione país..."
                    searchPlaceholder="Buscar país..."
                    (selectionChange)="onCountryChanged()"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <label class="form-label">Departamento</label>
                  <app-v3-searchable-select
                    formControlName="departmentId"
                    [options]="departmentOptions()"
                    [clearable]="true"
                    placeholder="Seleccione..."
                    searchPlaceholder="Buscar departamento..."
                    (selectionChange)="onDepartmentChanged()"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <label class="form-label">Municipio / Ciudad</label>
                  <app-v3-searchable-select
                    formControlName="cityId"
                    [options]="cityOptions()"
                    [clearable]="true"
                    placeholder="Seleccione..."
                    searchPlaceholder="Buscar municipio o ciudad..."
                  />
                </div>
                <div class="col-12 col-md-6">
                  <label class="form-label">Dirección</label>
                  <input type="text" class="form-control" formControlName="address" />
                </div>
                <div class="col-12 col-md-6">
                  <label class="form-label">Barrio / Vereda</label>
                  <input type="text" class="form-control" formControlName="suburb" />
                </div>
                <div class="col-12 col-md-6">
                  <label class="form-label">Teléfonos</label>
                  <input type="text" class="form-control" formControlName="phones" />
                </div>
                <div class="col-12 col-md-6">
                  <label class="form-label">Correo institucional</label>
                  <input type="email" class="form-control" formControlName="email" />
                </div>
                <div class="col-12 col-md-6">
                  <label class="form-label">Sitio web</label>
                  <input type="text" class="form-control" formControlName="website" placeholder="https://..." />
                </div>
              </div>
            } @else {
              <div class="row g-3">
                <div class="col-12 col-md-6">
                  <label class="form-label">Rector(a) / Director(a)</label>
                  <input type="text" class="form-control" formControlName="directorName" />
                </div>
                <div class="col-12 col-md-6">
                  <label class="form-label">Documento rector</label>
                  <input type="text" class="form-control" formControlName="directorDocument" />
                </div>
                <div class="col-12 col-md-6">
                  <label class="form-label">Secretario(a) académico(a)</label>
                  <input type="text" class="form-control" formControlName="secretaryName" />
                </div>
                <div class="col-12 col-md-6">
                  <label class="form-label">Documento secretaría</label>
                  <input type="text" class="form-control" formControlName="secretaryDocument" />
                </div>
                <div class="col-12 col-md-6">
                  <label class="form-label">Línea 1 de encabezado de informes</label>
                  <input type="text" class="form-control" formControlName="headerLine1" />
                </div>
                <div class="col-12 col-md-6">
                  <label class="form-label">Línea 2 de encabezado de informes</label>
                  <input type="text" class="form-control" formControlName="headerLine2" />
                </div>
                <div class="col-12 col-md-6">
                  <label class="form-label">Resolución de aprobación</label>
                  <textarea rows="3" class="form-control" formControlName="resolutionText"></textarea>
                </div>
                <div class="col-12 col-md-6">
                  <label class="form-label">Pie de página institucional</label>
                  <textarea rows="3" class="form-control" formControlName="footerText"></textarea>
                </div>
              </div>
            }
          </app-v3-form-wizard>
        </form>
      </div>
    </div>

    <app-v3-file-manager-modal
      [open]="openDocumentsModal()"
      heading="Logos, Escudos y Documentos del Plantel"
      subtitle="Activos digitales institucionales vinculados al plantel"
      category="INSTITUTIONAL_LOGOS"
      ownerEntityType="SCHOOL"
      [ownerEntityId]="schoolId()"
      [ownerDisplayName]="schoolProfile()?.name ?? null"
      [ownerDocumentNumber]="schoolProfile()?.daneCode ?? null"
      [canUpload]="canManageBrandingFiles()"
      [canDelete]="canManageBrandingFiles()"
      (closed)="openDocumentsModal.set(false)"
    />
  `,
})
export class SchoolInformationComponent implements OnInit {
  protected readonly isControlInvalid = isControlInvalid;

  private readonly fb = inject(FormBuilder);
  private readonly adminService = inject(V3AdministrationService);
  private readonly catalogsService = inject(V3CatalogsService);
  private readonly v3Auth = inject(V3UnifiedAuthService);
  private readonly maskService = inject(LoadMaskService);
  private readonly messages = inject(MessagesService);

  readonly schoolProfile = signal<SchoolProfileRecord | null>(null);
  readonly catalogs = signal<GlobalCatalogsBundle | null>(null);
  readonly countries = signal<CountryCatalogItem[]>([]);
  readonly departments = signal<DepartmentCatalogItem[]>([]);
  readonly cities = signal<CityCatalogItem[]>([]);
  readonly openDocumentsModal = signal(false);
  readonly wizardStep = signal(0);

  readonly wizardSteps = computed<readonly V3WizardStep[]>(() => [
    {
      id: 'identity',
      title: 'Identificación',
      subtitle: 'Datos oficiales, DANE, NIT y clasificación',
      icon: 'school',
      invalid: Boolean(this.schoolForm.get('name')?.invalid && this.schoolForm.get('name')?.touched),
    },
    {
      id: 'location',
      title: 'Ubicación y Contacto',
      subtitle: 'Sede principal, dirección y canales oficiales',
      icon: 'location_on',
      invalid: Boolean(this.schoolForm.get('email')?.invalid && this.schoolForm.get('email')?.touched),
    },
    {
      id: 'directives',
      title: 'Directivos y Reportes',
      subtitle: 'Firmas directivas y encabezados de actas y boletines',
      icon: 'verified_user',
    },
  ]);

  readonly academicCalendarOptions = computed(() =>
    this.toNamedOptions(this.catalogs()?.academicCalendars)
  );
  readonly schoolSectorOptions = computed(() => this.toNamedOptions(this.catalogs()?.schoolSectors));
  readonly institutionTypeOptions = computed(() =>
    this.toNamedOptions(this.catalogs()?.institutionTypes)
  );
  readonly countryOptions = computed(() => this.toNamedOptions(this.countries()));
  readonly departmentOptions = computed(() => this.toNamedOptions(this.departments()));
  readonly cityOptions = computed(() => this.toNamedOptions(this.cities()));

  private toNamedOptions(
    items?: readonly { id: number; name: string }[]
  ): SearchableSelectOption<number>[] {
    return (items ?? []).map((item) => ({ value: item.id, label: item.name }));
  }

  readonly schoolId = computed(() => this.v3Auth.activeSchoolId());
  readonly canEditSchool = computed(() =>
    this.v3Auth.hasPermission('admin.school.write'),
  );
  readonly canManageBrandingFiles = computed(() =>
    this.v3Auth.hasPermission('storage.institutional_branding.write'),
  );

  readonly schoolForm: FormGroup;

  constructor() {
    this.schoolForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(250)]],
      shortName: [''],
      daneCode: [''],
      taxId: [''],
      calendarId: [null],
      sectorId: [null],
      institutionTypeId: [null],
      countryId: [45],
      departmentId: [null],
      cityId: [null],
      address: [''],
      suburb: [''],
      phones: [''],
      email: ['', [Validators.email]],
      website: [''],
      directorName: [''],
      directorDocument: [''],
      secretaryName: [''],
      secretaryDocument: [''],
      headerLine1: [''],
      headerLine2: [''],
      resolutionText: [''],
      footerText: [''],
    });
  }

  ngOnInit(): void {
    this.catalogsService.getGlobalBundle().subscribe((bundle) => {
      this.catalogs.set(bundle);
    });
    this.catalogsService.listCountries().subscribe((countries) => {
      this.countries.set(countries);
    });
    this.loadSchoolProfile();
  }

  loadSchoolProfile(): void {
    this.maskService.show('messages.loading');
    this.adminService
      .getSchoolProfile()
      .pipe(finalize(() => this.maskService.hide()))
      .subscribe({
        next: (profile) => {
          this.schoolProfile.set(profile);
          this.schoolForm.patchValue({
            name: profile.name,
            shortName: profile.shortName ?? '',
            daneCode: profile.daneCode ?? '',
            taxId: profile.taxId ?? '',
            calendarId: profile.calendarId,
            sectorId: profile.sectorId,
            institutionTypeId: profile.institutionTypeId,
            countryId: profile.countryId ?? 45,
            departmentId: profile.departmentId,
            cityId: profile.cityId,
            address: profile.address ?? '',
            suburb: profile.suburb ?? '',
            phones: profile.phones ?? '',
            email: profile.email ?? '',
            website: profile.website ?? '',
            directorName: profile.directorName ?? '',
            directorDocument: profile.directorDocument ?? '',
            secretaryName: profile.secretaryName ?? '',
            secretaryDocument: profile.secretaryDocument ?? '',
            headerLine1: profile.headerLine1 ?? '',
            headerLine2: profile.headerLine2 ?? '',
            resolutionText: profile.resolutionText ?? '',
            footerText: profile.footerText ?? '',
          });

          if (!this.canEditSchool()) {
            this.schoolForm.disable();
          }

          this.loadDepartments(profile.countryId ?? 45, profile.departmentId);
        },
      });
  }

  onCountryChanged(): void {
    const countryId = this.schoolForm.get('countryId')?.value as number | null;
    this.schoolForm.patchValue({ departmentId: null, cityId: null });
    this.cities.set([]);
    if (countryId) {
      this.loadDepartments(countryId, null);
    }
  }

  onDepartmentChanged(): void {
    const deptId = this.schoolForm.get('departmentId')?.value as number | null;
    this.schoolForm.patchValue({ cityId: null });
    if (deptId) {
      this.catalogsService.listCities(deptId).subscribe((list) => {
        this.cities.set(list);
      });
    } else {
      this.cities.set([]);
    }
  }

  saveSchool(): void {
    if (!this.canEditSchool()) {
      return;
    }
    if (this.schoolForm.invalid) {
      markAllAsTouched(this.schoolForm);
      return;
    }

    const raw = this.schoolForm.getRawValue();
    this.maskService.show('messages.saving');
    this.adminService
      .updateSchoolProfile({
        name: raw.name,
        shortName: raw.shortName || null,
        daneCode: raw.daneCode || null,
        taxId: raw.taxId || null,
        calendarId: raw.calendarId || null,
        sectorId: raw.sectorId || null,
        institutionTypeId: raw.institutionTypeId || null,
        countryId: raw.countryId || 45,
        cityId: raw.cityId || null,
        address: raw.address || null,
        suburb: raw.suburb || null,
        phones: raw.phones || null,
        email: raw.email || null,
        website: raw.website || null,
        directorName: raw.directorName || null,
        directorDocument: raw.directorDocument || null,
        secretaryName: raw.secretaryName || null,
        secretaryDocument: raw.secretaryDocument || null,
        headerLine1: raw.headerLine1 || null,
        headerLine2: raw.headerLine2 || null,
        resolutionText: raw.resolutionText || null,
        footerText: raw.footerText || null,
      })
      .pipe(finalize(() => this.maskService.hide()))
      .subscribe({
        next: (updated) => {
          this.schoolProfile.set(updated);
          this.messages.showSuccess('Datos del plantel actualizados correctamente.');
        },
      });
  }

  private loadDepartments(countryId: number, selectedDepartmentId: number | null): void {
    this.catalogsService.listDepartments(countryId).subscribe((depts) => {
      this.departments.set(depts);
      if (selectedDepartmentId) {
        this.catalogsService.listCities(selectedDepartmentId).subscribe((cities) => {
          this.cities.set(cities);
        });
      }
    });
  }
}
