import {
  Transaction,
  CreateTransactionRequest,
  UpdateTransactionRequest,
  TransactionStatus,
} from '../entities/transaction.entity';

export interface ITransactionRepository {
  findById(id: string): Promise<Transaction | null>;
  findByAccountId(accountId: string): Promise<Transaction[]>;
  findByReference(reference: string): Promise<Transaction | null>;
  findAll(): Promise<Transaction[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]>;
  create(transactionData: CreateTransactionRequest): Promise<Transaction>;
  update(
    id: string,
    transactionData: UpdateTransactionRequest,
  ): Promise<Transaction | null>;
  updateStatus(id: string, status: TransactionStatus): Promise<boolean>;
  findPendingTransactions(): Promise<Transaction[]>;
  findByAccountIdAndDateRange(
    accountId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Transaction[]>;
}
