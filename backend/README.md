# Account Transaction System — Backend

NestJS 11 REST API with TypeScript, TypeORM, PostgreSQL, and JWT authentication. Implements clean architecture with domain-driven design principles.

## 🏗️ Architecture

```
src/
├── domain/                 # Core business models & repository interfaces
│   ├── entities/           # Domain entities (User, Account, Transaction)
│   └── repositories/       # Repository interfaces
├── application/            # Use cases and business logic
│   ├── services/           # Application services
│   └── use-cases/          # Business use cases
├── infrastructure/         # External concerns (DB, APIs)
│   ├── database/           # TypeORM entities and migrations
│   └── repositories/       # Repository implementations
├── interfaces/             # HTTP layer
│   ├── controllers/        # REST controllers
│   └── dtos/               # Data transfer objects
├── modules/                # NestJS feature modules
│   ├── account/            # Account module
│   ├── transaction/        # Transaction module
│   └── ...
├── auth/                   # JWT authentication module
└── config/                 # Configuration files
    ├── typeorm.config.ts   # TypeORM configuration
    ├── database.config.ts  # Database settings
    └── jwt.config.ts       # JWT settings
```

**Tech Stack:**

- **Framework:** NestJS 11
- **ORM:** TypeORM with PostgreSQL
- **Authentication:** Passport-JWT
- **Validation:** class-validator, class-transformer
- **Testing:** Jest, Supertest

## 🚀 Quick Start

### With Docker (Recommended)

From the **project root**:

```powershell
# Development mode
npm run docker:dev

# View logs
npm run docker:dev:logs

# Run migrations
docker exec -it account-transaction-backend npm run migration:run

# Create test user
docker exec -it account-transaction-backend npx ts-node src/scripts/seed-test-user.ts
```

### Local Development (Without Docker)

#### Prerequisites

- Node.js 18+
- npm
- PostgreSQL 13+

#### Setup

```powershell
cd backend
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database credentials
```

#### Environment Configuration

Create a `.env` file with:

```env
# Database (choose one option)
# Option A: Connection URL (recommended)
DATABASE_URL=postgresql://postgres:root@localhost:5432/account_transaction_db

# Option B: Individual settings
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=root
DB_DATABASE=account_transaction_db

# Application
PORT=3000
NODE_ENV=development

# Security
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
DB_SSL=false  # Set to 'true' in production with SSL-enabled databases
```

**Important Notes:**

- 🔒 Never commit `.env` to version control
- 🔐 Use strong `JWT_SECRET` in production (min 32 characters)
- 🛡️ Enable `DB_SSL=true` when deploying to cloud providers (AWS RDS, Heroku, Azure)
- 📝 `synchronize: true` only in development - use migrations in production

#### Database Setup

```powershell
# Create database
psql -U postgres -c "CREATE DATABASE account_transaction_db;"

# Run migrations
npm run migration:run

# Seed test user (email: test@example.com, password: password123)
npx ts-node src/scripts/seed-test-user.ts
```

#### Run the Application

```powershell
# Development (watch mode with hot-reload)
npm run start:dev

# Production
npm run build
npm run start:prod

# Debug mode
npm run start:debug
```

API will be available at http://localhost:3000

## 🗄️ Database Management

### Migrations

```powershell
# Generate migration from entity changes
npm run migration:generate src/infrastructure/database/migrations/MigrationName

# Create empty migration
npm run migration:create src/infrastructure/database/migrations/MigrationName

# Run pending migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Show migration status
npm run migration:show
```

### Schema Utilities (Development Only)

```powershell
# Sync schema (⚠️ destructive - use only in development)
npm run schema:sync

# Drop all tables (⚠️ destructive)
npm run schema:drop
```

### Database Operations with Docker

```powershell
# Run migrations inside container
docker exec -it account-transaction-backend npm run migration:run

# Create test user
docker exec -it account-transaction-backend npx ts-node src/scripts/seed-test-user.ts

# Access PostgreSQL shell
docker exec -it ats-database psql -U postgres -d account_transaction_db

# Common SQL queries
docker exec -it ats-database psql -U postgres -d account_transaction_db -c "SELECT * FROM users;"
docker exec -it ats-database psql -U postgres -d account_transaction_db -c "SELECT * FROM accounts;"
```

## 🧪 Testing

```powershell
# Unit tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:cov

# End-to-end tests
npm run test:e2e

# Specific test file
npm test -- account.service.spec.ts
```

**Test Coverage:**

- Unit tests for services and entities
- E2E tests for API endpoints
- Authentication and authorization tests

## 📡 API Endpoints

### Authentication

```
POST   /auth/login           # Login and get JWT token
POST   /auth/register        # Register new user (if enabled)
```

### Users

```
GET    /api/users            # Get all users (admin)
GET    /api/users/:id        # Get user by ID
POST   /api/users            # Create user
PUT    /api/users/:id        # Update user
DELETE /api/users/:id        # Delete user
```

