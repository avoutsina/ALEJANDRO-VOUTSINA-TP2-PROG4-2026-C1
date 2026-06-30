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

  // POST: alta de un nuevo usuario por parte de un administrador (perfil elegible)
  @UseGuards(AdminGuard)
  @Post()
  adminCreate(@Body() createUsuarioDto: any) {
    return this.usuariosService.create(createUsuarioDto);
  }

  // DELETE: baja lógica, deshabilita a un usuario (baneado: true)
  @UseGuards(AdminGuard)
  @Delete(':id')
  remove(@Param('id') id: string)
  {
    return this.usuariosService.update(id, { baneado: true });
  }

  // POST: alta lógica, rehabilita a un usuario deshabilitado (baneado: false)
  @UseGuards(AdminGuard)
  @Post('habilitar/:id')
  habilitar(@Param('id') id: string)
  {
    return this.usuariosService.update(id, { baneado: false });
  }
}
