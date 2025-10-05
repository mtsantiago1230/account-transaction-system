import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Auth Guard to protect routes that require authentication
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }
  // Store the attempted URL for redirecting after login
  const returnUrl = state.url;

  // Redirect to login page with return url
  router.navigate(['/login'], {
    queryParams: { returnUrl: returnUrl },
  });

  return false;
};

/**
 * Guest Guard to redirect authenticated users away from auth pages
 */
export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    return true;
  }

  // Redirect authenticated users to accounts page
  router.navigate(['/accounts']);
  return false;
};

/**
 * Role-based guard
 */
export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isLoggedIn()) {
      router.navigate(['/login']);
      return false;
    }

    const userRoles = authService.getUserRoles();
    const hasPermission = allowedRoles.some((role) => userRoles.includes(role));

    if (!hasPermission) {
      router.navigate(['/unauthorized']);
      return false;
    }

    return true;
  };
};
