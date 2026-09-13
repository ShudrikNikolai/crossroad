import { BaseModel } from '@/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ProfileDocument = HydratedDocument<ProfileModel>;
type TPublicProfileSchema = {
  id: string;
  username: string;
  displayName?: string;
  bio?: string;
  avatarKey?: string;
  avatarUrl?: string;
  languages: string[];
  socialLinks?: {
    twitter?: string;
    github?: string;
    linkedin?: string;
    telegram?: string;
  };
  createdAt: Date;
};
type TPrivateProfileSchema = TPublicProfileSchema & {
  userId: string;
  isPublic: boolean;
  updatedAt: Date;
};

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

  toPublic(): TPublicProfileSchema {
    return {
      _id: this?._id?.toString(),
      username: this.username,
      displayName: this.displayName,
      bio: this.bio,
      avatarKey: this.avatarKey,
      avatarUrl: this.avatarUrl,
      languages: this.languages,
      socialLinks: this.socialLinks,
      createdAt: this.createdAt,
    } as any;
  }

  toPrivate(): TPrivateProfileSchema {
    return {
      ...this.toPublic(),
      userId: this.userId?.toString(),
      isPublic: this.isPublic,
      updatedAt: this.updatedAt,
    };
  }
}

export const ProfileSchema = SchemaFactory.createForClass(ProfileModel);
