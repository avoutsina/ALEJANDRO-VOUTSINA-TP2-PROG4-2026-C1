import { Module } from '@nestjs/common';
import { ArchivosService } from './archivos.service';
import { ArchivosController } from './archivos.controller';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Archivo, ArchivoSchema } from './schema/archivos.schema';



@Module({
  imports: [CloudinaryModule, MongooseModule.forFeature([
    { name: Archivo.name, schema: ArchivoSchema },
  ])],
  controllers: [ArchivosController],
  providers: [ArchivosService],
})
export class ArchivosModule { }
