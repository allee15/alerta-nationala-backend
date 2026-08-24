import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type GuideDocument = HydratedDocument<Guide>;

export enum GuideCategory {
  CUTREMUR = 'CUTREMUR',
  INCENDIU = 'INCENDIU',
  INUNDATIE = 'INUNDATIE',
  METEO_EXTREM = 'METEO_EXTREM',
  GENERAL = 'GENERAL',
}

@Schema({ _id: false })
export class GuideSection {
  @Prop({ required: true })
  heading!: string;

  @Prop({ type: [String], required: true })
  items!: string[];
}
export const GuideSectionSchema = SchemaFactory.createForClass(GuideSection);

@Schema({ timestamps: true })
export class Guide {
  @Prop({ required: true })
  title!: string;

  @Prop({ required: true, enum: GuideCategory })
  category!: GuideCategory;

  @Prop({ required: true })
  summary!: string;

  @Prop({ required: true, default: 1 })
  version!: number;

  @Prop({ type: [GuideSectionSchema], required: true })
  sections!: GuideSection[];
}

export const GuideSchema = SchemaFactory.createForClass(Guide);