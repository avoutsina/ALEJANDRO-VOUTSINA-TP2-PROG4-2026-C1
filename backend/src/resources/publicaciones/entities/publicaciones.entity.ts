import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ObjectId } from "mongoose";
import { Comentario, ComentarioSchema } from "./comentario";

@Schema()
export class Publicaciones
{
    _id!: ObjectId

    @Prop({ required: true})
    userId!: string;

    @Prop({ required: true })
    urlImg!: string;

    @Prop({ default: "" })
    descripcion!: string;

    @Prop({ required: true })
    nombreUsuario!: string;

    @Prop({ default: "" })
    avatar!: string;

    @Prop({ default: 0 })
    meGusta!: number;

    @Prop({ default: [] })
    meGustaId!: string[];

    @Prop({ type: [ComentarioSchema], default: [] })
    comentarios!: Comentario[];

    @Prop({ default: Date.now })
    created_at!: Date;
}

export const PublicacionesEschema = SchemaFactory.createForClass(Publicaciones);
