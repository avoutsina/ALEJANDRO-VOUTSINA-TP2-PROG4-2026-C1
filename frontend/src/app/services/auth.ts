import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { AuthResponse } from '../interfaces/authResponse';
import { UsuarioL } from '../interfaces/usuario';
import { UsuarioR } from '../interfaces/usuario';
import Swal from 'sweetalert2';
import { environments } from '../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class Auth
{
  private router = inject(Router);
  httpClient = inject(HttpClient);
  private apiUrl = environments.apiUrl;

  public estado = signal<boolean>(false);
  private token = signal<string | null>(null);
  cargando = signal<boolean>(false);
  
  constructor()
  {
    this.token.set(localStorage.getItem("Token"));
    this.estado.set(false);
    this.cargando.set(false);
  }

  login(usuario: UsuarioL)
  {
    this.cargando.set(true);
    console.log(usuario);
    const peticion = this.httpClient.post<AuthResponse>(this.apiUrl + "/login", usuario);
    peticion.subscribe
    ({
      next: (res) =>
      {
        localStorage.setItem("Token", res.Token);
        this.token.set(res.Token);
        console.log(res);
      },
      error: (error) =>
      {
        this.cargando.set(false);
        const status = error?.status;
        if(status === 403)
        {
          Swal.fire
          ({
            title: "Estas Baneado",
            text: "El Usuario ingresado ha sido Baneado por un Administrador",
            icon: "error",
            confirmButtonText: "Aceptar",
            draggable: true
          })
        }
        else if (status === 401)
        {
          Swal.fire
          ({
            title: "Credenciales invalidas",
            icon: "error",
            text: "El Usuario y/o la Contraseña no son validos",
            confirmButtonText: "Aceptar",
            draggable: true
          })
        }
        else
        {
          const err: string = error.error?.message;
          Swal.fire
          ({
            title: err,
            icon: "error",
            confirmButtonText: "Aceptar",
            draggable: true
          })
        }
      },
      complete: () =>
      {
        this.cargando.set(false);
        this.router.navigateByUrl("/inicio")
        Swal.fire
        ({
          title: "Sesion iniciada",
          icon: "success",
          confirmButtonText: "Aceptar",
          draggable: true
        })
      }
    });
  }

  register(usuario: Partial<UsuarioR>, file: File | null, permiso: boolean)
  {
    const formData = new FormData();
    formData.append('nombre', usuario.nombre || '');
    formData.append('apellido', usuario.apellido || '');
    formData.append('correo', usuario.correo || '');
    formData.append('nombreUsuario', usuario.nombreUsuario || '');
    formData.append('contrasenia', usuario.contrasenia || '');
    formData.append('descripcion', usuario.descripcion || '');
    if (usuario.fechaDeNacimiento)
    {
      const dateVal = usuario.fechaDeNacimiento instanceof Date ? usuario.fechaDeNacimiento.toISOString() : usuario.fechaDeNacimiento;
      formData.append('fechaDeNacimiento', dateVal);
    }
    formData.append('admin', String(usuario.admin ?? false));
    if (file)
    {
      formData.append('avatar', file);
    }

    console.log("Sending registration form data...");
    const peticion = this.httpClient.post<AuthResponse>(this.apiUrl + "/register", formData);
    peticion.subscribe
    ({
      next: (res) => 
      {
        if(!permiso)
        {
          localStorage.setItem("Token", res.Token);
          this.token.set(res.Token);
        }
        console.log(res);
      },
      error: (error) =>
      {
        const err = error.error.message;
        Swal.fire
        ({
          title: err,
          icon: "error",
          draggable: true
        });
      },
      complete: () =>
      {
        Swal.fire
        ({
          title: "Registro exitoso",
          icon: "success",
          confirmButtonText: "Aceptar",
          draggable: true
        }).then(result => 
        {
          if(result.isDismissed || result.isConfirmed)
          {
            if(!permiso)
            {
              this.router.navigateByUrl("/inicio");
            }
            else
            {
              this.router.navigateByUrl("/usuarios");
            }
          }
        });
      }
    });
  }

  estaLogueado(): boolean
  {
    const token = this.token();
    if (!token)
    {
      this.estado.set(false);
      return false;
    }

    let decoded: any;
    try
    {
      decoded = jwtDecode(token);
    }
    catch (err)
    {
      // token inválido
      this.logout();
      return false;
    }

    const ahoraSegundos = Math.floor(Date.now() / 1000);
    const expSegundos = Number(decoded.exp) || 0;

    // si ya expiró
    if (expSegundos <= ahoraSegundos)
    {
      Swal.fire
      ({
        title: 'Tu sesión expiró',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        allowOutsideClick: false,
      }).then(() =>
      {
        this.logout();
      });
      return false;
    }

    // actualizar estado a "logueado"
    this.estado.set(true);

    // avisar si quedan 5 minutos o menos (sin hacer logout aquí)
    const segundosRestantes = expSegundos - ahoraSegundos;
    if (segundosRestantes <= 300)
    {
      // Optional: evitar múltiples Swal seguidos. Por ejemplo usamos localStorage
      // para marcar que ya mostramos la alerta recientemente.
      const claveAviso = 'aviso-expiracion-mostrado';
      const ultimaVez = Number(localStorage.getItem(claveAviso) || '0');
      const ahoraMs = Date.now();

      // mostramos la alerta sólo si no la mostramos en los últimos 60s
      if (ahoraMs - ultimaVez > 60 * 1000)
      {
        localStorage.setItem(claveAviso, String(ahoraMs));
        Swal.fire
        ({
          title: 'Tu sesión está por expirar',
          text: 'Te quedan menos de 5 minutos',
          icon: 'warning',
          confirmButtonText: 'Aceptar',
          allowOutsideClick: false,
        });
      }
    }
    return true;
  }
  

  logout()
  {
    localStorage.removeItem("Token");
    this.token.set(null);
    this.estado.set(false);
    this.router.navigateByUrl("/login");
  }

  get getNombreUsuario() : string | null
  {
    const token = this.token();
    if(token)
    {
      const decoded: any = jwtDecode(token);
      return decoded.userName;
    }
    return null
  }
  get getSub() : string | null
  {
    const token = this.token();
    if(token)
    {
      const decoded: any = jwtDecode(token);
      return decoded.sub;
    }
    return null
  }
  get getAvatar() : string | null
  {
    const token = this.token();
    if(token)
    {
      const decoded: any = jwtDecode(token);
      return decoded.avatar;
    }
    return null
  }

  get getPermiso() : boolean
  {
    const token = this.token();
    if(token)
    {
      const decoded: any = jwtDecode(token);
      return decoded.admin;
    }
    return false
  }
}

