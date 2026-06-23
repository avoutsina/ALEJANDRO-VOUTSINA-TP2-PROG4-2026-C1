import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards} from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { AuthGuard } from '../../guards/auth.guard';
import { AdminGuard } from '../../guards/admin.guard';

@UseGuards(AuthGuard)
@Controller('usuarios')
export class UsuariosController
{
  constructor(private readonly usuariosService: UsuariosService) {}
  
  @UseGuards(AdminGuard)
  @Get()
  findAll()
  {
    return this.usuariosService.findAll();
  }
  
  @Get("ids")
  findAllIds()
  {
    return this.usuariosService.findAllIds();
  }

  @Get(':id')
  findOne(@Param('id') id: string)
  {
    return this.usuariosService.findOne(id);
  }
  
  @UseGuards(AdminGuard)
  @Get('correo/:correo')
  findByEmail(@Param('correo') email: string)
  {
    return this.usuariosService.findByEmail(email);
  }

  @UseGuards(AdminGuard)
  @Patch('modificar/:_id')
  update(@Param('_id') id: string, @Body() updateUsuarioDto: UpdateUsuarioDto)
  {
    return this.usuariosService.update(id, updateUsuarioDto);
  }
  @UseGuards(AdminGuard)
  @Delete(':id')
  remove(@Param('id') id: string)
  {
    return this.usuariosService.remove(id);
  }
}
