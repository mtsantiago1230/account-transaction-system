import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionEntity } from '../../infrastructure/database/entities/transaction.entity';
import { TransactionRepository } from '../../infrastructure/repositories/transaction.repository';
import { TransactionController } from '../../interfaces/controllers/transaction.controller';
import {
  CreateTransactionUseCase,
  ProcessTransactionUseCase,
  GetTransactionUseCase,
  GetTransactionsByAccountUseCase,
  GetTransactionByReferenceUseCase,
  GetPendingTransactionsUseCase,
  GetTransactionsByDateRangeUseCase,
  CancelTransactionUseCase,
  GetAllTransactionsUseCase,
} from '../../application/use-cases/transaction/transaction.use-cases';
import { AccountModule } from '../account/account.module';

@Module({
  imports: [TypeOrmModule.forFeature([TransactionEntity]), AccountModule],
  controllers: [TransactionController],
  providers: [
    TransactionRepository,
    {
      provide: 'ITransactionRepository',
      useClass: TransactionRepository,
    },
    CreateTransactionUseCase,
    ProcessTransactionUseCase,
    GetTransactionUseCase,
    GetTransactionsByAccountUseCase,
    GetTransactionByReferenceUseCase,
    GetPendingTransactionsUseCase,
    GetTransactionsByDateRangeUseCase,
    CancelTransactionUseCase,
    GetAllTransactionsUseCase,
  ],
  exports: [TransactionRepository, 'ITransactionRepository'],
})
export class TransactionModule {}
