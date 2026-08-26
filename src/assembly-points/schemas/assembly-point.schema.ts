import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AssemblyPointDocument = HydratedDocument<AssemblyPoint>;

@Schema({ timestamps: true })
export class AssemblyPoint {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, trim: true })
  address!: string;

  @Prop({ required: true })
  lat!: number;

  @Prop({ required: true })
  lng!: number;

  @Prop({ required: true })
  zone!: string;

  @Prop({ type: Number, default: null })
  capacity?: number | null;

  @Prop({ required: true, default: true })
  isActive!: boolean;
}

export const AssemblyPointSchema = SchemaFactory.createForClass(AssemblyPoint);
AssemblyPointSchema.index({ zone: 1, isActive: 1 });