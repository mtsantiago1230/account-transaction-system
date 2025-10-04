import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="cardClasses">
      <div *ngIf="title || subtitle" class="px-6 py-4 border-b border-gray-200">
        <h3 *ngIf="title" class="text-lg font-medium text-gray-900">{{ title }}</h3>
        <p *ngIf="subtitle" class="mt-1 text-sm text-gray-600">{{ subtitle }}</p>
      </div>

      <div [class]="contentClasses">
        <ng-content></ng-content>
      </div>

      <div *ngIf="hasFooter" class="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
        <ng-content select="[slot=footer]"></ng-content>
      </div>
    </div>
  `,
  styles: [],
})
export class CardComponent {
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() padding = true;
  @Input() shadow: 'none' | 'sm' | 'md' | 'lg' = 'md';
  @Input() hasFooter = false;

  get cardClasses(): string {
    const baseClasses = 'bg-white rounded-lg border border-gray-200';

    const shadowClasses = {
      none: '',
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg',
    };

    return [baseClasses, shadowClasses[this.shadow]].join(' ');
  }

  get contentClasses(): string {
    return this.padding ? 'px-6 py-4' : '';
  }
}
