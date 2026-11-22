import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { LoadMaskService } from '../../services/common/load-mask.service';
import { MessagesService } from '../../services/messages.service';
import {
  EnrollmentRecord,
  V3AcademicService,
} from '../../services/v3-academic.service';
import {
  GroupManagerRecord,
  V3AdministrationService,
} from '../../services/v3-administration.service';
import {
  PromotionStatusOption,
  V3PromotionService,
} from '../../services/v3-promotion.service';
import { V3UnifiedAuthService } from '../../services/v3-unified-auth.service';
import {
  SearchableSelectOption,
  V3SearchableSelectComponent,
} from '../../shared/components/v3-searchable-select/v3-searchable-select.component';

/**
 * Promoción Anticipada de Estudiantes (reemplaza PromocionAnticipadaView de ExtJS).
 */
@Component({
  selector: 'app-advance-promotion',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, V3SearchableSelectComponent],
  template: `
    <div class="container-fluid py-3">
      <div class="breadcrumb-card mb-25 d-md-flex align-items-center justify-content-between">
        <div>
          <h5 class="mb-0 fw-bold">Promoción Anticipada</h5>
          <small class="text-muted">Año lectivo {{ academicYear() }} · Decreto 1290 Art. 7</small>
        </div>
        <ol class="breadcrumb list-unstyled mt-0 mb-0 p-0">
          <li class="breadcrumb-item d-inline-block position-relative">
            <a routerLink="/promotion" class="d-inline-block position-relative">Promoción</a>
          </li>
          <li class="breadcrumb-item d-inline-block position-relative">Promoción Anticipada</li>
        </ol>
      </div>

      <div class="trezo-card bg-white border-radius p-4 shadow-sm">
        <div class="row g-3">
          <div class="col-12 col-md-6">
            <label class="form-label">Estudiante matriculado *</label>
            <app-v3-searchable-select
              [(ngModel)]="form.enrollmentId"
              [options]="enrollmentOptions()"
              [clearable]="true"
              placeholder="Seleccione estudiante..."
              searchPlaceholder="Buscar por documento o nombre..."
            />
          </div>
          <div class="col-12 col-md-6">
            <label class="form-label">Grupo destino (traslado inmediato opcional)</label>
            <app-v3-searchable-select
              [(ngModel)]="form.targetGroupId"
              [options]="targetGroupOptions()"
              [clearable]="true"
              placeholder="Sin traslado de grupo (solo acta)"
              searchPlaceholder="Buscar grupo destino..."
            />
          </div>
          <div class="col-12 col-md-6">
            <label class="form-label">Estado de Promoción</label>
            <app-v3-searchable-select
              [(ngModel)]="form.promotionStatusId"
              [options]="promotionStatusOptions()"
              placeholder="Estado..."
              searchPlaceholder="Buscar estado..."
            />
          </div>
          <div class="col-12 col-md-6">
            <label class="form-label">Número de Acta *</label>
            <input type="text" class="form-control" [(ngModel)]="form.actNumber" placeholder="ACTA-ANT-2026-01" />
          </div>
          <div class="col-12">
            <label class="form-label">Observación / Sustento del Consejo Académico</label>
            <input type="text" class="form-control" [(ngModel)]="form.observations" placeholder="Aprobada por desempeño superior..." />
          </div>
          <div class="col-12 d-flex justify-content-end pt-2 border-top">
            <button
              type="button"
              class="btn btn-sm btn-primary"
              [disabled]="!form.enrollmentId"
              (click)="submit()"
            >
              Aplicar Promoción Anticipada
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AdvancePromotionComponent implements OnInit {
  private readonly promotionService = inject(V3PromotionService);
  private readonly academicService = inject(V3AcademicService);
  private readonly adminService = inject(V3AdministrationService);
  private readonly auth = inject(V3UnifiedAuthService);
  private readonly messages = inject(MessagesService);
  private readonly loadMask = inject(LoadMaskService);

  readonly academicYear = computed(() => this.auth.academicYear());
  readonly enrollments = signal<EnrollmentRecord[]>([]);
  readonly groups = signal<GroupManagerRecord[]>([]);
  readonly statuses = signal<PromotionStatusOption[]>([]);

  readonly enrollmentOptions = computed<SearchableSelectOption<number>[]>(() =>
    this.enrollments().map((e) => ({
      value: e.id,
      label: `${e.gradeName}-${e.groupCode} · ${e.studentFullName} (${e.studentDocumentNumber})`,
    }))
  );
  readonly targetGroupOptions = computed<SearchableSelectOption<number>[]>(() =>
    this.groups().map((g) => ({
      value: g.id,
      label: `${g.gradeName}-${g.groupCode} (${g.campusName} · ${g.shiftName})`,
    }))
  );
  readonly promotionStatusOptions = computed<SearchableSelectOption<number>[]>(() =>
    this.statuses().map((st) => ({ value: st.id, label: st.description }))
  );

  form = {
    enrollmentId: 0,
    targetGroupId: 0,
    promotionStatusId: 1,
    actNumber: '',
    observations: '',
  };

  ngOnInit(): void {
    this.loadMask.show('Cargando matrículas y grupos...');
    const year = this.academicYear();
    forkJoin({
      enrollments: this.academicService.listEnrollments(year),
      groups: this.adminService.listGroupManagers(year),
      statuses: this.promotionService.listStatuses(),
    })
      .pipe(finalize(() => this.loadMask.hide()))
      .subscribe({
        next: (res) => {
          this.enrollments.set(res.enrollments);
          this.groups.set(res.groups);
          this.statuses.set(res.statuses);
        },
      });
  }

  submit(): void {
    const targetGrp = this.groups().find((g) => g.id === Number(this.form.targetGroupId));
    this.loadMask.show('Aplicando promoción anticipada...');
    this.promotionService
      .applyAdvancePromotion({
        enrollmentId: Number(this.form.enrollmentId),
        academicYear: this.academicYear(),
        promotionStatusId: Number(this.form.promotionStatusId) || 1,
        actNumber: this.form.actNumber.trim() || null,
        observations: this.form.observations.trim() || null,
        ...(targetGrp
          ? {
              targetCampusId: targetGrp.campusId,
              targetShiftId: targetGrp.shiftId,
              targetGradeId: targetGrp.gradeId,
              targetGroupId: targetGrp.id,
            }
          : {}),
      })
      .pipe(finalize(() => this.loadMask.hide()))
      .subscribe({
        next: () => {
          this.messages.showSuccess('Promoción anticipada registrada exitosamente.');
          this.form = {
            enrollmentId: 0,
            targetGroupId: 0,
            promotionStatusId: 1,
            actNumber: '',
            observations: '',
          };
        },
      });
  }
}
