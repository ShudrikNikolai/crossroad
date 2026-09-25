import { BaseModel } from '@/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type VariableDocument = HydratedDocument<VariableModel>;

@Schema({ collection: 'story_variables', timestamps: true })
export class VariableModel extends BaseModel {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  storyId: Types.ObjectId;

  @Prop({ required: true })
  key: string;

  @Prop({ required: true, enum: ['string', 'number', 'boolean'] })
  type: string;

  @Prop({ type: Object, required: true })
  defaultValue: string | number | boolean;
}

export const VariableSchema = SchemaFactory.createForClass(VariableModel);
VariableSchema.index({ storyId: 1, key: 1 }, { unique: true });
