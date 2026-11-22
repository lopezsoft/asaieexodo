import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { LoadMaskService } from '../../services/common/load-mask.service';
import { MessagesService } from '../../services/messages.service';
import { CloudFileRecord } from '../../services/v3-administration.service';
import {
  ActivitySubmissionRow,
  EvaluationAttemptRow,
  LiveClassRow,
  OnlineEvaluationRow,
  TeacherCourseSummary,
  V3PortalService,
  VirtualActivityRow,
} from '../../services/v3-portal.service';
import { V3UnifiedAuthService } from '../../services/v3-unified-auth.service';
import { V3FileManagerModalComponent } from '../../shared/components/v3-file-manager-modal/v3-file-manager-modal.component';
import { V3ModalDialogComponent } from '../../shared/components/v3-modal-dialog/v3-modal-dialog.component';
import {
  SearchableSelectOption,
  V3SearchableSelectComponent,
} from '../../shared/components/v3-searchable-select/v3-searchable-select.component';
import { CustomTooltipDirective } from '../../shared/directives/custom-tooltip.directive';

type LmsTab = 'activities' | 'evaluations' | 'liveClasses';

/**
 * Aula Virtual Docente: Actividades con fecha límite y recursos S3,
 * Calificación de Entregas, Evaluaciones en Línea autocalificables,
 * Clases en Vivo y Biblioteca de Material Educativo AWS S3
 * (paridad 100% con ActividadesAcademicas, Evaluaciones, TecherLiveClasses
 * y MaterialEducativo de asaie-teachers).
 */
