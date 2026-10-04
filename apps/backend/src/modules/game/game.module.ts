import { GameController } from './controllers';
import {
  GameService,
  PlaythroughModel,
  PlaythroughRepository,
  PlaythroughSchema,
} from './core';
import { StoryModule } from '@/modules/story/story.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

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
