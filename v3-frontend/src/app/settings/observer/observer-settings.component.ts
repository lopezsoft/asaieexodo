import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { LoadMaskService } from '../../services/common/load-mask.service';
import { MessagesService } from '../../services/messages.service';
import {
  ObserverTemplateRecord,
  V3SettingsService,
} from '../../services/v3-settings.service';
import { V3UnifiedAuthService } from '../../services/v3-unified-auth.service';
import { CustomTooltipDirective } from '../../shared/directives/custom-tooltip.directive';

/**
 * Configuración del Observador del Estudiante
 * (reemplaza ModelosObservadorView, AspectosObservadorView y CriteriosAspectosObservadorView de ExtJS).
 */
@Component({
  selector: 'app-observer-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CustomTooltipDirective],
  template: `
    <div class="container-fluid py-3">
      <div class="breadcrumb-card mb-25 d-md-flex align-items-center justify-content-between">
        <div>
          <h5 class="mb-0 fw-bold">Configuración del Observador</h5>
          <small class="text-muted">Plantillas, aspectos/secciones y criterios institucionales</small>
        </div>
        <a routerLink="/settings" class="btn btn-sm btn-outline-secondary">Volver</a>
      </div>

      @if (canWrite()) {
        <div class="trezo-card bg-white border-radius p-4 mb-4 shadow-sm">
          <h6 class="fw-semibold mb-3">Nueva Plantilla de Observador</h6>
          <div class="row g-2 align-items-end">
            <div class="col-md-4">
              <label class="form-label small fw-semibold">Nombre del modelo *</label>
              <input type="text" class="form-control form-control-sm" [(ngModel)]="newTemplate.name" placeholder="Ej. Observador Institucional Modelo 5" />
            </div>
            <div class="col-md-6">
              <label class="form-label small fw-semibold">Descripción</label>
              <input type="text" class="form-control form-control-sm" [(ngModel)]="newTemplate.description" placeholder="Alcance del modelo" />
            </div>
            <div class="col-md-2 d-grid">
              <button type="button" class="btn btn-sm btn-primary" [disabled]="!newTemplate.name.trim()" (click)="createTemplate()">
                Crear modelo
              </button>
            </div>
          </div>
        </div>
      }

      @for (tpl of templates(); track tpl.id) {
        <div class="trezo-card bg-white border-radius p-4 mb-4 shadow-sm">
          <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 pb-3 mb-3 border-bottom">
            <div>
              <h5 class="mb-0 fw-semibold">{{ tpl.name }}</h5>
              @if (tpl.description) {
                <small class="text-muted">{{ tpl.description }}</small>
              }
            </div>
            @if (canAdmin()) {
              <button type="button" class="btn btn-sm btn-outline-danger" (click)="deleteTemplate(tpl)" [appCustomTooltip]="'Eliminar plantilla'">
                <i class="material-symbols-outlined fs-6">delete</i>
              </button>
            }
          </div>

          @if (canWrite()) {
            <div class="input-group input-group-sm mb-3">
              <input type="text" class="form-control" placeholder="Nuevo aspecto o sección..." [(ngModel)]="sectionDraft(tpl.id).title" />
              <div class="input-group-text">
                <input class="form-check-input mt-0 me-1" type="checkbox" [(ngModel)]="sectionDraft(tpl.id).isCoexistenceSection" />
                <span class="small">Convivencia</span>
              </div>
              <button type="button" class="btn btn-outline-primary" (click)="addSection(tpl.id)">Agregar aspecto</button>
            </div>
          }

          <div class="row g-3">
            @for (sec of tpl.sections; track sec.id) {
              <div class="col-lg-6">
                <div class="border rounded p-3 h-100">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <div>
                      <strong>{{ sec.title }}</strong>
                      @if (sec.isCoexistenceSection) {
                        <span class="badge text-bg-warning ms-2">Convivencia</span>
                      }
                    </div>
                    @if (canWrite()) {
                      <button type="button" class="btn btn-sm btn-link text-danger p-0" (click)="deleteSection(sec.id)" [appCustomTooltip]="'Eliminar aspecto'">
                        <i class="material-symbols-outlined fs-6">delete</i>
                      </button>
                    }
                  </div>
                  <ul class="list-group list-group-flush mb-2">
                    @for (crit of sec.criteria; track crit.id) {
                      <li class="list-group-item px-0 py-1 d-flex justify-content-between align-items-center small">
                        <span>{{ crit.description }}</span>
                        @if (canWrite()) {
                          <button type="button" class="btn btn-sm btn-link text-danger p-0" (click)="deleteCriteria(crit.id)" [appCustomTooltip]="'Eliminar criterio'">
                            <i class="material-symbols-outlined fs-6">close</i>
                          </button>
                        }
                      </li>
                    } @empty {
                      <li class="list-group-item px-0 py-1 small text-muted">Sin criterios registrados.</li>
                    }
                  </ul>
                  @if (canWrite()) {
                    <div class="input-group input-group-sm mt-2">
                      <input type="text" class="form-control" placeholder="Nuevo criterio..." [(ngModel)]="criteriaDraft(sec.id).description" />
                      <button type="button" class="btn btn-outline-success" (click)="addCriteria(sec.id)">+</button>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      } @empty {
        <div class="trezo-card bg-white border-radius p-5 text-center text-muted shadow-sm">
          No hay modelos de observador configurados todavía.
        </div>
      }
    </div>
  `,
})
export class ObserverSettingsComponent implements OnInit {
  private readonly settingsService = inject(V3SettingsService);
  private readonly v3Auth = inject(V3UnifiedAuthService);
  private readonly maskService = inject(LoadMaskService);
  private readonly messages = inject(MessagesService);

