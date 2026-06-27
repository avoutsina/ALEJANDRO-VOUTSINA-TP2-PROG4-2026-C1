import { Type } from "class-transformer";
import { IsDefined, IsNumber, IsOptional, IsString } from "class-validator";
import { Comentario } from "../entities/comentario";

export class CreatePublicacioneDto
{
    @IsString()
    @IsDefined()
    titulo!: string;

    @IsString()
    @IsDefined()
    userId!: string;

    @IsString()
    @IsOptional()
    urlImg!: string;

    @IsString()
    @IsOptional()
    descripcion!: string;

    @IsString()
    @IsDefined()
    nombreUsuario!: string;

    @IsString()
    avatar!: string;

    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    meGusta!: number;

    @IsString()
    @IsOptional({ each: true })
    meGustaId!: string[];

    @IsOptional()
    comentarios!: Comentario[];
}
