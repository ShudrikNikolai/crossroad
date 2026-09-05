import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  StatisticModel,
  StatisticSchema,
} from './models/statistic.model';
import { StatisticRepository } from './repositories/statistic.repository';
import { StatisticService } from './services/statistic.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: StatisticModel.name,
        schema: StatisticSchema,
      },
    ]),
  ],
  providers: [
    StatisticRepository,
    StatisticService,
  ],
  exports: [
    StatisticService,
  ],
})
export class StatisticModule {}
