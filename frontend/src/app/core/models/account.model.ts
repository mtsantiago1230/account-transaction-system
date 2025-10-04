export type AccountType = 'checking' | 'savings' | 'credit';

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
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface CreateAccountDto {
  userId: string;
  holderName: string;
  accountType: AccountType;
  currency?: string;
}

export interface UpdateAccountDto {
  accountType?: AccountType;
  isActive?: boolean;
}
