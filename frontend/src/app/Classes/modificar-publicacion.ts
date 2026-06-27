import { inject, WritableSignal } from "@angular/core";
import { PublicacionesUsuario } from "../services/publicacionesUsuario";
import { Comentario, PublicacionM } from "../interfaces/publicacion";
import { Auth } from "../services/auth";
import { UsuarioC} from "../interfaces/usuario";
import { Observable } from "rxjs";

export class ModificarPublicacion
{
    private publicacionService = inject(PublicacionesUsuario);
    private authService = inject(Auth);

    likearPublicacion(publicacion: Partial<PublicacionM>, publicacionesSignal: WritableSignal<PublicacionM[]>)
    {
        if(!publicacion._id) return;
        if(!publicacion.meGustaId) publicacion.meGustaId = [];

        const userId = this.authService.getSub;
        if(!userId) return;

        const yaDioLike = publicacion.meGustaId.includes(userId);

        const actualizarSignal = (pubActualizada: PublicacionM) => {
            publicacionesSignal.update(lista =>
                lista.map(p => p._id === pubActualizada._id ? { ...p, meGusta: pubActualizada.meGusta, meGustaId: pubActualizada.meGustaId } : p)
            );
        };

        if (!yaDioLike)
        {
            this.publicacionService.darLike(publicacion._id).subscribe({ next: actualizarSignal });
        }
        else
        {
            this.publicacionService.quitarLike(publicacion._id).subscribe({ next: actualizarSignal });
        }
    }

    enviarComentario(comentario: string, usuario: UsuarioC, publicacion: Partial<PublicacionM>)
    {
        if(publicacion._id)
        {
            publicacion.comentarios?.push
            ({
                usuario: usuario,
                texto: comentario
            })
            this.publicacionService.modificarPublicacion(publicacion._id, {comentarios: publicacion.comentarios}).subscribe(res => 
            {
                console.log(res);
            });
        }
    } 

    editarComentario(comentarioPublicado: Partial<Comentario>, publicacion: PublicacionM, nuevoComentario: string): Observable<PublicacionM> | void
    {
        if(comentarioPublicado.usuario?.userId !== this.authService.getSub) return;

        let index = -1;

        if (comentarioPublicado._id)
        {
            index = publicacion.comentarios.findIndex(c => c._id === comentarioPublicado._id);
        }
        if (index === -1) return;

        publicacion.comentarios[index].texto = nuevoComentario;
        return this.publicacionService.modificarPublicacion(publicacion._id, {comentarios: publicacion.comentarios})
    }
}
