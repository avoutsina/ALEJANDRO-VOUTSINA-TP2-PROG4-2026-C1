import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  // Este metodo se encarga de levantar la aplicacion
  // Aca se definen configuraciones a nivel APP
  const app = await NestFactory.create(AppModule); // Crea el objeto AppModule
  // Habilitar CORS explícitamente para el frontend desplegado en Vercel y localhost
  const allowedOrigins = [
    'https://alejandro-voutsina-tp-2-prog-4-2026.vercel.app',
    'http://localhost:4200',
  ];
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('CORS not allowed'), false);
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.listen(process.env.PORT ?? 3000); // Escucho desde .env o puerto 3000
}
bootstrap(); // LLamo al metodo
