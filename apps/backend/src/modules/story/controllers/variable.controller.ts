import {
  CreateVariableDto,
  UpdateVariableDto,
  VariableResponseDto,
} from '../dtos';
import { VariableService } from '../variable/variable.service';
import { CurrentUser } from '@/common';
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

@ApiTags('story-variables')
@ApiBearerAuth('access-token')
@Controller('stories/:storyId/variables')
export class VariableController {
  constructor(private readonly variableService: VariableService) {}

  @Get()
  @ApiOperation({ summary: 'Get all variables of a story' })
  @ApiOkResponse({ type: [VariableResponseDto] })
  async findAll(@Param('storyId') storyId: string) {
    return this.variableService.findAllByStory(storyId);
  }

  @Post()
  @ApiOperation({ summary: 'Declare a new story variable' })
  @ApiOkResponse({ type: VariableResponseDto })
  async create(
    @Param('storyId') storyId: string,
    @CurrentUser('id') authorId: string,
    @Body() data: CreateVariableDto,
  ) {
    return this.variableService.create(authorId, storyId, data);
  }

  @Patch(':key')
  @ApiOperation({
    summary:
      'Update variable type/default value (key is immutable — see below)',
  })
  @ApiOkResponse({ type: VariableResponseDto })
  async update(
    @Param('storyId') storyId: string,
    @Param('key') key: string,
    @CurrentUser('id') authorId: string,
    @Body() data: UpdateVariableDto,
  ) {
    return this.variableService.update(storyId, key, authorId, data);
  }

  @Delete(':key')
  @ApiOperation({ summary: 'Delete a story variable' })
  async delete(
    @Param('storyId') storyId: string,
    @Param('key') key: string,
    @CurrentUser('id') authorId: string,
  ) {
    return this.variableService.delete(storyId, key, authorId);
  }
}
