import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() // Este metodo se encarga de levantar la aplicacion
{
  // Aca se definen configuraciones a nivel APP
  const app = await NestFactory.create(AppModule, { cors: true }); // Crea el objeto AppModule
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
  await app.listen(process.env.PORT ?? 3000); // Escucho desde .env o puerto 3000
}
bootstrap(); // LLamo al metodo