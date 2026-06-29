import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../guards/auth.guard';
import { AdminGuard } from '../../guards/admin.guard';
import { PublicacionesService } from './publicaciones.service';

@UseGuards(AuthGuard, AdminGuard)
@Controller('estadisticas')
export class EstadisticasController {
  constructor(private readonly publicacionesService: PublicacionesService) {}

  @Get('publicaciones-por-usuario')
  async getPublicacionesPorUsuario(
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    return this.publicacionesService.getEstadisticasPublicaciones(desde, hasta);
  }

  @Get('comentarios-totales')
  async getComentariosTotales(
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    return this.publicacionesService.getEstadisticasComentariosTotales(desde, hasta);
  }

  @Get('comentarios-por-publicacion')
  async getComentariosPorPublicacion(
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    return this.publicacionesService.getEstadisticasComentariosPorPublicacion(desde, hasta);
  }
}
