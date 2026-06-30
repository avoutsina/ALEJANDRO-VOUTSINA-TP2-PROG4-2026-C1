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
import { Model, Types } from 'mongoose';
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
        .find({ userId: userId, eliminado: { $ne: true } })
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
    const match: any = { userId, eliminado: { $ne: true } };
    if (desde || hasta) {
      match.created_at = {};

      if (desde) {
        // En Argentina (UTC-3) el inicio del día es a las 03:00 UTC
        match.created_at.$gte = new Date(`${desde}T03:00:00.000Z`);
      }
      if (hasta) {
        // El fin del día de 'hasta' en Argentina (UTC-3) es a las 02:59:59.999 UTC del día siguiente
        const hastaDate = new Date(`${hasta}T03:00:00.000Z`);
        hastaDate.setDate(hastaDate.getDate() + 1);
        hastaDate.setMilliseconds(hastaDate.getMilliseconds() - 1);
        match.created_at.$lte = hastaDate;
      }
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
    const paginaNumero = Number(pagina) || 1;
    const limit = 3;
    const skip = (paginaNumero - 1) * limit;

    let objectId: Types.ObjectId;
    try {
      objectId = new Types.ObjectId(id);
    } catch {
      throw new BadRequestException('ID de publicación inválido');
    }

    try {
      // Contar total de comentarios de la publicación
      const totalRes = await this.publicacionModel.aggregate([
        { $match: { _id: objectId, eliminado: { $ne: true } } },
        { $project: { total: { $size: '$comentarios' } } },
      ]);
      const total: number = totalRes[0]?.total ?? 0;

      // Paginado real sobre el array embebido usando aggregate:
      // - order más recientes primero
      // - skip/limit
      const resultado = await this.publicacionModel.aggregate([
        { $match: { _id: objectId, eliminado: { $ne: true } } },
        { $unwind: '$comentarios' },
        { $sort: { 'comentarios.created_at': 1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            _id: 0,
            comentarios: 1,
          },
        },
      ]);

      const comentarios = resultado.map((r: any) => r.comentarios);
      return { comentarios, total };
    } catch {
      throw new HttpException(
        'No se encontraron comentarios',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async addComentario(publicacionId: string, body: any) {
    const texto = body?.texto;
    const usuario = body?.usuario;

    if (!texto || typeof texto !== 'string') {
      throw new BadRequestException('texto requerido');
    }
    if (!usuario || !usuario.userId) {
      throw new BadRequestException('usuario requerido');
    }

    let objectId: Types.ObjectId;
    try {
      objectId = new Types.ObjectId(publicacionId);
    } catch {
      throw new BadRequestException('ID de publicación inválido');
    }

    const publicacion = await this.publicacionModel.findOne({
      _id: objectId,
      eliminado: { $ne: true },
    });
    if (!publicacion) throw new NotFoundException('La publicación no existe');

    publicacion.comentarios.push({
      usuario,
      texto,
      modificado: false,
      created_at: new Date(),
    } as any);

    const guardado = await publicacion.save();
    // Devolver solo el comentario recién agregado
    const comentarioNuevo = guardado.comentarios[guardado.comentarios.length - 1];
    return comentarioNuevo;
  }

  async editarComentario(
    publicacionId: string,
    comentarioId: string,
    texto: string,
  ) {
    if (!texto || typeof texto !== 'string') {
      throw new BadRequestException('texto requerido');
    }
    if (!comentarioId) {
      throw new BadRequestException('comentarioId requerido');
    }

    let objectId: Types.ObjectId;
    try {
      objectId = new Types.ObjectId(publicacionId);
    } catch {
      throw new BadRequestException('ID de publicación inválido');
    }

    const publicacion = await this.publicacionModel.findOne({
      _id: objectId,
      eliminado: { $ne: true },
    });
    if (!publicacion) throw new NotFoundException('La publicación no existe');

    const idx = publicacion.comentarios.findIndex(
      (c: any) => String(c._id) === String(comentarioId),
    );
    if (idx === -1) {
      throw new NotFoundException('Comentario no encontrado');
    }

    publicacion.comentarios[idx].texto = texto;
    publicacion.comentarios[idx].modificado = true;

    const guardado = await publicacion.save();
    return guardado.comentarios[idx];
  }
  async findAllComments(userId: string, desde?: string, hasta?: string) {
    try {
      // build match para filtrar por usuario y opcionalmente por fecha sobre comentarios.created_at
      const matchComment: any = {
        'comentarios.usuario.userId': userId,
      };

      if (desde || hasta) {
        matchComment['comentarios.created_at'] = {};
        if (desde) {
          matchComment['comentarios.created_at'].$gte = new Date(`${desde}T03:00:00.000Z`);
        }
        if (hasta) {
          const hastaDate = new Date(`${hasta}T03:00:00.000Z`);
          hastaDate.setDate(hastaDate.getDate() + 1);
          hastaDate.setMilliseconds(hastaDate.getMilliseconds() - 1);
          matchComment['comentarios.created_at'].$lte = hastaDate;
        }
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

  async findCommentsPerPublicationStats(desde?: string, hasta?: string) {
    try {
      const matchComment: any = {};
      if (desde || hasta) {
        matchComment['comentarios.created_at'] = {};
        if (desde) {
          matchComment['comentarios.created_at'].$gte = new Date(`${desde}T03:00:00.000Z`);
        }
        if (hasta) {
          const hastaDate = new Date(`${hasta}T03:00:00.000Z`);
          hastaDate.setDate(hastaDate.getDate() + 1);
          hastaDate.setMilliseconds(hastaDate.getMilliseconds() - 1);
          matchComment['comentarios.created_at'].$lte = hastaDate;
        }
      }

      const resultado = await this.publicacionModel.aggregate([
        { $match: { eliminado: { $ne: true } } },
        { $unwind: '$comentarios' },
        ...(desde || hasta ? [{ $match: matchComment }] : []),
        {
          $group: {
            _id: '$_id',
            titulo: { $first: '$titulo' },
            cantidadComentarios: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            publicacionId: '$_id',
            titulo: 1,
            cantidadComentarios: 1,
          },
        },
      ]);

      return resultado;
    } catch (err) {
      throw new HttpException(
        'No se pudieron obtener estadísticas de comentarios por publicación',
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
      const porId = await this.publicacionModel.findById(id).exec();
      if (!porId || porId.eliminado) {
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
      const publicacion = await this.publicacionModel.findOneAndUpdate(
        { _id: id, eliminado: { $ne: true } },
        { eliminado: true },
        { new: true },
      );
      if (!publicacion) {
        throw new NotFoundException(
          'La publicación no existe o ya fue eliminada',
        );
      }
      // Baja lógica: marcamos `eliminado: true` y no eliminamos recursos en Cloudinary aquí.
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
      const resultado = await this.publicacionModel
        .updateMany({ userId }, { eliminado: true })
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
