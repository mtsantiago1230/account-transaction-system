import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto, AuthResponse } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  // Hardcoded user for testing - using a valid UUID format
  private readonly testUser = {
    id: '550e8400-e29b-41d4-a716-446655440000', // Valid UUID for testing
    email: 'test@example.com',
    password: '123456', // In production, this should be hashed
  };

  async validateUser(email: string, password: string): Promise<any> {
    if (email === this.testUser.email && password === this.testUser.password) {
      const { password: _, ...result } = this.testUser;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const payload = { email: user.email, sub: user.id };
    const token = this.jwtService.sign(payload);

    console.log('AuthService - Login - Payload:', payload);
    console.log('AuthService - Login - Generated token:', token);
    console.log('AuthService - Login - JWT_SECRET:', process.env.JWT_SECRET);

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  async validateToken(payload: any) {
    console.log('AuthService - validateToken - Received payload:', payload);
    console.log('AuthService - validateToken - Payload type:', typeof payload);
    console.log(
      'AuthService - validateToken - Payload keys:',
      Object.keys(payload),
    );

    // In a real app, you might want to check if user still exists in database
    const result = {
      id: payload.sub,
      email: payload.email,
    };

    console.log('AuthService - validateToken - Returning result:', result);
    return result;
  }
}
