import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadMaskService } from '../../services/common/load-mask.service';
import { MessagesService } from '../../services/messages.service';
import {
  ElectionCandidateRecord,
  StudentActiveBallotView,
  V3ElectionsService,
} from '../../services/v3-elections.service';
import { V3UnifiedAuthService } from '../../services/v3-unified-auth.service';
import { CustomTooltipDirective } from '../../shared/directives/custom-tooltip.directive';

/**
 * Cabina Electoral Digital del Estudiante (reemplaza stub school-elections y
 * el módulo estudiantil de votaciones de ExtJS).
 */
@Component({
  selector: 'app-school-elections',
  standalone: true,
  imports: [CommonModule, CustomTooltipDirective],
  template: `
    <div class="container-fluid py-3">
      <div class="breadcrumb-card mb-25 d-md-flex align-items-center justify-content-between">
        <div>
          <h5 class="mb-0 fw-bold">Cabina de Elecciones Escolares</h5>
          <small class="text-muted">
            {{ auth.activeSchoolName() }} · Año lectivo {{ academicYear() }}
          </small>
        </div>
        <button
          type="button"
          class="btn btn-sm btn-outline-primary"
          (click)="loadBallot()"
          [appCustomTooltip]="'Actualizar tarjetón electoral'"
        >
          <i class="material-symbols-outlined fs-6 align-middle me-1">refresh</i>
          Actualizar
        </button>
      </div>

      @if (ballot(); as b) {
        @if (!b.election) {
          <div class="trezo-card bg-white border-radius p-5 shadow-sm text-center">
            <i class="material-symbols-outlined fs-1 text-muted">how_to_vote</i>
            <h5 class="fw-semibold mt-2">No hay jornada electoral activa</h5>
            <p class="text-muted small mb-0">
              En este momento no se encuentra abierta una votación escolar para el año {{ academicYear() }}.
            </p>
          </div>
        } @else {
          <div class="trezo-card bg-white border-radius p-4 shadow-sm mb-4">
            <div class="d-flex flex-wrap justify-content-between align-items-center gap-2">
              <div>
                <h5 class="fw-bold mb-1">{{ b.election.electionName }}</h5>
                <small class="text-muted">
                  Fecha: {{ b.election.electionDate }} · Horario: {{ b.election.startTime }} - {{ b.election.endTime }}
                </small>
              </div>
              @if (b.enrollmentId) {
                <div class="text-end">
                  <span class="badge text-bg-success">Habilitado para votar</span>
                  <div class="small text-muted mt-1">{{ b.studentFullName }} · {{ b.gradeName }}</div>
                </div>
              } @else {
                <span class="badge text-bg-warning">Vista previa (sin matrícula estudiantil activa)</span>
              }
            </div>
          </div>

          @for (group of b.candidacies; track group.candidacyTypeId) {
            <div class="trezo-card bg-white border-radius p-4 shadow-sm mb-4">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="fw-bold mb-0">{{ group.candidacyTypeName }}</h5>
                @if (group.alreadyVoted) {
                  <span class="badge text-bg-success">
                    <i class="material-symbols-outlined fs-6 align-middle me-1">verified</i>
                    Voto Registrado
                  </span>
                } @else {
                  <span class="badge text-bg-info">Pendiente por votar</span>
                }
              </div>

              <div class="row g-3">
                @for (cand of group.candidates; track cand.id) {
                  <div class="col-md-6 col-xl-4">
                    <div class="border rounded p-3 h-100 d-flex flex-column justify-content-between">
                      <div>
                        <div class="d-flex align-items-center justify-content-between mb-2">
                          <span class="badge text-bg-primary fs-6">Tarjetón #{{ cand.ballotNumber }}</span>
                          @if (cand.isBlankVoteOption) {
                            <span class="badge text-bg-secondary">Voto en Blanco</span>
                          }
                        </div>
                        <h6 class="fw-bold mb-1">{{ cand.candidateName }}</h6>
                        <p class="small text-muted mb-3">
                          {{ cand.proposalText || (cand.isBlankVoteOption ? 'Ejercer derecho al voto en blanco.' : 'Candidatura oficial al Gobierno Escolar.') }}
                        </p>
                      </div>
                      <button
                        type="button"
                        class="btn btn-sm w-100"
                        [ngClass]="group.alreadyVoted ? 'btn-outline-secondary' : 'btn-primary'"
                        [disabled]="group.alreadyVoted || !b.enrollmentId"
                        (click)="vote(b.election!.id, group.candidacyTypeId, cand)"
                      >
                        <i class="material-symbols-outlined fs-6 align-middle me-1">how_to_vote</i>
                        {{ group.alreadyVoted ? 'Voto ya emitido' : 'Votar por #' + cand.ballotNumber }}
                      </button>
                    </div>
                  </div>
                }
              </div>
            </div>
          }
        }
      }
    </div>
  `,
})
export class SchoolElectionsComponent implements OnInit {
  private readonly electionsService = inject(V3ElectionsService);
  protected readonly auth = inject(V3UnifiedAuthService);
  private readonly messages = inject(MessagesService);
  private readonly loadMask = inject(LoadMaskService);

  readonly academicYear = computed(() => this.auth.academicYear());
  readonly ballot = signal<StudentActiveBallotView | null>(null);

  ngOnInit(): void {
    this.loadBallot();
  }

  loadBallot(): void {
    this.loadMask.show('Cargando tarjetón electoral...');
    this.electionsService
      .getActiveBallot(this.academicYear())
      .pipe(finalize(() => this.loadMask.hide()))
      .subscribe((data) => this.ballot.set(data));
  }

  vote(
    electionId: number,
    candidacyTypeId: number,
    candidate: ElectionCandidateRecord,
  ): void {
    void this.messages
      .confirmDelete(
        `¿Confirmas tu voto por "${candidate.candidateName}" (Tarjetón #${candidate.ballotNumber})? Esta acción no se puede deshacer.`,
      )
      .then((r) => {
        if (!r.isConfirmed) return;
        this.loadMask.show('Registrando voto secreto...');
        this.electionsService
          .castVote(electionId, {
            candidacyTypeId,
            candidateId: candidate.id,
          })
          .pipe(finalize(() => this.loadMask.hide()))
          .subscribe({
            next: () => {
              this.messages.showSuccess('¡Tu voto ha sido registrado exitosamente!');
              this.loadBallot();
            },
          });
      });
  }
}
