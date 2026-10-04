import { VariableDocument, VariableModel } from './variable.model';
import { BaseModel, BaseRepository } from '@/common';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class VariableRepository extends BaseRepository<VariableDocument> {
  constructor(@InjectModel(VariableModel.name) model: Model<VariableDocument>) {
    super(model);
  }

  findAllByStory(sId: string) {
    const storyId = this.toObjectId(sId);
    return this.model.find({ storyId }).lean();
  }

  create(data: Omit<VariableModel, keyof BaseModel>) {
    return this.createDocument({
      ...data,
    });
  }

  updateOneVariable(
    storyId: string,
    key: string,
    data: Partial<Pick<VariableModel, 'type' | 'defaultValue'>>,
  ) {
    return this.updateOne({ storyId, key }, data, { new: true });
  }

  deleteOne(storyId: string, key: string) {
    return this.model.deleteOne({ storyId, key });
  }
}
