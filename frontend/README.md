# Account Transaction System — Frontend

Angular 20 application that connects to the NestJS backend for authentication, account management, and transactions.

## Prerequisites

- Node.js 18+
- npm

## Installation

```powershell
cd frontend
npm install
```

## Environment

The API base URL is configured via Angular environment files:

- `src/environments/environment.ts` (development)
- `src/environments/environment.prod.ts` (production)

Default development config:

```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
};
```

Update `apiUrl` if your backend runs elsewhere.

## Running

Development server:

```powershell
npm start
```

The app runs at http://localhost:4200 and reloads on changes.

Production build:

```powershell
npm run build
# Serve the files from dist/ with your preferred static server
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
npm run test:coverage
```

## Deployment notes

- Ensure `environment.prod.ts` points to your production API base URL.
- Build the app with `npm run build` and deploy the generated `dist/` folder to a static host (e.g., Nginx, CDN).
- For containerized deployments, serve the built files with a lightweight web server (e.g., Nginx) and configure reverse proxy to the backend.

## Architecture

- Angular 20 with standalone components
- Feature-based structure (`app/core`, `app/features`, `app/shared`)
- HTTP services consume the NestJS API, using JWT for authenticated calls

## Troubleshooting

- 401 Unauthorized
  - The backend must be running and reachable at `environment.apiUrl`.
  - Verify the JWT is stored and attached to requests as expected by the backend.

## License

UNLICENSED
