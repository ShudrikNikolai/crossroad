import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { NodeModel, NodeDocument } from './node.model';
import { BaseModel, BaseRepository } from '@/common';

@Injectable()
export class NodeRepository extends BaseRepository<NodeDocument> {
  constructor(@InjectModel(NodeModel.name) model: Model<NodeDocument>) {
    super(model);
  }

  findAllByStory(sId: string) {
    const storyId = this.toObjectId(sId);
    return this.model.find({ storyId }).lean();
  }

  findByStoryIdAndNode(sId: string, nodeId: string) {
    const storyId = this.toObjectId(sId);
    return this.model.findOne({ storyId, id: nodeId });
  }

  create(data: Omit<NodeModel, keyof BaseModel>) {
    data.storyId = this.toObjectId(`${data.storyId}`);
    return this.model.create(data);
  }

  updatePosition(
    sId: string,
    nodeId: string,
    position: { x: number; y: number },
  ) {
    const storyId = this.toObjectId(sId);
    return this.model.updateOne({ storyId, id: nodeId }, { position });
  }

  updateNode(
    sId: string,
    nodeId: string,
    data: Partial<Pick<NodeModel, 'type' | 'position' | 'content'>>,
  ) {
    const storyId = this.toObjectId(sId);
    return this.model.findOneAndUpdate({ storyId, id: nodeId }, data, {
      new: true,
    });
  }

  deleteOne(sId: string, nodeId: string) {
    const storyId = this.toObjectId(sId);
    return this.model.deleteOne({ storyId, id: nodeId });
  }
}
