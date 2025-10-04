import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto, AuthResponse } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  // Hardcoded user for testing
  private readonly testUser = {
    id: 1,
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

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  async validateToken(payload: any) {
    // In a real app, you might want to check if user still exists in database
    return {
      id: payload.sub,
      email: payload.email,
    };
  }
}
