# Account Transaction System - Backend

A NestJS backend application with TypeScript, TypeORM, and PostgreSQL for managing account transactions.

## Features

- **NestJS Framework**: Progressive Node.js framework for building scalable server-side applications
- **TypeScript**: Full TypeScript support with strict type checking
- **TypeORM**: Object-Relational Mapping with PostgreSQL
- **Configuration Management**: Environment-based configuration with validation
- **Database Integration**: PostgreSQL database with TypeORM entities
- **Development Tools**: Hot-reload, linting, testing, and formatting

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

## Environment Setup

1. Copy the environment template:

   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your actual configuration:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/account_transaction_db
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

1. Create a PostgreSQL database named `account_transaction_db`
2. Update the `DATABASE_URL` in your `.env` file with your database credentials

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

### Test Coverage

```bash
npm run test:cov
```

## Project Structure

```
src/
├── config/           # Configuration modules
│   ├── app.config.ts      # Application configuration
│   ├── database.config.ts # Database configuration
│   ├── jwt.config.ts      # JWT configuration
│   └── index.ts           # Configuration exports
├── entities/         # TypeORM entities
│   └── user.entity.ts     # User entity example
├── app.controller.ts # Main application controller
├── app.module.ts     # Root application module
├── app.service.ts    # Main application service
└── main.ts          # Application entry point
```

## Configuration

The application uses the `@nestjs/config` package for configuration management. All configurations are loaded from environment variables and organized into separate configuration files:

- **Database Config**: PostgreSQL connection settings
- **JWT Config**: JWT secret and expiration settings
- **App Config**: Application port and environment settings

## TypeORM Integration

TypeORM is configured to:

- Connect to PostgreSQL using the `DATABASE_URL`
- Auto-discover entities from the `entities` directory
- Enable synchronization in development mode
- Enable logging in development mode

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

## Next Steps

1. Create additional entities for your account transaction system
2. Implement authentication and authorization modules
3. Create controllers and services for business logic
4. Add validation pipes and DTOs
5. Implement error handling and logging
6. Add API documentation with Swagger

## License

This project is licensed under the UNLICENSED license.

  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
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
