import { BaseModel } from '@/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type SecurityDocument = HydratedDocument<SecurityModel>;

@Schema({
  collection: 'user_security',
  timestamps: true,
})
export class SecurityModel extends BaseModel {
  @Prop({
    type: Types.ObjectId,
    required: true,
    unique: true,
    index: true,
  })
  userId: Types.ObjectId;

  @Prop({
    required: true,
  })
  passwordHash: string;

  @Prop({ type: [String], default: [] })
  previousPasswords?: string[];
}

export const SecuritySchema = SchemaFactory.createForClass(SecurityModel);
