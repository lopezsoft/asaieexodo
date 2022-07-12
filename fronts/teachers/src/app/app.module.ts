import { NgModule } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import 'hammerjs';
import { NgFallimgModule } from 'ng-fallimg';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastrModule } from 'ngx-toastr'; // For auth after login toast

import { CoreModule } from '@core/core.module';
import { CoreCommonModule } from '@core/common.module';
import { CoreSidebarModule, CoreThemeCustomizerModule } from '@core/components';

import { coreConfig } from 'app/app-config';

import { AppComponent } from 'app/app.component';
import { LayoutModule } from 'app/layout/layout.module';
import { SampleModule } from 'app/main/sample/sample.module';

import { SocketioService } from './utils';

import { HttpServerService } from './utils/http-server.service';
import { AuthInterceptor } from './interceptors/auth-interceptor';
import { AuthGuard } from './services/auth-guard.service';
import { ErrorInterceptor } from './auth/helpers';

import AppRoutingModule from './app-routing.module';

/*
  * Translation
*/
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';



@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
  
    TranslateModule.forRoot(),

    //NgBootstrap
    NgbModule,
    ToastrModule.forRoot(),
    AppRoutingModule,
    // Core modules
    CoreModule.forRoot(coreConfig),
    CoreCommonModule,
    CoreSidebarModule,
    CoreThemeCustomizerModule,
    NgFallimgModule.forRoot({
      default : 'assets/avatars/no-image.png',
      user    : 'assets/avatars/unknown_img.png',
      customer: 'assets/avatars/unknown_img.png',
      product : 'assets/img/Product_32px.png',
    }),
    TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: (http: HttpClient) => {
            return new TranslateHttpLoader(http);
          },
          deps: [ HttpClient ]
        }
    }),

    // App modules
    LayoutModule,
    SampleModule
  ],

  providers: [
    AuthGuard,
    FormBuilder,
    SocketioService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    HttpServerService
  ],

  bootstrap: [AppComponent]
})
export class AppModule {}
