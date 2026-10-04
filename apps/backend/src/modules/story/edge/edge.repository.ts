import { EdgeDocument, EdgeModel } from './edge.model';
import { BaseModel, BaseRepository } from '@/common';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class EdgeRepository extends BaseRepository<EdgeDocument> {
  constructor(@InjectModel(EdgeModel.name) model: Model<EdgeDocument>) {
    super(model);
  }
  findAllByStory(sId: string) {
    return this.findManyLean({ storyId: sId });
  }

  findBySource(storyId: string, source: string) {
    return this.findManyLean({ storyId, source });
  }

  create(data: Omit<EdgeModel, keyof BaseModel>) {
    return this.createDocument(data);
  }

  updateEdge(
    storyId: string,
    edgeId: string,
    data: Partial<
      Pick<EdgeModel, 'source' | 'target' | 'label' | 'conditions'>
    >,
  ) {
    return this.updateOne({ storyId, id: edgeId }, data);
  }

  deleteOne(sId: string, edgeId: string) {
    return this.hardDeleteOne({ storyId: sId, id: edgeId });
  }
}
