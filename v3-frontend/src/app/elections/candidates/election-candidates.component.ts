import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { LoadMaskService } from '../../services/common/load-mask.service';
import { MessagesService } from '../../services/messages.service';
import {
  CandidacyTypeItem,
  ElectionCandidateRecord,
  SchoolElectionRecord,
  V3ElectionsService,
} from '../../services/v3-elections.service';
import { CustomTooltipDirective } from '../../shared/directives/custom-tooltip.directive';

/**
 * Inscripción de Candidatos y Voto en Blanco (reemplaza CandidatosView y VotoBlancoView de ExtJS).
 */
@Component({
  selector: 'app-election-candidates',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CustomTooltipDirective],
  template: `
    <div class="container-fluid py-3">
      <div class="breadcrumb-card mb-25 d-md-flex align-items-center justify-content-between">
        <div>
          <h5 class="mb-0 fw-bold">Candidatos y Tarjetón Electoral</h5>
          <small class="text-muted">Personería, Consejo Estudiantil, Contraloría y Voto en Blanco</small>
        </div>
        <ol class="breadcrumb list-unstyled mt-0 mb-0 p-0">
          <li class="breadcrumb-item d-inline-block position-relative">
            <a routerLink="/elections" class="d-inline-block position-relative">Elecciones</a>
          </li>
          <li class="breadcrumb-item d-inline-block position-relative">Candidatos</li>
        </ol>
      </div>

      <div class="trezo-card bg-white border-radius p-4 shadow-sm mb-4">
        <div class="row g-2 align-items-end mb-4">
          <div class="col-md-5">
            <label class="form-label small fw-semibold">Jornada Electoral</label>
            <select class="form-select form-select-sm" [(ngModel)]="selectedElectionId" (ngModelChange)="loadCandidates()">
              @for (e of elections(); track e.id) {
                <option [ngValue]="e.id">{{ e.academicYear }} · {{ e.electionName }}</option>
              }
            </select>
          </div>
        </div>

        @if (selectedElectionId) {
          <div class="row g-2 align-items-end mb-4 p-3 rounded bg-light border">
            <div class="col-md-2">
              <label class="form-label small fw-semibold">Candidatura *</label>
              <select class="form-select form-select-sm" [(ngModel)]="form.candidacyTypeId">
                @for (ct of candidacyTypes(); track ct.id) {
                  <option [ngValue]="ct.id">{{ ct.name }}</option>
                }
              </select>
            </div>
            <div class="col-md-1">
              <label class="form-label small fw-semibold">Tarjetón *</label>
              <input type="text" class="form-control form-control-sm" [(ngModel)]="form.ballotNumber" placeholder="01" />
            </div>
            <div class="col-md-3">
              <label class="form-label small fw-semibold">Nombre del Candidato *</label>
              <input type="text" class="form-control form-control-sm" [(ngModel)]="form.candidateName" placeholder="Nombre o Voto en Blanco" />
            </div>
            <div class="col-md-3">
              <label class="form-label small fw-semibold">Propuesta / Lema</label>
              <input type="text" class="form-control form-control-sm" [(ngModel)]="form.proposalText" placeholder="Propuesta de campaña..." />
            </div>
            <div class="col-md-1">
              <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" id="isBlank" [(ngModel)]="form.isBlankVoteOption" />
                <label class="form-check-label small" for="isBlank">Blanco</label>
              </div>
            </div>
            <div class="col-md-2 d-grid">
              <button
                type="button"
                class="btn btn-sm btn-primary"
                [disabled]="!form.ballotNumber.trim() || !form.candidateName.trim()"
                (click)="saveCandidate()"
              >
                Agregar Candidato
              </button>
            </div>
          </div>

          <div class="table-responsive">
            <table class="table table-hover v3-grid-table mb-0">
              <thead>
                <tr>
                  <th>Candidatura</th>
                  <th class="text-center">Tarjetón</th>
                  <th>Candidato</th>
                  <th>Propuesta</th>
                  <th class="text-center">Tipo</th>
                  <th class="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                @for (c of candidates(); track c.id) {
                  <tr>
                    <td><span class="badge text-bg-primary">{{ c.candidacyTypeName }}</span></td>
                    <td class="text-center fw-bold fs-6">{{ c.ballotNumber }}</td>
                    <td class="fw-semibold">{{ c.candidateName }}</td>
                    <td class="small text-muted">{{ c.proposalText || '—' }}</td>
                    <td class="text-center">
                      @if (c.isBlankVoteOption) {
                        <span class="badge text-bg-secondary">Voto en Blanco</span>
                      } @else {
                        <span class="badge text-bg-success">Candidato</span>
                      }
                    </td>
                    <td class="text-end">
                      <button
                        type="button"
                        class="btn btn-sm btn-outline-danger"
                        (click)="deleteCandidate(c)"
                        [appCustomTooltip]="'Eliminar candidato'"
                      >
                        <i class="material-symbols-outlined fs-6">delete</i>
                      </button>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="6" class="text-center text-muted py-4">No hay candidatos inscritos en esta jornada.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else {
          <div class="alert alert-info mb-0">
            Primero cree una jornada electoral en <a routerLink="/elections/control">Jornadas y Mesas</a>.
          </div>
        }
      </div>
    </div>
  `,
})
export class ElectionCandidatesComponent implements OnInit {
  private readonly electionsService = inject(V3ElectionsService);
  private readonly messages = inject(MessagesService);
  private readonly loadMask = inject(LoadMaskService);

