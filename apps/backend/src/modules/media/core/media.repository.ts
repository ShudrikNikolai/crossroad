import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MediaDocument, MediaModel } from './media.model';
import { BaseRepository } from '@/common';

@Injectable()
export class MediaRepository extends BaseRepository<MediaDocument> {
  constructor(@InjectModel(MediaModel.name) model: Model<MediaDocument>) {
    super(model);
  }

  findById(id: string) {
    return this.model.findById(id);
  }

  findByKey(key: string) {
    return this.model.findOne({ key });
  }

  create(
    data: Pick<
      MediaModel,
      'ownerId' | 'purpose' | 'storyId' | 'key' | 'contentType' | 'size'
    >,
  ) {
    return this.model.create({ ...data, status: 'pending' });
  }

  markConfirmed(id: string) {
    return this.model.findByIdAndUpdate(
      id,
      { status: 'confirmed' },
      { new: true },
    );
  }

  deleteByKey(key: string) {
    return this.model.deleteOne({ key });
  }

  findStalePending(olderThan: Date, limit: number) {
    return this.model
      .find({ status: 'pending', createdAt: { $lt: olderThan } })
      .select({ key: 1 })
      .limit(limit)
      .lean();
  }

  /** Условный delete: если запись успели подтвердить, она не удалится */
  deletePendingById(id: string) {
    return this.model.deleteOne({ _id: id, status: 'pending' });
  }
}
