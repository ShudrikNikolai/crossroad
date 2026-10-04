import { PlaythroughDocument, PlaythroughModel } from './game.model';
import { BaseRepository } from '@/common';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class PlaythroughRepository extends BaseRepository<PlaythroughDocument> {
  constructor(
    @InjectModel(PlaythroughModel.name)
    model: Model<PlaythroughDocument>,
  ) {
    super(model);
  }

  createPlaythrough(
    data: Pick<
      PlaythroughModel,
      'userId' | 'storyId' | 'currentNodeId' | 'variables' | 'status'
    >,
  ) {
    return this.createDocument({ ...data, history: [] });
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
    return this.updateById(id, {
      currentNodeId: data.currentNodeId,
      status: data.status,
      ...(data.variables && { variables: data.variables }),
      $push: { history: data.traversedEdgeId },
    });
  }
}
