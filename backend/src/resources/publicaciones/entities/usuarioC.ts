import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class UsuarioC
{
    @Prop({ required: true })
    userId : string;

    @Prop({ required: true })
    nombreUsuario : string;

    @Prop()
    avatar: string;
}

export const UsuarioCSchema = SchemaFactory.createForClass(UsuarioC);