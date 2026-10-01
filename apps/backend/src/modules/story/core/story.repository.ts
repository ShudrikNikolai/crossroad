import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StoryDocument, StoryModel } from './story.model';
import { BaseRepository } from '@/common';

@Injectable()
export class StoryRepository extends BaseRepository<StoryDocument> {
  constructor(@InjectModel(StoryModel.name) model: Model<StoryDocument>) {
    super(model);
  }

  findByAuthor(authorId: string) {
    return this.findMany({ authorId });
  }

  create(data: Pick<StoryModel, 'title' | 'description' | 'authorId'>) {
    return this.createDocument(data);
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
