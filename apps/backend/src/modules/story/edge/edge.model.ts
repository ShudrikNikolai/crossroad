import { BaseModel } from '@/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type EdgeDocument = HydratedDocument<EdgeModel>;

@Schema({ _id: false })
class EdgeCondition {
  @Prop({ required: true }) variableKey: string;
  @Prop({ required: true, enum: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte'] })
  operator: string;
  @Prop({ type: Object, required: true }) value: string | number | boolean;
}

@Schema({ collection: 'story_edges', timestamps: true })
export class EdgeModel extends BaseModel {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  storyId: Types.ObjectId;

  @Prop({ required: true })
  id: string;

  @Prop({ required: true, index: true }) // индекс game edges от конкретного узла
  source: string;

  @Prop({ required: true })
  target: string;

  @Prop({ maxlength: 200 })
  label?: string;

  @Prop({ type: [EdgeCondition] })
  conditions?: EdgeCondition[];
}

export const EdgeSchema = SchemaFactory.createForClass(EdgeModel);
EdgeSchema.index({ storyId: 1, id: 1 }, { unique: true });
EdgeSchema.index({ storyId: 1, source: 1 });
