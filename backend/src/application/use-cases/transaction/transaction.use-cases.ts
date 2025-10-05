import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import type { ITransactionRepository } from '../../../domain/repositories/transaction.repository.interface';
import type { IAccountRepository } from '../../../domain/repositories/account.repository.interface';
import {
  Transaction,
  CreateTransactionRequest,
  UpdateTransactionRequest,
  TransactionStatus,
  TransactionType,
} from '../../../domain/entities/transaction.entity';

@Injectable()
export class CreateTransactionUseCase {
  constructor(
    @Inject('ITransactionRepository')
    private readonly transactionRepository: ITransactionRepository,
    @Inject('IAccountRepository')
    private readonly accountRepository: IAccountRepository,
  ) {}

  async execute(
    transactionData: CreateTransactionRequest,
  ): Promise<Transaction> {
    try {
      // Validate transaction type requirements FIRST
      if (transactionData.type === TransactionType.TRANSFER) {
        if (!transactionData.fromAccountId || !transactionData.toAccountId) {
          throw new BadRequestException(
            'Transfer requires both source and destination accounts',
          );
        }
      }

      if (transactionData.type === TransactionType.WITHDRAWAL) {
        if (!transactionData.fromAccountId) {
          throw new BadRequestException('Withdrawal requires source account');
        }
      }

      if (transactionData.type === TransactionType.DEPOSIT) {
        if (!transactionData.toAccountId) {
          throw new BadRequestException('Deposit requires destination account');
        }
      }

      // Validate amount
      if (transactionData.amount <= 0) {
        throw new BadRequestException('Transaction amount must be positive');
      }

      // Validate accounts exist and are active
      if (transactionData.fromAccountId) {
        const fromAccount = await this.accountRepository.findById(
          transactionData.fromAccountId,
        );
        if (!fromAccount) {
          throw new NotFoundException('Source account not found');
        }
        if (!fromAccount.isActive) {
          throw new BadRequestException('Source account is not active');
        }

        // CRITICAL: Check if withdrawal amount exceeds account balance
        if (transactionData.type === TransactionType.WITHDRAWAL) {
          if (transactionData.amount > fromAccount.balance) {
            throw new BadRequestException(
              'Insufficient balance for withdrawal',
            );
          }
        }
      }

      if (transactionData.toAccountId) {
        const toAccount = await this.accountRepository.findById(
          transactionData.toAccountId,
        );
        if (!toAccount) {
          throw new NotFoundException('Destination account not found');
        }
        if (!toAccount.isActive) {
          throw new BadRequestException('Destination account is not active');
        }
      }

      // Create transaction
      const result = await this.transactionRepository.create(transactionData);
      return result;
    } catch (error) {
      throw error;
    }
  }
}

@Injectable()
export class ProcessTransactionUseCase {
  constructor(
    @Inject('ITransactionRepository')
    private readonly transactionRepository: ITransactionRepository,
    @Inject('IAccountRepository')
    private readonly accountRepository: IAccountRepository,
  ) {}

  async execute(transactionId: string): Promise<Transaction> {
    const transaction =
      await this.transactionRepository.findById(transactionId);
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.status !== TransactionStatus.PENDING) {
      throw new BadRequestException('Transaction is not pending');
    }

