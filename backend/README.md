# Account Transaction System — Backend

NestJS 11 API with TypeScript, TypeORM, PostgreSQL, and JWT authentication. The codebase follows a clean architecture with clear separation of concerns.

## Architecture

```
src/
├── domain/                 # Core business models & repository contracts
├── application/            # Use-cases and application logic
├── infrastructure/         # TypeORM entities, repositories, adapters
├── interfaces/             # HTTP controllers & DTOs
├── modules/                # NestJS wiring per feature
└── config/                 # App, DB, JWT, TypeORM configuration
```

Key frameworks: NestJS, TypeORM (PostgreSQL), class-validator/transformer, Passport-JWT.

## Prerequisites

- Node.js 18+
- npm
- PostgreSQL 13+

## Installation

```powershell
cd backend
npm install
```

## Environment

Create a `.env` file in `backend/` with either a `DATABASE_URL` or individual DB settings.

```
# Option A — URL (recommended for prod)
DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<db>

# Option B — individual variables (good for local dev)
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=account_transaction_db

# App
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=change-me
```

Notes:

- SSL is enabled automatically when `NODE_ENV=production`.
- TypeORM logging is reduced in tests and verbose in development.

## Database setup

Create the database and run migrations.

```powershell
# Create DB (adjust user/password)
psql -U postgres -c "CREATE DATABASE account_transaction_db;"

# Run migrations
npm run migration:run

# Create test user (test@example.com / password123)
npx ts-node src/scripts/seed-test-user.ts
```

Generate a migration (example):

```powershell
npm run migration:generate -- --name CreateInitialTables
```

Revert last migration:

```powershell
npm run migration:revert
```

Schema utilities (development only):

```powershell
npm run schema:sync
npm run schema:drop
```

## Running

Development (watch mode):

```powershell
npm run start:dev
```

Production:

```powershell
npm run build
npm run start:prod
```

## Testing

Unit tests:

```powershell
npm test
```

Watch mode:

```powershell
npm run test:watch
```

Coverage:

```powershell
npm run test:cov
```

End‑to‑end tests:

```powershell
npm run test:e2e
```

Note: E2E logs may include benign teardown messages.

## Scripts

- build, start, start:dev, start:debug, start:prod
- lint, format
- test, test:watch, test:cov, test:e2e
- migration:create, migration:generate, migration:run, migration:revert
- schema:sync, schema:drop

## Deployment notes

- Provide configuration via environment variables; do not commit `.env`.
- Use a strong `JWT_SECRET` and set `NODE_ENV=production`.
- Ensure the database is reachable (often via `DATABASE_URL`).
- After deploying, run `npm run migration:run` once against the production DB.
- Ensure PostgreSQL is properly configured and accessible from your application.

## License

UNLICENSED
