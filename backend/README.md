# Account Transaction System - Backend

A NestJS backend application with TypeScript, TypeORM, PostgreSQL, and Clean Architecture principles for managing account transactions.

## Architecture

This project follows **Clean Architecture** principles, organizing code into distinct layers:

```
src/
├── domain/                 # Enterprise Business Rules
│   ├── entities/           # Domain entities (interfaces)
│   │   ├── user.entity.ts
│   │   ├── account.entity.ts
│   │   └── transaction.entity.ts
│   └── repositories/       # Repository interfaces
│       ├── user.repository.interface.ts
│       ├── account.repository.interface.ts
│       └── transaction.repository.interface.ts
│
├── application/            # Application Business Rules
│   └── use-cases/          # Use cases (business logic)
│       ├── account/        # Account-related use cases
│       │   ├── user.use-cases.ts
│       │   └── account.use-cases.ts
│       └── transaction/    # Transaction-related use cases
│           └── transaction.use-cases.ts
│
├── infrastructure/         # Frameworks & Drivers
│   ├── database/           # Database implementations
│   │   └── entities/       # TypeORM entities
│   │       ├── user.entity.ts
│   │       ├── account.entity.ts
│   │       └── transaction.entity.ts
│   └── repositories/       # Repository implementations
│       ├── user.repository.ts
│       ├── account.repository.ts
│       └── transaction.repository.ts
│
├── interfaces/             # Interface Adapters
│   ├── controllers/        # HTTP controllers
│   │   ├── user.controller.ts
│   │   ├── account.controller.ts
│   │   └── transaction.controller.ts
│   └── dtos/              # Data Transfer Objects
│       ├── user.dto.ts
│       ├── account.dto.ts
│       └── transaction.dto.ts
│
├── modules/               # NestJS modules
│   ├── account/           # Account module
│   │   ├── user.module.ts
│   │   └── account.module.ts
│   └── transaction/       # Transaction module
│       └── transaction.module.ts
│
└── config/               # Configuration
    ├── app.config.ts
    ├── database.config.ts
    ├── typeorm.config.ts
    ├── data-source.ts
    ├── jwt.config.ts
    └── index.ts
```

## Features

- **Clean Architecture**: Separation of concerns with dependency inversion
- **Domain-Driven Design**: Rich domain models and business logic
- **NestJS Framework**: Modular, scalable Node.js framework
- **TypeScript**: Full type safety and modern JavaScript features
- **TypeORM**: Object-Relational Mapping with PostgreSQL
- **Dependency Injection**: Loose coupling between layers
- **Validation**: Input validation with class-validator
- **Environment Configuration**: Secure environment variable management

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

## Quick start

```powershell
# from backend/
npm install
Copy-Item .env.example .env
# edit .env if needed (DB, JWT)
npm run migration:run
# seed default test user (test@example.com / password123)
node -r ts-node/register -r tsconfig-paths/register src/scripts/seed-test-user.ts
npm run start:dev
```

## Environment Setup

1. Copy the environment template:

   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your actual configuration:

   ```env
   # Database Configuration (Option 1: Full URL)
   DATABASE_URL=postgresql://username:password@localhost:5432/account_transaction_db

   # Database Configuration (Option 2: Individual settings)
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=root
   DB_DATABASE=account_transaction_db

   # Application Settings
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   PORT=3000
   NODE_ENV=development
   ```

## Installation

Install dependencies:

```bash
npm install
```

## Database Setup

### Using PostgreSQL

1. Create a PostgreSQL database named `account_transaction_db`
2. Update the database configuration in your `.env` file

### Database Configuration Options

The application supports two ways to configure the database connection:

#### Option 1: Database URL (Recommended for Production)

```env
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
```

#### Option 2: Individual Environment Variables

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=database_name
```

### TypeORM Configuration

The TypeORM configuration is located in `src/config/typeorm.config.ts` and provides:

- **Flexible Connection**: Supports both `DATABASE_URL` and individual environment variables
- **Environment-specific Settings**: Different configurations for development and production
- **SSL Support**: Automatically enabled for production environments
- **Connection Pooling**: Optimized connection pool settings
- **Migration Support**: CLI integration for database migrations

### Database Migrations

Generate a new migration:

```bash
npm run migration:generate -- --name CreateInitialTables
```

Run migrations:

```bash
npm run migration:run
```

Revert the last migration:

```bash
npm run migration:revert
```

Synchronize database schema (development only):

```bash
npm run schema:sync
```

## Running the Application

### Development Mode

```bash
npm run start:dev
```

The application will start with hot-reload enabled on `http://localhost:3000`

