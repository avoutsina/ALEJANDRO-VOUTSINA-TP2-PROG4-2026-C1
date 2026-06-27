import { Component, inject, signal, WritableSignal} from '@angular/core';
import { PublicacionesUsuario } from '../../services/publicacionesUsuario';
import { Comentario, PublicacionM } from '../../interfaces/publicacion';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { ModificarPublicacion } from '../../Classes/modificar-publicacion';
import { Auth } from '../../services/auth';
import { FormsModule } from '@angular/forms';
import { Loading } from '../components/loading/loading';
import Swal from 'sweetalert2';
import { Router, RouterLink } from '@angular/router';
import { PublicacionItemComponent } from '../components/publicacion-item/publicacion-item';

const LIMIT = 5;

@Component({
  selector: 'app-inicio',
  imports: [TitleCasePipe, DatePipe, FormsModule, Loading, RouterLink, PublicacionItemComponent],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class Inicio
{
  cargando = signal<boolean>(true);
  cargandoMas = signal<boolean>(false);

  private publicacionService = inject(PublicacionesUsuario);
  private authService = inject(Auth);

  publicaciones: WritableSignal<PublicacionM[]> = signal<PublicacionM[]>([]);
  hayMasPublicaciones = signal<boolean>(true);
  offset: number = 0;

  modificarPublicacion : ModificarPublicacion = new ModificarPublicacion();

  mostrarComentarios = signal<string | null>(null);
  paginaActualComentarios : number = 1;
  comentarios = signal<Comentario[]>([]);
  hayMasComentarios = signal<boolean>(true);
  cargandoComentarios = signal<boolean>(false);

  comentario = signal<string>("");
  editando = signal<boolean>(false);
  comentarioPublicado?: Partial<Comentario>;

  ordenar: string = "fecha";

  ngOnInit()
  {
    this.cargando.set(true);
    this.cargandoComentarios.set(false);
    this.hayMasComentarios.set(true);
    this.offset = 0;
    this.publicaciones.set([]);
    this.hayMasPublicaciones.set(true);
    this.traerPublicaciones();
  }

  selecciono()
  {
    this.offset = 0;
    this.publicaciones.set([]);
    this.hayMasPublicaciones.set(true);
    this.cargando.set(true);
    this.traerPublicaciones();
  }

  cargarMasPublicaciones()
  {
    this.offset += LIMIT;
    this.cargandoMas.set(true);
    this.traerPublicaciones(true);
  }

  traerPublicaciones(append: boolean = false)
  {
    if (!append) this.cargando.set(true);
    this.publicacionService.traerPublicaciones(this.ordenar, this.offset, LIMIT).subscribe
    ({
      next: (res) =>
      {
        if (res.length < LIMIT) this.hayMasPublicaciones.set(false);
        if (append)
          this.publicaciones.update(prev => [...prev, ...res]);
        else
          this.publicaciones.set(res);
      },
      error: () =>
      {
        this.cargando.set(false);
        this.cargandoMas.set(false);
      },
      complete: () =>
      {
        this.cargando.set(false);
        this.cargandoMas.set(false);
      }
    });
  }

  likearPublicacion(publicacion: Partial<PublicacionM>)
  {
    this.modificarPublicacion.likearPublicacion(publicacion, this.publicaciones);
  }

  eliminarPublicacion(id: string)
  {
    Swal.fire({
      title: '¿Estás seguro de eliminar?',
      text: 'Si eliminas esta publicación la perderás',
      icon: 'warning',
      showCancelButton: true,
      cancelButtonColor: '#3085d6',
      confirmButtonColor: '#d33',
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.publicacionService.eliminarPublicacion(id).subscribe({
          next: () => {
            this.removerPublicacionDeLista(id);
            Swal.fire({ title: 'Eliminada', icon: 'success' });
          },
          error: (error) => {
            const err = error.error?.message ?? 'Error al eliminar';
            Swal.fire({ title: err, icon: 'error' });
          }
        });
      }
    });
  }

  removerPublicacionDeLista(id: string) {
    this.publicaciones.update(lista => lista.filter(p => p._id !== id));
  }

  mostrarVistaPrevia = signal<boolean>(false)
  publicacion : PublicacionM | null = null;
  verImagen(publicacion: PublicacionM)
  {
    this.mostrarVistaPrevia.set(true);
    this.publicacion = publicacion
  }
  cerrarVistaPrevia()
  {
    this.mostrarVistaPrevia.set(false);
  }

  /////// CRUD COMENTARIOS ///////

  cargarMasComentarios(publicacionId: string)
  {
    this.paginaActualComentarios ++;
    this.traerComentarios(publicacionId);
  }

  traerComentarios(idPublicacion: string)
  {
    this.cargandoComentarios.set(true);
    this.hayMasComentarios.set(true);
    this.publicacionService.traerComentarios(idPublicacion, this.paginaActualComentarios).subscribe
    ({
      next: (res) =>
      {
        if (res.length < 6) this.hayMasComentarios.set(false);
        if (this.paginaActualComentarios === 1)
          this.comentarios.set(res);
        else
          this.comentarios.update(valores => [...valores, ...res]);
      },
      error: (error) =>
      {
        const err = error.error?.message;
        Swal.fire({ title: err, icon: "error", draggable: true });
      },
      complete: () =>
      {
        this.cargandoComentarios.set(false);
      }
    });
  }

  expandirComentarios(id: string)
  {
    if (this.mostrarComentarios() === id) {
      this.contraerComentarios();
      return;
    }
    this.mostrarComentarios.set(id);
    this.paginaActualComentarios = 1;
    this.comentarios.set([]);
    this.traerComentarios(id);
  }

  contraerComentarios()
  {
    this.cargandoComentarios.set(false);
    this.hayMasComentarios.set(false);
    this.mostrarComentarios.set(null);
    this.paginaActualComentarios = 1;
    this.comentarios.set([]);
    this.cancelarEdicion();
  }

  ///////////////COMENTARIO EDICION///////////////
  enviarComentario(publicacion: Partial<PublicacionM>)
  {
    if(this.comentario() !== "" && publicacion._id)
    {
      if(!this.authService.getSub) return;
      this.modificarPublicacion.enviarComentario
      (
        this.comentario(),
        { userId: this.getSub, avatar: this.getAvatar, nombreUsuario: this.getNombreUsuario },
        publicacion
      );
      const comentario =
      {
        usuario: { userId: this.getSub, avatar: this.getAvatar, nombreUsuario: this.getNombreUsuario },
        texto: this.comentario()
      };
      this.comentarios.update(lista => [...lista, comentario]);
      this.comentario.set("");
    }
  }

  editarComentario(comentarioPublicado: Comentario)
  {
    this.comentario.set(comentarioPublicado.texto);
    this.editando.set(true);
    this.comentarioPublicado = comentarioPublicado;
  }

  cancelarEdicion()
  {
    this.comentario.set("");
    this.editando.set(false);
  }

  guardarEdicion(publicacion: PublicacionM)
  {
    this.comentarios.update(lista =>
      lista.map(c =>
        c._id === this.comentarioPublicado!._id ? { ...c, texto: this.comentario() } : c
      )
    );
    if(!this.comentarioPublicado || this.comentario() === "" || this.comentario() === this.comentarioPublicado.texto) return;
    this.modificarPublicacion.editarComentario(this.comentarioPublicado, publicacion, this.comentario())?.subscribe({
      next: (res) => { console.log(res); },
      error: (error) => {
        const err = error.error?.message;
        Swal.fire({ title: err, icon: "error", draggable: true });
      },
      complete: () =>
      {
        this.comentario.set("");
        this.editando.set(false);
      }
    });
  }

  /////////////PROPIEDADES/////////////
  get getSub() { return this.authService.getSub as string; }
  get getAvatar() { return this.authService.getAvatar as string; }
  get getNombreUsuario() { return this.authService.getNombreUsuario as string; }
  get getPermiso() { return this.authService.getPermiso; }
}
