import { DataSource } from 'typeorm';
import { UserEntity } from '../infrastructure/database/entities/user.entity';

async function seedTestUser() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'account_system',
    entities: ['dist/**/*.entity.js'],
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('Data Source has been initialized!');

    const userRepository = dataSource.getRepository(UserEntity);

    const testUserId = '550e8400-e29b-41d4-a716-446655440000';

    // Check if test user already exists
    const existingUser = await userRepository.findOne({
      where: { id: testUserId },
    });

    if (existingUser) {
      console.log('Test user already exists');
      return;
    }

    // Create test user with simple password (for testing only)
    const testUser = userRepository.create({
      id: testUserId,
      email: 'test@example.com',
      password: 'password123', // In production, this should be hashed
      firstName: 'Test',
      lastName: 'User',
    });

    await userRepository.save(testUser);
    console.log('Test user created successfully with ID:', testUserId);
  } catch (error) {
    console.error('Error seeding test user:', error);
  } finally {
    await dataSource.destroy();
  }
}

seedTestUser();
