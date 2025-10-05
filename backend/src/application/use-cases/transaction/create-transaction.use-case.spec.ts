import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateTransactionUseCase } from './transaction.use-cases';
import { ITransactionRepository } from '../../../domain/repositories/transaction.repository.interface';
import { IAccountRepository } from '../../../domain/repositories/account.repository.interface';
import {
  Transaction,
  TransactionType,
  TransactionStatus,
  CreateTransactionRequest,
} from '../../../domain/entities/transaction.entity';
import { Account, AccountType } from '../../../domain/entities/account.entity';

describe('CreateTransactionUseCase', () => {
  let useCase: CreateTransactionUseCase;
  let mockTransactionRepository: jest.Mocked<ITransactionRepository>;
  let mockAccountRepository: jest.Mocked<IAccountRepository>;

  const mockFromAccount: Account = {
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

  const mockToAccount: Account = {
    id: '123e4567-e89b-12d3-a456-426614174001',
    userId: '550e8400-e29b-41d4-a716-446655440001',
    holderName: 'Jane Smith',
    accountNumber: 'ACC002',
    accountType: AccountType.SAVINGS,
    balance: 500.0,
    currency: 'USD',
    isActive: true,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  };

  const mockTransaction: Transaction = {
    id: '123e4567-e89b-12d3-a456-426614174002',
    fromAccountId: mockFromAccount.id,
    toAccountId: mockToAccount.id,
    type: TransactionType.TRANSFER,
    amount: 300.0,
    currency: 'USD',
    description: 'Test transfer',
    status: TransactionStatus.PENDING,
    reference: 'TXN123456789',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

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
        CreateTransactionUseCase,
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

    useCase = module.get<CreateTransactionUseCase>(CreateTransactionUseCase);
    mockTransactionRepository = module.get('ITransactionRepository');
    mockAccountRepository = module.get('IAccountRepository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    describe('Transfer Transactions', () => {
      const validTransferRequest: CreateTransactionRequest = {
        fromAccountId: mockFromAccount.id,
        toAccountId: mockToAccount.id,
        type: TransactionType.TRANSFER,
        amount: 300.0,
        currency: 'USD',
        description: 'Test transfer',
      };

      it('should create transfer transaction successfully when valid', async () => {
        // Arrange
        mockAccountRepository.findById
          .mockResolvedValueOnce(mockFromAccount) // From account
          .mockResolvedValueOnce(mockToAccount); // To account
        mockTransactionRepository.create.mockResolvedValue(mockTransaction);

        // Act
        const result = await useCase.execute(validTransferRequest);

        // Assert
        expect(mockAccountRepository.findById).toHaveBeenCalledTimes(2);
        expect(mockAccountRepository.findById).toHaveBeenCalledWith(
          validTransferRequest.fromAccountId,
        );
        expect(mockAccountRepository.findById).toHaveBeenCalledWith(
          validTransferRequest.toAccountId,
        );
        expect(mockTransactionRepository.create).toHaveBeenCalledWith(
          validTransferRequest,
        );
        expect(result).toEqual(mockTransaction);
      });

      it('should throw NotFoundException when source account does not exist', async () => {
        // Arrange
        mockAccountRepository.findById
          .mockResolvedValueOnce(null) // Source = null
          .mockResolvedValueOnce(mockToAccount); // Destination = existe

        // Act & Assert - UNA SOLA LLAMADA
        await expect(useCase.execute(validTransferRequest)).rejects.toThrow(
          'Source account not found',
        );
      });

      it('should throw NotFoundException when destination account does not exist', async () => {
        // Arrange
        mockAccountRepository.findById
          .mockResolvedValueOnce(mockFromAccount) // Source = existe
          .mockResolvedValueOnce(null); // Destination = null

        // Act & Assert - UNA SOLA LLAMADA
        await expect(useCase.execute(validTransferRequest)).rejects.toThrow(
          'Destination account not found',
        );
      });

      it('should throw BadRequestException when source account is inactive', async () => {
        // Arrange
        const inactiveFromAccount = { ...mockFromAccount, isActive: false };
        mockAccountRepository.findById
          .mockResolvedValueOnce(inactiveFromAccount)
          .mockResolvedValueOnce(mockToAccount);

        // Act & Assert
        await expect(useCase.execute(validTransferRequest)).rejects.toThrow(
          'Source account is not active',
        );

        expect(mockTransactionRepository.create).not.toHaveBeenCalled();
      });

      it('should throw BadRequestException when destination account is inactive', async () => {
        // Arrange
        const inactiveToAccount = { ...mockToAccount, isActive: false };
        mockAccountRepository.findById
          .mockResolvedValueOnce(mockFromAccount)
          .mockResolvedValueOnce(inactiveToAccount);

        // Act & Assert
        await expect(useCase.execute(validTransferRequest)).rejects.toThrow(
          'Destination account is not active',
        );

        expect(mockTransactionRepository.create).not.toHaveBeenCalled();
      });

      it('should throw BadRequestException when transfer missing source account', async () => {
        // Arrange
        const invalidTransferRequest: CreateTransactionRequest = {
          toAccountId: mockToAccount.id,
          type: TransactionType.TRANSFER,
          amount: 300.0,
          currency: 'USD',
          description: 'Invalid transfer',
        };

        // Act & Assert
        await expect(useCase.execute(invalidTransferRequest)).rejects.toThrow(
          BadRequestException,
        );
        await expect(useCase.execute(invalidTransferRequest)).rejects.toThrow(
          'Transfer requires both source and destination accounts',
        );

        expect(mockAccountRepository.findById).not.toHaveBeenCalled();
        expect(mockTransactionRepository.create).not.toHaveBeenCalled();
      });

      it('should throw BadRequestException when transfer missing destination account', async () => {
        // Arrange
        const invalidTransferRequest: CreateTransactionRequest = {
          fromAccountId: mockFromAccount.id,
          type: TransactionType.TRANSFER,
          amount: 300.0,
          currency: 'USD',
          description: 'Invalid transfer',
        };

        // Act & Assert
        await expect(useCase.execute(invalidTransferRequest)).rejects.toThrow(
          BadRequestException,
        );
        await expect(useCase.execute(invalidTransferRequest)).rejects.toThrow(
          'Transfer requires both source and destination accounts',
        );

        expect(mockAccountRepository.findById).not.toHaveBeenCalled();
        expect(mockTransactionRepository.create).not.toHaveBeenCalled();
      });
    });

    describe('Withdrawal Transactions - CRITICAL BALANCE VALIDATION', () => {
      const validWithdrawalRequest: CreateTransactionRequest = {
        fromAccountId: mockFromAccount.id,
        type: TransactionType.WITHDRAWAL,
        amount: 500.0,
        currency: 'USD',
        description: 'ATM withdrawal',
      };

      it('should create withdrawal transaction when amount is within balance', async () => {
        // Arrange
        mockAccountRepository.findById.mockResolvedValue(mockFromAccount);
        const expectedTransaction = {
          ...mockTransaction,
          toAccountId: undefined,
          type: TransactionType.WITHDRAWAL,
          amount: 500.0,
        };
        mockTransactionRepository.create.mockResolvedValue(expectedTransaction);

        // Act
        const result = await useCase.execute(validWithdrawalRequest);

        // Assert
        expect(mockAccountRepository.findById).toHaveBeenCalledWith(
          validWithdrawalRequest.fromAccountId,
        );
        expect(mockTransactionRepository.create).toHaveBeenCalledWith(
          validWithdrawalRequest,
        );
        expect(result).toEqual(expectedTransaction);
      });

      it('should THROW ERROR when withdrawal amount exceeds account balance', async () => {
        // Arrange - This is the CRITICAL TEST as specified in requirements
        const lowBalanceAccount: Account = {
          ...mockFromAccount,
          balance: 200.0, // Low balance
        };
        const excessiveWithdrawalRequest: CreateTransactionRequest = {
          fromAccountId: mockFromAccount.id,
          type: TransactionType.WITHDRAWAL,
          amount: 1500.0, // Exceeds balance of 200.00
          currency: 'USD',
          description: 'Excessive withdrawal attempt',
        };

        mockAccountRepository.findById.mockResolvedValue(lowBalanceAccount);

        // Act & Assert - CRITICAL: This should throw an error
        await expect(
          useCase.execute(excessiveWithdrawalRequest),
        ).rejects.toThrow(BadRequestException);
        await expect(
          useCase.execute(excessiveWithdrawalRequest),
        ).rejects.toThrow(
          /insufficient|balance|exceed/i, // Should match error about insufficient funds
        );

        expect(mockAccountRepository.findById).toHaveBeenCalledWith(
          excessiveWithdrawalRequest.fromAccountId,
        );
        expect(mockTransactionRepository.create).not.toHaveBeenCalled();
      });

      it('should throw error when withdrawal amount equals exactly the balance plus one cent', async () => {
        // Arrange
        const exactBalanceAccount: Account = {
          ...mockFromAccount,
          balance: 100.0,
        };
        const overBalanceRequest: CreateTransactionRequest = {
          fromAccountId: mockFromAccount.id,
          type: TransactionType.WITHDRAWAL,
          amount: 100.01, // Just over the balance
          currency: 'USD',
          description: 'Over balance withdrawal',
        };

        mockAccountRepository.findById.mockResolvedValue(exactBalanceAccount);

        // Act & Assert
        await expect(useCase.execute(overBalanceRequest)).rejects.toThrow(
          BadRequestException,
        );

        expect(mockTransactionRepository.create).not.toHaveBeenCalled();
      });

      it('should allow withdrawal of exact balance amount', async () => {
        // Arrange
        const exactBalanceAccount: Account = {
          ...mockFromAccount,
          balance: 100.0,
        };
        const exactBalanceRequest: CreateTransactionRequest = {
          fromAccountId: mockFromAccount.id,
          type: TransactionType.WITHDRAWAL,
          amount: 100.0, // Exact balance
          currency: 'USD',
          description: 'Exact balance withdrawal',
        };

        mockAccountRepository.findById.mockResolvedValue(exactBalanceAccount);
        const expectedTransaction = {
          ...mockTransaction,
          type: TransactionType.WITHDRAWAL,
          amount: 100.0,
          toAccountId: undefined,
        };
        mockTransactionRepository.create.mockResolvedValue(expectedTransaction);

        // Act
        const result = await useCase.execute(exactBalanceRequest);

        // Assert
        expect(result).toEqual(expectedTransaction);
        expect(mockTransactionRepository.create).toHaveBeenCalledWith(
          exactBalanceRequest,
        );
      });

      it('should throw BadRequestException when withdrawal missing source account', async () => {
        // Arrange
        const invalidWithdrawalRequest: CreateTransactionRequest = {
          type: TransactionType.WITHDRAWAL,
          amount: 300.0,
          currency: 'USD',
          description: 'Invalid withdrawal',
        };

        // Act & Assert
        await expect(useCase.execute(invalidWithdrawalRequest)).rejects.toThrow(
          BadRequestException,
        );
        await expect(useCase.execute(invalidWithdrawalRequest)).rejects.toThrow(
          'Withdrawal requires source account',
        );

        expect(mockAccountRepository.findById).not.toHaveBeenCalled();
        expect(mockTransactionRepository.create).not.toHaveBeenCalled();
      });
    });

    describe('Deposit Transactions', () => {
      const validDepositRequest: CreateTransactionRequest = {
        toAccountId: mockToAccount.id,
        type: TransactionType.DEPOSIT,
        amount: 1000.0,
        currency: 'USD',
        description: 'Salary deposit',
      };

      it('should create deposit transaction successfully', async () => {
        // Arrange
        mockAccountRepository.findById.mockResolvedValue(mockToAccount);
        const expectedTransaction = {
          ...mockTransaction,
          fromAccountId: undefined,
          type: TransactionType.DEPOSIT,
          amount: 1000.0,
        };
        mockTransactionRepository.create.mockResolvedValue(expectedTransaction);

        // Act
        const result = await useCase.execute(validDepositRequest);

        // Assert
        expect(mockAccountRepository.findById).toHaveBeenCalledWith(
          validDepositRequest.toAccountId,
        );
        expect(mockTransactionRepository.create).toHaveBeenCalledWith(
          validDepositRequest,
        );
        expect(result).toEqual(expectedTransaction);
      });

      it('should throw BadRequestException when deposit missing destination account', async () => {
        // Arrange
        const invalidDepositRequest: CreateTransactionRequest = {
          type: TransactionType.DEPOSIT,
          amount: 1000.0,
          currency: 'USD',
          description: 'Invalid deposit',
        };

        // Act & Assert
        await expect(useCase.execute(invalidDepositRequest)).rejects.toThrow(
          BadRequestException,
        );
        await expect(useCase.execute(invalidDepositRequest)).rejects.toThrow(
          'Deposit requires destination account',
        );

        expect(mockAccountRepository.findById).not.toHaveBeenCalled();
        expect(mockTransactionRepository.create).not.toHaveBeenCalled();
      });
    });

    describe('Amount Validation', () => {
      it('should throw BadRequestException when amount is zero', async () => {
        // Arrange
        const zeroAmountRequest: CreateTransactionRequest = {
          toAccountId: mockToAccount.id,
          type: TransactionType.DEPOSIT,
          amount: 0,
          currency: 'USD',
          description: 'Zero amount transaction',
        };

        // Act & Assert
        await expect(useCase.execute(zeroAmountRequest)).rejects.toThrow(
          BadRequestException,
        );
        await expect(useCase.execute(zeroAmountRequest)).rejects.toThrow(
          'Transaction amount must be positive',
        );

        expect(mockAccountRepository.findById).not.toHaveBeenCalled();
        expect(mockTransactionRepository.create).not.toHaveBeenCalled();
      });

      it('should throw BadRequestException when amount is negative', async () => {
        // Arrange
        const negativeAmountRequest: CreateTransactionRequest = {
          toAccountId: mockToAccount.id,
          type: TransactionType.DEPOSIT,
          amount: -100.0,
          currency: 'USD',
          description: 'Negative amount transaction',
        };

        // Act & Assert
        await expect(useCase.execute(negativeAmountRequest)).rejects.toThrow(
          BadRequestException,
        );
        await expect(useCase.execute(negativeAmountRequest)).rejects.toThrow(
          'Transaction amount must be positive',
        );

        expect(mockAccountRepository.findById).not.toHaveBeenCalled();
        expect(mockTransactionRepository.create).not.toHaveBeenCalled();
      });
    });
  });
});
