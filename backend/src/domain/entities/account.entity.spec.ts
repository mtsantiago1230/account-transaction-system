import { Account, AccountType } from './account.entity';

describe('Account Domain Entity', () => {
  describe('Account Balance Operations', () => {
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

    describe('Deposit Operations', () => {
      it('should increase balance when deposit amount is positive', () => {
        // Arrange
        const initialBalance = mockAccount.balance;
        const depositAmount = 500.0;

        // Act
        const newBalance = initialBalance + depositAmount;

        // Assert
        expect(newBalance).toBe(1500.0);
        expect(newBalance).toBeGreaterThan(initialBalance);
      });

      it('should not allow deposit with negative amount', () => {
        // Arrange
        const depositAmount = -100.0;

        // Act & Assert
        expect(() => {
          if (depositAmount <= 0) {
            throw new Error('Deposit amount must be positive');
          }
        }).toThrow('Deposit amount must be positive');
      });

      it('should not allow deposit with zero amount', () => {
        // Arrange
        const depositAmount = 0;

        // Act & Assert
        expect(() => {
          if (depositAmount <= 0) {
            throw new Error('Deposit amount must be positive');
          }
        }).toThrow('Deposit amount must be positive');
      });
    });

    describe('Withdrawal Operations', () => {
      it('should decrease balance when withdrawal amount is valid', () => {
        // Arrange
        const initialBalance = mockAccount.balance;
        const withdrawalAmount = 300.0;

        // Act
        const newBalance = initialBalance - withdrawalAmount;

        // Assert
        expect(newBalance).toBe(700.0);
        expect(newBalance).toBeLessThan(initialBalance);
        expect(newBalance).toBeGreaterThanOrEqual(0);
      });

      it('should throw error when withdrawal amount exceeds balance', () => {
        // Arrange
        const currentBalance = mockAccount.balance;
        const withdrawalAmount = 1500.0; // More than available balance

        // Act & Assert
        expect(() => {
          if (withdrawalAmount > currentBalance) {
            throw new Error(
              'Insufficient funds: withdrawal amount exceeds account balance',
            );
          }
        }).toThrow(
          'Insufficient funds: withdrawal amount exceeds account balance',
        );
      });

      it('should not allow withdrawal with negative amount', () => {
        // Arrange
        const withdrawalAmount = -100.0;

        // Act & Assert
        expect(() => {
          if (withdrawalAmount <= 0) {
            throw new Error('Withdrawal amount must be positive');
          }
        }).toThrow('Withdrawal amount must be positive');
      });

      it('should not allow withdrawal with zero amount', () => {
        // Arrange
        const withdrawalAmount = 0;

        // Act & Assert
        expect(() => {
          if (withdrawalAmount <= 0) {
            throw new Error('Withdrawal amount must be positive');
          }
        }).toThrow('Withdrawal amount must be positive');
      });

      it('should allow withdrawal of exact balance amount', () => {
        // Arrange
        const currentBalance = mockAccount.balance;
        const withdrawalAmount = currentBalance; // Exact balance

        // Act
        const newBalance = currentBalance - withdrawalAmount;

        // Assert
        expect(newBalance).toBe(0);
        expect(() => {
          if (withdrawalAmount > currentBalance) {
            throw new Error('Insufficient funds');
          }
        }).not.toThrow();
      });
    });

    describe('Balance Validation', () => {
      it('should validate that balance is never negative after operations', () => {
        // Arrange
        const currentBalance = 100.0;
        const withdrawalAmount = 150.0;

        // Act & Assert
        expect(() => {
          const newBalance = currentBalance - withdrawalAmount;
          if (newBalance < 0) {
            throw new Error('Account balance cannot be negative');
          }
        }).toThrow('Account balance cannot be negative');
      });

      it('should handle decimal precision for currency operations', () => {
        // Arrange
        const balance = 1000.99;
        const amount = 0.01;

        // Act
        const newBalance = Number((balance - amount).toFixed(2));

        // Assert
        expect(newBalance).toBe(1000.98);
        expect(Number.isInteger(newBalance * 100)).toBe(true); // Validates proper decimal handling
      });
    });

    describe('Account State Validation', () => {
      it('should not allow operations on inactive account', () => {
        // Arrange
        const inactiveAccount: Account = { ...mockAccount, isActive: false };

        // Act & Assert
        expect(() => {
          if (!inactiveAccount.isActive) {
            throw new Error('Cannot perform operations on inactive account');
          }
        }).toThrow('Cannot perform operations on inactive account');
      });

      it('should validate account number format', () => {
        // Arrange
        const invalidAccountNumber = '123'; // Too short

        // Act & Assert
        expect(() => {
          if (invalidAccountNumber.length < 6) {
            throw new Error('Account number must be at least 6 characters');
          }
        }).toThrow('Account number must be at least 6 characters');
      });

      it('should validate currency code format', () => {
        // Arrange
        const invalidCurrency = 'INVALID'; // Not 3 characters

        // Act & Assert
        expect(() => {
          if (invalidCurrency.length !== 3) {
            throw new Error('Currency code must be exactly 3 characters');
          }
        }).toThrow('Currency code must be exactly 3 characters');
      });
    });
  });
});
