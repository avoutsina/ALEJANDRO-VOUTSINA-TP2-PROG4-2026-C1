import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Archivo, ArchivoDocument } from './schema/archivos.schema';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';


@Injectable()
export class ArchivosService {

  constructor(

    @InjectModel(Archivo.name) private archivoModel: Model<ArchivoDocument>,
    private readonly cloudinaryService: CloudinaryService,

  ) { }

  async subirArchivo(file: Express.Multer.File) {
    try {
      const result = await this.cloudinaryService.uploadImage(file);

      const archivo = new this.archivoModel({
        url: result.secure_url,
        formato: result.format,
        public_id: result.public_id,
      });
      await archivo.save();
      return archivo;
    } catch (error) {
      console.error("Error al subir archivo: ", error);
      throw new InternalServerErrorException("Error al subir archivo");
    }
  }

}
