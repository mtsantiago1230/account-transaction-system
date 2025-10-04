# Account Transaction System - Backend# Account Transaction System - Backend



A NestJS backend application with TypeScript, TypeORM, PostgreSQL, and Clean Architecture principles for managing account transactions.A NestJS backend application with TypeScript, TypeORM, and PostgreSQL for managing account transactions.



## Architecture## Features



This project follows **Clean Architecture** principles, organizing code into distinct layers:- **NestJS Framework**: Progressive Node.js framework for building scalable server-side applications

- **TypeScript**: Full TypeScript support with strict type checking

```- **TypeORM**: Object-Relational Mapping with PostgreSQL

src/- **Configuration Management**: Environment-based configuration with validation

├── domain/                 # Enterprise Business Rules- **Database Integration**: PostgreSQL database with TypeORM entities

│   ├── entities/           # Domain entities (interfaces)- **Development Tools**: Hot-reload, linting, testing, and formatting

│   │   ├── user.entity.ts

│   │   ├── account.entity.ts## Prerequisites

│   │   └── transaction.entity.ts

│   └── repositories/       # Repository interfaces- Node.js (v18 or higher)

│       ├── user.repository.interface.ts- PostgreSQL database

│       ├── account.repository.interface.ts- npm or yarn

│       └── transaction.repository.interface.ts

│## Environment Setup

├── application/            # Application Business Rules

│   └── use-cases/          # Use cases (business logic)1. Copy the environment template:

│       ├── account/        # Account-related use cases

│       │   ├── user.use-cases.ts   ```bash

│       │   └── account.use-cases.ts   cp .env.example .env

│       └── transaction/    # Transaction-related use cases   ```

│           └── transaction.use-cases.ts

│2. Update the `.env` file with your actual configuration:

├── infrastructure/         # Frameworks & Drivers   ```env

│   ├── database/           # Database implementations   DATABASE_URL=postgresql://username:password@localhost:5432/account_transaction_db

│   │   └── entities/       # TypeORM entities   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

│   │       ├── user.entity.ts   PORT=3000

│   │       ├── account.entity.ts   NODE_ENV=development

│   │       └── transaction.entity.ts   ```

│   └── repositories/       # Repository implementations

│       ├── user.repository.ts## Installation

│       ├── account.repository.ts

│       └── transaction.repository.tsInstall dependencies:

│

├── interfaces/             # Interface Adapters```bash

│   ├── controllers/        # HTTP controllersnpm install

│   │   ├── user.controller.ts```

│   │   ├── account.controller.ts

│   │   └── transaction.controller.ts## Database Setup

│   └── dtos/              # Data Transfer Objects

│       ├── user.dto.ts1. Create a PostgreSQL database named `account_transaction_db`

│       ├── account.dto.ts2. Update the `DATABASE_URL` in your `.env` file with your database credentials

│       └── transaction.dto.ts

│## Running the Application

├── modules/               # NestJS modules

│   ├── account/           # Account module### Development Mode

│   │   ├── user.module.ts

│   │   └── account.module.ts```bash

│   └── transaction/       # Transaction modulenpm run start:dev

│       └── transaction.module.ts```

│

└── config/               # ConfigurationThe application will start with hot-reload enabled on `http://localhost:3000`

    ├── app.config.ts

    ├── database.config.ts### Production Mode

    ├── jwt.config.ts

    └── index.ts```bash

```npm run build

npm run start:prod

## Clean Architecture Layers```



### 1. Domain Layer (`domain/`)## Testing

- **Entities**: Pure business objects with no dependencies

- **Repository Interfaces**: Contracts for data access### Run Tests

- **Business Rules**: Core business logic and validation

```bash

### 2. Application Layer (`application/`)npm run test

- **Use Cases**: Application-specific business rules```

- **Services**: Orchestration of domain objects and repositories

- **Business Logic**: Application workflows and processes### Run Tests in Watch Mode



### 3. Infrastructure Layer (`infrastructure/`)```bash

- **Database Entities**: TypeORM entities with database annotationsnpm run test:watch

- **Repository Implementations**: Concrete implementations of repository interfaces```

- **External Services**: Third-party integrations

### Run End-to-End Tests

### 4. Interface Layer (`interfaces/`)

- **Controllers**: HTTP request/response handling```bash

- **DTOs**: Data validation and transformationnpm run test:e2e

- **Presentation Logic**: User interface concerns```



## Features### Test Coverage



- **Clean Architecture**: Separation of concerns with dependency inversion```bash

- **Domain-Driven Design**: Rich domain models and business logicnpm run test:cov

