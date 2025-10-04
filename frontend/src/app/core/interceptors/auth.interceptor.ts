import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * HTTP Interceptor that automatically attaches JWT token to API requests
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Get the JWT token
  const token = authService.getToken();

  // Debug logging
  console.log('Auth Interceptor - Request URL:', req.url);
  console.log('Auth Interceptor - Token exists:', !!token);
  console.log('Auth Interceptor - Token preview:', token ? token.substring(0, 20) + '...' : 'null');

  // If we have a token and the request is going to our API
  if (token && isApiRequest(req)) {
    console.log('Auth Interceptor - Adding Authorization header');
    // Clone the request and add the Authorization header
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`),
    });

    return next(authReq);
  }

  console.log('Auth Interceptor - Proceeding without Authorization header');
  // If no token or not an API request, proceed with original request
  return next(req);
};

/**
 * Check if the request is going to our API endpoints
 */
function isApiRequest(req: HttpRequest<any>): boolean {
  // Add your API base URLs here
  const apiUrls = ['http://localhost:3000', 'https://your-production-api.com'];

  return apiUrls.some((url) => req.url.startsWith(url));
}