  readonly elections = signal<SchoolElectionRecord[]>([]);
  readonly candidacyTypes = signal<CandidacyTypeItem[]>([]);
  readonly candidates = signal<ElectionCandidateRecord[]>([]);

  selectedElectionId = 0;
  form = {
    candidacyTypeId: 1,
    ballotNumber: '01',
    candidateName: '',
    proposalText: '',
    isBlankVoteOption: false,
  };

  ngOnInit(): void {
    this.loadMask.show('Cargando candidatos...');
    forkJoin({
      elections: this.electionsService.listElections(),
      types: this.electionsService.listCandidacyTypes(),
    })
      .pipe(finalize(() => this.loadMask.hide()))
      .subscribe({
        next: (res) => {
          this.elections.set(res.elections);
          this.candidacyTypes.set(res.types);
          if (res.types.length > 0) {
            this.form.candidacyTypeId = res.types[0].id;
          }
          if (res.elections.length > 0) {
            this.selectedElectionId = res.elections[0].id;
            this.loadCandidates();
          }
        },
      });
  }

  loadCandidates(): void {
    if (!this.selectedElectionId) return;
    this.electionsService
      .listCandidates(this.selectedElectionId)
      .subscribe((rows) => this.candidates.set(rows));
  }

  saveCandidate(): void {
    this.electionsService
      .saveCandidate(this.selectedElectionId, {
        candidacyTypeId: Number(this.form.candidacyTypeId),
        ballotNumber: this.form.ballotNumber.trim(),
        candidateName: this.form.candidateName.trim(),
        proposalText: this.form.proposalText.trim() || null,
        isBlankVoteOption: this.form.isBlankVoteOption,
      })
      .subscribe({
        next: () => {
          this.messages.showSuccess('Candidato inscrito correctamente.');
          this.form.candidateName = '';
          this.form.proposalText = '';
          this.form.isBlankVoteOption = false;
          this.loadCandidates();
        },
      });
  }

  deleteCandidate(c: ElectionCandidateRecord): void {
    void this.messages
      .confirmDelete(`¿Eliminar al candidato "${c.candidateName}"?`)
      .then((r) => {
        if (!r.isConfirmed) return;
        this.electionsService.deleteCandidate(c.id).subscribe(() => {
          this.messages.showSuccess('Candidato eliminado.');
          this.loadCandidates();
        });
      });
  }
}
