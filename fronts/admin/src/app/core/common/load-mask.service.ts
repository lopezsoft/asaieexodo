import {TranslateService} from '@ngx-translate/core';
import {NgxSpinnerService} from 'ngx-spinner';
import {Injectable} from '@angular/core';
import {BlockUI, NgBlockUI} from 'ng-block-ui';
@Injectable({ providedIn: 'root' })
export class LoadMaskService {
    @BlockUI() blockUI: NgBlockUI;
    constructor(
        public translate: TranslateService,
        public spinner: NgxSpinnerService,
    ) {
        this.maskSpinner    = 'Realizando petición...';
        this.translate      = translate;
        this.spinner        = spinner;
    }
    public maskSpinner: string;
    public showSpinner(mask: string = ''): void {
        const ts = this;
        const lang = ts.translate;
        if (mask.length > 0) {
            ts.maskSpinner = mask;
        } else {
            ts.maskSpinner = lang.instant('messages.loading');
        }
        this.spinner.show(undefined,
            {
                type: 'ball-triangle-path',
                size: 'medium',
                bdColor: 'rgba(0, 0, 0, 0.8)',
                color: '#fff',
                fullScreen: true
            });
    }

    public hideSpinner(): void {
        this.spinner.hide();
    }
    /*
    * Block UI Message
    * */
    public showBlockUI(message?) {
        this.blockUI.start(message);
    }

    public hideBlockUI() {
        this.blockUI.stop();
    }
}
