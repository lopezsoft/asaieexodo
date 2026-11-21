import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { LoadMaskService } from '../../services/common/load-mask.service';
import { MessagesService } from '../../services/messages.service';
import {
  SchoolAcademicContextCatalogs,
  V3CatalogsService,
} from '../../services/v3-catalogs.service';
import {
  PollingStationRecord,
  SchoolElectionRecord,
  V3ElectionsService,
} from '../../services/v3-elections.service';
import { V3UnifiedAuthService } from '../../services/v3-unified-auth.service';
import { CustomTooltipDirective } from '../../shared/directives/custom-tooltip.directive';

/**
 * Control de Jornadas Electorales, Mesas de Votación y Jurados
 * (reemplaza ControlVotacionesView, MesasVotacionView y JuradosView de ExtJS).
 */
@Component({
  selector: 'app-election-control-stations',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CustomTooltipDirective],
  template: `
    <div class="container-fluid py-3">
      <div class="breadcrumb-card mb-25 d-md-flex align-items-center justify-content-between">
        <div>
          <h5 class="mb-0 fw-bold">Jornadas Electorales, Mesas y Jurados</h5>
          <small class="text-muted">Año lectivo {{ academicYear() }}</small>
        </div>
        <ol class="breadcrumb list-unstyled mt-0 mb-0 p-0">
          <li class="breadcrumb-item d-inline-block position-relative">
            <a routerLink="/elections" class="d-inline-block position-relative">Elecciones</a>
          </li>
          <li class="breadcrumb-item d-inline-block position-relative">Control y Mesas</li>
        </ol>
      </div>

      <div class="trezo-card bg-white border-radius p-4 shadow-sm mb-4">
        <h6 class="fw-semibold mb-3">Configurar Jornada Electoral</h6>
        <div class="row g-2 align-items-end mb-3 p-3 rounded bg-light border">
          <div class="col-md-3">
            <label class="form-label small fw-semibold">Nombre de la jornada *</label>
            <input type="text" class="form-control form-control-sm" [(ngModel)]="electionForm.electionName" placeholder="Elecciones Gobierno Escolar 2026" />
          </div>
          <div class="col-md-2">
            <label class="form-label small fw-semibold">Fecha *</label>
            <input type="date" class="form-control form-control-sm" [(ngModel)]="electionForm.electionDate" />
          </div>
          <div class="col-md-2">
            <label class="form-label small fw-semibold">Hora inicio</label>
            <input type="time" class="form-control form-control-sm" [(ngModel)]="electionForm.startTime" />
          </div>
          <div class="col-md-2">
            <label class="form-label small fw-semibold">Hora cierre</label>
            <input type="time" class="form-control form-control-sm" [(ngModel)]="electionForm.endTime" />
          </div>
          <div class="col-md-1">
            <div class="form-check form-switch">
              <input class="form-check-input" type="checkbox" id="elecActive" [(ngModel)]="electionForm.isActive" />
              <label class="form-check-label small" for="elecActive">Activa</label>
            </div>
          </div>
          <div class="col-md-2 d-grid">
            <button
              type="button"
              class="btn btn-sm btn-primary"
              [disabled]="!electionForm.electionName.trim() || !electionForm.electionDate"
              (click)="saveElection()"
            >
              Guardar Jornada
            </button>
          </div>
        </div>

        <div class="table-responsive">
          <table class="table table-hover v3-grid-table mb-0">
            <thead>
              <tr>
                <th>Año</th>
                <th>Jornada</th>
                <th>Fecha y Horario</th>
                <th class="text-center">Estado</th>
                <th class="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (el of elections(); track el.id) {
                <tr [class.table-primary]="selectedElectionId() === el.id">
                  <td class="fw-bold">{{ el.academicYear }}</td>
                  <td class="fw-semibold">{{ el.electionName }}</td>
                  <td class="small">{{ el.electionDate }} · {{ el.startTime }} - {{ el.endTime }}</td>
                  <td class="text-center">
                    <span class="badge" [ngClass]="el.isActive ? 'text-bg-success' : 'text-bg-secondary'">
                      {{ el.isActive ? 'Abierta' : 'Cerrada' }}
                    </span>
                  </td>
                  <td class="text-end text-nowrap">
                    <button
                      type="button"
                      class="btn btn-sm btn-outline-primary me-1"
                      (click)="selectElection(el)"
                      [appCustomTooltip]="'Administrar mesas y jurados de esta jornada'"
                    >
                      Mesas
                    </button>
                    <button
                      type="button"
                      class="btn btn-sm btn-outline-warning me-1"
                      (click)="toggleElectionActive(el)"
                      [appCustomTooltip]="el.isActive ? 'Cerrar jornada electoral' : 'Abrir jornada electoral'"
                    >
                      {{ el.isActive ? 'Cerrar' : 'Abrir' }}
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="text-center text-muted py-3">Cree la jornada electoral del año {{ academicYear() }}.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      @if (selectedElectionId()) {
        <div class="trezo-card bg-white border-radius p-4 shadow-sm">
          <h6 class="fw-semibold mb-3">Mesas de Votación y Jurados</h6>
          <div class="row g-2 align-items-end mb-4 p-3 rounded bg-light border">
            <div class="col-md-2">
              <label class="form-label small fw-semibold">No. Mesa *</label>
              <input type="text" class="form-control form-control-sm" [(ngModel)]="stationForm.stationNumber" placeholder="M-01" />
            </div>
            <div class="col-md-3">
              <label class="form-label small fw-semibold">Nombre de Mesa *</label>
              <input type="text" class="form-control form-control-sm" [(ngModel)]="stationForm.stationName" placeholder="Mesa Bachillerato" />
            </div>
            <div class="col-md-3">
              <label class="form-label small fw-semibold">Sede</label>
              <select class="form-select form-select-sm" [(ngModel)]="stationForm.campusId">
                <option [ngValue]="null">Todas las sedes</option>
                @for (c of context()?.campuses ?? []; track c.id) {
                  <option [ngValue]="c.id">{{ c.name }}</option>
                }
              </select>
            </div>
            <div class="col-md-2">
              <label class="form-label small fw-semibold">Ubicación</label>
              <input type="text" class="form-control form-control-sm" [(ngModel)]="stationForm.locationDescription" placeholder="Bloque A" />
            </div>
            <div class="col-md-2 d-grid">
              <button
                type="button"
                class="btn btn-sm btn-primary"
                [disabled]="!stationForm.stationNumber.trim() || !stationForm.stationName.trim()"
                (click)="createStation()"
              >
                Agregar Mesa
              </button>
            </div>
          </div>

          <div class="row g-3">
            @for (st of stations(); track st.id) {
              <div class="col-md-6">
                <div class="border rounded p-3 h-100">
                  <div class="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <span class="badge text-bg-primary me-2">{{ st.stationNumber }}</span>
                      <strong>{{ st.stationName }}</strong>
                      <div class="small text-muted">{{ st.campusName || 'General' }} · {{ st.locationDescription || 'Sin ubicación' }}</div>
                    </div>
                    <button
                      type="button"
                      class="btn btn-sm btn-outline-danger"
                      (click)="deleteStation(st)"
                      [appCustomTooltip]="'Eliminar mesa'"
                    >
                      <i class="material-symbols-outlined fs-6">delete</i>
                    </button>
                  </div>

                  <div class="input-group input-group-sm mb-2">
                    <input type="text" class="form-control" #juryName placeholder="Nombre completo del jurado..." />
                    <input type="text" class="form-control" #juryRole placeholder="Rol (Ej. PRESIDENTE)" value="JURADO" style="max-width: 140px;" />
                    <button type="button" class="btn btn-outline-primary" (click)="addJury(st.id, juryName.value, juryRole.value); juryName.value = ''">
                      + Jurado
                    </button>
                  </div>

                  <ul class="list-group list-group-flush small">
                    @for (j of st.juries; track j.id) {
                      <li class="list-group-item px-0 py-1 d-flex justify-content-between align-items-center">
                        <span><strong>{{ j.fullName }}</strong> <span class="text-muted">({{ j.roleTitle }})</span></span>
                        <button type="button" class="btn btn-sm btn-link text-danger p-0" (click)="deleteJury(j.id)" [appCustomTooltip]="'Quitar jurado'">
                          <i class="material-symbols-outlined fs-6">close</i>
                        </button>
                      </li>
                    } @empty {
                      <li class="list-group-item px-0 py-1 text-muted">Sin jurados asignados.</li>
                    }
                  </ul>
                </div>
              </div>
            } @empty {
              <div class="col-12 text-center text-muted py-3">No hay mesas creadas para esta jornada.</div>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class ElectionControlStationsComponent implements OnInit {
  private readonly electionsService = inject(V3ElectionsService);
  private readonly catalogsService = inject(V3CatalogsService);
  private readonly auth = inject(V3UnifiedAuthService);
  private readonly messages = inject(MessagesService);
  private readonly loadMask = inject(LoadMaskService);

  readonly academicYear = computed(() => this.auth.academicYear());
  readonly elections = signal<SchoolElectionRecord[]>([]);
  readonly selectedElectionId = signal<number | null>(null);
  readonly stations = signal<PollingStationRecord[]>([]);
  readonly context = signal<SchoolAcademicContextCatalogs | null>(null);

  electionForm = {
    electionName: '',
    electionDate: new Date().toISOString().slice(0, 10),
    startTime: '07:00',
    endTime: '16:00',
    isActive: true,
  };

  stationForm = {
    stationNumber: 'M-01',
    stationName: '',
    campusId: null as number | null,
    locationDescription: '',
  };

  ngOnInit(): void {
    this.electionForm.electionName = `Elecciones Gobierno Escolar ${this.academicYear()}`;
    this.loadMask.show('Cargando jornadas electorales...');
    forkJoin({
      elections: this.electionsService.listElections(),
      context: this.catalogsService.getSchoolContext(),
    })
      .pipe(finalize(() => this.loadMask.hide()))
      .subscribe({
        next: (res) => {
          this.elections.set(res.elections);
          this.context.set(res.context);
          if (res.elections.length > 0) {
            this.selectElection(res.elections[0]);
          }
        },
      });
  }

  selectElection(el: SchoolElectionRecord): void {
    this.selectedElectionId.set(el.id);
    this.electionsService
      .listStations(el.id)
      .subscribe((rows) => this.stations.set(rows));
  }

  saveElection(): void {
    this.electionsService
      .saveElection({
        academicYear: this.academicYear(),
        electionName: this.electionForm.electionName.trim(),
        electionDate: this.electionForm.electionDate,
        startTime: this.electionForm.startTime,
        endTime: this.electionForm.endTime,
        allowsBlankVote: true,
        isActive: this.electionForm.isActive,
      })
      .subscribe({
        next: (saved) => {
          this.messages.showSuccess('Jornada electoral guardada correctamente.');
          this.electionsService.listElections().subscribe((rows) => {
            this.elections.set(rows);
            this.selectElection(saved);
          });
        },
      });
  }

  toggleElectionActive(el: SchoolElectionRecord): void {
    this.electionsService
      .saveElection(
        {
          academicYear: el.academicYear,
          electionName: el.electionName,
          electionDate: el.electionDate,
          startTime: el.startTime,
          endTime: el.endTime,
          allowsBlankVote: el.allowsBlankVote,
          isActive: !el.isActive,
        },
        el.id,
      )
      .subscribe({
        next: () => {
          this.messages.showSuccess(
            el.isActive ? 'Jornada electoral cerrada.' : 'Jornada electoral habilitada.',
          );
          this.electionsService
            .listElections()
            .subscribe((rows) => this.elections.set(rows));
        },
      });
  }

  createStation(): void {
    const electionId = this.selectedElectionId();
    if (!electionId) return;
    this.electionsService
      .createStation(electionId, {
        campusId: this.stationForm.campusId || null,
        stationNumber: this.stationForm.stationNumber.trim(),
        stationName: this.stationForm.stationName.trim(),
        locationDescription: this.stationForm.locationDescription.trim() || null,
      })
      .subscribe({
        next: () => {
          this.messages.showSuccess('Mesa de votación agregada.');
          this.stationForm = {
            stationNumber: `M-0${this.stations().length + 2}`,
            stationName: '',
            campusId: null,
            locationDescription: '',
          };
          this.electionsService
            .listStations(electionId)
            .subscribe((rows) => this.stations.set(rows));
        },
      });
  }

  deleteStation(st: PollingStationRecord): void {
    const electionId = this.selectedElectionId();
    if (!electionId) return;
    void this.messages
      .confirmDelete(`¿Eliminar la mesa "${st.stationName}"?`)
      .then((r) => {
        if (!r.isConfirmed) return;
        this.electionsService.deleteStation(st.id).subscribe(() => {
          this.messages.showSuccess('Mesa eliminada.');
          this.electionsService
            .listStations(electionId)
            .subscribe((rows) => this.stations.set(rows));
        });
      });
  }

  addJury(stationId: number, fullName: string, roleTitle: string): void {
    const electionId = this.selectedElectionId();
    if (!electionId || !fullName.trim()) return;
    this.electionsService
      .addJury(stationId, { fullName: fullName.trim(), roleTitle: roleTitle.trim() || 'JURADO' })
      .subscribe(() => {
        this.messages.showSuccess('Jurado asignado.');
        this.electionsService
          .listStations(electionId)
          .subscribe((rows) => this.stations.set(rows));
      });
  }

  deleteJury(juryId: number): void {
    const electionId = this.selectedElectionId();
    if (!electionId) return;
    this.electionsService.deleteJury(juryId).subscribe(() => {
      this.electionsService
        .listStations(electionId)
        .subscribe((rows) => this.stations.set(rows));
    });
  }
}
