import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
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
import {
  SearchableSelectOption,
  V3SearchableSelectComponent,
} from '../../shared/components/v3-searchable-select/v3-searchable-select.component';
import { CustomTooltipDirective } from '../../shared/directives/custom-tooltip.directive';

/**
 * Inscripción de Candidatos y Voto en Blanco (reemplaza CandidatosView y VotoBlancoView de ExtJS).
 */
@Component({
  selector: 'app-election-candidates',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, V3SearchableSelectComponent, CustomTooltipDirective],
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
        <div class="row g-3 mb-4">
          <div class="col-12 col-md-6">
            <label class="form-label">Jornada Electoral</label>
            <app-v3-searchable-select
              [(ngModel)]="selectedElectionId"
              [options]="electionOptions()"
              placeholder="Seleccione jornada..."
              searchPlaceholder="Buscar jornada..."
              (ngModelChange)="loadCandidates()"
            />
          </div>
        </div>

        @if (selectedElectionId) {
          <div class="v3-form-panel">
            <div class="row g-3">
              <div class="col-12 col-md-6">
                <label class="form-label">Candidatura *</label>
                <app-v3-searchable-select
                  [(ngModel)]="form.candidacyTypeId"
                  [options]="candidacyTypeOptions()"
                  placeholder="Candidatura..."
                  searchPlaceholder="Buscar candidatura..."
                />
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label">Número de Tarjetón *</label>
                <input type="text" class="form-control" [(ngModel)]="form.ballotNumber" placeholder="01" />
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label">Nombre del Candidato *</label>
                <input type="text" class="form-control" [(ngModel)]="form.candidateName" placeholder="Nombre o Voto en Blanco" />
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label">Propuesta / Lema</label>
                <input type="text" class="form-control" [(ngModel)]="form.proposalText" placeholder="Propuesta de campaña..." />
              </div>
              <div class="col-12 col-md-6">
                <div class="v3-form-switch-box">
                  <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" id="isBlank" [(ngModel)]="form.isBlankVoteOption" />
                    <label class="form-check-label" for="isBlank">Opción de Voto en Blanco</label>
                  </div>
                </div>
              </div>
              <div class="col-12 col-md-6 d-flex align-items-end justify-content-md-end">
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

  readonly electionOptions = computed<SearchableSelectOption<number>[]>(() =>
    this.elections().map((e) => ({ value: e.id, label: `${e.academicYear} · ${e.electionName}` }))
  );
  readonly candidacyTypeOptions = computed<SearchableSelectOption<number>[]>(() =>
    this.candidacyTypes().map((ct) => ({ value: ct.id, label: ct.name }))
  );

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
