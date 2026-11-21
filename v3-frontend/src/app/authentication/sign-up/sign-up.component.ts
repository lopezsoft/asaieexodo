import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, finalize, merge, of } from 'rxjs';
import { UiStateService } from '../../services/common/ui-state.service';
import { MessagesService } from '../../services/messages.service';
import {
  PublicRegistrationCatalogs,
  RegisterSchoolPayload,
  V3UnifiedAuthService,
} from '../../services/v3-unified-auth.service';
import { SearchableSelectOption } from '../../shared/components/v3-searchable-select/v3-searchable-select.component';
import { SHARED_IMPORTS } from '../../shared/shared-imports';
import { markAllAsTouched, mustMatch } from '../../utils/form-validators';

const DEFAULT_REGISTRATION_CATALOGS: PublicRegistrationCatalogs = {
  documentTypes: [
    { id: 1, code: 'C.C', name: 'Cédula de Ciudadanía' },
    { id: 2, code: 'T.I', name: 'Tarjeta de Identidad' },
    { id: 3, code: 'C.E', name: 'Cédula de Extranjería' },
  ],
  academicCalendars: [
    { id: 1, name: 'CALENDARIO A' },
    { id: 2, name: 'CALENDARIO B' },
    { id: 3, name: 'CALENDARIO C' },
  ],
  schoolSectors: [
    { id: 1, name: 'OFICIAL' },
    { id: 2, name: 'NO OFICIAL' },
  ],
  institutionTypes: [
    { id: 1, name: 'Institución' },
    { id: 2, name: 'Centro' },
  ],
};

