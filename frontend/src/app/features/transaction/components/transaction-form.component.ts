import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SimpleTransactionService, SimpleTransactionDto, TransactionResult } from '../../../core/services/simple-transaction.service';
import { Account } from '../../../core/models/account.model';
import {
  LoadingSpinnerComponent,
  CardComponent,
  ButtonComponent,
} from '../../../shared/components';

@Component({
  selector: 'app-transaction-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LoadingSpinnerComponent,
    CardComponent,
    ButtonComponent,
  ],
  template: `
    <div class="max-w-md mx-auto">
      <app-card title="New Transaction">
        <form [formGroup]="transactionForm" (ngSubmit)="onSubmit()">
          <!-- Transaction Type -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Transaction Type
            </label>
            <select
              formControlName="type"
              class="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              [class.border-red-500]="transactionForm.get('type')?.invalid && transactionForm.get('type')?.touched"
            >
              <option value="">Select transaction type</option>
              <option value="deposit">Deposit</option>
              <option value="withdraw">Withdraw</option>
            </select>
            <div
              *ngIf="transactionForm.get('type')?.invalid && transactionForm.get('type')?.touched"
              class="mt-1 text-sm text-red-600"
            >
              Transaction type is required
            </div>
          </div>

          <!-- Amount -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Amount ({{ account?.currency || 'USD' }})
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              formControlName="amount"
              placeholder="Enter amount"
              class="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              [class.border-red-500]="transactionForm.get('amount')?.invalid && transactionForm.get('amount')?.touched"
            />
            <div
              *ngIf="transactionForm.get('amount')?.invalid && transactionForm.get('amount')?.touched"
              class="mt-1 text-sm text-red-600"
            >
              <div *ngIf="transactionForm.get('amount')?.errors?.['required']">
                Amount is required
              </div>
              <div *ngIf="transactionForm.get('amount')?.errors?.['min']">
                Amount must be greater than 0
              </div>
            </div>
          </div>

          <!-- Description -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              formControlName="description"
              rows="3"
              placeholder="Enter transaction description"
              class="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
          </div>

          <!-- Success Message -->
          <div *ngIf="successMessage" class="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p class="text-green-800 text-sm">{{ successMessage }}</p>
          </div>

          <!-- Error Message -->
          <div *ngIf="errorMessage" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p class="text-red-800 text-sm">{{ errorMessage }}</p>
          </div>

          <!-- Action Buttons -->
          <div class="flex space-x-3">
            <app-button
              type="button"
              variant="outline"
              class="flex-1"
              (click)="onCancel()"
              [disabled]="isSubmitting"
            >
              Cancel
            </app-button>
            <app-button
              type="submit"
              variant="primary"
              class="flex-1"
              [disabled]="transactionForm.invalid || isSubmitting"
            >
              <span *ngIf="!isSubmitting">Create Transaction</span>
              <span *ngIf="isSubmitting" class="flex items-center justify-center">
                <app-loading-spinner size="sm" class="mr-2"></app-loading-spinner>
                Processing...
              </span>
            </app-button>
          </div>
        </form>
      </app-card>
    </div>
  `,
  styles: [],
})
export class TransactionFormComponent implements OnInit {
  @Input() account: Account | null = null;
  @Output() transactionCreated = new EventEmitter<TransactionResult>();
  @Output() cancelled = new EventEmitter<void>();

  transactionForm: FormGroup;
  isSubmitting = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private simpleTransactionService: SimpleTransactionService
  ) {
    this.transactionForm = this.fb.group({
      type: ['', [Validators.required]],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      description: [''],
    });
  }

  ngOnInit(): void {
    if (!this.account) {
      this.errorMessage = 'Account information is required to create a transaction.';
    }
  }

  onSubmit(): void {
    if (this.transactionForm.valid && this.account) {
      this.isSubmitting = true;
      this.errorMessage = null;
      this.successMessage = null;

      const formValue = this.transactionForm.value;
      const transactionData: SimpleTransactionDto = {
        accountId: this.account.id,
        type: formValue.type,
        amount: parseFloat(formValue.amount),
        description: formValue.description || undefined,
      };

      console.log('Creating transaction:', transactionData);

      this.simpleTransactionService.createTransaction(transactionData).subscribe({
        next: (result) => {
          console.log('Transaction created successfully:', result);
          this.successMessage = `Transaction created successfully! New balance: ${result.newBalance.toFixed(2)} ${this.account?.currency || 'USD'}`;
          this.isSubmitting = false;
          this.transactionForm.reset();
          this.transactionCreated.emit(result);
          
          // Auto-close after success
          setTimeout(() => {
            this.onCancel();
          }, 2000);
        },
        error: (error) => {
          console.error('Error creating transaction:', error);
          this.errorMessage = error.error?.message || 'Failed to create transaction. Please try again.';
          this.isSubmitting = false;
        },
      });
    }
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}