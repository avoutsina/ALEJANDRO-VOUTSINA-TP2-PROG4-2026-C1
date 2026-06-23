import { Component, inject, signal, WritableSignal} from '@angular/core';
import { PublicacionesUsuario } from '../../services/publicacionesUsuario';
import { Comentario, PublicacionM } from '../../interfaces/publicacion';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { ModificarPublicacion } from '../../Classes/modificar-publicacion';
import { Auth } from '../../services/auth';
import { FormsModule } from '@angular/forms';
import { Loading } from '../components/loading/loading';
import Swal from 'sweetalert2';
import { UsuarioR } from '../../interfaces/usuario';
import { TraerUsuarioClass } from '../../Classes/traerUsuario';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-inicio',
  imports: [TitleCasePipe, DatePipe, FormsModule, Loading, RouterLink],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class Inicio
{

  cargando = signal<boolean>(true);

  private publicacionService = inject(PublicacionesUsuario);
  private authService = inject(Auth);

  publicaciones: WritableSignal<PublicacionM[]> = signal<PublicacionM[]>([]);
  modificarPublicacion : ModificarPublicacion = new ModificarPublicacion();

  mostrarComentarios = signal<string | null>(null);
  paginaActual : number = 1;
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
    this.traerPublicaciones(this.ordenar);
  }

  selecciono()
  {
    this.traerPublicaciones(this.ordenar);
  }

  traerPublicaciones(sort: string)
  {
    this.cargando.set(true);
    this.publicacionService.traerPublicaciones(sort).subscribe
    ({
      next: (res) =>
      {
        this.publicaciones.set(res);
      },
      error: () =>
      {
        this.cargando.set(false);
      },
      complete: () =>
      {
        this.cargando.set(false);
      }
    });
  }

  likearPublicacion(publicacion: Partial<PublicacionM>)
  {
    this.modificarPublicacion.likearPublicacion(publicacion, this.publicaciones);
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

  cargarMas(publicacionId: string)
  {
    this.paginaActual ++;
    this.traerComentarios(publicacionId);
  }
  traerComentarios(idPublicacion: string)
  {
    this.cargandoComentarios.set(true);
    this.hayMasComentarios.set(true);
    this.publicacionService.traerComentarios(idPublicacion, this.paginaActual).subscribe
    ({
      next: (res) =>
      {
        console.log(res);
        if (res.length < 6)
        {
          this.hayMasComentarios.set(false);
        }
        //Logica de paginación
        if (this.paginaActual === 1)
        {
          this.comentarios.set(res);
        }
        else
        {
          //Agrega lo nuevo a lo viejo
          this.comentarios.update(valores => [...valores, ...res]);
        }
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
        this.cargandoComentarios.set(false);
      }
    });
  }

  expandirComentarios(id: string)
  {
    this.mostrarComentarios.set(this.mostrarComentarios() === id ? null : id);
    this.traerComentarios(id);
  }
  contraerComentarios()
  {
    this.cargandoComentarios.set(false);
    this.hayMasComentarios.set(false);
    this.mostrarComentarios.set(null);
    this.paginaActual = 1;
    this.comentarios.set([])
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
        {
          userId: this.getSub,
          avatar: this.getAvatar, 
          nombreUsuario: this.getNombreUsuario
        }, publicacion
      );
      const comentario =
      {
        usuario:
        {
          userId: this.getSub,
          avatar: this.getAvatar,
          nombreUsuario: this.getNombreUsuario
        },
        texto: this.comentario()
      }
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
        c._id === this.comentarioPublicado!._id
          ? { ...c, texto: this.comentario() }
          : c
      )
    );
    
    if(!this.comentarioPublicado || this.comentario() === "" || this.comentario() === this.comentarioPublicado.texto) return;
    this.modificarPublicacion.editarComentario(this.comentarioPublicado, publicacion, this.comentario())?.subscribe({
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
        this.comentario.set("");
        this.editando.set(false);
      }
    });
  }

  /////////////PROPIEDADES/////////////
  get getSub()
  {
    return this.authService.getSub as string;
  }
  get getAvatar()
  {
    return this.authService.getAvatar as string;
  }
  get getNombreUsuario()
  {
    return this.authService.getNombreUsuario as string;
  }
}
