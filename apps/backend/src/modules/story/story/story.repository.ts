import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { StoryModel, StoryDocument } from './story.model';
import { BaseRepository } from '@/common';

@Injectable()
export class StoryRepository extends BaseRepository<StoryDocument> {
  constructor(@InjectModel(StoryModel.name) model: Model<StoryDocument>) {
    super(model);
  }

  findByAuthor(aId: string) {
    const authorId = this.toObjectId(aId);
    return this.model.find({ authorId }).lean();
  }

  create(data: Pick<StoryModel, 'title' | 'description' | 'authorId'>) {
    return this.model.create(data);
  }

  updateById(
    id: string,
    data: Partial<Pick<StoryModel, 'title' | 'description' | 'startNodeId'>>,
  ) {
    return this.model.findByIdAndUpdate(id, data, { new: true });
  }

  setStatus(id: string, status: StoryModel['status']) {
    return this.model.findByIdAndUpdate(id, { status }, { new: true });
  }

  deleteById(id: string) {
    return this.model.findByIdAndDelete(id);
  }
}
