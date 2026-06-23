import { Module } from '@nestjs/common';
import { PublicacionesService } from './publicaciones.service';
import { PublicacionesController } from './publicaciones.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Publicaciones, PublicacionesEschema } from './entities/publicaciones.entity';

@Module({
  imports: [MongooseModule.forFeature([{name: Publicaciones.name , schema: PublicacionesEschema}])],
  controllers: [PublicacionesController],
  providers: [PublicacionesService],
})
export class PublicacionesModule {}
