import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { AccountService } from '../../../core/services/account.service';
import { Account } from '../../../core/models/account.model';
import {
  LoadingSpinnerComponent,
  CardComponent,
  ButtonComponent,
} from '../../../shared/components';
import { CurrencyPipe } from '../../../shared/pipes';

@Component({
  selector: 'app-accounts-list',
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
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-900">Accounts</h1>
        <app-button variant="primary" (click)="createAccount()"> Create New Account </app-button>
      </div>

      <div *ngIf="loading" class="flex justify-center py-8">
        <app-loading-spinner size="lg" message="Loading accounts..."></app-loading-spinner>
      </div>

      <div *ngIf="!loading" class="bg-white shadow rounded-lg overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Account Number
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Holder Name
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Balance
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Type
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              *ngFor="let account of accounts$ | async"
              class="hover:bg-gray-50 cursor-pointer transition-colors"
              (click)="viewAccountDetail(account.id)"
            >
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ account.accountNumber }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ account.holderName }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <span
                  [class.text-green-600]="account.balance >= 0"
                  [class.text-red-600]="account.balance < 0"
                >
                  {{ account.balance | currency : account.currency }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span class="capitalize">{{ account.accountType }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="px-2 py-1 rounded-full text-xs font-medium"
                  [class.bg-green-100]="account.isActive"
                  [class.text-green-800]="account.isActive"
                  [class.bg-red-100]="!account.isActive"
                  [class.text-red-800]="!account.isActive"
                >
                  {{ account.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  (click)="$event.stopPropagation(); viewAccountDetail(account.id)"
                  class="text-indigo-600 hover:text-indigo-900"
                >
                  View Details
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div *ngIf="(accounts$ | async)?.length === 0" class="text-center py-12">
          <div class="text-gray-500 text-lg mb-4">No accounts found</div>
          <app-button variant="primary" (click)="createAccount()">
            Create Your First Account
          </app-button>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class AccountsListComponent implements OnInit {
  accounts$!: Observable<Account[]>;
  loading = true;

  constructor(private accountService: AccountService, private router: Router) {}

  ngOnInit(): void {
    this.loadAccounts();
  }

  loadAccounts(): void {
    this.loading = true;
    this.accounts$ = this.accountService.getAllAccounts();
    // Simulate loading delay
    setTimeout(() => {
      this.loading = false;
    }, 500);
  }

  createAccount(): void {
    this.router.navigate(['/accounts/create']);
  }

  viewAccountDetail(accountId: string): void {
    this.router.navigate(['/accounts', accountId]);
  }
}
