import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgbModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { NouisliderModule } from 'ng2-nouislider';

import { NgFallimgModule } from 'ng-fallimg';

import { NgxMaskModule, IConfig } from 'ngx-mask';
import {ExodolibsModule} from "exodolibs";

export const options: Partial<IConfig> | (() => Partial<IConfig>) = null;

import { CoreCommonModule } from '@core/common.module';
import { CoreSidebarModule } from '@core/components';
import { CoreTouchspinModule } from '@core/components/core-touchspin/core-touchspin.module';
import { ContentHeaderModule } from 'app/layout/components/content-header/content-header.module';

import {
  FooterFormComponent,
  CustomCardsFooterComponent,
  CustomCardsHeaderComponent,
  CustomCardsBodyComponent,
} from './index';

import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { NgxCurrencyModule } from "ngx-currency";
import { UiSwitchModule } from 'ngx-ui-switch';

export const customCurrencyMaskConfig = {
  align: "right",
  allowNegative: true,
  allowZero: true,
  decimal: ".",
  precision: 2,
  prefix: "$ ",
  suffix: "",
  thousands: ",",
  nullable: true
};
import { NgxSpinnerModule } from 'ngx-spinner';
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
    CustomCardsFooterComponent,
    CustomCardsHeaderComponent,
    CustomCardsBodyComponent,
    UiSwitchModule,
    NgxCurrencyModule,
    ReactiveFormsModule,
    NgSelectModule,
    NgxSpinnerModule,
    BlockUIModule,
    NgbPaginationModule,
    NgbModule,
    NouisliderModule,
    CoreTouchspinModule,
    CoreSidebarModule,
    CoreCommonModule,
    NgFallimgModule,
    TranslateModule,
    NgxDocViewerModule,
    ContentHeaderModule,
    FormsModule,
    NgxMaskModule,
    ExodolibsModule,
  ],
  declarations: [
    FooterFormComponent,
    CustomCardsFooterComponent,
    CustomCardsHeaderComponent,
    CustomCardsBodyComponent,
  ],
  imports: [
    CommonModule,
    UiSwitchModule,
    NgxCurrencyModule.forRoot(customCurrencyMaskConfig),
    NgxMaskModule.forRoot(),
    BlockUIModule.forRoot(),
    ContentHeaderModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    NgxSpinnerModule,
    NgbPaginationModule,
    NgbModule,
    NouisliderModule,
    CoreTouchspinModule,
    CoreSidebarModule,
    CoreCommonModule,
    NgFallimgModule,
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
