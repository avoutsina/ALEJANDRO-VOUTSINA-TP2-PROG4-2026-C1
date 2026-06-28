import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { UsuarioC, UsuarioCSchema } from './usuarioC';

@Schema()
export class Comentario {
  @Prop({ type: UsuarioCSchema, required: true })
  usuario!: UsuarioC;

  @Prop({ required: true })
  texto!: string;

  @Prop({ default: Date.now })
  created_at!: Date;

  @Prop({ default: false })
  modificado!: boolean;
}

export const ComentarioSchema = SchemaFactory.createForClass(Comentario);
