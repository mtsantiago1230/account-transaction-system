import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountEntity } from '../database/entities/account.entity';
import { IAccountRepository } from '../../domain/repositories/account.repository.interface';
import { Account, CreateAccountRequest, UpdateAccountRequest } from '../../domain/entities/account.entity';

@Injectable()
export class AccountRepository implements IAccountRepository {
  constructor(
    @InjectRepository(AccountEntity)
    private readonly accountRepository: Repository<AccountEntity>,
  ) {}

  async findById(id: string): Promise<Account | null> {
    const account = await this.accountRepository.findOne({ where: { id } });
    return account ? this.toDomain(account) : null;
  }

  async findByUserId(userId: string): Promise<Account[]> {
    const accounts = await this.accountRepository.find({ where: { userId } });
    return accounts.map(this.toDomain);
  }

  async findByAccountNumber(accountNumber: string): Promise<Account | null> {
    const account = await this.accountRepository.findOne({ where: { accountNumber } });
    return account ? this.toDomain(account) : null;
  }

  async findAll(): Promise<Account[]> {
    const accounts = await this.accountRepository.find();
    return accounts.map(this.toDomain);
  }

  async create(accountData: CreateAccountRequest): Promise<Account> {
    // Generate account number
    const accountNumber = await this.generateAccountNumber();
    
    const account = this.accountRepository.create({
      ...accountData,
      accountNumber,
      balance: accountData.initialBalance || 0,
    });
    
    const savedAccount = await this.accountRepository.save(account);
    return this.toDomain(savedAccount);
  }

  async update(id: string, accountData: UpdateAccountRequest): Promise<Account | null> {
    await this.accountRepository.update(id, accountData);
    const updatedAccount = await this.accountRepository.findOne({ where: { id } });
    return updatedAccount ? this.toDomain(updatedAccount) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.accountRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async updateBalance(id: string, newBalance: number): Promise<boolean> {
    const result = await this.accountRepository.update(id, { balance: newBalance });
    return (result.affected ?? 0) > 0;
  }

  async findActiveAccountsByUserId(userId: string): Promise<Account[]> {
    const accounts = await this.accountRepository.find({ 
      where: { userId, isActive: true } 
    });
    return accounts.map(this.toDomain);
  }

  private async generateAccountNumber(): Promise<string> {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ACC${timestamp}${random}`;
  }

  private toDomain(accountEntity: AccountEntity): Account {
    return {
      id: accountEntity.id,
      userId: accountEntity.userId,
      accountNumber: accountEntity.accountNumber,
      accountType: accountEntity.accountType,
      balance: Number(accountEntity.balance),
      currency: accountEntity.currency,
      isActive: accountEntity.isActive,
      createdAt: accountEntity.createdAt,
      updatedAt: accountEntity.updatedAt,
    };
  }
}