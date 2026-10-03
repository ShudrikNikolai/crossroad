import { StatisticDocument, StatisticModel } from './statistic.model';
import { BaseRepository } from '@/common';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class StatisticRepository extends BaseRepository<StatisticDocument> {
  constructor(
    @InjectModel(StatisticModel.name)
    model: Model<StatisticDocument>,
  ) {
    super(model);
  }

  async createStat(type: string, uId: string) {
    await this.createDocument({ type, userId: uId as any });
  }
}
