import { Component, inject} from '@angular/core';
import { Auth } from '../../services/auth';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PublicacionesUsuario } from '../../services/publicacionesUsuario';
import { UpperCasePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-publicaciones',
  imports: [ReactiveFormsModule, UpperCasePipe, RouterLink],
  templateUrl: './publicacion.html',
  styleUrl: './publicaciones.css',
})
export class Publicacion
{
  authService = inject(Auth);
  userService = inject(PublicacionesUsuario);
  router = inject(Router);

  archivoSeleccionado: File | null = null;
  reviewUrl: string | null = null;

  fomularioPublicacion = new FormGroup
  ({
    titulo: new FormControl("", [Validators.required, Validators.minLength(3), Validators.maxLength(80)]),
    descripcion: new FormControl("", [Validators.maxLength(100)]),
  });

  onArchivoSeleccionado(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.archivoSeleccionado = file;
    this.reviewUrl = URL.createObjectURL(file);
  }

  crearPublicacion()
  {
    if (!this.fomularioPublicacion.valid) return;

    const userId = this.authService.getSub as string;
    const descripcion = this.fomularioPublicacion.controls.descripcion.value as string;
    const titulo = this.fomularioPublicacion.controls.titulo.value as string;
    const nombreUsuario = this.authService.getNombreUsuario as string;
    const avatar = this.authService.getAvatar as string;

    this.userService.crearPublicacion(
      { titulo, userId, descripcion, nombreUsuario, avatar },
      this.archivoSeleccionado
    ).subscribe(
      {
        next: (res) =>
        {
          console.log(res);
        },
        error: (error) =>
        {
          const err = error.error?.message ?? 'Error al publicar';
          Swal.fire({ title: err, icon: "error", draggable: true });
        },
        complete: () =>
        {
          Swal.fire({ title: "Publicado con exito", icon: "success", draggable: true })
            .then(result =>
            {
              if(result.isDismissed || result.isConfirmed)
              {
                this.router.navigateByUrl("/inicio");
              }
            });
        }
      });
  }

  get getTitulo() { return this.fomularioPublicacion.controls.titulo; }
  get getDescripcion() { return this.fomularioPublicacion.controls.descripcion; }
  get getNombreUsuario() { return this.authService.getNombreUsuario; }
}
