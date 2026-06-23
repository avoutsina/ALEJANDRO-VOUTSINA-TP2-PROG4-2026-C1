import { Module } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Usuario, UsuariosEschema } from './entities/usuario.entity';

@Module({
  imports: [MongooseModule.forFeature([{name: Usuario.name , schema: UsuariosEschema}])],
  controllers: [UsuariosController],
  providers: [UsuariosService],
  exports: [UsuariosService]
})
export class UsuariosModule {}
