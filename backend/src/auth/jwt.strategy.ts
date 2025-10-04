import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    console.log('JWT Strategy - JWT_SECRET:', process.env.JWT_SECRET);
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        process.env.JWT_SECRET ||
        'your-super-secret-jwt-key-change-this-in-production',
    });
  }

  async validate(payload: any) {
    console.log('JWT Strategy - Validating payload:', payload);
    try {
      const result = await this.authService.validateToken(payload);
      console.log('JWT Strategy - Validation result:', result);
      return result;
    } catch (error) {
      console.log('JWT Strategy - Validation error:', error);
      return null;
    }
  }
}
