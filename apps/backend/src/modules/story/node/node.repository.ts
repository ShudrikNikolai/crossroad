import { NodeDocument, NodeModel } from './node.model';
import { BaseModel, BaseRepository } from '@/common';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class NodeRepository extends BaseRepository<NodeDocument> {
  constructor(@InjectModel(NodeModel.name) model: Model<NodeDocument>) {
    super(model);
  }

  findAllByStory(storyId: string) {
    return this.findManyLean({ storyId });
  }

  findBySource(storyId: string, source: string) {
    return this.findManyLean({ storyId, source });
  }

  create(data: Omit<NodeModel, keyof BaseModel>) {
    return this.createDocument(data);
  }

  updatePosition(
    storyId: string,
    nodeId: string,
    position: { x: number; y: number },
  ) {
    return this.updateOne({ storyId, id: nodeId }, { position });
  }

  updateNode(
    storyId: string,
    nodeId: string,
    data: Partial<Pick<NodeModel, 'type' | 'position' | 'content'>>,
  ) {
    return this.model.findOneAndUpdate({ storyId, id: nodeId }, data, {
      new: true,
    });
  }

  deleteOne(sId: string, edgeId: string) {
    return this.hardDeleteOne({ storyId: sId, id: edgeId });
  }
}
