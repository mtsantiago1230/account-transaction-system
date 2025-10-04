import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { TransactionEntity } from '../database/entities/transaction.entity';
import { ITransactionRepository } from '../../domain/repositories/transaction.repository.interface';
import { Transaction, CreateTransactionRequest, UpdateTransactionRequest, TransactionStatus } from '../../domain/entities/transaction.entity';

@Injectable()
export class TransactionRepository implements ITransactionRepository {
  constructor(
    @InjectRepository(TransactionEntity)
    private readonly transactionRepository: Repository<TransactionEntity>,
  ) {}

  async findById(id: string): Promise<Transaction | null> {
    const transaction = await this.transactionRepository.findOne({ where: { id } });
    return transaction ? this.toDomain(transaction) : null;
  }

  async findByAccountId(accountId: string): Promise<Transaction[]> {
    const transactions = await this.transactionRepository.find({
      where: [
        { fromAccountId: accountId },
        { toAccountId: accountId }
      ],
      order: { createdAt: 'DESC' }
    });
    return transactions.map(this.toDomain);
  }

  async findByReference(reference: string): Promise<Transaction | null> {
    const transaction = await this.transactionRepository.findOne({ where: { reference } });
    return transaction ? this.toDomain(transaction) : null;
  }

  async findAll(): Promise<Transaction[]> {
    const transactions = await this.transactionRepository.find({
      order: { createdAt: 'DESC' }
    });
    return transactions.map(this.toDomain);
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]> {
    const transactions = await this.transactionRepository.find({
      where: {
        createdAt: Between(startDate, endDate)
      },
      order: { createdAt: 'DESC' }
    });
    return transactions.map(this.toDomain);
  }

  async create(transactionData: CreateTransactionRequest): Promise<Transaction> {
    const transaction = this.transactionRepository.create(transactionData);
    const savedTransaction = await this.transactionRepository.save(transaction);
    return this.toDomain(savedTransaction);
  }

  async update(id: string, transactionData: UpdateTransactionRequest): Promise<Transaction | null> {
    await this.transactionRepository.update(id, transactionData);
    const updatedTransaction = await this.transactionRepository.findOne({ where: { id } });
    return updatedTransaction ? this.toDomain(updatedTransaction) : null;
  }

  async updateStatus(id: string, status: TransactionStatus): Promise<boolean> {
    const result = await this.transactionRepository.update(id, { status });
    return (result.affected ?? 0) > 0;
  }

  async findPendingTransactions(): Promise<Transaction[]> {
    const transactions = await this.transactionRepository.find({
      where: { status: TransactionStatus.PENDING },
      order: { createdAt: 'ASC' }
    });
    return transactions.map(this.toDomain);
  }

  async findByAccountIdAndDateRange(accountId: string, startDate: Date, endDate: Date): Promise<Transaction[]> {
    const transactions = await this.transactionRepository.find({
      where: [
        {
          fromAccountId: accountId,
          createdAt: Between(startDate, endDate)
        },
        {
          toAccountId: accountId,
          createdAt: Between(startDate, endDate)
        }
      ],
      order: { createdAt: 'DESC' }
    });
    return transactions.map(this.toDomain);
  }

  private toDomain(transactionEntity: TransactionEntity): Transaction {
    return {
      id: transactionEntity.id,
      fromAccountId: transactionEntity.fromAccountId,
      toAccountId: transactionEntity.toAccountId,
      type: transactionEntity.type,
      amount: Number(transactionEntity.amount),
      currency: transactionEntity.currency,
      description: transactionEntity.description,
      status: transactionEntity.status,
      reference: transactionEntity.reference,
      createdAt: transactionEntity.createdAt,
      updatedAt: transactionEntity.updatedAt,
    };
  }
}