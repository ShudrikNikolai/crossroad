import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StatisticDocument, StatisticModel } from '../models/statistic.model';

@Injectable()
export class StatisticRepository {
  constructor(
    @InjectModel(StatisticModel.name)
    private readonly model: Model<StatisticDocument>,
  ) {}

  async create(data: Partial<StatisticModel>): Promise<StatisticDocument> {
    return this.model.create(data);
  }
}
