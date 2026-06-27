import { PartialType } from '@nestjs/mapped-types';
import { CreatePublicacioneDto } from './create-publicaciones.dto';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { Comentario } from '../entities/comentario';

export class UpdatePublicacioneDto extends PartialType(CreatePublicacioneDto)
{
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    meGusta?: number;

    @IsString({ each: true })
    @IsOptional()
    meGustaId!: string[];

    @IsOptional()
    comentarios!: Comentario[];
}
