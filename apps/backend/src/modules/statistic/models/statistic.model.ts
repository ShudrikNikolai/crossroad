import { BaseModel } from '@/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type StatisticDocument = HydratedDocument<StatisticModel>;

@Schema({
  collection: 'statistic',
  timestamps: true,
})
export class StatisticModel extends BaseModel {
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
  type: string;
}

export const StatisticSchema = SchemaFactory.createForClass(StatisticModel);
