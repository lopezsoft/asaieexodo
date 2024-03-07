import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {GlobalSettingsService} from "../../Services/global-settings.service";
import {ISchoolParams, IStudent, IVotingData} from "../../interfaces/school-params.interface";
import {SchoolService} from "../../Services/school.service";
import {VotingService} from "../../Services/voting.service";
import {convertTo24HourFormat} from "../../Utils/Utils";
import {MessagesService} from "../../Services/messages.service";
import {FilterData} from "../../Common/filter-data";

@Component({
  selector: 'app-voting',
  templateUrl: './voting.component.html',
  styleUrl: './voting.component.scss'
})
export class VotingComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('votingCodeInput') votingCodeInput: ElementRef;
  public votingCode: string = '';
  public currentStudent: IStudent;
  public candidates: IVotingData[] = [];
  public selectedItems: IVotingData[] = [];
  protected readonly convertTo24HourFormat = convertTo24HourFormat;
  private interval: any;
  constructor(
        public aRoute: ActivatedRoute,
        public _globalSettings: GlobalSettingsService,
        public schoolService: SchoolService,
        public votingService: VotingService,
        public messageService: MessagesService
    ) { }

    ngOnInit() {
    }
    ngAfterViewInit(): void {
        this._globalSettings.schoolParams = this.aRoute.snapshot.params as ISchoolParams;
        this.schoolService.getSchool();
        this.votingService.getVotingData();
        this.runTimer();
    }
  getSchoolName() {
    return this._globalSettings?.schoolData?.nameschool || '';
  }
  
  codeValidation() {
    if (this.votingCode.length < 1) {
      this.messageService.errorMessage('Error', 'El código de votación es requerido.');
      return;
    }
    this._globalSettings.showBlockUI('Validando...');
    this.votingService.validateVotingCode(this.votingCode)
      .subscribe({
        next: (response: any) => {
          this._globalSettings.hideBlockUI();
          this.currentStudent = response.student;
          this.candidates     = FilterData.getCandidates(this.votingService.votingData, this.currentStudent);
        },
        error: (error) => {
          this._globalSettings.hideBlockUI();
          this.messageService.errorMessage('Error', error);
        }
      });
  }
  vote() {
    if (this.selectedItems.length === 0 ) {
      this.messageService.errorMessage('Error', 'Debe seleccionar al menos un candidato.');
      return;
    }
    this.messageService.confirm('Votar', '¿Está seguro de realizar la votación?')
      .then((response) => {
        if (response.isConfirmed) {
          this._globalSettings.showBlockUI('Enviando...');
          this.votingService.saveVoting(this.selectedItems, this.currentStudent.id)
            .subscribe({
              next: () => {
                this._globalSettings.hideBlockUI();
                this.messageService.onMessage('Votación', 'Votación realizada con éxito', 'success');
                this.clearData();
              },
              error: (error) => {
                this._globalSettings.hideBlockUI();
                this.messageService.errorMessage('Error', error);
              }
            });
        }
      });
  }
  
  closeVoting() {
    this.messageService.confirm('Cerrar', '¿Está seguro de cerrar la votación?')
      .then((response) => {
        if (response.isConfirmed) {
          this._globalSettings.showBlockUI('Cerrando...');
          this.votingService.closeVoting()
            .subscribe({
              next: () => {
                this._globalSettings.hideBlockUI();
                this.messageService.onMessage('Votación', 'Votación cerrada con éxito', 'success');
                this.clearData();
              },
              error: (error) => {
                this._globalSettings.hideBlockUI();
                this.messageService.errorMessage('Error', error);
              }
            });
        }
      });
  }
  
  runTimer() {
    this.interval = setInterval(() => {
      this.votingService.getVotingData();
    }, 60 * 2000);
  }
  ngOnDestroy(): void {
    clearInterval(this.interval);
  }
  selectCandidate(candidate: IVotingData) {
    const candidates = this.candidates.filter((c) => c.candidacy_id === candidate.candidacy_id);
    candidates.forEach((c) => c.selected = false);
    candidate.selected = !candidate.selected;
    this.selectedItems = this.candidates.filter((c) => c.selected);
  }
  hasCandidates(): boolean {
    return this.candidates.length > 0;
  }
  canVote(): boolean {
    return this.selectedItems.length > 0;
  }
  
  cancelVote() {
    this.messageService.confirm('Cancelar', '¿Está seguro de cancelar la votación?')
      .then((response) => {
        if (response.isConfirmed) {
          this.clearData();
        }
      });
  }
  
  private clearData() {
    this.candidates     = [];
    this.votingCode     = '';
    this.selectedItems  = [];
    this.votingService.votingData.forEach((c) => c.selected = false);
    if (this.votingCodeInput) {
      this.votingCodeInput?.nativeElement?.focus();
    }
  }
}
