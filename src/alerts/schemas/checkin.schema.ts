import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CheckInDocument = HydratedDocument<CheckIn>;

@Schema({ timestamps: true })
export class CheckIn {
  @Prop({ type: Types.ObjectId, ref: 'Alert', required: true })
  alert!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user!: Types.ObjectId;

  @Prop({ required: true })
  clientTimestamp!: Date;
}

export const CheckInSchema = SchemaFactory.createForClass(CheckIn);
CheckInSchema.index({ alert: 1, user: 1 }, { unique: true });