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
        if(!publicacion.meGustaId)
        {
            publicacion.meGustaId = [];
        }

        let meGustaTotal = publicacion.meGusta?? 0;

        const userId = this.authService.getSub;
        if(!userId) return;

        const indexEncontrado = publicacion.meGustaId.indexOf(userId);
        const yaDioLike = indexEncontrado !== -1;

        if (!yaDioLike)
        {
            meGustaTotal++;
            publicacion.meGustaId.push(userId);
        }
        else
        {
            if(meGustaTotal > 0)
            {
                meGustaTotal--;
            }
            publicacion.meGustaId?.splice(indexEncontrado, 1);
        }

        if(!publicacion._id) return;
        
        this.publicacionService.modificarPublicacion(publicacion._id, { meGusta: meGustaTotal, meGustaId: publicacion.meGustaId}).subscribe(res => 
        {
            console.log(res);
        });
        publicacionesSignal.update(lista =>
        {
            for (const publicacionSignal of lista)
                {
                    if (publicacionSignal._id === publicacion._id)
                        {
                            publicacion.meGusta = meGustaTotal;
                            break;
                        }
                    }
                    return lista;
        });
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
