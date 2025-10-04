import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AccountService } from '../../../core/services/account.service';
import { TransactionService } from '../../../core/services/transaction.service';
import { Account } from '../../../core/models/account.model';
import { Transaction } from '../../../core/models/transaction.model';
import {
  LoadingSpinnerComponent,
  CardComponent,
  ButtonComponent,
} from '../../../shared/components';
import { CurrencyPipe } from '../../../shared/pipes';

@Component({
  selector: 'app-account-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LoadingSpinnerComponent,
    CardComponent,
    ButtonComponent,
    CurrencyPipe,
  ],
  template: `
    <div class="container mx-auto px-4 py-8">
      <!-- Loading State -->
      <div *ngIf="loading" class="flex justify-center py-8">
        <app-loading-spinner size="lg" message="Loading account details..."></app-loading-spinner>
      </div>

      <!-- Error State -->
      <div *ngIf="error && !loading" class="text-center py-8">
        <div class="bg-red-50 border border-red-200 rounded-md p-6">
          <h3 class="text-lg font-medium text-red-800 mb-2">Error Loading Account</h3>
          <p class="text-red-600">{{ error }}</p>
          <button
            (click)="retry()"
            class="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>

      <!-- Loaded State -->
      <div *ngIf="account && !loading && !error">
        <!-- Account Header -->
        <div class="mb-8">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h1 class="text-3xl font-bold text-gray-900">
                {{ account.accountType | titlecase }} Account
              </h1>
              <p class="text-gray-600">{{ account.accountNumber }}</p>
              <p class="text-lg font-medium text-gray-800">{{ account.holderName }}</p>
            </div>
            <div class="flex space-x-3">
              <app-button variant="outline">Edit Account</app-button>
              <app-button variant="primary">New Transaction</app-button>
            </div>
          </div>
        </div>

        <!-- Account Balance Card -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <app-card title="Current Balance">
            <div class="text-center">
              <div
                class="text-3xl font-bold"
                [class.text-green-600]="account.balance >= 0"
                [class.text-red-600]="account.balance < 0"
              >
                {{ account.balance | currency : account.currency }}
              </div>
            </div>
          </app-card>

          <app-card title="Account Type">
            <div class="text-center">
              <div class="text-xl font-medium capitalize">{{ account.accountType }}</div>
            </div>
          </app-card>

          <app-card title="Status">
            <div class="text-center">
              <span
                class="px-3 py-1 rounded-full text-sm font-medium"
                [class.bg-green-100]="account.isActive"
                [class.text-green-800]="account.isActive"
                [class.bg-red-100]="!account.isActive"
                [class.text-red-800]="!account.isActive"
              >
                {{ account.isActive ? 'Active' : 'Inactive' }}
              </span>
            </div>
          </app-card>
        </div>

        <!-- Transactions Section -->
        <app-card title="Recent Transactions">
          <div *ngIf="loadingTransactions" class="flex justify-center py-4">
            <app-loading-spinner size="sm" message="Loading transactions..."></app-loading-spinner>
          </div>

          <div *ngIf="transactionError && !loadingTransactions" class="text-center py-4">
            <p class="text-red-600">{{ transactionError }}</p>
            <button
              (click)="loadTransactions()"
              class="mt-2 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
            >
              Retry Loading Transactions
            </button>
          </div>

          <div *ngIf="transactions && !loadingTransactions && !transactionError">
            <div *ngIf="transactions.length === 0" class="text-center py-8 text-gray-500">
              No transactions found for this account.
            </div>

            <div *ngIf="transactions.length > 0" class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Type
                    </th>
                    <th
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Amount
                    </th>
                    <th
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Date
                    </th>
                    <th
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr *ngFor="let transaction of transactions" class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {{ transaction.type | titlecase }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span
                        [class.text-green-600]="transaction.amount >= 0"
                        [class.text-red-600]="transaction.amount < 0"
                      >
                        {{ transaction.amount | currency : 'USD' }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ transaction.createdAt | date : 'short' }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span
                        class="px-2 py-1 rounded-full text-xs font-medium"
                        [class.bg-green-100]="transaction.status === 'completed'"
                        [class.text-green-800]="transaction.status === 'completed'"
                        [class.bg-yellow-100]="transaction.status === 'pending'"
                        [class.text-yellow-800]="transaction.status === 'pending'"
                        [class.bg-red-100]="transaction.status === 'failed'"
                        [class.text-red-800]="transaction.status === 'failed'"
                        [class.bg-gray-100]="transaction.status === 'cancelled'"
                        [class.text-gray-800]="transaction.status === 'cancelled'"
                      >
                        {{ transaction.status | titlecase }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </app-card>
      </div>
    </div>
  `,
  styles: [],
})
export class AccountDetailComponent implements OnInit, OnDestroy {
  account: Account | null = null;
  transactions: Transaction[] | null = null;
  loading = true;
  loadingTransactions = true;
  error: string | null = null;
  transactionError: string | null = null;

  private accountId: string | null = null;
  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private accountService: AccountService,
    private transactionService: TransactionService
  ) {
    console.log('AccountDetailComponent constructor called');
  }

  ngOnInit(): void {
    console.log('AccountDetailComponent ngOnInit called');
    this.accountId = this.route.snapshot.paramMap.get('id');
    console.log('Account ID from route:', this.accountId);

    if (this.accountId) {
      this.loadAccountDetails();
    } else {
      this.error = 'No account ID provided';
      this.loading = false;
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  loadAccountDetails(): void {
    if (!this.accountId) return;

    console.log('Loading account details for ID:', this.accountId);
    this.loading = true;
    this.error = null;

    const accountSub = this.accountService.getAccountById(this.accountId).subscribe({
      next: (account) => {
        console.log('Account loaded successfully:', account);
        this.account = account;
        this.loading = false;
        this.loadTransactions();
      },
      error: (error) => {
        console.error('Error loading account:', error);
        this.error = 'Failed to load account details. Please try again.';
        this.loading = false;
      },
    });

    this.subscriptions.push(accountSub);
  }

  loadTransactions(): void {
    if (!this.accountId) return;

    console.log('Loading transactions for account ID:', this.accountId);
    this.loadingTransactions = true;
    this.transactionError = null;

    const transactionSub = this.transactionService
      .getTransactionsByAccountId(this.accountId)
      .subscribe({
        next: (transactions) => {
          console.log('Transactions loaded:', transactions);
          this.transactions = transactions;
          this.loadingTransactions = false;
        },
        error: (error) => {
          console.error('Error loading transactions:', error);
          this.transactionError = 'Failed to load transactions.';
          this.loadingTransactions = false;
        },
      });

    this.subscriptions.push(transactionSub);
  }

  retry(): void {
    this.loadAccountDetails();
  }
}
