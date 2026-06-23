import { inject } from "@angular/core";
import { UsuariosService } from "../services/usuariosService";
import { UsuarioR } from "../interfaces/usuario";
import { Observable } from "rxjs";

export class TraerUsuarioClass
{
    usuarioService = inject(UsuariosService);

    traerUsuario(id: string) : Observable<Partial<UsuarioR>>
    {
        return this.usuarioService.traerUsuario(id)
    }
}