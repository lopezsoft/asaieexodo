import {Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from '@angular/core';
import { interval, Observable, Subscription } from 'rxjs';
import { map, takeWhile } from 'rxjs/operators';
import * as moment from 'moment';
import {VotingService} from "../../../Services/voting.service";

@Component({
  selector: 'app-countdown',
  templateUrl: './count-down.component.html',
  styleUrl: './count-down.component.scss'
})
export class CountdownComponent implements OnInit, OnDestroy, OnChanges {
  @Output() closeTimer = new EventEmitter();
  @Input() targetDateString: string = ''; // Acepta la fecha como un string, p.ej. '2024-03-06T18:00:00'
  countdown$: Observable<string> | undefined;
  private subscription: Subscription | undefined;
  constructor(
    public votingService: VotingService
  ) {
  }
  ngOnInit() {
    this.startCountdown();
  }
  
  ngOnChanges(changes: SimpleChanges) {
    // Verifica si el cambio es en targetDateString y reinicia el contador
    const change = changes as any;
    if (change.targetDateString) {
      this.startCountdown();
    }
  }
  
  ngOnDestroy() {
    this.unsubscribe();
  }
  
  private startCountdown() {
    if (this.subscription) {
      this.unsubscribe();
    }
    
    // Convierte la fecha y hora de entrada a un objeto moment
    const targetMoment = moment(this.targetDateString, 'YYYY-MM-DD h:mm A');
    
    this.countdown$ = interval(1000).pipe(
      map(() => {
        const now = moment();
        const difference = targetMoment.diff(now);
        
        if (difference <= 0) {
          this.unsubscribe();
          this.votingService.hasError = true;
          this.votingService.errorMessage = 'La jornada a finalizado.';
          this.closeTimer.emit();
          return 'La jornada a finalizado.';
        } else {
          const duration = moment.duration(difference);
          const hours = Math.floor(duration.asHours());
          const minutes = duration.minutes();
          const seconds = duration.seconds();
          if (hours > 0) {
            return `<b>${hours}</b> horas, <b>${minutes}</b> minutos y <b>${seconds}</b> segundos restantes para finalizar la jornada.`;
          }
          return `<b>${minutes}</b> minutos y <b>${seconds}</b> segundos restantes  para finalizar la jornada.`;
        }
      }),
      takeWhile(message => message !== 'La jornada a finalizado.', true)
    );
    
    this.subscription = this.countdown$.subscribe();
  }
  
  private unsubscribe() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
