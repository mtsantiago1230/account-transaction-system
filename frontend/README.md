# Account Transaction System — Frontend

Modern Angular 20 application with standalone components, TailwindCSS, and reactive forms. Connects to the NestJS backend for authentication, account management, and transaction operations.

## 🏗️ Architecture

```
src/app/
├── core/                   # Singleton services and app-wide logic
│   ├── guards/             # Route guards (auth)
│   ├── interceptors/       # HTTP interceptors (auth, error)
│   ├── models/             # TypeScript interfaces/types
│   └── services/           # Core services (auth, API)
├── features/               # Feature modules (lazy-loaded)
│   ├── auth/               # Login, register components
│   ├── accounts/           # Account management
│   ├── transactions/       # Transaction management
│   └── dashboard/          # User dashboard
├── shared/                 # Reusable components and utilities
│   ├── components/         # Button, Card, Loading, etc.
│   ├── pipes/              # Custom pipes
│   └── directives/         # Custom directives
└── environments/           # Environment configurations
    ├── environment.ts      # Development config
    └── environment.prod.ts # Production config
```

**Tech Stack:**

- **Framework:** Angular 20 (standalone components)
- **Styling:** TailwindCSS
- **HTTP:** Angular HttpClient with RxJS
- **Routing:** Angular Router with guards
- **Forms:** Reactive Forms
- **Testing:** Jest

## 🚀 Quick Start

### With Docker (Recommended)

From the **project root**:

```powershell
# Development mode (with backend and database)
npm run docker:dev

# View logs
npm run docker:dev:logs
```

Access the application at http://localhost:4200

### Local Development (Without Docker)

#### Prerequisites

- Node.js 18+
- npm
- Backend running at http://localhost:3000

#### Setup

```powershell
cd frontend
npm install
```

#### Environment Configuration

Update `src/environments/environment.ts` for development:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000', // Backend URL
};
```

Update `src/environments/environment.prod.ts` for production:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-api-domain.com', // Production backend URL
};
```

#### Run the Application

```powershell
# Development server (with live reload)
npm start
# or
ng serve

# Open browser at http://localhost:4200
```

**Build for production:**

```powershell
npm run build
# or
ng build --configuration production

# Output in dist/ folder
```

## 🎨 Features

### Authentication

- ✅ JWT-based login/logout
- ✅ Route guards for protected pages
- ✅ Token interceptor for API requests
- ✅ Auto-redirect on session expiry
- ✅ Pre-filled test credentials (dev only)

### Account Management

- ✅ View all accounts
- ✅ Create new accounts
- ✅ Account balance display
- ✅ Account status (active/inactive)

### Transaction Management

- ✅ View transaction history
- ✅ Create deposits/withdrawals
- ✅ Transaction filtering and sorting
- ✅ Real-time balance updates

### UI/UX

- ✅ Responsive design (mobile, tablet, desktop)
- ✅ TailwindCSS styling
- ✅ Loading states and error handling
- ✅ Toast notifications
- ✅ Form validation

## 🧪 Testing

```powershell
# Unit tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# Specific test file
npm test -- login.component.spec.ts
```

**Test Structure:**

- Component tests
- Service tests
- Guard tests
- Integration tests

## 🐳 Docker Deployment

### Development

The frontend is automatically included in the Docker Compose setup:

```powershell
# From project root
npm run docker:dev        # Start with hot-reload
npm run docker:dev:logs   # View logs
```

### Production

```powershell
# From project root
npm run docker:prod       # Start optimized build
npm run docker:prod:logs  # View logs
```

The frontend uses Nginx in production with:

- ✅ Gzip compression
- ✅ Browser caching
- ✅ Angular routing support
- ✅ Security headers

## 🚀 Deployment

### Static Hosting (Vercel, Netlify, etc.)

```powershell
# Build for production
npm run build

# Deploy dist/frontend/browser folder
```

### Docker with Nginx

The included [`dockerfile`](dockerfile) provides:

- Multi-stage build (build + serve)
- Nginx with optimized configuration
- Angular routing support
- Gzip compression
- Security headers

### Manual Nginx Setup

```powershell
# Build the app
npm run build

# Copy dist/frontend/browser/* to your web server
# Configure Nginx for Angular routing (see nginx.conf)
```

## 🔧 Configuration

### Environment Files

**Development (`src/environments/environment.ts`):**

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
};
```

**Production (`src/environments/environment.prod.ts`):**

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.yourdomain.com',
};
```

### Nginx Configuration

The included `nginx.conf` provides:

- Angular routing support (all routes → index.html)
- Gzip compression
- Cache headers for static assets
- Security best practices

## 🐛 Troubleshooting

### Common Issues

**401 Unauthorized:**

- Backend must be running at `environment.apiUrl`
- Check JWT token in browser localStorage
- Verify Authorization header is sent with requests

**CORS Errors:**

- Backend must allow requests from frontend origin
- Check backend CORS configuration
- Verify API URL in environment files

**Blank Page After Build:**

- Check browser console for errors
- Verify base href in index.html
- Ensure all assets are in dist/ folder

**Routing Not Working (404 on Refresh):**

- Configure server for Angular routing
- Use hash routing as fallback (`useHash: true`)
- Check nginx.conf try_files directive

### Docker Issues

**Container Won't Start:**

```powershell
# Check logs
docker logs account-transaction-frontend

# Rebuild
npm run docker:dev:build
```

**Can't Access on localhost:4200:**

- Check if port is already in use
- Verify port mapping in docker-compose.yml
- Try different port in .env: `FRONTEND_PORT=4201`

## 📦 NPM Scripts

```json
{
  "start": "ng serve",
  "build": "ng build",
  "watch": "ng build --watch --configuration development",
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage",
  "lint": "ng lint"
}
```

## 📚 Additional Resources

- [Angular Documentation](https://angular.dev/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [RxJS Documentation](https://rxjs.dev/)
- [Jest Documentation](https://jestjs.io/)

## License

UNLICENSED
