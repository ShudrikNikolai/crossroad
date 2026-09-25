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
import { NodeService } from '../node/node.service';
import {
  CreateNodeDto,
  UpdateNodeDto,
  UpdateNodePositionDto,
  NodeResponseDto,
} from '../dtos';
import { CurrentUser } from '@/common';

@ApiTags('story-nodes')
@ApiBearerAuth('access-token')
@Controller('stories/:storyId/nodes')
export class NodeController {
  constructor(private readonly nodeService: NodeService) {}

  @Get()
  @ApiOperation({ summary: 'Get all nodes of a story' })
  @ApiOkResponse({ type: [NodeResponseDto] })
  findAll(@Param('storyId') storyId: string) {
    return this.nodeService.findAllByStory(storyId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a node in the story graph' })
  @ApiOkResponse({ type: NodeResponseDto })
  create(
    @Param('storyId') storyId: string,
    @CurrentUser('id') authorId: string,
    @Body() data: CreateNodeDto,
  ) {
    return this.nodeService.create(authorId, { ...data, storyId });
  }

  @Patch(':nodeId')
  @ApiOperation({ summary: 'Update a node (type/content)' })
  @ApiOkResponse({ type: NodeResponseDto })
  update(
    @Param('storyId') storyId: string,
    @Param('nodeId') nodeId: string,
    @CurrentUser('id') authorId: string,
    @Body() data: UpdateNodeDto,
  ) {
    return this.nodeService.update(storyId, nodeId, authorId, data);
  }

  @Patch(':nodeId/position')
  @ApiOperation({
    summary: 'Update only node position (cheap, frequent — drag in the editor)',
  })
  @ApiOkResponse({ type: NodeResponseDto })
  updatePosition(
    @Param('storyId') storyId: string,
    @Param('nodeId') nodeId: string,
    @CurrentUser('id') authorId: string,
    @Body() data: UpdateNodePositionDto,
  ) {
    return this.nodeService.updatePosition(storyId, nodeId, authorId, data);
  }

  @Delete(':nodeId')
  @ApiOperation({ summary: 'Delete a node' })
  delete(
    @Param('storyId') storyId: string,
    @Param('nodeId') nodeId: string,
    @CurrentUser('id') authorId: string,
  ) {
    return this.nodeService.delete(storyId, nodeId, authorId);
  }
}
