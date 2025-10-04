import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex justify-center items-center" [class]="containerClass">
      <div
        class="animate-spin rounded-full border-4 border-gray-300 border-t-primary-500"
        [class]="spinnerClass"
      ></div>
      <span *ngIf="message" class="ml-3 text-gray-600" [class]="textClass">{{ message }}</span>
    </div>
  `,
  styles: [],
})
export class LoadingSpinnerComponent {
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() message?: string;
  @Input() containerClass?: string;

  get spinnerClass(): string {
    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-8 w-8',
      lg: 'h-12 w-12',
    };
    return sizeClasses[this.size];
  }

  get textClass(): string {
    const textSizeClasses = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    };
    return textSizeClasses[this.size];
  }
}
