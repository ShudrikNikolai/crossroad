import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StoryModule } from '@/modules/story/story.module';
import {
  GameService,
  PlaythroughModel,
  PlaythroughRepository,
  PlaythroughSchema,
} from './game';
import { GameController } from './controllers';

@Module({
  imports: [
    StoryModule, // нужен ради экспортированного STORY_PORT
    MongooseModule.forFeature([
      { name: PlaythroughModel.name, schema: PlaythroughSchema },
    ]),
  ],
  controllers: [GameController],
  providers: [PlaythroughRepository, GameService],
})
export class GameModule {}
