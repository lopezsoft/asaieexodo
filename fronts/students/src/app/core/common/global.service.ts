import {Injectable, OnDestroy, OnInit} from '@angular/core';
import {HttpServerService, MessagesService} from '../../utils';
import {ActivatedRoute, Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {LoadMaskService} from './load-mask.service';
import {CoreConfigService} from '../../../@core/services/config.service';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {FormsValidatorsService} from "./forms-validators.service";

@Injectable({
  providedIn: 'root'
})
export class GlobalService implements OnInit, OnDestroy {
  public loading: boolean;
  public activeLang = 'es';
  public  maskSpinner 			= 'Realizando petición...';
  public coreConfig: any;

  private _unsubscribeAll: Subject<any>;
  constructor(
    public msg: MessagesService,
    public http: HttpServerService,
    public router: Router,
    public translate: TranslateService,
    public aRouter: ActivatedRoute,
    public coreConfigService: CoreConfigService,
    public frmValidation: FormsValidatorsService,
    public mask?: LoadMaskService,
    // @ts-ignore
  ) {
    const ts = this;
    ts.translate.setDefaultLang(ts.activeLang);
    ts.translate.use(ts.activeLang);
    ts._unsubscribeAll = new Subject();
  }

  ngOnInit(): void {
    const ts    = this;
    // Subscribe to config changes
    if (ts.coreConfigService) {
      ts.coreConfigService.config.pipe(takeUntil(ts._unsubscribeAll))
        .subscribe(config => {
          ts.coreConfig = config;
        });
    }
    ts.changeLanguage(ts.activeLang);
  }

  public changeLanguage(lang: string): void {
    this.activeLang = lang;
    this.translate.use(lang);
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next({});
    this._unsubscribeAll.complete();
  }

}
