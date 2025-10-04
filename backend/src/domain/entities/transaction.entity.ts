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
}

export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  TRANSFER = 'transfer',
  PAYMENT = 'payment',
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export interface CreateTransactionRequest {
  fromAccountId?: string;
  toAccountId?: string;
  type: TransactionType;
  amount: number;
  currency: string;
  description: string;
}

export interface UpdateTransactionRequest {
  status?: TransactionStatus;
  description?: string;
}