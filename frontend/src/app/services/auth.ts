import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { AuthResponse } from '../interfaces/authResponse';
import { UsuarioL } from '../interfaces/usuario';
import { UsuarioR } from '../interfaces/usuario';
import Swal from 'sweetalert2';
import { environments } from '../../environments/environments';
import { Observable } from 'rxjs';

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
  private sesionTimerId: ReturnType<typeof setTimeout> | null = null;

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
        this.estado.set(true);
        this.iniciarContadorSesion();
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
          this.estado.set(true);
          this.iniciarContadorSesion();
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

  /**
   * Llama al endpoint POST /autorizar del backend para validar el token.
   * Retorna Observable con los datos del usuario si el token es válido.
   * Lanza 401 si el token es inválido o vencido.
   */
  autorizar(): Observable<any>
  {
    const token = this.token();
    return this.httpClient.post<any>(
      this.apiUrl + '/autorizar',
      {},
      { headers: { Authorization: `Bearer ${token ?? ''}` } }
    );
  }

  /**
   * Llama al endpoint POST /refrescar para obtener un nuevo token de 15 min.
   */
  refrescarToken(): Observable<{ Token: string }>
  {
    const token = this.token();
    return this.httpClient.post<{ Token: string }>(
      this.apiUrl + '/refrescar',
      {},
      { headers: { Authorization: `Bearer ${token ?? ''}` } }
    );
  }

  /**
   * Inicia un contador de 10 minutos al hacer login/register.
   * Al terminar, muestra modal preguntando si desea extender la sesión.
   * Si acepta → refresca el token y reinicia el contador.
   * Si no → hace logout.
   */
  iniciarContadorSesion()
  {
    // Limpiar timer anterior si existe
    if (this.sesionTimerId !== null) {
      clearTimeout(this.sesionTimerId);
      this.sesionTimerId = null;
    }

    const DIEZ_MINUTOS = 10 * 60 * 1000;

    this.sesionTimerId = setTimeout(() =>
    {
      Swal.fire({
        title: '⏳ Tu sesión está por vencer',
        text: 'Te quedan 5 minutos de sesión. ¿Deseás extenderla?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, extender sesión',
        cancelButtonText: 'No, cerrar sesión',
        allowOutsideClick: false,
        timer: 60000,
        timerProgressBar: true,
      }).then(result =>
      {
        if (result.isConfirmed)
        {
          this.refrescarToken().subscribe({
            next: (res) =>
            {
              localStorage.setItem('Token', res.Token);
              this.token.set(res.Token);
              this.iniciarContadorSesion(); // Reinicia el contador por otros 10 min
              Swal.fire({ title: 'Sesión extendida', icon: 'success', timer: 2000, showConfirmButton: false });
            },
            error: () =>
            {
              this.logout();
            }
          });
        }
        else
        {
          this.logout();
        }
      });
    }, DIEZ_MINUTOS);
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

    return true;
  }


  logout()
  {
    // Limpiar el timer de sesión si estaba activo
    if (this.sesionTimerId !== null) {
      clearTimeout(this.sesionTimerId);
      this.sesionTimerId = null;
    }
    localStorage.removeItem("Token");
    localStorage.removeItem('aviso-expiracion-mostrado');
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
