import {
  StatisticModel,
  StatisticSchema,
  StatisticRepository,
  StatisticService,
} from './core';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

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