@Component({
  selector: 'app-teacher-virtual-classroom',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    CustomTooltipDirective,
    V3ModalDialogComponent,
    V3FileManagerModalComponent,
    V3SearchableSelectComponent,
  ],
  template: `
    <div class="container-fluid py-3">
      <div class="breadcrumb-card mb-25 d-md-flex align-items-center justify-content-between">
        <div>
          <h5 class="mb-0 fw-bold">Aula Virtual Docente (LMS, Material y Clases en Vivo)</h5>
          <small class="text-muted">Año lectivo {{ academicYear() }}</small>
        </div>
        <div class="d-flex align-items-center gap-2">
          <button
            type="button"
            class="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
            (click)="resourcesModalOpen.set(true)"
            [appCustomTooltip]="'Subir y gestionar guías, PDFs y material educativo'"
          >
            <i class="material-symbols-outlined fs-6">cloud_upload</i>
            <span>Material Educativo</span>
          </button>
          <ol class="breadcrumb list-unstyled mt-0 mb-0 p-0">
            <li class="breadcrumb-item d-inline-block position-relative">
              <a routerLink="/teacher" class="d-inline-block position-relative">Portal Docente</a>
            </li>
            <li class="breadcrumb-item d-inline-block position-relative">Aula Virtual</li>
          </ol>
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
            <div class="v3-form-panel">
              <div class="row g-3">
                <div class="col-12 col-md-6">
                  <label class="form-label">Curso *</label>
                  <app-v3-searchable-select
                    [(ngModel)]="actForm.courseAssignmentId"
                    [options]="courseSelectOptions()"
                    placeholder="Seleccione curso..."
                    searchPlaceholder="Buscar curso..."
                  />
                </div>
                <div class="col-12 col-md-6">
                  <label class="form-label">Periodo</label>
                  <app-v3-searchable-select
                    [(ngModel)]="actForm.periodNumber"
                    [options]="periodOptions"
                    placeholder="Per."
                    searchPlaceholder="Buscar..."
                  />
                </div>
                <div class="col-12 col-md-6">
                  <label class="form-label">Título de la actividad *</label>
                  <input type="text" class="form-control" [(ngModel)]="actForm.title" placeholder="Taller de profundización..." />
                </div>
                <div class="col-12 col-md-6">
                  <label class="form-label">Fecha Límite</label>
                  <input type="datetime-local" class="form-control" [(ngModel)]="actForm.dueDate" />
                </div>
                <div class="col-12 col-md-6">
                  <label class="form-label">Instrucciones *</label>
                  <input type="text" class="form-control" [(ngModel)]="actForm.instructions" placeholder="Resuelve los ejercicios 1 al 10..." />
                </div>
                <div class="col-12 col-md-6">
                  <label class="form-label">URL Recurso o Guía Digital</label>
                  <div class="d-flex align-items-center gap-2">
                    <input type="text" class="form-control flex-grow-1" [(ngModel)]="actForm.resourceUrl" placeholder="https://... o adjuntar archivo" />
                    <button
                      type="button"
                      class="btn btn-sm btn-outline-secondary flex-shrink-0"
                      (click)="resourcesModalOpen.set(true)"
                      [appCustomTooltip]="'Adjuntar archivo del repositorio documental'"
                    >
                      Archivo
                    </button>
                  </div>
                </div>
                <div class="col-12 d-flex justify-content-end">
                  <button
                    type="button"
                    class="btn btn-sm btn-primary"
                    [disabled]="!actForm.courseAssignmentId || !actForm.title.trim() || !actForm.instructions.trim()"
                    (click)="createActivity()"
                  >
                    Publicar actividad
                  </button>
                </div>
              </div>
            </div>

            <div class="table-responsive">
              <table class="table table-hover v3-grid-table mb-0">
                <thead>
                  <tr>
                    <th>Curso</th>
                    <th>Per.</th>
                    <th>Actividad</th>
                    <th>Entrega Límite</th>
                    <th class="text-center">Entregas</th>
                    <th class="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  @for (a of activities(); track a.id) {
                    <tr>
                      <td class="small">{{ a.gradeGroupLabel }} · {{ a.subjectName }}</td>
                      <td>P{{ a.periodNumber }}</td>
                      <td>
                        <div class="fw-semibold">{{ a.title }}</div>
                        <small class="text-muted d-block">{{ a.instructions }}</small>
                        @if (a.resourceUrl) {
                          <a [href]="a.resourceUrl" target="_blank" rel="noopener noreferrer" class="small text-primary">
                            Ver material adjunto
                          </a>
                        }
                      </td>
                      <td class="small text-muted">{{ a.dueDate || 'Sin límite' }}</td>
                      <td class="text-center">
                        <span class="badge text-bg-info">{{ a.submissionsCount }}</span>
                      </td>
                      <td class="text-end text-nowrap">
                        <button type="button" class="btn btn-sm btn-outline-primary me-1" (click)="openSubmissions(a)" [appCustomTooltip]="'Ver y calificar entregas'">
                          Entregas
                        </button>
                        <button type="button" class="btn btn-sm btn-outline-danger" (click)="deleteActivity(a.id)" [appCustomTooltip]="'Eliminar actividad'">
                          <i class="material-symbols-outlined fs-6">delete</i>
                        </button>
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="6" class="text-center text-muted py-4">Sin actividades virtuales publicadas.</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }

          @case ('evaluations') {
            <div class="v3-form-panel">
              <div class="row g-3">
                <div class="col-12 col-md-6">
                  <label class="form-label">Curso *</label>
                  <app-v3-searchable-select
                    [(ngModel)]="evalForm.courseAssignmentId"
                    [options]="courseSelectOptions()"
                    placeholder="Seleccione curso..."
                    searchPlaceholder="Buscar curso..."
                  />
                </div>
                <div class="col-12 col-md-6">
                  <label class="form-label">Periodo</label>
                  <app-v3-searchable-select
                    [(ngModel)]="evalForm.periodNumber"
                    [options]="periodOptions"
                    placeholder="Per."
                    searchPlaceholder="Buscar..."
                  />
                </div>
                <div class="col-12">
                  <label class="form-label">Título de la Evaluación *</label>
                  <input type="text" class="form-control" [(ngModel)]="evalForm.title" placeholder="Parcial Periodo 1" />
                </div>
                <div class="col-12 col-md-6">
                  <label class="form-label">Duración (minutos)</label>
                  <input type="number" min="5" max="240" class="form-control" [(ngModel)]="evalForm.durationMinutes" />
                </div>
                <div class="col-12 col-md-6">
                  <label class="form-label">Máximo de intentos</label>
                  <input type="number" min="1" max="5" class="form-control" [(ngModel)]="evalForm.maxAttempts" />
                </div>
                <div class="col-12 d-flex justify-content-end">
                  <button
                    type="button"
                    class="btn btn-sm btn-primary"
                    [disabled]="!evalForm.courseAssignmentId || !evalForm.title.trim()"
                    (click)="createEvaluation()"
                  >
                    Crear Examen
                  </button>
                </div>
              </div>
            </div>

            @for (ev of evaluations(); track ev.id) {
              <div class="border rounded p-3 mb-3">
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <span class="badge text-bg-primary me-1">P{{ ev.periodNumber }}</span>
                    <strong>{{ ev.title }}</strong>
                    <small class="text-muted ms-2">{{ ev.gradeGroupLabel }} · {{ ev.subjectName }} · {{ ev.durationMinutes }} min · {{ ev.questions.length }} pregunta(s)</small>
                  </div>
                  <div class="text-nowrap">
                    <button type="button" class="btn btn-sm btn-outline-info me-1" (click)="openAttempts(ev)" [appCustomTooltip]="'Ver intentos y calificaciones'">
                      Resultados
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-danger" (click)="deleteEvaluation(ev.id)" [appCustomTooltip]="'Eliminar evaluación'">
                      <i class="material-symbols-outlined fs-6">delete</i>
                    </button>
                  </div>
                </div>

                <div class="v3-form-panel mb-2">
                  <div class="row g-3">
                    <div class="col-12 col-md-6">
                      <label class="form-label">Tipo de pregunta</label>
                      <app-v3-searchable-select
                        [ngModel]="getQuickQuestionType(ev.id)"
                        (ngModelChange)="quickQuestionTypes[ev.id] = $event ?? '2'"
                        [options]="questionTypeOptions"
                        placeholder="Tipo..."
                        searchPlaceholder="Buscar tipo..."
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <label class="form-label">Enunciado de la pregunta</label>
                      <input type="text" class="form-control" #qText placeholder="Enunciado de la pregunta..." />
                    </div>
                    <div class="col-12 col-md-6">
                      <label class="form-label">Opción A (Correcta)</label>
                      <input type="text" class="form-control" #optA placeholder="Opción A (Correcta)" />
                    </div>
                    <div class="col-12 col-md-6">
                      <label class="form-label">Opción B</label>
                      <input type="text" class="form-control" #optB placeholder="Opción B" />
                    </div>
                    <div class="col-12 col-md-6">
                      <label class="form-label">Opción C (Opcional)</label>
                      <input type="text" class="form-control" #optC placeholder="Opción C (Opcional)" />
                    </div>
                    <div class="col-12 col-md-6 d-flex align-items-end justify-content-md-end">
                      <button
                        type="button"
                        class="btn btn-sm btn-outline-primary"
                        (click)="addQuickQuestion(ev.id, getQuickQuestionType(ev.id), qText.value, optA.value, optB.value, optC.value); qText.value=''; optA.value=''; optB.value=''; optC.value=''"
                        [appCustomTooltip]="'Agregar pregunta a la evaluación'"
                      >
                        Agregar pregunta
                      </button>
                    </div>
                  </div>
                </div>

                <ol class="small mb-0">
                  @for (q of ev.questions; track q.id) {
                    <li class="mb-1 d-flex justify-content-between align-items-center">
                      <div>
                        <strong>{{ q.questionText }}</strong> ({{ q.points }} pts)
                        <span class="text-muted ms-1">
                          [@for (o of q.options; track o.id) {
                            <span [class.text-success]="o.isCorrect" [class.fw-bold]="o.isCorrect">{{ o.optionLabel }}: {{ o.optionText }} </span>
                          }]
                        </span>
                      </div>
                      <button
                        type="button"
                        class="btn btn-sm btn-link text-danger p-0 ms-2"
                        (click)="deleteQuestion(q.id)"
                        [appCustomTooltip]="'Eliminar pregunta'"
                      >
                        <i class="material-symbols-outlined fs-6">close</i>
                      </button>
                    </li>
                  }
                </ol>
              </div>
            } @empty {
              <p class="text-center text-muted py-4 mb-0">No hay evaluaciones en línea creadas.</p>
            }
          }

          @case ('liveClasses') {
            <div class="v3-form-panel">
              <div class="row g-3">
                <div class="col-12 col-md-6">
                  <label class="form-label">Curso *</label>
                  <app-v3-searchable-select
                    [(ngModel)]="liveForm.courseAssignmentId"
                    [options]="courseSelectOptions()"
                    placeholder="Seleccione curso..."
                    searchPlaceholder="Buscar curso..."
                  />
                </div>
                <div class="col-12 col-md-6">
                  <label class="form-label">Título de la Clase *</label>
                  <input type="text" class="form-control" [(ngModel)]="liveForm.title" placeholder="Sesión sincrónica de repaso" />
                </div>
                <div class="col-12 col-md-6">
                  <label class="form-label">URL de Reunión (Meet/Zoom/Jitsi) *</label>
                  <input type="url" class="form-control" [(ngModel)]="liveForm.meetingUrl" placeholder="https://meet.google.com/..." />
                </div>
                <div class="col-12 col-md-6">
                  <label class="form-label">Fecha y Hora *</label>
                  <input type="datetime-local" class="form-control" [(ngModel)]="liveForm.scheduledStart" />
                </div>
                <div class="col-12 d-flex justify-content-end">
                  <button
                    type="button"
                    class="btn btn-sm btn-primary"
                    [disabled]="!liveForm.courseAssignmentId || !liveForm.title.trim() || !liveForm.meetingUrl.trim()"
                    (click)="createLiveClass()"
                  >
                    Crear clase en vivo
                  </button>
                </div>
              </div>
            </div>

            <div class="table-responsive">
              <table class="table table-hover v3-grid-table mb-0">
                <thead>
                  <tr>
                    <th>Curso</th>
                    <th>Clase en Vivo</th>
                    <th>Fecha Programada</th>
                    <th class="text-center">Asistencias</th>
                    <th class="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  @for (lc of liveClasses(); track lc.id) {
                    <tr>
                      <td class="small">{{ lc.gradeGroupLabel }} · {{ lc.subjectName }}</td>
                      <td class="fw-semibold">{{ lc.title }}</td>
                      <td class="small">{{ lc.scheduledStart }}</td>
                      <td class="text-center"><span class="badge text-bg-success">{{ lc.attendancesCount }}</span></td>
                      <td class="text-end text-nowrap">
                        <a [href]="lc.meetingUrl" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-outline-primary me-1">
                          Abrir Sala
                        </a>
                        <button type="button" class="btn btn-sm btn-outline-danger" (click)="deleteLiveClass(lc.id)" [appCustomTooltip]="'Eliminar clase en vivo'">
                          <i class="material-symbols-outlined fs-6">delete</i>
                        </button>
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="5" class="text-center text-muted py-4">Sin clases en vivo programadas.</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        }
      </div>

      <!-- Modal entregas de actividad -->
      <app-v3-modal-dialog
        [open]="submissionsModalOpen()"
        [heading]="'Entregas · ' + selectedActivityTitle()"
        icon="assignment_turned_in"
        size="lg"
        (closed)="submissionsModalOpen.set(false)"
      >
        <div class="table-responsive">
          <table class="table table-sm align-middle mb-0">
            <thead>
              <tr>
                <th>Estudiante</th>
                <th>Respuesta</th>
                <th style="width: 90px;">Nota</th>
                <th>Retroalimentación</th>
                <th class="text-end">Calificar</th>
              </tr>
            </thead>
            <tbody>
              @for (s of submissions(); track s.id) {
                <tr>
                  <td class="fw-semibold small">{{ s.studentFullName }}</td>
                  <td class="small">{{ s.studentComment }}</td>
                  <td><input type="number" step="0.1" class="form-control form-control-sm" [value]="s.score ?? ''" #scIn /></td>
                  <td><input type="text" class="form-control form-control-sm" [value]="s.teacherFeedback ?? ''" #fbIn placeholder="Comentarios..." /></td>
                  <td class="text-end">
                    <button type="button" class="btn btn-sm btn-primary" (click)="gradeSubmission(s.id, scIn.value, fbIn.value)">Guardar</button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="text-center text-muted py-3">Aún no hay entregas de estudiantes.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </app-v3-modal-dialog>

      <!-- Modal intentos de evaluación -->
      <app-v3-modal-dialog
        [open]="attemptsModalOpen()"
        [heading]="'Intentos · ' + selectedEvalTitle()"
        icon="quiz"
        size="lg"
        (closed)="attemptsModalOpen.set(false)"
      >
        <div class="table-responsive">
          <table class="table table-sm align-middle mb-0">
            <thead>
              <tr>
                <th>Estudiante</th>
                <th class="text-center">Intento</th>
                <th class="text-center">Puntaje</th>
                <th>Enviado</th>
              </tr>
            </thead>
            <tbody>
              @for (a of attempts(); track a.id) {
                <tr>
                  <td class="fw-semibold">{{ a.studentFullName }}</td>
                  <td class="text-center">#{{ a.attemptNumber }}</td>
                  <td class="text-center fw-bold text-primary">{{ a.totalScore }}</td>
                  <td class="small text-muted">{{ a.submittedAt || '—' }}</td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="4" class="text-center text-muted py-3">Ningún estudiante ha presentado esta evaluación todavía.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </app-v3-modal-dialog>

      <!-- Biblioteca de Material Educativo -->
      <app-v3-file-manager-modal
        [open]="resourcesModalOpen()"
        heading="Material Educativo y Guías"
        category="VIRTUAL_ACTIVITIES"
        [canUpload]="canWriteResources()"
        [canDelete]="canWriteResources()"
        (closed)="resourcesModalOpen.set(false)"
        (fileUploaded)="onResourceUploaded($event)"
      />
    </div>
  `,
})
export class TeacherVirtualClassroomComponent implements OnInit {
  private readonly portalService = inject(V3PortalService);
  private readonly auth = inject(V3UnifiedAuthService);
  private readonly messages = inject(MessagesService);
  private readonly loadMask = inject(LoadMaskService);

