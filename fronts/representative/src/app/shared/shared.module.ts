import { CommonModule, DecimalPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';
import { FeateherIconComponent } from './components/feateher-icon/feateher-icon.component';
import { FooterComponent } from './components/footer/footer.component';
import { ChatComponent } from './components/header/chat/chat.component';
import { HeaderComponent } from './components/header/header.component';
import { LanguageComponent } from './components/header/language/language.component';
import { MaximizeComponent } from './components/header/maximize/maximize.component';
import { ModeComponent } from './components/header/mode/mode.component';
import { MyAccountComponent } from './components/header/my-account/my-account.component';
import { NotificationComponent } from './components/header/notification/notification.component';
import { SearchComponent } from './components/header/search/search.component';
import { ContentComponent } from './components/layout/content/content.component';
import { FullComponent } from './components/layout/full/full.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { LoaderComponent } from './components/loader/loader.component';
import { TopToTopComponent } from './components/top-to-top/top-to-top.component';
import { ClickOutsideDirective } from './directives/click-outside.directive';
import {VotingModule} from "../components/voting/voting.module";

@NgModule({
  declarations: [
    ContentComponent,
    HeaderComponent,
    FooterComponent,
    SidebarComponent,
    SearchComponent,
    NotificationComponent,
    ChatComponent,
    FeateherIconComponent,
    FullComponent,
    BreadcrumbComponent,
    MyAccountComponent,
    ModeComponent,
    MaximizeComponent,
    LanguageComponent,
    LoaderComponent,
    TopToTopComponent,
    ClickOutsideDirective
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    VotingModule,
    TranslateModule.forRoot(),
  ],

  providers: [DecimalPipe],

  exports: [
    FeateherIconComponent,
    TranslateModule,
    LoaderComponent,
    TopToTopComponent,
    ClickOutsideDirective
  ],
})
export class SharedModule { }
