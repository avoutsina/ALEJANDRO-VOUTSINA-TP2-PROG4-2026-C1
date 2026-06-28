import { UsuarioC } from "./usuario";

export interface Publicacion
{
    titulo: string;
    userId : string;
    urlImg ?: string;
    descripcion: string;
    nombreUsuario: string;
    avatar: string;
}
export interface PublicacionM
{
    _id: string
    titulo: string;
    userId : string;
    urlImg : string;
    descripcion: string;
    nombreUsuario: string;
    avatar: string;
    meGusta?: number
    meGustaId: string[]
    comentarios: Comentario[];
    eliminado?: boolean;
    created_at: number
}

export interface Comentario
{
    _id?: string;
    usuario: UsuarioC;
    texto : string;
}
export interface ComentarioCount
{
    userId: string;
    nombreUsuario: string;
    cantidadComentarios: number;
}

export interface PublicacionCount
{
  userId: string;
  nombreUsuario: string;
  cantidadPublicaciones: number;
}