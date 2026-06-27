import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Archivo, ArchivoDocument } from './schema/archivos.schema';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateArchivoDto } from './dto/create-archivo.dto';
import { UpdateArchivoDto } from './dto/update-archivo.dto';



@Injectable()
export class ArchivosService {
  constructor(
    @InjectModel(Archivo.name) private archivoModel: Model<ArchivoDocument>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(createArchivoDto: CreateArchivoDto) {
    const archivo = new this.archivoModel(createArchivoDto);
    return archivo.save();
  }

  async findAll() {
    return this.archivoModel.find().exec();
  }

  async findOne(id: number) {
    const archivo = await this.archivoModel.findById(id).exec();
    if (!archivo) {
      throw new NotFoundException('Archivo no encontrado');
    }
    return archivo;
  }

  async update(id: number, updateArchivoDto: UpdateArchivoDto) {
    const archivo = await this.archivoModel.findByIdAndUpdate(id, updateArchivoDto, { new: true }).exec();
    if (!archivo) {
      throw new NotFoundException('Archivo no encontrado');
    }
    return archivo;
  }

  async remove(id: number) {
    const archivo = await this.archivoModel.findByIdAndDelete(id).exec();
    if (!archivo) {
      throw new NotFoundException('Archivo no encontrado');
    }
    return archivo;
  }

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
