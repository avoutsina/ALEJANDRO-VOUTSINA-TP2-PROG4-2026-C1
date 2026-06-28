import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePublicacioneDto } from './dto/create-publicaciones.dto';
import { UpdatePublicacioneDto } from './dto/update-publicaciones.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Publicaciones } from './entities/publicaciones.entity';
import { Model } from 'mongoose';
import { link } from 'fs';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';

@Injectable()
export class PublicacionesService {
  constructor(
    @InjectModel(Publicaciones.name)
    private publicacionModel: Model<Publicaciones>,
    private cloudinaryService: CloudinaryService,
  ) {}

  async create(createPublicacioneDto: CreatePublicacioneDto) {
    try {
      const inst = new this.publicacionModel(createPublicacioneDto);
      console.log(inst);
      const guardado = await inst.save();
      return guardado;
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'No se pudo crear la publicacion',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findAllMe(userId: string, pagina: number) {
    try {
      const skip = (pagina - 1) * 3;
      const porId = await this.publicacionModel
        .find({ userId: userId })
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(3);
      return porId;
    } catch {
      throw new HttpException(
        'No se encontraron publicaciones',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async findAllMeCount(userId: string, desde?: string, hasta?: string) {
    const match: any = { userId };

    if (desde || hasta) {
      match.created_at = {};

      if (desde) match.created_at.$gte = new Date(desde);
      if (hasta) match.created_at.$lte = new Date(hasta);
    }

    const resultado = await this.publicacionModel.aggregate([
      { $match: match },

      // Agrupamos por usuario
      {
        $group: {
          _id: '$userId',
          nombreUsuario: { $first: '$nombreUsuario' },
          cantidadPublicaciones: { $sum: 1 },
        },
      },

      // Opcional: formatear salida
      {
        $project: {
          _id: 0,
          userId: '$_id',
          nombreUsuario: 1,
          cantidadPublicaciones: 1,
        },
      },
    ]);

    return resultado[0] ?? null;
  }

  async findComments(id: string, pagina: number) {
    try {
      const skip = (pagina - 1) * 6;
      const porId = await this.publicacionModel
        .findById({ _id: id })
        .select({
          comentarios: { $slice: [skip, 6] },
        })
        .sort({ created_at: 1 });
      return porId?.comentarios;
    } catch {
      throw new HttpException(
        'No se encontraron comentarios',
        HttpStatus.NOT_FOUND,
      );
    }
  }
  async findAllComments(userId: string, desde?: string, hasta?: string) {
    try {
      // build match para filtrar por usuario y opcionalmente por fecha sobre comentarios.created_at
      const matchComment: any = {
        'comentarios.usuario.userId': userId,
      };

      if (desde || hasta) {
        matchComment['comentarios.created_at'] = {};
        if (desde)
          matchComment['comentarios.created_at'].$gte = new Date(desde);
        if (hasta)
          matchComment['comentarios.created_at'].$lte = new Date(hasta);
      }

      const resultado = await this.publicacionModel.aggregate([
        // descomponemos el array de comentarios
        { $unwind: '$comentarios' },

        // filtramos por comentarios que tengan el userId (y por fecha si corresponde)
        { $match: matchComment },

        // agrupamos por el userId del comentario (devuelve un único grupo porque filtramos por userId)
        {
          $group: {
            _id: '$comentarios.usuario.userId',
            nombreUsuario: { $first: '$comentarios.usuario.nombreUsuario' },
            cantidadComentarios: { $sum: 1 },
          },
        },

        // formateamos la salida
        {
          $project: {
            _id: 0,
            userId: '$_id',
            nombreUsuario: 1,
            cantidadComentarios: 1,
          },
        },
      ]);

      // Si no encontró nada devolvemos cantidad 0 (y el userId), para que el frontend lo maneje fácil
      return (
        resultado[0] ?? { userId, nombreUsuario: null, cantidadComentarios: 0 }
      );
    } catch (err) {
      throw new HttpException(
        'No se pudieron obtener comentarios',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(
    sort?: string,
    userId?: string,
    offset?: number,
    limit?: number,
  ) {
    try {
      const filter: any = { eliminado: { $ne: true } };
      if (userId) {
        filter.userId = userId;
      }

      let query = this.publicacionModel.find(filter);

      if (sort === 'likes' || sort === 'masLikes') {
        query = query.sort({ meGusta: -1 });
      } else if (sort === 'menosLikes') {
        query = query.sort({ meGusta: 1 });
      } else {
        query = query.sort({ created_at: -1 });
      }

      if (offset !== undefined && offset !== null) {
        query = query.skip(Number(offset));
      }
      if (limit !== undefined && limit !== null) {
        query = query.limit(Number(limit));
      }

      return await query.exec();
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'Error al traer las publicaciones',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: string, updatePublicacioneDto: UpdatePublicacioneDto) {
    try {
      const publicacionActualizada =
        await this.publicacionModel.findOneAndUpdate(
          { _id: id, eliminado: { $ne: true } },
          updatePublicacioneDto,
          { new: true },
        );
      if (!publicacionActualizada) {
        throw new NotFoundException('La publicación no existe');
      }
      console.log(publicacionActualizada);
      return publicacionActualizada;
    } catch (error) {
      console.log(error);
      throw new BadRequestException('No se pudo actualizar la publicación');
    }
  }

  async findOne(id: string) {
    try {
      const porId = await this.publicacionModel.findOne({
        _id: id,
        eliminado: { $ne: true },
      });
      if (!porId) {
        throw new NotFoundException('La publicación no existe');
      }
      return porId;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new HttpException(
        'No se encontro la publicacion',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async remove(id: string) {
    try {
      const publicacion = await this.publicacionModel.findById(id).exec();
      if (!publicacion) {
        throw new NotFoundException(
          'La publicación no existe o ya fue eliminada',
        );
      }

      // Attempt to delete image from Cloudinary if publicId is present
      try {
        if (publicacion.publicId) {
          await this.cloudinaryService.deleteImage(publicacion.publicId);
        }
      } catch (err) {
        console.error('Error deleting image from Cloudinary:', err);
        // proceed to delete DB record even if Cloudinary deletion fails
      }

      await this.publicacionModel.findByIdAndDelete(id).exec();
      return publicacion;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new HttpException(
        'No se pudo eliminar la publicación',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async removeAll(userId: string) {
    try {
      const publicaciones = await this.publicacionModel.find({ userId }).exec();
      const publicIds = publicaciones
        .map((p) => p.publicId)
        .filter((id) => id && id.length > 0);

      try {
        if (publicIds.length > 0) {
          await this.cloudinaryService.deleteResources(publicIds);
        }
      } catch (err) {
        console.error('Error deleting resources from Cloudinary:', err);
        // continue to delete DB records even if Cloudinary deletion fails
      }

      const resultado = await this.publicacionModel
        .deleteMany({ userId })
        .exec();
      return resultado;
    } catch (err) {
      console.error(err);
      throw new HttpException(
        'No se pudo eliminar las publicaciones del usuario',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async likePublicacion(id: string, userId: string) {
    const publicacion = await this.publicacionModel
      .findOne({ _id: id, eliminado: { $ne: true } })
      .exec();
    if (!publicacion) {
      throw new NotFoundException('La publicación no existe');
    }
    if (publicacion.meGustaId.includes(userId)) {
      throw new BadRequestException('Ya diste me gusta a esta publicación');
    }

    publicacion.meGustaId.push(userId);
    publicacion.meGusta = publicacion.meGustaId.length;
    return await publicacion.save();
  }

  async unlikePublicacion(id: string, userId: string) {
    const publicacion = await this.publicacionModel
      .findOne({ _id: id, eliminado: { $ne: true } })
      .exec();
    if (!publicacion) {
      throw new NotFoundException('La publicación no existe');
    }
    if (!publicacion.meGustaId.includes(userId)) {
      throw new BadRequestException('No has dado me gusta a esta publicación');
    }

    publicacion.meGustaId = publicacion.meGustaId.filter(
      (uid) => uid !== userId,
    );
    publicacion.meGusta = publicacion.meGustaId.length;
    return await publicacion.save();
  }
}
