import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type"
      [disabled]="disabled || loading"
      [class]="buttonClasses"
      (click)="onClick()"
    >
      <div
        *ngIf="loading"
        class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"
      ></div>

      <ng-content></ng-content>
    </button>
  `,
  styles: [],
})
export class ButtonComponent {
  @Input() variant: 'primary' | 'secondary' | 'danger' | 'outline' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() fullWidth = false;

  onClick() {
    if (!this.disabled && !this.loading) {
      // Handle click
    }
  }

  get buttonClasses(): string {
    const baseClasses =
      'inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors';

    const variantClasses = {
      primary: 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500',
      secondary: 'bg-secondary-600 hover:bg-secondary-700 text-white focus:ring-secondary-500',
      danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
      outline:
        'border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 focus:ring-primary-500',
    };

    const sizeClasses = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    const disabledClasses = this.disabled || this.loading ? 'opacity-50 cursor-not-allowed' : '';
    const widthClasses = this.fullWidth ? 'w-full' : '';

    return [
      baseClasses,
      variantClasses[this.variant],
      sizeClasses[this.size],
      disabledClasses,
      widthClasses,
    ].join(' ');
  }
}
