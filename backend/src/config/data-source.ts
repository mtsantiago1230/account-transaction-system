import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { UserEntity } from '../infrastructure/database/entities/user.entity';
import { AccountEntity } from '../infrastructure/database/entities/account.entity';
import { TransactionEntity } from '../infrastructure/database/entities/transaction.entity';

// Load environment variables
config();

// Parse DATABASE_URL if provided, otherwise use individual environment variables
const databaseUrl = process.env.DATABASE_URL;
let dbConfig: any = {};

if (databaseUrl) {
  // Parse DATABASE_URL format: postgresql://user:password@host:port/database
  const url = new URL(databaseUrl);
  dbConfig = {
    host: url.hostname,
    port: parseInt(url.port) || 5432,
    username: url.username,
    password: url.password,
    database: url.pathname.slice(1), // Remove leading slash
  };
} else {
  // Use individual environment variables
  dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'account_transaction_db',
  };
}

export const AppDataSource = new DataSource({
  type: 'postgres',
  ...dbConfig,
  entities: [UserEntity, AccountEntity, TransactionEntity],
  migrations: [__dirname + '/../infrastructure/database/migrations/*{.ts,.js}'],
  subscribers: [
    __dirname + '/../infrastructure/database/subscribers/*{.ts,.js}',
  ],
  synchronize: false, // Always false for CLI operations
  logging:
    process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
});
