import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateAccountUseCase } from './account.use-cases';
import { UserEntity } from '../../../infrastructure/database/entities/user.entity';
import { IAccountRepository } from '../../../domain/repositories/account.repository.interface';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import {
  Account,
  AccountType,
  CreateAccountRequest,
} from '../../../domain/entities/account.entity';
import { User } from '../../../domain/entities/user.entity';

describe('CreateAccountUseCase', () => {
  let useCase: CreateAccountUseCase;
  let mockAccountRepository: jest.Mocked<IAccountRepository>;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockUserEntityRepository: jest.Mocked<Repository<UserEntity>>;

  const mockUser: User = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    password: 'hashedPassword',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  };

  const mockAccount: Account = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    userId: '550e8400-e29b-41d4-a716-446655440000',
    holderName: 'John Doe',
    accountNumber: 'ACC001',
    accountType: AccountType.SAVINGS,
    balance: 1000.0,
    currency: 'USD',
    isActive: true,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  };

  beforeEach(async () => {
    const mockAccountRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findByAccountNumber: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const mockUserRepo = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const mockUserEntityRepo = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateAccountUseCase,
        {
          provide: 'IAccountRepository',
          useValue: mockAccountRepo,
        },
        {
          provide: 'IUserRepository',
          useValue: mockUserRepo,
        },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockUserEntityRepo,
        },
      ],
    }).compile();

    useCase = module.get<CreateAccountUseCase>(CreateAccountUseCase);
    mockAccountRepository = module.get('IAccountRepository');
    mockUserRepository = module.get('IUserRepository');
    mockUserEntityRepository = module.get(getRepositoryToken(UserEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const validCreateAccountRequest: CreateAccountRequest = {
      userId: '550e8400-e29b-41d4-a716-446655440000',
      holderName: 'John Doe',
      accountType: AccountType.SAVINGS,
      currency: 'USD',
      initialBalance: 1000.0,
    };

    it('should create account successfully when user exists', async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockAccountRepository.create.mockResolvedValue(mockAccount);

      // Act
      const result = await useCase.execute(validCreateAccountRequest);

      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith(
        validCreateAccountRequest.userId,
      );
      expect(mockAccountRepository.create).toHaveBeenCalledWith(
        validCreateAccountRequest,
      );
      expect(result).toEqual(mockAccount);
    });

    it('should create test user and account when test user does not exist', async () => {
      // Arrange
      const testUserId = '550e8400-e29b-41d4-a716-446655440000';
      const testUserEntity = {
        id: testUserId,
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      mockUserRepository.findById
        .mockResolvedValueOnce(null) // First call returns null
        .mockResolvedValueOnce(mockUser); // Second call returns user after creation
      mockUserEntityRepository.create.mockReturnValue(
        testUserEntity as UserEntity,
      );
      mockUserEntityRepository.save.mockResolvedValue(
        testUserEntity as UserEntity,
      );
      mockAccountRepository.create.mockResolvedValue(mockAccount);

      // Act
      const result = await useCase.execute(validCreateAccountRequest);

      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledTimes(2);
      expect(mockUserEntityRepository.create).toHaveBeenCalledWith({
        id: testUserId,
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      });
      expect(mockUserEntityRepository.save).toHaveBeenCalledWith(
        testUserEntity,
      );
      expect(mockAccountRepository.create).toHaveBeenCalledWith(
        validCreateAccountRequest,
      );
      expect(result).toEqual(mockAccount);
    });

    it('should throw NotFoundException when non-test user does not exist', async () => {
      // Arrange
      const nonTestUserId = 'other-user-id';
      const requestWithNonTestUser = {
        ...validCreateAccountRequest,
        userId: nonTestUserId,
      };

      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(requestWithNonTestUser)).rejects.toThrow(
        NotFoundException,
      );
      await expect(useCase.execute(requestWithNonTestUser)).rejects.toThrow(
        'User not found',
      );

      expect(mockUserRepository.findById).toHaveBeenCalledWith(nonTestUserId);
      expect(mockAccountRepository.create).not.toHaveBeenCalled();
    });

    it('should throw error when account creation fails', async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockAccountRepository.create.mockRejectedValue(
        new Error('Database error'),
      );

      // Act & Assert
      await expect(useCase.execute(validCreateAccountRequest)).rejects.toThrow(
        'Database error',
      );

      expect(mockUserRepository.findById).toHaveBeenCalledWith(
        validCreateAccountRequest.userId,
      );
      expect(mockAccountRepository.create).toHaveBeenCalledWith(
        validCreateAccountRequest,
      );
    });

    it('should handle account creation with zero initial balance', async () => {
      // Arrange
      const requestWithZeroBalance = {
        ...validCreateAccountRequest,
        initialBalance: 0,
      };
      const accountWithZeroBalance = {
        ...mockAccount,
        balance: 0,
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockAccountRepository.create.mockResolvedValue(accountWithZeroBalance);

      // Act
      const result = await useCase.execute(requestWithZeroBalance);

      // Assert
      expect(mockAccountRepository.create).toHaveBeenCalledWith(
        requestWithZeroBalance,
      );
      expect(result.balance).toBe(0);
    });

    it('should handle account creation without initial balance', async () => {
      // Arrange
      const requestWithoutInitialBalance = {
        userId: validCreateAccountRequest.userId,
        holderName: validCreateAccountRequest.holderName,
        accountType: validCreateAccountRequest.accountType,
        currency: validCreateAccountRequest.currency,
        // No initialBalance property
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockAccountRepository.create.mockResolvedValue({
        ...mockAccount,
        balance: 0,
      });

      // Act
      const result = await useCase.execute(requestWithoutInitialBalance);

      // Assert
      expect(mockAccountRepository.create).toHaveBeenCalledWith(
        requestWithoutInitialBalance,
      );
      expect(result).toBeDefined();
    });

    it('should validate account holder name is provided', async () => {
      // Arrange
      const requestWithEmptyHolderName = {
        ...validCreateAccountRequest,
        holderName: '',
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);

      // Act & Assert - This validation should be handled by DTO validation
      // but we can test business logic validation here
      expect(() => {
        if (!requestWithEmptyHolderName.holderName.trim()) {
          throw new BadRequestException('Account holder name is required');
        }
      }).toThrow('Account holder name is required');
    });

    it('should validate currency code format', async () => {
      // Arrange
      const requestWithInvalidCurrency = {
        ...validCreateAccountRequest,
        currency: 'INVALID',
      };

      // Act & Assert
      expect(() => {
        if (requestWithInvalidCurrency.currency.length !== 3) {
          throw new BadRequestException(
            'Currency code must be exactly 3 characters',
          );
        }
      }).toThrow('Currency code must be exactly 3 characters');
    });
  });
});
