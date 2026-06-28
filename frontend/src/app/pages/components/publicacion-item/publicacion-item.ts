import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PublicacionM, Comentario } from '../../../interfaces/publicacion';
import { PublicacionesUsuario } from '../../../services/publicacionesUsuario';
import { Auth } from '../../../services/auth';
import { ModificarPublicacion } from '../../../Classes/modificar-publicacion';
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
  @Input() mostrarComentariosPorDefecto: boolean = false;
  @Output() eliminar = new EventEmitter<string>();
  @Output() verImagen = new EventEmitter<PublicacionM>();

  private publicacionService = inject(PublicacionesUsuario);
  private authService = inject(Auth);

  modificarPublicacion = new ModificarPublicacion();

  mostrarComentarios = signal<boolean>(false);
  // Precarga comentarios (página 1) cuando la vista padre lo requiera (ej: Mi Perfil)
  ngOnChanges(): void {
    if (this.mostrarComentariosPorDefecto && this.publicacion?._id && !this.mostrarComentarios()) {
      this.editando.set(false);
      this.comentarioPublicado = undefined;
      this.comentario.set('');
      this.hayMasComentarios.set(true);
      this.cargandoComentarios.set(false);

      this.mostrarComentarios.set(true);
      this.paginaActualComentarios = 1;
      this.comentarios.set([]);
      this.traerComentarios();
    }
  }
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
    // Para actualizar la lista de likes en el padre o localmente.
    // Creamos un WritableSignal local/falso o pasamos la lógica
    const localSignal = signal<PublicacionM[]>([this.publicacion]);
    this.modificarPublicacion.likearPublicacion(this.publicacion, localSignal);
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
          if (res.length < 6) this.hayMasComentarios.set(false);
          if (this.paginaActualComentarios === 1) {
            this.comentarios.set(res);
          } else {
            this.comentarios.update((valores) => [...valores, ...res]);
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
    if (this.comentario() !== '') {
      if (!this.authService.getSub) return;
      this.modificarPublicacion.enviarComentario(
        this.comentario(),
        { userId: this.getSub, avatar: this.getAvatar, nombreUsuario: this.getNombreUsuario },
        this.publicacion,
      );
      const comentario = {
        usuario: {
          userId: this.getSub,
          avatar: this.getAvatar,
          nombreUsuario: this.getNombreUsuario,
        },
        texto: this.comentario(),
      };
      this.comentarios.update((lista) => [...lista, comentario]);
      this.comentario.set('');
    }
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
    this.comentarios.update((lista) =>
      lista.map((c) =>
        c._id === this.comentarioPublicado!._id ? { ...c, texto: this.comentario() } : c,
      ),
    );
    if (
      !this.comentarioPublicado ||
      this.comentario() === '' ||
      this.comentario() === this.comentarioPublicado.texto
    )
      return;
    this.modificarPublicacion
      .editarComentario(this.comentarioPublicado, this.publicacion, this.comentario())
      ?.subscribe({
        next: (res) => {
          console.log(res);
        },
        error: (error) => {
          const err = error.error?.message;
          Swal.fire({ title: err, icon: 'error', draggable: true });
        },
        complete: () => {
          this.comentario.set('');
          this.editando.set(false);
        },
      });
  }

  abrirVistaPrevia() {
    this.verImagen.emit(this.publicacion);
  }
}
