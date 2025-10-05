import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AccountService } from '../../../core/services/account.service';
import { AuthService } from '../../../core/services/auth.service';
import {
  CardComponent,
  ButtonComponent,
  LoadingSpinnerComponent,
} from '../../../shared/components';

@Component({
  selector: 'app-create-account',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardComponent,
    ButtonComponent,
    LoadingSpinnerComponent,
  ],
  template: `
    <div class="container mx-auto px-4 py-8 max-w-md">
      <app-card>
        <div class="text-center mb-6">
          <h1 class="text-2xl font-bold text-gray-900">Create New Account</h1>
          <p class="text-gray-600 mt-2">Fill in the details to create your account</p>
        </div>

        <form [formGroup]="accountForm" (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label for="holderName" class="block text-sm font-medium text-gray-700">
              Account Holder Name
            </label>
            <input
              type="text"
              id="holderName"
              formControlName="holderName"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter account holder name"
            />
            <div
              *ngIf="
                accountForm.get('holderName')?.invalid && accountForm.get('holderName')?.touched
              "
              class="mt-1 text-sm text-red-600"
            >
              Account holder name is required
            </div>
          </div>

          <div>
            <label for="accountType" class="block text-sm font-medium text-gray-700">
              Account Type
            </label>
            <input
              type="text"
              id="accountType"
              value="Savings Account"
              readonly
              class="mt-1 block w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm bg-gray-50 text-gray-700 cursor-not-allowed"
            />
            <p class="mt-1 text-xs text-gray-500">All accounts are Savings accounts</p>
          </div>

          <div>
            <label for="currency" class="block text-sm font-medium text-gray-700"> Currency </label>
            <select
              id="currency"
              formControlName="currency"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
            </select>
          </div>

          <div>
            <label for="initialBalance" class="block text-sm font-medium text-gray-700">
              Initial Balance (Optional)
            </label>
            <input
              type="number"
              id="initialBalance"
              formControlName="initialBalance"
              min="0"
              step="0.01"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="0.00"
            />
          </div>

          <div class="flex space-x-3 pt-4">
            <app-button type="button" variant="secondary" (click)="goBack()" class="flex-1">
              Cancel
            </app-button>
            <app-button
              type="submit"
              variant="primary"
              [disabled]="accountForm.invalid || loading"
              class="flex-1"
            >
              <span *ngIf="!loading">Create Account</span>
              <app-loading-spinner
                *ngIf="loading"
                size="sm"
                message="Creating..."
              ></app-loading-spinner>
            </app-button>
          </div>
        </form>
      </app-card>
    </div>
  `,
})
export class CreateAccountComponent implements OnInit {
  accountForm!: FormGroup;
  loading = false;
  currentUserId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private accountService: AccountService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getCurrentUser();
    this.initForm();
  }

  private getCurrentUser(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.currentUserId = user.sub;
    }
  }

  private initForm(): void {
    this.accountForm = this.fb.group({
      holderName: ['', [Validators.required, Validators.minLength(2)]],
      accountType: ['savings', Validators.required], // Default to savings since it's the only option
      currency: ['USD', Validators.required],
      initialBalance: [0, [Validators.min(0)]],
    });
  }

  onSubmit(): void {
    if (this.accountForm.valid && this.currentUserId) {
      this.loading = true;

      const formData = this.accountForm.value;
      const accountData = {
        userId: this.currentUserId,
        holderName: formData.holderName,
        accountType: formData.accountType,
        currency: formData.currency,
        initialBalance: formData.initialBalance || 0,
      };

      this.accountService.createAccount(accountData).subscribe({
        next: (response) => {
          this.loading = false;
          // Navigate back to accounts list
          this.router.navigate(['/accounts']);
        },
        error: (error) => {
          this.loading = false;
          // TODO: Add proper error handling/notification
        },
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/accounts']);
  }
}
