import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { LoadMaskService } from '../../services/common/load-mask.service';
import {
  ElectionResultsView,
  SchoolElectionRecord,
  V3ElectionsService,
} from '../../services/v3-elections.service';
import {
  SearchableSelectOption,
  V3SearchableSelectComponent,
} from '../../shared/components/v3-searchable-select/v3-searchable-select.component';
import { CustomTooltipDirective } from '../../shared/directives/custom-tooltip.directive';

/**
 * Escrutinio Electoral en Tiempo Real (reemplaza ResultadosView de ExtJS).
 */
@Component({
  selector: 'app-election-results',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, V3SearchableSelectComponent, CustomTooltipDirective],
  template: `
    <div class="container-fluid py-3">
      <div class="breadcrumb-card mb-25 d-md-flex align-items-center justify-content-between">
        <div>
          <h5 class="mb-0 fw-bold">Escrutinio Electoral en Vivo</h5>
          <small class="text-muted">Participación, votación por candidatura y balance por mesas</small>
        </div>
        <div class="d-flex align-items-center gap-2">
          <app-v3-searchable-select
            size="sm"
            style="min-width: 240px;"
            [(ngModel)]="selectedElectionId"
            [options]="electionOptions()"
            placeholder="Seleccionar jornada..."
            searchPlaceholder="Buscar jornada..."
            (ngModelChange)="loadResults()"
          />
          <button
            type="button"
            class="btn btn-sm btn-outline-primary"
            (click)="loadResults()"
            [appCustomTooltip]="'Refrescar conteo de votos'"
          >
            <i class="material-symbols-outlined fs-6 align-middle">refresh</i>
          </button>
          <a routerLink="/elections" class="btn btn-sm btn-outline-secondary">Volver</a>
        </div>
      </div>

      @if (results(); as res) {
        <div class="row g-3 mb-4">
          <div class="col-md-4">
            <div class="trezo-card bg-white border-radius p-4 shadow-sm">
              <small class="text-muted">Censo Estudiantil Habilitado</small>
              <h3 class="fw-bold mb-0 mt-1">{{ res.totalEligibleStudents }}</h3>
            </div>
          </div>
          <div class="col-md-4">
            <div class="trezo-card bg-white border-radius p-4 shadow-sm">
              <small class="text-muted">Estudiantes que Han Votado</small>
              <h3 class="fw-bold text-primary mb-0 mt-1">{{ res.uniqueVotersCount }}</h3>
            </div>
          </div>
          <div class="col-md-4">
            <div class="trezo-card bg-white border-radius p-4 shadow-sm">
              <small class="text-muted">Participación Democrática</small>
              <h3 class="fw-bold text-success mb-0 mt-1">{{ res.participationPercentage }}%</h3>
            </div>
          </div>
        </div>

        <div class="row g-4">
          @for (group of res.resultsByCandidacy; track group.candidacyTypeId) {
            <div class="col-lg-6">
              <div class="trezo-card bg-white border-radius p-4 shadow-sm h-100">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <h6 class="fw-bold mb-0">{{ group.candidacyTypeName }}</h6>
                  <span class="badge text-bg-primary">{{ group.totalVotes }} voto(s)</span>
                </div>
                @for (cand of group.candidates; track cand.candidateId) {
                  <div class="mb-3">
                    <div class="d-flex justify-content-between small mb-1">
                      <span class="fw-semibold">
                        <span class="badge text-bg-light border text-dark me-1">#{{ cand.ballotNumber }}</span>
                        {{ cand.candidateName }}
                      </span>
                      <span class="fw-bold">{{ cand.votesCount }} ({{ cand.votePercentage }}%)</span>
                    </div>
                    <div class="progress" style="height: 10px;">
                      <div
                        class="progress-bar"
                        [ngClass]="cand.isBlankVoteOption ? 'bg-secondary' : 'bg-primary'"
                        [style.width.%]="cand.votePercentage"
                      ></div>
                    </div>
                  </div>
                } @empty {
                  <p class="text-muted small mb-0">Sin candidatos inscritos.</p>
                }
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="alert alert-info">No hay jornadas electorales configuradas para mostrar resultados.</div>
      }
    </div>
  `,
})
export class ElectionResultsComponent implements OnInit {
  private readonly electionsService = inject(V3ElectionsService);
  private readonly loadMask = inject(LoadMaskService);

  readonly elections = signal<SchoolElectionRecord[]>([]);
  readonly results = signal<ElectionResultsView | null>(null);
  readonly electionOptions = computed<SearchableSelectOption<number>[]>(() =>
    this.elections().map((e) => ({ value: e.id, label: `${e.academicYear} · ${e.electionName}` }))
  );
  selectedElectionId = 0;

  ngOnInit(): void {
    this.electionsService.listElections().subscribe((rows) => {
      this.elections.set(rows);
      if (rows.length > 0) {
        this.selectedElectionId = rows[0].id;
        this.loadResults();
      }
    });
  }

  loadResults(): void {
    if (!this.selectedElectionId) return;
    this.loadMask.show('Consultando escrutinio...');
    this.electionsService
      .getResults(this.selectedElectionId)
      .pipe(finalize(() => this.loadMask.hide()))
      .subscribe((res) => this.results.set(res));
  }
}
