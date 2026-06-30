import { Component, inject, signal } from '@angular/core';
import { UsuariosService } from '../../services/usuariosService';
import { UsuarioR } from '../../interfaces/usuario';
import { DatePipe } from '@angular/common';
import { FormsModule } from "@angular/forms";
import { RouterLink } from '@angular/router';
import { PublicacionesUsuario } from '../../services/publicacionesUsuario';
import Swal from 'sweetalert2';
import { Loading } from '../components/loading/loading';

@Component({
  selector: 'app-usuarios',
  imports: [DatePipe, FormsModule, RouterLink, Loading],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
})
export class Usuarios
{
  cargando = signal<boolean>(true);

  usuariosService = inject(UsuariosService);
  publicacionesService = inject(PublicacionesUsuario);

  arrayUsuarios = signal<Partial<UsuarioR>[]>([]);
  alternarAdmin = signal<boolean>(false);

  ngOnInit()
  {
    this.cargando.set(true);
    this.traerUsuarios();
  }

  traerUsuarios()
  {
    this.usuariosService.traerUsuarios().subscribe(
      {
        next: (res) =>
        {
          console.log(res);
          this.arrayUsuarios.set(res)
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
          this.cargando.set(false);
        }
      });
  }

  eliminarUsuario(id?: string)
  {
    Swal.fire
    ({
      title: "¿Estás seguro de deshabilitar?",
      text: "El usuario ya no podrá ingresar a la aplicación",
      icon: "warning",
      showCancelButton: true,
      cancelButtonColor: "#3085d6",
      confirmButtonColor: "#d33",
      confirmButtonText: "Deshabilitar",
      cancelButtonText: "Cancelar"
    }).then((result) =>
      {
        if (result.isConfirmed)
        {
          this.usuariosService.eliminarUsuario(id).subscribe(
          {
            next: (res) =>
            {
              // Actualizar localmente el estado del usuario en la lista
              this.arrayUsuarios.update(arr =>
                arr.map(u => u._id === id ? { ...u, baneado: true } : u)
              );
            },
            error: (error) =>
            {
              const err = error.error?.message ?? 'Error';
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
                title: "Deshabilitado",
                text: "Usuario deshabilitado con éxito",
                icon: "success"
              });
            }
          });
        }
    });

  }

  banearUsuario(id?: string, estadoBan?: boolean)
  {
    if(!id) return;
    const valor = !estadoBan;

    const request = valor 
      ? this.usuariosService.eliminarUsuario(id) 
      : this.usuariosService.habilitarUsuario(id);

    request.subscribe({
      next: () => {
        this.arrayUsuarios.update(arr =>
          arr.map(user => user._id === id ? { ...user, baneado: valor } : user)
        );
        Swal.fire({
          title: valor ? "Usuario deshabilitado" : "Usuario habilitado",
          icon: "success",
          timer: 2000,
          showConfirmButton: false
        });
      },
      error: (error) => {
        const err = error.error?.message ?? 'Error al actualizar estado';
        Swal.fire({ title: err, icon: "error" });
      }
    });
  }

  cambiarAdmin(_id?: string, esAdmin?: Event)
  {
    const valor = (esAdmin?.target as HTMLInputElement).checked;
    if(!_id) return;
    this.usuariosService.modificarUsuario(_id, {admin: valor}).subscribe(res =>
    {
      console.log(res);
    });
  }
  
}
