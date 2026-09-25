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
import { EdgeService } from '../edge/edge.service';
import { CreateEdgeDto, UpdateEdgeDto, EdgeResponseDto } from '../dtos';
import { CurrentUser } from '@/common';

@ApiTags('story-edges')
@ApiBearerAuth('access-token')
@Controller('stories/:storyId/edges')
export class EdgeController {
  constructor(private readonly edgeService: EdgeService) {}

  @Get()
  @ApiOperation({ summary: 'Get all edges of a story' })
  @ApiOkResponse({ type: [EdgeResponseDto] })
  findAll(@Param('storyId') storyId: string) {
    return this.edgeService.findAllByStory(storyId);
  }

  @Post()
  @ApiOperation({ summary: 'Create an edge between two nodes' })
  @ApiOkResponse({ type: EdgeResponseDto })
  create(
    @Param('storyId') storyId: string,
    @CurrentUser('id') authorId: string,
    @Body() data: CreateEdgeDto,
  ) {
    return this.edgeService.create(authorId, storyId, data);
  }

  @Patch(':edgeId')
  @ApiOperation({ summary: 'Update an edge (target, label, conditions)' })
  @ApiOkResponse({ type: EdgeResponseDto })
  update(
    @Param('storyId') storyId: string,
    @Param('edgeId') edgeId: string,
    @CurrentUser('id') authorId: string,
    @Body() data: UpdateEdgeDto,
  ) {
    return this.edgeService.update(storyId, edgeId, authorId, data);
  }

  @Delete(':edgeId')
  @ApiOperation({ summary: 'Delete an edge' })
  delete(
    @Param('storyId') storyId: string,
    @Param('edgeId') edgeId: string,
    @CurrentUser('id') authorId: string,
  ) {
    return this.edgeService.delete(storyId, edgeId, authorId);
  }
}