  readonly academicYear = computed(() => this.auth.academicYear());
  readonly canWriteResources = computed(() =>
    this.auth.hasAnyPermission([
      'portal.teacher.own',
      'storage.academic_resources.write',
    ]),
  );
  readonly activeTab = signal<LmsTab>('activities');
  readonly courses = signal<TeacherCourseSummary[]>([]);
  readonly activities = signal<VirtualActivityRow[]>([]);
  readonly evaluations = signal<OnlineEvaluationRow[]>([]);
  readonly liveClasses = signal<LiveClassRow[]>([]);

  readonly submissionsModalOpen = signal(false);
  readonly selectedActivityTitle = signal('');
  readonly submissions = signal<ActivitySubmissionRow[]>([]);
  readonly attemptsModalOpen = signal(false);
  readonly selectedEvalTitle = signal('');
  readonly attempts = signal<EvaluationAttemptRow[]>([]);
  readonly resourcesModalOpen = signal(false);

  readonly periodOptions: SearchableSelectOption<number>[] = [1, 2, 3, 4].map((p) => ({
    value: p,
    label: `P${p}`,
  }));
  readonly questionTypeOptions: SearchableSelectOption<string>[] = [
    { value: '2', label: 'Única Respuesta' },
    { value: '3', label: 'Múltiple Respuesta' },
    { value: '4', label: 'Verdadero / Falso' },
    { value: '1', label: 'Pregunta Abierta' },
  ];
  readonly courseSelectOptions = computed<SearchableSelectOption<number>[]>(() =>
    this.courses().map((c) => ({
      value: c.id,
      label: `${c.gradeName}-${c.groupCode} · ${c.subjectName}`,
    }))
  );
  readonly quickQuestionTypes: Record<number, string> = {};

