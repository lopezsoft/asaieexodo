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
import { V3PromotionService } from '../../services/v3-promotion.service';
import { V3UnifiedAuthService } from '../../services/v3-unified-auth.service';
import {
  SearchableSelectOption,
  V3SearchableSelectComponent,
} from '../../shared/components/v3-searchable-select/v3-searchable-select.component';

/**
 * Matrícula masiva de estudiantes antiguos desde un año lectivo origen al destino
 * (reemplaza MatricularAntiguosView de ExtJS).
 */
@Component({
  selector: 'app-enroll-returning-students',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, V3SearchableSelectComponent],
  template: `
    <div class="container-fluid py-3">
      <div class="breadcrumb-card mb-25 d-md-flex align-items-center justify-content-between">
        <div>
          <h5 class="mb-0 fw-bold">Matricular Estudiantes Antiguos</h5>
          <small class="text-muted">Renovación masiva interanual con detección automática de repitencia</small>
        </div>
        <ol class="breadcrumb list-unstyled mt-0 mb-0 p-0">
          <li class="breadcrumb-item d-inline-block position-relative">
            <a routerLink="/promotion" class="d-inline-block position-relative">Promoción</a>
          </li>
          <li class="breadcrumb-item d-inline-block position-relative">Antiguos</li>
        </ol>
      </div>

      <div class="trezo-card bg-white border-radius p-4 shadow-sm mb-4">
        <div class="row g-3">
          <div class="col-12 col-md-6">
            <label class="form-label">Año Origen</label>
            <input type="number" class="form-control" [(ngModel)]="fromYear" (ngModelChange)="loadData()" />
          </div>
          <div class="col-12 col-md-6">
            <label class="form-label">Año Destino</label>
            <input type="number" class="form-control" [(ngModel)]="toYear" (ngModelChange)="loadData()" />
          </div>
          <div class="col-12 col-md-6">
            <label class="form-label">Grupo Destino ({{ toYear }}) *</label>
            <app-v3-searchable-select
              [(ngModel)]="targetGroupId"
              [options]="targetGroupOptions()"
              [clearable]="true"
              placeholder="Seleccione grupo destino..."
              searchPlaceholder="Buscar grupo destino..."
            />
          </div>
          <div class="col-12 col-md-6 d-flex align-items-end justify-content-md-end">
            <button
              type="button"
              class="btn btn-sm btn-primary"
              [disabled]="!targetGroupId || selectedIds().length === 0"
              (click)="executeEnroll()"
            >
              Matricular {{ selectedIds().length }} Seleccionado(s)
            </button>
          </div>
        </div>
      </div>

      <div class="trezo-card bg-white border-radius p-4 shadow-sm">
        <div class="table-responsive">
          <table class="table table-hover v3-grid-table mb-0">
            <thead>
              <tr>
                <th style="width: 40px;"></th>
                <th>Documento</th>
                <th>Estudiante</th>
                <th>Grado / Grupo ({{ fromYear }})</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              @for (enr of sourceEnrollments(); track enr.id) {
                <tr>
                  <td>
                    <input
                      type="checkbox"
                      class="form-check-input"
                      [checked]="selectedIds().includes(enr.id)"
                      (change)="toggle(enr.id)"
                    />
                  </td>
                  <td class="font-monospace small">{{ enr.studentDocumentNumber }}</td>
                  <td class="fw-semibold">{{ enr.studentFullName }}</td>
                  <td>{{ enr.gradeName }}-{{ enr.groupCode }} <small class="text-muted">({{ enr.campusName }})</small></td>
                  <td><span class="badge text-bg-light border text-dark">{{ enr.enrollmentStatusName }}</span></td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="text-center text-muted py-4">No hay matrículas en el año {{ fromYear }}.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class EnrollReturningStudentsComponent implements OnInit {
  private readonly promotionService = inject(V3PromotionService);
  private readonly academicService = inject(V3AcademicService);
  private readonly adminService = inject(V3AdministrationService);
  private readonly auth = inject(V3UnifiedAuthService);
  private readonly messages = inject(MessagesService);
  private readonly loadMask = inject(LoadMaskService);

  readonly academicYear = computed(() => this.auth.academicYear());
  fromYear = new Date().getFullYear() - 1;
  toYear = new Date().getFullYear();
  targetGroupId = 0;

  readonly sourceEnrollments = signal<EnrollmentRecord[]>([]);
  readonly targetGroups = signal<GroupManagerRecord[]>([]);
  readonly selectedIds = signal<number[]>([]);

  readonly targetGroupOptions = computed<SearchableSelectOption<number>[]>(() =>
    this.targetGroups().map((g) => ({
      value: g.id,
      label: `${g.gradeName}-${g.groupCode} (${g.campusName} · ${g.shiftName})`,
    }))
  );

  ngOnInit(): void {
    this.fromYear = this.academicYear();
    this.toYear = this.academicYear() + 1;
    this.loadData();
  }

  loadData(): void {
    this.loadMask.show('Cargando estudiantes antiguos...');
    forkJoin({
      source: this.academicService.listEnrollments(this.fromYear),
      targetGroups: this.adminService.listGroupManagers(this.toYear),
    })
      .pipe(finalize(() => this.loadMask.hide()))
      .subscribe({
        next: (res) => {
          this.sourceEnrollments.set(res.source);
          this.targetGroups.set(res.targetGroups);
          this.selectedIds.set([]);
        },
      });
  }

  toggle(id: number): void {
    const current = this.selectedIds();
    this.selectedIds.set(
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
    );
  }

  executeEnroll(): void {
    const grp = this.targetGroups().find((g) => g.id === Number(this.targetGroupId));
    if (!grp) return;
    this.loadMask.show('Matriculando estudiantes...');
    this.promotionService
      .enrollReturningStudents({
        fromYear: this.fromYear,
        toYear: this.toYear,
        enrollmentIds: this.selectedIds(),
        targetCampusId: grp.campusId,
        targetShiftId: grp.shiftId,
        targetGradeId: grp.gradeId,
        targetGroupId: grp.id,
      })
      .pipe(finalize(() => this.loadMask.hide()))
      .subscribe({
        next: ({ enrolledCount, skippedCount }) => {
          this.messages.showSuccess(
            `Matrícula completada: ${enrolledCount} nuevos, ${skippedCount} ya matriculados omitidos.`,
          );
          this.selectedIds.set([]);
        },
      });
  }
}
