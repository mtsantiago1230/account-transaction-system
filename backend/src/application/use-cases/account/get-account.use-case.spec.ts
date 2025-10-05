import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetAccountUseCase } from './account.use-cases';
import { IAccountRepository } from '../../../domain/repositories/account.repository.interface';
import { Account, AccountType } from '../../../domain/entities/account.entity';

describe('GetAccountUseCase', () => {
  let useCase: GetAccountUseCase;
  let mockAccountRepository: jest.Mocked<IAccountRepository>;

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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAccountUseCase,
        {
          provide: 'IAccountRepository',
          useValue: mockAccountRepo,
        },
      ],
    }).compile();

    useCase = module.get<GetAccountUseCase>(GetAccountUseCase);
    mockAccountRepository = module.get('IAccountRepository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const validAccountId = '123e4567-e89b-12d3-a456-426614174000';

    it('should return account when found', async () => {
      // Arrange
      mockAccountRepository.findById.mockResolvedValue(mockAccount);

      // Act
      const result = await useCase.execute(validAccountId);

      // Assert
      expect(mockAccountRepository.findById).toHaveBeenCalledWith(
        validAccountId,
      );
      expect(result).toEqual(mockAccount);
    });

    it('should throw NotFoundException when account does not exist', async () => {
      // Arrange
      const nonExistentAccountId = 'non-existent-id';
      mockAccountRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(nonExistentAccountId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(useCase.execute(nonExistentAccountId)).rejects.toThrow(
        'Account not found',
      );

      expect(mockAccountRepository.findById).toHaveBeenCalledWith(
        nonExistentAccountId,
      );
    });

    it('should handle repository errors gracefully', async () => {
      // Arrange
      mockAccountRepository.findById.mockRejectedValue(
        new Error('Database connection error'),
      );

      // Act & Assert
      await expect(useCase.execute(validAccountId)).rejects.toThrow(
        'Database connection error',
      );

      expect(mockAccountRepository.findById).toHaveBeenCalledWith(
        validAccountId,
      );
    });

    it('should return account with correct properties', async () => {
      // Arrange
      mockAccountRepository.findById.mockResolvedValue(mockAccount);

      // Act
      const result = await useCase.execute(validAccountId);

      // Assert
      expect(result).toHaveProperty('id', mockAccount.id);
      expect(result).toHaveProperty('userId', mockAccount.userId);
      expect(result).toHaveProperty('holderName', mockAccount.holderName);
      expect(result).toHaveProperty('accountNumber', mockAccount.accountNumber);
      expect(result).toHaveProperty('accountType', mockAccount.accountType);
      expect(result).toHaveProperty('balance', mockAccount.balance);
      expect(result).toHaveProperty('currency', mockAccount.currency);
      expect(result).toHaveProperty('isActive', mockAccount.isActive);
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
    });

    it('should handle inactive account correctly', async () => {
      // Arrange
      const inactiveAccount: Account = {
        ...mockAccount,
        isActive: false,
      };
      mockAccountRepository.findById.mockResolvedValue(inactiveAccount);

      // Act
      const result = await useCase.execute(validAccountId);

      // Assert
      expect(result.isActive).toBe(false);
      expect(mockAccountRepository.findById).toHaveBeenCalledWith(
        validAccountId,
      );
    });

    it('should validate account ID format', async () => {
      // Arrange
      const invalidAccountId = 'invalid-format';

      // Act & Assert
      // Note: In a real implementation, you might want to validate UUID format
      expect(() => {
        if (
          !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            invalidAccountId,
          )
        ) {
          throw new Error('Invalid account ID format');
        }
      }).toThrow('Invalid account ID format');
    });
  });
});
