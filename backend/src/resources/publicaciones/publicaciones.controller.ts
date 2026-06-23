import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { PublicacionesService } from './publicaciones.service';
import { CreatePublicacioneDto } from './dto/create-publicaciones.dto';
import { UpdatePublicacioneDto } from './dto/update-publicaciones.dto';
import { AuthGuard } from '../../guards/auth.guard';

@UseGuards(AuthGuard)
@Controller()
export class PublicacionesController
{
  constructor(private readonly publicacionesService: PublicacionesService) {}
  
  @Post("perfil/crear")
  create(@Body() createPublicacioneDto: CreatePublicacioneDto)
  {
    return this.publicacionesService.create(createPublicacioneDto);
  }

  @Get("inicio")
  findAll(@Query("sort") sort?: string)
  {
    return this.publicacionesService.findAll(sort);
  }
  @Get("publicaciones/:id")
  countByUserAndDate(@Param("id") id: string, @Query("desde") desde?: string, @Query("hasta") hasta?: string) 
  {
    return this.publicacionesService.findAllMeCount(id, desde, hasta);
  }
  @Get("perfil/:id")
  findAllMe(@Param("id") userId: string, @Query("pagina") pagina: number)
  {
    return this.publicacionesService.findAllMe(userId, pagina);
  }

  @Get("comentarios/:id")
  findComments(@Param('id') publicacionId: string, @Query("pagina") pagina: number)
  {
    return this.publicacionesService.findComments(publicacionId, pagina);
  }
  @Get("comentarios/usuarios/:id")
  findAllComments(@Param('id') userId: string, @Query("desde") desde: string, @Query("hasta") hasta: string)
  {
    return this.publicacionesService.findAllComments(userId, desde, hasta);
  }

  @Patch("perfil/modificar/:id")
  update(@Param('id') id: string, @Body() updatePublicacioneDto: UpdatePublicacioneDto)
  {
    return this.publicacionesService.update(id, updatePublicacioneDto);
  }

  @Delete("perfil/eliminar/:id")
  remove(@Param('id') id: string)
  {
    return this.publicacionesService.remove(id);
  }

  @Delete("publicaciones/eliminar/:userId")
  removeAll(@Param('userId') userId: string)
  {
    return this.publicacionesService.removeAll(userId);
  }
}
