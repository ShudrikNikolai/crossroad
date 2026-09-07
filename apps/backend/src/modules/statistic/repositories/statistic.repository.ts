import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { StatisticDocument, StatisticModel } from '../models/statistic.model';
import { BaseRepository } from '@/common';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class StatisticRepository extends BaseRepository<StatisticDocument> {
  constructor(
    @InjectModel(StatisticModel.name)
    model: Model<StatisticDocument>,
  ) {
    super(model);
  }
}
