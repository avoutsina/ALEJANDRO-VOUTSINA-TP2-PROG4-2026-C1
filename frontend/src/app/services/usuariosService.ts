import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environments } from '../../environments/environments';
import { UsuarioR } from '../interfaces/usuario';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService
{
  httpClient = inject(HttpClient);
  private apiUrl = environments.apiUrl;

  private getToken() 
  {
    const token = localStorage.getItem("Token");
    return { Authorization: `Bearer ${token ?? ''}` };
  }

  traerUsuarios()
  {
    return this.httpClient.get<Partial<UsuarioR>[]>(`${this.apiUrl}/usuarios`,{ headers: this.getToken() });
  }
  traerIdsUsuarios()
  {
    return this.httpClient.get<string[]>(`${this.apiUrl}/usuarios/ids`,{ headers: this.getToken() });
  }
  traerUsuario(_id: string)
  {
    return this.httpClient.get<Partial<UsuarioR>>(`${this.apiUrl}/usuarios/${_id}`,{ headers: this.getToken() });
  }
  modificarUsuario(_id: string, parametros: Partial<UsuarioR>)
  {
    return this.httpClient.patch<Partial<UsuarioR>[]>(`${this.apiUrl}/usuarios/modificar/${_id}`, parametros, { headers: this.getToken() });
  }
  eliminarUsuario(id?: string)
  {
    return this.httpClient.delete<Partial<UsuarioR>[]>(`${this.apiUrl}/usuarios/${id}`,{ headers: this.getToken() });
  }
  habilitarUsuario(id?: string)
  {
    return this.httpClient.post<Partial<UsuarioR>[]>(`${this.apiUrl}/usuarios/habilitar/${id}`, {}, { headers: this.getToken() });
  }
}
