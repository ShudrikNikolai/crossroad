import { BaseModel } from '@/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type RefreshTokenDocument = HydratedDocument<RefreshTokenModel>;

@Schema({
  collection: 'refresh_tokens',
  timestamps: true,
})
export class RefreshTokenModel extends BaseModel {
  @Prop({
    type: Types.ObjectId,
    required: true,
    index: true,
  })
  userId: Types.ObjectId;

  @Prop({
    required: true,
    unique: true,
    index: true,
  })
  jti: string;

  @Prop({
    required: true,
  })
  tokenHash: string;

  @Prop({
    required: true,
    index: true,
  })
  expiresAt: Date;

  @Prop({
    type: Date,
    default: null,
  })
  revokedAt: Date | null;
}

export const RefreshTokenSchema =
  SchemaFactory.createForClass(RefreshTokenModel);
