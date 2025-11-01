import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ValidationExceptionFilter } from './common/filters/validation-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  // ✅ Enable validation pipes for proper DTO validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      skipMissingProperties: false,
      skipNullProperties: false,
      skipUndefinedProperties: false,
    }),
  );

  // ✅ Add global exception filter for detailed validation errors
  app.useGlobalFilters(new ValidationExceptionFilter());

  // ✅ CORS configuration for development and production
  const allowedOrigins = [
    'http://localhost:4200', // Local development
    process.env.FRONTEND_URL, // Production frontend URL
  ].filter(Boolean); // Remove undefined values

  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,POST,PUT,DELETE,OPTIONS,PATCH',
    credentials: true,
  });

  // ✅ Use PORT from environment or default to 3000
  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
}
bootstrap();
