import { Component, inject} from '@angular/core';
import { Auth } from '../../services/auth';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PublicacionesUsuario } from '../../services/publicacionesUsuario';
import { UpperCasePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { imagen } from '../../Classes/imagen';

@Component({
  selector: 'app-publicaciones',
  imports: [ReactiveFormsModule, UpperCasePipe, RouterLink],
  templateUrl: './publicacion.html',
  styleUrl: './publicaciones.css',
})
export class Publicacion
{
  imagenClass : imagen = new imagen()

  authService = inject(Auth);
  userService = inject(PublicacionesUsuario);
  router = inject(Router);

  fomularioPublicacion = new FormGroup
  ({
    descripcion: new FormControl("", [Validators.maxLength(100)]),
  })

  async crearPublicacion()
  {
    await this.imagenClass.upload(null);
    const userId = this.authService.getSub as string;
    const urlImg = this.imagenClass.urlFoto();
    const descripcion = this.fomularioPublicacion.controls.descripcion.value as string;
    const nombreUsuario = this.authService.getNombreUsuario as string;
    const avatar = this.authService.getAvatar as string;
    if(!urlImg) return;
    this.userService.crearPublicacion
    ({
      userId: userId, 
      urlImg: urlImg, 
      descripcion: descripcion,
      nombreUsuario: nombreUsuario,
      avatar: avatar
    }).subscribe(
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
              title: "Publicado con exito",
              icon: "success",
              draggable: true
            }).then(result => 
            {
              if(result.isDismissed || result.isConfirmed)
              {
                this.router.navigateByUrl("/inicio")
              }
            });
        }
      });
  }

  get getDescripcion()
  {
    return this.fomularioPublicacion.controls.descripcion;
  }
  get getNombreUsuario()
  {
    return this.authService.getNombreUsuario;
  }
}
