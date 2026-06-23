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
      title: "¿Estas seguro de eliminar?",
      text: "Si eliminas este usuario perderá todo",
      icon: "warning",
      showCancelButton: true,
      cancelButtonColor: "#3085d6",
      confirmButtonColor: "#d33",
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar"
    }).then((result) =>
      {
        if (result.isConfirmed)
        {
          this.publicacionesService.eliminarPublicaciones(id).subscribe(res =>
          {
            console.log(res);
          });
          this.usuariosService.eliminarUsuario(id).subscribe(
          {
            next: (res) =>
            {
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
                title: "Eliminado",
                text: "Usuario eliminado con exito",
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
    this.arrayUsuarios.update(arr =>
    {
      const user = arr.find(user => user._id === id);
      if(user)
      {
        user.baneado = valor;
      }
      return arr;
    });
    this.usuariosService.modificarUsuario(id, {baneado: valor}).subscribe(res =>
    {
      console.log(res);
    });;
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
