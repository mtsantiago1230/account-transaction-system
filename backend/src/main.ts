import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  // ✅ Habilitar CORS para permitir llamadas desde Angular (4200)
  app.enableCors({
    origin: 'http://localhost:4200',
    methods: 'GET,POST,PUT,DELETE,OPTIONS',
    credentials: true,
  });

  await app.listen(3000);
}
bootstrap();
