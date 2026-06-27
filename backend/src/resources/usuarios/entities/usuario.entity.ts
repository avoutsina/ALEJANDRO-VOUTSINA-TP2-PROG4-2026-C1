import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { type ObjectId } from "mongoose";

@Schema()
export class Usuario
{
    _id !: ObjectId

    @Prop({ required: true })
    nombre !: string;

    @Prop({ required: true })
    apellido !: string;

    @Prop({ required: true })
    correo !: string;

    @Prop({ required: true })
    nombreUsuario !: string;

    @Prop({ required: true })
    contrasenia !: string;

    @Prop()
    descripcion !: string;

    @Prop()
    avatar!: string;

    @Prop({ required: true })
    fechaDeNacimiento!: Date;

    @Prop({ default: false })
    admin!: boolean;

    @Prop({ default: new Date() })
    created_at!: Date;

    @Prop({ default: false })
    baneado!: boolean;
}

export const UsuariosEschema = SchemaFactory.createForClass(Usuario);
