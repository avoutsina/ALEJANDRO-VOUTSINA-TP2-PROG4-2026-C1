import { IsNotEmpty, IsString } from "class-validator";

export class CredencialesDto
{
    @IsString()
    @IsNotEmpty()
    correo : string;

    @IsString()
    @IsNotEmpty()
    contrasenia : string;
}