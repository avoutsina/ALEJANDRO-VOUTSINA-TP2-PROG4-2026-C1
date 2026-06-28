import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PublicacionM, Comentario } from '../../../interfaces/publicacion';
import { PublicacionesUsuario } from '../../../services/publicacionesUsuario';
import { Auth } from '../../../services/auth';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-publicacion-item',
  standalone: true,
  imports: [TitleCasePipe, DatePipe, FormsModule, RouterLink],
  templateUrl: './publicacion-item.html',
  styleUrl: './publicacion-item.css',
})
export class PublicacionItemComponent {
  @Input() publicacion!: PublicacionM;
  @Output() eliminar = new EventEmitter<string>();
  @Output() verImagen = new EventEmitter<PublicacionM>();

  private publicacionService = inject(PublicacionesUsuario);
  private authService = inject(Auth);

  mostrarComentarios = signal<boolean>(false);
  paginaActualComentarios = 1;
  comentarios = signal<Comentario[]>([]);
  hayMasComentarios = signal<boolean>(true);
  cargandoComentarios = signal<boolean>(false);

  comentario = signal<string>('');
  editando = signal<boolean>(false);
  comentarioPublicado?: Partial<Comentario>;

  get getSub() {
    return this.authService.getSub as string;
  }
  get getAvatar() {
    return this.authService.getAvatar as string;
  }
  get getNombreUsuario() {
    return this.authService.getNombreUsuario as string;
  }
  get getPermiso() {
    return this.authService.getPermiso;
  }

  likear() {
    if (!this.publicacion?._id) return;
    const userId = this.authService.getSub;
    if (!userId) return;

    const yaDioLike = this.publicacion.meGustaId?.includes(userId);
    const request = yaDioLike
      ? this.publicacionService.quitarLike(this.publicacion._id)
      : this.publicacionService.darLike(this.publicacion._id);

    request.subscribe({
      next: (res) => {
        this.publicacion = {
          ...this.publicacion,
          meGusta: res.meGusta,
          meGustaId: res.meGustaId,
        };
      },
      error: (error) => {
        const err = error.error?.message ?? 'Error al actualizar like';
        Swal.fire({ title: err, icon: 'error', draggable: true });
      },
    });
  }

  eliminarPublicacion() {
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
        this.publicacionService.eliminarPublicacion(this.publicacion._id).subscribe({
          next: () => {
            this.eliminar.emit(this.publicacion._id);
            Swal.fire({ title: 'Eliminada', icon: 'success' });
          },
          error: (error) => {
            const err = error.error?.message ?? 'Error al eliminar';
            Swal.fire({ title: err, icon: 'error' });
          },
        });
      }
    });
  }

  expandirComentarios() {
    if (this.mostrarComentarios()) {
      this.contraerComentarios();
      return;
    }
    this.mostrarComentarios.set(true);
    this.paginaActualComentarios = 1;
    this.comentarios.set([]);
    this.traerComentarios();
  }

  contraerComentarios() {
    this.cargandoComentarios.set(false);
    this.hayMasComentarios.set(false);
    this.mostrarComentarios.set(false);
    this.paginaActualComentarios = 1;
    this.comentarios.set([]);
    this.cancelarEdicion();
  }

  cargarMasComentarios() {
    this.paginaActualComentarios++;
    this.traerComentarios();
  }

  traerComentarios() {
    this.cargandoComentarios.set(true);
    this.hayMasComentarios.set(true);
    this.publicacionService
      .traerComentarios(this.publicacion._id, this.paginaActualComentarios)
      .subscribe({
        next: (res) => {
          const lista = res.comentarios;
          if (lista.length < 3) this.hayMasComentarios.set(false);
          if (this.paginaActualComentarios === 1) {
            this.comentarios.set(lista);
          } else {
            this.comentarios.update((valores) => [...valores, ...lista]);
          }
        },
        error: (error) => {
          const err = error.error?.message;
          Swal.fire({ title: err, icon: 'error', draggable: true });
        },
        complete: () => {
          this.cargandoComentarios.set(false);
        },
      });
  }

  enviarComentario() {
    const texto = this.comentario().trim();
    if (!texto) return;
    if (!this.authService.getSub) return;

    const usuario = {
      userId: this.getSub,
      avatar: this.getAvatar,
      nombreUsuario: this.getNombreUsuario,
    };

    this.publicacionService.agregarComentario(this.publicacion._id, texto, usuario).subscribe({
      next: (comentarioNuevo) => {
        this.comentarios.update((lista) => [comentarioNuevo, ...lista]);
        this.comentario.set('');
      },
      error: (err) => {
        Swal.fire({ title: err.error?.message ?? 'Error al comentar', icon: 'error', draggable: true });
      }
    });
  }

  editarComentario(comentarioPublicado: Comentario) {
    this.comentario.set(comentarioPublicado.texto);
    this.editando.set(true);
    this.comentarioPublicado = comentarioPublicado;
  }

  cancelarEdicion() {
    this.comentario.set('');
    this.editando.set(false);
  }

  guardarEdicion() {
    if (
      !this.comentarioPublicado ||
      !this.comentarioPublicado._id ||
      this.comentario() === '' ||
      this.comentario() === this.comentarioPublicado.texto
    ) return;

    const textoNuevo = this.comentario();

    this.publicacionService
      .editarComentario(this.publicacion._id, this.comentarioPublicado._id!, textoNuevo)
      .subscribe({
        next: (comentarioActualizado) => {
          this.comentarios.update((lista) =>
            lista.map((c) =>
              c._id === comentarioActualizado._id
                ? { ...c, texto: comentarioActualizado.texto, modificado: true }
                : c,
            ),
          );
          this.comentario.set('');
          this.editando.set(false);
          this.comentarioPublicado = undefined;
        },
        error: (error) => {
          const err = error.error?.message;
          Swal.fire({ title: err, icon: 'error', draggable: true });
        },
      });
  }

  abrirVistaPrevia() {
    this.verImagen.emit(this.publicacion);
  }
}
