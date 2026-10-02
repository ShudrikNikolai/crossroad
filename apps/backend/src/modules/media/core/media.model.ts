import { BaseModel } from '@/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type MediaDocument = HydratedDocument<MediaModel>;

@Schema({ collection: 'media_assets', timestamps: true })
export class MediaModel extends BaseModel {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  ownerId: Types.ObjectId;

  @Prop({ required: true, enum: ['avatar', 'story-media'] })
  purpose: 'avatar' | 'story-media';

  @Prop({ type: Types.ObjectId, index: true })
  storyId?: Types.ObjectId;

  @Prop({ required: true, unique: true })
  key: string;

  @Prop({ required: true })
  contentType: string;

  @Prop({ required: true })
  size: number;

  @Prop({
    required: true,
    enum: ['pending', 'confirmed'],
    default: 'pending',
    index: true,
  })
  status: 'pending' | 'confirmed';
}

export const MediaSchema = SchemaFactory.createForClass(MediaModel);
MediaSchema.index({ status: 1, createdAt: 1 });
