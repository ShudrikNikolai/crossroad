import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { VariableModel, VariableDocument } from './variable.model';
import { BaseModel, BaseRepository } from '@/common';

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
    const storyId = this.toObjectId(`${data.storyId}`);
    data.storyId = storyId;
    return this.model.create({
      ...data,
    });
  }

  updateOneVariable(
    sId: string,
    key: string,
    data: Partial<Pick<VariableModel, 'type' | 'defaultValue'>>,
  ) {
    const storyId = this.toObjectId(sId);
    return this.model.findOneAndUpdate({ storyId, key }, data, { new: true });
  }

  deleteOne(sId: string, key: string) {
    const storyId = this.toObjectId(sId);
    return this.model.deleteOne({ storyId, key });
  }
}
