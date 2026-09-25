import { BaseModel } from '@/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type StoryDocument = HydratedDocument<StoryModel>;

@Schema({ collection: 'stories', timestamps: true })
export class StoryModel extends BaseModel {
  @Prop({ required: true, trim: true, maxlength: 200 })
  title: string;

  @Prop({ trim: true, maxlength: 1000 })
  description?: string;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  authorId: Types.ObjectId;

  @Prop({
    required: true,
    enum: ['draft', 'published'],
    default: 'draft',
    index: true,
  })
  status: 'draft' | 'published';

  @Prop()
  startNodeId?: string;
}

export const StorySchema = SchemaFactory.createForClass(StoryModel);
