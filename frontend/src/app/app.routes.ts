import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/accounts',
    pathMatch: 'full',
  },
  {
    path: 'accounts',
    loadComponent: () =>
      import('./features/accounts/components/accounts-list.component').then(
        (m) => m.AccountsListComponent
      ),
  },
  {
    path: 'accounts/:id',
    loadComponent: () =>
      import('./features/account-detail/components/account-detail.component').then(
        (m) => m.AccountDetailComponent
      ),
  },
  {
    path: '**',
    redirectTo: '/accounts',
  },
];
