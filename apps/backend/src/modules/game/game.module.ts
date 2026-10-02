import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StoryModule } from '@/modules/story/story.module';
import {
  GameService,
  PlaythroughModel,
  PlaythroughRepository,
  PlaythroughSchema,
} from './core';
import { GameController } from './controllers';

@Module({
  imports: [
    StoryModule,
    MongooseModule.forFeature([
      { name: PlaythroughModel.name, schema: PlaythroughSchema },
    ]),
  ],
  controllers: [GameController],
  providers: [PlaythroughRepository, GameService],
})
export class GameModule {}
