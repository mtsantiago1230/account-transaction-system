export type TransactionType = 'deposit' | 'withdrawal' | 'transfer' | 'payment';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

export interface Transaction {
  id: string;
  fromAccountId?: string;
  toAccountId?: string;
  type: TransactionType;
  amount: number;
  currency: string;
  description: string;
  status: TransactionStatus;
  reference: string;
  createdAt: Date;
  updatedAt: Date;
  fromAccount?: {
    id: string;
    accountNumber: string;
    accountType: string;
  };
  toAccount?: {
    id: string;
    accountNumber: string;
    accountType: string;
  };
}

export interface CreateTransactionDto {
  fromAccountId?: string;
  toAccountId?: string;
  type: TransactionType;
  amount: number;
  currency: string;
  description: string;
}

export interface TransactionDateRangeQuery {
  startDate: string;
  endDate: string;
}
