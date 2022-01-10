import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgbModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { NouisliderModule } from 'ng2-nouislider';

import { SwiperConfigInterface, SwiperModule, SWIPER_CONFIG } from 'ngx-swiper-wrapper';

import { NgFallimgModule } from 'ng-fallimg';

import { QuillModule } from 'ngx-quill';

import { NgxMaskModule, IConfig } from 'ngx-mask';

export const options: Partial<IConfig> | (() => Partial<IConfig>) = null;

import { CoreCommonModule } from '@core/common.module';
import { CoreSidebarModule } from '@core/components';
import { CoreTouchspinModule } from '@core/components/core-touchspin/core-touchspin.module';

import { ContentHeaderModule } from 'app/layout/components/content-header/content-header.module';



import { FooterFormComponent,
	CustomCardsFooterComponent,
	CustomCardsHeaderComponent,
	CustomCardsBodyComponent,
} from './index';

import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { NgSelectModule } from '@ng-select/ng-select';

import { jqxGridModule } from 'jqwidgets-ng/jqxgrid';
import { jqxMenuModule } from 'jqwidgets-ng/jqxmenu';
import { jqxTabsModule } from 'jqwidgets-ng/jqxtabs';
import { jqxDataTableModule } from 'jqwidgets-ng/jqxdatatable';
import{ jqxEditorModule } from 'jqwidgets-ng/jqxeditor';
import { jqxComboBoxModule } from 'jqwidgets-ng/jqxcombobox';


import { NgxDocViewerModule } from 'ngx-doc-viewer';


import { NgxCurrencyModule } from "ngx-currency";
import { UiSwitchModule } from 'ngx-ui-switch';
export const customCurrencyMaskConfig = {
  align         : "right",
  allowNegative : true,
  allowZero     : true,
  decimal       : ".",
  precision     : 2,
  prefix        : "$ ",
  suffix        : "",
  thousands     : ",",
  nullable      : true
};
import { NgxSpinnerModule } from 'ngx-spinner';


/*
  * Translation
*/
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

const DEFAULT_SWIPER_CONFIG: SwiperConfigInterface = {
  direction: 'horizontal',
  observer: true
};


@NgModule({
    exports: [
		FooterFormComponent,
		CustomCardsFooterComponent,
		CustomCardsHeaderComponent,
		CustomCardsBodyComponent,
        UiSwitchModule,
        jqxTabsModule,
        NgxCurrencyModule,
        jqxMenuModule,
        jqxDataTableModule,
        jqxGridModule,
        ReactiveFormsModule,
        NgSelectModule,
        NgxSpinnerModule,
        NgbPaginationModule,
        NgbModule,
        NouisliderModule,
        SwiperModule,
        CoreTouchspinModule,
        CoreSidebarModule,
        CoreCommonModule,
        NgFallimgModule,
        TranslateModule,
        jqxEditorModule,
        jqxComboBoxModule,
        NgxDocViewerModule,
        QuillModule,
        ContentHeaderModule,
        FormsModule,
        NgxMaskModule,
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
        jqxTabsModule,
        NgxCurrencyModule.forRoot(customCurrencyMaskConfig),
        QuillModule.forRoot(),
        NgxMaskModule.forRoot(),
        ContentHeaderModule,
        FormsModule,
        jqxMenuModule,
        jqxDataTableModule,
        jqxGridModule,
        ReactiveFormsModule,
        NgSelectModule,
        NgxSpinnerModule,
        NgbPaginationModule,
        NgbModule,
        NouisliderModule,
        SwiperModule,
        CoreTouchspinModule,
        CoreSidebarModule,
        CoreCommonModule,
        NgFallimgModule,
        jqxEditorModule,
        jqxComboBoxModule,
        NgxDocViewerModule,
        TranslateModule.forRoot({
            loader: {
              provide: TranslateLoader,
              useFactory: (http: HttpClient) => {
                return new TranslateHttpLoader(http);
              },
              deps: [ HttpClient ]
            }
        }),
    ],
	providers: [
    {
      provide: SWIPER_CONFIG,
      useValue: DEFAULT_SWIPER_CONFIG
    }
  ]
})
export class CoreModule { }
