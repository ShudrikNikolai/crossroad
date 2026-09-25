import { Test, type TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

import { GameService } from '../game/game.service';
import { PlaythroughRepository } from '../game/game.repository';
import { STORY_PORT } from '@/modules/story/ports/story.port';
import { RedisService } from '@/infrastructure/redis/redis.service';
import { EventService } from '@/infrastructure/event/event.service';

const mockGraph = {
  story: { id: 'story-1', startNodeId: 'node-start' },
  nodes: [
    { id: 'node-start', type: 'scene', content: { text: 'Начало' } },
    { id: 'node-end', type: 'end', content: { text: 'Конец' } },
  ],
  edges: [
    {
      id: 'edge-1',
      source: 'node-start',
      target: 'node-end',
      label: 'Идти дальше',
    },
    {
      id: 'edge-locked',
      source: 'node-start',
      target: 'node-end',
      label: 'Только с золотом',
      conditions: [{ variableKey: 'gold', operator: 'gte', value: 10 }],
    },
  ],
  variables: [{ key: 'gold', type: 'number', defaultValue: 0 }],
};

describe('GameService', () => {
  let service: GameService;

  let repository: {
    findById: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    updateState: ReturnType<typeof vi.fn>;
  };

  let storyPort: { getPublishedGraph: ReturnType<typeof vi.fn> };
  let redisService: {
    get: ReturnType<typeof vi.fn>;
    set: ReturnType<typeof vi.fn>;
  };
  let eventService: { emitAsync: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GameService,
        {
          provide: PlaythroughRepository,
          useValue: {
            findById: vi.fn(),
            create: vi.fn(),
            updateState: vi.fn(),
          },
        },
        { provide: STORY_PORT, useValue: { getPublishedGraph: vi.fn() } },
        { provide: RedisService, useValue: { get: vi.fn(), set: vi.fn() } },
        { provide: EventService, useValue: { emitAsync: vi.fn() } },
      ],
    }).compile();

    service = module.get(GameService);
    repository = module.get(PlaythroughRepository);
    storyPort = module.get(STORY_PORT);
    redisService = module.get(RedisService);
    eventService = module.get(EventService);

    vi.clearAllMocks();
    redisService.get.mockResolvedValue(null); // по умолчанию кэш пуст
    storyPort.getPublishedGraph.mockResolvedValue(mockGraph);
  });

  describe('start', () => {
    it('should create playthrough at startNodeId with default variables', async () => {
      const created = {
        _id: { toString: () => 'pt-1' },
        currentNodeId: 'node-start',
        status: 'in_progress',
        variables: { gold: 0 },
      };
      repository.create.mockResolvedValue(created);

      const result = await service.start('user-1', 'story-1');

      expect(repository.create).toHaveBeenCalledWith({
        userId: 'user-1',
        storyId: 'story-1',
        currentNodeId: 'node-start',
        variables: { gold: 0 },
        status: 'in_progress',
      });

      expect(result).toEqual({
        playthroughId: 'pt-1',
        status: 'in_progress',
        node: { id: 'node-start', type: 'scene', content: { text: 'Начало' } },
        choices: [{ edgeId: 'edge-1', label: 'Идти дальше' }], // edge-locked отфильтрован — gold: 0 < 10
      });
    });

    it('should throw NotFoundException when story is not published', async () => {
      storyPort.getPublishedGraph.mockResolvedValue(null);

      await expect(service.start('user-1', 'story-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should use cached graph and not hit STORY_PORT when cache hit', async () => {
      redisService.get.mockResolvedValue(JSON.stringify(mockGraph));
      repository.create.mockResolvedValue({
        _id: { toString: () => 'pt-1' },
        currentNodeId: 'node-start',
        status: 'in_progress',
        variables: { gold: 0 },
      });

      await service.start('user-1', 'story-1');

      expect(storyPort.getPublishedGraph).not.toHaveBeenCalled();
    });
  });

  describe('nextStep', () => {
    const playthrough = {
      _id: { toString: () => 'pt-1' },
      userId: { toString: () => 'user-1' },
      storyId: { toString: () => 'story-1' },
      currentNodeId: 'node-start',
      status: 'in_progress',
      variables: { gold: 0 },
    };

    it('should advance to target node and emit NODE_PLAYED', async () => {
      repository.findById.mockResolvedValue(playthrough);
      repository.updateState.mockResolvedValue({
        ...playthrough,
        currentNodeId: 'node-end',
        status: 'completed',
      });

      const result = await service.nextStep('pt-1', 'user-1', 'edge-1');

      expect(repository.updateState).toHaveBeenCalledWith('pt-1', {
        currentNodeId: 'node-end',
        status: 'completed', // node-end это type: 'end'
        traversedEdgeId: 'edge-1',
      });

      expect(eventService.emitAsync).toHaveBeenCalledWith('story.node.played', {
        userId: 'user-1',
        storyId: 'story-1',
        playthroughId: 'pt-1',
        edgeId: 'edge-1',
        nodeId: 'node-end',
      });

      expect(eventService.emitAsync).toHaveBeenCalledWith('story.completed', {
        userId: 'user-1',
        storyId: 'story-1',
        playthroughId: 'pt-1',
      });

      expect(result.status).toBe('completed');
    });

    it('should reject a choice that is locked by unmet conditions', async () => {
      repository.findById.mockResolvedValue(playthrough); // gold: 0, edge-locked требует gold >= 10

      await expect(
        service.nextStep('pt-1', 'user-1', 'edge-locked'),
      ).rejects.toThrow(BadRequestException);

      expect(repository.updateState).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when caller does not own the playthrough', async () => {
      repository.findById.mockResolvedValue(playthrough);

      await expect(
        service.nextStep('pt-1', 'someone-else', 'edge-1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ConflictException when playthrough is already completed', async () => {
      repository.findById.mockResolvedValue({
        ...playthrough,
        status: 'completed',
      });

      await expect(
        service.nextStep('pt-1', 'user-1', 'edge-1'),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException when playthrough does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.nextStep('missing', 'user-1', 'edge-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getState', () => {
    it('should return current step without mutating playthrough', async () => {
      const playthrough = {
        _id: { toString: () => 'pt-1' },
        userId: { toString: () => 'user-1' },
        storyId: { toString: () => 'story-1' },
        currentNodeId: 'node-start',
        status: 'in_progress',
        variables: { gold: 0 },
      };
      repository.findById.mockResolvedValue(playthrough);

      const result = await service.getState('pt-1', 'user-1');

      expect(result.node.id).toBe('node-start');
      expect(repository.updateState).not.toHaveBeenCalled();
    });

    it("should throw ForbiddenException for someone else's playthrough", async () => {
      repository.findById.mockResolvedValue({
        _id: { toString: () => 'pt-1' },
        userId: { toString: () => 'user-1' },
        storyId: { toString: () => 'story-1' },
        currentNodeId: 'node-start',
        status: 'in_progress',
        variables: {},
      });

      await expect(service.getState('pt-1', 'intruder')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
