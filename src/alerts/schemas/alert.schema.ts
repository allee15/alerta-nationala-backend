import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AlertDocument = HydratedDocument<Alert>;

export enum AlertType {
  CUTREMUR = 'CUTREMUR',
  INUNDATIE = 'INUNDATIE',
  INCENDIU = 'INCENDIU',
  METEO_EXTREM = 'METEO_EXTREM',
  ALTA = 'ALTA',
}

export enum AlertSeverity {
  INFORMARE = 'INFORMARE',
  ATENTIONARE = 'ATENTIONARE',
  PERICOL = 'PERICOL',
}

export enum AlertStatus {
  ACTIVE = 'ACTIVE',
  ENDED = 'ENDED',
}

@Schema({ timestamps: true })
export class Alert {
  @Prop({ required: true, enum: AlertType })
  type!: AlertType;

  @Prop({ required: true, enum: AlertSeverity })
  severity!: AlertSeverity;

  @Prop({ required: true, trim: true })
  message!: string;

  @Prop({ type: [String], required: true })
  zones!: string[];

  @Prop({ required: true })
  startsAt!: Date;

  @Prop({ required: true })
  endsAt!: Date;

  @Prop({ required: true, enum: AlertStatus, default: AlertStatus.ACTIVE })
  status!: AlertStatus;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy!: Types.ObjectId;

  @Prop({ type: Date, default: null })
  endedAt?: Date | null;
}

export const AlertSchema = SchemaFactory.createForClass(Alert);
AlertSchema.index({ zones: 1, status: 1 });