export interface PasswordStrengthMetrics {
  readonly score: 0 | 1 | 2 | 3 | 4;
  readonly labelKey: string;
  readonly hasMinLength: boolean;
  readonly hasUpper: boolean;
  readonly hasLower: boolean;
  readonly hasNumber: boolean;
}

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [...SHARED_IMPORTS],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss',
})
export class SignUpComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly v3Auth = inject(V3UnifiedAuthService);
  private readonly uiState = inject(UiStateService);
  private readonly messagesService = inject(MessagesService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private shakeTimerId: number | null = null;

  protected readonly currentStep = signal<1 | 2>(1);
  protected readonly stepDirection = signal<'next' | 'prev'>('next');
  protected readonly isSubmitting = signal(false);
  protected readonly showOptionalNames = signal(false);
  protected readonly isPasswordVisible = signal(false);
  protected readonly isConfirmVisible = signal(false);
  protected readonly hasStepShake = signal(false);
  protected readonly usernameManuallyEdited = signal(false);
  protected readonly catalogs = signal<PublicRegistrationCatalogs>(
    DEFAULT_REGISTRATION_CATALOGS,
  );

  protected readonly calendarOptions = computed<SearchableSelectOption<number>[]>(
    () =>
      this.catalogs().academicCalendars.map((item) => ({
        value: item.id,
        label: item.name,
      })),
  );

  protected readonly sectorOptions = computed<SearchableSelectOption<number>[]>(
    () =>
      this.catalogs().schoolSectors.map((item) => ({
        value: item.id,
        label: item.name,
      })),
  );

  protected readonly institutionTypeOptions = computed<
    SearchableSelectOption<number>[]
  >(() =>
    this.catalogs().institutionTypes.map((item) => ({
      value: item.id,
      label: item.name,
    })),
  );

  protected readonly documentTypeOptions = computed<
    SearchableSelectOption<number>[]
  >(() =>
    this.catalogs().documentTypes.map((doc) => ({
      value: doc.id,
      label: doc.name,
      badge: doc.code,
      keywords: `${doc.code ?? ''} ${doc.name}`,
    })),
  );

  protected readonly registerForm: FormGroup = this.fb.group({
    institution: this.fb.group({
      schoolName: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(250),
        ],
      ],
      shortName: ['', [Validators.maxLength(80)]],
      daneCode: ['', [Validators.pattern(/^[A-Za-z0-9-]{4,30}$/)]],
      taxId: ['', [Validators.maxLength(30)]],
      calendarId: [1, [Validators.required]],
      sectorId: [1, [Validators.required]],
      institutionTypeId: [1, [Validators.required]],
      schoolEmail: ['', [Validators.email, Validators.maxLength(180)]],
      schoolPhone: ['', [Validators.maxLength(150)]],
      schoolAddress: ['', [Validators.maxLength(200)]],
    }),
    administrator: this.fb.group(
      {
        adminDocumentTypeId: [1, [Validators.required]],
        adminDocumentNumber: [
          '',
          [
            Validators.required,
            Validators.minLength(4),
            Validators.maxLength(30),
            Validators.pattern(/^[a-zA-Z0-9.-]+$/),
          ],
        ],
        adminFirstName: [
          '',
          [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(80),
          ],
        ],
        adminMiddleName: ['', [Validators.maxLength(80)]],
        adminLastName: [
          '',
          [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(80),
          ],
        ],
        adminSecondLastName: ['', [Validators.maxLength(80)]],
        adminEmail: [
          '',
          [Validators.required, Validators.email, Validators.maxLength(255)],
        ],
        adminPhone: ['', [Validators.maxLength(40)]],
        username: [
          '',
          [
            Validators.required,
            Validators.minLength(4),
            Validators.maxLength(100),
            Validators.pattern(/^[a-zA-Z0-9._@-]+$/),
          ],
        ],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.maxLength(128),
            Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/),
          ],
        ],
        confirmPassword: ['', [Validators.required]],
        acceptTerms: [false, [Validators.requiredTrue]],
      },
      {
        validators: mustMatch('password', 'confirmPassword'),
      },
    ),
  });

  constructor() {
    this.destroyRef.onDestroy(() => {
      if (this.isBrowser && this.shakeTimerId !== null) {
        window.clearTimeout(this.shakeTimerId);
      }
    });
  }

  ngOnInit(): void {
    if (this.v3Auth.isAuthenticated()) {
      void this.router.navigate([this.v3Auth.resolvePostLoginRoute()]);
      return;
    }

    this.setupUsernameSuggestion();

    if (this.isBrowser) {
      this.v3Auth
        .getPublicRegistrationCatalogs()
        .pipe(
          catchError(() => of(null)),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe((response) => {
          if (response?.data) {
            this.catalogs.set({
              documentTypes:
                response.data.documentTypes.length > 0
                  ? response.data.documentTypes
                  : DEFAULT_REGISTRATION_CATALOGS.documentTypes,
              academicCalendars:
                response.data.academicCalendars.length > 0
                  ? response.data.academicCalendars
                  : DEFAULT_REGISTRATION_CATALOGS.academicCalendars,
              schoolSectors:
                response.data.schoolSectors.length > 0
                  ? response.data.schoolSectors
                  : DEFAULT_REGISTRATION_CATALOGS.schoolSectors,
              institutionTypes:
                response.data.institutionTypes.length > 0
                  ? response.data.institutionTypes
                  : DEFAULT_REGISTRATION_CATALOGS.institutionTypes,
            });
          }
        });
    }
  }

  protected get institutionGroup(): FormGroup {
    return this.registerForm.get('institution') as FormGroup;
  }

  protected get administratorGroup(): FormGroup {
    return this.registerForm.get('administrator') as FormGroup;
  }

  protected get instControls() {
    return this.institutionGroup.controls;
  }

  protected get adminControls() {
    return this.administratorGroup.controls;
  }

  protected get passwordMetrics(): PasswordStrengthMetrics {
    const raw = String(this.adminControls['password'].value ?? '');
    const hasMinLength = raw.length >= 8;
    const hasUpper = /[A-Z]/.test(raw);
    const hasLower = /[a-z]/.test(raw);
    const hasNumber = /\d/.test(raw);

    const score = [hasMinLength, hasUpper, hasLower, hasNumber].filter(
      Boolean,
    ).length as 0 | 1 | 2 | 3 | 4;

    let labelKey = 'registerSchool.strength.weak';
    if (score === 2) {
      labelKey = 'registerSchool.strength.fair';
    } else if (score === 3) {
      labelKey = 'registerSchool.strength.good';
    } else if (score === 4) {
      labelKey = 'registerSchool.strength.strong';
    }

    return {
      score,
      labelKey,
      hasMinLength,
      hasUpper,
      hasLower,
      hasNumber,
    };
  }

  protected goToStepTwo(): void {
    if (this.institutionGroup.invalid) {
      markAllAsTouched(this.institutionGroup);
      this.triggerStepShake();
      return;
    }
    this.stepDirection.set('next');
    this.currentStep.set(2);
  }

  protected goToStepOne(): void {
    this.stepDirection.set('prev');
    this.currentStep.set(1);
  }

  protected toggleOptionalNames(): void {
    this.showOptionalNames.update((visible) => !visible);
  }

  protected togglePasswordVisibility(): void {
    this.isPasswordVisible.update((visible) => !visible);
  }

  protected toggleConfirmVisibility(): void {
    this.isConfirmVisible.update((visible) => !visible);
  }

  protected onUsernameInput(): void {
    const current = String(this.adminControls['username'].value ?? '').trim();
    this.usernameManuallyEdited.set(current.length > 0);
  }

  protected onSubmit(): void {
    if (this.isSubmitting()) {
      return;
    }

    if (this.institutionGroup.invalid) {
      this.goToStepOne();
      markAllAsTouched(this.institutionGroup);
      this.triggerStepShake();
      return;
    }

    if (this.administratorGroup.invalid) {
      markAllAsTouched(this.administratorGroup);
      this.triggerStepShake();
      return;
    }

    const inst = this.institutionGroup.getRawValue() as Record<string, unknown>;
    const admin = this.administratorGroup.getRawValue() as Record<
      string,
      unknown
    >;

    const payload: RegisterSchoolPayload = {
      schoolName: String(inst['schoolName'] ?? '').trim(),
      shortName: this.optionalText(inst['shortName']),
      daneCode: this.optionalText(inst['daneCode']),
      taxId: this.optionalText(inst['taxId']),
      calendarId: Number(inst['calendarId'] ?? 1),
      sectorId: Number(inst['sectorId'] ?? 1),
      institutionTypeId: Number(inst['institutionTypeId'] ?? 1),
      schoolEmail: this.optionalText(inst['schoolEmail'])?.toLowerCase(),
      schoolPhone: this.optionalText(inst['schoolPhone']),
      schoolAddress: this.optionalText(inst['schoolAddress']),
      adminDocumentTypeId: Number(admin['adminDocumentTypeId'] ?? 1),
      adminDocumentNumber: String(admin['adminDocumentNumber'] ?? '').trim(),
      adminFirstName: String(admin['adminFirstName'] ?? '').trim(),
      adminMiddleName: this.optionalText(admin['adminMiddleName']),
      adminLastName: String(admin['adminLastName'] ?? '').trim(),
      adminSecondLastName: this.optionalText(admin['adminSecondLastName']),
      adminEmail: String(admin['adminEmail'] ?? '').trim().toLowerCase(),
      adminPhone: this.optionalText(admin['adminPhone']),
      username: String(admin['username'] ?? '').trim().toLowerCase(),
      password: String(admin['password'] ?? ''),
    };

    this.isSubmitting.set(true);
    this.uiState.showLoader();

    this.v3Auth
      .registerSchool(payload)
      .pipe(
        finalize(() => {
          this.isSubmitting.set(false);
          this.uiState.hideLoader();
        }),
      )
      .subscribe({
        next: (response) => {
          const trialDays = response.data.onboarding?.trialDays ?? 30;
          this.messagesService.showSuccess(
            `¡Institución registrada! Bienvenido(a), ${response.data.user.fullName}. Prueba gratuita activa (${trialDays} días).`,
          );
          void this.router.navigate([
            this.v3Auth.resolvePostLoginRoute(response.data),
          ]);
        },
        error: () => {
          this.triggerStepShake();
        },
      });
  }

  private setupUsernameSuggestion(): void {
    const firstCtrl = this.adminControls['adminFirstName'];
    const lastCtrl = this.adminControls['adminLastName'];

    merge(firstCtrl.valueChanges, lastCtrl.valueChanges)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (this.usernameManuallyEdited()) {
          return;
        }
        const firstSlug = this.normalizeUsernameSegment(
          String(firstCtrl.value ?? ''),
        );
        const lastSlug = this.normalizeUsernameSegment(
          String(lastCtrl.value ?? ''),
        );
        const suggested = [firstSlug, lastSlug].filter(Boolean).join('.');
        this.adminControls['username'].patchValue(suggested, {
          emitEvent: false,
        });
      });
  }

  private normalizeUsernameSegment(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 30);
  }

  private optionalText(value: unknown): string | undefined {
    if (typeof value !== 'string') {
      return undefined;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }

  private triggerStepShake(): void {
    if (!this.isBrowser) {
      return;
    }
    this.hasStepShake.set(false);
    if (this.shakeTimerId !== null) {
      window.clearTimeout(this.shakeTimerId);
    }
    this.shakeTimerId = window.setTimeout(() => {
      this.hasStepShake.set(true);
      this.shakeTimerId = window.setTimeout(() => {
        this.hasStepShake.set(false);
      }, 450);
    }, 10);
  }
}
