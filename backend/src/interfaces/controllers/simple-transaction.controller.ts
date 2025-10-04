import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { SimpleTransactionService } from '../../application/services/simple-transaction.service';
import type { TransactionResult } from '../../application/services/simple-transaction.service';
import { TransactionEntity } from '../../infrastructure/database/entities/transaction.entity';
import { CreateSimpleTransactionDto } from '../dtos/simple-transaction.dto';

@UseGuards(JwtAuthGuard)
@Controller('simple-transactions')
export class SimpleTransactionController {
  constructor(
    private readonly simpleTransactionService: SimpleTransactionService,
  ) {}

  @Post()
  async createTransaction(
    @Body() createTransactionDto: CreateSimpleTransactionDto,
  ): Promise<TransactionResult> {
    return await this.simpleTransactionService.createTransaction(
      createTransactionDto,
    );
  }

  @Get(':accountId')
  async getTransactionsByAccount(
    @Param('accountId', ParseUUIDPipe) accountId: string,
  ): Promise<TransactionEntity[]> {
    return await this.simpleTransactionService.getTransactionsByAccount(
      accountId,
    );
  }
}
