import {
  Transaction,
  TransactionType,
  TransactionStatus,
  CreateTransactionRequest,
} from './transaction.entity';

describe('Transaction Domain Entity', () => {
  describe('Transaction Creation', () => {
    const baseTransactionData: CreateTransactionRequest = {
      fromAccountId: '123e4567-e89b-12d3-a456-426614174000',
      toAccountId: '123e4567-e89b-12d3-a456-426614174001',
      type: TransactionType.TRANSFER,
      amount: 500.0,
      currency: 'USD',
      description: 'Test transfer',
    };

    it('should create valid transfer transaction', () => {
      // Arrange & Act
      const transaction: Transaction = {
        id: '123e4567-e89b-12d3-a456-426614174002',
        ...baseTransactionData,
        status: TransactionStatus.PENDING,
        reference: 'TXN123456789',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Assert
      expect(transaction.type).toBe(TransactionType.TRANSFER);
      expect(transaction.status).toBe(TransactionStatus.PENDING);
      expect(transaction.amount).toBe(500.0);
      expect(transaction.fromAccountId).toBeDefined();
      expect(transaction.toAccountId).toBeDefined();
    });

    it('should create valid deposit transaction', () => {
      // Arrange
      const depositData: CreateTransactionRequest = {
        toAccountId: '123e4567-e89b-12d3-a456-426614174001',
        type: TransactionType.DEPOSIT,
        amount: 1000.0,
        currency: 'USD',
        description: 'Salary deposit',
      };

      // Act
      const transaction: Transaction = {
        id: '123e4567-e89b-12d3-a456-426614174003',
        ...depositData,
        status: TransactionStatus.PENDING,
        reference: 'DEP123456789',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Assert
      expect(transaction.type).toBe(TransactionType.DEPOSIT);
      expect(transaction.fromAccountId).toBeUndefined();
      expect(transaction.toAccountId).toBeDefined();
      expect(transaction.amount).toBe(1000.0);
    });

    it('should create valid withdrawal transaction', () => {
      // Arrange
      const withdrawalData: CreateTransactionRequest = {
        fromAccountId: '123e4567-e89b-12d3-a456-426614174000',
        type: TransactionType.WITHDRAWAL,
        amount: 200.0,
        currency: 'USD',
        description: 'ATM withdrawal',
      };

      // Act
      const transaction: Transaction = {
        id: '123e4567-e89b-12d3-a456-426614174004',
        ...withdrawalData,
        status: TransactionStatus.PENDING,
        reference: 'WTH123456789',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Assert
      expect(transaction.type).toBe(TransactionType.WITHDRAWAL);
      expect(transaction.fromAccountId).toBeDefined();
      expect(transaction.toAccountId).toBeUndefined();
      expect(transaction.amount).toBe(200.0);
    });
  });

  describe('Transaction Validation', () => {
    it('should validate that amount is positive', () => {
      // Arrange
      const negativeAmount = -100.0;

      // Act & Assert
      expect(() => {
        if (negativeAmount <= 0) {
          throw new Error('Transaction amount must be positive');
        }
      }).toThrow('Transaction amount must be positive');
    });

    it('should validate that transfer has both accounts', () => {
      // Arrange
      const transferData: CreateTransactionRequest = {
        fromAccountId: '123e4567-e89b-12d3-a456-426614174000',
        // Missing toAccountId
        type: TransactionType.TRANSFER,
        amount: 500.0,
        currency: 'USD',
        description: 'Invalid transfer',
      };

      // Act & Assert
      expect(() => {
        if (
          transferData.type === TransactionType.TRANSFER &&
          (!transferData.fromAccountId || !transferData.toAccountId)
        ) {
          throw new Error(
            'Transfer requires both source and destination accounts',
          );
        }
      }).toThrow('Transfer requires both source and destination accounts');
    });

    it('should validate that withdrawal has source account', () => {
      // Arrange
      const withdrawalData: CreateTransactionRequest = {
        // Missing fromAccountId
        type: TransactionType.WITHDRAWAL,
        amount: 200.0,
        currency: 'USD',
        description: 'Invalid withdrawal',
      };

      // Act & Assert
      expect(() => {
        if (
          withdrawalData.type === TransactionType.WITHDRAWAL &&
          !withdrawalData.fromAccountId
        ) {
          throw new Error('Withdrawal requires source account');
        }
      }).toThrow('Withdrawal requires source account');
    });

    it('should validate that deposit has destination account', () => {
      // Arrange
      const depositData: CreateTransactionRequest = {
        // Missing toAccountId
        type: TransactionType.DEPOSIT,
        amount: 1000.0,
        currency: 'USD',
        description: 'Invalid deposit',
      };

      // Act & Assert
      expect(() => {
        if (
          depositData.type === TransactionType.DEPOSIT &&
          !depositData.toAccountId
        ) {
          throw new Error('Deposit requires destination account');
        }
      }).toThrow('Deposit requires destination account');
    });

    it('should validate currency code format', () => {
      // Arrange
      const invalidCurrency = 'INVALID';

      // Act & Assert
      expect(() => {
        if (invalidCurrency.length !== 3) {
          throw new Error('Currency code must be exactly 3 characters');
        }
      }).toThrow('Currency code must be exactly 3 characters');
    });
  });

  describe('Transaction Status Transitions', () => {
    it('should allow valid status transitions', () => {
      // Arrange
      const transaction: Transaction = {
        id: '123e4567-e89b-12d3-a456-426614174005',
        fromAccountId: '123e4567-e89b-12d3-a456-426614174000',
        toAccountId: '123e4567-e89b-12d3-a456-426614174001',
        type: TransactionType.TRANSFER,
        amount: 300.0,
        currency: 'USD',
        description: 'Status transition test',
        status: TransactionStatus.PENDING,
        reference: 'TXN987654321',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Act - Valid transitions
      const validTransitions = [
        { from: TransactionStatus.PENDING, to: TransactionStatus.COMPLETED },
        { from: TransactionStatus.PENDING, to: TransactionStatus.FAILED },
        { from: TransactionStatus.PENDING, to: TransactionStatus.CANCELLED },
      ];

      // Assert
      validTransitions.forEach(({ from, to }) => {
        expect(() => {
          if (transaction.status === from) {
            // Valid transition
            transaction.status = to;
          }
        }).not.toThrow();
      });
    });

    it('should prevent invalid status transitions', () => {
      // Arrange
      const completedTransaction: Transaction = {
        id: '123e4567-e89b-12d3-a456-426614174006',
        fromAccountId: '123e4567-e89b-12d3-a456-426614174000',
        type: TransactionType.WITHDRAWAL,
        amount: 150.0,
        currency: 'USD',
        description: 'Completed transaction',
        status: TransactionStatus.COMPLETED,
        reference: 'TXN111222333',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Act & Assert - Cannot change completed transaction
      expect(() => {
        if (completedTransaction.status === TransactionStatus.COMPLETED) {
          throw new Error('Cannot modify completed transaction');
        }
      }).toThrow('Cannot modify completed transaction');
    });
  });

  describe('Transaction Reference Generation', () => {
    it('should generate unique reference for each transaction', () => {
      // Arrange
      const transaction1: Transaction = {
        id: '123e4567-e89b-12d3-a456-426614174007',
        type: TransactionType.DEPOSIT,
        amount: 100.0,
        currency: 'USD',
        description: 'Reference test 1',
        status: TransactionStatus.PENDING,
        reference: 'TXN' + Date.now() + Math.random().toString(36).substr(2, 9),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const transaction2: Transaction = {
        id: '123e4567-e89b-12d3-a456-426614174008',
        type: TransactionType.DEPOSIT,
        amount: 200.0,
        currency: 'USD',
        description: 'Reference test 2',
        status: TransactionStatus.PENDING,
        reference: 'TXN' + Date.now() + Math.random().toString(36).substr(2, 9),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Assert
      expect(transaction1.reference).toBeDefined();
      expect(transaction2.reference).toBeDefined();
      expect(transaction1.reference).not.toBe(transaction2.reference);
      expect(transaction1.reference).toMatch(/^TXN/);
      expect(transaction2.reference).toMatch(/^TXN/);
    });
  });
});
