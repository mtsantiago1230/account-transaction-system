import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
const request = require('supertest');
import { AppModule } from '../src/app.module';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../src/infrastructure/database/entities/user.entity';
import { AccountEntity } from '../src/infrastructure/database/entities/account.entity';
import * as bcrypt from 'bcrypt';

describe('AccountController (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let userRepository: Repository<UserEntity>;
  let accountRepository: Repository<AccountEntity>;
  let validToken: string;
  let testUserId: string;
  let testAccountId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Add validation pipes to match production setup
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    jwtService = moduleFixture.get<JwtService>(JwtService);
    userRepository = moduleFixture.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );
    accountRepository = moduleFixture.get<Repository<AccountEntity>>(
      getRepositoryToken(AccountEntity),
    );

    await app.init();

    // Create an isolated test user (do not collide with seeded user) and generate token
    const uniq = Math.random().toString(36).slice(2, 10).toLowerCase();
    const testEmail = `account-test+${uniq}@example.com`;
    const hashed = await bcrypt.hash('password123', 10);
    const testUser = userRepository.create({
      email: testEmail,
      password: hashed,
      firstName: 'John',
      lastName: 'Doe',
    });

    const savedUser = await userRepository.save(testUser);
    testUserId = savedUser.id;

    validToken = jwtService.sign({
      sub: testUserId,
      email: testEmail,
    });
  });

  afterAll(async () => {
    // Clean up test data - delete accounts first, then users (foreign key constraint)
    try {
      // Delete all accounts for the test user first
      const userAccounts = await accountRepository.find({
        where: { userId: testUserId },
      });
      for (const account of userAccounts) {
        await accountRepository.delete(account.id);
      }
    } catch (error) {
      // Ignore cleanup errors
    }

    if (testAccountId) {
      try {
        await accountRepository.delete(testAccountId);
      } catch (error) {
        // Ignore cleanup errors
      }
    }

    try {
      if (testUserId) await userRepository.delete(testUserId);
    } catch (error) {
      // Ignore cleanup errors
    }

    await app.close();
  });

  describe('POST /accounts', () => {
    it('should create account with valid token and data', async () => {
      const createAccountDto = {
        userId: testUserId,
        holderName: 'John Doe',
        accountType: 'savings',
        currency: 'USD',
        initialBalance: 1000.0,
      };

      const response = await request(app.getHttpServer())
        .post('/accounts')
        .set('Authorization', `Bearer ${validToken}`)
        .send(createAccountDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('accountNumber');
      expect(response.body.userId).toBe(testUserId);
      expect(response.body.holderName).toBe('John Doe');
      expect(response.body.accountType).toBe('savings');
      expect(response.body.currency).toBe('USD');
      expect(response.body.balance).toBe(1000.0);
      expect(response.body.isActive).toBe(true);

      // Store account ID for cleanup
      testAccountId = response.body.id;
    });

    it('should return 401 without valid token', async () => {
      const createAccountDto = {
        userId: testUserId,
        holderName: 'John Doe',
        accountType: 'savings',
        currency: 'USD',
        initialBalance: 1000.0,
      };

      await request(app.getHttpServer())
        .post('/accounts')
        .send(createAccountDto)
        .expect(401);
    });

    it('should return 401 with invalid token', async () => {
      const createAccountDto = {
        userId: testUserId,
        holderName: 'John Doe',
        accountType: 'savings',
        currency: 'USD',
        initialBalance: 1000.0,
      };

      await request(app.getHttpServer())
        .post('/accounts')
        .set('Authorization', 'Bearer invalid-token')
        .send(createAccountDto)
        .expect(401);
    });

    it('should return 400 with invalid data', async () => {
      const invalidAccountDto = {
        userId: 'invalid-uuid',
        holderName: '',
        accountType: 'invalid-type',
        currency: 'INVALID',
        initialBalance: -100,
      };

      await request(app.getHttpServer())
        .post('/accounts')
        .set('Authorization', `Bearer ${validToken}`)
        .send(invalidAccountDto)
        .expect(400);
    });

    it('should return 400 with missing required fields', async () => {
      const incompleteAccountDto = {
        userId: testUserId,
        // Missing required fields
      };

      await request(app.getHttpServer())
        .post('/accounts')
        .set('Authorization', `Bearer ${validToken}`)
        .send(incompleteAccountDto)
        .expect(400);
    });
  });

  describe('GET /accounts/:id', () => {
    it('should get account by ID with valid token', async () => {
      // First create an account
      const createAccountDto = {
        userId: testUserId,
        holderName: 'Jane Smith',
        accountType: 'savings',
        currency: 'EUR',
        initialBalance: 500.0,
      };

      const createResponse = await request(app.getHttpServer())
        .post('/accounts')
        .set('Authorization', `Bearer ${validToken}`)
        .send(createAccountDto)
        .expect(201);

      const accountId = createResponse.body.id;

      // Then get the account
      const response = await request(app.getHttpServer())
        .get(`/accounts/${accountId}`)
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body.id).toBe(accountId);
      expect(response.body.userId).toBe(testUserId);
      expect(response.body.holderName).toBe('Jane Smith');
      expect(response.body.currency).toBe('EUR');
      expect(response.body.balance).toBe(500.0);

      // Cleanup
      await accountRepository.delete(accountId);
    });

    it('should return 401 without valid token', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174999';

      await request(app.getHttpServer())
        .get(`/accounts/${nonExistentId}`)
        .expect(401);
    });

    it('should return 404 for non-existent account', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174999';

      await request(app.getHttpServer())
        .get(`/accounts/${nonExistentId}`)
        .set('Authorization', `Bearer ${validToken}`)
        .expect(404);
    });

    it('should return 400 for invalid UUID format', async () => {
      const invalidId = 'invalid-uuid-format';

      await request(app.getHttpServer())
        .get(`/accounts/${invalidId}`)
        .set('Authorization', `Bearer ${validToken}`)
        .expect(400);
    });
  });

  describe('GET /accounts', () => {
    it('should get all accounts with valid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/accounts')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      // Should include any accounts created during tests
    });

    it('should return 401 without valid token', async () => {
      await request(app.getHttpServer()).get('/accounts').expect(401);
    });
  });

  describe('GET /accounts/user/:userId', () => {
    it('should get accounts by user ID with valid token', async () => {
      const response = await request(app.getHttpServer())
        .get(`/accounts/user/${testUserId}`)
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      // Should include accounts created for test user
    });

    it('should return 401 without valid token', async () => {
      await request(app.getHttpServer())
        .get(`/accounts/user/${testUserId}`)
        .expect(401);
    });

    it('should return empty array for user with no accounts', async () => {
      const nonExistentUserId = '123e4567-e89b-12d3-a456-426614174888';

      const response = await request(app.getHttpServer())
        .get(`/accounts/user/${nonExistentUserId}`)
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });

    it('should return 400 for invalid user ID format', async () => {
      const invalidUserId = 'invalid-uuid';

      await request(app.getHttpServer())
        .get(`/accounts/user/${invalidUserId}`)
        .set('Authorization', `Bearer ${validToken}`)
        .expect(400);
    });
  });

  describe('PUT /accounts/:id', () => {
    it('should update account with valid token and data', async () => {
      // First create an account
      const createAccountDto = {
        userId: testUserId,
        holderName: 'Update Test',
        accountType: 'savings',
        currency: 'USD',
        initialBalance: 100.0,
      };

      const createResponse = await request(app.getHttpServer())
        .post('/accounts')
        .set('Authorization', `Bearer ${validToken}`)
        .send(createAccountDto)
        .expect(201);

      const accountId = createResponse.body.id;

      // Then update the account
      const updateAccountDto = {
        isActive: false,
      };

      const response = await request(app.getHttpServer())
        .put(`/accounts/${accountId}`)
        .set('Authorization', `Bearer ${validToken}`)
        .send(updateAccountDto)
        .expect(200);

      expect(response.body.id).toBe(accountId);
      expect(response.body.isActive).toBe(false);

      // Cleanup
      await accountRepository.delete(accountId);
    });

    it('should return 401 without valid token', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174999';
      const updateDto = { isActive: false };

      await request(app.getHttpServer())
        .put(`/accounts/${nonExistentId}`)
        .send(updateDto)
        .expect(401);
    });

    it('should return 404 for non-existent account', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174999';
      const updateDto = { isActive: false };

      await request(app.getHttpServer())
        .put(`/accounts/${nonExistentId}`)
        .set('Authorization', `Bearer ${validToken}`)
        .send(updateDto)
        .expect(404);
    });
  });

  describe('JWT Authentication Tests', () => {
    it('should accept valid JWT token format', async () => {
      const response = await request(app.getHttpServer())
        .get('/accounts')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.status).toBe(200);
    });

    it('should reject malformed JWT token', async () => {
      const malformedToken = 'not.a.valid.jwt.token';

      await request(app.getHttpServer())
        .get('/accounts')
        .set('Authorization', `Bearer ${malformedToken}`)
        .expect(401);
    });

    it('should reject expired JWT token', async () => {
      // Create an expired token
      const expiredToken = jwtService.sign(
        { sub: testUserId, email: 'test@example.com' },
        { expiresIn: '-1h' }, // Expired 1 hour ago
      );

      await request(app.getHttpServer())
        .get('/accounts')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);
    });

    it('should reject token without Bearer prefix', async () => {
      await request(app.getHttpServer())
        .get('/accounts')
        .set('Authorization', validToken) // Missing 'Bearer ' prefix
        .expect(401);
    });

    it('should reject empty Authorization header', async () => {
      await request(app.getHttpServer())
        .get('/accounts')
        .set('Authorization', '')
        .expect(401);
    });
  });
});
