import { StoryDocument, StoryModel } from './story.model';
import { BaseRepository } from '@/common';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

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
    return super.updateById(id, data);
  }

  setStatus(id: string, status: keyof StoryModel['status']) {
    return super.updateById(id, { status });
  }

  deleteById(id: string) {
    return this.softDeleteById(id);
  }
}
