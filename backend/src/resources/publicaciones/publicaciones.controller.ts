import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Patch,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { PublicacionesService } from './publicaciones.service';
import { CreatePublicacioneDto } from './dto/create-publicaciones.dto';
import { UpdatePublicacioneDto } from './dto/update-publicaciones.dto';
import { AuthGuard } from '../../guards/auth.guard';
import { AdminGuard } from '../../guards/admin.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';

@UseGuards(AuthGuard)
@Controller()
export class PublicacionesController {
  constructor(
    private readonly publicacionesService: PublicacionesService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post('perfil/crear')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async create(
    @Req() req: any,
    @Body() body: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const user = req.user || {};
    if (!user.sub || !user.userName) {
      throw new BadRequestException('Token inválido o incompleto');
    }

    const publicacion: CreatePublicacioneDto = {
      titulo: body.titulo,
      userId: user.sub,
      urlImg: '',
      descripcion: body.descripcion ?? '',
      nombreUsuario: user.userName,
      avatar: user.avatar ?? '',
      meGusta: 0,
      meGustaId: [],
      comentarios: [],
    };

    if (file) {
      const uploadResult = await this.cloudinaryService.uploadImage(
        file,
        'publicaciones',
      );
      if (uploadResult?.secure_url) {
        publicacion.urlImg = uploadResult.secure_url;
        publicacion.publicId = uploadResult.public_id;
      }
    }

    return this.publicacionesService.create(publicacion);
  }

  @Get('publicacion/:id')
  findOne(@Param('id') id: string) {
    return this.publicacionesService.findOne(id);
  }

  @Get('inicio')
  findAll(
    @Query('sort') sort?: string,
    @Query('userId') userId?: string,
    @Query('offset') offset?: string,
    @Query('limit') limit?: string,
  ) {
    const off = offset !== undefined ? Number(offset) : undefined;
    const lim = limit !== undefined ? Number(limit) : undefined;
    return this.publicacionesService.findAll(sort, userId, off, lim);
  }

  @UseGuards(AdminGuard)
  @Get('publicaciones/:id')
  countByUserAndDate(
    @Param('id') id: string,
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    return this.publicacionesService.findAllMeCount(id, desde, hasta);
  }

  @Get('perfil/:id')
  findAllMe(@Param('id') userId: string, @Query('pagina') pagina: number) {
    return this.publicacionesService.findAllMe(userId, pagina);
  }

  @UseGuards(AdminGuard)
  @Get('comentarios/usuarios/:id')
  findAllComments(
    @Param('id') userId: string,
    @Query('desde') desde: string,
    @Query('hasta') hasta: string,
  ) {
    return this.publicacionesService.findAllComments(userId, desde, hasta);
  }

  @UseGuards(AdminGuard)
  @Get('publicaciones-comentarios/stats')
  findCommentsPerPublicationStats(
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    return this.publicacionesService.findCommentsPerPublicationStats(desde, hasta);
  }

  @Get('comentarios/:id')
  findComments(
    @Param('id') publicacionId: string,
    @Query('pagina') pagina: number,
  ) {
    return this.publicacionesService.findComments(publicacionId, pagina);
  }

  @Post('comentarios/:id')
  addComment(
    @Param('id') publicacionId: string,
    @Body() body: { texto: string; usuario: any },
  ) {
    return this.publicacionesService.addComentario(publicacionId, body);
  }

  @Put('comentarios/:id/:comentarioId')
  editComment(
    @Param('id') publicacionId: string,
    @Param('comentarioId') comentarioId: string,
    @Body() body: { texto: string },
  ) {
    return this.publicacionesService.editarComentario(
      publicacionId,
      comentarioId,
      body.texto,
    );
  }

  @Patch('perfil/modificar/:id')
  update(
    @Param('id') id: string,
    @Body() updatePublicacioneDto: UpdatePublicacioneDto,
  ) {
    return this.publicacionesService.update(id, updatePublicacioneDto);
  }

  @Delete('perfil/eliminar/:id')
  async remove(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.sub;
    const isAdmin = req.user?.admin;

    const publicacion = await this.publicacionesService.findOne(id);
    if (publicacion.userId !== userId && !isAdmin) {
      throw new ForbiddenException(
        'No tienes permisos para eliminar esta publicación',
      );
    }

    return this.publicacionesService.remove(id);
  }

  @Delete('publicaciones/eliminar/:userId')
  removeAll(@Param('userId') userId: string) {
    return this.publicacionesService.removeAll(userId);
  }

  @Post('publicaciones/:id/like')
  like(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.sub;
    return this.publicacionesService.likePublicacion(id, userId);
  }

  @Delete('publicaciones/:id/like')
  unlike(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.sub;
    return this.publicacionesService.unlikePublicacion(id, userId);
  }
}
