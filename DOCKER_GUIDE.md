# Docker Compose - Development & Production Guide

This project uses Docker Compose with separate configurations for development and production environments.

## Files Structure

```
/
├── docker-compose.yml          # Base configuration (common for all environments)
├── docker-compose.dev.yml      # Development overrides
├── docker-compose.prod.yml     # Production overrides
├── .env.example                # Environment variables template
├── .env                        # Local environment variables (not in git)
└── package.json                # NPM scripts for easy commands
```

## Initial Setup

1. **Copy the environment template:**

   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` with your local values** (already done for development)

## Development Commands

### Using NPM Scripts (Recommended):

```bash
# Start all services in development mode
npm run docker:dev

# Start with rebuild (after code changes)
npm run docker:dev:build

# View logs
npm run docker:dev:logs

# Stop all services
npm run docker:dev:down

# Check running containers
npm run docker:ps
```

### Using Docker Compose directly:

```bash
# Start development environment
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Start with rebuild
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build

# View logs
docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f

# Stop services
docker-compose -f docker-compose.yml -f docker-compose.dev.yml down
```

## Production Commands

### Before deploying to production:

1. **Create a production `.env` file** with secure values:

   ```bash
   # On your production server
   cp .env.example .env.production
   # Edit .env.production with real production values
   ```

2. **Set strong passwords and secrets:**
   - Generate a strong JWT secret (min 32 characters)
   - Use a strong database password
   - Never use default values

### Using NPM Scripts:

```bash
# Start all services in production mode
npm run docker:prod

# Start with rebuild
npm run docker:prod:build

# View logs
npm run docker:prod:logs

# Stop all services
npm run docker:prod:down
```

### Using Docker Compose directly:

```bash
# Start production environment
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Start with rebuild
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# View logs
docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs -f

# Stop services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml down
```

## Environment Variables

### Development (docker-compose.dev.yml):

- `NODE_ENV=development`
- `DB_SSL=false` (SSL disabled)
- Database exposed on port 5432
- Hot-reload enabled for backend

### Production (docker-compose.prod.yml):

- `NODE_ENV=production`
- `DB_SSL=true` (SSL enabled)
- Database port not exposed
- No hot-reload
- Restart policy: always

## Access URLs

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:3000
- **Database** (dev only): localhost:5432

## Common Tasks

### Run migrations inside container:

```bash
docker exec -it account-transaction-backend npm run migration:run
```

### Create test user:

```bash
docker exec -it account-transaction-backend npx ts-node src/scripts/seed-test-user.ts
```

### Access database (development):

```bash
docker exec -it ats-database psql -U postgres -d account_transaction_db
```

### View container logs:

```bash
# All containers
npm run docker:logs

# Specific container
docker logs -f account-transaction-backend
docker logs -f account-transaction-frontend
docker logs -f ats-database
```

### Rebuild specific service:

```bash
# Development
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build backend

# Production
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build backend
```

## Security Notes for Production

⚠️ **IMPORTANT**: Before deploying to production:

1. Change all default passwords in `.env`
2. Generate a strong JWT_SECRET (min 32 random characters)
3. Enable SSL for database connections (`DB_SSL=true`)
4. Don't expose database port externally
5. Use strong PostgreSQL credentials
6. Never commit `.env` files to version control
7. Consider using a secrets management service (AWS Secrets Manager, Azure Key Vault, etc.)

## Troubleshooting

### Services won't start:

```bash
# Check logs
npm run docker:logs

# Remove all containers and volumes
docker-compose down -v

# Rebuild from scratch
npm run docker:dev:build
```

### Database connection errors:

- Check if `DB_SSL` matches your database configuration
- Verify `DATABASE_URL` format
- Ensure database container is running: `docker ps`

### Port already in use:

- Change ports in `.env`:
  ```
  BACKEND_PORT=3001
  FRONTEND_PORT=4201
  DB_PORT=5433
  ```

## Production Deployment Checklist

- [ ] Created `.env.production` with secure values
- [ ] Changed all default passwords
- [ ] Generated strong JWT_SECRET (32+ chars)
- [ ] Set `DB_SSL=true`
- [ ] Set `NODE_ENV=production`
- [ ] Verified database credentials
- [ ] Tested build: `npm run docker:prod:build`
- [ ] Configured firewall rules
- [ ] Set up SSL/TLS certificates (if needed)
- [ ] Configured backup strategy
- [ ] Set up monitoring and logging

## Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Environment Variables Best Practices](https://12factor.net/config)
- [PostgreSQL Docker Hub](https://hub.docker.com/_/postgres)
