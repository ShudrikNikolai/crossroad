import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { GameService } from '../game/game.service';
import {
  CreateGameDto,
  UpdateGameNextStepDto,
  GameStepResponseDto,
} from '../dtos';
import { CurrentUser } from '@/common';

@ApiTags('game')
@ApiBearerAuth('access-token')
@Controller('games')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post()
  @ApiOperation({ summary: 'Start a new playthrough of a published story' })
  @ApiOkResponse({ type: GameStepResponseDto })
  start(@CurrentUser('id') userId: string, @Body() data: CreateGameDto) {
    return this.gameService.start(userId, data.storyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get current playthrough state' })
  @ApiOkResponse({ type: GameStepResponseDto })
  getState(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.gameService.getState(id, userId);
  }

  @Post(':id/next-step')
  @ApiOperation({ summary: 'Make a choice and advance the playthrough' })
  @ApiOkResponse({ type: GameStepResponseDto })
  nextStep(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() data: UpdateGameNextStepDto,
  ) {
    return this.gameService.nextStep(id, userId, data.edgeId);
  }
}
