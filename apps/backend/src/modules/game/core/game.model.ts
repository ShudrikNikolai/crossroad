import { BaseModel } from '@/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PlaythroughDocument = HydratedDocument<PlaythroughModel>;

@Schema({ collection: 'playthroughs', timestamps: true })
export class PlaythroughModel extends BaseModel {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  storyId: Types.ObjectId;

  @Prop({ required: true })
  currentNodeId: string;

  @Prop({ type: Object, required: true, default: {} })
  variables: Record<string, string | number | boolean>;

  @Prop({
    required: true,
    enum: ['in_progress', 'completed'],
    default: 'in_progress',
    index: true,
  })
  status: 'in_progress' | 'completed';

  @Prop({ type: [String], default: [] })
  history: string[]; // список пройденных edge id, для статистики/дебага
}

export const PlaythroughSchema = SchemaFactory.createForClass(PlaythroughModel);
