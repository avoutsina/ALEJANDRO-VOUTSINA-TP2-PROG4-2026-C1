import { ConflictException, HttpException, HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Usuario } from './entities/usuario.entity';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService
{
  constructor(@InjectModel(Usuario.name) private usuarioModel: Model<Usuario>){}

  async create(createUsuarioDto: CreateUsuarioDto)
  {
    const usuarioExistentePorCorreo = await this.findByEmail(createUsuarioDto.correo);
    const usuarioExistentePorNombreUsuario = await this.findByNombreUsuario(createUsuarioDto.nombreUsuario);
    if(usuarioExistentePorCorreo || usuarioExistentePorNombreUsuario)
    {
      throw new ConflictException("El correo o el nombre de usuario ya está registrado");
    }
    
    console.log("La contrasenia es: ", createUsuarioDto.contrasenia);
    createUsuarioDto.contrasenia = await bcrypt.hash(createUsuarioDto.contrasenia, 10);
    try
    {
      const inst = new this.usuarioModel(createUsuarioDto)
      console.log(inst);
      const guardado = await inst.save();
      return guardado;
    }
    catch
    {
      throw new HttpException("No se pudo crear el usuario", HttpStatus.BAD_REQUEST);
    }
  }

  async findAll()
  {
    try
    {
      const todos = await this.usuarioModel.find();
      return todos;
    }
    catch
    {
      throw new HttpException("No se encontro ningun usuario", HttpStatus.NOT_FOUND);
    }
  }
  async findAllIds()
  {
    const docs = await this.usuarioModel.find({}, { _id: 1 }).lean();
    return docs.map(d => d._id.toString());
  }

  async findOne(id: string)
  {
    try
    {
      const porId = await this.usuarioModel.findById(id);
      return porId;
    }
    catch
    {
      throw new HttpException("No se encontro el usuario", HttpStatus.NOT_FOUND);
    }
  }

  async findByEmail(email: string)
  {
    try
    {
      const res = await this.usuarioModel.findOne({correo: email});
      return res;
    }
    catch
    {
      throw new HttpException("No se encontro el usuario", HttpStatus.NOT_FOUND);
    }
  }

  async findByNombreUsuario(nombreUsuario: string)
  {
    try
    {
      const res = await this.usuarioModel.findOne({nombreUsuario: nombreUsuario});
      return res;
    }
    catch
    {
      throw new HttpException("No se encontro el usuario", HttpStatus.NOT_FOUND);
    }
  }

  async update(id: string, updateUsuarioDto: UpdateUsuarioDto)
  {
    try
    {    
      const actualizado = await this.usuarioModel.updateOne({_id: id}, updateUsuarioDto);
      return actualizado;
    }
    catch
    {
      throw new HttpException("No se pudo encontrar el usuario", HttpStatus.NOT_FOUND);
    }
  }

  async remove(id: string)
  {
    try
    {
      const resultado = await this.usuarioModel.updateOne({_id: id}, { baneado: true });
      return resultado;
    }
    catch
    {
      throw new HttpException("No se pudo deshabilitar el usuario", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async reactivar(id: string)
  {
    try
    {
      const resultado = await this.usuarioModel.updateOne({_id: id}, { baneado: false });
      return resultado;
    }
    catch
    {
      throw new HttpException("No se pudo habilitar el usuario", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
