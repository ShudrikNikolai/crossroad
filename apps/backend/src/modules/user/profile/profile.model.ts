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
}

export const ProfileSchema = SchemaFactory.createForClass(ProfileModel);
