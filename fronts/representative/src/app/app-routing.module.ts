import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContentComponent } from './shared/components/layout/content/content.component';
import { content } from './shared/routes/routes';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'voting/0/0/0',
    pathMatch: 'full'
  },

  {
    path: '',
    component: ContentComponent,
    children: content
  },
  
];

@NgModule({
  imports: [RouterModule.forRoot(
      routes,
        {
            scrollPositionRestoration: 'enabled',
            anchorScrolling: 'enabled',
            scrollOffset: [0, 64],
            useHash: true
        }
  )],
  exports: [RouterModule]
})
export class AppRoutingModule { }
