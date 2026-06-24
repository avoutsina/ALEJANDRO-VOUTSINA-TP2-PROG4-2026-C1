import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsuariosModule } from './resources/usuarios/usuarios.module';
import { AutenticacionModule } from './resources/autenticacion/autenticacion.module';
import { PublicacionesModule } from './resources/publicaciones/publicaciones.module';

@Module({
  imports:
  [
    ConfigModule.forRoot(
      {
        isGlobal: true
      }),
    MongooseModule.forRoot(process.env.MONGODB_URI!, { onConnectionCreate: (con) =>
    {
      console.log(con);
    }}),
    UsuariosModule,
    PublicacionesModule,
    AutenticacionModule,
  ],
  controllers: [AppController], // Enrutadores
  providers: [AppService], // Servicios inyectables
  exports: [] // Exportar logica a otros modulos
})
export class AppModule
{

}
