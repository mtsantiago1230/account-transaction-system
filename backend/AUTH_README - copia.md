# Auth Module Documentation

## Authentication Endpoints

### POST /auth/login

Authenticates a user and returns a JWT token.

**Request Body:**

```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "test@example.com"
  }
}
```

### Test Credentials

- **Email:** test@example.com
- **Password:** password123

_Note: This test user is created automatically when you run the seed script: `npx ts-node src/scripts/seed-test-user.ts`_

## Protected Endpoints

All protected endpoints in the system require JWT authentication. Examples include:

### GET /protected

Example protected endpoint that requires JWT authentication.

**Headers:**

```
Authorization: Bearer <your-jwt-token>
```

**Response:**

```json
{
  "message": "This is protected data",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "test@example.com"
  }
}
```

### Other Protected Endpoints

- **Account endpoints:** `/api/accounts/*` (GET, POST, PUT, DELETE)
- **Transaction endpoints:** `/api/transactions/*` (GET, POST)
- **User endpoints:** `/api/users/*` (GET, POST, PUT, DELETE)

All these endpoints require the `Authorization: Bearer <token>` header.

## Example Usage with curl

### Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Access Protected Endpoint

```bash
curl -X GET http://localhost:3000/protected \
  -H "Authorization: Bearer <your-jwt-token>"
```

### Get User Accounts (Protected)

```bash
curl -X GET http://localhost:3000/api/accounts \
  -H "Authorization: Bearer <your-jwt-token>"
```

## Environment Variables

The following JWT-related variables should be set in your `.env` file:

```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=1h
```

You can use the provided `.env.example` file as a template:

```bash
cp .env.example .env
```

## JWT Token Structure

The JWT token contains the following payload:

```json
{
  "sub": "550e8400-e29b-41d4-a716-446655440000",
  "email": "test@example.com",
  "iat": 1633024800,
  "exp": 1633028400
}
```

- `sub`: User ID (UUID format)
- `email`: User email address
- `iat`: Issued at timestamp
- `exp`: Expiration timestamp

## Implementation Details

- **JWT Strategy:** Uses Passport JWT strategy for token validation
- **Guard:** `JwtAuthGuard` protects routes requiring authentication
- **Token Expiration:** Configurable via `JWT_EXPIRES_IN` environment variable
- **Password Hashing:** Uses bcrypt with salt rounds of 10
