import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { StoryService } from '../story/story.service';
import { StoryFacade } from '../facades/story.facade';
import {
  CreateStoryDto,
  UpdateStoryDto,
  StoryResponseDto,
  FullGraphResponseDto,
} from '../dtos';
import { CurrentUser } from '@/common';

@ApiTags('stories')
@ApiBearerAuth('access-token')
@Controller('stories')
export class StoryController {
  constructor(
    private readonly storyService: StoryService,
    private readonly storyFacade: StoryFacade,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new story' })
  @ApiOkResponse({ type: StoryResponseDto })
  create(@CurrentUser('id') authorId: string, @Body() data: CreateStoryDto) {
    return this.storyService.create(authorId, data);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get story metadata' })
  @ApiOkResponse({ type: StoryResponseDto })
  findOne(@Param('id') id: string) {
    return this.storyService.findById(id);
  }

  @Get(':id/graph')
  @ApiOperation({
    summary:
      'Get full graph (story + nodes + edges + variables) for the editor',
  })
  @ApiOkResponse({ type: FullGraphResponseDto })
  getGraph(@Param('id') id: string) {
    return this.storyFacade.getFullGraph(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update story metadata' })
  @ApiOkResponse({ type: StoryResponseDto })
  update(
    @Param('id') id: string,
    @CurrentUser('id') authorId: string,
    @Body() data: UpdateStoryDto,
  ) {
    return this.storyService.update(id, authorId, data);
  }

  @Post(':id/publish')
  @ApiOperation({ summary: 'Publish the story (locks it from further edits)' })
  @ApiOkResponse({ type: StoryResponseDto })
  publish(@Param('id') id: string, @CurrentUser('id') authorId: string) {
    return this.storyFacade.publish(id, authorId);
  }
}
