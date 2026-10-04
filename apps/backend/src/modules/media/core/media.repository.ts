import { MediaDocument, MediaModel } from './media.model';
import { BaseRepository } from '@/common';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class MediaRepository extends BaseRepository<MediaDocument> {
  constructor(@InjectModel(MediaModel.name) model: Model<MediaDocument>) {
    super(model);
  }

  findByKey(key: string) {
    return this.findOne({ key });
  }

  create(
    data: Pick<
      MediaModel,
      'ownerId' | 'purpose' | 'storyId' | 'key' | 'contentType' | 'size'
    >,
  ) {
    return this.createDocument({ ...data, status: 'pending' });
  }

  markConfirmed(id: string) {
    return this.updateById(id, { status: 'confirmed' });
  }

  deleteByKey(key: string) {
    return this.hardDeleteOne({ key });
  }

  findStalePending(olderThan: Date, limit: number) {
    return this.findManyLean(
      { status: 'pending', createdAt: { $lt: olderThan } },
      { select: { key: 1 }, limit },
    );
  }

  deletePendingById(id: string) {
    return this.hardDeleteOne({ _id: id, status: 'pending' });
  }
}
