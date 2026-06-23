import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Comentario, ComentarioCount, Publicacion, PublicacionCount, PublicacionM } from '../interfaces/publicacion';
import { Observable } from 'rxjs';
import { environments } from '../../environments/environments';

@Injectable({ providedIn: 'root' })
export class PublicacionesUsuario
{
  httpClient = inject(HttpClient);
  private apiUrl = environments.apiUrl;

  private getToken() 
  {
    const token = localStorage.getItem("Token");
    return { Authorization: `Bearer ${token ?? ''}` };
  }

  traerPublicaciones(sort?: string): Observable<PublicacionM[]>
  {
    let params = new HttpParams();
    if (sort)
    {
      params = params.set('sort', sort);
    }
    return this.httpClient.get<PublicacionM[]>(`${this.apiUrl}/inicio`,{ headers: this.getToken(), params });
  }

  traerMisPublicaciones(id: string, paginaActual: number): Observable<PublicacionM[]> 
  {
    let params = new HttpParams();
    params = params.set('pagina', paginaActual);
    return this.httpClient.get<PublicacionM[]>(`${this.apiUrl}/perfil/${id}`, { headers: this.getToken(), params });
  }
  traerMisPublicacionesCount(id: string, desde?: string, hasta?: string): Observable<PublicacionCount | null>
  {
    const params: any = {};
    if (desde) params.desde = desde;
    if (hasta) params.hasta = hasta;

    return this.httpClient.get<PublicacionCount | null>(`${this.apiUrl}/publicaciones/${id}`, { headers: this.getToken(), params });
  }
  
  traerComentarios(id: string, paginaActual: number): Observable<Comentario[]> 
  {
    let params = new HttpParams();
    params = params.set('pagina', paginaActual);
    return this.httpClient.get<Comentario[]>(`${this.apiUrl}/comentarios/${id}`, { headers: this.getToken(), params });
  }
  traerMisComentarios(id: string, desde?: string, hasta?: string): Observable<ComentarioCount | null> 
  {
    const params: any = {};
    if (desde) params.desde = desde;
    if (hasta) params.hasta = hasta;
    return this.httpClient.get<ComentarioCount | null>(`${this.apiUrl}/comentarios/usuarios/${id}`, { headers: this.getToken(), params });
  }


  crearPublicacion(publicacion: Publicacion): Observable<Publicacion>
  {
    return this.httpClient.post<Publicacion>(`${this.apiUrl}/perfil/crear`, publicacion, { headers: this.getToken() });
  }

  modificarPublicacion(id : string , parametros: Partial<PublicacionM>)
  {
    return this.httpClient.patch<PublicacionM>(`${this.apiUrl}/perfil/modificar/${id}`, parametros, { headers: this.getToken() });
  }

  eliminarPublicacion(id: string)
  {
    return this.httpClient.delete<Publicacion>(`${this.apiUrl}/perfil/eliminar/${id}`, { headers: this.getToken() })
  }
  eliminarPublicaciones(userId?: string)
  {
    return this.httpClient.delete<Publicacion>(`${this.apiUrl}/publicaciones/eliminar/${userId}`, { headers: this.getToken() })
  }
}

