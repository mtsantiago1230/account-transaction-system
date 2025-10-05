import { DataSource } from 'typeorm';
import { config as loadEnv } from 'dotenv';
import { UserEntity } from '../infrastructure/database/entities/user.entity';
import { AppDataSource } from '../config/data-source';
import * as bcrypt from 'bcrypt';

// Load environment variables so we use the same DB config as the app/tests
loadEnv();

async function seedTestUser() {
  // Reuse the app's configured DataSource to avoid mismatched credentials
  const dataSource: DataSource = AppDataSource;

  try {
    await dataSource.initialize();
    console.log('Data Source has been initialized!');

    const userRepository = dataSource.getRepository(UserEntity);

    const testUserId = '550e8400-e29b-41d4-a716-446655440000';
    const testEmail = 'test@example.com';

    // Prefer lookup by email (unique) and also by fixed id for legacy runs
    let existingUser = await userRepository.findOne({
      where: { email: testEmail },
    });
    if (!existingUser) {
      existingUser = await userRepository.findOne({
        where: { id: testUserId },
      });
    }

    const hashed = await bcrypt.hash('password123', 10);

    if (existingUser) {
      // If password isn't hashed yet, update it to the hashed version
      const looksHashed =
        typeof existingUser.password === 'string' &&
        existingUser.password.startsWith('$2');
      if (!looksHashed) {
        existingUser.password = hashed;
        await userRepository.save(existingUser);
        console.log('Updated existing test user password to hashed format.');
      } else {
        console.log('Test user already exists with hashed password.');
      }
      return;
    }

    // Create test user with hashed password
    const testUser = userRepository.create({
      id: testUserId,
      email: testEmail,
      password: hashed,
      firstName: 'Test',
      lastName: 'User',
    });

    const saved = await userRepository.save(testUser);
    console.log('Test user created successfully with ID:', saved.id);
  } catch (error) {
    console.error('Error seeding test user:', error);
  } finally {
    await dataSource.destroy();
  }
}

seedTestUser();
