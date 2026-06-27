import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ArchivoDocument = Archivo & Document;

@Schema({ timestamps: true })
export class Archivo {
    @Prop({ required: true })
    url!: string;

    @Prop({ required: true })
    formato!: string;

    @Prop({ required: true })
    public_id!: string;
}
export const ArchivoSchema = SchemaFactory.createForClass(Archivo);