import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LoginCredentials } from '../../../core/models/auth.model';
import {
  ButtonComponent,
  CardComponent,
  LoadingSpinnerComponent,
} from '../../../shared/components';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, CardComponent],
  template: `
    <div
      class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
    >
      <div class="max-w-md w-full space-y-8">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            Access your account transaction system
          </p>
        </div>

        <app-card [padding]="true">
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <!-- Email Field -->
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div class="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autocomplete="email"
                  required
                  formControlName="email"
                  class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="Enter your email"
                  [class.border-red-500]="isFieldInvalid('email')"
                />
                <div *ngIf="isFieldInvalid('email')" class="mt-1 text-sm text-red-600">
                  <span *ngIf="loginForm.get('email')?.errors?.['required']"
                    >Email is required</span
                  >
                  <span *ngIf="loginForm.get('email')?.errors?.['email']"
                    >Please enter a valid email</span
                  >
                </div>
              </div>
            </div>

            <!-- Password Field -->
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div class="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autocomplete="current-password"
                  required
                  formControlName="password"
                  class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="Enter your password"
                  [class.border-red-500]="isFieldInvalid('password')"
                />
                <div *ngIf="isFieldInvalid('password')" class="mt-1 text-sm text-red-600">
                  <span *ngIf="loginForm.get('password')?.errors?.['required']"
                    >Password is required</span
                  >
                  <span *ngIf="loginForm.get('password')?.errors?.['minlength']"
                    >Password must be at least 6 characters</span
                  >
                </div>
              </div>
            </div>

            <!-- Error Message -->
            <div *ngIf="errorMessage()" class="rounded-md bg-red-50 p-4">
              <div class="flex">
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-red-800">Login Failed</h3>
                  <div class="mt-2 text-sm text-red-700">
                    {{ errorMessage() }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Submit Button -->
            <div>
              <app-button
                type="submit"
                variant="primary"
                [fullWidth]="true"
                [loading]="isLoading()"
                [disabled]="!loginForm.valid || isLoading()"
              >
                {{ isLoading() ? 'Signing in...' : 'Sign in' }}
              </app-button>
            </div>
          </form>
        </app-card>
      </div>
    </div>
  `,
  styles: [],
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid && !this.isLoading()) {
      this.isLoading.set(true);
      this.errorMessage.set(null);

      const credentials: LoginCredentials = this.loginForm.value;

      this.authService.login(credentials).subscribe({
        next: (response) => {
          this.isLoading.set(false);

          // Redirect to accounts page
          this.router.navigate(['/accounts']);
        },
        error: (error) => {
          this.isLoading.set(false);

          // Handle different error types
          if (error.status === 401) {
            this.errorMessage.set('Invalid email or password. Please try again.');
          } else if (error.status === 429) {
            this.errorMessage.set('Too many login attempts. Please try again later.');
          } else if (error.status === 0) {
            this.errorMessage.set(
              'Unable to connect to the server. Please check your internet connection.'
            );
          } else {
            this.errorMessage.set(
              error.message || 'An unexpected error occurred. Please try again.'
            );
          }
        },
      });
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}
