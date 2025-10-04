import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountEntity } from '../../infrastructure/database/entities/account.entity';
import { AccountRepository } from '../../infrastructure/repositories/account.repository';
import { AccountController } from '../../interfaces/controllers/account.controller';
import {
  CreateAccountUseCase,
  GetAccountUseCase,
  GetAccountsByUserUseCase,
  GetActiveAccountsByUserUseCase,
  UpdateAccountUseCase,
  GetAccountByNumberUseCase,
  GetAllAccountsUseCase,
} from '../../application/use-cases/account/account.use-cases';
import { UserModule } from './user.module';

@Module({
  imports: [TypeOrmModule.forFeature([AccountEntity]), UserModule],
  controllers: [AccountController],
  providers: [
    AccountRepository,
    {
      provide: 'IAccountRepository',
      useClass: AccountRepository,
    },
    CreateAccountUseCase,
    GetAccountUseCase,
    GetAccountsByUserUseCase,
    GetActiveAccountsByUserUseCase,
    UpdateAccountUseCase,
    GetAccountByNumberUseCase,
    GetAllAccountsUseCase,
  ],
  exports: [AccountRepository, 'IAccountRepository'],
})
export class AccountModule {}
