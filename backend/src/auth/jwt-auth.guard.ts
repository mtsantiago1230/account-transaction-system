import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    console.log('JwtAuthGuard - canActivate called');
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    console.log('JwtAuthGuard - Authorization header:', authHeader);

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      console.log(
        'JwtAuthGuard - Token (first 50 chars):',
        token.substring(0, 50),
      );
    } else {
      console.log('JwtAuthGuard - No authorization header found');
    }

    const result = super.canActivate(context);
    console.log('JwtAuthGuard - canActivate result:', result);
    return result;
  }
}
