# Auth Module Documentation

## Authentication Endpoints

### POST /auth/login

Autentica a un usuario y devuelve un JWT token.

**Request Body:**

```json
{
  "email": "test@example.com",
  "password": "123456"
}
```

**Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "test@example.com"
  }
}
```

### Credenciales de prueba

- **Email:** test@example.com
- **Password:** 123456

## Protected Endpoints

### GET /protected

Endpoint protegido que requiere autenticación JWT.

**Headers:**

```
Authorization: Bearer <your-jwt-token>
```

**Response:**

```json
{
  "message": "This is protected data",
  "user": {
    "id": 1,
    "email": "test@example.com"
  }
}
```

## Ejemplo de uso con curl

### Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "123456"
  }'
```

### Acceder a endpoint protegido

```bash
curl -X GET http://localhost:3000/protected \
  -H "Authorization: Bearer <your-jwt-token>"
```

## Environment Variables

Agrega estas variables a tu archivo `.env`:

```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```
