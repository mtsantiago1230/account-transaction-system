import { Account, CreateAccountRequest, UpdateAccountRequest } from '../entities/account.entity';

export interface IAccountRepository {
  findById(id: string): Promise<Account | null>;
  findByUserId(userId: string): Promise<Account[]>;
  findByAccountNumber(accountNumber: string): Promise<Account | null>;
  findAll(): Promise<Account[]>;
  create(accountData: CreateAccountRequest): Promise<Account>;
  update(id: string, accountData: UpdateAccountRequest): Promise<Account | null>;
  delete(id: string): Promise<boolean>;
  updateBalance(id: string, newBalance: number): Promise<boolean>;
  findActiveAccountsByUserId(userId: string): Promise<Account[]>;
}