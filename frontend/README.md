# Frontend

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.3.4.

## Prerequisites

- Node.js 18+
- npm

## Quick start

```bash
npm install
ng serve
```

Open http://localhost:4200.

Backend is required at http://localhost:3000 (see API configuration below).

## API configuration

The API base URL is configured via Angular environments:

- `src/environments/environment.ts` (development)
- `src/environments/environment.prod.ts` (production)

Example (already present):

```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
};
```

Update `apiUrl` if your backend runs at a different address.

## Login (test credentials)

The backend seed script creates a default test user:

- Email: `test@example.com`
- Password: `password123`

If login returns 401, ensure you ran the backend seed script and that the frontend points to the correct `apiUrl`.

## Scripts

### Development server

```bash
ng serve
```

The app reloads automatically on code changes.

### Code scaffolding

```bash
ng generate component component-name
```

List available schematics:

```bash
ng generate --help
```

### Building

```bash
ng build
```

Production build:

```bash
ng build --configuration production
```

Artifacts are generated in `dist/`.

### Running unit tests

```bash
npm test
```

Watch mode:

```bash
npm run test:watch
```

Coverage:

```bash
npm run test:coverage
```

## Troubleshooting

- 401 Unauthorized on login
  - Backend must be running and reachable at `environment.apiUrl`.
  - Seed the test user in the backend: see `backend/src/scripts/seed-test-user.ts`.
  - Confirm the backend returns tokens as `access_token`.

## Additional Resources

For detailed CLI references, see the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli).
