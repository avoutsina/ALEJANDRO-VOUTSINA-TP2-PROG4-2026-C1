import { Component, inject, signal, WritableSignal } from '@angular/core';
import { PublicacionesUsuario } from '../../services/publicacionesUsuario';
import { Comentario, PublicacionM } from '../../interfaces/publicacion';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute} from '@angular/router';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { Auth } from '../../services/auth';
import Swal from 'sweetalert2';
import { ModificarPublicacion } from '../../Classes/modificar-publicacion';
import { Loading } from '../components/loading/loading';
import { UsuarioR } from '../../interfaces/usuario';
import { UsuariosService } from '../../services/usuariosService';
import { TraerUsuarioClass } from '../../Classes/traerUsuario';
import { PublicacionItemComponent } from '../components/publicacion-item/publicacion-item';

@Component({
  selector: 'app-perfil',
  imports: [ReactiveFormsModule, TitleCasePipe, DatePipe, FormsModule, Loading, PublicacionItemComponent],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil {
  cargando = signal<boolean>(true);

  route = inject(ActivatedRoute);
  publicacionesService = inject(PublicacionesUsuario);
  authService = inject(Auth);

  // Últimas 3 publicaciones con comentarios precargados
  misPublicaciones: WritableSignal<PublicacionM[]> = signal<PublicacionM[]>([]);
  modificarPublicacion: ModificarPublicacion = new ModificarPublicacion();
  hayMasPublicaciones = signal<boolean>(true);
  paginaActual: number = 1;

  usuarioSeleccionado: string | null = null;
  seleccionoUsuario = signal<boolean>(false);

  async ngOnInit() {
    this.cargando.set(true);
    this.misPublicaciones.set([]);
    this.hayMasPublicaciones.set(true);
    this.cargandoComentarios.set(false);
    this.hayMasComentarios.set(true);

    this.usuarioSeleccionado = this.route.snapshot.paramMap.get('id') || this.getSub;
    this.seleccionoUsuario.set(this.usuarioSeleccionado !== this.getSub);

    if (this.usuarioSeleccionado) {
      await this.traerUsuario();
    }

    this.traerMisPublicaciones();
  }

  ngOnDestroy() {
    this.usuarioSeleccionado = null;
    this.seleccionoUsuario.set(false);
    this.usuario.set(null);
  }

  cargarMas() {
    this.paginaActual++;
    this.traerMisPublicaciones();
  }

  traerMisPublicaciones() {
    let userId = this.getSub;
    if (this.seleccionoUsuario()) {
      userId = this.usuario()?._id as string;
    }
    const peticion = this.publicacionesService.traerMisPublicaciones(userId, this.paginaActual);
    peticion.subscribe({
      next: (res) => {
        if (res.length < 3) {
          this.hayMasPublicaciones.set(false);
        }
        if (this.paginaActual === 1) {
          this.misPublicaciones.set(res);
        } else {
          this.misPublicaciones.update((valores) => [...valores, ...res]);
        }
      },
      error: (error) => {
        const err = error.error?.message ?? 'Error al cargar publicaciones';
        Swal.fire({ title: err, icon: 'error', draggable: true });
      },
      complete: () => {
        this.cargando.set(false);
      },
    });
  }

  likearPublicacion(publicacion: Partial<PublicacionM>) {
    this.modificarPublicacion.likearPublicacion(publicacion, this.misPublicaciones);
  }

  eliminarPublicacion(_id: string) {
    Swal.fire({
      title: '¿Estas seguro de eliminar?',
      text: 'Si eliminas esta publicacion la perderas',
      icon: 'warning',
      showCancelButton: true,
      cancelButtonColor: '#3085d6',
      confirmButtonColor: '#d33',
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        const peticion = this.publicacionesService.eliminarPublicacion(_id);
        peticion.subscribe({
          next: () => {
            this.removerPublicacionDeLista(_id);
          },
          error: (error) => {
            const err = error.error?.message ?? 'Error al eliminar';
            Swal.fire({ title: err, icon: 'error', draggable: true });
          },
          complete: () => {
            Swal.fire({ title: 'Eliminada', text: 'Publicacion eliminada con exito', icon: 'success' });
          },
        });
      }
    });
  }

  removerPublicacionDeLista(id: string) {
    this.misPublicaciones.update(lista => lista.filter(p => p._id !== id));
  }

  /////// CRUD COMENTARIOS ///////
  mostrarComentarios = signal<string | null>(null);
  comentario = signal<string>('');
  editando = signal<boolean>(false);
  comentarioPublicado?: Partial<Comentario>;

  paginaActualComentarios: number = 1;
  comentarios = signal<Comentario[]>([]);
  hayMasComentarios = signal<boolean>(true);
  cargandoComentarios = signal<boolean>(false);

  cargarMasComentarios(publicacionId?: string) {
    this.paginaActualComentarios++;
    this.hayMasComentarios.set(true);
    if (!publicacionId) return;
    this.traerComentarios(publicacionId);
  }

  traerComentarios(publicacionId: string) {
    this.cargandoComentarios.set(true);
    this.hayMasComentarios.set(true);
    this.publicacionesService.traerComentarios(publicacionId, this.paginaActualComentarios).subscribe({
      next: (res) => {
        if (res.length < 6) {
          this.hayMasComentarios.set(false);
        }
        if (this.paginaActualComentarios === 1) {
          this.comentarios.set(res);
        } else {
          this.comentarios.update((valores) => [...valores, ...res]);
        }
      },
      error: (error) => {
        const err = error.error?.message ?? 'Error';
        Swal.fire({ title: err, icon: 'error', draggable: true });
      },
      complete: () => {
        this.cargandoComentarios.set(false);
      },
    });
  }

  enviarComentario(publicacion: Partial<PublicacionM> | null) {
    if (this.comentario() !== '' && publicacion) {
      if (!this.authService.getSub) return;
      this.modificarPublicacion.enviarComentario(
        this.comentario(),
        { userId: this.getSub, avatar: this.getAvatar, nombreUsuario: this.getNombreUsuario },
        publicacion,
      );
      const comentario = {
        usuario: { userId: this.getSub, avatar: this.getAvatar, nombreUsuario: this.getNombreUsuario },
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

  guardarEdicion(publicacion: PublicacionM | null) {
    this.comentarios.update((lista) =>
      lista.map((c) =>
        c._id === this.comentarioPublicado!._id ? { ...c, texto: this.comentario() } : c,
      ),
    );
    if (!this.comentarioPublicado || this.comentario() === '' || this.comentario() === this.comentarioPublicado.texto) return;
    if (!publicacion) return;
    this.modificarPublicacion.editarComentario(this.comentarioPublicado, publicacion, this.comentario())?.subscribe({
      next: (res) => { console.log(res); },
      error: (error) => {
        const err = error.error?.message ?? 'Error';
        Swal.fire({ title: err, icon: 'error', draggable: true });
      },
      complete: () => {
        this.comentario.set('');
        this.editando.set(false);
      },
    });
  }

  /////////////////////////////////////////////////////////
  mostrarVistaPrevia = signal<boolean>(false);
  publicacion: PublicacionM | null = null;

  verImagen(publicacion: PublicacionM) {
    this.comentarios.set([]);
    this.paginaActualComentarios = 1;
    this.mostrarVistaPrevia.set(true);
    this.publicacion = publicacion;
    this.mostrarComentarios.set(publicacion._id);
    this.traerComentarios(publicacion._id);
  }

  cerrarVistaPrevia() {
    this.mostrarVistaPrevia.set(false);
    this.mostrarComentarios.set(null);
  }

  /////////////PROPIEDADES/////////////
  get getSub() { return this.authService.getSub as string; }
  get getAvatar() { return this.authService.getAvatar as string; }
  get getNombreUsuario() { return this.authService.getNombreUsuario as string; }
  get getPermiso() { return this.authService.getPermiso; }

  /////////////////////////////////////////////////////////////////////
  ////////////////////////////TRAER UN USUARIO////////////////////////
  usuario = signal<Partial<UsuarioR> | null>(null);
  traerUsuariosClass: TraerUsuarioClass = new TraerUsuarioClass();

  traerUsuario(): Promise<void> {
    if (!this.usuarioSeleccionado) return Promise.resolve();
    return new Promise((resolve) => {
      this.traerUsuariosClass.traerUsuario(this.usuarioSeleccionado!).subscribe({
        next: (res) => {
          this.usuario.set(res);
          resolve();
        },
        error: (error) => {
          const err = error.error?.message ?? 'Error al cargar usuario';
          Swal.fire({ title: err, icon: 'error', draggable: true });
          resolve();
        },
      });
    });
  }

  // Helper: datos del usuario actual o visitado
  get datosUsuario(): Partial<UsuarioR> | null {
    return this.seleccionoUsuario() ? this.usuario() : null;
  }
}