  readonly templates = signal<ObserverTemplateRecord[]>([]);
  newTemplate = { name: '', description: '' };

  private readonly secDrafts = new Map<number, { title: string; isCoexistenceSection: boolean }>();
  private readonly critDrafts = new Map<number, { description: string }>();

  readonly canAdmin = computed(() => {
    const r = this.v3Auth.activeRole();
    return r === 'SUPER_ADMIN' || r === 'SCHOOL_ADMIN' || r === 'RECTOR';
  });
  readonly canWrite = computed(
    () => this.canAdmin() || this.v3Auth.activeRole() === 'COORDINATOR',
  );

  ngOnInit(): void {
    this.loadTemplates();
  }

  loadTemplates(): void {
    this.settingsService.listObserverTemplates().subscribe((r) => this.templates.set(r));
  }

  sectionDraft(tplId: number) {
    let d = this.secDrafts.get(tplId);
    if (!d) {
      d = { title: '', isCoexistenceSection: false };
      this.secDrafts.set(tplId, d);
    }
    return d;
  }

  criteriaDraft(secId: number) {
    let d = this.critDrafts.get(secId);
    if (!d) {
      d = { description: '' };
      this.critDrafts.set(secId, d);
    }
    return d;
  }

  createTemplate(): void {
    this.maskService.show('messages.saving');
    this.settingsService
      .saveObserverTemplate({
        name: this.newTemplate.name,
        description: this.newTemplate.description || null,
      })
      .pipe(finalize(() => this.maskService.hide()))
      .subscribe(() => {
        this.newTemplate = { name: '', description: '' };
        this.messages.showSuccess('Plantilla de observador creada.');
        this.loadTemplates();
      });
  }

  deleteTemplate(tpl: ObserverTemplateRecord): void {
    void this.messages.confirmDelete(`¿Eliminar la plantilla "${tpl.name}"?`).then((r) => {
      if (r.isConfirmed) {
        this.settingsService.deleteObserverTemplate(tpl.id).subscribe(() => {
          this.messages.showSuccess('Plantilla eliminada.');
          this.loadTemplates();
        });
      }
    });
  }

  addSection(tplId: number): void {
    const d = this.sectionDraft(tplId);
    if (!d.title.trim()) {
      return;
    }
    this.settingsService.saveObserverSection(tplId, d).subscribe(() => {
      d.title = '';
      d.isCoexistenceSection = false;
      this.messages.showSuccess('Aspecto agregado.');
      this.loadTemplates();
    });
  }

  deleteSection(sectionId: number): void {
    this.settingsService.deleteObserverSection(sectionId).subscribe(() => {
      this.messages.showSuccess('Aspecto eliminado.');
      this.loadTemplates();
    });
  }

  addCriteria(secId: number): void {
    const d = this.criteriaDraft(secId);
    if (!d.description.trim()) {
      return;
    }
    this.settingsService.saveObserverCriteria(secId, d).subscribe(() => {
      d.description = '';
      this.messages.showSuccess('Criterio agregado.');
      this.loadTemplates();
    });
  }

  deleteCriteria(criteriaId: number): void {
    this.settingsService.deleteObserverCriteria(criteriaId).subscribe(() => {
      this.messages.showSuccess('Criterio eliminado.');
      this.loadTemplates();
    });
  }
}
