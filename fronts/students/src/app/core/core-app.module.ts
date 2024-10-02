import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgbModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { NouisliderModule } from 'ng2-nouislider';


import {ExodolibsModule} from "exodolibs";


import { CoreCommonModule } from '@core/common.module';
import { CoreSidebarModule } from '@core/components';
import { CoreTouchspinModule } from '@core/components/core-touchspin/core-touchspin.module';
import { ContentHeaderModule } from 'app/layout/components/content-header/content-header.module';

import {
  FooterFormComponent,
} from './index';

import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { UiSwitchModule } from 'ngx-ui-switch';

import { BlockUIModule } from 'ng-block-ui';
/*
  * Translation
*/
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
@NgModule({
  exports: [
    FooterFormComponent,
    UiSwitchModule,
    ReactiveFormsModule,
    NgSelectModule,
    BlockUIModule,
    NgbPaginationModule,
    NgbModule,
    NouisliderModule,
    CoreTouchspinModule,
    CoreSidebarModule,
    CoreCommonModule,
    TranslateModule,
    NgxDocViewerModule,
    ContentHeaderModule,
    FormsModule,
    ExodolibsModule,
  ],
  declarations: [
    FooterFormComponent,
  ],
  imports: [
    CommonModule,
    UiSwitchModule,
    BlockUIModule.forRoot(),
    ContentHeaderModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    NgbPaginationModule,
    NgbModule,
    NouisliderModule,
    CoreTouchspinModule,
    CoreSidebarModule,
    CoreCommonModule,
    ExodolibsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (http: HttpClient) => {
          return new TranslateHttpLoader(http);
        },
        deps: [HttpClient]
      }
    }),
  ],
})
export default class CoreAppModule { }
