import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
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

      <div *ngIf="!loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          *ngFor="let account of accounts$ | async"
          class="cursor-pointer hover:shadow-lg transition-shadow"
        >
          <app-card
            [title]="account.accountType | titlecase"
            [subtitle]="account.accountNumber"
            (click)="viewAccountDetail(account.id)"
          >
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Balance</span>
                <span
                  class="text-lg font-semibold"
                  [class.text-green-600]="account.balance >= 0"
                  [class.text-red-600]="account.balance < 0"
                >
                  {{ account.balance | currency : account.currency }}
                </span>
              </div>

              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Status</span>
                <span
                  class="px-2 py-1 rounded-full text-xs font-medium"
                  [class.bg-green-100]="account.isActive"
                  [class.text-green-800]="account.isActive"
                  [class.bg-red-100]="!account.isActive"
                  [class.text-red-800]="!account.isActive"
                >
                  {{ account.isActive ? 'Active' : 'Inactive' }}
                </span>
              </div>

              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Currency</span>
                <span class="text-sm font-medium">{{ account.currency }}</span>
              </div>
            </div>

            <div slot="footer" class="flex space-x-2">
              <app-button variant="outline" size="sm" [fullWidth]="true"> Edit </app-button>
              <app-button variant="primary" size="sm" [fullWidth]="true"> View Details </app-button>
            </div>
          </app-card>
        </div>

        <div *ngIf="!loading && (accounts$ | async)?.length === 0" class="text-center py-12">
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

  constructor(private accountService: AccountService) {}

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
    // Navigate to create account form
    console.log('Navigate to create account');
  }

  viewAccountDetail(accountId: string): void {
    // Navigate to account detail
    console.log('Navigate to account detail:', accountId);
  }
}
