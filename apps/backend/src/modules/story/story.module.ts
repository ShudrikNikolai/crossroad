import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StoryFacade } from './facades/story.facade';
import { STORY_PORT } from './ports/story.port';
import {
  StoryController,
  NodeController,
  EdgeController,
  VariableController,
} from './controllers';
import {
  StoryModel,
  StoryRepository,
  StorySchema,
  StoryService,
} from './story';
import { NodeModel, NodeRepository, NodeSchema, NodeService } from './node';
import { EdgeModel, EdgeRepository, EdgeSchema, EdgeService } from './edge';
import {
  VariableModel,
  VariableRepository,
  VariableSchema,
  VariableService,
} from './variable';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StoryModel.name, schema: StorySchema },
      { name: NodeModel.name, schema: NodeSchema },
      { name: EdgeModel.name, schema: EdgeSchema },
      { name: VariableModel.name, schema: VariableSchema },
    ]),
  ],
  controllers: [
    StoryController,
    NodeController,
    EdgeController,
    VariableController,
  ],
  providers: [
    StoryRepository,
    StoryService,
    NodeRepository,
    NodeService,
    EdgeRepository,
    EdgeService,
    VariableRepository,
    VariableService,
    StoryFacade,
    { provide: STORY_PORT, useExisting: StoryFacade },
  ],
  exports: [STORY_PORT],
})
export class StoryModule {}
