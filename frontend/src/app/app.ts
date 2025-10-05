import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Navigation -->
      <nav class="bg-white shadow-sm border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <h1 class="text-xl font-bold text-gray-900">Account Transaction System</h1>
              </div>

              @if (authService.isAuthenticated()) {
              <div class="hidden md:ml-6 md:flex md:space-x-8">
                <a
                  routerLink="/accounts"
                  routerLinkActive="border-blue-500 text-gray-900"
                  class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Accounts
                </a>
              </div>
              }
            </div>

            <div class="flex items-center">
              @if (authService.isAuthenticated()) {
              <div class="flex items-center space-x-4">
                <span class="text-sm text-gray-700">
                  Welcome, {{ authService.currentUser()?.email }}
                </span>
                <button
                  (click)="logout()"
                  class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Logout
                </button>
              </div>
              } @else {
              <div class="flex items-center space-x-4">
                <a
                  routerLink="/login"
                  class="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </a>
              </div>
              }
            </div>
          </div>
        </div>
      </nav>

      <!-- Main Content -->
      <main>
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('Account Transaction System');

  constructor(protected authService: AuthService, private router: Router) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
