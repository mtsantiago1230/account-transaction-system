import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionEntity } from '../../infrastructure/database/entities/transaction.entity';
import { AccountEntity } from '../../infrastructure/database/entities/account.entity';
import { SimpleTransactionController } from '../../interfaces/controllers/simple-transaction.controller';
import { SimpleTransactionService } from '../../application/services/simple-transaction.service';

@Module({
  imports: [TypeOrmModule.forFeature([TransactionEntity, AccountEntity])],
  controllers: [SimpleTransactionController],
  providers: [SimpleTransactionService],
  exports: [SimpleTransactionService],
})
export class SimpleTransactionModule {}
