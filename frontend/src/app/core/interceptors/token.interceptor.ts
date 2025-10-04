import {
  HttpInterceptorFn,
  HttpErrorResponse,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError, BehaviorSubject, filter, take, Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * HTTP Interceptor that handles token refresh and automatic logout on authentication errors
 */
export const tokenInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 Unauthorized errors
      if (error.status === 401 && authService.isLoggedIn()) {
        return handle401Error(req, next, authService, router);
      }

      // Handle 403 Forbidden errors
      if (error.status === 403) {
        console.error('Access forbidden. Insufficient permissions.');
        // Optionally redirect to unauthorized page
        // router.navigate(['/unauthorized']);
      }

      return throwError(() => error);
    })
  );
};

let isRefreshing = false;
let refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

/**
 * Handle 401 errors by attempting token refresh or logging out
 */
function handle401Error(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService,
  router: Router
): Observable<HttpEvent<unknown>> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    // Attempt to refresh the token
    return authService.refreshToken().pipe(
      switchMap((tokenResponse: any) => {
        isRefreshing = false;
        refreshTokenSubject.next(tokenResponse.access_token);

        // Retry the failed request with the new token
        const authReq = req.clone({
          headers: req.headers.set('Authorization', `Bearer ${tokenResponse.access_token}`),
        });

        return next(authReq);
      }),
      catchError((refreshError) => {
        isRefreshing = false;

        // Token refresh failed, logout user
        authService.logout();
        router.navigate(['/login']);

        return throwError(() => refreshError);
      })
    );
  } else {
    // If already refreshing, wait for the refresh to complete
    return refreshTokenSubject.pipe(
      filter((token) => token !== null),
      take(1),
      switchMap((token) => {
        const authReq = req.clone({
          headers: req.headers.set('Authorization', `Bearer ${token}`),
        });
        return next(authReq);
      })
    );
  }
}
