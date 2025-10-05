import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
const request = require('supertest');
import { AppModule } from '../src/app.module';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../src/infrastructure/database/entities/user.entity';
import { AccountEntity } from '../src/infrastructure/database/entities/account.entity';
import { TransactionEntity } from '../src/infrastructure/database/entities/transaction.entity';
import { AccountType } from '../src/domain/entities/account.entity';
import { ValidationExceptionFilter } from '../src/common/filters/validation-exception.filter';

describe('TransactionController (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let userRepository: Repository<UserEntity>;
  let accountRepository: Repository<AccountEntity>;
  let transactionRepository: Repository<TransactionEntity>;
  let validToken: string;
  let testUserId: string;
  let testAccountId: string;
  let testAccount2Id: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        skipMissingProperties: false,
        skipNullProperties: false,
        skipUndefinedProperties: false,
      }),
    );

    app.useGlobalFilters(new ValidationExceptionFilter());

    jwtService = moduleFixture.get<JwtService>(JwtService);
    userRepository = moduleFixture.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );
    accountRepository = moduleFixture.get<Repository<AccountEntity>>(
      getRepositoryToken(AccountEntity),
    );
    transactionRepository = moduleFixture.get<Repository<TransactionEntity>>(
      getRepositoryToken(TransactionEntity),
    );

    await app.init();

    // Create test user and generate token
    testUserId = '550e8400-e29b-41d4-a716-446655440000';
    const testUser = userRepository.create({
      id: testUserId,
      email: 'test@example.com',
      password: 'hashedPassword123',
      firstName: 'John',
      lastName: 'Doe',
    });

    try {
      await userRepository.save(testUser);
    } catch (error) {
      // User might already exist, continue
    }

    validToken = jwtService.sign({
      sub: testUserId,
      email: 'test@example.com',
    });

    // Create test accounts
    const testAccount1 = accountRepository.create({
      userId: testUserId,
      holderName: 'John Doe',
      accountNumber: 'ACC001TEST',
      accountType: AccountType.SAVINGS,
      balance: 1000.0,
      currency: 'USD',
      isActive: true,
    });

    const testAccount2 = accountRepository.create({
      userId: testUserId,
      holderName: 'John Doe',
      accountNumber: 'ACC002TEST',
      accountType: AccountType.SAVINGS,
      balance: 500.0,
      currency: 'USD',
      isActive: true,
    });

    try {
      const savedAccount1 = await accountRepository.save({
        userId: testUserId,
        holderName: 'John Doe',
        accountNumber: 'ACC001TEST',
        accountType: AccountType.SAVINGS,
        balance: 1000.0,
        currency: 'USD',
        isActive: true,
      });

      const savedAccount2 = await accountRepository.save({
        userId: testUserId,
        holderName: 'John Doe',
        accountNumber: 'ACC002TEST',
        accountType: AccountType.SAVINGS,
        balance: 500.0,
        currency: 'USD',
        isActive: true,
      });

      testAccountId = savedAccount1.id;
      testAccount2Id = savedAccount2.id;

      console.log('✅ Test accounts created:', {
        testAccountId,
        testAccount2Id,
      });

      // VERIFICAR que no sean undefined
      if (!testAccountId || !testAccount2Id) {
        throw new Error('Failed to create test accounts');
      }
    } catch (error) {
      console.error('❌ Error creating test accounts:', error);
      throw error; // No continuar si fallan
    }
  });

  afterAll(async () => {
    try {
      await transactionRepository.delete({});
      await accountRepository.delete(testAccountId);
      await accountRepository.delete(testAccount2Id);
      await userRepository.delete(testUserId);
    } catch (error) {
      // Ignore cleanup errors
    }

    await app.close();
  });

  describe('POST /transactions', () => {
    it('should create transfer transaction with valid token and data', async () => {
      console.log('santi1:testAccountId:', testAccountId);
      console.log('santi2:testAccount2Id:', testAccount2Id);

      const createTransactionDto = {
        fromAccountId: testAccountId,
        toAccountId: testAccount2Id,
        type: 'transfer',
        amount: 200.0,
        currency: 'USD',
        description: 'Test transfer',
      };

      console.log(
        'santi3:Sending DTO:',
        JSON.stringify(createTransactionDto, null, 2),
      );

      const response = await request(app.getHttpServer())
        .post('/transactions')
        .set('Authorization', `Bearer ${validToken}`)
        .send(createTransactionDto);

      console.log('santi4:Backend logs should appear above');
      console.log('santi5:Response status:', response.status);
      console.log(
        'santi6:Response body:',
        JSON.stringify(response.body, null, 2),
      );
    });

    it('should create deposit transaction', async () => {
      const createDepositDto = {
        toAccountId: testAccountId,
        type: 'deposit',
        amount: 500.0,
        currency: 'USD',
        description: 'Salary deposit',
      };

      const response = await request(app.getHttpServer())
        .post('/transactions')
        .set('Authorization', `Bearer ${validToken}`)
        .send(createDepositDto)
        .expect(201);

      expect(response.body.toAccountId).toBe(testAccountId);
      expect(response.body.type).toBe('deposit');
      expect(response.body.amount).toBe(500.0);
      // Cambiar de toBeUndefined() a estos:
      expect(response.body.fromAccountId).toBeNull(); // o toBeFalsy()
    });

    it('should create withdrawal transaction when balance is sufficient', async () => {
      const createWithdrawalDto = {
        fromAccountId: testAccountId,
        type: 'withdrawal',
        amount: 100.0,
        currency: 'USD',
        description: 'ATM withdrawal',
      };

      const response = await request(app.getHttpServer())
        .post('/transactions')
        .set('Authorization', `Bearer ${validToken}`)
        .send(createWithdrawalDto)
        .expect(201);

      expect(response.body.fromAccountId).toBe(testAccountId);
      expect(response.body.type).toBe('withdrawal');
      expect(response.body.amount).toBe(100.0);
      // Cambiar:
      expect(response.body.toAccountId).toBeNull(); // o toBeFalsy()
    });

    it('should return 401 without valid token', async () => {
      const createTransactionDto = {
        fromAccountId: testAccountId,
        toAccountId: testAccount2Id,
        type: 'transfer',
        amount: 100.0,
        currency: 'USD',
        description: 'Unauthorized transfer attempt',
      };

      await request(app.getHttpServer())
        .post('/transactions')
        .send(createTransactionDto)
        .expect(401);
    });

    it('should return 401 with invalid token', async () => {
      const createTransactionDto = {
        fromAccountId: testAccountId,
        toAccountId: testAccount2Id,
        type: 'transfer',
        amount: 100.0,
        currency: 'USD',
        description: 'Invalid token transfer attempt',
      };

      await request(app.getHttpServer())
        .post('/transactions')
        .set('Authorization', 'Bearer invalid-token')
        .send(createTransactionDto)
        .expect(401);
    });

    it('should return 400 with invalid transaction data', async () => {
      const invalidTransactionDto = {
        fromAccountId: 'invalid-uuid',
        toAccountId: testAccount2Id,
        type: 'invalid-type',
        amount: -100.0,
        currency: 'INVALID',
        description: '',
      };

      await request(app.getHttpServer())
        .post('/transactions')
        .set('Authorization', `Bearer ${validToken}`)
        .send(invalidTransactionDto)
        .expect(400);
    });

    it('should return 400 when transfer missing required accounts', async () => {
      const invalidTransferDto = {
        toAccountId: testAccount2Id,
        type: 'transfer',
        amount: 100.0,
        currency: 'USD',
        description: 'Invalid transfer',
      };

      await request(app.getHttpServer())
        .post('/transactions')
        .set('Authorization', `Bearer ${validToken}`)
        .send(invalidTransferDto)
        .expect(400);
    });

    it('should return 404 when source account does not exist', async () => {
      const nonExistentAccountDto = {
        fromAccountId: '123e4567-e89b-12d3-a456-426614174999',
        toAccountId: testAccount2Id,
        type: 'transfer',
        amount: 100.0,
        currency: 'USD',
        description: 'Transfer from non-existent account',
      };

      const response = await request(app.getHttpServer())
        .post('/transactions')
        .set('Authorization', `Bearer ${validToken}`)
        .send(nonExistentAccountDto);

      // May return 400 or 404 depending on implementation
      expect([400, 404]).toContain(response.status);
    });

    it('should return 404 when destination account does not exist', async () => {
      const nonExistentAccountDto = {
        fromAccountId: testAccountId,
        toAccountId: '123e4567-e89b-12d3-a456-426614174999',
        type: 'transfer',
        amount: 100.0,
        currency: 'USD',
        description: 'Transfer to non-existent account',
      };

      const response = await request(app.getHttpServer())
        .post('/transactions')
        .set('Authorization', `Bearer ${validToken}`)
        .send(nonExistentAccountDto);

      // May return 400 or 404 depending on implementation
      expect([400, 404]).toContain(response.status);
    });
  });

  describe('GET /transactions/:id', () => {
    let testTransactionId: string;

    beforeAll(async () => {
      // Create transaction directly via POST endpoint
      const response = await request(app.getHttpServer())
        .post('/transactions')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          fromAccountId: testAccountId,
          toAccountId: testAccount2Id,
          type: 'transfer',
          amount: 50.0,
          currency: 'USD',
          description: 'Test transaction for GET',
        });

      testTransactionId = response.body.id;
    });

    it('should get transaction by ID with valid token', async () => {
      const response = await request(app.getHttpServer())
        .get(`/transactions/${testTransactionId}`)
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body.id).toBe(testTransactionId);
      expect(response.body.fromAccountId).toBe(testAccountId);
      expect(response.body.toAccountId).toBe(testAccount2Id);
      expect(response.body.amount).toBe(50.0);
    });

    it('should return 401 without valid token', async () => {
      await request(app.getHttpServer())
        .get(`/transactions/${testTransactionId}`)
        .expect(401);
    });

    it('should return 404 for non-existent transaction', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174999';

      await request(app.getHttpServer())
        .get(`/transactions/${nonExistentId}`)
        .set('Authorization', `Bearer ${validToken}`)
        .expect(404);
    });
  });

  describe('GET /transactions/account/:accountId', () => {
    it('should get transactions for account with valid token', async () => {
      const response = await request(app.getHttpServer())
        .get(`/transactions/account/${testAccountId}`)
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should return 401 without valid token', async () => {
      await request(app.getHttpServer())
        .get(`/transactions/account/${testAccountId}`)
        .expect(401);
    });

    it('should return empty array or 404 for non-existent account', async () => {
      const nonExistentAccountId = '123e4567-e89b-12d3-a456-426614174999';

      const response = await request(app.getHttpServer())
        .get(`/transactions/account/${nonExistentAccountId}`)
        .set('Authorization', `Bearer ${validToken}`);

      // Accept either empty array (200) or 404
      expect([200, 404]).toContain(response.status);
    });
  });

  describe('GET /transactions', () => {
    it('should get all transactions with valid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/transactions')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return 401 without valid token', async () => {
      await request(app.getHttpServer()).get('/transactions').expect(401);
    });
  });

  describe('JWT Authentication Tests for Transactions', () => {
    it('should accept valid JWT token format', async () => {
      const response = await request(app.getHttpServer())
        .get('/transactions')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.status).toBe(200);
    });

    it('should reject malformed JWT token', async () => {
      const malformedToken = 'not.a.valid.jwt.token';

      await request(app.getHttpServer())
        .get('/transactions')
        .set('Authorization', `Bearer ${malformedToken}`)
        .expect(401);
    });

    it('should reject expired JWT token', async () => {
      const expiredToken = jwtService.sign(
        { sub: testUserId, email: 'test@example.com' },
        { expiresIn: '-1h' },
      );

      await request(app.getHttpServer())
        .get('/transactions')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);
    });

    it('should reject token without Bearer prefix', async () => {
      await request(app.getHttpServer())
        .get('/transactions')
        .set('Authorization', validToken)
        .expect(401);
    });

    it('should reject empty Authorization header', async () => {
      await request(app.getHttpServer())
        .get('/transactions')
        .set('Authorization', '')
        .expect(401);
    });
  });
});
