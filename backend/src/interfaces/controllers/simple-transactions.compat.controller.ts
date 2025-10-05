import {
  BadRequestException,
  Controller,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
  Body,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { GetTransactionsByAccountUseCase } from '../../application/use-cases/transaction/transaction.use-cases';
import type { IAccountRepository } from '../../domain/repositories/account.repository.interface';
import type { ITransactionRepository } from '../../domain/repositories/transaction.repository.interface';
import {
  TransactionStatus,
  TransactionType,
} from '../../domain/entities/transaction.entity';
import {
  IsUUID,
  IsEnum,
  IsNumber,
  IsPositive,
  IsOptional,
  IsString,
} from 'class-validator';

class SimpleTransactionCompatDto {
  @IsUUID()
  accountId!: string;

  @IsEnum(['deposit', 'withdraw'] as const)
  type!: 'deposit' | 'withdraw';

  @IsNumber()
  @IsPositive()
  amount!: number;

  @IsOptional()
  @IsString()
  description?: string;
}

@UseGuards(JwtAuthGuard)
@Controller('simple-transactions')
export class SimpleTransactionsCompatController {
  constructor(
    private readonly getTransactionsByAccountUseCase: GetTransactionsByAccountUseCase,
    @Inject('IAccountRepository')
    private readonly accountRepository: IAccountRepository,
    @Inject('ITransactionRepository')
    private readonly transactionRepository: ITransactionRepository,
  ) {}

  @Post()
  async create(@Body() dto: SimpleTransactionCompatDto) {
    const account = await this.accountRepository.findById(dto.accountId);
    if (!account) {
      throw new NotFoundException('Account not found');
    }

    const isDeposit = dto.type === 'deposit';
    const previousBalance = Number(account.balance);
    let newBalance = previousBalance;

    if (isDeposit) {
      newBalance = previousBalance + dto.amount;
    } else {
      // withdraw
      if (dto.amount > previousBalance) {
        throw new BadRequestException('Insufficient balance for withdrawal');
      }
      newBalance = previousBalance - dto.amount;
    }

    const balanceUpdated = await this.accountRepository.updateBalance(
      dto.accountId,
      newBalance,
    );
    if (!balanceUpdated) {
      throw new BadRequestException('Failed to update account balance');
    }

    const created = await this.transactionRepository.create({
      fromAccountId: isDeposit ? undefined : dto.accountId,
      toAccountId: isDeposit ? dto.accountId : undefined,
      type: isDeposit ? TransactionType.DEPOSIT : TransactionType.WITHDRAWAL,
      amount: dto.amount,
      currency: account.currency,
      description:
        dto.description ||
        `${isDeposit ? 'Deposit' : 'Withdrawal'} transaction`,
    });

    // Mark as completed to match legacy simple-transaction behavior
    await this.transactionRepository.updateStatus(
      created.id,
      TransactionStatus.COMPLETED,
    );
    const finalTx = await this.transactionRepository.findById(created.id);

    return {
      transactionId: finalTx!.id,
      accountId: dto.accountId,
      type: dto.type,
      amount: dto.amount,
      previousBalance,
      newBalance,
      createdAt: finalTx!.createdAt,
    };
  }

  @Get(':accountId')
  async getByAccount(@Param('accountId', ParseUUIDPipe) accountId: string) {
    // Ensure account exists
    const account = await this.accountRepository.findById(accountId);
    if (!account) {
      throw new NotFoundException('Account not found');
    }
    const txs = await this.getTransactionsByAccountUseCase.execute(accountId);
    return txs.map((tx) => ({
      id: tx.id,
      fromAccountId: tx.fromAccountId ?? null,
      toAccountId: tx.toAccountId ?? null,
      type: tx.type,
      amount: tx.amount,
      currency: tx.currency,
      description: tx.description,
      status: tx.status,
      reference: tx.reference,
      createdAt: tx.createdAt,
      updatedAt: tx.updatedAt,
    }));
  }
}
