export interface UsuarioL
{
  correo: string;
  contrasenia: string;
}
export interface UsuarioR
{
    _id: string;
    nombre : string;
    apellido : string;
    correo : string;
    nombreUsuario : string;
    contrasenia : string;
    descripcion : string;
    fechaDeNacimiento: Date;
    avatar: string;
    admin: boolean;
    baneado: boolean;
}

export interface UsuarioC
{
    userId : string;
    nombreUsuario : string;
    avatar: string;
}