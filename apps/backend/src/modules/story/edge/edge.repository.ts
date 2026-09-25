import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EdgeModel, EdgeDocument } from './edge.model';
import { BaseModel, BaseRepository } from '@/common';

@Injectable()
export class EdgeRepository extends BaseRepository<EdgeDocument> {
  constructor(@InjectModel(EdgeModel.name) model: Model<EdgeDocument>) {
    super(model);
  }

  findAllByStory(sId: string) {
    const storyId = this.toObjectId(sId);
    return this.model.find({ storyId }).lean();
  }

  findBySource(sId: string, source: string) {
    const storyId = this.toObjectId(sId);
    return this.model.find({ storyId, source }).lean();
  }

  create(data: Omit<EdgeModel, keyof BaseModel>) {
    data.storyId = this.toObjectId(`${data.storyId}`);
    return this.model.create(data);
  }

  updateEdge(
    sId: string,
    edgeId: string,
    data: Partial<
      Pick<EdgeModel, 'source' | 'target' | 'label' | 'conditions'>
    >,
  ) {
    const storyId = this.toObjectId(sId);
    return this.model.findOneAndUpdate({ storyId, id: edgeId }, data, {
      new: true,
    });
  }

  deleteOne(sId: string, edgeId: string) {
    const storyId = this.toObjectId(sId);
    return this.model.deleteOne({ storyId, id: edgeId });
  }
}
