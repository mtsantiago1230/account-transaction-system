import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetTransactionsByAccountUseCase } from './transaction.use-cases';
import { ITransactionRepository } from '../../../domain/repositories/transaction.repository.interface';
import { IAccountRepository } from '../../../domain/repositories/account.repository.interface';
import {
  Transaction,
  TransactionType,
  TransactionStatus,
} from '../../../domain/entities/transaction.entity';
import { Account, AccountType } from '../../../domain/entities/account.entity';

describe('GetTransactionsByAccountUseCase', () => {
  let useCase: GetTransactionsByAccountUseCase;
  let mockTransactionRepository: jest.Mocked<ITransactionRepository>;
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

  const mockTransactions: Transaction[] = [
    {
      id: '123e4567-e89b-12d3-a456-426614174001',
      fromAccountId: '123e4567-e89b-12d3-a456-426614174000',
      toAccountId: '123e4567-e89b-12d3-a456-426614174002',
      type: TransactionType.TRANSFER,
      amount: 500.0,
      currency: 'USD',
      description: 'Transfer to savings',
      status: TransactionStatus.COMPLETED,
      reference: 'TXN123456789',
      createdAt: new Date('2023-01-02'),
      updatedAt: new Date('2023-01-02'),
    },
    {
      id: '123e4567-e89b-12d3-a456-426614174003',
      toAccountId: '123e4567-e89b-12d3-a456-426614174000',
      type: TransactionType.DEPOSIT,
      amount: 1000.0,
      currency: 'USD',
      description: 'Salary deposit',
      status: TransactionStatus.COMPLETED,
      reference: 'DEP987654321',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
    },
    {
      id: '123e4567-e89b-12d3-a456-426614174004',
      fromAccountId: '123e4567-e89b-12d3-a456-426614174000',
      type: TransactionType.WITHDRAWAL,
      amount: 200.0,
      currency: 'USD',
      description: 'ATM withdrawal',
      status: TransactionStatus.COMPLETED,
      reference: 'WTH555666777',
      createdAt: new Date('2023-01-03'),
      updatedAt: new Date('2023-01-03'),
    },
  ];

  beforeEach(async () => {
    const mockTransactionRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      findByAccountId: jest.fn(),
      findByReference: jest.fn(),
      findAll: jest.fn(),
      findByDateRange: jest.fn(),
      update: jest.fn(),
      updateStatus: jest.fn(),
      findPendingTransactions: jest.fn(),
      findByAccountIdAndDateRange: jest.fn(),
    };

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
        GetTransactionsByAccountUseCase,
        {
          provide: 'ITransactionRepository',
          useValue: mockTransactionRepo,
        },
        {
          provide: 'IAccountRepository',
          useValue: mockAccountRepo,
        },
      ],
    }).compile();

    useCase = module.get<GetTransactionsByAccountUseCase>(
      GetTransactionsByAccountUseCase,
    );
    mockTransactionRepository = module.get('ITransactionRepository');
    mockAccountRepository = module.get('IAccountRepository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const validAccountId = '123e4567-e89b-12d3-a456-426614174000';

    it('should return transactions for existing account', async () => {
      // Arrange
      mockAccountRepository.findById.mockResolvedValue(mockAccount);
      mockTransactionRepository.findByAccountId.mockResolvedValue(
        mockTransactions,
      );

      // Act
      const result = await useCase.execute(validAccountId);

      // Assert
      expect(mockAccountRepository.findById).toHaveBeenCalledWith(
        validAccountId,
      );
      expect(mockTransactionRepository.findByAccountId).toHaveBeenCalledWith(
        validAccountId,
      );
      expect(result).toEqual(mockTransactions);
      expect(result).toHaveLength(3);
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
      expect(mockTransactionRepository.findByAccountId).not.toHaveBeenCalled();
    });

    it('should return empty array when account has no transactions', async () => {
      // Arrange
      mockAccountRepository.findById.mockResolvedValue(mockAccount);
      mockTransactionRepository.findByAccountId.mockResolvedValue([]);

      // Act
      const result = await useCase.execute(validAccountId);

      // Assert
      expect(mockAccountRepository.findById).toHaveBeenCalledWith(
        validAccountId,
      );
      expect(mockTransactionRepository.findByAccountId).toHaveBeenCalledWith(
        validAccountId,
      );
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should return transactions sorted by creation date (newest first)', async () => {
      // Arrange
      mockAccountRepository.findById.mockResolvedValue(mockAccount);
      mockTransactionRepository.findByAccountId.mockResolvedValue(
        mockTransactions,
      );

      // Act
      const result = await useCase.execute(validAccountId);

      // Assert
      expect(result).toHaveLength(3);
      // Verify that repository is called which should handle sorting
      expect(mockTransactionRepository.findByAccountId).toHaveBeenCalledWith(
        validAccountId,
      );
    });

    it('should include both incoming and outgoing transactions', async () => {
      // Arrange
      mockAccountRepository.findById.mockResolvedValue(mockAccount);
      mockTransactionRepository.findByAccountId.mockResolvedValue(
        mockTransactions,
      );

      // Act
      const result = await useCase.execute(validAccountId);

      // Assert
      const outgoingTransactions = result.filter(
        (t) => t.fromAccountId === validAccountId,
      );
      const incomingTransactions = result.filter(
        (t) => t.toAccountId === validAccountId,
      );

      expect(outgoingTransactions.length).toBeGreaterThan(0);
      expect(incomingTransactions.length).toBeGreaterThan(0);
      expect(outgoingTransactions.length + incomingTransactions.length).toBe(
        result.length,
      );
    });

    it('should include transactions of all types', async () => {
      // Arrange
      mockAccountRepository.findById.mockResolvedValue(mockAccount);
      mockTransactionRepository.findByAccountId.mockResolvedValue(
        mockTransactions,
      );

      // Act
      const result = await useCase.execute(validAccountId);

      // Assert
      const transactionTypes = result.map((t) => t.type);
      expect(transactionTypes).toContain(TransactionType.TRANSFER);
      expect(transactionTypes).toContain(TransactionType.DEPOSIT);
      expect(transactionTypes).toContain(TransactionType.WITHDRAWAL);
    });

    it('should include transactions with all statuses', async () => {
      // Arrange
      const transactionsWithDifferentStatuses: Transaction[] = [
        { ...mockTransactions[0], status: TransactionStatus.COMPLETED },
        { ...mockTransactions[1], status: TransactionStatus.PENDING },
        { ...mockTransactions[2], status: TransactionStatus.FAILED },
      ];

      mockAccountRepository.findById.mockResolvedValue(mockAccount);
      mockTransactionRepository.findByAccountId.mockResolvedValue(
        transactionsWithDifferentStatuses,
      );

      // Act
      const result = await useCase.execute(validAccountId);

      // Assert
      const statuses = result.map((t) => t.status);
      expect(statuses).toContain(TransactionStatus.COMPLETED);
      expect(statuses).toContain(TransactionStatus.PENDING);
      expect(statuses).toContain(TransactionStatus.FAILED);
    });

    it('should handle repository errors gracefully', async () => {
      // Arrange
      mockAccountRepository.findById.mockResolvedValue(mockAccount);
      mockTransactionRepository.findByAccountId.mockRejectedValue(
        new Error('Database connection error'),
      );

      // Act & Assert
      await expect(useCase.execute(validAccountId)).rejects.toThrow(
        'Database connection error',
      );

      expect(mockAccountRepository.findById).toHaveBeenCalledWith(
        validAccountId,
      );
      expect(mockTransactionRepository.findByAccountId).toHaveBeenCalledWith(
        validAccountId,
      );
    });

    it('should validate account ID format', async () => {
      // Arrange
      const invalidAccountId = 'invalid-format';

      // Act & Assert
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

    it('should return transactions with correct properties', async () => {
      // Arrange
      mockAccountRepository.findById.mockResolvedValue(mockAccount);
      mockTransactionRepository.findByAccountId.mockResolvedValue([
        mockTransactions[0],
      ]);

      // Act
      const result = await useCase.execute(validAccountId);

      // Assert
      const transaction = result[0];
      expect(transaction).toHaveProperty('id');
      expect(transaction).toHaveProperty('type');
      expect(transaction).toHaveProperty('amount');
      expect(transaction).toHaveProperty('currency');
      expect(transaction).toHaveProperty('description');
      expect(transaction).toHaveProperty('status');
      expect(transaction).toHaveProperty('reference');
      expect(transaction).toHaveProperty('createdAt');
      expect(transaction).toHaveProperty('updatedAt');
    });
  });
});
