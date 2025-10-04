import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { HelloService } from '../../core/services/hello.service';
import { ButtonComponent } from '../../shared/components/button.component';
import { CardComponent } from '../../shared/components/card.component';
import { HelloComponent } from '../../shared/components/hello.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonComponent, CardComponent, HelloComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">
          Welcome back, {{ authService.currentUser()?.email }}!
        </h1>
        <p class="mt-2 text-gray-600">Manage your accounts and view your transaction history.</p>

        <!-- Backend Test Section -->
        <div class="mt-4 p-4 bg-blue-50 rounded-lg">
          <h2 class="text-lg font-semibold text-blue-900 mb-2">Backend Connection Test</h2>
          <app-button (click)="testBackend()" [loading]="isLoading()" variant="outline">
            Test Backend Connection
          </app-button>
          @if (backendMessage()) {
          <p class="mt-2 text-green-700 font-medium">{{ backendMessage() }}</p>
          } @if (errorMessage()) {
          <p class="mt-2 text-red-700">{{ errorMessage() }}</p>
          }
        </div>
      </div>

      <!-- Hello Component Demo -->
      <div class="mb-8">
        <app-hello></app-hello>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Quick Actions -->
        <app-card title="Account Management" class="col-span-1">
          <p class="text-gray-600 mb-4">
            View and manage your bank accounts, check balances, and account details.
          </p>
          <app-button routerLink="/accounts" [fullWidth]="true"> View Accounts </app-button>
        </app-card>

        <app-card title="Transaction History" class="col-span-1">
          <p class="text-gray-600 mb-4">Review your recent transactions and account activity.</p>
          <app-button variant="secondary" [fullWidth]="true" [disabled]="true">
            View Transactions
          </app-button>
        </app-card>

        <app-card title="Account Summary" class="col-span-1">
          <p class="text-gray-600 mb-4">Get an overview of all your accounts and total balance.</p>
          <app-button variant="outline" [fullWidth]="true" [disabled]="true">
            View Summary
          </app-button>
        </app-card>
      </div>

      <!-- Recent Activity Section -->
      <div class="mt-12">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
        <app-card>
          <div class="text-center py-12">
            <svg
              class="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No recent activity</h3>
            <p class="mt-1 text-sm text-gray-500">
              Your recent transactions and account changes will appear here.
            </p>
          </div>
        </app-card>
      </div>
    </div>
  `,
})
export class DashboardComponent {
  authService = inject(AuthService);
  helloService = inject(HelloService);

  isLoading = signal(false);
  backendMessage = signal<string>('');
  errorMessage = signal<string>('');

  testBackend(): void {
    this.isLoading.set(true);
    this.backendMessage.set('');
    this.errorMessage.set('');

    this.helloService.getHello().subscribe({
      next: (response) => {
        this.backendMessage.set(response.message);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorMessage.set('Failed to connect to backend: ' + error.message);
        this.isLoading.set(false);
      },
    });
  }
}
