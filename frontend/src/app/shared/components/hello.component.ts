import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HelloService, HelloResponse } from '../../core/services/hello.service';

@Component({
  selector: 'app-hello',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">Backend Connection Status</h2>

      @if (isLoading()) {
      <div class="flex items-center space-x-2">
        <div
          class="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"
        ></div>
        <span class="text-gray-600">Connecting to backend...</span>
      </div>
      } @if (message() && !isLoading()) {
      <div class="flex items-center space-x-2 text-green-700">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clip-rule="evenodd"
          ></path>
        </svg>
        <span class="font-medium">{{ message() }}</span>
      </div>
      } @if (error() && !isLoading()) {
      <div class="flex items-center space-x-2 text-red-700">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clip-rule="evenodd"
          ></path>
        </svg>
        <span class="font-medium">Connection failed: {{ error() }}</span>
      </div>
      }

      <button
        (click)="retryConnection()"
        [disabled]="isLoading()"
        class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {{ isLoading() ? 'Connecting...' : 'Retry Connection' }}
      </button>
    </div>
  `,
  styles: [],
})
export class HelloComponent implements OnInit {
  private helloService = inject(HelloService);

  isLoading = signal(false);
  message = signal<string>('');
  error = signal<string>('');

  ngOnInit(): void {
    this.fetchMessage();
  }

  private fetchMessage(): void {
    this.isLoading.set(true);
    this.message.set('');
    this.error.set('');

    this.helloService.getHello().subscribe({
      next: (response: HelloResponse) => {
        this.message.set(response.message);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Unknown error occurred');
        this.isLoading.set(false);
      },
    });
  }

  retryConnection(): void {
    this.fetchMessage();
  }
}
