import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import {
  CreateAccountUseCase,
  GetAccountUseCase,
  GetAccountsByUserUseCase,
  GetActiveAccountsByUserUseCase,
  UpdateAccountUseCase,
  GetAccountByNumberUseCase,
  GetAllAccountsUseCase,
} from '../../application/use-cases/account/account.use-cases';
import {
  CreateAccountDto,
  UpdateAccountDto,
  AccountResponseDto,
} from '../dtos/account.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('accounts')
export class AccountController {
  constructor(
    private readonly createAccountUseCase: CreateAccountUseCase,
    private readonly getAccountUseCase: GetAccountUseCase,
    private readonly getAccountsByUserUseCase: GetAccountsByUserUseCase,
    private readonly getActiveAccountsByUserUseCase: GetActiveAccountsByUserUseCase,
    private readonly updateAccountUseCase: UpdateAccountUseCase,
    private readonly getAccountByNumberUseCase: GetAccountByNumberUseCase,
    private readonly getAllAccountsUseCase: GetAllAccountsUseCase,
  ) {}

  @Post()
  async createAccount(
    @Body() createAccountDto: CreateAccountDto,
  ): Promise<AccountResponseDto> {
    const account = await this.createAccountUseCase.execute(createAccountDto);
    return {
      id: account.id,
      userId: account.userId,
      holderName: account.holderName,
      accountNumber: account.accountNumber,
      accountType: account.accountType,
      balance: account.balance,
      currency: account.currency,
      isActive: account.isActive,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    };
  }

  @Get()
  async getAllAccounts(): Promise<AccountResponseDto[]> {
    console.log('AccountController - getAllAccounts called');
    const accounts = await this.getAllAccountsUseCase.execute();
    console.log('AccountController - Found accounts:', accounts.length);
    return accounts.map((account) => ({
      id: account.id,
      userId: account.userId,
      holderName: account.holderName,
      accountNumber: account.accountNumber,
      accountType: account.accountType,
      balance: account.balance,
      currency: account.currency,
      isActive: account.isActive,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    }));
  }

  @Get(':id')
  async getAccountById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AccountResponseDto> {
    const account = await this.getAccountUseCase.execute(id);
    return {
      id: account.id,
      userId: account.userId,
      holderName: account.holderName,
      accountNumber: account.accountNumber,
      accountType: account.accountType,
      balance: account.balance,
      currency: account.currency,
      isActive: account.isActive,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    };
  }

  @Get('user/:userId')
  async getAccountsByUser(
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<AccountResponseDto[]> {
    const accounts = await this.getAccountsByUserUseCase.execute(userId);
    return accounts.map((account) => ({
      id: account.id,
      userId: account.userId,
      holderName: account.holderName,
      accountNumber: account.accountNumber,
      accountType: account.accountType,
      balance: account.balance,
      currency: account.currency,
      isActive: account.isActive,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    }));
  }

  @Get('user/:userId/active')
  async getActiveAccountsByUser(
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<AccountResponseDto[]> {
    const accounts = await this.getActiveAccountsByUserUseCase.execute(userId);
    return accounts.map((account) => ({
      id: account.id,
      userId: account.userId,
      holderName: account.holderName,
      accountNumber: account.accountNumber,
      accountType: account.accountType,
      balance: account.balance,
      currency: account.currency,
      isActive: account.isActive,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    }));
  }

  @Get('number/:accountNumber')
  async getAccountByNumber(
    @Param('accountNumber') accountNumber: string,
  ): Promise<AccountResponseDto> {
    const account = await this.getAccountByNumberUseCase.execute(accountNumber);
    return {
      id: account.id,
      userId: account.userId,
      holderName: account.holderName,
      accountNumber: account.accountNumber,
      accountType: account.accountType,
      balance: account.balance,
      currency: account.currency,
      isActive: account.isActive,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    };
  }

  @Put(':id')
  async updateAccount(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAccountDto: UpdateAccountDto,
  ): Promise<AccountResponseDto> {
    const account = await this.updateAccountUseCase.execute(
      id,
      updateAccountDto,
    );
    return {
      id: account.id,
      userId: account.userId,
      holderName: account.holderName,
      accountNumber: account.accountNumber,
      accountType: account.accountType,
      balance: account.balance,
      currency: account.currency,
      isActive: account.isActive,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    };
  }
}
