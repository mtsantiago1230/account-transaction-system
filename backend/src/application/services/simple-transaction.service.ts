import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionEntity } from '../../infrastructure/database/entities/transaction.entity';
import { AccountEntity } from '../../infrastructure/database/entities/account.entity';
import {
  TransactionType,
  TransactionStatus,
} from '../../domain/entities/transaction.entity';
import { CreateSimpleTransactionDto } from '../../interfaces/dtos/simple-transaction.dto';

export interface TransactionResult {
  transactionId: string;
  accountId: string;
  type: string;
  amount: number;
  previousBalance: number;
  newBalance: number;
  createdAt: Date;
}

@Injectable()
export class SimpleTransactionService {
  constructor(
    @InjectRepository(TransactionEntity)
    private readonly transactionRepository: Repository<TransactionEntity>,
    @InjectRepository(AccountEntity)
    private readonly accountRepository: Repository<AccountEntity>,
  ) {}

  async createTransaction(
    dto: CreateSimpleTransactionDto,
  ): Promise<TransactionResult> {
    // Start a database transaction to ensure data consistency
    return await this.accountRepository.manager.transaction(async (manager) => {
      // Find and lock the account for update
      const account = await manager.findOne(AccountEntity, {
        where: { id: dto.accountId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!account) {
        throw new NotFoundException('Account not found');
      }

      if (!account.isActive) {
        throw new BadRequestException('Account is not active');
      }

      const previousBalance = Number(account.balance);
      let newBalance = previousBalance;

      // Apply business logic based on transaction type
      if (dto.type === 'deposit') {
        newBalance = previousBalance + dto.amount;
      } else if (dto.type === 'withdraw') {
        if (previousBalance < dto.amount) {
          throw new BadRequestException(
            `Insufficient balance. Available: ${previousBalance}, Required: ${dto.amount}`,
          );
        }
        newBalance = previousBalance - dto.amount;
      } else {
        throw new BadRequestException(
          'Invalid transaction type. Must be "deposit" or "withdraw"',
        );
      }

      // Update account balance
      await manager.update(AccountEntity, dto.accountId, {
        balance: newBalance,
      });

      // Create transaction record
      const transactionData: Partial<TransactionEntity> = {
        fromAccountId: dto.type === 'withdraw' ? dto.accountId : undefined,
        toAccountId: dto.type === 'deposit' ? dto.accountId : undefined,
        type:
          dto.type === 'deposit'
            ? TransactionType.DEPOSIT
            : TransactionType.WITHDRAWAL,
        amount: dto.amount,
        currency: account.currency,
        description:
          dto.description ||
          `${dto.type.charAt(0).toUpperCase() + dto.type.slice(1)} transaction`,
        status: TransactionStatus.COMPLETED,
      };

      const transactionEntity = manager.create(
        TransactionEntity,
        transactionData,
      );
      const savedTransaction = await manager.save(transactionEntity);

      return {
        transactionId: savedTransaction.id,
        accountId: dto.accountId,
        type: dto.type,
        amount: dto.amount,
        previousBalance,
        newBalance,
        createdAt: savedTransaction.createdAt,
      };
    });
  }

  async getTransactionsByAccount(
    accountId: string,
  ): Promise<TransactionEntity[]> {
    const account = await this.accountRepository.findOne({
      where: { id: accountId },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    return await this.transactionRepository.find({
      where: [{ fromAccountId: accountId }, { toAccountId: accountId }],
      order: { createdAt: 'DESC' },
    });
  }
}
