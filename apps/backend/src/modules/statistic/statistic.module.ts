import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  StatisticModel,
  StatisticSchema,
  StatisticRepository,
  StatisticService,
} from './stats';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: StatisticModel.name,
        schema: StatisticSchema,
      },
    ]),
  ],
  providers: [StatisticRepository, StatisticService],
  exports: [StatisticService],
})
export class StatisticModule {}
