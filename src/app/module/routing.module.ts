import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OperatorComponent } from '../component/operator/operator.component';

const appRoutes: Routes = [
  {
    path: 'operator',
    component: OperatorComponent,
  },
  {
    path: '',
    redirectTo: '/operator',
    pathMatch: 'full',
  },
  // { path: '**', component: PageNotFoundComponent } // TODO
];

@NgModule({
  imports: [
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: false }, // <-- debugging purposes only
    ),
  ],
  exports: [
    RouterModule,
  ],
  providers: [],
})
export class AppRoutingModule {
}
