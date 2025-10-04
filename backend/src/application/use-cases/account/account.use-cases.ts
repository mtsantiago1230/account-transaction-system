import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../../infrastructure/database/entities/user.entity';
import type { IAccountRepository } from '../../../domain/repositories/account.repository.interface';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import {
  Account,
  CreateAccountRequest,
  UpdateAccountRequest,
} from '../../../domain/entities/account.entity';

@Injectable()
export class CreateAccountUseCase {
  constructor(
    @Inject('IAccountRepository')
    private readonly accountRepository: IAccountRepository,
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    @InjectRepository(UserEntity)
    private readonly userEntityRepository: Repository<UserEntity>,
  ) {}

  async execute(accountData: CreateAccountRequest): Promise<Account> {
    // Verify user exists
    let user = await this.userRepository.findById(accountData.userId);
    if (!user) {
      // For development: create test user if it doesn't exist
      if (accountData.userId === '550e8400-e29b-41d4-a716-446655440000') {
        console.log('Creating test user for development...');
        const testUserEntity = this.userEntityRepository.create({
          id: '550e8400-e29b-41d4-a716-446655440000',
          email: 'test@example.com',
          password: 'password123', // Simple password for testing
          firstName: 'Test',
          lastName: 'User',
        });
        const savedUser = await this.userEntityRepository.save(testUserEntity);
        console.log('Test user created:', savedUser);
        // Now try to find the user again
        user = await this.userRepository.findById(accountData.userId);
      } else {
        throw new NotFoundException('User not found');
      }
    }

    // Create account
    return this.accountRepository.create(accountData);
  }
}

@Injectable()
export class GetAccountUseCase {
  constructor(
    @Inject('IAccountRepository')
    private readonly accountRepository: IAccountRepository,
  ) {}

  async execute(id: string): Promise<Account> {
    const account = await this.accountRepository.findById(id);
    if (!account) {
      throw new NotFoundException('Account not found');
    }
    return account;
  }
}

@Injectable()
export class GetAccountsByUserUseCase {
  constructor(
    @Inject('IAccountRepository')
    private readonly accountRepository: IAccountRepository,
  ) {}

  async execute(userId: string): Promise<Account[]> {
    return this.accountRepository.findByUserId(userId);
  }
}

@Injectable()
export class GetActiveAccountsByUserUseCase {
  constructor(
    @Inject('IAccountRepository')
    private readonly accountRepository: IAccountRepository,
  ) {}

  async execute(userId: string): Promise<Account[]> {
    return this.accountRepository.findActiveAccountsByUserId(userId);
  }
}

@Injectable()
export class UpdateAccountUseCase {
  constructor(
    @Inject('IAccountRepository')
    private readonly accountRepository: IAccountRepository,
  ) {}

  async execute(
    id: string,
    accountData: UpdateAccountRequest,
  ): Promise<Account> {
    const existingAccount = await this.accountRepository.findById(id);
    if (!existingAccount) {
      throw new NotFoundException('Account not found');
    }

    const updatedAccount = await this.accountRepository.update(id, accountData);
    if (!updatedAccount) {
      throw new NotFoundException('Account not found');
    }

    return updatedAccount;
  }
}

@Injectable()
export class GetAccountByNumberUseCase {
  constructor(
    @Inject('IAccountRepository')
    private readonly accountRepository: IAccountRepository,
  ) {}

  async execute(accountNumber: string): Promise<Account> {
    const account =
      await this.accountRepository.findByAccountNumber(accountNumber);
    if (!account) {
      throw new NotFoundException('Account not found');
    }
    return account;
  }
}

@Injectable()
export class GetAllAccountsUseCase {
  constructor(
    @Inject('IAccountRepository')
    private readonly accountRepository: IAccountRepository,
  ) {}

  async execute(): Promise<Account[]> {
    return this.accountRepository.findAll();
  }
}