### Production Mode

```bash
npm run build
npm run start:prod
```

## Testing

### Run Tests

```bash
npm run test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Run End-to-End Tests

```bash
npm run test:e2e
```

Note: E2E logs may include teardown foreign‑key warnings and an open‑handle message; they are benign.

## Seeding

To create or update a default test user with a bcrypt‑hashed password:

```powershell
node -r ts-node/register -r tsconfig-paths/register src/scripts/seed-test-user.ts
```

Credentials:

- Email: test@example.com
- Password: password123

### Test Coverage

```bash
npm run test:cov
```

## API Endpoints

### Users

- `POST /users` - Create a new user
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `GET /users/email/:email` - Get user by email
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Accounts

- `POST /accounts` - Create a new account
- `GET /accounts` - Get all accounts
- `GET /accounts/:id` - Get account by ID
- `GET /accounts/user/:userId` - Get accounts by user
- `GET /accounts/user/:userId/active` - Get active accounts by user
- `GET /accounts/number/:accountNumber` - Get account by number
- `PUT /accounts/:id` - Update account

### Transactions

- `POST /transactions` - Create a new transaction
- `PUT /transactions/:id/process` - Process a pending transaction
- `PUT /transactions/:id/cancel` - Cancel a pending transaction
- `GET /transactions/pending` - Get all pending transactions
- `GET /transactions/date-range` - Get transactions by date range
- `GET /transactions/:id` - Get transaction by ID
- `GET /transactions/account/:accountId` - Get transactions by account
- `GET /transactions/reference/:reference` - Get transaction by reference

## Clean Architecture Layers

### 1. Domain Layer (`domain/`)

- **Entities**: Pure business objects with no dependencies
- **Repository Interfaces**: Contracts for data access
- **Business Rules**: Core business logic and validation

### 2. Application Layer (`application/`)

- **Use Cases**: Application-specific business rules
- **Services**: Orchestration of domain objects and repositories
- **Business Logic**: Application workflows and processes

### 3. Infrastructure Layer (`infrastructure/`)

- **Database Entities**: TypeORM entities with database annotations
- **Repository Implementations**: Concrete implementations of repository interfaces
- **External Services**: Third-party integrations

### 4. Interface Layer (`interfaces/`)

- **Controllers**: HTTP request/response handling
- **DTOs**: Data validation and transformation
- **Presentation Logic**: User interface concerns

## Configuration

The application uses the `@nestjs/config` package for configuration management. All configurations are loaded from environment variables and organized into separate configuration files:

- **Database Config**: PostgreSQL connection settings with TypeORM integration
- **JWT Config**: JWT secret and expiration settings
- **App Config**: Application port and environment settings

## Scripts

- `npm run build` - Build the application
- `npm run start` - Start the application
- `npm run start:dev` - Start with hot-reload (development)
- `npm run start:debug` - Start with debugging enabled
- `npm run start:prod` - Start in production mode
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:cov` - Run tests with coverage
- `npm run lint` - Lint and fix code
- `npm run format` - Format code with Prettier
- `npm run migration:generate` - Generate a new database migration
- `npm run migration:run` - Run pending migrations
- `npm run migration:revert` - Revert the last migration
- `npm run schema:sync` - Synchronize database schema (development only)

## Clean Architecture Benefits

- **Independence**: Each layer is independent and testable
- **Flexibility**: Easy to change implementations without affecting business logic
- **Testability**: Business logic can be tested without external dependencies
- **Maintainability**: Clear separation of concerns makes code easier to maintain

## Next Steps

1. Create additional entities for your account transaction system
2. Implement authentication and authorization modules
3. Create controllers and services for business logic
4. Add validation pipes and DTOs
5. Implement error handling and logging
6. Add API documentation with Swagger

## License

This project is licensed under the UNLICENSED license.
