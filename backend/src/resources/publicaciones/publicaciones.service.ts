import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePublicacioneDto } from './dto/create-publicaciones.dto';
import { UpdatePublicacioneDto } from './dto/update-publicaciones.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Publicaciones } from './entities/publicaciones.entity';
import { Model } from 'mongoose';
import { link } from 'fs';

@Injectable()
export class PublicacionesService
{
  constructor(@InjectModel(Publicaciones.name) private publicacionModel: Model<Publicaciones>){}

  async create(createPublicacioneDto: CreatePublicacioneDto)
  {
    try
    {
      const inst = new this.publicacionModel(createPublicacioneDto);
      console.log(inst);
      const guardado = await inst.save()
      return guardado;
    }
    catch(error)
    {
      console.log(error);
      throw new HttpException("No se pudo crear la publicacion", HttpStatus.BAD_REQUEST);
    }
  }

  async findAllMe(userId : string, pagina: number)
  {
    try
    {
      const skip = (pagina -1) * 3;
      const porId = await this.publicacionModel.find({userId: userId}).sort({created_at: -1}).skip(skip).limit(3);
      return porId;
    }
    catch
    {
      throw new HttpException("No se encontraron publicaciones",HttpStatus.NOT_FOUND);
    }
  }

  async findAllMeCount(userId: string, desde?: string, hasta?: string)
  {
    const match: any = { userId };

    if (desde || hasta)
    {
      match.created_at = {};

      if (desde) match.created_at.$gte = new Date(desde);
      if (hasta) match.created_at.$lte = new Date(hasta);
    }

    const resultado = await this.publicacionModel.aggregate([
      { $match: match },

      // Agrupamos por usuario
      {
        $group: {
          _id: "$userId",
          nombreUsuario: { $first: "$nombreUsuario" },
          cantidadPublicaciones: { $sum: 1 }
        }
      },

      // Opcional: formatear salida
      {
        $project: {
          _id: 0,
          userId: "$_id",
          nombreUsuario: 1,
          cantidadPublicaciones: 1
        }
      }
    ]);

    return resultado[0] ?? null;  
  }

  async findComments(id : string, pagina: number)
  {
    try
    {
      const skip = (pagina -1) * 6;
      const porId = await this.publicacionModel.findById({_id: id}).select
      ({
        comentarios: { $slice: [skip, 6] }
      }).sort({created_at: 1});
      return porId?.comentarios;
    }
    catch
    {
      throw new HttpException("No se encontraron comentarios",HttpStatus.NOT_FOUND);
    }
  }
  async findAllComments(userId: string, desde?: string, hasta?: string)
  {
    try
    {
      // build match para filtrar por usuario y opcionalmente por fecha sobre comentarios.created_at
      const matchComment: any =
      {
        "comentarios.usuario.userId": userId
      };

      if (desde || hasta)
      {
        matchComment["comentarios.created_at"] = {};
        if (desde) matchComment["comentarios.created_at"].$gte = new Date(desde);
        if (hasta) matchComment["comentarios.created_at"].$lte = new Date(hasta);
      }

      const resultado = await this.publicacionModel.aggregate([
        // descomponemos el array de comentarios
        { $unwind: "$comentarios" },

        // filtramos por comentarios que tengan el userId (y por fecha si corresponde)
        { $match: matchComment },

        // agrupamos por el userId del comentario (devuelve un único grupo porque filtramos por userId)
        {
          $group:
          {
            _id: "$comentarios.usuario.userId",
            nombreUsuario: { $first: "$comentarios.usuario.nombreUsuario" },
            cantidadComentarios: { $sum: 1 }
          }
        },

        // formateamos la salida
        {
          $project:
          {
            _id: 0,
            userId: "$_id",
            nombreUsuario: 1,
            cantidadComentarios: 1
          }
        }
      ]);

      // Si no encontró nada devolvemos cantidad 0 (y el userId), para que el frontend lo maneje fácil
      return resultado[0] ?? { userId, nombreUsuario: null, cantidadComentarios: 0 };
    }
    catch (err)
    {
      throw new HttpException("No se pudieron obtener comentarios", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll(sort?: string)
  {
    try
    {
      let publicaciones = this.publicacionModel.find();
      switch(sort)
      {
        case "fecha":
          publicaciones = publicaciones.sort({created_at: -1});
          break;
        case "masLikes":
          publicaciones = publicaciones.sort({meGusta: -1});
          break;
        case "menosLikes":
          publicaciones = publicaciones.sort({meGusta: 1});
          break;
      }
      return publicaciones;
    }
    catch
    {
      throw new HttpException("Error al traer las publicaciones",HttpStatus.NOT_FOUND);
    }
  }

  async update(id: string, updatePublicacioneDto: UpdatePublicacioneDto)
  {
    try
    {
      const publicacionActualizada = await this.publicacionModel.findByIdAndUpdate(id, updatePublicacioneDto, { new: true });
      if (!publicacionActualizada)
      {
        throw new NotFoundException("La publicación no existe");
      }
      console.log(publicacionActualizada);
      return publicacionActualizada;
    }
    catch(error)
    {
      console.log(error);
      throw new BadRequestException("No se pudo actualizar la publicación");
    }
  }

  async findOne(id: number)
  {
    try
    {
      const porId = await this.publicacionModel.findById(id);
      return porId;
    }
    catch
    {
      throw new HttpException("No se encontro la publicacion",HttpStatus.NOT_FOUND);
    }
  }


  async remove(id: string)
  {
    try
    {
      const porId = await this.publicacionModel.deleteOne({_id: id});
      return porId;
    }
    catch
    {
      throw new HttpException("No se encontro la publicacion",HttpStatus.NOT_FOUND);
    }
  }

  async removeAll(userId: string)
  {
    try
    {
      const porId = await this.publicacionModel.deleteOne({userId: userId});
      return porId;
    }
    catch
    {
      throw new HttpException("No se encontro la publicacion",HttpStatus.NOT_FOUND);
    }
  }
}
