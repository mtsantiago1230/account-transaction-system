export interface Account {
  id: string;
  userId: string;
  holderName: string;
  accountNumber: string;
  accountType: AccountType;
  balance: number;
  currency: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum AccountType {
  SAVINGS = 'savings',
}

export interface CreateAccountRequest {
  userId: string;
  holderName: string;
  accountType: AccountType;
  currency: string;
  initialBalance?: number;
}

export interface UpdateAccountRequest {
  accountType?: AccountType;
  isActive?: boolean;
}
