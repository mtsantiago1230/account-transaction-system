import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
    canActivate: [authGuard],
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/components/login.component').then((m) => m.LoginComponent),
    canActivate: [guestGuard], // Redirect authenticated users away from login
  },
  {
    path: 'accounts',
    loadComponent: () =>
      import('./features/accounts/components/accounts-list.component').then(
        (m) => m.AccountsListComponent
      ),
    canActivate: [authGuard], // Protect this route
  },
  {
    path: 'accounts/:id',
    loadComponent: () =>
      import('./features/account-detail/components/account-detail.component').then(
        (m) => m.AccountDetailComponent
      ),
    canActivate: [authGuard], // Protect this route
  },
  {
    path: '**',
    redirectTo: '/dashboard',
  },
];
