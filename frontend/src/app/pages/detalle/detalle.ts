import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PublicacionesUsuario } from '../../services/publicacionesUsuario';
import { Auth } from '../../services/auth';
import { PublicacionM, Comentario } from '../../interfaces/publicacion';
import { Loading } from '../components/loading/loading';
import Swal from 'sweetalert2';

const COMENTARIOS_POR_PAGINA = 6;

@Component({
  selector: 'app-detalle',
  standalone: true,
  imports: [DatePipe, TitleCasePipe, FormsModule, RouterLink, Loading],
  templateUrl: './detalle.html',
  styleUrl: './detalle.css',
})
export class DetallePage implements OnInit
{
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private publicacionService = inject(PublicacionesUsuario);
  private authService = inject(Auth);

  publicacion = signal<PublicacionM | null>(null);
  cargando = signal<boolean>(true);

  comentarios = signal<Comentario[]>([]);
  cargandoComentarios = signal<boolean>(false);
  hayMasComentarios = signal<boolean>(true);
  paginaActual = 1;
  totalComentarios = 0;

  nuevoComentario = signal<string>('');
  editando = signal<boolean>(false);
  comentarioEditando: Partial<Comentario> | null = null;

  ngOnInit(): void
  {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigateByUrl('/inicio');
      return;
    }
    this.cargarPublicacion(id);
  }

  cargarPublicacion(id: string): void
  {
    this.cargando.set(true);
    this.publicacionService.traerPublicacionPorId(id).subscribe({
      next: (pub) =>
      {
        this.publicacion.set(pub);
        this.cargarComentarios(id, true);
      },
      error: () =>
      {
        Swal.fire({ title: 'Publicación no encontrada', icon: 'error' });
        this.router.navigateByUrl('/inicio');
      },
      complete: () => this.cargando.set(false)
    });
  }

  cargarComentarios(id: string, reiniciar: boolean = false): void
  {
    if (reiniciar)
    {
      this.paginaActual = 1;
      this.comentarios.set([]);
      this.hayMasComentarios.set(true);
    }
    this.cargandoComentarios.set(true);
    this.publicacionService.traerComentarios(id, this.paginaActual).subscribe({
      next: (res) =>
      {
        this.totalComentarios = res.total;
        const nuevos = res.comentarios;
        if (nuevos.length < COMENTARIOS_POR_PAGINA) this.hayMasComentarios.set(false);
        if (this.paginaActual === 1)
          this.comentarios.set(nuevos);
        else
          this.comentarios.update(prev => [...prev, ...nuevos]);
      },
      error: () => this.cargandoComentarios.set(false),
      complete: () => this.cargandoComentarios.set(false)
    });
  }

  cargarMasComentarios(): void
  {
    const pub = this.publicacion();
    if (!pub) return;
    this.paginaActual++;
    this.cargarComentarios(pub._id, false);
  }

  enviarComentario(): void
  {
    const texto = this.nuevoComentario().trim();
    const pub = this.publicacion();
    if (!texto || !pub) return;

    const usuario = {
      userId: this.authService.getSub as string,
      nombreUsuario: this.authService.getNombreUsuario as string,
      avatar: this.authService.getAvatar as string,
    };

    this.publicacionService.agregarComentario(pub._id, texto, usuario).subscribe({
      next: (comentarioNuevo) =>
      {
        // Agregar el comentario retornado por el server (con _id real)
        this.comentarios.update(lista => [comentarioNuevo, ...lista]);
        this.nuevoComentario.set('');
        this.totalComentarios++;
      },
      error: (err) =>
      {
        Swal.fire({ title: err.error?.message ?? 'Error al comentar', icon: 'error' });
      }
    });
  }

  iniciarEdicion(comentario: Comentario): void
  {
    if (comentario.usuario.userId !== this.authService.getSub) return;
    this.comentarioEditando = comentario;
    this.nuevoComentario.set(comentario.texto);
    this.editando.set(true);
  }

  cancelarEdicion(): void
  {
    this.comentarioEditando = null;
    this.nuevoComentario.set('');
    this.editando.set(false);
  }

  guardarEdicion(): void
  {
    const pub = this.publicacion();
    const textoNuevo = this.nuevoComentario().trim();
    if (!pub || !this.comentarioEditando?._id || !textoNuevo) return;

    this.publicacionService.editarComentario(pub._id, this.comentarioEditando._id!, textoNuevo).subscribe({
      next: (comentarioActualizado) =>
      {
        this.comentarios.update(lista =>
          lista.map(c =>
            c._id === comentarioActualizado._id
              ? { ...c, texto: comentarioActualizado.texto, modificado: true }
              : c
          )
        );
        this.cancelarEdicion();
      },
      error: (err) =>
      {
        Swal.fire({ title: err.error?.message ?? 'Error al editar', icon: 'error' });
      }
    });
  }

  get getSub() { return this.authService.getSub as string; }
  get getAvatar() { return this.authService.getAvatar as string; }
  get getPermiso() { return this.authService.getPermiso; }
}
