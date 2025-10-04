import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  CreateTransactionUseCase,
  ProcessTransactionUseCase,
  GetTransactionUseCase,
  GetTransactionsByAccountUseCase,
  GetTransactionByReferenceUseCase,
  GetPendingTransactionsUseCase,
  GetTransactionsByDateRangeUseCase,
  CancelTransactionUseCase,
} from '../../application/use-cases/transaction/transaction.use-cases';
import {
  CreateTransactionDto,
  UpdateTransactionDto,
  TransactionResponseDto,
  DateRangeDto,
} from '../dtos/transaction.dto';

@Controller('transactions')
export class TransactionController {
  constructor(
    private readonly createTransactionUseCase: CreateTransactionUseCase,
    private readonly processTransactionUseCase: ProcessTransactionUseCase,
    private readonly getTransactionUseCase: GetTransactionUseCase,
    private readonly getTransactionsByAccountUseCase: GetTransactionsByAccountUseCase,
    private readonly getTransactionByReferenceUseCase: GetTransactionByReferenceUseCase,
    private readonly getPendingTransactionsUseCase: GetPendingTransactionsUseCase,
    private readonly getTransactionsByDateRangeUseCase: GetTransactionsByDateRangeUseCase,
    private readonly cancelTransactionUseCase: CancelTransactionUseCase,
  ) {}

  @Post()
  async createTransaction(
    @Body() createTransactionDto: CreateTransactionDto,
  ): Promise<TransactionResponseDto> {
    const transaction =
      await this.createTransactionUseCase.execute(createTransactionDto);
    return this.mapToResponseDto(transaction);
  }

  @Put(':id/process')
  async processTransaction(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TransactionResponseDto> {
    const transaction = await this.processTransactionUseCase.execute(id);
    return this.mapToResponseDto(transaction);
  }

  @Put(':id/cancel')
  async cancelTransaction(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TransactionResponseDto> {
    const transaction = await this.cancelTransactionUseCase.execute(id);
    return this.mapToResponseDto(transaction);
  }

  @Get('pending')
  async getPendingTransactions(): Promise<TransactionResponseDto[]> {
    const transactions = await this.getPendingTransactionsUseCase.execute();
    return transactions.map(this.mapToResponseDto);
  }

  @Get('date-range')
  async getTransactionsByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<TransactionResponseDto[]> {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const transactions = await this.getTransactionsByDateRangeUseCase.execute(
      start,
      end,
    );
    return transactions.map(this.mapToResponseDto);
  }

  @Get(':id')
  async getTransactionById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TransactionResponseDto> {
    const transaction = await this.getTransactionUseCase.execute(id);
    return this.mapToResponseDto(transaction);
  }

  @Get('account/:accountId')
  async getTransactionsByAccount(
    @Param('accountId', ParseUUIDPipe) accountId: string,
  ): Promise<TransactionResponseDto[]> {
    const transactions =
      await this.getTransactionsByAccountUseCase.execute(accountId);
    return transactions.map(this.mapToResponseDto);
  }

  @Get('reference/:reference')
  async getTransactionByReference(
    @Param('reference') reference: string,
  ): Promise<TransactionResponseDto> {
    const transaction =
      await this.getTransactionByReferenceUseCase.execute(reference);
    return this.mapToResponseDto(transaction);
  }

  private mapToResponseDto(transaction: any): TransactionResponseDto {
    return {
      id: transaction.id,
      fromAccountId: transaction.fromAccountId,
      toAccountId: transaction.toAccountId,
      type: transaction.type,
      amount: transaction.amount,
      currency: transaction.currency,
      description: transaction.description,
      status: transaction.status,
      reference: transaction.reference,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    };
  }
}
