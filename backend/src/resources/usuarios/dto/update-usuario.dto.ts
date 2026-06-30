import { PartialType } from '@nestjs/mapped-types';
import { CreateUsuarioDto } from './create-usuario.dto';
import { IsBoolean, IsDefined } from 'class-validator';

export class UpdateUsuarioDto extends PartialType(CreateUsuarioDto)
{
    @IsBoolean()
    admin?: boolean;

    @IsBoolean()
    baneado?: boolean;
}
