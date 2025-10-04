import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('hello')
  getHelloMessage(): { message: string } {
    return { message: 'Hello from backend' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('protected')
  getProtectedData(@Request() req): { message: string; user: any } {
    return {
      message: 'This is protected data',
      user: req.user,
    };
  }
}
