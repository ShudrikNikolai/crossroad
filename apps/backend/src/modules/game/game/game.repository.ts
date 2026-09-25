import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PlaythroughModel, PlaythroughDocument } from './game.model';

@Injectable()
export class PlaythroughRepository {
  constructor(
    @InjectModel(PlaythroughModel.name)
    private model: Model<PlaythroughDocument>,
  ) {}

  findById(id: string) {
    return this.model.findById(id);
  }

  create(
    data: Pick<
      PlaythroughModel,
      'userId' | 'storyId' | 'currentNodeId' | 'variables' | 'status'
    >,
  ) {
    return this.model.create({ ...data, history: [] });
  }

  updateState(
    id: string,
    data: {
      currentNodeId: string;
      status: PlaythroughModel['status'];
      variables?: Record<string, string | number | boolean>;
      traversedEdgeId: string;
    },
  ) {
    return this.model.findByIdAndUpdate(
      id,
      {
        currentNodeId: data.currentNodeId,
        status: data.status,
        ...(data.variables && { variables: data.variables }),
        $push: { history: data.traversedEdgeId },
      },
      { new: true },
    );
  }
}
