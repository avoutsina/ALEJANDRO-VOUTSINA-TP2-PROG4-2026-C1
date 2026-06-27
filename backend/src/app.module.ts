import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsuariosModule } from './resources/usuarios/usuarios.module';
import { AutenticacionModule } from './resources/autenticacion/autenticacion.module';
import { PublicacionesModule } from './resources/publicaciones/publicaciones.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { ArchivosModule } from './archivos/archivos.module';

@Module({
  imports:
    [
      ConfigModule.forRoot(
        {
          isGlobal: true
        }),
      MongooseModule.forRootAsync({
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          uri: configService.get<string>('MONGODB_URI')
        }),
        inject: [ConfigService],
      }),
      UsuariosModule,
      PublicacionesModule,
      AutenticacionModule,
      CloudinaryModule,
      ArchivosModule,
    ],
  controllers: [AppController], // Enrutadores
  providers: [AppService], // Servicios inyectables
  exports: [] // Exportar logica a otros modulos
})
export class AppModule {

}

