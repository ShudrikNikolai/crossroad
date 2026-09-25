import { BaseModel } from '@/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type NodeDocument = HydratedDocument<NodeModel>;

@Schema({ _id: false })
class Position {
  @Prop({ required: true }) x: number;
  @Prop({ required: true }) y: number;
}

@Schema({ _id: false })
class NodeContent {
  @Prop({ required: true, maxlength: 5000 }) text: string;
  @Prop({ maxlength: 100 }) speaker?: string;
  @Prop() mediaKey?: string;
}

@Schema({ collection: 'story_nodes', timestamps: true })
export class NodeModel extends BaseModel {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  storyId: Types.ObjectId;

  @Prop({ required: true })
  id: string; // локальный id из React Flow

  @Prop({ required: true, enum: ['scene', 'choice', 'condition', 'end'] })
  type: string;

  @Prop({ type: Position, required: true })
  position: Position;

  @Prop({ type: NodeContent, required: true })
  content: NodeContent;
}

export const NodeSchema = SchemaFactory.createForClass(NodeModel);
NodeSchema.index({ storyId: 1, id: 1 }, { unique: true });
