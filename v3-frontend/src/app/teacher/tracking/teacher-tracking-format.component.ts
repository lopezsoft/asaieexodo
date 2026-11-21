import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { LoadMaskService } from '../../services/common/load-mask.service';
import { MessagesService } from '../../services/messages.service';
import { V3AdministrationService } from '../../services/v3-administration.service';
import {
  StudentTrackingFormatRow,
  V3PortalService,
} from '../../services/v3-portal.service';
import { V3UnifiedAuthService } from '../../services/v3-unified-auth.service';
import { CustomTooltipDirective } from '../../shared/directives/custom-tooltip.directive';

interface GroupOption {
  readonly id: number;
  readonly label: string;
}

/**
 * Formato de Seguimiento de Conectividad y Medios de Acceso por Grupo
 * (reemplaza FormatoSeguimientoForm.js de asaie-teachers).
 */
@Component({
  selector: 'app-teacher-tracking-format',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CustomTooltipDirective],
  template: `
    <div class="container-fluid py-3">
      <div class="breadcrumb-card mb-25 d-md-flex align-items-center justify-content-between">
        <div>
          <h5 class="mb-0 fw-bold">Formato de Seguimiento Académico y Conectividad</h5>
          <small class="text-muted">Año lectivo {{ academicYear() }} · Medios de acceso y servicios disponibles por estudiante</small>
        </div>
        <ol class="breadcrumb list-unstyled mt-0 mb-0 p-0">
          <li class="breadcrumb-item d-inline-block position-relative">
            <a routerLink="/teacher" class="d-inline-block position-relative">Portal Docente</a>
          </li>
          <li class="breadcrumb-item d-inline-block position-relative">Formato Seguimiento</li>
        </ol>
      </div>

      <div class="trezo-card bg-white border-radius p-4 shadow-sm mb-4">
        <div class="row g-2 align-items-end">
          <div class="col-md-5">
            <label class="form-label small fw-semibold">Grupo *</label>
            <select class="form-select form-select-sm" [(ngModel)]="selectedGroupId" (ngModelChange)="loadFormat()">
              <option [ngValue]="0">Seleccione grupo...</option>
              @for (g of groups(); track g.id) {
                <option [ngValue]="g.id">{{ g.label }}</option>
              }
            </select>
          </div>
          <div class="col-md-4 d-flex flex-wrap gap-2">
            <span class="badge text-bg-light border text-dark">Estudiantes: {{ rows().length }}</span>
            <span class="badge text-bg-success">Con Internet: {{ withInternetCount() }}</span>
            <span class="badge text-bg-primary">Plat. Virtual (PV): {{ withPvCount() }}</span>
            <span class="badge text-bg-warning">Guías Físicas (GF): {{ withGfCount() }}</span>
          </div>
          <div class="col-md-3 d-grid">
            <button
              type="button"
              class="btn btn-sm btn-primary"
              [disabled]="rows().length === 0"
              (click)="saveAll()"
            >
              <i class="material-symbols-outlined fs-6 align-middle me-1">save</i>
              Guardar Seguimiento
            </button>
          </div>
        </div>
      </div>

      <div class="trezo-card bg-white border-radius p-4 shadow-sm">
        <div class="small text-muted mb-3">
          <strong>Medios de Acceso:</strong> PV = Plataforma Virtual · TV = Televisión Educativa · GW = Guías WhatsApp · GF = Guías Físicas · OT = Otro ·
          <strong>Servicios:</strong> EE = Energía Eléctrica · IN = Internet · TV = Servicio TV · DC = Datos Celular
        </div>

        <div class="table-responsive">
          <table class="table table-sm table-hover v3-grid-table align-middle mb-0">
            <thead>
              <tr>
                <th rowspan="2">#</th>
                <th rowspan="2">Estudiante</th>
                <th rowspan="2" style="min-width: 210px;">Observaciones de Seguimiento</th>
                <th colspan="5" class="text-center border-start">Medios de Acceso</th>
                <th colspan="4" class="text-center border-start">Servicios Disponibles</th>
              </tr>
              <tr>
                <th class="text-center border-start" [appCustomTooltip]="'Plataforma Virtual'">PV</th>
                <th class="text-center" [appCustomTooltip]="'Televisión Educativa'">TV</th>
                <th class="text-center" [appCustomTooltip]="'Guías por WhatsApp'">GW</th>
                <th class="text-center" [appCustomTooltip]="'Guías Físicas Impresas'">GF</th>
                <th class="text-center" [appCustomTooltip]="'Otro medio de acceso'">OT</th>
                <th class="text-center border-start" [appCustomTooltip]="'Energía Eléctrica'">EE</th>
                <th class="text-center" [appCustomTooltip]="'Internet en hogar'">IN</th>
                <th class="text-center" [appCustomTooltip]="'Servicio de Televisión'">TV</th>
                <th class="text-center" [appCustomTooltip]="'Datos Celular'">DC</th>
              </tr>
            </thead>
            <tbody>
              @for (row of rows(); track row.studentProfileId; let i = $index) {
                <tr>
                  <td class="text-muted small">{{ i + 1 }}</td>
                  <td>
                    <div class="fw-semibold small">{{ row.studentFullName }}</div>
                    <small class="text-muted">{{ row.gradeName }}-{{ row.groupCode }} · {{ row.shiftName }}</small>
                  </td>
                  <td>
                    <input
                      type="text"
                      class="form-control form-control-sm"
                      [(ngModel)]="row.observations"
                      placeholder="Observación de contacto / conectividad..."
                    />
                  </td>
                  <td class="text-center border-start"><input type="checkbox" class="form-check-input" [(ngModel)]="row.pv" /></td>
                  <td class="text-center"><input type="checkbox" class="form-check-input" [(ngModel)]="row.tv" /></td>
                  <td class="text-center"><input type="checkbox" class="form-check-input" [(ngModel)]="row.gw" /></td>
                  <td class="text-center"><input type="checkbox" class="form-check-input" [(ngModel)]="row.gf" /></td>
                  <td class="text-center"><input type="checkbox" class="form-check-input" [(ngModel)]="row.otherAccess" /></td>
                  <td class="text-center border-start"><input type="checkbox" class="form-check-input" [(ngModel)]="row.ee" /></td>
                  <td class="text-center"><input type="checkbox" class="form-check-input" [(ngModel)]="row.internet" /></td>
                  <td class="text-center"><input type="checkbox" class="form-check-input" [(ngModel)]="row.tvService" /></td>
                  <td class="text-center"><input type="checkbox" class="form-check-input" [(ngModel)]="row.mobileData" /></td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="12" class="text-center text-muted py-4">
                    Seleccione un grupo con estudiantes matriculados para diligenciar el formato.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class TeacherTrackingFormatComponent implements OnInit {
  private readonly portalService = inject(V3PortalService);
  private readonly adminService = inject(V3AdministrationService);
  private readonly auth = inject(V3UnifiedAuthService);
  private readonly messages = inject(MessagesService);
  private readonly loadMask = inject(LoadMaskService);
  private readonly route = inject(ActivatedRoute);

  readonly academicYear = computed(() => this.auth.academicYear());
  readonly groups = signal<GroupOption[]>([]);
  readonly rows = signal<StudentTrackingFormatRow[]>([]);

  readonly withInternetCount = computed(() => this.rows().filter((r) => r.internet).length);
  readonly withPvCount = computed(() => this.rows().filter((r) => r.pv).length);
  readonly withGfCount = computed(() => this.rows().filter((r) => r.gf).length);

  selectedGroupId = 0;

  ngOnInit(): void {
    const queryGroupId = Number(this.route.snapshot.queryParamMap.get('groupId') || 0);
    const year = this.academicYear();
    this.loadMask.show('Cargando grupos...');
    forkJoin({
      courses: this.portalService.listTeacherCourses(year),
      groupManagers: this.adminService.listGroupManagers(year),
    })
      .pipe(finalize(() => this.loadMask.hide()))
      .subscribe({
        next: (res) => {
          const map = new Map<number, GroupOption>();
          for (const c of res.courses) {
            if (!map.has(c.academicGroupId)) {
              map.set(c.academicGroupId, {
                id: c.academicGroupId,
                label: `${c.gradeName}-${c.groupCode} (${c.campusName} · ${c.shiftName})`,
              });
            }
          }
          if (map.size === 0) {
            for (const g of res.groupManagers) {
              map.set(g.id, {
                id: g.id,
                label: `${g.gradeName}-${g.groupCode} (${g.campusName} · ${g.shiftName})`,
              });
            }
          }
          const list = Array.from(map.values());
          this.groups.set(list);
          if (queryGroupId && map.has(queryGroupId)) {
            this.selectedGroupId = queryGroupId;
          } else if (list.length > 0) {
            this.selectedGroupId = list[0].id;
          }
          if (this.selectedGroupId) {
            this.loadFormat();
          }
        },
      });
  }

  loadFormat(): void {
    if (!this.selectedGroupId) {
      this.rows.set([]);
      return;
    }
    this.loadMask.show('Cargando formato de seguimiento...');
    this.portalService
      .listTrackingFormat(Number(this.selectedGroupId), this.academicYear())
      .pipe(finalize(() => this.loadMask.hide()))
      .subscribe((list) => this.rows.set(list));
  }

  saveAll(): void {
    if (this.rows().length === 0) return;
    this.loadMask.show('Guardando formato de seguimiento...');
    this.portalService
      .saveTrackingFormatBatch({
        academicYear: this.academicYear(),
        rows: this.rows().map((r) => ({
          studentProfileId: r.studentProfileId,
          observations: r.observations ?? '',
          pv: Boolean(r.pv),
          tv: Boolean(r.tv),
          gw: Boolean(r.gw),
          gf: Boolean(r.gf),
          otherAccess: Boolean(r.otherAccess),
          ee: Boolean(r.ee),
          internet: Boolean(r.internet),
          tvService: Boolean(r.tvService),
          mobileData: Boolean(r.mobileData),
        })),
      })
      .pipe(finalize(() => this.loadMask.hide()))
      .subscribe(({ savedCount }) => {
        this.messages.showSuccess(`Formato de seguimiento guardado (${savedCount} estudiantes).`);
      });
  }
}
