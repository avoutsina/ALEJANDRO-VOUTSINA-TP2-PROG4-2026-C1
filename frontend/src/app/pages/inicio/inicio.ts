import { Component, inject, signal, WritableSignal} from '@angular/core';
import { PublicacionesUsuario } from '../../services/publicacionesUsuario';
import { Comentario, PublicacionM } from '../../interfaces/publicacion';
import { DatePipe, TitleCasePipe } from '@angular/common';
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

  modificarPublicacion : any = null; // Kept for template compatibility, not used

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
    if (!publicacion._id) return;
    const userId = this.authService.getSub;
    if (!userId) return;

    const meGustaId = publicacion.meGustaId ?? [];
    const yaDioLike = meGustaId.includes(userId);
    const request = yaDioLike
      ? this.publicacionService.quitarLike(publicacion._id)
      : this.publicacionService.darLike(publicacion._id);

    request.subscribe({
      next: (pubActualizada) => {
        this.publicaciones.update(lista =>
          lista.map(p => p._id === pubActualizada._id
            ? { ...p, meGusta: pubActualizada.meGusta, meGustaId: pubActualizada.meGustaId }
            : p
          )
        );
      }
    });
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
        const lista = res.comentarios;
        if (lista.length < 6) this.hayMasComentarios.set(false);
        if (this.paginaActualComentarios === 1)
          this.comentarios.set(lista);
        else
          this.comentarios.update(valores => [...valores, ...lista]);
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
    const texto = this.comentario().trim();
    if(!texto || !publicacion._id) return;
    if(!this.authService.getSub) return;

    const usuario = {
      userId: this.getSub,
      avatar: this.getAvatar,
      nombreUsuario: this.getNombreUsuario
    };

    this.publicacionService.agregarComentario(publicacion._id, texto, usuario).subscribe({
      next: (comentarioNuevo) =>
      {
        this.comentarios.update(lista => [comentarioNuevo, ...lista]);
        this.comentario.set("");
      },
      error: (err) =>
      {
        Swal.fire({ title: err.error?.message ?? 'Error al comentar', icon: 'error', draggable: true });
      }
    });
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
    if(!this.comentarioPublicado || !this.comentarioPublicado._id || this.comentario() === "" || this.comentario() === this.comentarioPublicado.texto) return;

    const textoNuevo = this.comentario();
    this.publicacionService.editarComentario(publicacion._id, this.comentarioPublicado._id!, textoNuevo).subscribe({
      next: (comentarioActualizado) =>
      {
        this.comentarios.update(lista =>
          lista.map(c =>
            c._id === comentarioActualizado._id
              ? { ...c, texto: comentarioActualizado.texto, modificado: true }
              : c
          )
        );
        this.comentario.set("");
        this.editando.set(false);
        this.comentarioPublicado = undefined;
      },
      error: (error) =>
      {
        const err = error.error?.message;
        Swal.fire({ title: err, icon: "error", draggable: true });
      }
    });
  }

  /////////////PROPIEDADES/////////////
  get getSub() { return this.authService.getSub as string; }
  get getAvatar() { return this.authService.getAvatar as string; }
  get getNombreUsuario() { return this.authService.getNombreUsuario as string; }
  get getPermiso() { return this.authService.getPermiso; }
}
