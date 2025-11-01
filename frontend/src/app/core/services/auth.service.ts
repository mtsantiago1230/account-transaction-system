import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, throwError } from 'rxjs';
import { LoginCredentials, AuthResponse, DecodedToken } from '../models/auth.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'current_user';

  // Reactive signals for authentication state
  private readonly _isAuthenticated = signal<boolean>(false);
  private readonly _currentUser = signal<DecodedToken | null>(null);

  // Public readonly signals
  public readonly isAuthenticated = this._isAuthenticated.asReadonly();
  public readonly currentUser = this._currentUser.asReadonly();

  // Computed values
  public readonly userEmail = computed(() => this._currentUser()?.email || null);
  public readonly userId = computed(() => this._currentUser()?.sub || null);

  constructor(private http: HttpClient) {
    this.initializeAuthState();
  }

  /**
   * Initialize authentication state from stored token
   */
  private initializeAuthState(): void {
    const token = this.getStoredToken();
    if (token && this.isTokenValid(token)) {
      const decodedToken = this.decodeToken(token);
      if (decodedToken) {
        this._currentUser.set(decodedToken);
        this._isAuthenticated.set(true);
      } else {
        this.clearAuthData();
      }
    } else {
      this.clearAuthData();
    }
  }

  /**
   * Login user with email and password
   */
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        this.setAuthData(response.access_token);
      })
    );
  }

  /**
   * Logout user and clear authentication data
   */
  logout(): void {
    this.clearAuthData();
  }

  /**
   * Get stored JWT token
   */
  getToken(): string | null {
    return this.getStoredToken();
  }

  /**
   * Check if user is authenticated
   */
  isLoggedIn(): boolean {
    return this._isAuthenticated();
  }

  /**
   * Refresh token (if your backend supports it)
   */
  refreshToken(): Observable<AuthResponse> {
    const token = this.getStoredToken();
    if (!token) {
      return throwError(() => new Error('No token available for refresh'));
    }

    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh`, { token }).pipe(
      tap((response) => {
        this.setAuthData(response.access_token);
      })
    );
  }

  /**
   * Validate user session
   */
  validateSession(): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/validate`);
  }

  /**
   * Store authentication data
   */
  private setAuthData(token: string): void {
    try {
      localStorage.setItem(this.TOKEN_KEY, token);

      const decodedToken = this.decodeToken(token);
      if (decodedToken) {
        localStorage.setItem(this.USER_KEY, JSON.stringify(decodedToken));
        this._currentUser.set(decodedToken);
        this._isAuthenticated.set(true);
      }
    } catch (error) {
      console.error('Error storing auth data:', error);
      this.clearAuthData();
    }
  }

  /**
   * Clear all authentication data
   */
  private clearAuthData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this._currentUser.set(null);
    this._isAuthenticated.set(false);
  }

  /**
   * Get token from localStorage
   */
  private getStoredToken(): string | null {
    try {
      return localStorage.getItem(this.TOKEN_KEY);
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      return null;
    }
  }

  /**
   * Decode JWT token
   */
  private decodeToken(token: string): DecodedToken | null {
    try {
      const payload = token.split('.')[1];
      const decodedPayload = atob(payload);
      return JSON.parse(decodedPayload) as DecodedToken;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  /**
   * Check if token is valid (not expired)
   */
  private isTokenValid(token: string): boolean {
    const decodedToken = this.decodeToken(token);
    if (!decodedToken) return false;

    const currentTime = Math.floor(Date.now() / 1000);
    return decodedToken.exp > currentTime;
  }

  /**
   * Check if token is about to expire (within 5 minutes)
   */
  isTokenExpiringSoon(): boolean {
    const token = this.getStoredToken();
    if (!token) return false;

    const decodedToken = this.decodeToken(token);
    if (!decodedToken) return false;

    const currentTime = Math.floor(Date.now() / 1000);
    const fiveMinutesFromNow = currentTime + 5 * 60;

    return decodedToken.exp <= fiveMinutesFromNow;
  }

  /**
   * Get user permissions/roles (if available in token)
   */
  getUserRoles(): string[] {
    const user = this._currentUser();
    return (user as any)?.roles || [];
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    return this.getUserRoles().includes(role);
  }
}