- **NestJS Framework**: Modular, scalable Node.js framework```

- **TypeScript**: Full type safety and modern JavaScript features

- **TypeORM**: Object-Relational Mapping with PostgreSQL## Project Structure

- **Dependency Injection**: Loose coupling between layers

- **Validation**: Input validation with class-validator```

- **Environment Configuration**: Secure environment variable managementsrc/

├── config/           # Configuration modules

## Prerequisites│   ├── app.config.ts      # Application configuration

│   ├── database.config.ts # Database configuration

- Node.js (v18 or higher)│   ├── jwt.config.ts      # JWT configuration

- PostgreSQL database│   └── index.ts           # Configuration exports

- npm or yarn├── entities/         # TypeORM entities

│   └── user.entity.ts     # User entity example

## Environment Setup├── app.controller.ts # Main application controller

├── app.module.ts     # Root application module

1. Copy the environment template:├── app.service.ts    # Main application service

   ```bash└── main.ts          # Application entry point

   cp .env.example .env```

   ```

## Configuration

2. Update the `.env` file with your actual configuration:

   ```envThe application uses the `@nestjs/config` package for configuration management. All configurations are loaded from environment variables and organized into separate configuration files:

   DATABASE_URL=postgresql://username:password@localhost:5432/account_transaction_db

   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production- **Database Config**: PostgreSQL connection settings

   PORT=3000- **JWT Config**: JWT secret and expiration settings

   NODE_ENV=development- **App Config**: Application port and environment settings

   ```

## TypeORM Integration

## Installation

TypeORM is configured to:

Install dependencies:

```bash- Connect to PostgreSQL using the `DATABASE_URL`

npm install- Auto-discover entities from the `entities` directory

```- Enable synchronization in development mode

- Enable logging in development mode

## API Endpoints

## Scripts

### Users

- `POST /users` - Create a new user- `npm run build` - Build the application

- `GET /users` - Get all users  - `npm run start` - Start the application

- `GET /users/:id` - Get user by ID- `npm run start:dev` - Start with hot-reload (development)

- `GET /users/email/:email` - Get user by email- `npm run start:debug` - Start with debugging enabled

- `PUT /users/:id` - Update user- `npm run start:prod` - Start in production mode

- `DELETE /users/:id` - Delete user- `npm run test` - Run unit tests

- `npm run test:e2e` - Run end-to-end tests

### Accounts- `npm run test:watch` - Run tests in watch mode

- `POST /accounts` - Create a new account- `npm run test:cov` - Run tests with coverage

- `GET /accounts` - Get all accounts- `npm run lint` - Lint and fix code

- `GET /accounts/:id` - Get account by ID- `npm run format` - Format code with Prettier

- `GET /accounts/user/:userId` - Get accounts by user

- `GET /accounts/user/:userId/active` - Get active accounts by user## Next Steps

- `GET /accounts/number/:accountNumber` - Get account by number

- `PUT /accounts/:id` - Update account1. Create additional entities for your account transaction system

2. Implement authentication and authorization modules

### Transactions3. Create controllers and services for business logic

- `POST /transactions` - Create a new transaction4. Add validation pipes and DTOs

- `PUT /transactions/:id/process` - Process a pending transaction5. Implement error handling and logging

- `PUT /transactions/:id/cancel` - Cancel a pending transaction6. Add API documentation with Swagger

- `GET /transactions/pending` - Get all pending transactions

- `GET /transactions/date-range` - Get transactions by date range## License

- `GET /transactions/:id` - Get transaction by ID

- `GET /transactions/account/:accountId` - Get transactions by accountThis project is licensed under the UNLICENSED license.

- `GET /transactions/reference/:reference` - Get transaction by reference

  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)

## Running the Application  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->



### Development Mode## Description

```bash

npm run start:dev[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

```

## Project setup

### Production Mode

```bash```bash

npm run build$ npm install

npm run start:prod```

```

## Compile and run the project

## Testing

```bash

```bash# development

npm run test              # Run tests$ npm run start

npm run test:watch        # Run tests in watch mode

npm run test:e2e          # Run end-to-end tests# watch mode

npm run test:cov          # Run tests with coverage$ npm run start:dev

```

# production mode

## Clean Architecture Benefits$ npm run start:prod

```

- **Independence**: Each layer is independent and testable

- **Flexibility**: Easy to change implementations without affecting business logic## Run tests

- **Testability**: Business logic can be tested without external dependencies

- **Maintainability**: Clear separation of concerns makes code easier to maintain```bash

# unit tests

## License$ npm run test



This project is licensed under the UNLICENSED license.# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
