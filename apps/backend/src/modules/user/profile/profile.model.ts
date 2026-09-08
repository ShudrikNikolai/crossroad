import { BaseModel } from '@/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ProfileDocument = HydratedDocument<ProfileModel>;

@Schema({
  collection: 'user_profiles',
  timestamps: true,
})
export class ProfileModel extends BaseModel {
  @Prop({
    type: Types.ObjectId,
    required: true,
    unique: true,
    index: true,
  })
  userId: Types.ObjectId;

  @Prop({
    required: true,
    trim: true,
    maxlength: 64,
  })
  username: string;

  @Prop({
    trim: true,
    maxlength: 255,
  })
  displayName?: string;

  @Prop({
    maxlength: 500,
  })
  bio?: string;

  @Prop()
  avatarKey?: string;

  @Prop()
  avatarUrl?: string;

  @Prop({ type: [String], default: ['ru'] })
  languages?: string[];

  @Prop({ default: false })
  isPublic: boolean;

  @Prop({ type: Object, default: {} })
  socialLinks?: {
    twitter?: string;
    github?: string;
    linkedin?: string;
    telegram?: string;
  };
}

export const ProfileSchema = SchemaFactory.createForClass(ProfileModel);
