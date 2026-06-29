import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  Comentario,
  ComentarioCount,
  Publicacion,
  PublicacionM,
  PublicacionCount,
} from '../interfaces/publicacion';
import { Observable } from 'rxjs';
import { environments } from '../../environments/environments';
import { UsuarioC } from '../interfaces/usuario';

@Injectable({ providedIn: 'root' })
export class PublicacionesUsuario {
  httpClient = inject(HttpClient);
  private apiUrl = environments.apiUrl;

  private getToken() {
    const token = localStorage.getItem('Token');
    return { Authorization: `Bearer ${token ?? ''}` };
  }

  traerPublicaciones(sort?: string, offset?: number, limit?: number): Observable<PublicacionM[]> {
    let params = new HttpParams();
    if (sort) params = params.set('sort', sort);
    if (offset !== undefined) params = params.set('offset', offset.toString());
    if (limit !== undefined) params = params.set('limit', limit.toString());
    return this.httpClient.get<PublicacionM[]>(`${this.apiUrl}/inicio`, {
      headers: this.getToken(),
      params,
    });
  }

  traerMisPublicaciones(id: string, paginaActual: number): Observable<PublicacionM[]> {
    let params = new HttpParams();
    params = params.set('pagina', paginaActual);
    return this.httpClient.get<PublicacionM[]>(`${this.apiUrl}/perfil/${id}`, {
      headers: this.getToken(),
      params,
    });
  }
  traerMisPublicacionesCount(
    id: string,
    desde?: string,
    hasta?: string,
  ): Observable<PublicacionCount | null> {
    const params: any = {};
    if (desde) params.desde = desde;
    if (hasta) params.hasta = hasta;

    return this.httpClient.get<PublicacionCount | null>(`${this.apiUrl}/publicaciones/${id}`, {
      headers: this.getToken(),
      params,
    });
  }

  traerComentarios(id: string, paginaActual: number): Observable<{ comentarios: Comentario[]; total: number }> {
    let params = new HttpParams();
    params = params.set('pagina', paginaActual);
    return this.httpClient.get<{ comentarios: Comentario[]; total: number }>(`${this.apiUrl}/comentarios/${id}`, {
      headers: this.getToken(),
      params,
    });
  }

  traerPublicacionPorId(id: string): Observable<PublicacionM> {
    return this.httpClient.get<PublicacionM>(`${this.apiUrl}/publicacion/${id}`, {
      headers: this.getToken(),
    });
  }

  agregarComentario(publicacionId: string, texto: string, usuario: UsuarioC): Observable<Comentario> {
    return this.httpClient.post<Comentario>(
      `${this.apiUrl}/comentarios/${publicacionId}`,
      { texto, usuario },
      { headers: this.getToken() }
    );
  }

  editarComentario(publicacionId: string, comentarioId: string, texto: string): Observable<Comentario> {
    return this.httpClient.put<Comentario>(
      `${this.apiUrl}/comentarios/${publicacionId}/${comentarioId}`,
      { texto },
      { headers: this.getToken() }
    );
  }
  traerMisComentarios(
    id: string,
    desde?: string,
    hasta?: string,
  ): Observable<ComentarioCount | null> {
    const params: any = {};
    if (desde) params.desde = desde;
    if (hasta) params.hasta = hasta;
    return this.httpClient.get<ComentarioCount | null>(
      `${this.apiUrl}/comentarios/usuarios/${id}`,
      { headers: this.getToken(), params },
    );
  }

  crearPublicacion(
    publicacion: { titulo: string; descripcion?: string },
    file?: File | null,
  ): Observable<Publicacion> {
    const formData = new FormData();
    formData.append('titulo', publicacion.titulo);
    formData.append('descripcion', publicacion.descripcion || '');
    if (file) formData.append('file', file);
    const token = localStorage.getItem('Token');
    return this.httpClient.post<Publicacion>(`${this.apiUrl}/perfil/crear`, formData, {
      headers: { Authorization: `Bearer ${token ?? ''}` },
    });
  }

  modificarPublicacion(id: string, parametros: Partial<PublicacionM>) {
    return this.httpClient.patch<PublicacionM>(
      `${this.apiUrl}/perfil/modificar/${id}`,
      parametros,
      { headers: this.getToken() },
    );
  }

  eliminarPublicacion(id: string) {
    return this.httpClient.delete<PublicacionM>(`${this.apiUrl}/perfil/eliminar/${id}`, {
      headers: this.getToken(),
    });
  }
  eliminarPublicaciones(userId?: string) {
    return this.httpClient.delete<PublicacionM>(`${this.apiUrl}/publicaciones/eliminar/${userId}`, {
      headers: this.getToken(),
    });
  }

  darLike(publicacionId: string): Observable<PublicacionM> {
    return this.httpClient.post<PublicacionM>(
      `${this.apiUrl}/publicaciones/${publicacionId}/like`,
      {},
      { headers: this.getToken() },
    );
  }

  quitarLike(publicacionId: string): Observable<PublicacionM> {
    return this.httpClient.delete<PublicacionM>(
      `${this.apiUrl}/publicaciones/${publicacionId}/like`,
      { headers: this.getToken() },
    );
  }

  traerEstadisticasPublicaciones(desde?: string, hasta?: string): Observable<any[]> {
    const params: any = {};
    if (desde) params.desde = desde;
    if (hasta) params.hasta = hasta;
    return this.httpClient.get<any[]>(`${this.apiUrl}/estadisticas/publicaciones-por-usuario`, {
      headers: this.getToken(),
      params
    });
  }

  traerEstadisticasComentariosTotales(desde?: string, hasta?: string): Observable<any[]> {
    const params: any = {};
    if (desde) params.desde = desde;
    if (hasta) params.hasta = hasta;
    return this.httpClient.get<any[]>(`${this.apiUrl}/estadisticas/comentarios-totales`, {
      headers: this.getToken(),
      params
    });
  }

  traerEstadisticasComentariosPorPublicacion(desde?: string, hasta?: string): Observable<any[]> {
    const params: any = {};
    if (desde) params.desde = desde;
    if (hasta) params.hasta = hasta;
    return this.httpClient.get<any[]>(`${this.apiUrl}/estadisticas/comentarios-por-publicacion`, {
      headers: this.getToken(),
      params
    });
  }
}