  getQuickQuestionType(evaluationId: number): string {
    return this.quickQuestionTypes[evaluationId] ?? '2';
  }

  actForm = {
    courseAssignmentId: 0,
    periodNumber: 1,
    title: '',
    instructions: '',
    dueDate: '',
    resourceUrl: '',
  };
  evalForm = { courseAssignmentId: 0, periodNumber: 1, title: '', durationMinutes: 45, maxAttempts: 1 };
  liveForm = {
    courseAssignmentId: 0,
    title: '',
    meetingUrl: '',
    scheduledStart: new Date().toISOString().slice(0, 16),
  };

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.loadMask.show('Cargando aula virtual...');
    forkJoin({
      courses: this.portalService.listTeacherCourses(this.academicYear()),
      activities: this.portalService.listTeacherActivities(),
      evaluations: this.portalService.listTeacherEvaluations(),
      liveClasses: this.portalService.listTeacherLiveClasses(),
    })
      .pipe(finalize(() => this.loadMask.hide()))
      .subscribe({
        next: (res) => {
          this.courses.set(res.courses);
          this.activities.set(res.activities);
          this.evaluations.set(res.evaluations);
          this.liveClasses.set(res.liveClasses);
          if (res.courses.length > 0 && !this.actForm.courseAssignmentId) {
            const firstId = res.courses[0].id;
            this.actForm.courseAssignmentId = firstId;
            this.evalForm.courseAssignmentId = firstId;
            this.liveForm.courseAssignmentId = firstId;
          }
        },
      });
  }

  onResourceUploaded(file: CloudFileRecord): void {
    this.actForm.resourceUrl = file.publicUrl || file.storageKey;
    this.messages.showSuccess(`Material "${file.fileName}" listo para adjuntar a la actividad.`);
  }

  createActivity(): void {
    this.portalService
      .createVirtualActivity({
        courseAssignmentId: Number(this.actForm.courseAssignmentId),
        periodNumber: Number(this.actForm.periodNumber),
        title: this.actForm.title.trim(),
        instructions: this.actForm.instructions.trim(),
        resourceUrl: this.actForm.resourceUrl.trim() || null,
        dueDate: this.actForm.dueDate ? new Date(this.actForm.dueDate).toISOString() : null,
        isPublished: true,
      })
      .subscribe(() => {
        this.messages.showSuccess('Actividad publicada en el aula virtual.');
        this.actForm.title = '';
        this.actForm.instructions = '';
        this.actForm.resourceUrl = '';
        this.actForm.dueDate = '';
        this.loadAll();
      });
  }

  deleteActivity(id: number): void {
    this.portalService.deleteVirtualActivity(id).subscribe(() => {
      this.messages.showSuccess('Actividad eliminada.');
      this.loadAll();
    });
  }

  openSubmissions(act: VirtualActivityRow): void {
    this.selectedActivityTitle.set(act.title);
    this.submissionsModalOpen.set(true);
    this.portalService
      .listActivitySubmissions(act.id)
      .subscribe((rows) => this.submissions.set(rows));
  }

  gradeSubmission(id: number, scoreRaw: string, feedback: string): void {
    this.portalService
      .gradeActivitySubmission(id, {
        score: Number(scoreRaw) || 0,
        teacherFeedback: feedback.trim() || null,
      })
      .subscribe(() => this.messages.showSuccess('Entrega calificada.'));
  }

  createEvaluation(): void {
    this.portalService
      .createOnlineEvaluation({
        courseAssignmentId: Number(this.evalForm.courseAssignmentId),
        periodNumber: Number(this.evalForm.periodNumber),
        title: this.evalForm.title.trim(),
        durationMinutes: Number(this.evalForm.durationMinutes) || 45,
        maxAttempts: Number(this.evalForm.maxAttempts) || 1,
        isPublished: true,
      })
      .subscribe(() => {
        this.messages.showSuccess('Evaluación en línea creada.');
        this.evalForm.title = '';
        this.loadAll();
      });
  }

  deleteEvaluation(id: number): void {
    this.portalService.deleteOnlineEvaluation(id).subscribe(() => {
      this.messages.showSuccess('Evaluación eliminada.');
      this.loadAll();
    });
  }

  addQuickQuestion(
    evalId: number,
    questionTypeRaw: string,
    text: string,
    optA: string,
    optB: string,
    optC: string,
  ): void {
    const questionTypeId = Number(questionTypeRaw) || 2;
    if (!text.trim()) return;
    let options: Array<{ optionLabel: string; optionText: string; isCorrect: boolean }> = [];
    if (questionTypeId === 4) {
      options = [
        { optionLabel: 'V', optionText: optA.trim() || 'Verdadero', isCorrect: true },
        { optionLabel: 'F', optionText: optB.trim() || 'Falso', isCorrect: false },
      ];
    } else if (questionTypeId !== 1) {
      if (!optA.trim() || !optB.trim()) return;
      options.push({ optionLabel: 'A', optionText: optA.trim(), isCorrect: true });
      options.push({ optionLabel: 'B', optionText: optB.trim(), isCorrect: false });
      if (optC.trim()) {
        options.push({ optionLabel: 'C', optionText: optC.trim(), isCorrect: false });
      }
    }
    this.portalService
      .addEvaluationQuestion(evalId, {
        questionTypeId,
        questionText: text.trim(),
        points: 1,
        options,
      })
      .subscribe(() => {
        this.messages.showSuccess('Pregunta agregada.');
        this.loadAll();
      });
  }

  deleteQuestion(questionId: number): void {
    this.portalService.deleteEvaluationQuestion(questionId).subscribe(() => {
      this.messages.showSuccess('Pregunta eliminada.');
      this.loadAll();
    });
  }

  openAttempts(ev: OnlineEvaluationRow): void {
    this.selectedEvalTitle.set(ev.title);
    this.attemptsModalOpen.set(true);
    this.portalService
      .listEvaluationAttempts(ev.id)
      .subscribe((rows) => this.attempts.set(rows));
  }

  createLiveClass(): void {
    this.portalService
      .createLiveClass({
        courseAssignmentId: Number(this.liveForm.courseAssignmentId),
        title: this.liveForm.title.trim(),
        meetingUrl: this.liveForm.meetingUrl.trim(),
        scheduledStart: new Date(this.liveForm.scheduledStart).toISOString(),
      })
      .subscribe(() => {
        this.messages.showSuccess('Clase en vivo programada.');
        this.liveForm.title = '';
        this.liveForm.meetingUrl = '';
        this.loadAll();
      });
  }

  deleteLiveClass(id: number): void {
    this.portalService.deleteLiveClass(id).subscribe(() => {
      this.messages.showSuccess('Clase en vivo eliminada.');
      this.loadAll();
    });
  }
}
