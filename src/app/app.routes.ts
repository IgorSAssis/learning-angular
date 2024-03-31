import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'request', pathMatch: 'full' },
  {
    path: 'request',
    loadComponent: () =>
      import('./features/request/request.component').then(
        (feature) => feature.RequestComponent
      ),
  },
];
