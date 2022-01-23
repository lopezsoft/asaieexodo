import { OnInit, OnDestroy, Component } from '@angular/core';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CoreConfigService } from '@core/services/config.service';
import { environment } from 'environments/environment';

@Component({
  selector: 'footer',
  templateUrl: './footer.component.html'
})
export class FooterComponent implements OnInit, OnDestroy {
  public coreConfig: any;
  public year: number = new Date().getFullYear();

  // Private
  private _unsubscribeAll: Subject<any>;

  public version: string;

  /**
   * Constructor
   *
   * @param {CoreConfigService} _coreConfigService
   */
  constructor(public _coreConfigService: CoreConfigService) {
    // Set the private defaults
    this._unsubscribeAll = new Subject();
  }

  // Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    // Subscribe to config changes
    this._coreConfigService.config.pipe(takeUntil(this._unsubscribeAll)).subscribe(config => {
      this.coreConfig = config;
    });

    this.version  = environment.VERSION;
  }

  /**
   * On destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
