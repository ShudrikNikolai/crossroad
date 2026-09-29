import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { StoryService } from '../core/story.service';
import { StoryFacade } from '../facades/story.facade';
import {
  CreateStoryDto,
  FullGraphResponseDto,
  StoryResponseDto,
  UpdateStoryDto,
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

  @Get()
  @ApiOperation({ summary: 'Get authros stories' })
  @ApiOkResponse({ type: [StoryResponseDto] })
  async getMyStpries(@CurrentUser('id') authorId: string) {
    return this.storyService.getStories(authorId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new story' })
  @ApiOkResponse({ type: StoryResponseDto })
  async create(
    @CurrentUser('id') authorId: string,
    @Body() data: CreateStoryDto,
  ) {
    return this.storyService.create(authorId, data);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get story metadata' })
  @ApiOkResponse({ type: StoryResponseDto })
  async findOne(@Param('id') id: string) {
    return this.storyService.findById(id);
  }

  @Get(':id/graph')
  @ApiOperation({
    summary:
      'Get full graph (story + nodes + edges + variables) for the editor',
  })
  @ApiOkResponse({ type: FullGraphResponseDto })
  async getGraph(@Param('id') id: string) {
    return this.storyFacade.getFullGraph(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update story metadata' })
  @ApiOkResponse({ type: StoryResponseDto })
  async update(
    @Param('id') id: string,
    @CurrentUser('id') authorId: string,
    @Body() data: UpdateStoryDto,
  ) {
    return this.storyService.update(id, authorId, data);
  }

  @Post(':id/publish')
  @ApiOperation({ summary: 'Publish the story (locks it from further edits)' })
  @ApiOkResponse({ type: StoryResponseDto })
  async publish(@Param('id') id: string, @CurrentUser('id') authorId: string) {
    return this.storyFacade.publish(id, authorId);
  }

  @Get('public')
  @ApiOperation({ summary: 'Publish the story (locks it from further edits)' })
  @ApiOkResponse({ type: StoryResponseDto })
  async public() {}
}
