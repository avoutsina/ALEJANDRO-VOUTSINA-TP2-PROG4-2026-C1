import { IsBoolean, IsDefined, IsIn, IsString, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateUsuarioDto
{
    @IsString()
    @IsDefined()
    nombre!:string;
   
    @IsString()
    @IsDefined()
    apellido!: string;

    @IsString()
    @IsDefined()
    correo!: string;

    @IsString()
    @IsDefined()
    nombreUsuario!: string;

    @IsString()
    @IsDefined()
    contrasenia!: string;

    @IsString()
    @IsOptional()
    descripcion!: string;

    @Transform(({ value }) => new Date(value))
    @IsDefined()
    fechaDeNacimiento!: Date;

    @IsString()
    @IsOptional()
    avatar?: string;

    @Transform(({ value }) => value === 'true' || value === true)
    @IsBoolean()
    @IsDefined()
    admin!: boolean;

    @Transform(({ value }) => value === 'true' || value === true)
    @IsBoolean()
    @IsOptional()
    baneado?: boolean;
}
