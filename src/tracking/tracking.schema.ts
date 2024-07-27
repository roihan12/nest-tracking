import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TrackingDocument = Tracking & Document;

@Schema({ timestamps: true })
export class Tracking {
  @Prop({ required: true })
  userId: number;

  @Prop({ required: true, type: Number })
  latitude: number;

  @Prop({ required: true, type: Number })
  longitude: number;
}

export const TrackingSchema = SchemaFactory.createForClass(Tracking);
