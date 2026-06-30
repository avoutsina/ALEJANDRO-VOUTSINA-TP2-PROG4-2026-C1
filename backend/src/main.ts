import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  // Este metodo se encarga de levantar la aplicacion
  // Aca se definen configuraciones a nivel APP
  const app = await NestFactory.create(AppModule); // Crea el objeto AppModule
  // Habilitar CORS explícitamente para el frontend desplegado en Vercel y localhost
  // Temporarily allow all origins for debugging CORS issues.
  // Change to a restricted list before going to production.
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap(); 
