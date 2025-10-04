export interface Account {
  id: string;
  userId: string;
  accountNumber: string;
  accountType: AccountType;
  balance: number;
  currency: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum AccountType {
  CHECKING = 'checking',
  SAVINGS = 'savings',
  CREDIT = 'credit',
}

export interface CreateAccountRequest {
  userId: string;
  accountType: AccountType;
  currency: string;
  initialBalance?: number;
}

export interface UpdateAccountRequest {
  accountType?: AccountType;
  isActive?: boolean;
}