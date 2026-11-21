import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';
import { LoadMaskService } from '../../services/common/load-mask.service';
import { MessagesService } from '../../services/messages.service';
import {
  LiveClassRow,
  OnlineEvaluationRow,
  V3PortalService,
  VirtualActivityRow,
} from '../../services/v3-portal.service';
import { V3UnifiedAuthService } from '../../services/v3-unified-auth.service';

type StudentLmsTab = 'activities' | 'evaluations' | 'liveClasses';

/**
 * Aula Virtual Estudiantil: Actividades con entrega, Evaluaciones en Línea
 * calificadas en servidor (sin exposición de respuestas) y Clases en Vivo
 * (reemplaza stub academic-activities y las pantallas LMS de ExtJS estudiantes/).
 */
@Component({
  selector: 'app-academic-activities',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid py-3">
      <div class="breadcrumb-card mb-25 d-md-flex align-items-center justify-content-between">
        <div>
          <h5 class="mb-0 fw-bold">Aula Virtual del Estudiante</h5>
          <small class="text-muted">
            {{ auth.activeSchoolName() }} · Año lectivo {{ academicYear() }} · Actividades, Evaluaciones y Clases en Vivo
          </small>
        </div>
      </div>

      <ul class="nav nav-pills mb-3 gap-2">
        <li class="nav-item">
          <button type="button" class="nav-link" [class.active]="activeTab() === 'activities'" (click)="activeTab.set('activities')">
            Actividades ({{ activities().length }})
          </button>
        </li>
        <li class="nav-item">
          <button type="button" class="nav-link" [class.active]="activeTab() === 'evaluations'" (click)="activeTab.set('evaluations')">
            Evaluaciones en Línea ({{ evaluations().length }})
          </button>
        </li>
        <li class="nav-item">
          <button type="button" class="nav-link" [class.active]="activeTab() === 'liveClasses'" (click)="activeTab.set('liveClasses')">
            Clases en Vivo ({{ liveClasses().length }})
          </button>
        </li>
      </ul>

      <div class="trezo-card bg-white border-radius p-4 shadow-sm">
        @switch (activeTab()) {
          @case ('activities') {
            @for (act of activities(); track act.id) {
              <div class="border rounded p-3 mb-3">
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <span class="badge text-bg-primary me-1">P{{ act.periodNumber }}</span>
                    <strong>{{ act.title }}</strong>
                    <div class="small text-muted">{{ act.subjectName }} · Prof. {{ act.teacherName }}</div>
                  </div>
                  @if (act.mySubmission) {
                    <span class="badge text-bg-success">
                      Entregada
                      @if (act.mySubmission.score !== null) {
                        · Nota: {{ act.mySubmission.score }}
                      }
                    </span>
                  } @else {
                    <span class="badge text-bg-warning">Pendiente</span>
                  }
                </div>
                <p class="small mb-2">{{ act.instructions }}</p>
                @if (act.mySubmission?.teacherFeedback) {
                  <div class="alert alert-info py-1 px-2 small mb-2">
                    <strong>Retroalimentación docente:</strong> {{ act.mySubmission!.teacherFeedback }}
                  </div>
                }
                <div class="input-group input-group-sm">
                  <input
                    type="text"
                    class="form-control"
                    [value]="act.mySubmission?.studentComment || ''"
                    #ansIn
                    placeholder="Escribe tu respuesta o enlace de entrega..."
                  />
                  <button
                    type="button"
                    class="btn btn-primary"
                    (click)="submitActivity(act.id, ansIn.value)"
                  >
                    {{ act.mySubmission ? 'Actualizar Entrega' : 'Enviar Entrega' }}
                  </button>
                </div>
              </div>
            } @empty {
              <p class="text-center text-muted py-4 mb-0">No tienes actividades virtuales pendientes.</p>
            }
          }

          @case ('evaluations') {
            @for (ev of evaluations(); track ev.id) {
              <div class="border rounded p-3 mb-3">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <div>
                    <span class="badge text-bg-primary me-1">P{{ ev.periodNumber }}</span>
                    <strong>{{ ev.title }}</strong>
                    <small class="text-muted ms-2">{{ ev.subjectName }} · {{ ev.durationMinutes }} min</small>
                  </div>
                  <div>
                    <span class="badge text-bg-light border text-dark me-1">
                      Intentos: {{ ev.myAttemptsCount ?? 0 }}/{{ ev.maxAttempts }}
                    </span>
                    @if (ev.myBestScore !== null && ev.myBestScore !== undefined) {
                      <span class="badge text-bg-success">Mejor puntaje: {{ ev.myBestScore }}</span>
                    }
                  </div>
                </div>

                @if ((ev.myAttemptsCount ?? 0) < ev.maxAttempts && ev.questions.length > 0) {
                  @for (q of ev.questions; track q.id; let qi = $index) {
                    <div class="mb-2 p-2 rounded bg-light">
                      <div class="fw-semibold small mb-1">{{ qi + 1 }}. {{ q.questionText }} ({{ q.points }} pts)</div>
                      @for (opt of q.options; track opt.id) {
                        <div class="form-check small">
                          <input
                            class="form-check-input"
                            type="radio"
                            [name]="'q_' + ev.id + '_' + q.id"
                            [id]="'opt_' + opt.id"
                            (change)="selectOption(ev.id, q.id, opt.id)"
                          />
                          <label class="form-check-label" [for]="'opt_' + opt.id">
                            {{ opt.optionLabel }}) {{ opt.optionText }}
                          </label>
                        </div>
                      }
                    </div>
                  }
                  <div class="text-end mt-2">
                    <button type="button" class="btn btn-sm btn-primary" (click)="submitEvaluation(ev)">
                      Enviar Respuestas para Calificación
                    </button>
                  </div>
                } @else {
                  <p class="small text-muted mb-0">
                    {{ ev.questions.length === 0 ? 'Sin preguntas publicadas aún.' : 'Has completado todos los intentos permitidos.' }}
                  </p>
                }
              </div>
            } @empty {
              <p class="text-center text-muted py-4 mb-0">No hay evaluaciones en línea disponibles.</p>
            }
          }

          @case ('liveClasses') {
            <div class="row g-3">
              @for (lc of liveClasses(); track lc.id) {
                <div class="col-md-6">
                  <div class="border rounded p-3 h-100 d-flex flex-column justify-content-between">
                    <div>
                      <span class="badge text-bg-danger mb-2">CLASE EN VIVO</span>
                      <h6 class="fw-bold mb-1">{{ lc.title }}</h6>
                      <div class="small text-muted">{{ lc.subjectName }} · Prof. {{ lc.teacherName }}</div>
                      <div class="small text-muted mt-1">Inicio: {{ lc.scheduledStart }}</div>
                    </div>
                    <button type="button" class="btn btn-sm btn-primary mt-3" (click)="joinClass(lc)">
                      <i class="material-symbols-outlined fs-6 align-middle me-1">videocam</i>
                      Ingresar y Registrar Asistencia
                    </button>
                  </div>
                </div>
              } @empty {
                <div class="col-12 text-center text-muted py-4">No hay clases en vivo programadas.</div>
              }
            </div>
          }
        }
      </div>
    </div>
  `,
})
export class AcademicActivitiesComponent implements OnInit {
  private readonly portalService = inject(V3PortalService);
  protected readonly auth = inject(V3UnifiedAuthService);
  private readonly messages = inject(MessagesService);
  private readonly loadMask = inject(LoadMaskService);

  readonly academicYear = computed(() => this.auth.academicYear());
  readonly activeTab = signal<StudentLmsTab>('activities');
  readonly activities = signal<VirtualActivityRow[]>([]);
  readonly evaluations = signal<OnlineEvaluationRow[]>([]);
  readonly liveClasses = signal<LiveClassRow[]>([]);

  private readonly selectedAnswers = new Map<number, Map<number, number>>();

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.loadMask.show('Cargando aula virtual...');
    const year = this.academicYear();
    forkJoin({
      activities: this.portalService.listStudentActivities(year),
      evaluations: this.portalService.listStudentEvaluations(year),
      liveClasses: this.portalService.listStudentLiveClasses(year),
    })
      .pipe(finalize(() => this.loadMask.hide()))
      .subscribe({
        next: (res) => {
          this.activities.set(res.activities);
          this.evaluations.set(res.evaluations);
          this.liveClasses.set(res.liveClasses);
        },
      });
  }

  submitActivity(activityId: number, comment: string): void {
    if (!comment.trim()) {
      this.messages.showError('Escribe tu respuesta o enlace de entrega antes de enviar.');
      return;
    }
    this.portalService
      .submitStudentActivity(activityId, comment.trim(), this.academicYear())
      .subscribe(() => {
        this.messages.showSuccess('Entrega enviada correctamente.');
        this.loadAll();
      });
  }

  selectOption(evaluationId: number, questionId: number, optionId: number): void {
    const map = this.selectedAnswers.get(evaluationId) ?? new Map<number, number>();
    map.set(questionId, optionId);
    this.selectedAnswers.set(evaluationId, map);
  }

  submitEvaluation(ev: OnlineEvaluationRow): void {
    const map = this.selectedAnswers.get(ev.id);
    if (!map || map.size === 0) {
      this.messages.showError('Selecciona al menos una respuesta antes de enviar.');
      return;
    }
    const answers = Array.from(map.entries()).map(([questionId, selectedOptionId]) => ({
      questionId,
      selectedOptionId,
    }));
    this.loadMask.show('Calificando evaluación en servidor...');
    this.portalService
      .submitStudentEvaluation(ev.id, answers, this.academicYear())
      .pipe(finalize(() => this.loadMask.hide()))
      .subscribe((res) => {
        this.messages.showSuccess(
          `Evaluación enviada (Intento #${res.attemptNumber}). Puntaje: ${res.totalScore} / ${res.maxScore}.`,
        );
        this.loadAll();
      });
  }

  joinClass(lc: LiveClassRow): void {
    this.portalService
      .joinStudentLiveClass(lc.id, this.academicYear())
      .subscribe(({ meetingUrl }) => {
        window.open(meetingUrl, '_blank', 'noopener,noreferrer');
      });
  }
}
