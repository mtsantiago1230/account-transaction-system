import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Observable, switchMap } from 'rxjs';
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
      <div *ngIf="loading" class="flex justify-center py-8">
        <app-loading-spinner size="lg" message="Loading account details..."></app-loading-spinner>
      </div>

      <div *ngIf="!loading">
        <div *ngIf="account$ | async as account">
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

          <!-- Account Overview Cards -->
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
                <div class="text-sm text-gray-600 mt-1">{{ account.currency }}</div>
              </div>
            </app-card>

            <app-card title="Account Status">
              <div class="text-center">
                <span
                  class="inline-flex px-4 py-2 rounded-full text-sm font-medium"
                  [class.bg-green-100]="account.isActive"
                  [class.text-green-800]="account.isActive"
                  [class.bg-red-100]="!account.isActive"
                  [class.text-red-800]="!account.isActive"
                >
                  {{ account.isActive ? 'Active' : 'Inactive' }}
                </span>
              </div>
            </app-card>

            <app-card title="Account Type">
              <div class="text-center">
                <div class="text-lg font-semibold">{{ account.accountType | titlecase }}</div>
                <div class="text-sm text-gray-600 mt-1">Account Type</div>
              </div>
            </app-card>
          </div>

          <!-- Recent Transactions -->
          <div class="bg-white shadow rounded-lg overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-medium text-gray-900">Recent Transactions</h2>
              <p class="text-sm text-gray-600">Latest account activity</p>
            </div>

            <div *ngIf="loadingTransactions" class="flex justify-center py-8">
              <app-loading-spinner message="Loading transactions..."></app-loading-spinner>
            </div>

            <div *ngIf="!loadingTransactions">
              <div *ngIf="transactions$ | async as transactions">
                <div *ngIf="transactions.length === 0" class="text-center py-8 text-gray-500">
                  No transactions found for this account.
                </div>

                <div *ngIf="transactions.length > 0">
                  <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                      <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                      <tr *ngFor="let transaction of transactions" class="hover:bg-gray-50">
                        <td class="px-6 py-4 whitespace-nowrap">
                          <div class="flex items-center">
                            <span
                              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                              [class.bg-green-100]="transaction.type === 'deposit'"
                              [class.text-green-800]="transaction.type === 'deposit'"
                              [class.bg-red-100]="transaction.type === 'withdrawal'"
                              [class.text-red-800]="transaction.type === 'withdrawal'"
                              [class.bg-blue-100]="transaction.type === 'transfer'"
                              [class.text-blue-800]="transaction.type === 'transfer'"
                              [class.bg-purple-100]="transaction.type === 'payment'"
                              [class.text-purple-800]="transaction.type === 'payment'"
                            >
                              {{ transaction.type | titlecase }}
                            </span>
                          </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <span
                            [class.text-green-600]="transaction.type === 'deposit'"
                            [class.text-red-600]="transaction.type === 'withdrawal'"
                            [class.text-gray-900]="transaction.type === 'transfer' || transaction.type === 'payment'"
                          >
                            {{ transaction.type === 'deposit' ? '+' : '-' }}{{ transaction.amount | currency : transaction.currency }}
                          </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {{ transaction.createdAt | date : 'short' }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <span
                            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                            [class.bg-green-100]="transaction.status === 'completed'"
                            [class.text-green-800]="transaction.status === 'completed'"
                            [class.bg-yellow-100]="transaction.status === 'pending'"
                            [class.text-yellow-800]="transaction.status === 'pending'"
                            [class.bg-red-100]="transaction.status === 'failed' || transaction.status === 'cancelled'"
                            [class.text-red-800]="transaction.status === 'failed' || transaction.status === 'cancelled'"
                          >
                            {{ transaction.status | titlecase }}
                          </span>
                        </td>
                        <td class="px-6 py-4 text-sm text-gray-900">
                          <div>{{ transaction.description }}</div>
                          <div class="text-xs text-gray-500">Ref: {{ transaction.reference }}</div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class AccountDetailComponent implements OnInit {
  account$!: Observable<Account>;
  transactions$!: Observable<Transaction[]>;
  loading = true;
  loadingTransactions = true;

  constructor(
    private route: ActivatedRoute,
    private accountService: AccountService,
    private transactionService: TransactionService
  ) {}

  ngOnInit(): void {
    this.loadAccountDetails();
  }

  loadAccountDetails(): void {
    this.loading = true;
    this.loadingTransactions = true;

    this.account$ = this.route.params.pipe(
      switchMap((params) => {
        const accountId = params['id'];
        return this.accountService.getAccountById(accountId);
      })
    );

    this.transactions$ = this.route.params.pipe(
      switchMap((params) => {
        const accountId = params['id'];
        return this.transactionService.getTransactionsByAccountId(accountId);
      })
    );

    // Simulate loading delays
    setTimeout(() => {
      this.loading = false;
    }, 500);

    setTimeout(() => {
      this.loadingTransactions = false;
    }, 800);
  }
}