### Accounts

```
GET    /api/accounts         # Get user's accounts
GET    /api/accounts/:id     # Get account by ID
POST   /api/accounts         # Create account
PUT    /api/accounts/:id     # Update account
DELETE /api/accounts/:id     # Delete account
```

### Transactions

```
GET    /api/transactions                    # Get user's transactions
GET    /api/transactions/:id                # Get transaction by ID
POST   /api/transactions                    # Create transaction
GET    /api/accounts/:id/transactions       # Get account transactions
```

**Authentication:**
All endpoints (except `/auth/login`) require JWT authentication:

```
Authorization: Bearer <your-jwt-token>
```

For detailed API documentation, see [AUTH_README - copia.md](AUTH_README%20-%20copia.md)

## 🔧 Configuration

### TypeORM Configuration

TypeORM is configured in `src/config/typeorm.config.ts`:

- ✅ Auto-loads entities from `infrastructure/database/entities/`
- ✅ Synchronize enabled in development only
- ✅ SSL support for production databases
- ✅ Connection pooling and retry logic
- ✅ Query logging in development

### SSL Configuration

SSL is controlled by the `DB_SSL` environment variable:

```typescript
// Development (local PostgreSQL without SSL)
DB_SSL = false;

// Production (cloud databases like AWS RDS, Heroku)
DB_SSL = true;
```

### Environment-based Configuration

The app behavior changes based on `NODE_ENV`:

| Feature      | development | production  | test       |
| ------------ | ----------- | ----------- | ---------- |
| TypeORM sync | ✅ Yes      | ❌ No       | ❌ No      |
| Logging      | Verbose     | Errors only | Off        |
| SSL          | Optional    | Required    | Optional   |
| CORS         | Permissive  | Strict      | Permissive |

## 🚀 Deployment

### With Docker (Recommended)

From project root:

```powershell
# Build and deploy
npm run docker:prod:build

# View logs
npm run docker:prod:logs
```

### Manual Deployment

```powershell
# Build the application
npm run build

# Set production environment variables
export NODE_ENV=production
export DATABASE_URL=<your-production-database-url>
export JWT_SECRET=<your-secret-key>
export DB_SSL=true

# Run migrations
npm run migration:run

# Start the application
npm run start:prod
```

### Environment Variables for Production

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=<strong-random-secret>
DB_SSL=true
PORT=3000
```

**Security Checklist:**

- ✅ Use strong `JWT_SECRET` (min 32 characters)
- ✅ Enable SSL for database connections (`DB_SSL=true`)
- ✅ Use environment variables, never hardcode secrets
- ✅ Run migrations, don't use `synchronize: true`
- ✅ Set up proper CORS configuration
- ✅ Enable rate limiting for auth endpoints
- ✅ Use HTTPS in production

## 🐛 Troubleshooting

### Database Connection Issues

**Error: "Unable to connect to the database"**

- Check if PostgreSQL is running
- Verify DATABASE*URL or individual DB*\* variables
- Ensure database exists: `psql -U postgres -c "CREATE DATABASE account_transaction_db;"`

**Error: "The server does not support SSL connections"**

- Set `DB_SSL=false` for local development
- Use `DB_SSL=true` only with SSL-enabled databases (production)

### Migration Issues

**Error: "No changes in database schema were found"**

- Changes detected automatically from entities
- If needed, create empty migration: `npm run migration:create`

**Error: "Query failed: relation already exists"**

- Database might be out of sync
- In development: `npm run schema:drop && npm run migration:run`
- In production: Review and fix migrations manually

### Common Errors

**401 Unauthorized:**

- JWT token missing or invalid
- Verify token in Authorization header: `Bearer <token>`

**500 Internal Server Error:**

- Check application logs: `docker logs account-transaction-backend`
- Verify database connection and migrations

**Port already in use:**

- Change PORT in .env
- Or stop conflicting process: `netstat -ano | findstr :3000`

## 📦 NPM Scripts

```json
{
  "start": "nest start",
  "start:dev": "nest start --watch",
  "start:debug": "nest start --debug --watch",
  "start:prod": "node dist/main",
  "build": "nest build",
  "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
  "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
  "test": "jest",
  "test:watch": "jest --watch",
  "test:cov": "jest --coverage",
  "test:e2e": "jest --config ./test/jest-e2e.json",
  "migration:create": "typeorm migration:create",
  "migration:generate": "typeorm-ts-node-esm migration:generate",
  "migration:run": "typeorm-ts-node-esm migration:run",
  "migration:revert": "typeorm-ts-node-esm migration:revert",
  "schema:sync": "typeorm-ts-node-esm schema:sync",
  "schema:drop": "typeorm-ts-node-esm schema:drop"
}
```

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

## License

UNLICENSED