    try {
      // Process based on transaction type
      switch (transaction.type) {
        case TransactionType.WITHDRAWAL:
          await this.processWithdrawal(transaction);
          break;
        case TransactionType.DEPOSIT:
          await this.processDeposit(transaction);
          break;
        case TransactionType.TRANSFER:
          await this.processTransfer(transaction);
          break;
        case TransactionType.PAYMENT:
          await this.processPayment(transaction);
          break;
      }

      // Update transaction status to completed
      await this.transactionRepository.updateStatus(
        transactionId,
        TransactionStatus.COMPLETED,
      );

      const updatedTransaction =
        await this.transactionRepository.findById(transactionId);
      return updatedTransaction!;
    } catch (error) {
      // Update transaction status to failed
      await this.transactionRepository.updateStatus(
        transactionId,
        TransactionStatus.FAILED,
      );
      throw error;
    }
  }

  private async processWithdrawal(transaction: Transaction): Promise<void> {
    if (!transaction.fromAccountId) {
      throw new BadRequestException('Source account required for withdrawal');
    }

    const account = await this.accountRepository.findById(
      transaction.fromAccountId,
    );
    if (!account) {
      throw new NotFoundException('Source account not found');
    }

    if (account.balance < transaction.amount) {
      throw new BadRequestException('Insufficient funds');
    }

    const newBalance = account.balance - transaction.amount;
    await this.accountRepository.updateBalance(
      transaction.fromAccountId,
      newBalance,
    );
  }

  private async processDeposit(transaction: Transaction): Promise<void> {
    if (!transaction.toAccountId) {
      throw new BadRequestException('Destination account required for deposit');
    }

    const account = await this.accountRepository.findById(
      transaction.toAccountId,
    );
    if (!account) {
      throw new NotFoundException('Destination account not found');
    }

    const newBalance = account.balance + transaction.amount;
    await this.accountRepository.updateBalance(
      transaction.toAccountId,
      newBalance,
    );
  }

  private async processTransfer(transaction: Transaction): Promise<void> {
    if (!transaction.fromAccountId || !transaction.toAccountId) {
      throw new BadRequestException('Both accounts required for transfer');
    }

    const fromAccount = await this.accountRepository.findById(
      transaction.fromAccountId,
    );
    const toAccount = await this.accountRepository.findById(
      transaction.toAccountId,
    );

    if (!fromAccount) {
      throw new NotFoundException('Source account not found');
    }
    if (!toAccount) {
      throw new NotFoundException('Destination account not found');
    }

    if (fromAccount.balance < transaction.amount) {
      throw new BadRequestException('Insufficient funds');
    }

    // Debit from source account
    const newFromBalance = fromAccount.balance - transaction.amount;
    await this.accountRepository.updateBalance(
      transaction.fromAccountId,
      newFromBalance,
    );

    // Credit to destination account
    const newToBalance = toAccount.balance + transaction.amount;
    await this.accountRepository.updateBalance(
      transaction.toAccountId,
      newToBalance,
    );
  }

  private async processPayment(transaction: Transaction): Promise<void> {
    // Similar to withdrawal for now, but could have different business logic
    await this.processWithdrawal(transaction);
  }
}

@Injectable()
export class GetTransactionUseCase {
  constructor(
    @Inject('ITransactionRepository')
    private readonly transactionRepository: ITransactionRepository,
  ) {}

  async execute(id: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findById(id);
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }
    return transaction;
  }
}

@Injectable()
export class GetTransactionsByAccountUseCase {
  constructor(
    @Inject('ITransactionRepository')
    private readonly transactionRepository: ITransactionRepository,
    @Inject('IAccountRepository')
    private readonly accountRepository: IAccountRepository,
  ) {}

  async execute(accountId: string): Promise<Transaction[]> {
    // Validate that the account exists
    const account = await this.accountRepository.findById(accountId);
    if (!account) {
      throw new NotFoundException('Account not found');
    }

    return this.transactionRepository.findByAccountId(accountId);
  }
}

@Injectable()
export class GetTransactionByReferenceUseCase {
  constructor(
    @Inject('ITransactionRepository')
    private readonly transactionRepository: ITransactionRepository,
  ) {}

  async execute(reference: string): Promise<Transaction> {
    const transaction =
      await this.transactionRepository.findByReference(reference);
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }
    return transaction;
  }
}

@Injectable()
export class GetPendingTransactionsUseCase {
  constructor(
    @Inject('ITransactionRepository')
    private readonly transactionRepository: ITransactionRepository,
  ) {}

  async execute(): Promise<Transaction[]> {
    return this.transactionRepository.findPendingTransactions();
  }
}

@Injectable()
export class GetTransactionsByDateRangeUseCase {
  constructor(
    @Inject('ITransactionRepository')
    private readonly transactionRepository: ITransactionRepository,
  ) {}

  async execute(startDate: Date, endDate: Date): Promise<Transaction[]> {
    return this.transactionRepository.findByDateRange(startDate, endDate);
  }
}

@Injectable()
export class CancelTransactionUseCase {
  constructor(
    @Inject('ITransactionRepository')
    private readonly transactionRepository: ITransactionRepository,
  ) {}

  async execute(transactionId: string): Promise<Transaction> {
    const transaction =
      await this.transactionRepository.findById(transactionId);
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.status !== TransactionStatus.PENDING) {
      throw new BadRequestException(
        'Only pending transactions can be cancelled',
      );
    }

    await this.transactionRepository.updateStatus(
      transactionId,
      TransactionStatus.CANCELLED,
    );

    const updatedTransaction =
      await this.transactionRepository.findById(transactionId);
    return updatedTransaction!;
  }
}

@Injectable()
export class GetAllTransactionsUseCase {
  constructor(
    @Inject('ITransactionRepository')
    private readonly transactionRepository: ITransactionRepository,
  ) {}

  async execute(): Promise<Transaction[]> {
    return await this.transactionRepository.findAll();
  }
}
