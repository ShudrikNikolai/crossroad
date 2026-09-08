import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseModel } from '@/common';

export type UserDocument = HydratedDocument<UserModel>;

@Schema({
  collection: 'users',
  timestamps: true,
})
export class UserModel extends BaseModel {
  @Prop({
    required: true,
    unique: true,
    index: true,
    lowercase: true,
    trim: true,
  })
  email: string;

  @Prop()
  phoneNumber?: string;

  @Prop({ type: Date })
  lastLoginAt?: Date;

  @Prop({ type: Date })
  lastActivityAt?: Date;

  @Prop({
    required: true,
    default: true,
  })
  isActive: boolean;
}

export const UserSchema = SchemaFactory.createForClass(UserModel);
